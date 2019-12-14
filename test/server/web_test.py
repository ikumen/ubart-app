from .helpers import app, app_client

def test_load_index(app, app_client):
    """
    Test that simply validates index.html was returned
    """
    resp = app_client.get('/')

    assert resp.mimetype == 'text/html', 'Invalid response mimetype'
    assert resp.status_code == 200, 'Invalid response status'

