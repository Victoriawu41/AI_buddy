from flask import Flask, request, jsonify
import requests
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # This will enable CORS for all routes

# Define the microservices URLs
MICROSERVICES = {
    'ai': 'http://localhost:5000',
    # Add other microservices here
}

@app.route('/<service>/<path:path>', methods=['GET', 'POST', 'PUT', 'DELETE'])
def gateway(service, path):
    if service not in MICROSERVICES:
        return jsonify({"error": "Service not found"}), 404

    url = f"{MICROSERVICES[service]}/{path}"
    method = request.method

    if method == 'GET':
        resp = requests.get(url, params=request.args)
    elif method == 'POST':
        resp = requests.post(url, json=request.json)
    elif method == 'PUT':
        resp = requests.put(url, json=request.json)
    elif method == 'DELETE':
        resp = requests.delete(url)
    else:
        return jsonify({"error": "Method not allowed"}), 405

    return (resp.content, resp.status_code, resp.headers.items())

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8000)