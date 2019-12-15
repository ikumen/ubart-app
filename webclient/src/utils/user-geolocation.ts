import { Geolocation } from '../geolocation';

/**
 * Get the user's browser geolocation settings (e.g, navigator.geolocation),
 * otherwise return the default geolocation (Los Angeles, CA).
 */
export const getUserGeolocation = (): Promise<Geolocation> => {
  return new Promise(resolve => {
    const defaultGeolocation = {lng: -118.4484367, lat: 34.04485831074301};
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (p) => resolve({lng: p.coords.longitude, lat: p.coords.latitude}),
          () => resolve(defaultGeolocation),
          {timeout: 5000}
        );
      } else {
        resolve(defaultGeolocation);
      }
    } catch (e) {
      resolve(defaultGeolocation);
    }
  });
}