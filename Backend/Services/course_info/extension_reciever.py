import flask
from quercus_html_parser import get_ENV_dict
import json
from markdownify import markdownify as md
from query_llm import query_llm

app = flask.Flask(__name__)

@app.route('/quercus_scrape', methods=['POST'])
def extension_reciever():
    print('recieved')
    data = flask.request.json
    env_dict = get_ENV_dict(data['html'])
    url = data['url']

    body = env_dict["WIKI_PAGE"]["body"]
    body = body.replace("\n", "")
    with open("debug_files/wiki_page.md", "w") as text_file:
        text_file.write(md(body))
    env_dict["WIKI_PAGE"].pop("body")
    json.dump(env_dict, open('debug_files/info.json', 'w'), indent=2)
    query_llm()

    return 'OK'

if __name__ == '__main__':
    app.run(debug=True, host='localhost', port=5002)