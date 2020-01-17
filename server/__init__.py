import logging

from flask import Flask
from os import path
from os.path import dirname
from werkzeug.exceptions import HTTPException
from . import support, config, box, pubsub, imgur, vision


# setup basic logging
logging.basicConfig(format='[%(asctime)s] [%(levelname)-8s] %(name)s: %(message)s', level=logging.DEBUG)
log = logging.getLogger(__name__)

# Let's create some global services
imgur_service = imgur.ImgurService()
pubsub_service = pubsub.PubSubService()
box_store = box.BoxStore()
vision_service = vision.VisionService()


def create_app(override_settings=None):
    dist_dir = path.join(dirname(dirname(__file__)), 'webclient', 'dist')
    app = Flask(__name__, 
                template_folder=dist_dir, 
                static_folder=path.join(dist_dir, 'static'), 
                static_url_path='/static')

    config.init_app(app)
    support.register_blueprints(app, __name__, __path__)
    support.cache.init_app(app)

    imgur_service.init_app(app)
    pubsub_service.init_app(app)
    box_store.init_app(app)

    # delegates all HTTPException based errors to support.handler_error 
    app.errorhandler(HTTPException)(support.handle_error)

    return app
