import importlib
import os
import pkgutil
import logging

from flask import Blueprint, jsonify
from flask_caching import Cache
from werkzeug.exceptions import InternalServerError


cache = Cache()

PUBSUB_ENCODING = 'utf-8'

def register_blueprints(app, pkg_name, pkg_path):
    """
    Traverse the project modules looking for any Blueprint instances 
    to register with the given Flask app. 
    """
    for _, name, _ in pkgutil.iter_modules(pkg_path):
        m = importlib.import_module('%s.%s' % (pkg_name, name))
        for item in dir(m):
            item = getattr(m, item)
            if isinstance(item, Blueprint):
                app.register_blueprint(item)


def handle_error(error):
    """Return error as appropriate Flask response"""
    payload = {'status_code': error.code, 'msg': error.description}
    return jsonify(payload), error.code

class AppError(InternalServerError):
    pass

