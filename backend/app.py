import os
from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from models import db
from routes.auth import auth_bp
from routes.courses import courses_bp
from routes.quizzes import quizzes_bp
from routes.progress import progress_bp
from routes.certificates import certificates_bp
from routes.admin import admin_bp

def _allowed_origins():
    # Comma-separated extra origins via env, e.g. FRONTEND_URL=https://my-app.vercel.app
    env_origins = []
    for key in ("FRONTEND_URL", "ALLOWED_ORIGINS"):
        raw = os.environ.get(key, "").strip()
        if raw:
            env_origins.extend([o.strip().rstrip("/") for o in raw.split(",") if o.strip()])
    defaults = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "https://capacity-connect-ashy.vercel.app",
    ]
    # Deduplicate, preserve order
    seen = set()
    origins = []
    for o in env_origins + defaults:
        if o not in seen:
            seen.add(o)
            origins.append(o)
    return origins

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize CORS for both local development and deployed frontend
    CORS(
        app,
        resources={r"/api/*": {"origins": _allowed_origins()}},
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    )

    # Initialize Database
    db.init_app(app)

    # Register Blueprints
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(courses_bp, url_prefix="/api/courses")
    app.register_blueprint(quizzes_bp, url_prefix="/api/quizzes")
    app.register_blueprint(progress_bp, url_prefix="/api")
    app.register_blueprint(certificates_bp, url_prefix="/api/certificates")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")

    @app.route("/api/health", methods=["GET"])
    def health():
        return jsonify({
            "status": "healthy",
            "platform": "Capacity Connect",
            "tagline": "Learn. Grow. Achieve."
        }), 200

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Resource not found."}), 404

    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({"error": "An internal server error occurred."}), 500

    with app.app_context():
        db.create_all()

    return app

app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
