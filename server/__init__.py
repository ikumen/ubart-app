from flask import Flask
from os import path
from os.path import dirname
from werkzeug.exceptions import HTTPException
from . import support
from . import config


def create_app(override_settings=None):
    dist_dir = path.join(dirname(dirname(__file__)), 'webclient', 'dist')
    app = Flask(__name__, 
                template_folder=dist_dir, 
                static_folder=path.join(dist_dir, 'static'), 
                static_url_path='/static')

    config.init_app(app)
    support.register_blueprints(app, __name__, __path__)

    # delegates all HTTPException based errors to support.handler_error 
    app.errorhandler(HTTPException)(support.handle_error)

    return app
