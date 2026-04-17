# from app import db
from extensions import db 

class AttendanceException(db.Model):
    __tablename__ = 'attendance_exceptions'
    
    exception_id = db.Column(db.Integer, primary_key=True)
    attendance_id = db.Column(db.Integer, db.ForeignKey('attendance_records.attendance_id'), nullable=False)
    reason = db.Column(db.Text, nullable=False)
    updated_status = db.Column(db.String(10), nullable=False)  # 'PRESENT' or 'ABSENT'
    approved_by = db.Column(db.String(50), db.ForeignKey('admins.admin_id'))
    approval_date = db.Column(db.DateTime)
    
    attendance_record = db.relationship('AttendanceRecord', backref='exception', lazy=True)
    admin = db.relationship('Admin', backref='approved_exceptions', lazy=True)
    
    def to_dict(self):
        return {
            'exception_id': self.exception_id,
            'attendance_id': self.attendance_id,
            'reason': self.reason,
            'updated_status': self.updated_status,
            'approved_by': self.approved_by,
            'approval_date': self.approval_date.isoformat() if self.approval_date else None,
            'admin_name': self.admin.name if self.admin else None
        }