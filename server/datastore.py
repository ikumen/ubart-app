import requests

from google.auth import credentials
from google.cloud import datastore
from .support import AppError

class EmulatorCredentials(credentials.Credentials):
    """Mock credential object. Copied from google-cloud-python 
    https://github.com/googleapis/google-cloud-python/blob/master/test_utils/test_utils/system.py
    """
    def __init__(self):
        self.token = b'seekrit'
        self.expiry = None

    @property
    def valid(self):
        return True

    def refresh(self, unused_request):
        raise RuntimeError('Should never be refreshed')


class DatastoreClientFactory(object):
    """
    Encapsulate creating the datastore client depending on the current
    environment we're running in.
    """
    def __init__(self, app=None):
        self.client = None
        if app is not None:
            self.init_app(app)

    def init_app(self, app):
        env = app.config.get('ENV')
        project_id = app.config.get('PROJECT_ID')
        if env == 'production':
            self.client = datastore.Client(project=project_id)
        else:
            # In developement we target the datastore emulator.
            # Remember to export DATASTORE_EMULATOR_HOST 
            self.client = datastore.Client(
                project=project_id,
                namespace=project_id,
                credentials=EmulatorCredentials(),
                _http=requests.Session(),
                _use_grpc=True)

    def get(self):
        assert self.client is not None, 'DatastoreClientFactory not initialized!'
        return self.client