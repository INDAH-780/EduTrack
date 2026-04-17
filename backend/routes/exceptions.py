from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.attendance_exceptions import AttendanceException
from models.attendance_records import AttendanceRecord
from models.admins import Admin
# from app import db
from extensions import db
from datetime import datetime

exceptions_bp = Blueprint('exceptions', __name__)

@exceptions_bp.route('/', methods=['POST'])
@jwt_required()
def create_exception():
    data = request.get_json()
    
    # Verify attendance record exists
    attendance_record = AttendanceRecord.query.get(data['attendance_id'])
    if not attendance_record:
        return jsonify({'error': 'Attendance record not found'}), 404
    
    exception = AttendanceException(
        attendance_id=data['attendance_id'],
        reason=data['reason'],
        updated_status=data['updated_status'],
        approved_by=None,  # Initially not approved
        approval_date=None
    )
    
    db.session.add(exception)
    db.session.commit()
    return jsonify(exception.to_dict()), 201

@exceptions_bp.route('/<int:exception_id>/approve', methods=['PUT'])
@jwt_required()
def approve_exception(exception_id):
    current_user_id = get_jwt_identity()['id']
    
    # Verify admin exists
    admin = Admin.query.get(current_user_id)
    if not admin:
        return jsonify({'error': 'Only admins can approve exceptions'}), 403
    
    exception = AttendanceException.query.get_or_404(exception_id)
    
    # Update attendance record
    attendance_record = AttendanceRecord.query.get(exception.attendance_id)
    attendance_record.status = exception.updated_status
    
    # Update exception
    exception.approved_by = current_user_id
    exception.approval_date = datetime.now()
    
    db.session.commit()
    return jsonify({
        'message': 'Exception approved successfully',
        'exception': exception.to_dict(),
        'attendance_record': attendance_record.to_dict()
    }), 200

@exceptions_bp.route('/pending', methods=['GET'])
@jwt_required()
def get_pending_exceptions():
    exceptions = AttendanceException.query.filter_by(approved_by=None).all()
    return jsonify([exception.to_dict() for exception in exceptions]), 200