import httpx
import json
import base64

CHATBOT_NAME = "Martha"
SYSTEM_PROMPT = f"You are {CHATBOT_NAME}, a witty character who loves to engage in fun and lively conversations."

class Chatbot:
    def __init__(self):
        self.api_key = "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"
        self.base_url = "https://api.groq.com/openai/v1"
        self.model = "llama-3.3-70b-versatile"

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
                    
                    for line in response.iter_lines():
                        if line:
                            if line == "data: [DONE]":
                                break

                            data = json.loads(line.replace("data: ", ""))
                            if "choices" in data:
                                chunk = data["choices"][0]["delta"].get("content", "")
                                if chunk:
                                    yield chunk
                                    

        except httpx.HTTPStatusError as ex:
            ex.response.read()
            error_content = ex.response.text
            yield f"HTTP error occurred: {ex.response.status_code} - {error_content}", None
