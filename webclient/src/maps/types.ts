import { Geolocation } from '../geolocation';
import { Box } from '../box';

export enum ZoomLevel {
  City = 12,
  Street = 14,
}

/**
 * Represents a location marker on a map, usually associated
 * with some piece of geospatial data.
 */
export interface Marker {
  geolocation: Geolocation,
  data?: any,
  /* Optional event handlers to associate with this Marker. */
  onDrag?: MarkerEventHandler,
  onDragEnd?: MarkerEventHandler,
  onClick?: MarkerEventHandler
}

/**
 * Event handler for Marker's onDrag, onDragEnd and onClick events.
 * 
 * @param marker that cause the event
 */
export type MarkerEventHandler = (marker: Marker) => void;

/**
 * Handles geolocation changes.
 * 
 * @param geolocation
 */
export type GeolocationChangedHandler = (geolocation: Geolocation) => void;

/**
 * Options to give a map on creation.
 */
export type MapOptions = {
  zoom?: ZoomLevel,
  draggable?: boolean,
  onDrag?: GeolocationChangedHandler,
  geolocation?: Geolocation,
  markers?: Marker[]
}

/**
 * Provider agnostic map service, responsible for rendering the map 
 * and managing interactions with the underlying provider.
 */
export interface MapService {
  /**
   * Move the map center to the given geolocation.
   * @param geolocation
   */
  gotoGeolocation: (geolocation: Geolocation) => MapService,

  /**
   * Display the given Marker on the map.
   * @param marker
   */
  addMarker: (marker: Marker) => MapService,

  addMarkers: (markers: Marker[], clearExisting: boolean) => MapService,

  /**
   * Removes all the markers on the map (not just hiding them).
   */
  clearMarkers: () => MapService,

  /**
   * Destroy the map, needed when we navigate away.
   */
  clear: () => MapService,

  /**
   * Render map and all it's markers.
   * 
   * @param elRef the HTMLElement to attach the map to
   * @param opts the options to configure this map with
   */
  init: (elRef: HTMLElement, opts: MapOptions) => MapService
}