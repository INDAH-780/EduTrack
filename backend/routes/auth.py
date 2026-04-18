# from flask import Blueprint, request, jsonify
# from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, unset_jwt_cookies, get_jwt

# # Import your authentication utilities
# from utils.auth import authenticate_admin, authenticate_lecturer

# # Import models for the /me endpoint
# from models.admins import Admin
# from models.lecturers import Lecturer

# auth_bp = Blueprint('auth', __name__)

# @auth_bp.route('/login', methods=['POST'])
# def login():
#     data = request.get_json()
#     username = data.get('username')
#     password = data.get('password')
#     user_type = data.get('user_type') # Expected: 'admin' or 'lecturer'

#     # Basic input validation
#     if not username or not password or not user_type:
#         return jsonify({"message": "Username, password, and user_type are required"}), 400
    
#     user = None # Initialize user to None
#     token_identity = None # This will be the string/int for JWT identity
#     additional_claims = {} # Dictionary for extra data in JWT

#     # Authenticate based on user_type
#     if user_type == 'admin':
#         # authenticate_admin already verifies the password hash.
#         # If it returns a user, credentials are valid.
#         user = authenticate_admin(username, password)
#         if user:
#             # Set identity to the admin's ID (which is a string UUID)
#             token_identity = user.admin_id
#             # Add user_type to additional claims
#             additional_claims['user_type'] = 'admin'
        
#     elif user_type == 'lecturer':
#         # authenticate_lecturer already verifies the password hash.
#         # If it returns a user, credentials are valid.
#         user = authenticate_lecturer(username, password)
#         if user:
#             # Set identity to the lecturer's ID (assuming it's a string UUID)
#             token_identity = user.lecturer_id
#             # Add user_type to additional claims
#             additional_claims['user_type'] = 'lecturer'
    
#     # If a user was successfully authenticated (user is not None)
#     if user and token_identity:
#         # Create access token with a string identity and additional claims
#         access_token = create_access_token(identity=token_identity, additional_claims=additional_claims)
#         # Return token and user info (using to_dict() if available on model)
#         return jsonify({
#             'access_token': access_token, 
#             'user_type': user_type, 
#             'user': user.to_dict() # Assuming to_dict() method exists on Admin/Lecturer models
#         }), 200
#     else:
#         # If the user_type was not 'admin' or 'lecturer',
#         # or if authentication failed for the specified type
#         return jsonify({'message': 'Invalid credentials or user type'}), 401

# @auth_bp.route('/logout', methods=['POST'])
# @jwt_required() # Requires a valid JWT to access this endpoint
# def logout():
#     # Remove the JWT cookie or otherwise invalidate the token (e.g., in a blocklist)
#     # For simplicity, unset_jwt_cookies removes the standard JWT cookies.
#     # For a full blocklist implementation, you'd add the JTI to a database/cache.
#     response = jsonify({"message": "Successfully logged out"})
#     unset_jwt_cookies(response)
#     return response, 200

# @auth_bp.route('/me', methods=['GET'])
# @jwt_required() # Requires a valid JWT to access this endpoint
# def me():
#     # Get the identity from the current JWT (this is the admin_id or lecturer_id string)
#     current_user_id = get_jwt_identity()
#     # Get the full JWT payload, which includes our custom 'user_type' claim
#     claims = get_jwt()
#     current_user_type = claims.get('user_type')

#     user_data = None
#     if current_user_type == 'admin':
#         user_data = Admin.query.get(current_user_id)
#     elif current_user_type == 'lecturer':
#         user_data = Lecturer.query.get(current_user_id)
    
#     if user_data:
#         # Return the user's public details
#         return jsonify(user_data.to_dict()), 200
#     else:
#         # This case should ideally not happen if token is valid and user exists in DB
#         return jsonify({"message": "User not found"}), 404


from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, unset_jwt_cookies, get_jwt
import secrets
import hashlib
from datetime import datetime, timedelta

