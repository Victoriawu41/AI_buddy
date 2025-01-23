from flask import Flask, request, Response, stream_with_context
from chatbot import Chatbot

app = Flask(__name__)
chatbot = Chatbot()

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_name = data.get('user_name')
    messages = data.get('messages')

    if not user_name or not messages:
        return {"error": "user_name and messages are required"}, 400

    def generate():
        for chunk in chatbot.chat(messages, user_name):
            yield chunk

    return Response(stream_with_context(generate()), content_type='text/plain')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
