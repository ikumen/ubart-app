
DEFAULT_PRECISION = 10
MAX_PRECISION = 22

BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz'

NEIGHBOR = dict(
    n=[ 'p0r21436x8zb9dcf5h7kjnmqesgutwvy', 'bc01fg45238967deuvhjyznpkmstqrwx' ],
    s=[ '14365h7k9dcfesgujnmqp0r2twvyx8zb', '238967debc01fg45kmstqrwxuvhjyznp' ],
    e=[ 'bc01fg45238967deuvhjyznpkmstqrwx', 'p0r21436x8zb9dcf5h7kjnmqesgutwvy' ],
    w=[ '238967debc01fg45kmstqrwxuvhjyznp', '14365h7k9dcfesgujnmqp0r2twvyx8zb' ])

BORDER = dict(
    n=[ 'prxz',     'bcfguvyz' ],
    s=[ '028b',     '0145hjnp' ],
    e=[ 'bcfguvyz', 'prxz'     ],
    w=[ '0145hjnp', '028b'     ]
)


def encode(lat, lng, precision=DEFAULT_PRECISION):
    if precision < 1 or precision > MAX_PRECISION:
        raise ValueError('Precision must be > 0 and < MAX_PRECISION')
    
    lat_range = dict(min=-90, max=90)
    lng_range = dict(min=-180, max=180)

    hash = ''
    hashVal = 0
    bits = 0
    even = True

    while len(hash) < precision:
        val = lng if even else lat
        l_range = lng_range if even else lat_range
        mid = (l_range['min'] + l_range['max']) / 2

        if val > mid:
            hashVal = (hashVal << 1) + 1
            l_range['min'] = mid
        else:
            hashVal = (hashVal << 1) + 0
            l_range['max'] = mid

        even = not even
        if bits < 4:
            bits += 1
        else:
            bits = 0
            hash += BASE32[hashVal]
            hashVal = 0
    return hash



def adjacent(geohash, direction):
    if 'nswe'.find(direction) == -1:
        raise ValueError('Invalid direction')

    last_char = geohash[-1:]
    parent = geohash[:-1]
    hash_type = len(geohash) % 2

    if BORDER[direction][hash_type].find(last_char) != -1 and parent is not '':
        parent = adjacent(parent, direction)

    return parent + BASE32[NEIGHBOR[direction][hash_type].find(last_char)]


def neighbors(geohash):
    return [
        adjacent(geohash, 'n'),
        adjacent(adjacent(geohash, 'n'), 'e'),
        adjacent(geohash, 'e'),
        adjacent(adjacent(geohash, 's'), 'e'),
        adjacent(geohash, 's'),
        adjacent(adjacent(geohash, 's'), 'w'),
        adjacent(geohash, 'w'),
        adjacent(adjacent(geohash, 'n'), 'w')
    ]


    

