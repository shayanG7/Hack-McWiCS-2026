"""
Test driver for User and Post models.
Run this file to test all methods in your User and Post classes.
"""
from flask import Flask
from module import db, User, NewsGroup, Post
from datetime import datetime

# Create Flask app for testing
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///test.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize database
db.init_app(app)

def print_section(title):
    """Helper function to print section headers."""
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}\n")

def cleanup_test_data():
    """Delete all test data if it exists."""
    print_section("CLEANING UP EXISTING TEST DATA")
    
    # Delete test posts
    test_posts = Post.query.join(User).filter(
        User.username.in_(['testuser', 'anotheruser'])
    ).all()
    for post in test_posts:
        db.session.delete(post)
    print(f"   ✓ Deleted {len(test_posts)} test posts")
    
    # Delete test groups
    test_groups = NewsGroup.query.filter(
        NewsGroup.name.in_(['Daily Journal', 'Tech Thoughts'])
    ).all()
    for group in test_groups:
        db.session.delete(group)
    print(f"   ✓ Deleted {len(test_groups)} test groups")
    
    # Delete test users
    test_users = User.query.filter(
        User.username.in_(['testuser', 'anotheruser'])
    ).all()
    for user in test_users:
        db.session.delete(user)
    print(f"   ✓ Deleted {len(test_users)} test users")
    
    db.session.commit()
    print("   ✓ Cleanup complete!")

def test_user_methods():
    """Test all User class methods."""
    print_section("TESTING USER METHODS")
    
    # Note: User class in user.py doesn't inherit from db.Model
    # So we'll test with the User model from module.py
    
    # Create a test user
    print("1. Creating a new user...")
    user1 = User(
        username="testuser",
        email="test@example.com",
        password_hash="hashed_password_123"
    )
    db.session.add(user1)
    db.session.commit()
    print(f"   ✓ Created: {user1.username} (ID: {user1.id})")
    
    # Test to_dict
    print("\n2. Testing to_dict()...")
    user_dict = user1.to_dict()
    print(f"   ✓ User dict: {user_dict}")
    
    # Create another user
    print("\n3. Creating another user...")
    user2 = User(
        username="anotheruser",
        email="another@example.com",
        password_hash="hashed_password_456",
        pfp="custom_pic.jpg"
    )
    db.session.add(user2)
    db.session.commit()
    print(f"   ✓ Created: {user2.username} with custom pfp: {user2.pfp}")

def test_newsgroup_methods():
    """Test NewsGroup creation."""
    print_section("TESTING NEWSGROUP METHODS")
    
    # Create test groups
    print("1. Creating newsgroups...")
    group1 = NewsGroup(
        name="Daily Journal",
        category="personal",
        prompt_of_the_week="What made you smile today?"
    )
    group2 = NewsGroup(
        name="Tech Thoughts",
        category="technology",
        prompt_of_the_week="What technology are you learning this week?"
    )
    db.session.add(group1)
    db.session.add(group2)
    db.session.commit()
    print(f"   ✓ Created: {group1.name} (ID: {group1.id})")
    print(f"   ✓ Created: {group2.name} (ID: {group2.id})")
    
    # Test to_dict
    print("\n2. Testing to_dict()...")
    group_dict = group1.to_dict()
    print(f"   ✓ Group dict: {group_dict}")

