import time
import datetime
import jwt
import csv
import httpx
from werkzeug.utils import secure_filename
import os
import base64
import threading
from collections import deque
from datetime import datetime, timedelta
from dateutil import parser
import sqlite3


from flask import Flask, request, Response, stream_with_context, jsonify
from chatbot import Chatbot

app = Flask(__name__)

app.config['SECRET_KEY'] = 'temp_key'
UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

#chatbot = Chatbot()
chatbot = None
chatbot_collection = {}

# Global notification queue
notification_queue = deque()

def init_db():
    conn = sqlite3.connect("chat.db")
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS chats (
        user_id INTEGER NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL
    )""")

    conn.commit()
    conn.close()


def verify_token(token):
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
    
def get_user_id(token):
    payload = verify_token(token)
    return payload.get('user_id')

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


def parse_datetime(date_str, time_str):
    """Parse date and time strings into a datetime object"""
    try:
        # Try parsing the combined date and time
        if date_str and time_str:
            datetime_str = f"{date_str} {time_str}"
            return parser.parse(datetime_str).strftime("%Y-%m-%d %H:%M:%S")
        elif date_str:
            # If only date is provided, set time to midnight
            return parser.parse(date_str).strftime("%Y-%m-%d %H:%M:%S")
        return None
    except (ValueError, TypeError) as e:
        print(f"Error parsing datetime: {date_str} {time_str} - {e}")
        return None


def parse_csv_events(csv_text):
    events = []
    reader = csv.DictReader(csv_text.strip().splitlines())
    for row in reader:
        try:
            # Handle start datetime
            start_date = row.get('Start Date', '')
            start_time = row.get('Start Time', '')
            start_datetime = parse_datetime(start_date, start_time)
            
            # Handle end datetime
            end_date = row.get('End Date', '')
            end_time = row.get('End Time', '')
            end_datetime = parse_datetime(end_date, end_time)
            
            # Handle reminder datetime
            reminder_date = row.get('Reminder Date', '')
            reminder_time = row.get('Reminder Time', '')
            reminder_datetime = parse_datetime(reminder_date, reminder_time)
            
            if start_datetime and end_datetime:  # Only create event if we have valid start and end times
                events.append({
                    "title": row.get("Subject", "Untitled"),
                    "start": start_datetime,
                    "end": end_datetime,
                    "description": row.get("Description", ""),
                    "reminder_on": row.get("Reminder On", "FALSE").upper() == "TRUE",
                    "reminder_datetime": reminder_datetime
                })
            else:
                print(f"Skipping event due to invalid datetime: {row}")
        except Exception as e:
            print(f"Error processing row: {row} - {e}")
            continue
    return events

def getChatbot(token):
    id = get_user_id(token)
    chatbot = chatbot_collection.get(id, None)
    if (chatbot is None):
        chatbot = Chatbot(id)
        chatbot_collection.update({id: chatbot})
    return chatbot

@app.route('/chat', methods=['POST'])
def chat():
    token = request.cookies.get("access_token")
    if not token or not verify_token(token):
        return jsonify({"error": "Authentication required"}), 401
    chatbot = getChatbot(token)
    data = request.json
    messages = data.get('messages')

    if not messages:
        return {"error": "user_name and messages are required"}, 400

    # Fetch current calendar data before processing the chat
    try:
        with httpx.Client() as client:
            response = client.get("http://localhost:8080/events", headers={"Cookie": "access_token=" + token})
            if response.status_code == 200:
                calendar_data = response.json()
                chatbot.set_calendar_data(calendar_data)
            else:
                print(f"Failed to fetch calendar data: {response.status_code}")
    except Exception as e:
        print(f"Error fetching calendar data: {e}")

    def generate():
        response_chunks = []
        for chunk in chatbot.chat(messages):
            response_chunks.append(chunk)
            yield chunk

        full_response = ''.join(response_chunks)
        blocks = parse_code_blocks(full_response)
        for block_type, block_content in blocks:
            if block_type == "csv" or block_type == "calendar":
                for evt in parse_csv_events(block_content):
                    with httpx.Client() as client:
                        client.post("http://localhost:8080/events", json=evt, headers={"Cookie": "access_token=" + token})
            else:
                print(f"Found {block_type} block:")
                print(block_content)

    return Response(stream_with_context(generate()), content_type='text/plain')
    # response_text = ''.join(chatbot.chat(messages, user_name))
    # print(response_text)
    # return jsonify({"results": response_text})

@app.route('/chat/messages', methods=['GET'])
def get_messages():
    token = request.cookies.get("access_token")
    if not token or not verify_token(token):
        return jsonify({"error": "Authentication required"}), 401
    chatbot = getChatbot(token)
    display_msgs = []
    for msg in chatbot.messages[1:]:
        if not msg["content"].endswith(":") and \
                not msg["content"].startswith("```file"):
            display_msgs.append(msg)
    print(display_msgs)
    return jsonify(display_msgs)

@app.route('/chat/upload', methods=['POST'])
def upload_file():
    token = request.cookies.get("access_token")
    if not token or not verify_token(token):
        return jsonify({"error": "Authentication required"}), 401
    chatbot = getChatbot(token)
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


@app.route('/chat/settings', methods=['POST'])
def set_settings():
    token = request.cookies.get("access_token")
    if not token or not verify_token(token):
        return jsonify({"error": "Authentication required"}), 401
    chatbot = getChatbot(token)
    data = request.json
    print("Received settings:", data)
    chatbot.apply_settings(data)
    return jsonify({"message": "Settings applied"}), 200


@app.route('/chat/settings', methods=['GET'])
def get_settings():
    token = request.cookies.get("access_token")
    if not token or not verify_token(token):
        return jsonify({"error": "Authentication required"}), 401
    chatbot = getChatbot(token)
    settings = {
        "assistantName": chatbot.settings.chatbot_name,
        "assistantSystemPrompt": chatbot.settings.system_prompt,
        "userName": chatbot.settings.user_name,
        "userSystemPrompt": chatbot.settings.user_system_prompt,
    }
    print(settings)
    return jsonify(settings), 200

@app.route('/notifications/peek', methods=['GET'])
def peek_notifications():
    token = request.cookies.get("access_token")
    if not token or not verify_token(token):
        return jsonify({"error": "Authentication required"}), 401
    chatbot = getChatbot(token)
    """Get next notification without removing it"""
    notification = chatbot.peek_notification()
    return jsonify(notification)

@app.route('/notifications/pop', methods=['POST'])
def pop_notification():
    token = request.cookies.get("access_token")
    if not token or not verify_token(token):
        return jsonify({"error": "Authentication required"}), 401
    chatbot = getChatbot(token)
    """Get and remove the next notification"""
    notification = chatbot.pop_notification()
    return jsonify(notification)

if __name__ == '__main__':
    try:
        init_db()
        app.run(host='0.0.0.0', port=5000, debug=True)
    finally:
        for id, chatbot in chatbot_collection.items(): 
            chatbot.stop_notification_checker()
