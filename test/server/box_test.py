import pytest

from server.box import BoxService 
from .helpers import datastore_client, with_clean_datastore


@pytest.fixture
def box_service(datastore_client):
    return BoxService(client=datastore_client)

def test_should_create_box_to_datastore(box_service, datastore_client, with_clean_datastore):
    data = dict(description='box near westwood',
                address='1234 acme street',
                geolocation=[34.050535, -118.430299])

    box_service.create(**data)
    query = datastore_client.query(kind=box_service._kind)
    entity = list(query.fetch())[0]

    assert entity, 'box data should have been saved to datastore'
    assert entity['geolocation'] == data['geolocation']

def test_should_convert_geolocation_to_geohash(box_service, datastore_client, with_clean_datastore):
    data = dict(description='box near westwood',
                address='1234 acme street',
                geolocation=[34.050535, -118.430299])

    box_service.create(**data)
    query = datastore_client.query(kind=box_service._kind)
    entity = list(query.fetch())[0]

    assert entity['geohash'] == '9q5c9', 'Geolocation should have been encoded to 9q5c9 geohash'
    
def test_search_should_return_box_at_given_geohash(box_service, datastore_client, with_clean_datastore):
    data = dict(description='box near westwood',
                address='1234 acme street',
                geolocation=[34.050535, -118.430299])

    box_service.create(**data)
    results = box_service.search_by_geohash('9q5c9')

    assert len(results) == 1
    assert results[0]['address'] == data['address']

def test_search_should_return_box_at_given_geolocation(box_service, datastore_client, with_clean_datastore):
    data = dict(description='box near westwood',
                address='1234 acme street',
                geolocation=[34.050535, -118.430299])

    box_service.create(**data)
    results = box_service.search_by_geolocation(data['geolocation'])

    assert len(results) == 1
    assert results[0]['address'] == data['address']

