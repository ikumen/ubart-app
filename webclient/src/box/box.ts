import { Geolocation } from '../geolocation';

export interface Box {
  id?: string,
  description?: string,
  address: string,
  geohash?: string,
  geolocation: Geolocation,
  user?: string,
  cover?: string,
  images?: Image[]
}

export interface Image {
  id: string,
  datetime: string,
  type: string,
  user?: string
}