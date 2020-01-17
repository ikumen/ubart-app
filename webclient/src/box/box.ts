import { Geolocation } from '../geolocation';

export interface Box {
  id?: string,
  description?: string,
  address: string,
  geohash?: string,
  geolocation: Geolocation,
  user?: string,
  cover?: string,
  images?: string[]
}

export interface Image {
  id: string,
  user?: string
}