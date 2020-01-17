from flask import Blueprint, render_template, make_response


bp = Blueprint('webapp', __name__, url_prefix='/')


@bp.route('/add')
@bp.route('/')
def index():
    """Handles all routes to the single page web app."""
    resp = make_response(render_template('index.html'))
    resp.headers.set('Access-Control-Allow-Origin', '*')
    return resp

