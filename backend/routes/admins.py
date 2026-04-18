from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
import uuid

from extensions import db
from models.admins import Admin

admins_bp = Blueprint('admins', __name__)


def admin_required():
    claims = get_jwt()
    if claims.get('user_type') != 'admin':
        return False, jsonify({"message": "Admin access required"}), 403
    return True, None, None


@admins_bp.route('/', methods=['GET'])
@jwt_required()
def get_admins():
    is_admin, err, code = admin_required()
    if not is_admin:
        return err, code

    admins = Admin.query.all()
    return jsonify([a.to_dict() for a in admins]), 200


@admins_bp.route('/', methods=['POST'])
@jwt_required()
def create_admin():
    is_admin, err, code = admin_required()
    if not is_admin:
        return err, code

    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    if not name or not email or not password:
        return jsonify({"message": "Name, email, and password are required"}), 400

    if Admin.query.filter_by(email=email).first():
        return jsonify({"message": "An admin with this email already exists"}), 409

    new_admin = Admin(
        admin_id=str(uuid.uuid4()),
        name=name,
        email=email
    )
    new_admin.set_password(password)

    db.session.add(new_admin)
    db.session.commit()

    return jsonify({
        "message": "Admin created successfully",
        "admin": new_admin.to_dict()
    }), 201


@admins_bp.route('/<string:admin_id>', methods=['DELETE'])
@jwt_required()
def delete_admin(admin_id):
    is_admin, err, code = admin_required()
    if not is_admin:
        return err, code

    # Prevent deleting yourself
    current_admin_id = get_jwt().get('sub')
    if admin_id == current_admin_id:
        return jsonify({"message": "You cannot delete your own account"}), 400

    admin = Admin.query.get_or_404(admin_id)
    db.session.delete(admin)
    db.session.commit()
    return jsonify({"message": "Admin deleted successfully"}), 200
