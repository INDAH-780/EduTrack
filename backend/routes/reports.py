from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models.attendance_records import AttendanceRecord
from models.courses import Course
from app import db
import csv
from io import StringIO

reports_bp = Blueprint('reports', __name__)

@reports_bp.route('/course/<string:course_code>', methods=['GET'])
@jwt_required()
def get_course_report(course_code):
    format = request.args.get('format', 'json')
    
    # Verify course exists
    course = Course.query.get_or_404(course_code)
    
    # Get attendance records
    records = AttendanceRecord.query.filter_by(course_code=course_code).all()
    
    if format == 'csv':
        si = StringIO()
        cw = csv.writer(si)
        
        # Write header
        cw.writerow(['Matricule', 'Name', 'Date', 'Status', 'Timestamp'])
        
        # Write data
        for record in records:
            cw.writerow([
                record.matricule,
                record.student.name,
                record.date.isoformat(),
                record.status,
                record.timestamp.isoformat()
            ])
        
        output = si.getvalue()
        return output, 200, {
            'Content-Type': 'text/csv',
            'Content-Disposition': f'attachment; filename=attendance_report_{course_code}.csv'
        }
    else:
        # Default JSON response
        return jsonify({
            'course_code': course_code,
            'course_name': course.course_name,
            'records': [record.to_dict() for record in records]
        }), 200

@reports_bp.route('/student/<string:matricule>', methods=['GET'])
@jwt_required()
def get_student_report(matricule):
    records = AttendanceRecord.query.filter_by(matricule=matricule).all()
    return jsonify([record.to_dict() for record in records]), 200