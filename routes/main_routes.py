# main_routes.py
from flask import Blueprint, render_template, jsonify, request, session, send_from_directory, redirect, url_for
from ..models import User, Profile, db

main_bp = Blueprint('main', __name__, template_folder='templates')

# تابع مشترک برای چک کردن کاربر (یک بار تعریف بشه)
def get_current_user():
    user_id = session.get('user_id')
    token = session.get('session_token')
    
    if not user_id or not token:
        return None
    
    user = User.query.get(user_id)
    if user and user.session_token == token:
        return user
    return None

# --- Middleware برای همه روت‌ها ---
@main_bp.before_request
def require_login():
    if request.endpoint in ['static', 'main.service_worker', 'main.ping']:
        return  # این‌ها نیاز به لاگین ندارن
    if not get_current_user():
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify({'refresh': True, 'redirect': '/form'}), 200
        return redirect('/form')

# --- روت‌ها ---
@main_bp.route('/')
def index():
    user = get_current_user()
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return jsonify({
            'content': render_template('home.html', user=user),
            'css': ['/static/css/home.css'],
            'js': ['/static/js/home.js']
        })
    return render_template('base.html')

@main_bp.route('/home')
def home():
    user = get_current_user()
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return jsonify({
            'content': render_template('home.html', user=user),
            'css': ['/static/css/home.css'],
            'js': ['/static/js/home.js']
        })
    return render_template('base.html')

@main_bp.route('/profile')
def profile():
    user = get_current_user()
    profile = Profile.query.filter_by(user_id=user.id).first() if user else None
    url = f"http://127.0.0.1:5000/api/user/{profile.inbox_token}/inbox" 

    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return jsonify({
            'content': render_template('profile.html', url = url, name = "Mostafa", email="ex.gmail.com"),
            'css': ['/static/css/profile.css'],
            'js': ['/static/js/profile.js']
        })
    return render_template('base.html')

@main_bp.route('/photo')
def photo():
    user = get_current_user()
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return jsonify({
            'content': render_template('photo.html', user=user),
            'css': ['/static/css/photo.css'],
            'js': ['/static/js/photo.js']
        })
    return render_template('base.html')

@main_bp.route('/setting')
def setting():
    user = get_current_user()
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return jsonify({
            'content': render_template('setting.html', user=user),
            'css': ['/static/css/setting.css'],
            'js': ['/static/js/setting.js']
        })
    return render_template('base.html')

# --- فایل‌های استاتیک ---
@main_bp.route('/sw.js')
def service_worker():
    return send_from_directory('static/js', 'sw.js')

@main_bp.route('/ping')
def ping():
    return "ok", 200