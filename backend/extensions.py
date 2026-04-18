# to solve circular path problem
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager

print("--- extensions.py: Instantiating db, migrate, jwt globals ---")
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()