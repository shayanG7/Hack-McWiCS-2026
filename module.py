# Object

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

# initialize
db = SQLAlchemy()

user_group_association = db.Table('user_group_association',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id')),
    db.Column('group_id', db.Integer, db.ForeignKey('news_group.id'))
)

# User
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128)) 
    pfp = db.Column(db.String(255), default='default.jpg') 
    
    
    posts = db.relationship('Post', backref='author', lazy=True)
    

    groups = db.relationship('NewsGroup', secondary=user_group_association, backref='members', lazy='dynamic')

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'pfp': self.pfp
        }

# Groups
class NewsGroup(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50)) # interests/tags
    prompt_of_the_week = db.Column(db.Text) # Prompt
    
    # Post 
    posts = db.relationship('Post', backref='group', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'category': self.category,
            'prompt': self.prompt_of_the_week
        }

# Post
class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    group_id = db.Column(db.Integer, db.ForeignKey('news_group.id'), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'author': self.author.username,
            'timestamp': self.timestamp.isoformat()
        }
    
    