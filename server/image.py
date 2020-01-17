import requests
import logging
import json

from flask import Blueprint, request, current_app, jsonify
from concurrent import futures
from werkzeug.exceptions import Unauthorized
from . import support, pubsub_service, imgur_service, box_store, vision_service

log = logging.getLogger(__name__)
bp = Blueprint('images', __name__, url_prefix='/services/image')


UPLOADED_EVENT ='uploaded'
NSFW_DETECTED_EVENT ='nsfw-detected'
SFW_DETECTED_EVENT ='sfw-detected'

event_handlers = {}

def _handle_nsfw_event(image):
    log.info('Handling NSFW image event: %s' % image)
    imgur_service.reject_image(image)

def _handle_sfw_event(image):
    log.info('Handling SFW image event: %s' % image)
    box_store.update(
        id=image['box'],
        images=[{
            'id': image['id'],
            'user': image['user'],
            'datetime': image['datetime'],
            'deletehash': image['deletehash'],
            'type': image['type']
        }])

    
def _handle_uploaded_event(image):
    log.info('Handling image uploaded event: %s' % image)
    if vision_service.is_image_nsfw(image['url']):
        pubsub_service.publish(NSFW_DETECTED_EVENT, image)
    else:
        pubsub_service.publish(SFW_DETECTED_EVENT, image)

# Register the event handlers that can process an image
event_handlers[SFW_DETECTED_EVENT] = _handle_sfw_event
event_handlers[NSFW_DETECTED_EVENT] = _handle_nsfw_event
event_handlers[UPLOADED_EVENT] = _handle_uploaded_event


@bp.route('/events', methods=['post'])
def handle_image_events():
    """Entry point for incoming pubsub events related to an image, for
    example (uploaded, nsfw detected,...).
    """
    if (request.args.get('token', '') != 
            current_app.config['PUBSUB']['VERIFICATION_TOKEN']):
        return Unauthorized()
    try:
        envelope = json.loads(request.data.decode(support.PUBSUB_ENCODING))
        payload_bytes = base64.b64decode(envelope['message']['data'])
        payload = json.loads(payload_bytes)

        event = payload.get('event', None)
        data = payload.get('data', None)

        if not data:
            raise KeyError('Payload is missing data: %s' % envelope)
        if not event:
            raise KeyError('Payload is missing event type: %s' % envelope)
        elif event not in event_handlers:
            raise KeyError('Unsupported event: %s' % payload['event'])
        # Find an event handler to process
        event_handlers[event](data)
    except Exception as e:
        log.error(traceback.format_exc())

    return 'OK', 200
        

@bp.route('/upload', methods=['post'])
def upload_image(*args, **kwargs):
    """Proxy for uploading images from client to Imgur. Before sending 
    off to Imgur, we attach our authorization to the request.
    """
    request_headers = {k:v for (k,v) in request.headers if k != 'Host'}
    # TODO: hard coded to get this working. Need to dynamically request 
    # OAuth token using the refresh token
    request_headers['Authorization'] = 'Bearer %s' % current_app.config['IMGUR']['AUTH']['USER_ACCESS_TOKEN']

    resp = requests.request(
        url='https://api.imgur.com/3/upload',
        method=request.method, 
        headers=request_headers, 
        data=request.get_data(),
        cookies=request.cookies,
        allow_redirects=False,
        stream=True)
    
    status_code = resp.status_code
    resp_data = resp.json()['data']
    if status_code == requests.codes.ok:
        # name is built client side with form "boxid_userid"
        box_id, user_id = resp_data.get('name', '').split('_', maxsplit=1)
        # naively get file extension
        file_type = resp_data['link'].split('.')[-1]
        image = {
            'id': resp_data['id'],
            'box': int(box_id),
            'user': user_id,
            'deletehash': resp_data['deletehash'],
            'type': file_type,
            'url': resp_data['link'],
            'datetime': resp_data['datetime']
        }
        # Notify backend process to analyze image we just uploaded
        pubsub_service.publish(UPLOADED_EVENT, image)
        return jsonify({'id': image['id']}), 200 
    
    log.error('Unable to upload to Imgur: %s, %s', status_code, resp['reason'])
    return jsonify({'msg': 'Upload failed'}), status_code


