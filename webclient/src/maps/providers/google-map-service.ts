import { MapService, MapOptions, Marker } from '../types';
import { Geolocation } from '../../geolocation';

export class GoogleMapService implements MapService {
  
  /* The element that will hold the google map elements, should remove on clean up */
  private containerElRef?: HTMLElement;
  private markers: google.maps.Marker[] = [];

  constructor(private id: string, private map: google.maps.Map) {}

  init(elRef: HTMLElement, opts: MapOptions) {
    this.clear();

    if (opts.markers) {
      this.addMarkers(opts.markers);
    }
  
    this.map.setOptions({
       zoom: opts.zoom,
       draggable: opts.draggable,
       center: opts.geolocation && this.toLatLng(opts.geolocation)
    });

    if (opts.onDrag) {
      this.map.addListener('dragend', () => 
        opts.onDrag!(this.toGeolocation(this.map.getCenter())));
    }

    elRef.append(this.map.getDiv());
    this.containerElRef = elRef;
    
    return this;
  }

  private toGeolocation(latLng: google.maps.LatLng): Geolocation {
    return {lat: latLng.lat(), lng: latLng.lng()};
  }

  private toLatLng(geolocation: Geolocation): google.maps.LatLng {
    return new google.maps.LatLng(geolocation);
  }

  clear() {
    if (this.containerElRef) {
      // console.log('Clearing map!');
      this.containerElRef.removeChild(this.map.getDiv());
      this.containerElRef = undefined;
      this.clearMarkers();
    }
    return this;
  }

  clearMarkers() {
    // console.log('Clearing markers!');
    this.markers.forEach(marker => marker.setMap(null));
    this.markers = [];
    return this;
  }

  addMarkers(markers: Marker[], clearExisting: boolean = true) {
    if (clearExisting)
      this.clearMarkers();
    markers.forEach(marker => this.addMarker(marker));
    return this;
  }

  addMarker(m: Marker) {
    const marker = new google.maps.Marker({
      position: this.toLatLng(m.geolocation),
      map: this.map,
      draggable: false,
      clickable: false
    });

    if (m.onDrag) {
      marker.setDraggable(true);
      marker.addListener('drag', (evt: google.maps.MouseEvent) => m.onDrag!(m));
    }
    if (m.onDragEnd) {
      marker.setDraggable(true);
      marker.addListener('dragend', (evt: google.maps.MouseEvent) => m.onDragEnd!(m));
    }
    if (m.onClick) {
      marker.setClickable(true);
      marker.addListener('click', (evt: google.maps.MouseEvent) => m.onClick!(m));
    }
    this.markers.push(marker);
    return this;
  }

  gotoGeolocation(geolocation: Geolocation) {
    this.gotoLatLng(this.toLatLng(geolocation));
    return this;
  }

  private gotoLatLng(latLng: google.maps.LatLng) {
    this.map.panTo(latLng);
    return this; 
  }
}