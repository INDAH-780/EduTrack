from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt
from datetime import time, datetime # Import time for time objects, datetime for current date/time

from extensions import db
from models.class_schedules import ClassSchedule # Import your ClassSchedule model
from models.courses import Course # To verify course existence

class_schedules_bp = Blueprint('class_schedules', __name__)

# --- Helper to enforce Admin/Lecturer access (adjust as needed for your app's roles) ---
def admin_or_lecturer_required():
    """Helper to check if the current authenticated user is an admin or lecturer."""
    claims = get_jwt()
    user_type = claims.get('user_type')
    if user_type not in ['admin', 'lecturer']:
        return False, jsonify({"message": "Admin or Lecturer access required"}), 403
    return True, None, None

@class_schedules_bp.route('/', methods=['POST'])
@jwt_required() # Requires a valid JWT token
def create_class_schedule():
    # --- Enforce Admin/Lecturer access for creating schedules ---
    is_authorized, error_response, status_code = admin_or_lecturer_required()
    if not is_authorized:
        return error_response, status_code

    data = request.get_json()
    course_code = data.get('course_code')
    day_of_week = data.get('day_of_week')
    start_time_str = data.get('start_time') # e.g., "09:00"
    end_time_str = data.get('end_time')     # e.g., "10:00"
    location = data.get('location')

    # Basic input validation
    if not course_code or not day_of_week or not start_time_str or not end_time_str or not location:
        return jsonify({"message": "Course code, day, start time, end time, and location are required"}), 400
    
    try:
        # Validate day of week (optional, but good practice)
        valid_days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        if day_of_week not in valid_days:
            return jsonify({"message": "Invalid day of week. Must be one of: " + ", ".join(valid_days)}), 400

        # Convert time strings to datetime.time objects
        start_time = datetime.strptime(start_time_str, '%H:%M').time()
        end_time = datetime.strptime(end_time_str, '%H:%M').time()

        if start_time >= end_time:
            return jsonify({"message": "Start time must be before end time"}), 400

        # Verify course exists
        course = Course.query.get(course_code)
        if not course:
            return jsonify({'message': 'Course not found'}), 404

        # Optional: Check for overlapping schedules for the same course/location/day
        # This would require more complex queries and is beyond the scope of this initial setup
        
        new_schedule = ClassSchedule(
            course_code=course_code,
            day_of_week=day_of_week,
            start_time=start_time,
            end_time=end_time,
            location=location
        )
        
        db.session.add(new_schedule)
        db.session.commit()

        return jsonify({
            "message": "Class schedule created successfully",
            "schedule": new_schedule.to_dict()
        }), 201 # Created

    except ValueError as e:
        current_app.logger.error(f"Time parsing error: {e}")
        return jsonify({"message": f"Invalid time format. Expected HH:MM. Error: {str(e)}"}), 400
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error creating class schedule: {e}")
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500

@class_schedules_bp.route('/', methods=['GET'])
@jwt_required()
def get_all_class_schedules():
    # Optional: Restrict access if needed
    try:
        schedules = ClassSchedule.query.all()
        return jsonify([schedule.to_dict() for schedule in schedules]), 200
    except Exception as e:
        current_app.logger.error(f"Error fetching class schedules: {e}")
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500

@class_schedules_bp.route('/<int:schedule_id>', methods=['GET'])
@jwt_required()
def get_class_schedule_by_id(schedule_id):
    try:
        schedule = ClassSchedule.query.get_or_404(schedule_id)
        return jsonify(schedule.to_dict()), 200
    except Exception as e:
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500

# Add PUT and DELETE routes for class schedules as needed
# @class_schedules_bp.route('/<int:schedule_id>', methods=['PUT'])
# @jwt_required()
# def update_class_schedule(schedule_id):
#     is_authorized, error_response, status_code = admin_or_lecturer_required()
#     if not is_authorized:
#         return error_response, status_code
#
#     schedule = ClassSchedule.query.get_or_404(schedule_id)
#     data = request.get_json()
#
#     try:
#         if 'course_code' in data:
#             course = Course.query.get(data['course_code'])
#             if not course:
#                 return jsonify({'message': 'Course not found'}), 404
#             schedule.course_code = data['course_code']
#         if 'day_of_week' in data:
#             schedule.day_of_week = data['day_of_week']
#         if 'start_time' in data:
#             schedule.start_time = datetime.strptime(data['start_time'], '%H:%M').time()
#         if 'end_time' in data:
#             schedule.end_time = datetime.strptime(data['end_time'], '%H:%M').time()
#         if 'location' in data:
#             schedule.location = data['location']
#
#         db.session.commit()
#         return jsonify({"message": "Class schedule updated successfully", "schedule": schedule.to_dict()}), 200
#     except ValueError as e:
#         return jsonify({"message": f"Invalid time format. Expected HH:MM. Error: {str(e)}"}), 400
#     except Exception as e:
#         db.session.rollback()
#         return jsonify({"message": f"An error occurred: {str(e)}"}), 500
#
# @class_schedules_bp.route('/<int:schedule_id>', methods=['DELETE'])
# @jwt_required()
# def delete_class_schedule(schedule_id):
#     is_authorized, error_response, status_code = admin_or_lecturer_required()
#     if not is_authorized:
#         return error_response, status_code
#
#     schedule = ClassSchedule.query.get_or_404(schedule_id)
#
#     try:
#         db.session.delete(schedule)
#         db.session.commit()
#         return jsonify({"message": "Class schedule deleted successfully"}), 200
#     except Exception as e:
#         db.session.rollback()
#         return jsonify({"message": f"An error occurred: {str(e)}"}), 500
