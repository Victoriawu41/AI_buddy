from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, User#, FileMetadata
import os

app = Flask(__name__)

CORS(app, supports_credentials=True)

# PostgreSQL configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://flask_user:password@localhost/account_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
# Secret key for cookie encryption (used by Flask for signing cookies)
app.config['SECRET_KEY'] = 'your_secret_key'

# File upload configuration
UPLOAD_FOLDER = './uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

db.init_app(app)

with app.app_context():
    db.create_all()  # Create tables in the PostgreSQL database

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already exists"}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already exists"}), 400

    user = User(username=username, email=email)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    return jsonify({"message": "User registered successfully!"}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()
    if user and user.check_password(password):
        response = jsonify({"message": "Login successful!"})
        response.set_cookie("user_id", str(user.id), max_age=60 * 60 * 24 * 7)  # Expires in 7 days
        return response, 200
    return jsonify({"error": "Invalid credentials"}), 401
"""
@app.route('/upload', methods=['POST'])
def upload_file():
    user_id = request.form.get('user_id')
    file = request.files['file']

    if not file:
        return jsonify({"error": "No file provided"}), 400

    file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    file.save(file_path)

    file_metadata = FileMetadata(user_id=user_id, file_name=file.filename, file_path=file_path)
    db.session.add(file_metadata)
    db.session.commit()

    return jsonify({"message": "File uploaded successfully!"}), 201
"""
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
