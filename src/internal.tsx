import { createContext, useContext } from 'react';
import type { MarkerClusterer } from '@googlemaps/markerclusterer';
import type { GoogleMapsApiLoadOptions } from './loadGoogleMapsApi';

export type GoogleMapsStatus = 'idle' | 'loading' | 'ready' | 'error';

export type GoogleMapsApiContextValue = {
  status: GoogleMapsStatus;
  error: Error | null;
  google: typeof google | null;
  options: GoogleMapsApiLoadOptions | null;
};

export type MarkerLike = google.maps.Marker | google.maps.marker.AdvancedMarkerElement;

export type MarkerClustererContextValue = {
  clusterer: MarkerClusterer | null;
  registerMarker: (marker: MarkerLike) => void;
  unregisterMarker: (marker: MarkerLike) => void;
};

export const GoogleMapsApiContext = createContext<GoogleMapsApiContextValue>({
  status: 'idle',
  error: null,
  google: null,
  options: null
});

export const GoogleMapContext = createContext<google.maps.Map | null>(null);
export const MarkerClustererContext = createContext<MarkerClustererContextValue | null>(null);

export function useRequiredGoogleMap(componentName: string) {
  const map = useContext(GoogleMapContext);
  if (!map) {
    throw new Error(`${componentName} must be rendered inside <GoogleMap>.`);
  }
  return map;
}

export function useGoogleMapsApiContext() {
  return useContext(GoogleMapsApiContext);
}

export function useMarkerClustererContext() {
  return useContext(MarkerClustererContext);
}
