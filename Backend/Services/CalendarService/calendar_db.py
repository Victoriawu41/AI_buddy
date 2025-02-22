import sqlite3
from http.server import BaseHTTPRequestHandler, HTTPServer
import json
from urllib.parse import urlparse

def init_db():
    conn = sqlite3.connect("events.db")
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        start TEXT NOT NULL,
        end TEXT NOT NULL,
        description TEXT
    )""")

    conn.commit()
    conn.close()

# Fetch all events from the database
def fetch_events():
    conn = sqlite3.connect("events.db")
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM events")
    rows = cursor.fetchall()
    
    conn.close()

    return [{"id": row[0], "title": row[1], "start": row[2], "end": row[3], "description": row[4]} for row in rows]

# Add an event to the database
def add_event(title, start, end, description):
    # Replace empty description with NULL
    if not description:  
        description = None

    conn = sqlite3.connect("events.db")
    cursor = conn.cursor()
    cursor.execute("INSERT INTO events (title, start, end, description) VALUES (?, ?, ?, ?)", (title, start, end, description))

    conn.commit()
    conn.close()

# Update an event in the database
def update_event(id, title, start, end, description):
    # Replace empty description with NULL
    if not description: 
        description = None

    conn = sqlite3.connect("events.db")
    cursor = conn.cursor()
    cursor.execute("UPDATE events SET title = ?, start = ?, end = ?, description = ? WHERE id = ?", (title, start, end, description, id))
    
    conn.commit()
    conn.close()

# Delete an event from the database
def delete_event(id):
    print(id)
    conn = sqlite3.connect("events.db")
    cursor = conn.cursor()
    cursor.execute("DELETE FROM events WHERE id = ?", (id,))
    conn.commit()
    conn.close()

# Define the HTTP request handler
class RequestHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self): # for preflight
        print("preflight ok!")
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', 'http://localhost:5173') 
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')  
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization') 
        self.send_header('Access-Control-Allow-Credentials', 'true')
        self.end_headers()
        

    def do_GET(self):
        parsed_path = urlparse(self.path)
        if parsed_path.path == "/events":
            events = fetch_events()
            
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.send_header('Access-Control-Allow-Origin', 'http://localhost:5173') 
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')  
            self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization') 
            self.send_header('Access-Control-Allow-Credentials', 'true')

            self.end_headers()
            self.wfile.write(json.dumps(events).encode())

    def do_POST(self):
        parsed_path = urlparse(self.path)
        if parsed_path.path == "/events":
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode())
            
            # Extract data from the JSON body
            title = data["title"]
            start = data["start"]
            end = data["end"]
            description = data["description"]
            
            add_event(title, start, end, description)
            
            self.send_response(200)
            self.send_header("Content-type", "application/json")

            self.send_header('Access-Control-Allow-Origin', 'http://localhost:5173') 
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')  
            self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization') 
            self.send_header('Access-Control-Allow-Credentials', 'true')
    
            self.end_headers()
            self.wfile.write(json.dumps({"message": "Event added!"}).encode())

    def do_PUT(self):
        parsed_path = urlparse(self.path)
        if parsed_path.path.startswith("/events/"):
            event_id = parsed_path.path.split("/")[-1]
            content_length = int(self.headers['Content-Length'])
            put_data = self.rfile.read(content_length)
            data = json.loads(put_data.decode())
            
            # Extract data from the JSON body
            title = data["title"]
            start = data["start"]
            end = data["end"]
            description = data["description"]
            
            update_event(event_id, title, start, end, description)
            
            self.send_response(200)
            self.send_header("Content-type", "application/json")

            self.send_header('Access-Control-Allow-Origin', 'http://localhost:5173') 
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')  
            self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization') 
            self.send_header('Access-Control-Allow-Credentials', 'true')
            self.end_headers()
            self.wfile.write(json.dumps({"message": f"Event updated!"}).encode())

    def do_DELETE(self):
        parsed_path = urlparse(self.path)
        if parsed_path.path.startswith("/events/"):
            event_id = parsed_path.path.split("/")[-1]
            delete_event(event_id)
            
            self.send_response(200)
            self.send_header("Content-type", "application/json")

            self.send_header('Access-Control-Allow-Origin', 'http://localhost:5173') 
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')  
            self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization') 
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
