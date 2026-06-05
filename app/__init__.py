from flask import Flask
from flask_mysqldb import MySQL
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from config import Config
import json
from datetime import date, datetime

class CustomJSONProvider(Flask.json_provider_class):
    def dumps(self, obj, **kwargs):
        def default(o):
            if isinstance(o, (date, datetime)):
                return o.isoformat()
            raise TypeError(f"Object of type {type(o)} is not JSON serializable")
        return json.dumps(obj, default=default, **kwargs)

mysql = MySQL()
jwt = JWTManager()
bcrypt = Bcrypt()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    app.json_provider_class = CustomJSONProvider
    app.json = CustomJSONProvider(app)

    mysql.init_app(app)
    jwt.init_app(app)
    bcrypt.init_app(app)
    CORS(app)

    from app.auth import auth_bp
    from app.admins import admins_bp
    from app.complexes import complexes_bp
    from app.buildings import buildings_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(admins_bp)
    app.register_blueprint(complexes_bp)
    app.register_blueprint(buildings_bp)

    return app