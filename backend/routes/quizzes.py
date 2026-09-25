import uuid
from datetime import datetime
from flask import Blueprint, request, jsonify
from models import db, Quiz, Question, QuizAttempt, QuizAnswer, Course, Enrollment, ModuleProgress, Module, Certificate
from routes.auth import get_current_user, login_required, role_required

quizzes_bp = Blueprint("quizzes", __name__)

@quizzes_bp.route("/course/<int:course_id>", methods=["GET"])
def get_course_quiz(course_id):
    user = get_current_user()
    course = Course.query.get_or_404(course_id)
    quiz = Quiz.query.filter_by(course_id=course.id).first()

    if not quiz:
        return jsonify({"quiz": None}), 200

    # Hide correct answers from trainees who haven't completed or are taking the test
    hide_answers = not (user and (user.role in ["trainer", "admin"] or user.id == course.trainer_id))
    quiz_data = quiz.to_dict(include_questions=True, hide_answers=hide_answers)

    # Attach previous attempts if user is logged in
    if user:
        attempts = QuizAttempt.query.filter_by(user_id=user.id, quiz_id=quiz.id).order_by(QuizAttempt.attempted_at.desc()).all()
        quiz_data["attempts"] = [a.to_dict(include_answers=True) for a in attempts]
        quiz_data["best_score"] = max([a.percentage for a in attempts]) if attempts else 0
        quiz_data["has_passed"] = any(a.passed for a in attempts)
    else:
        quiz_data["attempts"] = []
        quiz_data["best_score"] = 0
        quiz_data["has_passed"] = False

    return jsonify({"quiz": quiz_data}), 200

@quizzes_bp.route("/course/<int:course_id>", methods=["POST"])
@login_required
@role_required("trainer", "admin")
def create_or_update_course_quiz(course_id):
    user = get_current_user()
    course = Course.query.get_or_404(course_id)

    if user.role != "admin" and course.trainer_id != user.id:
        return jsonify({"error": "You do not have permission to manage quizzes for this course."}), 403

    data = request.get_json() or {}
    title = data.get("title", f"{course.title} - Final Assessment").strip()
    description = data.get("description", "Assess your understanding of the core concepts taught in this course.").strip()
    passing_percentage = int(data.get("passing_percentage", 60))

    quiz = Quiz.query.filter_by(course_id=course.id).first()
    if not quiz:
        quiz = Quiz(
            course_id=course.id,
            title=title,
            description=description,
            passing_percentage=passing_percentage
        )
        db.session.add(quiz)
    else:
        quiz.title = title
        quiz.description = description
        quiz.passing_percentage = passing_percentage

    db.session.commit()
    return jsonify({
        "message": "Quiz saved successfully.",
        "quiz": quiz.to_dict(include_questions=True)
    }), 200

@quizzes_bp.route("/<int:quiz_id>/questions", methods=["POST"])
@login_required
@role_required("trainer", "admin")
def add_question(quiz_id):
    user = get_current_user()
    quiz = Quiz.query.get_or_404(quiz_id)
    course = quiz.course

    if user.role != "admin" and course.trainer_id != user.id:
        return jsonify({"error": "You do not have permission to add questions to this quiz."}), 403

    data = request.get_json() or {}
    question_text = data.get("question_text", "").strip()
    option_a = data.get("option_a", "").strip()
    option_b = data.get("option_b", "").strip()
    option_c = data.get("option_c", "").strip()
    option_d = data.get("option_d", "").strip()
    correct_option = data.get("correct_option", "A").strip().upper()
    marks = int(data.get("marks", 1))

    if not question_text or not option_a or not option_b or not option_c or not option_d:
        return jsonify({"error": "Question text and all 4 options (A, B, C, D) are required."}), 400

    if correct_option not in ["A", "B", "C", "D"]:
        return jsonify({"error": "Correct option must be A, B, C, or D."}), 400

    highest_order = db.session.query(db.func.max(Question.order_index)).filter_by(quiz_id=quiz.id).scalar() or 0

    question = Question(
        quiz_id=quiz.id,
        question_text=question_text,
        option_a=option_a,
        option_b=option_b,
        option_c=option_c,
        option_d=option_d,
        correct_option=correct_option,
        marks=marks,
        order_index=highest_order + 1
    )
    db.session.add(question)
    db.session.commit()

    return jsonify({
        "message": "Question added successfully.",
        "question": question.to_dict(hide_answer=False)
    }), 201

