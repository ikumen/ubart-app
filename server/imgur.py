import requests
import logging

from werkzeug.exceptions import Unauthorized
from . import support


log = logging.getLogger(__name__)


class ImgurService():
    """Wrapper for Imgur API, encapsulating functionality/logic for 
    interacting with albums https://apidocs.imgur.com/
    """
    def init_app(self, app):
        self._config = app.config.get('IMGUR')
        self._headers = {'Authorization': 'Bearer %s' % self._config['AUTH']['USER_ACCESS_TOKEN']}
        self._initialize_albums()

    @support.cache.memoize()
    def get_album(self, name):
        return self._get_albums()[name]

    def get_album_images(self, album_name):
        album = self.get_album(album_name)
        uri = self._config['ENPOINTS']['GET_ALBUM_IMAGES'] % album['id']
        resp = requests.get(uri, headers=self._headers)
        images = self._handle_response(resp)
        return images

    def add_album_image(self, album_name, image):
        album = self.get_album(album_name)
        uri = self._config['ENDPOINTS']['ADD_ALBUM_IMAGE'] % album['id']
        resp = requests.post(uri, headers=self._headers, data={'ids[]': image['id']})
        self._handle_response(resp)
        return True

    def remove_album_image(self, album_name, image):
        album = self.get_album(album_name)
        uri = self._config['ENDPOINTS']['REMOVE_ALBUM_IMAGE'] % album['id']
        resp = requests.post(uri, headers=self._headers, data={'ids[]': image['id']})
        self._handle_response(resp)
        return True

    def delete_image(self, image):
        uri = self._config['ENDPOINTS']['DELETE_IMAGE'] % image['id']
        resp = requests.delete(uri, headers=self._headers)
        self._handle_response(resp)
        return True

    def reject_image(self, image):
        return self.add_album_image('UBART-REJECTED', image)

    def accept_image(self, image):
        self.remove_album_image('UBART-UPLOADED', image)
        return self.add_album_image('UBART-ACCEPTED', image)

    def _handle_response(self, resp):
        if resp.status_code == requests.codes.unauthorized:
            raise Unauthorized()
        if resp.status_code != requests.codes.ok:
            raise support.AppError('Unable to complete requests: %s, %s' % (resp.request.url, resp.reason))
        return resp.json()['data']

    @support.cache.memoize()
    def _get_albums(self):
        uri = self._config['ENDPOINTS']['GET_ALBUMS'] % self._config['AUTH']['USER']
        resp = requests.get(uri, headers=self._headers)
        albums = self._handle_response(resp)
        return {a['title']: a for a in albums}

    def create_album(self, name, description):
        uri = self._config['ENDPOINTS']['POST_ALBUM']
        resp = requests.post(uri, headers=self._headers, data=dict(
            title=name,
            description=description,
            privacy='hidden'
        ))
        album = self._handle_response(resp)
        return album

    def _initialize_albums(self):
        albums = self._get_albums()
        for k,desc in self._config['ALBUMS'].items():
            if k not in albums:
                log.info('Creating album %s', k)
                self.create_album(k, desc)
            else:
                log.info('Album %s initialized!\n', albums[k])

