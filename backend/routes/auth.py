from functools import wraps
from flask import Blueprint, request, jsonify, session
from models import db, User

auth_bp = Blueprint("auth", __name__)

def get_current_user():
    user_id = session.get("user_id")
    if not user_id:
        return None
    return User.query.get(user_id)

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user = get_current_user()
        if not user or not user.is_active:
            return jsonify({"error": "Unauthorized. Please log in."}), 401
        return f(*args, **kwargs)
    return decorated_function

def role_required(*allowed_roles):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            user = get_current_user()
            if not user or not user.is_active:
                return jsonify({"error": "Unauthorized. Please log in."}), 401
            if user.role not in allowed_roles:
                return jsonify({"error": f"Forbidden. Role '{user.role}' not permitted."}), 403
            return f(*args, **kwargs)
        return decorated_function
    return decorator

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    role = data.get("role", "trainee").lower()

    if not name or not email or not password:
        return jsonify({"error": "Name, email, and password are required."}), 400

    if role not in ["trainee", "trainer"]:
        return jsonify({"error": "Role must be trainee or trainer."}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "An account with this email already exists."}), 400

    user = User(
        name=name,
        email=email,
        role=role,
        is_active=True
    )
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    # Automatically log the new user in
    session["user_id"] = user.id
    return jsonify({
        "message": "Registration successful.",
        "user": user.to_dict()
    }), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email and password are required."}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid email or password."}), 401

    if not user.is_active:
        return jsonify({"error": "This account has been deactivated. Please contact an administrator."}), 403

    session["user_id"] = user.id
    return jsonify({
        "message": "Login successful.",
        "user": user.to_dict()
    }), 200

@auth_bp.route("/demo-login", methods=["POST"])
def demo_login():
    data = request.get_json() or {}
    role = data.get("role", "trainee").lower()

    email_map = {
        "trainee": "trainee@capacityconnect.com",
        "trainer": "trainer@capacityconnect.com",
        "admin": "admin@capacityconnect.com"
    }

    target_email = email_map.get(role)
    if not target_email:
        return jsonify({"error": f"Invalid demo role: {role}"}), 400

    user = User.query.filter_by(email=target_email).first()
    if not user:
        return jsonify({"error": f"Demo account for {role} not found. Please re-seed database."}), 404

    session["user_id"] = user.id
    return jsonify({
        "message": f"Logged in as demo {role}.",
        "user": user.to_dict()
    }), 200

@auth_bp.route("/logout", methods=["POST"])
def logout():
    session.pop("user_id", None)
    return jsonify({"message": "Logged out successfully."}), 200

@auth_bp.route("/me", methods=["GET"])
def get_me():
    user = get_current_user()
    if not user:
        return jsonify({"user": None}), 200
    if not user.is_active:
        session.pop("user_id", None)
        return jsonify({"error": "Account deactivated."}), 403
    return jsonify({"user": user.to_dict()}), 200
