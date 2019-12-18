import logging

from google.cloud import datastore

from .geohash import neighbors, encode
from .datastore import EntityService


log = logging.getLogger(__name__)


class BoxService(EntityService):
    _kind = 'Box'
    _id = 'id'
    _fields = [
        # string: 
        'description', 
        # string: location of box in freeform
        'address',
        # array: [lat, lng]
        'geolocation', 
        # string: encoded geohash of given geolocation
        'geohash',
        # string: imgur image id used as the cover
        'cover',
        # array: [imgur_id, ...] 
        'images'
    ]
    _exclude_from_indexes = ['description', 'address', 'geolocation', 'cover', 'images']

    def preprocess_params(self, entity, kwargs):
        if 'images' in kwargs:
            images = kwargs['images']
            entity.get('images', []).extend(images)
            if entity.get('cover') is None:
                entity['cover'] = images[0]
        if 'geolocation' in kwargs:
            entity['geohash'] = encode(*kwargs['geolocation'], 5)

    def search_by_geolocation(self, geolocation):
        """Find all matching boxes near the given lat/lng.
        The search area includes a geohash (of length 5) cell and
        it's surrounding neighbors.
        """
        self.search_by_geohash(encode(geolocation))

    def search_by_geohash(self, geohash):
        """Finds all matching boxes near the given geohash (of length 5).
        The search area includes the given geohash cell and it's 
        surrounding neighbors.
        """
        if len(geohash) != 5:
            raise ValueError('Only geohash cells of length 5 are supported!')
        hashes = neighbors(geohash)
        hashes.append(geohash)

        results = []
        for h in hashes:
            query = self._create_query()
            self._apply_filters(query, filters=[('geohash', '=', h)])
            results.extend(list(query.fetch()))
        return results
        

