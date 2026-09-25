import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DATABASE_DIR = os.path.join(BASE_DIR, "database")
os.makedirs(DATABASE_DIR, exist_ok=True)

# Detect production (Render sets RENDER=true; we also set FLASK_ENV=production)
IS_PRODUCTION = (
    os.environ.get("FLASK_ENV") == "production"
    or os.environ.get("RENDER") == "true"
)

def _database_uri():
    uri = os.environ.get("DATABASE_URL", "").strip()
    if uri:
        # Render/Heroku style postgres:// needs to be postgresql:// for SQLAlchemy
        if uri.startswith("postgres://"):
            uri = uri.replace("postgres://", "postgresql://", 1)
        return uri
    return f"sqlite:///{os.path.join(DATABASE_DIR, 'capacity_connect.db')}"

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "capacity-connect-super-secret-key-2026")
    SQLALCHEMY_DATABASE_URI = _database_uri()
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SESSION_COOKIE_HTTPONLY = True
    # Cross-site cookies (Vercel frontend + Render backend) REQUIRE SameSite=None + Secure=True.
    # Local dev keeps Lax + non-secure.
    SESSION_COOKIE_SAMESITE = "None" if IS_PRODUCTION else "Lax"
    SESSION_COOKIE_SECURE = True if IS_PRODUCTION else False
    PREFERRED_URL_SCHEME = "https" if IS_PRODUCTION else "http"
