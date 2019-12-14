from flask import Blueprint, render_template


bp = Blueprint('webapp', __name__, url_prefix='/')


@bp.route('/')
def index():
    """Handles all routes to the single page web app."""
    return render_template('index.html')

