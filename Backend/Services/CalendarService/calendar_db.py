import sqlite3
from http.server import BaseHTTPRequestHandler, HTTPServer
import json
from urllib.parse import urlparse
import jwt  # Make sure to import jwt for token verification

def init_db():
    conn = sqlite3.connect("events.db")
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,  
        title TEXT NOT NULL,
        start DATETIME NOT NULL,
        end DATETIME NOT NULL,
        description TEXT,
        reminder_on BOOLEAN NOT NULL DEFAULT FALSE,
        reminder_datetime DATETIME
    )""")

    conn.commit()
    conn.close()

# Fetch events for a specific user
def fetch_events(user_id):
    conn = sqlite3.connect("events.db")
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM events WHERE user_id = ?", (user_id,))
    rows = cursor.fetchall()
    
    conn.close()

    return [{"id": row[0], "title": row[2], "start": row[3], "end": row[4], "description": row[5], "reminder_on": bool(row[6]), "reminder_datetime": row[7]} for row in rows]

# Add an event for a specific user
def add_event(user_id, title, start, end, description, reminder_on, reminder_datetime):
    # Replace empty description with NULL
    if not description:  
        description = None

    conn = sqlite3.connect("events.db")
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO events (user_id, title, start, end, description, reminder_on, reminder_datetime) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (user_id, title, start, end, description, reminder_on, reminder_datetime))

    conn.commit()
    conn.close()

# Update an event for a specific user
def update_event(id, user_id, title, start, end, description, reminder_on, reminder_datetime):
    # Replace empty description with NULL
    if not description: 
        description = None

    conn = sqlite3.connect("events.db")
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE events 
        SET title = ?, start = ?, end = ?, description = ?, reminder_on = ?, reminder_datetime = ? 
        WHERE id = ? AND user_id = ?
    """, (title, start, end, description, reminder_on, reminder_datetime, id, user_id))
    
    conn.commit()
    conn.close()

# Delete an event for a specific user
def delete_event(id, user_id):
    conn = sqlite3.connect("events.db")
    cursor = conn.cursor()
    cursor.execute("DELETE FROM events WHERE id = ? AND user_id = ?", (id, user_id))
    conn.commit()
    conn.close()

# Define the HTTP request handler
class RequestHandler(BaseHTTPRequestHandler):
    def verify_token(self, token):
        """
        Enhanced token verification with detailed logging
        """
        if not token:
            return None

        try:
            # Use the same secret key as in your login_app.py
            payload = jwt.decode(token, 'temp_key', algorithms=["HS256"])        
            return payload.get('user_id')
        except jwt.ExpiredSignatureError:
            print("Token has expired")
            return None
        except jwt.InvalidTokenError as e:
            print(f"Invalid token error: {e}")
            return None
        except Exception as e:
            print(f"Unexpected token verification error: {e}")
            return None

    def get_cookie(self, name):
        """
        Parse cookies from the request headers
        """
        cookie_header = self.headers.get('Cookie')
        if not cookie_header:
            return None
        
        cookies = {}
        try:
            for cookie in cookie_header.split('; '):
                key, value = cookie.split('=', 1)
                cookies[key.strip()] = value.strip()
        except Exception as e:
            print(f"Error parsing cookies: {e}")
            return None
        
        return cookies.get(name)

    def send_cors_headers(self):
        """
        Common method to send CORS headers
        """
        self.send_header('Access-Control-Allow-Origin', 'http://localhost:5173') 
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')  
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie') 
        self.send_header('Access-Control-Allow-Credentials', 'true')

    def do_OPTIONS(self): 
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', 'http://localhost:5173') 
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')  
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie') 
        self.send_header('Access-Control-Allow-Credentials', 'true')
        self.end_headers()

    def do_GET(self):
        parsed_path = urlparse(self.path)
        if parsed_path.path == "/events":
            # Verify user token from cookie
            token = self.get_cookie('access_token')
            user_id = self.verify_token(token)
            if not user_id:
                self.send_error(401, "Unauthorized")
                return
            events = fetch_events(user_id)
            
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.send_header('Access-Control-Allow-Origin', 'http://localhost:5173') 
            self.send_header('Access-Control-Allow-Credentials', 'true')
            self.end_headers()
            self.wfile.write(json.dumps(events).encode())

    def do_POST(self):
        parsed_path = urlparse(self.path)
        if parsed_path.path == "/events":
            # Verify user token from cookie
            token = self.get_cookie('access_token')
            user_id = self.verify_token(token)
            if not user_id:
                self.send_error(401, "Unauthorized")
                return
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode())
            
            # Extract data from the JSON body
            title = data["title"]
            start = data["start"]
            end = data["end"]
            description = data["description"]
            reminder_on = data.get("reminder_on", False)
            reminder_datetime = data.get("reminder_datetime")
            
            add_event(user_id, title, start, end, description, reminder_on, reminder_datetime)
            
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.send_header('Access-Control-Allow-Origin', 'http://localhost:5173') 
            self.send_header('Access-Control-Allow-Credentials', 'true')
            self.end_headers()
            self.wfile.write(json.dumps({"message": "Event added!"}).encode())

    def do_PUT(self):
        parsed_path = urlparse(self.path)
        if parsed_path.path.startswith("/events/"):
            # Verify user token from cookie
            token = self.get_cookie('access_token')
            user_id = self.verify_token(token)
            
            if not user_id:
                self.send_error(401, "Unauthorized")
                return

            event_id = parsed_path.path.split("/")[-1]
            content_length = int(self.headers['Content-Length'])
            put_data = self.rfile.read(content_length)
            data = json.loads(put_data.decode())
            
            # Extract data from the JSON body
            title = data["title"]
            start = data["start"]
            end = data["end"]
            description = data["description"]
            reminder_on = data.get("reminder_on", False)
            reminder_datetime = data.get("reminder_datetime")
            
            update_event(event_id, user_id, title, start, end, description, reminder_on, reminder_datetime)
            
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.send_header('Access-Control-Allow-Origin', 'http://localhost:5173') 
            self.send_header('Access-Control-Allow-Credentials', 'true')
            self.end_headers()
            self.wfile.write(json.dumps({"message": f"Event updated!"}).encode())

    def do_DELETE(self):
        parsed_path = urlparse(self.path)
        if parsed_path.path.startswith("/events/"):
            # Verify user token from cookie
            token = self.get_cookie('access_token')
            user_id = self.verify_token(token)
            
            if not user_id:
                self.send_error(401, "Unauthorized")
                return

            event_id = parsed_path.path.split("/")[-1]
            delete_event(event_id, user_id)
            
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.send_header('Access-Control-Allow-Origin', 'http://localhost:5173') 
            self.send_header('Access-Control-Allow-Credentials', 'true')
            self.end_headers()
            self.wfile.write(json.dumps({"message": f"Event deleted!"}).encode())

init_db()

def run():
    server_address = ('', 8080)  # Runs on http://localhost:8080
    httpd = HTTPServer(server_address, RequestHandler)
    print("Starting server...")
    httpd.serve_forever()

if __name__ == "__main__":
    run()
