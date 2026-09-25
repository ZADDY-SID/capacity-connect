from flask import Blueprint, request, jsonify
from models import db, Certificate, Course, User
from routes.auth import get_current_user, login_required

certificates_bp = Blueprint("certificates", __name__)

@certificates_bp.route("", methods=["GET"])
@login_required
def get_user_certificates():
    user = get_current_user()
    if user.role == "admin":
        certs = Certificate.query.order_by(Certificate.issue_date.desc()).all()
    elif user.role == "trainer":
        # Trainer sees certificates issued for their courses
        courses = Course.query.filter_by(trainer_id=user.id).all()
        c_ids = [c.id for c in courses]
        certs = Certificate.query.filter(Certificate.course_id.in_(c_ids)).order_by(Certificate.issue_date.desc()).all()
    else:
        certs = Certificate.query.filter_by(user_id=user.id).order_by(Certificate.issue_date.desc()).all()

    return jsonify({"certificates": [c.to_dict() for c in certs]}), 200

@certificates_bp.route("/<int:certificate_id>", methods=["GET"])
@login_required
def get_certificate_detail(certificate_id):
    user = get_current_user()
    cert = Certificate.query.get_or_404(certificate_id)

    # Permission check: own certificate, course trainer, or admin
    if user.role != "admin" and cert.user_id != user.id:
        course = Course.query.get(cert.course_id)
        if not course or course.trainer_id != user.id:
            return jsonify({"error": "Unauthorized to view this certificate."}), 403

    return jsonify({"certificate": cert.to_dict()}), 200

@certificates_bp.route("/verify/<string:code>", methods=["GET"])
def verify_certificate(code):
    cert = Certificate.query.filter_by(certificate_code=code.strip()).first()
    if not cert:
        return jsonify({"valid": False, "message": "Certificate not found or invalid verification code."}), 404

    return jsonify({
        "valid": True,
        "certificate": cert.to_dict()
    }), 200
