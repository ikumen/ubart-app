import traceback
import logging
import json
import base64

from concurrent import futures
from flask import current_app, Blueprint, request
from google.auth.transport import requests
from google.cloud import pubsub_v1
from google.oauth2 import id_token


log = logging.getLogger(__name__)
bp = Blueprint('pubsub', __name__, url_prefix='/_ah/pubsub')

PUBSUB_ENCODING_TYPE = 'utf-8'
EVT_TYPE_UPLOADED='uploaded'
EVT_TYPE_NSFW_DETECTED='nsfw-detected'
EVT_TYPE_SFW_DETECTED='sfw-detected'



class PubSubService(object):
    def __init__(self, app=None):
        self.handlers = {}
        if app:
            self.init_app(app)

    def init_app(self, app):
        self.publisher = pubsub_v1.PublisherClient()
        self.config = dict(
            project=app.config['PROJECT_ID'],
            topic=app.config['PUBSUB']['TOPIC'])

    def publish(self, evt_type, data):
        log.info('Publishing event %s: %s', evt_type, data)
        with futures.ThreadPoolExecutor(max_workers=2) as executor:
            executor.submit(self._publish, evt_type, data)

    def register_handler(self, evt_type, handler):
        """Register a handler for the given event type."""
        self.handlers[evt_type] = handler
        return self # chainable

    def handle_event(self, evt_type, data):
        """Handle the given event type."""
        self.handlers.get(evt_type, lambda: log.error('Invalid event type'))(data)

    def _publish(self, evt_type, data):
        try:
            topic = self.publisher.topic_path(self.config['project'], self.config['topic'])
            # Each msg will have a type and associated data,
            # and will need to be encoded
            payload = json.dumps({
                    'type': evt_type,
                    'data': data}
                ).encode(PUBSUB_ENCODING_TYPE) 
            log.info('Publishing to Cloud PubSub: %s' % payload)  
            result = self.publisher.publish(topic, data=payload)
            log.debug('Successfully published to "%s"' % topic)
        except Exception as e:
            log.error(traceback.format_exc())


def sfw_handler(photo):
    pass

def nsfw_handler(photo):
    pass

def uploaded_handler(photo):
    """
    Photo was uploaded successfully, lets analayze it for nsfw content.
    """
    log.info('photo was uploaded %s', photo)

# Register our event types and their respective handlers
PubSub = (PubSubService()
    .register_handler(EVT_TYPE_UPLOADED, uploaded_handler)
    .register_handler(EVT_TYPE_NSFW_DETECTED, nsfw_handler)
    .register_handler(EVT_TYPE_SFW_DETECTED, sfw_handler))


@bp.route('/handler', methods=['post'])
def default_handler():
    if (request.args.get('token', '') != 
            current_app.config['PUBSUB']['VERIFICATION_TOKEN']):
        return 'Invalid request', 400

    try:
        # Extract the message envelope and underlying payload from the request
        envelope = json.loads(request.data.decode(PUBSUB_ENCODING_TYPE))
        payload_bytes = base64.b64decode(envelope['message']['data'])
        payload = json.loads(payload_bytes)
        
        if 'type' not in payload:
            raise KeyError('Payload is missing type: %s' % request.data)
        if 'data' not in payload:
            raise KeyError('Payload is missing data: %s' % request.data)
        PubSub.handle_event(payload['type'], payload['data'])
    except Exception as e:
        log.error(traceback.format_exc())

    return 'OK', 200


