from flask import Blueprint, render_template, make_response, current_app


bp = Blueprint('webapp', __name__, url_prefix='/')


@bp.route('/box/<id>')
@bp.route('/add')
@bp.route('/errors/<id>')
@bp.route('/errors')
@bp.route('/about')
@bp.route('/')
def index(id=None):
    """Handles all routes to the single page web app."""
    resp = make_response(render_template('index.html'))
    resp.headers.set('Access-Control-Allow-Origin', '*')
    resp.set_cookie(
        'mapApiKey', 
        current_app.config['MAP']['MAP_API_KEY'],
        max_age=current_app.config['MAP']['MAP_COOKIE_AGE'])
        
    return resp

