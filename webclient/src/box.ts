import { Geolocation } from './geolocation';

export interface Box {
  id?: string,
  description?: string,
  address: string,
  geohash: string,
  geolocation: Geolocation,
  user?: string,
  coverPhoto?: string,
  photos: string[]
}

