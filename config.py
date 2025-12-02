import secrets
from datetime import timedelta
import os

file_dir1 = os.path.dirname(__file__)
file_dir = os.path.dirname(os.path.abspath(__file__))

goal_route = os.path.join(file_dir , "info.db")

class Config:
    SECRET_KEY = secrets.token_hex(32)
    PERMANENT_SESSION_LIFETIME = timedelta(days=1)
    SQLALCHEMY_DATABASE_URI = "sqlite:///" + goal_route
    SQLALCHEMY_TRACK_MODIFICATIONS = False


