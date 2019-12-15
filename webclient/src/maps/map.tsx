import React from 'react';
import { MapService, MapOptions, ZoomLevel, Marker } from './types';
import { mapServiceProviders } from './providers';


export type MapProps = MapOptions & {
  id: string
}

export class Map extends React.Component<MapProps> {

  private mapService = mapServiceProviders.google.createMap(this.props.id);
  private mapContainerRef = React.createRef<HTMLDivElement>();

  static defaultProps = {
    zoom: ZoomLevel.City,
    markers: [],
    geolocation: undefined,
    draggable: false
  }


  initMap = (mapService: MapService) => {
    mapService.init(this.mapContainerRef.current!, {...this.props});
  }

  shouldUpdateMarkers(prevMarkers: Marker[], markers: Marker[]) {
    return prevMarkers.filter(prevMarker => {
      for (let i=0; i < markers.length; i++) {
        const m1 = JSON.stringify(prevMarker);
        const m2 = JSON.stringify(markers[i]);
        if (m1 === m2) return true;
      }
      return false;
    }).length !== markers.length;
  }

  updateMap = (mapService: MapService, prevProps: MapProps) => {
    const {geolocation, markers} = this.props;
    if (geolocation && prevProps.geolocation !== geolocation) {
      mapService.gotoGeolocation(geolocation);
    }
    if (!markers || !prevProps.markers || prevProps.markers.length !== markers.length
        || this.shouldUpdateMarkers(prevProps.markers, markers)) {
      mapService.addMarkers(markers!, true);
    }
  }

  componentDidMount() {
    this.mapService.then(this.initMap);
  }

  componentDidUpdate(prevProps: MapProps) {
    this.mapService.then(service => this.updateMap(service, prevProps));
  }

  componentWillUnmount() {
    // console.log('Unmounting map');
    this.mapService.then(mapService => mapService.clear());
  }

  render() {
    return <div ref={this.mapContainerRef}></div>
  }
}