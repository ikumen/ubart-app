import pytest
import server

from google.cloud import datastore
from server.datastore import DatastoreClientFactory


class MockFlaskApp(object):
    def __init__(self, env, project_id='ubart-app'):
        self.config = dict(
            ENV=env,
            PROJECT_ID=project_id)


@pytest.fixture
def mock_app():
    return MockFlaskApp('development')


@pytest.fixture
def app():
    app = server.create_app()
    with app.app_context():
        yield app


@pytest.fixture
def app_client(app):
    return app.test_client()

@pytest.fixture
def datastore_client(app=None):
    if app is None:
        app = MockFlaskApp('development')
    return DatastoreClientFactory(app).get()

@pytest.fixture
def with_clean_datastore(app=None):
    if app is None:
        app = MockFlaskApp('development')
    
    client = DatastoreClientFactory(app).get()
    
    all_kinds_query = client.query(kind='__kind__')
    all_kinds_query.keys_only()
    for kind in all_kinds_query.fetch():
        all_entities_query = client.query(kind=kind)
        all_entities_query.keys_only()
        client.delete_multi([e.key for e in all_entities_query.fetch()])
    
