from flask import Flask, render_template

app = Flask(__name__)


# Disable cache
@app.after_request
def add_header(response):
    response.cache_control.max_age = 0
    return response


@app.route('/')
def index():
    return render_template('index.html')
