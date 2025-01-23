import requests

def main():
    user_name = input("Enter your name: ")
    print(f"Hello {user_name}, you can start chatting with the AI. Type 'exit' to end the conversation.")
    
    while True:
        user_input = input(f"{user_name}: ")
        if user_input.lower() == 'exit':
            break
        
        response = requests.post(
            'http://127.0.0.1:5000/chat',
            json={"user_name": user_name, "messages": [{"role": "user", "content": user_input}]}
        )
        
        if response.status_code == 200:
            for chunk in response.iter_content(chunk_size=None, decode_unicode=True):
                print(f"Martha: {chunk}", end='', flush=True)
            print()  # for a new line after the response
        else:
            print(f"Error: {response.status_code} - {response.text}")

if __name__ == "__main__":
    main()
