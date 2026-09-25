import uuid
from datetime import datetime
from flask import Blueprint, request, jsonify
from models import db, Course, Module, Enrollment, ModuleProgress, Quiz, QuizAttempt, Certificate, User
from routes.auth import get_current_user, login_required, role_required

progress_bp = Blueprint("progress", __name__)

@progress_bp.route("/modules/<int:module_id>/complete", methods=["POST"])
@login_required
def toggle_module_complete(module_id):
    user = get_current_user()
    if user.role != "trainee":
        return jsonify({"error": "Only trainees can complete modules."}), 403

    module = Module.query.get_or_404(module_id)
    enrollment = Enrollment.query.filter_by(user_id=user.id, course_id=module.course_id).first()

    if not enrollment:
        # Auto enroll if not already
        enrollment = Enrollment(user_id=user.id, course_id=module.course_id, status="in_progress")
        db.session.add(enrollment)
        db.session.flush()

    progress = ModuleProgress.query.filter_by(enrollment_id=enrollment.id, module_id=module.id).first()
    if not progress:
        progress = ModuleProgress(enrollment_id=enrollment.id, module_id=module.id)
        db.session.add(progress)

    data = request.get_json() or {}
    mark_as = data.get("completed", True)

    progress.completed = mark_as
    progress.completed_at = datetime.utcnow() if mark_as else None

    # Recalculate course completion status
    course = module.course
    total_mods = len(course.modules)
    completed_mods = ModuleProgress.query.filter_by(enrollment_id=enrollment.id, completed=True).count()
    current_percentage = int((completed_mods / total_mods * 100)) if total_mods > 0 else 0

    # Check if quiz has been passed
    quiz = Quiz.query.filter_by(course_id=course.id).first()
    has_passed_quiz = False
    if quiz:
        has_passed_quiz = QuizAttempt.query.filter_by(user_id=user.id, quiz_id=quiz.id, passed=True).first() is not None
    else:
        has_passed_quiz = True  # If no quiz, completing all modules marks course complete

    certificate_issued = False
    cert_data = None

    if completed_mods >= total_mods and has_passed_quiz:
        enrollment.status = "completed"
        enrollment.completed_at = datetime.utcnow()

        existing_cert = Certificate.query.filter_by(user_id=user.id, course_id=course.id).first()
        if not existing_cert:
            cert_code = f"CAP-{course.id:03d}-{uuid.uuid4().hex[:8].upper()}"
            new_cert = Certificate(
                certificate_code=cert_code,
                user_id=user.id,
                course_id=course.id,
                trainee_name=user.name,
                course_title=course.title,
                trainer_name=course.trainer.name if course.trainer else "Capacity Connect",
                issue_date=datetime.utcnow()
            )
            db.session.add(new_cert)
            db.session.flush()
            certificate_issued = True
            cert_data = new_cert.to_dict()
        else:
            cert_data = existing_cert.to_dict()

    db.session.commit()

    return jsonify({
        "message": f"Module marked as {'completed' if mark_as else 'incomplete'}.",
        "module_id": module.id,
        "completed": progress.completed,
        "course_progress": current_percentage,
        "course_completed": enrollment.status == "completed",
        "certificate_issued": certificate_issued,
        "certificate": cert_data
    }), 200

@progress_bp.route("/trainee/dashboard", methods=["GET"])
@login_required
def get_trainee_dashboard():
    user = get_current_user()
    if user.role != "trainee":
        return jsonify({"error": "Unauthorized."}), 403

    enrollments = Enrollment.query.filter_by(user_id=user.id).all()
    enrolled_courses = [e.to_dict() for e in enrollments]
    completed_courses = [e for e in enrollments if e.status == "completed"]

    attempts = QuizAttempt.query.filter_by(user_id=user.id).all()
    avg_score = round(sum([a.percentage for a in attempts]) / len(attempts), 1) if attempts else 0

    overall_progress = round(
        sum([e.calculate_progress_percentage() for e in enrollments]) / len(enrollments), 1
    ) if enrollments else 0

    certificates = Certificate.query.filter_by(user_id=user.id).all()

    # Recent activities (last 5 quiz attempts or completions)
    recent_activity = []
    for a in attempts[-5:]:
        quiz = Quiz.query.get(a.quiz_id)
        recent_activity.append({
            "type": "quiz",
            "title": f"Quiz: {quiz.title if quiz else 'Assessment'}",
            "details": f"Scored {round(a.percentage, 1)}% ({'Passed' if a.passed else 'Needs Improvement'})",
            "timestamp": a.attempted_at.isoformat() if a.attempted_at else None
        })

    for c in certificates[-3:]:
        recent_activity.append({
            "type": "certificate",
            "title": f"Earned Certificate: {c.course_title}",
            "details": f"Issued on {c.issue_date.strftime('%b %d, %Y') if c.issue_date else ''}",
            "timestamp": c.issue_date.isoformat() if c.issue_date else None
        })

    # Sort recent activity by timestamp desc
    recent_activity.sort(key=lambda x: x["timestamp"] or "", reverse=True)

    return jsonify({
        "stats": {
            "enrolled_count": len(enrollments),
            "completed_count": len(completed_courses),
            "average_score": avg_score,
            "overall_progress": overall_progress,
            "certificate_count": len(certificates)
        },
        "enrollments": enrolled_courses,
        "recent_activity": recent_activity[:6],
        "certificates": [c.to_dict() for c in certificates]
    }), 200

