import { useContext, useRef } from 'react';
import { GoogleMapContext, useGoogleMapsApiContext } from './internal';

export function useGoogleMapsApi() {
  const context = useGoogleMapsApiContext();
  return {
    ...context,
    isLoaded: context.status === 'ready' && !!context.google
  };
}

export function useGoogleMap() {
  return useContext(GoogleMapContext);
}

export function useMapGeocoder() {
  const { google, isLoaded } = useGoogleMapsApi();
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  if (isLoaded && google && !geocoderRef.current) {
    geocoderRef.current = new google.maps.Geocoder();
  }

  return geocoderRef.current;
}

export function useDirectionsService() {
  const { google, isLoaded } = useGoogleMapsApi();
  const directionsServiceRef = useRef<google.maps.DirectionsService | null>(null);

  if (isLoaded && google && !directionsServiceRef.current) {
    directionsServiceRef.current = new google.maps.DirectionsService();
  }

  return directionsServiceRef.current;
}
