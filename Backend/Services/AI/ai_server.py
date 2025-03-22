import time
import datetime
import jwt
import csv
import httpx
from werkzeug.utils import secure_filename
import os
import base64

from flask import Flask, request, Response, stream_with_context, jsonify
from chatbot import Chatbot

app = Flask(__name__)

app.config['SECRET_KEY'] = 'temp_key'
UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

chatbot = Chatbot()

def verify_token(token):
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def parse_code_blocks(text):
    code_blocks = []
    start_idx = 0
    while True:
        start = text.find("```", start_idx)
        if start == -1:
            break
        end = text.find("```", start + 3)
        if end == -1:
            break
        block_type = text[start+3:text.find("\n", start+3)].strip()
        block_content = text[text.find("\n", start+3)+1:end]
        code_blocks.append((block_type, block_content))
        start_idx = end + 3
    return code_blocks

def parse_csv_events(csv_text):
    events = []
    reader = csv.DictReader(csv_text.strip().splitlines())
    for row in reader:
        start = f"{row.get('Start Date','')} {row.get('Start Time','')}".strip()
        end = f"{row.get('End Date','')} {row.get('End Time','')}".strip()
        events.append({
            "title": row.get("Subject","Untitled"),
            "start": start,
            "end": end,
            "description": row.get("Description","")
        })
    return events

@app.route('/chat', methods=['POST'])
def chat():
    # token = request.cookies.get("access_token")
    # if not token or not verify_token(token):
    #     return jsonify({"error": "Authentication required"}), 401

    data = request.json
    user_name = data.get('user_name')
    messages = data.get('messages')

    if not user_name or not messages:
        return {"error": "user_name and messages are required"}, 400

    def generate():
        response_chunks = []
        for chunk in chatbot.chat(messages, user_name):
            response_chunks.append(chunk)
            yield chunk

        full_response = ''.join(response_chunks)
        blocks = parse_code_blocks(full_response)
        for block_type, block_content in blocks:
            if block_type == "csv" or block_type == "calendar":
                for evt in parse_csv_events(block_content):
                    with httpx.Client() as client:
                        client.post("http://localhost:8080/events", json=evt)
            else:
                print(f"Found {block_type} block:")
                print(block_content)

    return Response(stream_with_context(generate()), content_type='text/plain')
    # response_text = ''.join(chatbot.chat(messages, user_name))
    # print(response_text)
    # return jsonify({"results": response_text})

@app.route('/chat/messages', methods=['GET'])
def get_messages():
    # token = request.cookies.get("access_token")
    # if not token or not verify_token(token):
    #     return jsonify({"error": "Authentication required"}), 401

    display_msgs = []
    for msg in chatbot.messages[1:]:
        if not msg["content"].endswith(":"):
            display_msgs.append(msg)
    print(display_msgs)
    return jsonify(display_msgs)

@app.route('/chat/upload', methods=['POST'])
def upload_file():
    print("Request Content-Type:", request.content_type)
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['file']
    filename = request.form.get('filename', file.filename)
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    if file:
        filename = secure_filename(filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        print(filepath)

        # Convert the file to text and add to messages
        chatbot.add_file_to_messages(filepath)

        return jsonify({"message": "File uploaded successfully", "filename": filename}), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
