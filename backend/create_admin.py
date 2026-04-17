# create_admin.py
import os
import uuid # To generate a unique admin_id
from app import create_app # Import your app factory
from extensions import db  # Import your db instance
from models.admins import Admin # Import your Admin model

# Ensure environment variables are loaded if your config relies on them
from dotenv import load_dotenv
load_dotenv()

def create_initial_admin(admin_id, email, password, name):
    """Creates an initial admin user."""
    app = create_app() # Create an app instance
    with app.app_context(): # Push an application context to interact with the database
        # Check if an admin with this email already exists
        existing_admin = Admin.query.filter_by(email=email).first()
        if existing_admin:
            print(f"Admin with email '{email}' already exists. Skipping creation.")
            return existing_admin

        # Create the new Admin instance with correct column names
        # Pass the plain text password to the set_password method after creation
        new_admin = Admin(
            admin_id=admin_id,
            email=email,
            name=name # 'name' is now a required argument as per your model
        )
        
        # Use the set_password method from the Admin model to hash and set the password
        new_admin.set_password(password)

        # Add to session and commit
        db.session.add(new_admin)
        db.session.commit()

        print(f"Admin user '{email}' created successfully with ID: {admin_id}!")
        return new_admin

if __name__ == '__main__':
    admin_email = input("Enter admin email: ")
    admin_password = input("Enter admin password: ")
    admin_name = input("Enter admin name: ") # 'name' is now required

    if admin_email and admin_password and admin_name:
        # Generate a unique admin_id here
        generated_admin_id = str(uuid.uuid4())
        create_initial_admin(generated_admin_id, admin_email, admin_password, admin_name)
    else:
        print("Admin email, password, and name cannot be empty.")

