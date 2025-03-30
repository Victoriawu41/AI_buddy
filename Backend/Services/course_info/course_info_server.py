from flask import Flask, jsonify, request
from flask_cors import CORS
from course_info import get_all_course_ids, get_all_course_info

app = Flask(__name__)
# Replace basic CORS with specific configuration
CORS(app, resources={r"/*": {
    "origins": "http://localhost:5173",  # Frontend URL
    "supports_credentials": True
}})

@app.route('/course-ids', methods=['GET'])
def course_ids():
    """Get all available course IDs"""
    result = get_all_course_ids()
    if result.get("success"):
        return jsonify(result)
    else:
        return jsonify(result), 500

@app.route('/course-info/<course_id>', methods=['GET'])
def course_info(course_id):
    """Get all information for a specific course"""
    if not course_id:
        return jsonify({"success": False, "error": "Course ID is required"}), 400
    
    result = get_all_course_info(course_id)
    print(result)
    if result.get("success"):
        return jsonify(result)
    else:
        # Return 404 if course not found, otherwise 500 for server errors
        status_code = 404 if "not found" in result.get("error", "") else 500
        return jsonify(result), status_code

if __name__ == '__main__':
    app.run(debug=True, host='localhost', port=5003)
