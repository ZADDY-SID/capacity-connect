from flask import Blueprint, request, jsonify
from models import db, Course, Module, Enrollment, ModuleProgress, Quiz, Certificate, User
from routes.auth import get_current_user, login_required, role_required

courses_bp = Blueprint("courses", __name__)

@courses_bp.route("", methods=["GET"])
def get_courses():
    user = get_current_user()
    category = request.args.get("category")
    difficulty = request.args.get("difficulty")
    search = request.args.get("search", "").strip().lower()
    trainer_id = request.args.get("trainer_id")
    my_courses = request.args.get("mine") == "true"

    query = Course.query

    # Visibility: anonymous / trainees only see published courses unless trainer/admin
    if my_courses and user and user.role == "trainer":
        query = query.filter(Course.trainer_id == user.id)
    elif my_courses and user and user.role == "trainee":
        enrolled_ids = [e.course_id for e in Enrollment.query.filter_by(user_id=user.id).all()]
        query = query.filter(Course.id.in_(enrolled_ids))
    elif not user or user.role == "trainee":
        query = query.filter(Course.is_published == True)
    elif trainer_id:
        query = query.filter(Course.trainer_id == int(trainer_id))

    if category and category != "All":
        query = query.filter(Course.category.ilike(category))

    if difficulty and difficulty != "All":
        query = query.filter(Course.difficulty.ilike(difficulty))

    if search:
        query = query.filter(
            (Course.title.ilike(f"%{search}%")) |
            (Course.description.ilike(f"%{search}%")) |
            (Course.category.ilike(f"%{search}%"))
        )

    courses = query.order_by(Course.created_at.desc()).all()
    results = []

    # Map user's enrollments if authenticated
    user_enrollments = {}
    if user:
        for en in Enrollment.query.filter_by(user_id=user.id).all():
            user_enrollments[en.course_id] = {
                "enrollment_id": en.id,
                "status": en.status,
                "progress_percentage": en.calculate_progress_percentage()
            }

    for c in courses:
        data = c.to_dict(include_modules=False)
        data["enrollment"] = user_enrollments.get(c.id, None)
        results.append(data)

    return jsonify({"courses": results}), 200

@courses_bp.route("/<int:course_id>", methods=["GET"])
def get_course_detail(course_id):
    user = get_current_user()
    course = Course.query.get_or_404(course_id)

    # Check if trainee trying to view unpublished
    if not course.is_published and (not user or (user.role == "trainee" and course.trainer_id != user.id)):
        return jsonify({"error": "Course not found or unpublished."}), 404

    data = course.to_dict(include_modules=True)

    # If user is logged in, attach their enrollment & module progress details
    if user:
        enrollment = Enrollment.query.filter_by(user_id=user.id, course_id=course.id).first()
        if enrollment:
            en_data = enrollment.to_dict()
            # Fetch completed module IDs
            completed_modules = [
                mp.module_id for mp in ModuleProgress.query.filter_by(enrollment_id=enrollment.id, completed=True).all()
            ]
            en_data["completed_module_ids"] = completed_modules
            data["enrollment"] = en_data

            # Check certificate status
            cert = Certificate.query.filter_by(user_id=user.id, course_id=course.id).first()
            data["certificate"] = cert.to_dict() if cert else None
        else:
            data["enrollment"] = None
            data["certificate"] = None
    else:
        data["enrollment"] = None
        data["certificate"] = None

    return jsonify({"course": data}), 200

@courses_bp.route("", methods=["POST"])
@login_required
@role_required("trainer", "admin")
def create_course():
    user = get_current_user()
    data = request.get_json() or {}

    title = data.get("title", "").strip()
    description = data.get("description", "").strip()
    category = data.get("category", "General").strip()
    difficulty = data.get("difficulty", "Beginner")
    duration = data.get("duration", "4 hours").strip()
    thumbnail_url = data.get("thumbnail_url", "").strip()
    is_published = data.get("is_published", True)

    if not title or not description:
        return jsonify({"error": "Title and description are required."}), 400

    course = Course(
        title=title,
        description=description,
        category=category,
        difficulty=difficulty,
        duration=duration,
        thumbnail_url=thumbnail_url or "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60",
        trainer_id=user.id,
        is_published=is_published
    )
    db.session.add(course)
    db.session.commit()

    return jsonify({
        "message": "Course created successfully.",
        "course": course.to_dict(include_modules=True)
    }), 201

@courses_bp.route("/<int:course_id>", methods=["PUT"])
@login_required
@role_required("trainer", "admin")
def update_course(course_id):
    user = get_current_user()
    course = Course.query.get_or_404(course_id)

    if user.role != "admin" and course.trainer_id != user.id:
        return jsonify({"error": "You do not have permission to edit this course."}), 403

    data = request.get_json() or {}
    if "title" in data and data["title"].strip():
        course.title = data["title"].strip()
    if "description" in data:
        course.description = data["description"].strip()
    if "category" in data:
        course.category = data["category"].strip()
    if "difficulty" in data:
        course.difficulty = data["difficulty"]
    if "duration" in data:
        course.duration = data["duration"].strip()
    if "thumbnail_url" in data:
        course.thumbnail_url = data["thumbnail_url"].strip()
    if "is_published" in data:
        course.is_published = bool(data["is_published"])

    db.session.commit()
    return jsonify({
        "message": "Course updated successfully.",
        "course": course.to_dict(include_modules=True)
    }), 200

