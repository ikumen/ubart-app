import logging
import requests

from flask import Blueprint, request, jsonify, current_app
from werkzeug.exceptions import BadRequest
from . import box_store


log = logging.getLogger(__name__)
bp = Blueprint('api', __name__, url_prefix='/api')


@bp.route('/boxes', methods=['get'])
def search_boxes():
    latlng = request.args.get('geo', '').split(',')
    if (len(lat_lng) != 2
            or latlng[0] > 90 or latlng[0] < -90
            or latlng[1] > 180 or latlng[1] < -180):
        raise BadRequest('geo param is not valid (e.g, geo=lat,lng)')

    boxes = box_store.search_by_geolocation({'lat': latlng[0], 'lng': latlng[1]})
    return jsonify(boxes)


@bp.route('/boxes', methods=['post'])
def create_box():
    data = request.get_json()
    box = box_store.create(**data)
    return jsonify(box)


@bp.route('/boxes/<id>', methods=['get'])
def get_box(id):
    box = box_store.get(int(id))
    return jsonify(box)

