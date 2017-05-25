from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask import *
from werkzeug import secure_filename
import os

#Please read the instructions in README.md to get this work. 

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///main.db'
db = SQLAlchemy(app)

class Swagger(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    swagger = db.Column(db.String)
    
    def __init__(self, swagger):
        self.swagger = swagger

    def __repr__(self):
        return '<Swagger %r>' % self.swagger


@app.route('/', methods=['POST'])
def upload():
    temp = request.files['file']
    swagger = temp.read()
    db.session.add(Swagger(swagger))
    db.session.commit()
    return 'Added swagger to the database'


app.run(debug = True)