from utils.auth import authenticate_admin, authenticate_lecturer
from models.admins import Admin
from models.lecturers import Lecturer
from extensions import db

auth_bp = Blueprint('auth', __name__)

# In-memory store for reset tokens: { hashed_token: { 'email': ..., 'user_type': ..., 'expires': ... } }
# For production, store these in the database instead
_reset_tokens: dict = {}


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"message": "Username and password are required"}), 400
    
    user = None
    token_identity = None
    user_type = None
    additional_claims = {}

    user = authenticate_admin(username, password)
    if user:
        user_type = 'admin'
        token_identity = user.admin_id
        additional_claims['user_type'] = 'admin'
    else:
        user = authenticate_lecturer(username, password)
        if user:
            user_type = 'lecturer'
            token_identity = user.lecturer_id
            additional_claims['user_type'] = 'lecturer'
    
    if user and token_identity and user_type:
        access_token = create_access_token(identity=token_identity, additional_claims=additional_claims)
        return jsonify({
            'access_token': access_token,
            'user_type': user_type,
            'user': user.to_dict()
        }), 200
    else:
        return jsonify({'message': 'Invalid credentials'}), 401


@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    response = jsonify({"message": "Successfully logged out"})
    unset_jwt_cookies(response)
    return response, 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    current_user_id = get_jwt_identity()
    claims = get_jwt()
    current_user_type = claims.get('user_type')

    user_data = None
    if current_user_type == 'admin':
        user_data = Admin.query.get(current_user_id)
    elif current_user_type == 'lecturer':
        user_data = Lecturer.query.get(current_user_id)
    
    if user_data:
        return jsonify(user_data.to_dict()), 200
    else:
        return jsonify({"message": "User not found"}), 404


@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    email = data.get('email')

    if not email:
        return jsonify({"message": "Email is required"}), 400

    # Check admins first, then lecturers
    user = Admin.query.filter_by(email=email).first()
    user_type = 'admin'
    if not user:
        user = Lecturer.query.filter_by(email=email).first()
        user_type = 'lecturer'

    # Always return 200 even if email not found — prevents email enumeration
    if not user:
        return jsonify({"message": "If that email exists, a reset token has been generated."}), 200

    # Generate a secure random token
    raw_token = secrets.token_urlsafe(32)
    hashed = hashlib.sha256(raw_token.encode()).hexdigest()

    # Store hashed token with expiry (15 minutes)
    _reset_tokens[hashed] = {
        'email': email,
        'user_type': user_type,
        'expires': datetime.utcnow() + timedelta(minutes=15)
    }

    # In production: send raw_token via email
    # For now: return it directly in the response
    return jsonify({
        "message": "Password reset token generated. Use it within 15 minutes.",
        "reset_token": raw_token  # Remove this line in production and send via email instead
    }), 200


@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    token = data.get('token')
    new_password = data.get('new_password')

    if not token or not new_password:
        return jsonify({"message": "Token and new password are required"}), 400

    if len(new_password) < 6:
        return jsonify({"message": "Password must be at least 6 characters"}), 400

    hashed = hashlib.sha256(token.encode()).hexdigest()
    token_data = _reset_tokens.get(hashed)

    if not token_data:
        return jsonify({"message": "Invalid or expired reset token"}), 400

    if datetime.utcnow() > token_data['expires']:
        _reset_tokens.pop(hashed, None)
        return jsonify({"message": "Reset token has expired. Please request a new one."}), 400

    email = token_data['email']
    user_type = token_data['user_type']

    if user_type == 'admin':
        user = Admin.query.filter_by(email=email).first()
    else:
        user = Lecturer.query.filter_by(email=email).first()

    if not user:
        return jsonify({"message": "User not found"}), 404

    user.set_password(new_password)
    db.session.commit()

    # Invalidate the token after use
    _reset_tokens.pop(hashed, None)

    return jsonify({"message": "Password reset successfully. You can now log in."}), 200