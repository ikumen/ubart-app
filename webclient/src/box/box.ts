import { Geolocation } from '../geolocation';

export interface Box {
  id?: string,
  description?: string,
  address: string,
  geohash?: string,
  geolocation: Geolocation,
  user?: string,
  cover?: string,
  photos?: string[]
}

export interface Photo {
  id: string,
  user?: string
}