@courses_bp.route("/<int:course_id>", methods=["DELETE"])
@login_required
@role_required("trainer", "admin")
def delete_course(course_id):
    user = get_current_user()
    course = Course.query.get_or_404(course_id)

    if user.role != "admin" and course.trainer_id != user.id:
        return jsonify({"error": "You do not have permission to delete this course."}), 403

    db.session.delete(course)
    db.session.commit()
    return jsonify({"message": "Course deleted successfully."}), 200

@courses_bp.route("/<int:course_id>/enroll", methods=["POST"])
@login_required
def enroll_course(course_id):
    user = get_current_user()
    if user.role != "trainee":
        return jsonify({"error": "Only trainees can enroll in courses."}), 400

    course = Course.query.get_or_404(course_id)
    if not course.is_published and user.role != "admin":
        return jsonify({"error": "This course is not available for enrollment."}), 400

    existing = Enrollment.query.filter_by(user_id=user.id, course_id=course.id).first()
    if existing:
        return jsonify({"message": "Already enrolled.", "enrollment": existing.to_dict()}), 200

    enrollment = Enrollment(
        user_id=user.id,
        course_id=course.id,
        status="in_progress"
    )
    db.session.add(enrollment)
    db.session.flush()

    # Pre-create progress records for each module
    for mod in course.modules:
        mp = ModuleProgress(
            enrollment_id=enrollment.id,
            module_id=mod.id,
            completed=False
        )
        db.session.add(mp)

    db.session.commit()
    return jsonify({
        "message": f"Successfully enrolled in {course.title}.",
        "enrollment": enrollment.to_dict()
    }), 201

# Module CRUD routes
@courses_bp.route("/<int:course_id>/modules", methods=["POST"])
@login_required
@role_required("trainer", "admin")
def add_module(course_id):
    user = get_current_user()
    course = Course.query.get_or_404(course_id)

    if user.role != "admin" and course.trainer_id != user.id:
        return jsonify({"error": "You do not have permission to add modules to this course."}), 403

    data = request.get_json() or {}
    title = data.get("title", "").strip()
    content = data.get("content", "").strip()
    description = data.get("description", "").strip()
    key_points = data.get("key_points", [])
    material_url = data.get("material_url", "").strip()
    duration_minutes = data.get("duration_minutes", 30)

    if not title or not content:
        return jsonify({"error": "Module title and content are required."}), 400

    # Auto calculate next order index
    highest_order = db.session.query(db.func.max(Module.order_index)).filter_by(course_id=course.id).scalar() or 0

    module = Module(
        course_id=course.id,
        title=title,
        description=description,
        content=content,
        material_url=material_url,
        order_index=highest_order + 1,
        duration_minutes=int(duration_minutes)
    )
    module.set_key_points(key_points)

    db.session.add(module)
    db.session.flush()

    # Link module to existing enrollments
    for en in course.enrollments:
        db.session.add(ModuleProgress(enrollment_id=en.id, module_id=module.id, completed=False))

    db.session.commit()
    return jsonify({
        "message": "Module created successfully.",
        "module": module.to_dict()
    }), 201

@courses_bp.route("/modules/<int:module_id>", methods=["PUT"])
@login_required
@role_required("trainer", "admin")
def update_module(module_id):
    user = get_current_user()
    module = Module.query.get_or_404(module_id)
    course = module.course

    if user.role != "admin" and course.trainer_id != user.id:
        return jsonify({"error": "You do not have permission to edit this module."}), 403

    data = request.get_json() or {}
    if "title" in data and data["title"].strip():
        module.title = data["title"].strip()
    if "description" in data:
        module.description = data["description"].strip()
    if "content" in data and data["content"].strip():
        module.content = data["content"].strip()
    if "material_url" in data:
        module.material_url = data["material_url"].strip()
    if "key_points" in data:
        module.set_key_points(data["key_points"])
    if "duration_minutes" in data:
        module.duration_minutes = int(data["duration_minutes"])
    if "order_index" in data:
        module.order_index = int(data["order_index"])

    db.session.commit()
    return jsonify({
        "message": "Module updated successfully.",
        "module": module.to_dict()
    }), 200

@courses_bp.route("/modules/<int:module_id>", methods=["DELETE"])
@login_required
@role_required("trainer", "admin")
def delete_module(module_id):
    user = get_current_user()
    module = Module.query.get_or_404(module_id)
    course = module.course

    if user.role != "admin" and course.trainer_id != user.id:
        return jsonify({"error": "You do not have permission to delete this module."}), 403

    db.session.delete(module)
    db.session.commit()
    return jsonify({"message": "Module deleted successfully."}), 200
