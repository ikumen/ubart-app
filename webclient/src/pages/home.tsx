import React from 'react';

import { Map, ZoomLevel } from '../maps';

export const Home: React.FC = () => (
  <main className="fl cf w-100 pv0">
    <Map 
      id="gmap"
      draggable={true}
      zoom={ZoomLevel.City}
      geolocation={{lng: -118.4484367, lat: 34.04485831074301}}
    />
  </main>
);

