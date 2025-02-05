import flask

app = flask.Flask(__name__)

@app.route('/', methods=['POST'])
def extension_reciever():
    data = flask.request.json
    print(data)
    return 'OK'

if __name__ == '__main__':
    app.run(debug=True, host='localhost', port=5000)