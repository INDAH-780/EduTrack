from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models.attendance_records import AttendanceRecord
from models.courses import Course
from models.students import Student
from models.lecturers import Lecturer
from models.enrollments import Enrollment
from extensions import db
from sqlalchemy import func
import csv
from io import StringIO
from datetime import datetime, timedelta

reports_bp = Blueprint('reports', __name__)

@reports_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_stats():
    total_students = Student.query.count()
    total_lecturers = Lecturer.query.count()
    total_courses = Course.query.count()
    total_attendance = AttendanceRecord.query.count()
    present_count = AttendanceRecord.query.filter_by(status='PRESENT').count()
    attendance_rate = round((present_count / total_attendance * 100), 1) if total_attendance > 0 else 0
    return jsonify({
        'total_students': total_students,
        'total_lecturers': total_lecturers,
        'total_courses': total_courses,
        'total_attendance_records': total_attendance,
        'attendance_rate': attendance_rate
    }), 200


@reports_bp.route('/chart/by-course', methods=['GET'])
@jwt_required()
def chart_by_course():
    courses = Course.query.all()
    data = []
    for course in courses:
        present = AttendanceRecord.query.filter_by(course_code=course.course_code, status='PRESENT').count()
        absent = AttendanceRecord.query.filter_by(course_code=course.course_code, status='ABSENT').count()
        if present + absent > 0:
            data.append({
                'course': course.course_code,
                'course_name': course.course_name,
                'present': present,
                'absent': absent
            })
    return jsonify(data), 200


@reports_bp.route('/chart/daily-trend', methods=['GET'])
@jwt_required()
def chart_daily_trend():
    days = int(request.args.get('days', 14))
    today = datetime.utcnow().date()
    start_date = today - timedelta(days=days - 1)

    results = db.session.query(
        AttendanceRecord.date,
        AttendanceRecord.status,
        func.count(AttendanceRecord.attendance_id)
    ).filter(
        AttendanceRecord.date >= start_date
    ).group_by(
        AttendanceRecord.date,
        AttendanceRecord.status
    ).all()

    trend = {}
    for i in range(days):
        d = (start_date + timedelta(days=i)).isoformat()
        trend[d] = {'date': d, 'present': 0, 'absent': 0}

    for date, status, count in results:
        key = date.isoformat()
        if key in trend:
            if status == 'PRESENT':
                trend[key]['present'] = count
            elif status == 'ABSENT':
                trend[key]['absent'] = count

    return jsonify(list(trend.values())), 200

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