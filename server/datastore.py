import logging
import requests

from abc import ABCMeta, abstractmethod
from google.auth import credentials
from google.cloud import datastore
from .support import AppError


log = logging.getLogger(__name__)

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


class EntityService(metaclass=ABCMeta):
    _kind = None
    _id = 'id'
    _fields = []
    _exclude_from_indexes = []
    
    def __init__(self, client=None, **kwargs):
        if self._kind is None:
            raise ValueError('Implementing classes must define a _kind!')
        self._client = client

    def init_app(self, app, **kwargs):
        if self._client is None:
            self._client = DatastoreClientFactory(app).get()
        return self

    def _key_w_auto_id(self):
        """Helper for generating a key for this kind and optional id"""
        return self._client.key(self._kind)

    def _key_w_assigned_id(self, id):
        if id is None:
            raise ValueError("Required id is missing!")
        return self._client.key(self._kind, id)

    def set_params(self, entity, kwargs):
        """Set all kwargs that are supported by this entity 
        (e.g. support fields are defined under _fields).
        """
        for k,v in kwargs.items():
            if k in self._fields:
                entity[k] = v
    
    def get(self, id):
        return self.get_by_key(self._key_w_assigned_id(id))

    def get_by_key(self, key):
        return self.from_entity(self._client.get(key))

    def delete(self, id):
        return self._client.delete(self._key_w_assigned_id(id))

    def create(self, **kwargs):
        """Default implementation simply saves all passed in params after
        preprocessing and checks if in "_fields" list. Override to provide
        custom create logic.
        """
        return self._save(**kwargs)

    def update(self, **kwargs):
        """Default implementation simply saves all passed in params after
        preprocessing and checks if in "_fields" list. Override to provide
        custom update logic.
        """
        return self._save(**kwargs)

    @abstractmethod
    def preprocess_params(self, entity, kwargs):
        """Preprocess the params before setting them on the given entity.
        """
        pass

    @abstractmethod
    def from_entity(self, entity):
        """Converts given entity to implementing model."""
        pass

    def _save(self, upsert=True, **kwargs):
        """Generic save/upsert function, handles assigned and auto-generated
        id scenarios.
        """
        id = kwargs.get(self._id)
        key = self._key_w_auto_id() if id is None else self._key_w_assigned_id(id)
        entity = None
        with self._client.transaction():
            if id is not None:
                # Given an id, try to look up entity for updating
                entity = self.get_by_key(key)
                if entity is None and not upsert:
                    raise LookupError('Entity not found for given id: %s' % id)
            if entity is None:
                # No entity was found, just create a new entity to insert
                entity = datastore.Entity(key=key, exclude_from_indexes=self._exclude_from_indexes)
            # We have an entity now (blank or pulled from db), let's update it
            self.preprocess_params(entity, kwargs)
            self.set_params(entity, kwargs)
            self._client.put(entity)
        return entity

    def _create_query(self):
        return self._client.query(kind=self._kind)

    def _apply_filters(self, query, filters=None):
        for f in filters or []:
            if len(f) == 3:
                query.add_filter(*f)
            else:
                log.warning("'%s' filter not tuple" % (f))
