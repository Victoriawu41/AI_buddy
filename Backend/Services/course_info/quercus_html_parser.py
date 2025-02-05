from bs4 import BeautifulSoup as bs
import sys
import re

def get_ENV_dict(html_string):
    soup = bs(html_string, 'html.parser')
    if soup.find(string="Login Problems"):
        print("Login Problems")
        sys.exit(1)

    non_text_elements = [t for t in soup.find_all(string=True) if t.parent.name == 'script']

    search = r'ENV = {.*}'

    for element in non_text_elements:
        if re.search(search, element):
            break

    data_json_string = list(map(lambda x: x.strip(), str(element).split('\n')))[2]

    return data_json_string