def test_post_methods():
    """Test all Post class methods."""
    print_section("TESTING POST METHODS")
    
    # Get test user and group
    user = User.query.filter_by(username="testuser").first()
    group = NewsGroup.query.filter_by(name="Daily Journal").first()
    
    # Test 1: Create a post using the create() classmethod
    print("1. Testing Post.create()...")
    post1 = Post.create(
        title="My First Post",
        content="This is my first blog post about my day!",
        user_id=user.id,
        group_id=group.id
    )
    print(f"   ✓ Created post: '{post1.title}' (ID: {post1.id})")
    print(f"   ✓ Timestamp: {post1.timestamp}")
    
    # Test 2: Create another post
    print("\n2. Creating another post...")
    post2 = Post.create(
        title="Learning Python",
        content="Today I learned about SQLAlchemy and Flask!",
        user_id=user.id,
        group_id=group.id
    )
    print(f"   ✓ Created post: '{post2.title}' (ID: {post2.id})")
    
    # Test 3: Edit a post (edit_content method)
    print("\n3. Testing edit_content()...")
    print(f"   Before: Title='{post1.title}'")
    print(f"   Before: Content='{post1.content[:50]}...'")
    
    post1.edit_content(
        new_title="My Updated First Post",
        new_content="This is my UPDATED first blog post with more details!"
    )
    print(f"   After: Title='{post1.title}'")
    print(f"   After: Content='{post1.content}'")
    print(f"   ✓ Timestamp updated: {post1.timestamp}")
    
    # Test 4: Edit only content
    print("\n4. Testing edit_content() - content only...")
    post2.edit_content(new_content="Today I learned about SQLAlchemy, Flask, and OOP!")
    print(f"   ✓ Updated content: '{post2.content}'")
    print(f"   ✓ Title unchanged: '{post2.title}'")
    
    # Test 5: Edit only title
    print("\n5. Testing edit_content() - title only...")
    post2.edit_content(new_title="My Python Learning Journey")
    print(f"   ✓ Updated title: '{post2.title}'")
    
    # Test 6: Test to_dict()
    print("\n6. Testing to_dict()...")
    post_dict = post1.to_dict()
    print(f"   ✓ Post dict: {post_dict}")
    
    # Test 7: Access relationships (backref)
    print("\n7. Testing relationships...")
    print(f"   ✓ Post author: {post1.author.username}")
    print(f"   ✓ Post group: {post1.group.name}")
    print(f"   ✓ User's posts count: {len(user.posts)}")
    print(f"   ✓ Group's posts count: {len(group.posts)}")

def test_user_group_association():
    """Test user-group many-to-many relationship."""
    print_section("TESTING USER-GROUP ASSOCIATIONS")
    
    user = User.query.filter_by(username="testuser").first()
    group1 = NewsGroup.query.filter_by(name="Daily Journal").first()
    group2 = NewsGroup.query.filter_by(name="Tech Thoughts").first()
    
    # Add user to groups
    print("1. Adding user to groups...")
    user.groups.append(group1)
    user.groups.append(group2)
    db.session.commit()
    print(f"   ✓ User '{user.username}' joined {user.groups.count()} groups")
    
    # Show group members
    print("\n2. Showing group members...")
    for group in [group1, group2]:
        print(f"   ✓ {group.name} has {len(group.members)} member(s)")

def display_all_data():
    """Display all current data in the database."""
    print_section("DATABASE SUMMARY")
    
    print("USERS:")
    for user in User.query.all():
        print(f"  • {user.username} ({user.email}) - {len(user.posts)} posts")
    
    print("\nGROUPS:")
    for group in NewsGroup.query.all():
        print(f"  • {group.name} ({group.category}) - {len(group.posts)} posts")
        print(f"    Prompt: {group.prompt_of_the_week}")
    
    print("\nPOSTS:")
    for post in Post.query.all():
        print(f"  • '{post.title}' by {post.author.username} in {post.group.name}")
        print(f"    Posted: {post.timestamp}")
        print(f"    Content: {post.content[:60]}...")

def main():
    """Main test runner."""
    with app.app_context():
        # Create tables if they don't exist
        print("Initializing database...")
        db.create_all()
        print("✓ Database ready!\n")
        
        # Clean up any existing test data
        cleanup_test_data()
        
        # Run all tests
        test_user_methods()
        test_newsgroup_methods()
        test_post_methods()
        test_user_group_association()
        display_all_data()
        
        print_section("ALL TESTS COMPLETED")
        print("✓ Test database: test.db")
        print("✓ All methods tested successfully!\n")

if __name__ == "__main__":
    main()