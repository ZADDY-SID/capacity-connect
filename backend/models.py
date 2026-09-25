from datetime import datetime
import json
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), nullable=False, default="trainee")  # 'trainee', 'trainer', 'admin'
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    avatar_url = db.Column(db.String(256), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    courses_created = db.relationship("Course", backref="trainer", lazy=True, cascade="all, delete-orphan")
    enrollments = db.relationship("Enrollment", backref="user", lazy=True, cascade="all, delete-orphan")
    quiz_attempts = db.relationship("QuizAttempt", backref="user", lazy=True, cascade="all, delete-orphan")
    certificates = db.relationship("Certificate", backref="user", lazy=True, cascade="all, delete-orphan")

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "is_active": self.is_active,
            "avatar_url": self.avatar_url,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Course(db.Model):
    __tablename__ = "courses"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(80), nullable=False, default="General")
    difficulty = db.Column(db.String(40), nullable=False, default="Beginner")  # Beginner, Intermediate, Advanced
    duration = db.Column(db.String(50), nullable=False, default="4 hours")
    thumbnail_url = db.Column(db.String(300), nullable=True)
    trainer_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    is_published = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    modules = db.relationship("Module", backref="course", lazy=True, cascade="all, delete-orphan", order_by="Module.order_index")
    enrollments = db.relationship("Enrollment", backref="course", lazy=True, cascade="all, delete-orphan")
    quizzes = db.relationship("Quiz", backref="course", lazy=True, cascade="all, delete-orphan")
    certificates = db.relationship("Certificate", backref="course", lazy=True, cascade="all, delete-orphan")

    def to_dict(self, include_modules=False):
        data = {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "category": self.category,
            "difficulty": self.difficulty,
            "duration": self.duration,
            "thumbnail_url": self.thumbnail_url,
            "trainer_id": self.trainer_id,
            "trainer_name": self.trainer.name if self.trainer else "Unknown",
            "is_published": self.is_published,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "module_count": len(self.modules),
            "quiz_count": len(self.quizzes),
            "enrollment_count": len(self.enrollments)
        }
        if include_modules:
            data["modules"] = [m.to_dict() for m in self.modules]
            data["quizzes"] = [q.to_dict(include_questions=False) for q in self.quizzes]
        return data


class Module(db.Model):
    __tablename__ = "modules"

    id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.Integer, db.ForeignKey("courses.id"), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    content = db.Column(db.Text, nullable=False)  # Markdown/rich text
    key_points_json = db.Column(db.Text, nullable=True)  # JSON array string
    material_url = db.Column(db.String(300), nullable=True)
    order_index = db.Column(db.Integer, default=0, nullable=False)
    duration_minutes = db.Column(db.Integer, default=30)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    progress_records = db.relationship("ModuleProgress", backref="module", lazy=True, cascade="all, delete-orphan")

    def get_key_points(self):
        if not self.key_points_json:
            return []
        try:
            return json.loads(self.key_points_json)
        except Exception:
            return []

    def set_key_points(self, points_list):
        self.key_points_json = json.dumps(points_list if isinstance(points_list, list) else [])

    def to_dict(self):
        return {
            "id": self.id,
            "course_id": self.course_id,
            "title": self.title,
            "description": self.description,
            "content": self.content,
            "key_points": self.get_key_points(),
            "material_url": self.material_url,
            "order_index": self.order_index,
            "duration_minutes": self.duration_minutes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Enrollment(db.Model):
    __tablename__ = "enrollments"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey("courses.id"), nullable=False)
    enrolled_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime, nullable=True)
    status = db.Column(db.String(30), default="in_progress")  # 'in_progress', 'completed'

    # Relationships
    module_progress = db.relationship("ModuleProgress", backref="enrollment", lazy=True, cascade="all, delete-orphan")

    __table_args__ = (db.UniqueConstraint("user_id", "course_id", name="unique_user_course_enrollment"),)

    def calculate_progress_percentage(self):
        total_modules = Module.query.filter_by(course_id=self.course_id).count()
        if total_modules == 0:
            return 100 if self.status == "completed" else 0
        completed_count = ModuleProgress.query.filter_by(enrollment_id=self.id, completed=True).count()
        return min(100, int((completed_count / total_modules) * 100))

    def to_dict(self):
        progress = self.calculate_progress_percentage()
        total_modules = Module.query.filter_by(course_id=self.course_id).count()
        completed_modules = ModuleProgress.query.filter_by(enrollment_id=self.id, completed=True).count()
        return {
            "id": self.id,
            "user_id": self.user_id,
            "course_id": self.course_id,
            "enrolled_at": self.enrolled_at.isoformat() if self.enrolled_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "status": self.status,
            "progress_percentage": progress,
            "completed_modules_count": completed_modules,
            "total_modules_count": total_modules,
            "course": self.course.to_dict(include_modules=False) if self.course else None
        }


