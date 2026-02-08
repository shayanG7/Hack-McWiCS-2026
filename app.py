from flask import Flask
from module import db
from backend.user_routes import user_bp
from backend.group_routes import group_bp
from backend.post_routes import post_bp

app = Flask(__name__, 
            static_folder='dummy_website/assets', 
            template_folder='dummy_website')

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SECRET_KEY'] = 'your_secret_key'

db.init_app(app)

# Register Blueprints
# app.register_blueprint(user_bp)
# app.register_blueprint(group_bp)
# app.register_blueprint(post_bp)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)