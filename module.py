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
    #is_published = db.Column(db.Boolean, default=False) # Draft or Published

    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False) # Author
    group_id = db.Column(db.Integer, db.ForeignKey('news_group.id'), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'author': self.author.username,
            'timestamp': self.timestamp.isoformat(),
          #  'is_published': self.is_published
        }
    
    @classmethod
    def create(cls, title, content, user_id, group_id):
        """Create and publish a new post."""
        post = cls(
            title=title,
            content=content,
            user_id=user_id,
            group_id=group_id
        )
        db.session.add(post)
        db.session.commit()
        return post
    
    def edit_content(self, new_content=None, new_title=None):
        """Edit the content and title of the post with validation."""
        if new_content is not None:
            self.content = new_content
        if new_title is not None:
            self.title = new_title
        self.timestamp = datetime.utcnow()
        db.session.commit()
    
    