@progress_bp.route("/trainer/students", methods=["GET"])
@login_required
@role_required("trainer", "admin")
def get_trainer_students():
    user = get_current_user()

    # If trainer, get only courses by this trainer; if admin, get all courses
    if user.role == "trainer":
        courses = Course.query.filter_by(trainer_id=user.id).all()
    else:
        courses = Course.query.all()

    course_ids = [c.id for c in courses]
    course_map = {c.id: c.title for c in courses}

    enrollments = Enrollment.query.filter(Enrollment.course_id.in_(course_ids)).all()

    students_table = []

    for en in enrollments:
        student = User.query.get(en.user_id)
        if not student:
            continue

        progress_pct = en.calculate_progress_percentage()

        # Find latest/highest quiz attempt for this course's quiz
        quiz = Quiz.query.filter_by(course_id=en.course_id).first()
        quiz_score = None
        has_quiz = quiz is not None

        if quiz:
            latest_attempt = QuizAttempt.query.filter_by(user_id=student.id, quiz_id=quiz.id).order_by(QuizAttempt.attempted_at.desc()).first()
            if latest_attempt:
                quiz_score = round(latest_attempt.percentage, 1)

        # Rule for Needs Attention:
        # Progress < 40% OR Quiz score < 50% (if attempted)
        needs_attention = (progress_pct < 40) or (quiz_score is not None and quiz_score < 50)

        status_label = "Completed" if en.status == "completed" else ("Needs Attention" if needs_attention else "On Track")

        students_table.append({
            "enrollment_id": en.id,
            "student_id": student.id,
            "student_name": student.name,
            "student_email": student.email,
            "course_id": en.course_id,
            "course_title": course_map.get(en.course_id, "Unknown Course"),
            "progress": progress_pct,
            "quiz_score": f"{quiz_score}%" if quiz_score is not None else ("Not Taken" if has_quiz else "N/A"),
            "raw_quiz_score": quiz_score,
            "status": status_label,
            "needs_attention": needs_attention,
            "enrolled_at": en.enrolled_at.strftime("%b %d, %Y") if en.enrolled_at else None
        })

    return jsonify({"students": students_table}), 200

@progress_bp.route("/trainer/analytics", methods=["GET"])
@login_required
@role_required("trainer", "admin")
def get_trainer_analytics():
    user = get_current_user()

    if user.role == "trainer":
        courses = Course.query.filter_by(trainer_id=user.id).all()
    else:
        courses = Course.query.all()

    course_ids = [c.id for c in courses]

    enrollments = Enrollment.query.filter(Enrollment.course_id.in_(course_ids)).all()
    total_enrollments = len(enrollments)
    completed_enrollments = len([e for e in enrollments if e.status == "completed"])
    completion_rate = round((completed_enrollments / total_enrollments * 100), 1) if total_enrollments > 0 else 0

    # Quizzes created by this trainer
    quizzes = Quiz.query.filter(Quiz.course_id.in_(course_ids)).all()
    quiz_ids = [q.id for q in quizzes]
    attempts = QuizAttempt.query.filter(QuizAttempt.quiz_id.in_(quiz_ids)).all()
    avg_score = round(sum([a.percentage for a in attempts]) / len(attempts), 1) if attempts else 0

    # Unique students
    student_ids = list(set([e.user_id for e in enrollments]))

    # Chart 1: Enrollment & Completion by Course
    courses_chart_data = []
    for c in courses:
        c_enrollments = [e for e in enrollments if e.course_id == c.id]
        c_completions = [e for e in c_enrollments if e.status == "completed"]
        courses_chart_data.append({
            "name": c.title[:18] + ("..." if len(c.title) > 18 else ""),
            "full_name": c.title,
            "enrollments": len(c_enrollments),
            "completions": len(c_completions),
        })

    # Chart 2: Student Progress Brackets
    progress_distribution = [
        {"bracket": "0 - 25%", "count": 0},
        {"bracket": "26 - 50%", "count": 0},
        {"bracket": "51 - 75%", "count": 0},
        {"bracket": "76 - 100%", "count": 0},
    ]
    for en in enrollments:
        pct = en.calculate_progress_percentage()
        if pct <= 25:
            progress_distribution[0]["count"] += 1
        elif pct <= 50:
            progress_distribution[1]["count"] += 1
        elif pct <= 75:
            progress_distribution[2]["count"] += 1
        else:
            progress_distribution[3]["count"] += 1

    return jsonify({
        "stats": {
            "total_courses": len(courses),
            "total_students": len(student_ids),
            "total_enrollments": total_enrollments,
            "total_quizzes": len(quizzes),
            "average_score": avg_score,
            "completion_rate": completion_rate
        },
        "courses_chart": courses_chart_data,
        "progress_distribution": progress_distribution
    }), 200
