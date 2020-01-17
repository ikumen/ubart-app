import logging

from google.cloud import vision

log = logging.getLogger(__name__)

LIKELY = vision.enums.Likelihood.LIKELY

class VisionService(object):
    def __init__(self):
        self.client = vision.ImageAnnotatorClient()

    def _image(self, uri):
        image = vision.types.Image()
        image.source.image_uri = uri
        return image

    def is_image_nsfw(self, uri):
        try:
            image = self._image(uri)
            response = self.client.safe_search_detection(image=image)
            safe = response.safe_search_annotation
            return (safe.adult >= LIKELY
                or safe.medical >= LIKELY
                or safe.spoof >= LIKELY
                or safe.violence >= LIKELY
                or safe.racy >= LIKELY)
        except Exception as e:
            log.error(traceback.format_exc())
        
        return False

