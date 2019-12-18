import pytest

from server import geohash

def test_should_encode_given_geolocation():
    h = geohash.encode(34.050535, -118.430299, precision=5)
    assert h == '9q5c9'

    h = geohash.encode(34.050535, -118.430299, precision=6)
    assert h == '9q5c9n'

    h = geohash.encode(34.050535, -118.430299, precision=4)
    assert h == '9q5c'  

def test_should_return_neighbors():
    expected_neighbors = ['9q5c2','9q5c3','9q5c6','9q5c8','9q5cb','9q5cc','9q5cd','9q5cf']
    neighbors = geohash.neighbors('9q5c9')
    neighbors.sort()
    
    assert neighbors == expected_neighbors