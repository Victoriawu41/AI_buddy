import httpx
import json
import base64
import os
from datetime import datetime, timedelta
from markitdown import MarkItDown
import threading
from collections import deque
import time

CHATBOT_NAME = "Study Buddy"
SYSTEM_PROMPT = f'''You are {CHATBOT_NAME}, a witty character who loves to engage in fun and lively conversations. You can help the user make schedules. To add an event to the calendar, write a CSV file, put the content between ```calendar\\n``` like a code block. For example: ```calendar
Subject,Start Date,Start Time,End Date,End Time,Description,Location,Reminder On,Reminder Date,Reminder Time "Team Meeting","2024-03-16","10:00 AM","2024-03-16","11:00 AM","Discuss quarterly goals","Conference Room",TRUE,"2024-03-15","9:00 AM" "Doctor's Appointment","2024-03-20","2:00 PM","2024-03-20","3:00 PM","Check-up","123 Main St",FALSE,,"" "Birthday Party","2024-03-25","6:00 PM","2024-03-25","10:00 PM","Celebrate John's birthday","The Park",TRUE,"2024-03-24","5:00 PM"
```
The user won't be able to see the CSV file but they will see it in their calendar.
Note that everytime you output the calendar file it will be written into user's calendar, so you need to be extra careful! Don't type it as an example, the user can't see those anyways.
'''
USER_NAME = "User"
USER_SYSTEM_PROMPT = ""

class ChatbotSettings:
    def __init__(self, ):
        self.chatbot_name = CHATBOT_NAME
        self.system_prompt = SYSTEM_PROMPT
        self.user_name = USER_NAME
        self.user_system_prompt = USER_SYSTEM_PROMPT
        