@quizzes_bp.route("/questions/<int:question_id>", methods=["PUT"])
@login_required
@role_required("trainer", "admin")
def update_question(question_id):
    user = get_current_user()
    question = Question.query.get_or_404(question_id)
    course = question.quiz.course

    if user.role != "admin" and course.trainer_id != user.id:
        return jsonify({"error": "You do not have permission to edit this question."}), 403

    data = request.get_json() or {}
    if "question_text" in data:
        question.question_text = data["question_text"].strip()
    if "option_a" in data:
        question.option_a = data["option_a"].strip()
    if "option_b" in data:
        question.option_b = data["option_b"].strip()
    if "option_c" in data:
        question.option_c = data["option_c"].strip()
    if "option_d" in data:
        question.option_d = data["option_d"].strip()
    if "correct_option" in data and data["correct_option"].strip().upper() in ["A", "B", "C", "D"]:
        question.correct_option = data["correct_option"].strip().upper()
    if "marks" in data:
        question.marks = int(data["marks"])

    db.session.commit()
    return jsonify({
        "message": "Question updated successfully.",
        "question": question.to_dict(hide_answer=False)
    }), 200

@quizzes_bp.route("/questions/<int:question_id>", methods=["DELETE"])
@login_required
@role_required("trainer", "admin")
def delete_question(question_id):
    user = get_current_user()
    question = Question.query.get_or_404(question_id)
    course = question.quiz.course

    if user.role != "admin" and course.trainer_id != user.id:
        return jsonify({"error": "You do not have permission to delete this question."}), 403

    db.session.delete(question)
    db.session.commit()
    return jsonify({"message": "Question deleted successfully."}), 200

@quizzes_bp.route("/<int:quiz_id>/submit", methods=["POST"])
@login_required
def submit_quiz(quiz_id):
    user = get_current_user()
    quiz = Quiz.query.get_or_404(quiz_id)
    course = quiz.course

    data = request.get_json() or {}
    user_answers = data.get("answers", {})  # Map: { question_id: "A" | "B" | "C" | "D" }

    questions = quiz.questions
    if not questions:
        return jsonify({"error": "This quiz has no questions."}), 400

    total_marks = 0
    obtained_marks = 0
    detailed_answers = []

    for q in questions:
        total_marks += q.marks
        selected = user_answers.get(str(q.id)) or user_answers.get(q.id)
        if selected:
            selected = str(selected).strip().upper()

        is_correct = (selected == q.correct_option)
        marks_awarded = q.marks if is_correct else 0
        obtained_marks += marks_awarded

        detailed_answers.append({
            "question_id": q.id,
            "question_text": q.question_text,
            "selected_option": selected,
            "correct_option": q.correct_option,
            "is_correct": is_correct,
            "marks_awarded": marks_awarded,
            "marks_possible": q.marks
        })

    percentage = (obtained_marks / total_marks * 100.0) if total_marks > 0 else 0.0
    passed = percentage >= quiz.passing_percentage

    # Record Attempt
    attempt = QuizAttempt(
        user_id=user.id,
        quiz_id=quiz.id,
        score=obtained_marks,
        max_score=total_marks,
        percentage=percentage,
        passed=passed,
        attempted_at=datetime.utcnow()
    )
    db.session.add(attempt)
    db.session.flush()

    for item in detailed_answers:
        answer_rec = QuizAnswer(
            attempt_id=attempt.id,
            question_id=item["question_id"],
            selected_option=item["selected_option"],
            is_correct=item["is_correct"],
            marks_awarded=item["marks_awarded"]
        )
        db.session.add(answer_rec)

    # Check Certificate & Completion Eligibility
    certificate_generated = False
    cert_data = None

    enrollment = Enrollment.query.filter_by(user_id=user.id, course_id=course.id).first()
    if enrollment:
        # Check if all modules are completed
        total_mods = Module.query.filter_by(course_id=course.id).count()
        completed_mods = ModuleProgress.query.filter_by(enrollment_id=enrollment.id, completed=True).count()

        if completed_mods >= total_mods and passed:
            enrollment.status = "completed"
            enrollment.completed_at = datetime.utcnow()

            # Generate certificate if not already issued
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
                certificate_generated = True
                cert_data = new_cert.to_dict()
            else:
                cert_data = existing_cert.to_dict()

    db.session.commit()

    return jsonify({
        "message": "Quiz submitted successfully.",
        "result": {
            "score": obtained_marks,
            "max_score": total_marks,
            "percentage": round(percentage, 1),
            "passed": passed,
            "passing_percentage": quiz.passing_percentage,
            "attempt_id": attempt.id,
            "detailed_answers": detailed_answers,
            "certificate_generated": certificate_generated,
            "certificate": cert_data
        }
    }), 200
