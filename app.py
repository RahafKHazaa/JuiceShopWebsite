from flask import Flask, request, redirect, url_for, session, jsonify
import os
from juice_shop import JuiceShop

app = Flask(__name__)
app.secret_key = 'your_secret_key_here'
juice_shop = JuiceShop()

def read_html(filepath):
    with open(filepath, 'r') as f:
        return f.read()

# Auth Routes
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        if juice_shop.authenticate_user(request.form['username'], request.form['password']):
            session['username'] = request.form['username']
            return redirect(url_for('shop'))
        return read_html('templates/alerts.html').format(
            message="Invalid username or password",
            url="/login"
        )
    return read_html('templates/auth/login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        if juice_shop.register_user(request.form['username'], 
                                  request.form['password'], 
                                  request.form['email']):
            return read_html('templates/alerts.html').format(
                message="Registration successful! Please login.",
                url="/login"
            )
        return read_html('templates/alerts.html').format(
            message="Username already exists",
            url="/register"
        )
    return read_html('templates/auth/register.html')

# Shop Routes
@app.route('/')
def home():
    return redirect(url_for('login' if 'username' not in session else 'shop'))

@app.route('/shop')
def shop():
    if 'username' not in session:
        return redirect(url_for('login'))
    return read_html('templates/shop/shop.html').format(username=session['username'])

@app.route('/cart', methods=['GET', 'POST'])
def cart():
    if 'username' not in session:
        return redirect(url_for('login'))
    if request.method == 'POST':
        if juice_shop.add_order(session['username'], request.json.get('items', [])):
            return jsonify(success=True)
        return jsonify(success=False)
    return read_html('templates/shop/cart.html')

@app.route('/api/juices')
def get_juices():
    return jsonify(juices=juice_shop.get_juices())

@app.route('/logout')
def logout():
    session.pop('username', None)
    return redirect(url_for('login'))

if __name__ == '__main__':
    os.makedirs('data', exist_ok=True)
    app.run(debug=True)