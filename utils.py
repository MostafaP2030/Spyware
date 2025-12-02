# utils.py
from flask import session
from .models import User, Profile

# utils.py — فقط این تابع رو جایگزین کن
def inject_terminal_path():
    user_id = session.get('user_id')
    session_token = session.get('session_token')

    if not user_id or not session_token:
        return dict(initial_route=None)

    user = User.query.get(user_id)
    if not user or user.session_token != session_token:
        return dict(initial_route=None)

    profile = Profile.query.filter_by(user_id=user.id).first()
    if not profile or not profile.current_directory:
        path = r"C:\User>"  # r-string برای جلوگیری از مشکل
    else:
        base = profile.current_directory.strip()
        if not base.endswith("\\"):
            base += "\\"
        path = base + ">"

    # فقط یک بار اسکیپ کن — نه دو بار!
    safe_path = path.replace("\\", "\\\\")
    
    return dict(initial_route=safe_path)