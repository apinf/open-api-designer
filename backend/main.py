from flask import Flask
from flask_sqlalchemy import SQLAlchemy

# make sure you have main.db file in the same directory and it has proper rights
# you can make the file by running following commands in your command line:
# touch main.db
# chmod 700 main.db

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///main.db'
db = SQLAlchemy(app)


class swagger(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    swagger = db.Column(db.LargeBinary(), unique=True)
    
    def __init__(self, swagger):
        self.swagger = swagger

    def __repr__(self):
        return '<swagger %r>' % self.swagger



