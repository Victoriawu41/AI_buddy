import flask
from quercus_html_parser import get_ENV_dict
import json
from markdownify import markdownify as md
from query_llm import query_llm
from process_pdf import process_pdf
import os
from pathlib import Path

app = flask.Flask(__name__)

@app.route('/quercus_scrape', methods=['POST'])
def extension_reciever():
    print('recieved')
    data = flask.request.json
    env_dict = get_ENV_dict(data['html'])
    syllabus_file_name = data['syllabus_file_name']

    body = env_dict["WIKI_PAGE"]["body"]
    body = body.replace("\n", "")
    with open("debug_files/wiki_page.md", "w") as text_file:
        text_file.write(md(body))
    env_dict["WIKI_PAGE"].pop("body")
    json.dump(env_dict, open('debug_files/info.json', 'w'), indent=2)

    pdf_directory = Path(__file__).parent.parent.parent / 'uploads' / syllabus_file_name
    course_syllabus = process_pdf(pdf_directory)

    query_llm(json.dumps(env_dict), md(body), course_syllabus)

    return 'OK'

@app.route('/syllabus_files', methods=['GET'])
def get_pdf_files():
    try:
        # Get list of all files in uploads directory
        pdf_directory = Path(__file__).parent.parent.parent / 'uploads'
        files = os.listdir(pdf_directory)
        
        # Filter to only include PDF files
        pdf_files = [file for file in files if file.lower().endswith('.pdf')]
        
        return flask.jsonify({"pdf_files": pdf_files})
    except Exception as e:
        print(f"Error retrieving PDF files: {e}")
        return flask.jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='localhost', port=5002)