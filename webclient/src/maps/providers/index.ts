import { MapOptions, MapService, ZoomLevel, GeolocationChangedHandler } from '../types';
import { GoogleMapService } from './google-map-service';
import { loadScript } from '../../utils';

type GoogleMapAutoCompleteItem = {
  autoComplete: google.maps.places.Autocomplete,
  autoCompleteListener: google.maps.MapsEventListener
}

class GoogleMapServiceFactory {
  private mapScript!: Promise<void>;
  private maps: {[key: string]: Promise<MapService>} = {};
  private autoCompleteItems: {[key: string]: Promise<GoogleMapAutoCompleteItem>} = {};

  createSearchBox(id: string, inputEl: HTMLInputElement, handler: GeolocationChangedHandler)
    : Promise<GoogleMapAutoCompleteItem>
  {
    if (this.autoCompleteItems[id]) {
      return this.autoCompleteItems[id];
    }

    this.autoCompleteItems[id] = new Promise<GoogleMapAutoCompleteItem>((resolve, reject) => {
      this.loadMapScript().then(() => {
        const autoComplete = new google.maps.places.Autocomplete(inputEl, {
          fields: ['geometry'],
          types: ['geocode']
        });

        resolve({
          autoComplete, 
          autoCompleteListener: autoComplete.addListener('place_changed', () => {
            const place = autoComplete.getPlace();
            if (place && place.geometry) {
              const latLng = place.geometry.location;
              handler({lat: latLng.lat(), lng: latLng.lng()});
            }       
            // TODO: no places found?     
          }),
        });
      });
    });
    return this.autoCompleteItems[id];
  }

  private createMapDiv(id: string) {
    const div = document.createElement('div');
    div.id = id;
    return div;
  }

  createMap(id: string, opts: MapOptions = {zoom: ZoomLevel.City}) 
    : Promise<MapService> 
  {
    if (this.maps[id]) {
      // console.log('Map already exists');
      return this.maps[id];
    }

    this.maps[id] = new Promise<MapService>((resolve, reject) => {
      this.loadMapScript().then(() => {
        const googleMap = new google.maps.Map(this.createMapDiv(id), {
          zoom: opts.zoom,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          clickableIcons: false,
          fullscreenControl: false,
          streetViewControl: false,
          mapTypeControl: false,
          draggable: opts.draggable,
          styles: [
            {
              featureType: 'poi',
              stylers: [{visibility: 'off'}]
            },
            // {elementType: 'geometry', stylers: [{color: '#242f3e'}]},
            // {elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
            // {elementType: 'labels.text.fill', stylers: [{color: '#746855'}]},
            // {
            //   featureType: 'administrative.locality',
            //   elementType: 'labels.text.fill',
            //   stylers: [{color: '#d59563'}]
            // },
            // {
            //   featureType: 'poi',
            //   elementType: 'labels.text.fill',
            //   stylers: [{color: '#d59563'}]
            // },
            // {
            //   featureType: 'poi.park',
            //   elementType: 'geometry',
            //   stylers: [{color: '#263c3f'}]
            // },
            // {
            //   featureType: 'poi.park',
            //   elementType: 'labels.text.fill',
            //   stylers: [{color: '#6b9a76'}]
            // },
            // {
            //   featureType: 'road',
            //   elementType: 'geometry',
            //   stylers: [{color: '#38414e'}]
            // },
            // {
            //   featureType: 'road',
            //   elementType: 'geometry.stroke',
            //   stylers: [{color: '#212a37'}]
            // },
            // {
            //   featureType: 'road',
            //   elementType: 'labels.text.fill',
            //   stylers: [{color: '#9ca5b3'}]
            // },
            // {
            //   featureType: 'road.highway',
            //   elementType: 'geometry',
            //   stylers: [{color: '#746855'}]
            // },
            // {
            //   featureType: 'road.highway',
            //   elementType: 'geometry.stroke',
            //   stylers: [{color: '#1f2835'}]
            // },
            // {
            //   featureType: 'road.highway',
            //   elementType: 'labels.text.fill',
            //   stylers: [{color: '#f3d19c'}]
            // },
            // {
            //   featureType: 'transit',
            //   elementType: 'geometry',
            //   stylers: [{color: '#2f3948'}]
            // },
            // {
            //   featureType: 'transit.station',
            //   elementType: 'labels.text.fill',
            //   stylers: [{color: '#d59563'}]
            // },
            // {
            //   featureType: 'water',
            //   elementType: 'geometry',
            //   stylers: [{color: '#17263c'}]
            // },
            // {
            //   featureType: 'water',
            //   elementType: 'labels.text.fill',
            //   stylers: [{color: '#515c6d'}]
            // },
            // {
            //   featureType: 'water',
            //   elementType: 'labels.text.stroke',
            //   stylers: [{color: '#17263c'}]
            // }                 
          ]
        });
        resolve(new GoogleMapService(id, googleMap));
      });
    })
    return this.maps[id];
  }

  private loadMapScript() {
    if (this.mapScript) {
      return this.mapScript;
    }

    const google = (window as any).google || {};
    //const mapApiKey = getCookie('mapApiKey') || '';
    const mapApiKey = 'AIzaSyDm65_9x4XBZkup0lXhdy4IB7_d6BIsbpY';
    const src = `https://maps.googleapis.com/maps/api/js?key=${mapApiKey}&libraries=places`;
  
    if (!google.maps) {
      return loadScript(src).then(() => this.mapScript = Promise.resolve());
    }
    // google maps already loaded, but we didn't know about it
    return (this.mapScript = Promise.resolve()); 
  }
}

export const mapServiceProviders = {
  google: new GoogleMapServiceFactory(),
}

