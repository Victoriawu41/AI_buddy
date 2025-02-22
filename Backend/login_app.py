from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, User#, FileMetadata
import os
import jwt
import datetime

app = Flask(__name__)
app.config['SECRET_KEY'] = 'temp_key' # TODO: setup secure way to pass secret key
# app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'fallback_secret_key') <- USING ENV VARIABLE

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

def generateToken(user_id):
    payload = {
        'user_id': user_id,
        'iat': datetime.datetime.now(),
        'exp': datetime.datetime.now() + datetime.timedelta(days=7) # 7 day expiration
    }
    token = jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')
    return token

def verify_token(token):
    """
    Attempt to decode the token using the SECRET_KEY.
    Return the decoded payload if valid, or None if invalid/expired.
    """
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

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
        response.set_cookie("access_token", generateToken(user.id), httponly=True, secure=True, samesite='Lax')
        return response, 200
    return jsonify({"error": "Invalid credentials"}), 401

@app.route('/verify', methods=['GET'])
# used to verify access token
def verify():
    token = request.cookies.get("access_token")
    if not token:
        return jsonify({"error": "Authentication required"}), 401
    if not verify_token(token):
        return jsonify({"error": "Authentication token invalid or expired"}), 401
    return jsonify({"message": "Authentification successful"}), 200

@app.route('/logout', methods=['POST'])
def logout():
    print("test")
    response = jsonify({"message": "Logout successful!"})
    response.set_cookie(
        "access_token", "",  # Clear the cookie
        httponly=True,       # Keep it secure
        secure=False,        # Set to True in production with HTTPS
        samesite="Lax",     # Allow cross-origin cookies
        path="/",            # Ensure it's applied across all routes
        domain="localhost",  # Same as login cookie
        expires=0            # Expire the cookie immediately
    )
    return response, 200

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
    app.run(debug=True, port=5001)
