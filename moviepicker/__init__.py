from os import environ
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate

def create_app(config_overrides=None):
    app = Flask(__name__)
    #CORS(app, origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://moviepicker-frontend-480dac16.s3-website-us-east-1.amazonaws.com"])
    CORS(app, origins=["*"])  
    app.config['SQLALCHEMY_DATABASE_URI'] = environ.get("SQLALCHEMY_DATABASE_URI", "sqlite:///db.sqlite")
    if config_overrides: 
        app.config.update(config_overrides)

    # Load the models 
    from moviepicker.models import db
    from moviepicker.models.session import Session, SessionMovie, WebsocketSession
    db.init_app(app)
    migrate = Migrate(app, db)

    # Create the database tables 
    with app.app_context(): 
        db.create_all() 

    # Register the blueprints 
    from moviepicker.views.routes import api 
    app.register_blueprint(api) 

    return app
 