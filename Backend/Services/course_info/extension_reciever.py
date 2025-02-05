import flask
from quercus_html_parser import get_ENV_dict

app = flask.Flask(__name__)

@app.route('/quercus_scrape', methods=['POST'])
def extension_reciever():
    data = flask.request.json
    env_dict = get_ENV_dict(data['html'])
    url = data['url']
    print(env_dict)
    print(url)
    return 'OK'

if __name__ == '__main__':
    app.run(debug=True, host='localhost', port=5000)