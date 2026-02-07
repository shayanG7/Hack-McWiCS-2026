from datetime import datetime
from flask import request
from module import db

class User:
    def __init__(self, username: str, email: str, password_hash: str, pfp='default.jpg'):
        self.username = str(username)
        self.email = str(email)
        self.password_hash = str(password_hash)
        self.pfp = pfp

    @classmethod
    def from_form(cls):
        """Retrieve username, email, and password from a webpage form submission
        and return a new User instance."""
        username = request.form.get('username', '')
        email = request.form.get('email', '')
        password = request.form.get('password', '')
        return cls(username=username, email=email, password_hash=password)
