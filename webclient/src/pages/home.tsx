import React from 'react';

import { Map, ZoomLevel } from '../maps';
import { RouterProps } from '../support';
import { Geolocation } from '../geolocation';


type HomeProps = RouterProps & {
  geolocation?: Geolocation
}

export class Home extends React.Component<HomeProps> {

  render() {
    console.log(this.props.geolocation)
    return <main className="fl cf w-100 pv0">
      <Map 
        id="main"
        draggable={true}
        zoom={ZoomLevel.City}
        geolocation={this.props.geolocation}
      />
    </main>
  }
}