class Chatbot:
    def __init__(self):
        self.api_key = os.getenv("TOGETHER_API_KEY")
        self.base_url = "https://api.together.xyz/v1"
        # self.base_url = "https://api.groq.com/openai/v1"
        self.model = "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free"
        # self.model = "deepseek-r1-distill-qwen-32b"

        # Build prompt
        self.system_messages = []
        self.messages = []
        self.settings = ChatbotSettings()
        self.calendar_data = []

        self.notification_queue = deque()
        self.is_running = False
        self.check_thread = None
        self.start_notification_checker()
        
    def get_curr_date_time(self):
        utc_now = datetime.utcnow()
        est_now = utc_now - timedelta(hours=4)
        
        return est_now
        
    def set_calendar_data(self, calendar_data):
        """Store calendar data for use in conversations"""
        self.calendar_data = calendar_data
        # No need to add to messages - it will be included in build_messages

    def format_calendar_data_for_context(self):
        """Format calendar data as a readable message for the AI context"""
        if not self.calendar_data:
            return ""
        
        current_date = self.get_curr_date_time().date()
        start_of_week = current_date - timedelta(days=current_date.weekday())
        
        events_text = "Current calendar events:\n"
        relevant_events = []
        
        for event in self.calendar_data:
            try:
                # Parse the event start date
                event_start_str = event['start'].split()[0]  # Get date part only
                event_start_date = datetime.strptime(event_start_str, "%Y-%m-%d").date()
                
                # Only include events from this week or future
                if event_start_date >= start_of_week:
                    relevant_events.append(event)
            except (ValueError, IndexError):
                # If date parsing fails, include the event anyway
                relevant_events.append(event)
        
        if not relevant_events:
            return ""
        
        for event in relevant_events:
            events_text += f"- {event['title']} from {event['start']} to {event['end']}"
            if event.get('description'):
                events_text += f" ({event['description']})"
            events_text += "\n"
        
        return events_text

    def chat(self, new_messages):
        headers = {"Authorization": f"Bearer {self.api_key}"}
        url = f"{self.base_url}/chat/completions"

        current_time = self.get_curr_date_time().strftime("%Y-%m-%d %H:%M:%S")
        self.messages.append({"role": "user", "content": f"Current Time: {current_time} EST"})
        self.messages.append({"role": "user", "content": f"{self.settings.user_name}:"})
        for msg in new_messages:
            self.messages.append({"role": msg["role"], "content": msg["content"]})
            if msg["content"] == "clear":
                self.messages = []
        self.messages.append({"role": "assistant", "content": f"{self.settings.chatbot_name}:"})

        print(">>>>>>>", self.messages)

        data = {
            "model": self.model,
            "messages": self.build_messages(),
            "temperature": 0.9,
            "max_tokens": 2048,
            "stream": True
        }

        print("data", data)

        try:
            with httpx.Client(timeout=httpx.Timeout(60.0)) as client:
                with client.stream("POST", url, headers=headers, json=data) as response:
                    response.raise_for_status()
                    
                    full_response = []
                    for line in response.iter_lines():
                        if line:
                            if line == "data: [DONE]":
                                break

                            data = json.loads(line.replace("data: ", ""))
                            if "choices" in data:
                                chunk = data["choices"][0]["delta"].get("content", "")
                                if chunk:
                                    full_response.append(chunk)
                                    yield chunk

                    self.messages.append({"role": "assistant", "content": f"{''.join(full_response)}"})

        except httpx.HTTPStatusError as ex:
            ex.response.read()
            error_content = ex.response.text
            yield f"HTTP error occurred: {ex.response.status_code} - {error_content}", None

    def add_file_to_messages(self, file_path):
        md = MarkItDown()
        result = md.convert(file_path)
        file_name = os.path.basename(file_path)
        file_content = result.text_content
        self.messages.append({"role": "user", "content": f"```file {file_name}\n{file_content}\n```"})

    def build_messages(self):
        final_msgs = []
        
        # Start with the system prompt
        self.system_messages = [{"role": "system", "content": self.settings.system_prompt}]
        
        final_msgs.extend(self.system_messages)
        
        # Add calendar data right after system prompt if available
        calendar_summary = self.format_calendar_data_for_context()
        if calendar_summary:
            final_msgs.append({"role": "user", "content": calendar_summary})
            
        final_msgs.extend(self.messages)

        return final_msgs

    def apply_settings(self, settings_dict):
        self.settings.chatbot_name = settings_dict.get("assistantName", self.settings.chatbot_name)
        self.settings.system_prompt = settings_dict.get("assistantSystemPrompt", self.settings.system_prompt)
        self.settings.user_name = settings_dict.get("userName", self.settings.user_name)
        self.settings.user_system_prompt = settings_dict.get("userSystemPrompt", self.settings.user_system_prompt)

    def start_notification_checker(self):
        if self.is_running:
            return
            
        self.is_running = True
        self.check_thread = threading.Thread(target=self.check_upcoming_events, daemon=True)
        self.check_thread.start()

    def stop_notification_checker(self):
        self.is_running = False
        if self.check_thread:
            self.check_thread = None

    def check_upcoming_events(self):
        while self.is_running:
            try:
                with httpx.Client() as client:
                    response = client.get("http://localhost:8080/events")
                    if response.status_code == 200:
                        events = response.json()
                        current_time = self.get_curr_date_time()
                        
                        for event in events:
                            try:
                                event_time = datetime.strptime(event['start'], "%Y-%m-%d %H:%M:%S")
                                time_diff = event_time - current_time

                                print(event)
                                
                                # Check if reminder is enabled and calculate reminder time
                                if event.get('reminder_on'):
                                    reminder_datetime_str = event.get('reminder_datetime')
                                    if reminder_datetime_str:
                                        reminder_time = datetime.strptime(reminder_datetime_str, "%Y-%m-%d %H:%M:%S")
                                        reminder_diff = reminder_time - current_time
                                        
                                        # If reminder time is within the next 10 minutes
                                        if timedelta(minutes=0) <= reminder_diff <= timedelta(minutes=10):
                                            notification = {
                                                "type": "event_reminder",
                                                "title": event['title'],
                                                "message": f"Reminder: Event '{event['title']}' starts at {event['start']}",
                                                "event_time": event['start'],
                                                "timestamp": current_time.isoformat()
                                            }
                                            print("New notification queued: ", notification)
                                            self.notification_queue.append(notification)
                                            
                                            # Set reminder_on to false
                                            event['reminder_on'] = False
                                            event['description'] = "Reminder sent"
                                            client.put(f"http://localhost:8080/events/{event['id']}", json=event)
                                    
                            except (ValueError, KeyError) as e:
                                print(f"Error processing event: {e}")
                                
            except Exception as e:
                print(f"Error checking upcoming events: {e}")
                
            time.sleep(60)  # Check every minute

    def peek_notification(self):
        """Get next notification without removing it"""
        return self.notification_queue[0] if self.notification_queue else None

    def pop_notification(self):
        """Get and remove the next notification"""
        return self.notification_queue.popleft() if self.notification_queue else None
