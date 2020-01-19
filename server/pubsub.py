import traceback
import logging
import json

from concurrent import futures
from flask import current_app, Blueprint, request
from google.cloud import pubsub_v1
from . import support


log = logging.getLogger(__name__)


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

    def _publish(self, evt_type, data):
        try:
            topic = self.publisher.topic_path(self.config['project'], self.config['topic'])
            # Each msg will have a type and associated data,
            # and will need to be encoded
            payload = json.dumps({
                    'event': evt_type,
                    'data': data}
                ).encode(support.PUBSUB_ENCODING) 
            log.info('Publishing to Cloud PubSub: %s' % payload)  
            result = self.publisher.publish(topic, data=payload)
            log.debug('Successfully published to "%s"' % topic)
        except Exception as e:
            log.error(traceback.format_exc())
