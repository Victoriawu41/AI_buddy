from bs4 import BeautifulSoup as bs
import sys
import re
import json

def get_ENV_dict(html_string):
    soup = bs(html_string, 'html.parser')
    if soup.find(string="Login Problems"):
        print("Login Problems")
        sys.exit(1)

    non_text_elements = [t for t in soup.find_all(string=True) if t.parent.name == 'script']

    search = r'ENV = ({.*});'

    data_json_string = None

    for element in non_text_elements:
        data_json_string = re.search(search, element)
        if data_json_string:
            break
    
    if not data_json_string:
        return None
    
    data_json = json.loads(data_json_string.group(1))
    important_keys = ["COURSE", "current_context", "WIKI_PAGE"]

    return {key: data_json[key] for key in important_keys}
