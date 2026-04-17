from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt # get_jwt to access claims
from werkzeug.security import generate_password_hash
import uuid # For generating unique IDs

from extensions import db
from models.lecturers import Lecturer # Ensure this model is correctly defined

lecturers_bp = Blueprint('lecturers', __name__)

# --- Helper to enforce Admin-only access ---
def admin_required():
    """Decorator-like helper to check if the current authenticated user is an admin."""
    claims = get_jwt()
    user_type = claims.get('user_type')
    if user_type != 'admin':
        return False, jsonify({"message": "Admin access required"}), 403
    return True, None, None

@lecturers_bp.route('/', methods=['GET'])
@jwt_required()
def get_lecturers():
    # Optional: You might want to restrict listing lecturers to admins or specific roles
    # is_admin, error_response, status_code = admin_required()
    # if not is_admin:
    #     return error_response, status_code

    try:
        lecturers = Lecturer.query.all()
        return jsonify([lecturer.to_dict() for lecturer in lecturers]), 200
    except Exception as e:
        # Log the exception for debugging in development
        # current_app.logger.error(f"Error fetching lecturers: {e}")
        return jsonify({"message": f"An error occurred while fetching lecturers: {str(e)}"}), 500


@lecturers_bp.route('/', methods=['POST'])
@jwt_required() # Requires a valid JWT token
def create_lecturer():
    # --- Enforce Admin-only access for creating lecturers ---
    is_admin, error_response, status_code = admin_required()
    if not is_admin:
        return error_response, status_code

    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password') # The plaintext password provided by admin
    department = data.get('department') # Keep department if your model has it

    # Basic input validation
    if not name or not email or not password:
        return jsonify({"message": "Name, email, and password are required"}), 400

    # Check for existing lecturer with the same email
    if Lecturer.query.filter_by(email=email).first():
        return jsonify({"message": "Lecturer with this email already exists"}), 409 # Conflict

    try:
        # Generate a unique lecturer_id (UUID as a string)
        new_lecturer_id = str(uuid.uuid4())

        # Create new Lecturer instance
        new_lecturer = Lecturer(
            lecturer_id=new_lecturer_id,
            name=name,
            email=email,
            department=department # Pass department if exists
        )
        # --- CRITICAL: Hash and set the password using the model's method ---
        new_lecturer.set_password(password) # Calls the set_password method on the model

        db.session.add(new_lecturer)
        db.session.commit()

        return jsonify({
            "message": "Lecturer registered successfully",
            "lecturer": new_lecturer.to_dict() # Assuming to_dict() method exists on Lecturer model
        }), 201 # Created
    except Exception as e:
        db.session.rollback() # Rollback in case of an error
        # Log the exception for debugging in development
        # current_app.logger.error(f"Error creating lecturer: {e}")
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500

@lecturers_bp.route('/<string:lecturer_id>', methods=['GET'])
@jwt_required()
def get_lecturer(lecturer_id):
    try:
        lecturer = Lecturer.query.get_or_404(lecturer_id)
        return jsonify(lecturer.to_dict()), 200
    except Exception as e:
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500

# You'll likely need PUT and DELETE routes for lecturers as well:
# @lecturers_bp.route('/<string:lecturer_id>', methods=['PUT'])
# @jwt_required()
# def update_lecturer(lecturer_id):
#     is_admin, error_response, status_code = admin_required()
#     if not is_admin:
#         return error_response, status_code
#     
#     lecturer = Lecturer.query.get_or_404(lecturer_id)
#     data = request.get_json()
#     
#     try:
#         if 'name' in data:
#             lecturer.name = data['name']
#         if 'email' in data:
#             # Add validation for unique email if updated
#             if Lecturer.query.filter(Lecturer.email == data['email'], Lecturer.lecturer_id != lecturer_id).first():
#                 return jsonify({"message": "Email already in use"}), 409
#             lecturer.email = data['email']
#         if 'password' in data:
#             lecturer.set_password(data['password']) # Use set_password method
#         if 'department' in data:
#             lecturer.department = data['department']
#         
#         db.session.commit()
#         return jsonify({"message": "Lecturer updated successfully", "lecturer": lecturer.to_dict()}), 200
#     except Exception as e:
#         db.session.rollback()
#         return jsonify({"message": f"An error occurred: {str(e)}"}), 500
#
# @lecturers_bp.route('/<string:lecturer_id>', methods=['DELETE'])
# @jwt_required()
# def delete_lecturer(lecturer_id):
#     is_admin, error_response, status_code = admin_required()
#     if not is_admin:
#         return error_response, status_code
#     
#     lecturer = Lecturer.query.get_or_404(lecturer_id)
#     
#     try:
#         db.session.delete(lecturer)
#         db.session.commit()
#         return jsonify({"message": "Lecturer deleted successfully"}), 200
#     except Exception as e:
#         db.session.rollback()
#         return jsonify({"message": f"An error occurred: {str(e)}"}), 500
