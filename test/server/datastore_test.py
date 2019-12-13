import warnings
import pytest

from server.datastore import DatastoreClientFactory
from google.cloud import datastore
from .helpers import MockFlaskApp, with_clean_datastore

@pytest.fixture
def app():
    return MockFlaskApp('development')


def test_create_datastore_client_factory(app):
    # Loading production settings, will throw UserWarning
    with pytest.warns(UserWarning):
        factory = DatastoreClientFactory(MockFlaskApp('production'))
    assert DatastoreClientFactory(app)


def test_when_datastore_factory_not_initialized():
    """We never initialized with Flask app (in constructor or 
    init_app()) before trying to get client."""
    with pytest.raises(AssertionError):
        DatastoreClientFactory().get()


def test_should_save_an_entity(app, with_clean_datastore):
    client = DatastoreClientFactory(app).get()
    
    key = client.key('Task', 1)

    # Confirm we are starting with empty datastore
    query = client.query(kind='Task')
    query.keys_only()
    assert client.get(key) is None, 'Datastore should be empty'

    # Now add a Task entity, then query for it
    task = datastore.Entity(key)
    task.update({'description': 'Learn Datastore'})
    client.put(task)
    assert client.get(key)['description'] == 'Learn Datastore', 'Failed to save entity'

    