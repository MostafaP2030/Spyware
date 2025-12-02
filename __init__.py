# __init__.py
from .config import Config
from flask import Flask
from datetime import timedelta
import secrets
from .models import db
from .utils import inject_terminal_path  # اضافه شد

# ساخت اپ اصلی
app = Flask(__name__)
app.secret_key = secrets.token_hex(32)
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=1)

app.config.from_object(Config)
db.init_app(app)

# اضافه کردن Context Processor (این خط خیلی مهمه!)
app.context_processor(inject_terminal_path)

with app.app_context():
    db.create_all()

# ثبت مسیرها
from .routes.main_routes import main_bp
from .routes.auth_routes import auth_bp
from .routes.terminal_routes import terminal_bp

app.register_blueprint(main_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(terminal_bp)