import { Box } from './box';
import { Geolocation } from '../geolocation';
import { Service } from '../support/service';

export class BoxService extends Service<Box, string> {
  
  constructor() {
    super('/api/boxes');
  }

  search(geolocation: Geolocation) {
    return super.list({geo: `${geolocation.lat},${geolocation.lng}`});
  }

  photos(boxId: string) {
    return super.doFetch(`${this.baseEndPoint}/${boxId}/photos`);
  }

  upload(data: FormData) {
    return super.doFetch('/services/upload', {
      method: 'POST',
      headers: {'Content-Type': 'multipart/form-data'},
      body: data
    });
  }
}