class ModuleProgress(db.Model):
    __tablename__ = "module_progress"

    id = db.Column(db.Integer, primary_key=True)
    enrollment_id = db.Column(db.Integer, db.ForeignKey("enrollments.id"), nullable=False)
    module_id = db.Column(db.Integer, db.ForeignKey("modules.id"), nullable=False)
    completed = db.Column(db.Boolean, default=False, nullable=False)
    completed_at = db.Column(db.DateTime, nullable=True)

    __table_args__ = (db.UniqueConstraint("enrollment_id", "module_id", name="unique_enrollment_module"),)

    def to_dict(self):
        return {
            "id": self.id,
            "enrollment_id": self.enrollment_id,
            "module_id": self.module_id,
            "completed": self.completed,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
        }


class Quiz(db.Model):
    __tablename__ = "quizzes"

    id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.Integer, db.ForeignKey("courses.id"), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    passing_percentage = db.Column(db.Integer, default=60, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    questions = db.relationship("Question", backref="quiz", lazy=True, cascade="all, delete-orphan", order_by="Question.order_index")
    attempts = db.relationship("QuizAttempt", backref="quiz", lazy=True, cascade="all, delete-orphan")

    def to_dict(self, include_questions=True, hide_answers=False):
        data = {
            "id": self.id,
            "course_id": self.course_id,
            "title": self.title,
            "description": self.description,
            "passing_percentage": self.passing_percentage,
            "question_count": len(self.questions),
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
        if include_questions:
            data["questions"] = [q.to_dict(hide_answer=hide_answers) for q in self.questions]
        return data


class Question(db.Model):
    __tablename__ = "questions"

    id = db.Column(db.Integer, primary_key=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey("quizzes.id"), nullable=False)
    question_text = db.Column(db.Text, nullable=False)
    option_a = db.Column(db.String(255), nullable=False)
    option_b = db.Column(db.String(255), nullable=False)
    option_c = db.Column(db.String(255), nullable=False)
    option_d = db.Column(db.String(255), nullable=False)
    correct_option = db.Column(db.String(5), nullable=False)  # 'A', 'B', 'C', 'D'
    marks = db.Column(db.Integer, default=1, nullable=False)
    order_index = db.Column(db.Integer, default=0, nullable=False)

    def to_dict(self, hide_answer=False):
        data = {
            "id": self.id,
            "quiz_id": self.quiz_id,
            "question_text": self.question_text,
            "option_a": self.option_a,
            "option_b": self.option_b,
            "option_c": self.option_c,
            "option_d": self.option_d,
            "marks": self.marks,
            "order_index": self.order_index,
        }
        if not hide_answer:
            data["correct_option"] = self.correct_option
        return data


class QuizAttempt(db.Model):
    __tablename__ = "quiz_attempts"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    quiz_id = db.Column(db.Integer, db.ForeignKey("quizzes.id"), nullable=False)
    score = db.Column(db.Integer, default=0, nullable=False)
    max_score = db.Column(db.Integer, default=0, nullable=False)
    percentage = db.Column(db.Float, default=0.0, nullable=False)
    passed = db.Column(db.Boolean, default=False, nullable=False)
    attempted_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    answers = db.relationship("QuizAnswer", backref="attempt", lazy=True, cascade="all, delete-orphan")

    def to_dict(self, include_answers=False):
        data = {
            "id": self.id,
            "user_id": self.user_id,
            "quiz_id": self.quiz_id,
            "score": self.score,
            "max_score": self.max_score,
            "percentage": round(self.percentage, 1),
            "passed": self.passed,
            "attempted_at": self.attempted_at.isoformat() if self.attempted_at else None,
        }
        if include_answers:
            data["answers"] = [a.to_dict() for a in self.answers]
        return data


class QuizAnswer(db.Model):
    __tablename__ = "quiz_answers"

    id = db.Column(db.Integer, primary_key=True)
    attempt_id = db.Column(db.Integer, db.ForeignKey("quiz_attempts.id"), nullable=False)
    question_id = db.Column(db.Integer, db.ForeignKey("questions.id"), nullable=False)
    selected_option = db.Column(db.String(5), nullable=True)  # 'A', 'B', 'C', 'D'
    is_correct = db.Column(db.Boolean, default=False, nullable=False)
    marks_awarded = db.Column(db.Integer, default=0, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "attempt_id": self.attempt_id,
            "question_id": self.question_id,
            "selected_option": self.selected_option,
            "is_correct": self.is_correct,
            "marks_awarded": self.marks_awarded,
        }


class Certificate(db.Model):
    __tablename__ = "certificates"

    id = db.Column(db.Integer, primary_key=True)
    certificate_code = db.Column(db.String(64), unique=True, nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey("courses.id"), nullable=False)
    trainee_name = db.Column(db.String(120), nullable=False)
    course_title = db.Column(db.String(200), nullable=False)
    trainer_name = db.Column(db.String(120), nullable=False)
    issue_date = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (db.UniqueConstraint("user_id", "course_id", name="unique_user_course_certificate"),)

    def to_dict(self):
        return {
            "id": self.id,
            "certificate_code": self.certificate_code,
            "user_id": self.user_id,
            "course_id": self.course_id,
            "trainee_name": self.trainee_name,
            "course_title": self.course_title,
            "trainer_name": self.trainer_name,
            "issue_date": self.issue_date.strftime("%B %d, %Y") if self.issue_date else None,
            "issue_timestamp": self.issue_date.isoformat() if self.issue_date else None
        }
