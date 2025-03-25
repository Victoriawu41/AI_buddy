from flask import Flask, request, Response, stream_with_context, jsonify
import requests
from flask_cors import CORS
import jwt

app = Flask(__name__)
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "http://localhost:5173"}});  # This will enable CORS for all routes

app.config['SECRET_KEY'] = 'temp_key'

# Define the microservices URLs
MICROSERVICES = {
    'auth': 'http://localhost:5001',
    'ai': 'http://127.0.0.1:5000',
    'calendar': 'http://localhost:8080',
    'course_info': 'http://localhost:5002',
    # Add other microservices here
}
def verify_token(token):
    """
    Attempt to decode the token using the SECRET_KEY.
    Return the decoded payload if valid, or None if invalid/expired.
    """
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        # print("expired!!")
        return None
    except jwt.InvalidTokenError:
        # print("invalid!!")
        return None

@app.route('/<service>/<path:path>', methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])
def gateway(service, path):
    
    # Handle OPTIONS request first
    if request.method == 'OPTIONS':
        response = jsonify({"message": "CORS preflight successful"})
        response.headers.add("Access-Control-Allow-Origin", "http://localhost:5173")  
        response.headers.add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization")
        response.headers.add("Access-Control-Allow-Credentials", "true")
        return response, 200  
    
    protected_services = ['ai', 'calendar', 'course_info']

    #check authentification
    if service in protected_services:
        token = request.cookies.get("access_token")
        if not token:
            return jsonify({"error": "Authentication required"}), 401
        if not verify_token(token):
            return jsonify({"error": "Authentication token invalid or expired"}), 401

    if service not in MICROSERVICES:
        return jsonify({"error": "Service not found"}), 404

    url = f"{MICROSERVICES[service]}/{path}"
    method = request.method

    headers = {key: value for key, value in request.headers if key.lower() != 'host'} 
    cookies = request.cookies 

    if method == 'GET':
        resp = requests.get(url, params=request.args, headers=headers, cookies=cookies, stream=True)
    elif method == 'POST':
        if request.content_type and request.content_type.startswith('multipart/form-data'):
            resp = requests.post(url, files=request.files, data=request.form, stream=True)
        else:
            # Handle both JSON and empty bodies
            data = request.json if request.is_json else {}
            resp = requests.post(url, json=data, stream=True)

    elif method == 'PUT':
        resp = requests.put(url, json=request.json, headers=headers, cookies=cookies, stream=True)
    elif method == 'DELETE':
        resp = requests.delete(url, headers=headers, cookies=cookies, stream=True)
    else:
        return jsonify({"error": "Method not allowed"}), 405

    if 'text/plain' in resp.headers.get('Content-Type', ''):
        def generate():
            for chunk in resp.iter_content(chunk_size=8192):
                yield chunk
        return Response(stream_with_context(generate()), content_type=resp.headers.get('Content-Type'))
    else:
        return (resp.content, resp.status_code, resp.headers.items())

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, threaded=True)