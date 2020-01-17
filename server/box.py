import logging

from google.cloud import datastore

from .datastore import EntityStore
from . import geohash


log = logging.getLogger(__name__)


class BoxStore(EntityStore):
    _kind = 'Box'
    _id = 'id'
    _fields = [
        # string: 
        'description', 
        # string: location of box in freeform
        'address',
        # dict: {lat, lng}
        'geolocation', 
        # string: encoded geohash of given geolocation
        'geohash',
        # string: imgur image id used as the cover
        'cover',
        # array: list of image ids [imgur_id, ...] 
        'images'
    ]
    _exclude_from_indexes = ['description', 'address', 'geolocation', 'cover', 'images']

    def set_params(self, entity, kwargs):
        if 'images' in kwargs:
            images = entity.get('images', [])
            images.extend(kwargs['images'])
            kwargs['images'] = images
            kwargs['cover'] = images[0]['id']
        if 'geolocation' in kwargs:
            kwargs['geohash'] = geohash.encode(**kwargs['geolocation'])
        super().set_params(entity, kwargs)

    def from_entity(self, entity):
        return dict(
            id=entity.key.id,
            address=entity['address'],
            description=entity.get('description', None),
            images=entity.get('images', []),
            cover=entity.get('cover', None),
            geolocation=dict(
                lat=entity['geolocation']['lat'],
                lng=entity['geolocation']['lng']))        

    def search_by_geolocation(self, geolocation):
        """Find all matching boxes near the given lat/lng.
        The search area includes a geohash (of length 5) cell and
        it's surrounding neighbors.
        """
        return self.search_by_geohash(geohash.encode(**geolocation))

    def search_by_geohash(self, gh):
        """Finds all matching boxes near the given geohash (of length 5).
        The search area includes the given geohash cell and it's 
        surrounding neighbors.
        """
        if len(gh) != 5:
            raise ValueError('Only geohash cells of length 5 are supported!')
        hashes = geohash.neighbors(gh)
        hashes.append(gh)

        results = []
        for h in hashes:
            query = self._create_query()
            self._apply_filters(query, filters=[('geohash', '=', h)])
            for entity in list(query.fetch()):
                results.append(self.from_entity(entity))
        return results
        