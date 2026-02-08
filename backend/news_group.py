from backend.user import User
from module import db

class NewsGroup:
    def __init__(self, name: str, category: str, prompt_of_the_week: str = None):
        """Initialize a new newsgroup."""
        self.name = str(name)
        self.category = str(category)
        self.prompt_of_the_week = str(prompt_of_the_week) if prompt_of_the_week else None
    
    # Group management methods
    @classmethod
    def create_group(cls, name, category, prompt_of_the_week=None):
        """Create a new newsgroup."""
        from module import NewsGroup
        
        group = NewsGroup(
            name=name,
            category=category,
            prompt_of_the_week=prompt_of_the_week
        )
        db.session.add(group)
        db.session.commit()
        return group

    def update_group_info(self, new_name=None, new_category=None):
        """Update group name or category."""
        if new_name:
            self.name = new_name
        if new_category:
            self.category = new_category
        db.session.commit()

    # Temporary function --> Will be replaced with GeminiAPI
    def set_prompt(self, new_prompt):
        """Set or update the weekly prompt for the group."""
        if not new_prompt:
            return False
        self.prompt_of_the_week = new_prompt
        db.session.commit()
        return True

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

    def get_user_groups(user):
       """Get all groups a user is a member of."""
       return user.groups.all()

    def get_post_count(self):
        """Get the number of posts in the group."""
        return len(self.posts)

    # Get all posts in the group, ordered by most recent        
    def get_all_posts(self):
        """Get all posts in the group, ordered by most recent."""
        from module import Post
        return Post.query.filter_by(group_id=self.id).order_by(Post.timestamp.desc()).all()

    # Delete whichever method is not used in the final version
    def to_dict(self, include_members=False, include_posts=False):
        """Convert newsgroup to dictionary with flexible options."""
        data = {
            'id': self.id,
            'name': self.name,
            'category': self.category,
            'prompt': self.prompt_of_the_week,
            'member_count': self.get_member_count(),
            'post_count': self.get_post_count(),
        }
        
        if include_members:
            data['members'] = [
                {'id': member.id, 'username': member.username}
                for member in self.members
            ]
        
        if include_posts:
            recent_posts = self.get_all_posts()[:10]
            data['recent_posts'] = [post.to_dict() for post in recent_posts]
        
        return data


    def to_summary(self):
        """Return a brief summary of the group."""
        return {
            'id': self.id,
            'name': self.name,
            'category': self.category,
            'member_count': self.get_member_count(),
            'post_count': self.get_post_count()
        }