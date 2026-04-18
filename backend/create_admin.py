
import os
import uuid
from app import create_app 
from extensions import db  
from models.admins import Admin 

from dotenv import load_dotenv
load_dotenv()

def create_initial_admin(admin_id, email, password, name):
    """Creates an initial admin user."""
    app = create_app() 
    with app.app_context(): 
        existing_admin = Admin.query.filter_by(email=email).first()
        if existing_admin:
            print(f"Admin with email '{email}' already exists. Skipping creation.")
            return existing_admin
        new_admin = Admin(
            admin_id=admin_id,
            email=email,
            name=name
        )
        
        new_admin.set_password(password)
        db.session.add(new_admin)
        db.session.commit()

        print(f"Admin user '{email}' created successfully with ID: {admin_id}!")
        return new_admin

if __name__ == '__main__':
    admin_email = input("Enter admin email: ")
    admin_password = input("Enter admin password: ")
    admin_name = input("Enter admin name: ") 

    if admin_email and admin_password and admin_name:
        generated_admin_id = str(uuid.uuid4())
        create_initial_admin(generated_admin_id, admin_email, admin_password, admin_name)
    else:
        print("Admin email, password, and name cannot be empty.")

