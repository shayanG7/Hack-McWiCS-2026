def __init__(self, title, content, user_id, group_id):
        """Initialize a new post with validation."""
        self.title = title
        self.content = content
        self.user_id = user_id
        self.group_id = group_id
        self.timestamp = datetime.utcnow()

# Updates Post with optional new content and title, and updates the timestamp
def edit_content(self, new_content=None, new_title=None):
    """Edit the content and title of the post with validation."""
    if new_content is not None:
        self.content = new_content
    if new_title is not None:
        self.title = new_title
    self.timestamp = datetime.utcnow()  # Update timestamp on edit
    db.session.commit()

 # Create and publish new posts
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

# Serialize Post to dictionary for JSON responses
def to_dict(self):
    """Convert the Post instance to a dictionary for JSON serialization."""
    return {
        'id': self.id,
        'title': self.title,
        'content': self.content,
        'author': self.author.username,
        'timestamp': self.timestamp.isoformat(),
    }