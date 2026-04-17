# models/lecturers.py
from extensions import db
from werkzeug.security import generate_password_hash, check_password_hash # <<< Make sure these are imported!

class Lecturer(db.Model):
    __tablename__ = 'lecturers'
    lecturer_id = db.Column(db.String(50), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False) # <<< Make sure this column is defined!
    department = db.Column(db.String(100), nullable=True) # Assuming this is in your DB schema

    # <<< CRITICAL: Ensure these methods are present and uncommented! >>>
    def set_password(self, plaintext_password):
        """Hashes the plaintext password and sets it to the 'password' column."""
        self.password = generate_password_hash(plaintext_password)
    
    def check_password(self, plaintext_password):
        """Checks a plaintext password against the stored hash."""
        return check_password_hash(self.password, plaintext_password)
    # <<< End of critical methods >>>

    def to_dict(self):
        """Converts the lecturer object to a dictionary for API responses."""
        return {
            'lecturer_id': self.lecturer_id,
            'name': self.name,
            'email': self.email,
            'department': self.department # Include if exists
        }
    
    def __repr__(self):
        return f'<Lecturer {self.email}>'
