from flask import Flask, request, make_response, render_template 

app = Flask(__name__, template_folder='templates') 

@app.route('/', methods = ['GET']) 
def Login(): 
    return render_template('login.html') 

@app.route('/details', methods = ['GET','POST']) 
def login(): 
	if request.method == 'POST': 
		name = request.form['username'] 
		output = 'Hi, Welcome '+name+ '' 
		resp = make_response(output) 
		resp.set_cookie('username', 'hello') 
	return resp 

app.run(debug=True) 
