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

# Import your authentication utilities
from utils.auth import authenticate_admin, authenticate_lecturer

# Import models for the /me endpoint (and for clarity in login logic, though not strictly required if using auth utils)
from models.admins import Admin
from models.lecturers import Lecturer

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    # REMOVED: user_type = data.get('user_type') # User confirms this should NOT be in the request body

    # Basic input validation
    if not username or not password:
        return jsonify({"message": "Username and password are required"}), 400
    
    user = None # Initialize user to None
    token_identity = None # This will be the string/int for JWT identity
    user_type = None # This will store the determined user type
    additional_claims = {} # Dictionary for extra data in JWT

    # --- UPDATED AUTHENTICATION LOGIC: Try Admin, then Lecturer (dynamic role determination) ---
    # 1. Try to authenticate as an Admin
    user = authenticate_admin(username, password)
    if user:
        user_type = 'admin'
        token_identity = user.admin_id
        additional_claims['user_type'] = 'admin'
    else:
        # 2. If not an Admin, try to authenticate as a Lecturer
        user = authenticate_lecturer(username, password)
        if user:
            user_type = 'lecturer'
            token_identity = user.lecturer_id
            additional_claims['user_type'] = 'lecturer'
    
    # If a user was successfully authenticated (user is not None)
    if user and token_identity and user_type: # Ensure all determined correctly
        # Create access token with a string identity and additional claims
        access_token = create_access_token(identity=token_identity, additional_claims=additional_claims)
        
        # Return token, determined user_type, and user info
        return jsonify({
            'access_token': access_token, 
            'user_type': user_type,      # Now dynamically determined by backend
            'user': user.to_dict()       # Assuming to_dict() method exists on Admin/Lecturer models
        }), 200
    else:
        # If no user found or authentication failed for both types
        return jsonify({'message': 'Invalid credentials'}), 401

@auth_bp.route('/logout', methods=['POST'])
@jwt_required() # Requires a valid JWT to access this endpoint
def logout():
    response = jsonify({"message": "Successfully logged out"})
    unset_jwt_cookies(response)
    return response, 200

@auth_bp.route('/me', methods=['GET'])
# Removed duplicate @jwt_bp.route('/me', methods=['GET'])
@jwt_required() # Requires a valid JWT to access this endpoint
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

