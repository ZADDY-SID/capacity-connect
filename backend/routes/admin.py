from flask import Blueprint, request, jsonify
from models import db, User, Course, Enrollment, Certificate, QuizAttempt, Module
from routes.auth import get_current_user, login_required, role_required

admin_bp = Blueprint("admin", __name__)

@admin_bp.route("/users", methods=["GET"])
@login_required
@role_required("admin")
def get_all_users():
    search = request.args.get("search", "").strip().lower()
    role = request.args.get("role", "").strip().lower()

    query = User.query

    if role and role != "all":
        query = query.filter_by(role=role)

    if search:
        query = query.filter(
            (User.name.ilike(f"%{search}%")) |
            (User.email.ilike(f"%{search}%"))
        )

    users = query.order_by(User.created_at.desc()).all()
    user_list = []
    for u in users:
        d = u.to_dict()
        d["courses_created_count"] = len(u.courses_created) if u.role == "trainer" else 0
        d["enrollments_count"] = len(u.enrollments) if u.role == "trainee" else 0
        d["certificates_count"] = len(u.certificates) if u.role == "trainee" else 0
        user_list.append(d)

    return jsonify({"users": user_list}), 200

@admin_bp.route("/users/<int:user_id>/toggle-status", methods=["PUT"])
@login_required
@role_required("admin")
def toggle_user_status(user_id):
    current = get_current_user()
    if current.id == user_id:
        return jsonify({"error": "You cannot deactivate your own admin account."}), 400

    user = User.query.get_or_404(user_id)
    user.is_active = not user.is_active
    db.session.commit()

    return jsonify({
        "message": f"User '{user.name}' is now {'active' if user.is_active else 'deactivated'}.",
        "user": user.to_dict()
    }), 200

@admin_bp.route("/courses", methods=["GET"])
@login_required
@role_required("admin")
def get_all_courses():
    search = request.args.get("search", "").strip().lower()
    category = request.args.get("category", "").strip()

    query = Course.query

    if category and category != "All":
        query = query.filter_by(category=category)

    if search:
        query = query.filter(
            (Course.title.ilike(f"%{search}%")) |
            (Course.description.ilike(f"%{search}%"))
        )

    courses = query.order_by(Course.created_at.desc()).all()
    return jsonify({"courses": [c.to_dict(include_modules=False) for c in courses]}), 200

@admin_bp.route("/courses/<int:course_id>/toggle-publish", methods=["PUT"])
@login_required
@role_required("admin")
def toggle_course_publish(course_id):
    course = Course.query.get_or_404(course_id)
    course.is_published = not course.is_published
    db.session.commit()

    return jsonify({
        "message": f"Course '{course.title}' is now {'published' if course.is_published else 'draft/hidden'}.",
        "course": course.to_dict()
    }), 200

@admin_bp.route("/courses/<int:course_id>", methods=["DELETE"])
@login_required
@role_required("admin")
def delete_course(course_id):
    course = Course.query.get_or_404(course_id)
    db.session.delete(course)
    db.session.commit()

    return jsonify({"message": f"Course '{course.title}' removed successfully."}), 200

@admin_bp.route("/analytics", methods=["GET"])
@login_required
@role_required("admin")
def get_admin_analytics():
    total_users = User.query.count()
    trainees_count = User.query.filter_by(role="trainee").count()
    trainers_count = User.query.filter_by(role="trainer").count()
    admins_count = User.query.filter_by(role="admin").count()

    total_courses = Course.query.count()
    published_courses = Course.query.filter_by(is_published=True).count()
    total_enrollments = Enrollment.query.count()
    completed_enrollments = Enrollment.query.filter_by(status="completed").count()

    completion_rate = round(
        (completed_enrollments / total_enrollments * 100), 1
    ) if total_enrollments > 0 else 0

    total_certificates = Certificate.query.count()

    attempts = QuizAttempt.query.all()
    avg_quiz_score = round(sum([a.percentage for a in attempts]) / len(attempts), 1) if attempts else 0

    # User Role Distribution for Recharts Pie/Bar
    user_distribution = [
        {"role": "Trainees", "count": trainees_count, "color": "#38bdf8"},
        {"role": "Trainers", "count": trainers_count, "color": "#a78bfa"},
        {"role": "Admins", "count": admins_count, "color": "#34d399"}
    ]

    # Category breakdown
    categories = db.session.query(Course.category, db.func.count(Course.id)).group_by(Course.category).all()
    category_data = [{"category": cat, "count": cnt} for cat, cnt in categories]

    # Status distribution
    enrollment_status_data = [
        {"status": "In Progress", "count": total_enrollments - completed_enrollments},
        {"status": "Completed", "count": completed_enrollments}
    ]

    return jsonify({
        "stats": {
            "total_users": total_users,
            "trainees": trainees_count,
            "trainers": trainers_count,
            "admins": admins_count,
            "total_courses": total_courses,
            "published_courses": published_courses,
            "total_enrollments": total_enrollments,
            "completed_enrollments": completed_enrollments,
            "completion_rate": completion_rate,
            "total_certificates": total_certificates,
            "average_quiz_score": avg_quiz_score
        },
        "user_distribution": user_distribution,
        "category_distribution": category_data,
        "enrollment_status_distribution": enrollment_status_data
    }), 200
