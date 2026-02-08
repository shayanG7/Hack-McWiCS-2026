from datetime import datetime
from flask import request
from module import db
from werkzeug.security import generate_password_hash, check_password_hash

class User:
    def __init__(self, username: str, email: str, password_hash: str, pfp='default.jpg'):
        self.username = str(username)
        self.email = str(email)
        self.password_hash = str(password_hash)
        self.pfp = pfp
        self.id = None  # This will be set when the user is added to the database

    @classmethod
    def from_form(cls):
        """Retrieve username, email, and password from a webpage form submission
        and return a new User instance."""
        username = request.form.get('username', '')
        email = request.form.get('email', '')
        password = request.form.get('password', '')
        id = request.form.get('id', None)  # for updating existing users
        # encrypt password  
        hashed_password = generate_password_hash(password)
        
        user = cls(username=username, email=email, password_hash=hashed_password)
        user.id = id  # Set the ID if it exists (for updating existing users)
        return user
    
    # ____Password_____
    def set_password(self, raw_password):
        if not raw_password:
            raise ValueError("Password required")
        self.password_hash = generate_password_hash(raw_password)

    def check_password(self, raw_password):
        return check_password_hash(self.password_hash, raw_password)

    # Not implemented yet...
    def change_password(self, old_pw, new_pw):
        if not self.check_password(old_pw):
            raise ValueError("Wrong password!")
        self.set_password(new_pw)
    
    #____Profile_____ (No UI for this yet...)
    def update_email(self, new_email):
        new_email = (new_email or "").strip().lower()
        if "@" not in new_email or "." not in new_email.split("@")[-1]:
            return False
        self.email = new_email
        return True
    
    def update_pfp(self, new_pfp_url):
        if not new_pfp_url:
            return False
        self.pfp = new_pfp_url
        return True

    """
    def record_login(self):
        self.last_login_at = datetime.utcnow()
    """
    
    def to_dict(self):
        return {
            'username': self.username,
            'pfp': self.pfp,
            'id': self.id
        }