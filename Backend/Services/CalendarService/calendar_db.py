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
        end TEXT NOT NULL
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

    return [{"id": row[0], "title": row[1], "start": row[2], "end": row[3]} for row in rows]

# Add an event to the database
def add_event(title, start, end):
    conn = sqlite3.connect("events.db")
    cursor = conn.cursor()
    cursor.execute("INSERT INTO events (title, start, end) VALUES (?, ?, ?)", (title, start, end))
    
    conn.commit()
    conn.close()

# Define the HTTP request handler
class RequestHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self): # for preflight
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*') 
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')  
        self.send_header('Access-Control-Allow-Headers', 'Content-Type') 
        self.end_headers()

    def do_GET(self):
        parsed_path = urlparse(self.path)
        if parsed_path.path == "/events":
            events = fetch_events()
            self.send_response(200)
            self.send_header("Content-type", "application/json")

            self.send_header('Access-Control-Allow-Origin', '*') # CORS
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS') 
            self.send_header('Access-Control-Allow-Headers', 'Content-Type') 

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
            
            add_event(title, start, end)
            
            self.send_response(200)
            self.send_header("Content-type", "application/json")

            self.send_header('Access-Control-Allow-Origin', '*') # CORS
        
            self.end_headers()
            self.wfile.write(json.dumps({"message": "Event added!"}).encode())


init_db()

def run():
    server_address = ('', 8080)  # Runs on http://localhost:8080
    httpd = HTTPServer(server_address, RequestHandler)
    print("Starting server...")
    httpd.serve_forever()

if __name__ == "__main__":
    run()
