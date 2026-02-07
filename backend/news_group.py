from backend.user import User


class NewsGroup:
    def __init__(self, group_name: str, category: str, users: list = None):
        self.group_name = str(group_name)
        self.category = str(category)
        self.users = users if users is not None else []

    def add_user(self, user: User):
        """Add a user to the group."""
        if user not in self.users:
            self.users.append(user)

    def remove_user(self, user: User):
        """Remove a user from the group."""
        if user in self.users:
            self.users.remove(user)
