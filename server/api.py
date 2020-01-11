import logging
import requests

from flask import Blueprint, request, jsonify, current_app
from werkzeug.exceptions import BadRequest
from .box import Box


log = logging.getLogger(__name__)
bp = Blueprint('api', __name__, url_prefix='/api')


@bp.route('/boxes', methods=['get'])
def search_boxes():
    geo_param = request.args.get('geo')
    if not geo_param:
        raise BadRequest("Required 'geo' param is missing!")
    coords = [float(c) for c in geo_param.split(',')]
    if (len(coords) != 2 \
            or coords[0] > 90 or coords[0] < -90 \
            or coords[1] > 180 or coords[1] < -180):
        raise BadRequest('Geolocation is not valid!')
    geolocation = dict(lat=coords[0], lng=coords[1])
    boxes = Box.search_by_geolocation(geolocation)
    return jsonify(boxes)


@bp.route('/boxes', methods=['post'])
def create_box():
    data = request.get_json()
    box = Box.create(**data)
    return jsonify(box)


@bp.route('/boxes/<id>', methods=['get'])
def get_box(id):
    box = Box.get(int(id))
    return jsonify(box)

