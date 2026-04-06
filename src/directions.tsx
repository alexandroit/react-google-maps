import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useDirectionsService, useGoogleMap } from './hooks';
import { addListener } from './utils';

export type DirectionsServiceResult = {
  status: google.maps.DirectionsStatus;
  result: google.maps.DirectionsResult | null;
};

export type MapDirectionsRendererHandle = {
  renderer: google.maps.DirectionsRenderer | null;
  getDirections: () => google.maps.DirectionsResult | null | undefined;
  getPanel: () => Node | null | undefined;
  getRouteIndex: () => number | undefined;
  setDirections: (directions: google.maps.DirectionsResult | null) => void;
  setOptions: (options: google.maps.DirectionsRendererOptions) => void;
  setRouteIndex: (routeIndex: number) => void;
};

export type MapDirectionsRendererProps = {
  directions?: google.maps.DirectionsResult | null;
  options?: google.maps.DirectionsRendererOptions;
  onLoad?: (renderer: google.maps.DirectionsRenderer) => void;
  onUnmount?: (renderer: google.maps.DirectionsRenderer) => void;
  onDirectionsChanged?: () => void;
};

export const MapDirectionsRenderer = forwardRef<MapDirectionsRendererHandle, MapDirectionsRendererProps>(function MapDirectionsRenderer({
  directions,
  options,
  onLoad,
  onUnmount,
  onDirectionsChanged
}, ref) {
  const map = useGoogleMap();
  const [renderer, setRenderer] = useState<google.maps.DirectionsRenderer | null>(null);

  useImperativeHandle(
    ref,
    () => ({
      renderer,
      getDirections() {
        return renderer?.getDirections() || null;
      },
      getPanel() {
        return renderer?.getPanel() || null;
      },
      getRouteIndex() {
        return renderer?.getRouteIndex();
      },
      setDirections(nextDirections) {
        renderer?.setDirections(nextDirections);
      },
      setOptions(nextOptions) {
        renderer?.setOptions(nextOptions);
      },
      setRouteIndex(nextRouteIndex) {
        renderer?.setRouteIndex(nextRouteIndex);
      }
    }),
    [renderer]
  );

  useEffect(() => {
    if (!map || renderer) {
      return;
    }

    const instance = new google.maps.DirectionsRenderer({
      ...options,
      map
    });
    setRenderer(instance);
    onLoad?.(instance);

    return () => {
      onUnmount?.(instance);
      instance.setMap(null);
    };
  }, [map, renderer]);

  useEffect(() => {
    if (!renderer) {
      return;
    }

    renderer.setOptions({
      ...options,
      directions: directions || undefined,
      map
    });
  }, [renderer, directions, options, map]);

  useEffect(() => {
    if (!renderer) {
      return;
    }

    const listener = addListener(renderer, 'directions_changed', onDirectionsChanged);
    return () => {
      listener?.remove();
    };
  }, [renderer, onDirectionsChanged]);

  return null;
});

export function MapDirectionsService({
  request,
  onResult,
  onError
}: {
  request?: google.maps.DirectionsRequest | null;
  onResult: (response: DirectionsServiceResult) => void;
  onError?: (error: Error) => void;
}) {
  const service = useDirectionsService();
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!service || !request) {
      return;
    }

    requestIdRef.current += 1;
    const currentRequestId = requestIdRef.current;

    service.route(request, (result, status) => {
      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      if (status === google.maps.DirectionsStatus.OK && result) {
        onResult({ status, result });
      } else {
        const error = new Error(`Directions request failed with status ${status}.`);
        onResult({ status, result: result || null });
        onError?.(error);
      }
    });
  }, [service, request, onResult, onError]);

  return null;
}
