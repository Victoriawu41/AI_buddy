import httpx
import json
import base64
import os

CHATBOT_NAME = "Martha"
SYSTEM_PROMPT = f"You are {CHATBOT_NAME}, a witty character who loves to engage in fun and lively conversations."

class Chatbot:
    def __init__(self):
        self.api_key = os.getenv("TOGETHER_API_KEY")
        self.base_url = "https://api.together.xyz/v1"
        self.model = "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free"

        # Build prompt
        self.messages = [{"role": "user", "content": SYSTEM_PROMPT}]

    def chat(self, new_messages, user_name):
        headers = {"Authorization": f"Bearer {self.api_key}"}
        url = f"{self.base_url}/chat/completions"

        self.messages.append({"role": "user", "content": f"{user_name}:"})
        for msg in new_messages:
            self.messages.append({"role": msg["role"], "content": msg["content"]})
        self.messages.append({"role": "assistant", "content": f"{CHATBOT_NAME}:"})

        print(">>>>>>>", self.messages)

        data = {
            "model": self.model,
            "messages": self.messages,
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
