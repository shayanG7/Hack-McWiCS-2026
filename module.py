# Object

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
import google.genai as genai

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
    
    # Relationships
    posts = db.relationship('Post', backref='author', lazy=True)
    groups = db.relationship('NewsGroup', secondary=user_group_association, backref='members', lazy='dynamic')

    # Password management
    def set_password(self, raw_password):
        if not raw_password:
            raise ValueError("password required")
        self.password_hash = generate_password_hash(raw_password)

    def check_password(self, raw_password):
        return check_password_hash(self.password_hash, raw_password)

    # Alternative for get_all_groups() that returns a list of dictionaries instead of objects
    def get_joined_groups_data(self):
        """Returns a list of dictionaries for all groups this user has joined."""
        # 'self.groups' works because of the relationship defined in module.py
        return [group.to_dict() for group in self.groups.all()] #

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
    
    # Relationship with posts
    posts = db.relationship('Post', backref='group', lazy=True)

    # Member management methods (Not implemented yet...)
    def add_member(self, user):
        """Add a user to a group."""
        if user in self.members:
            return False  # User already in group
        self.members.append(user)
        db.session.commit()
        return True


    def remove_member(self, user):
        """Remove a user from a group."""
        if user not in self.members:
            return False  # User not in group
        self.members.remove(user)
        db.session.commit()
        return True

    # Analytics methods
    def get_member_count(self):
        """Get the number of members in the group."""
        return len(self.members)

    # Not imiplemented yet...
    def get_post_count(self):
        """Get the number of posts in the group."""
        return len(self.posts)

    # Get all posts in the group, ordered by most recent        
    def get_all_posts(self):
        """Get all posts in the group, ordered by most recent."""
        from module import Post
        return Post.query.filter_by(group_id=self.id).order_by(Post.timestamp.desc()).all()

    def to_dict(self, include_members=False, include_posts=False):
        result = {
            'id': self.id,
            'name': self.name,
            'category': self.category,
            'prompt': self.prompt_of_the_week,
            'member_count': self.get_member_count(), # Automatically included
            'post_count': self.get_post_count()      # Automatically included
        }
        if include_members:
            result['members'] = [member.to_dict() for member in self.members]
        if include_posts:
            result['posts'] = [post.to_dict() for post in self.get_all_posts()]
        return result
    
    # Consider removing this
    def to_summary(self):
        """Return a summary string representation of the group."""
        return f"{self.name} ({self.category}) - {len(self.members)} members, {len(self.posts)} posts"
    
    def set_prompt(self):
        """Generate and set a weekly prompt for the group using Gemini AI."""
        from backend.weekly_prompt import generate_weekly_prompt
        new_prompt = generate_weekly_prompt(self.category, self.name)
        
        # Only update if we actually got a valid response back
        if new_prompt:
            self.prompt_of_the_week = new_prompt
            db.session.commit()
            
        return self.prompt_of_the_week

# Post
class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False) # Author
    group_id = db.Column(db.Integer, db.ForeignKey('news_group.id'), nullable=False)

    
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
    
    # Not implemented yet...
    def edit_content(self, new_content=None, new_title=None):
        """Edit the content and title of the post with validation."""
        if new_content is not None:
            self.content = new_content
        if new_title is not None:
            self.title = new_title
        self.timestamp = datetime.utcnow()
        db.session.commit()
    
    # Confirm with team if this is the functionality of Clear button
    @classmethod
    def delete_all_in_group(cls, group_id):
        """Deletes all posts associated with a specific group ID."""
        try:
            # Efficiently delete all matching rows in one query
            cls.query.filter_by(group_id=group_id).delete()
            db.session.commit()
            return True
        except Exception as e:
            db.session.rollback()
            print(f"Error deleting posts: {e}")
            return False
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'author': self.author.username,
            'timestamp': self.timestamp.isoformat(),
        }