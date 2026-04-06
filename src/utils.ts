import type { MarkerLike } from './internal';

export type LatLngLike = google.maps.LatLngLiteral | google.maps.LatLng;

export function addListener<T extends object>(
  target: T | null | undefined,
  eventName: string,
  handler: ((...args: any[]) => void) | undefined
) {
  if (!target || !handler) {
    return null;
  }

  return google.maps.event.addListener(target as any, eventName, (...args: any[]) => {
    handler(...args);
  });
}

export function composeMapOptions(options: google.maps.MapOptions | undefined, extra: Partial<google.maps.MapOptions>) {
  return {
    ...options,
    ...removeUndefined(extra)
  };
}

export function removeUndefined<T extends Record<string, any>>(input: T) {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined)) as Partial<T>;
}

export function toLatLng(value: LatLngLike | undefined | null) {
  if (!value) {
    return null;
  }

  if (value instanceof google.maps.LatLng) {
    return value;
  }

  return new google.maps.LatLng(value);
}

export function toMVCArrayPath(path: Array<LatLngLike>) {
  return path.map((point) => (point instanceof google.maps.LatLng ? point : new google.maps.LatLng(point)));
}

export function isLatLngLiteral(value: unknown): value is google.maps.LatLngLiteral {
  return (
    typeof value === 'object' &&
    value !== null &&
    'lat' in (value as any) &&
    'lng' in (value as any)
  );
}

export function markerToAnchor(marker: MarkerLike) {
  return marker as unknown as google.maps.MVCObject;
}

export function shallowBoundsEqual(
  left: google.maps.LatLngBoundsLiteral | undefined,
  right: google.maps.LatLngBoundsLiteral | undefined
) {
  return (
    left?.east === right?.east &&
    left?.west === right?.west &&
    left?.north === right?.north &&
    left?.south === right?.south
  );
}
