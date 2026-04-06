import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode
} from 'react';
import { GoogleMapContext } from './internal';
import { useGoogleMapsApi } from './hooks';
import { addListener, composeMapOptions, toLatLng, type LatLngLike } from './utils';

export type GoogleMapHandle = {
  map: google.maps.Map | null;
  fitBounds: (bounds: google.maps.LatLngBounds | google.maps.LatLngBoundsLiteral) => void;
  panBy: (x: number, y: number) => void;
  panTo: (position: google.maps.LatLng | google.maps.LatLngLiteral) => void;
  panToBounds: (
    bounds: google.maps.LatLngBounds | google.maps.LatLngBoundsLiteral,
    padding?: number | google.maps.Padding
  ) => void;
  setZoom: (zoom: number) => void;
  setCenter: (position: google.maps.LatLng | google.maps.LatLngLiteral) => void;
  setOptions: (options: google.maps.MapOptions) => void;
  getBounds: () => google.maps.LatLngBounds | null;
  getCenter: () => google.maps.LatLng | undefined;
  getClickableIcons: () => boolean | undefined;
  getHeading: () => number | undefined;
  getMapTypeId: () => google.maps.MapTypeId | string | undefined;
  getProjection: () => google.maps.Projection | null;
  getStreetView: () => google.maps.StreetViewPanorama | null;
  getTilt: () => number | undefined;
  getZoom: () => number | undefined;
  controls: () => google.maps.MVCArray<Node>[] | null;
  data: () => google.maps.Data | null;
  mapTypes: () => google.maps.MapTypeRegistry | null;
  overlayMapTypes: () => google.maps.MVCArray<google.maps.MapType | null> | null;
};

export type GoogleMapProps = Omit<HTMLAttributes<HTMLDivElement>, 'onClick'> & {
  children?: ReactNode;
  center?: LatLngLike;
  zoom?: number;
  mapId?: string;
  options?: google.maps.MapOptions;
  width?: CSSProperties['width'];
  height?: CSSProperties['height'];
  loadingFallback?: ReactNode;
  errorFallback?: ReactNode;
  onMapLoad?: (map: google.maps.Map) => void;
  onMapUnmount?: (map: google.maps.Map) => void;
  onClick?: (event: google.maps.MapMouseEvent | google.maps.IconMouseEvent) => void;
  onDblClick?: (event: google.maps.MapMouseEvent) => void;
  onDrag?: () => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onIdle?: () => void;
  onBoundsChanged?: () => void;
  onCenterChanged?: () => void;
  onHeadingChanged?: () => void;
  onMapTypeIdChanged?: () => void;
  onMouseMove?: (event: google.maps.MapMouseEvent) => void;
  onMouseOut?: (event: google.maps.MapMouseEvent) => void;
  onMouseOver?: (event: google.maps.MapMouseEvent) => void;
  onProjectionChanged?: () => void;
  onRightClick?: (event: google.maps.MapMouseEvent) => void;
  onTilesLoaded?: () => void;
  onTiltChanged?: () => void;
  onZoomChanged?: () => void;
};

const DEFAULT_CENTER = { lat: 37.421995, lng: -122.084092 };
const DEFAULT_ZOOM = 13;

export const GoogleMap = forwardRef<GoogleMapHandle, GoogleMapProps>(function GoogleMap(
  {
    children,
    center = DEFAULT_CENTER,
    zoom = DEFAULT_ZOOM,
    mapId,
    options,
    width = '100%',
    height = 460,
    loadingFallback,
    errorFallback,
    onMapLoad,
    onMapUnmount,
    onClick,
    onDblClick,
    onDrag,
    onDragStart,
    onDragEnd,
    onIdle,
    onBoundsChanged,
    onCenterChanged,
    onHeadingChanged,
    onMapTypeIdChanged,
    onMouseMove,
    onMouseOut,
    onMouseOver,
    onProjectionChanged,
    onRightClick,
    onTilesLoaded,
    onTiltChanged,
    onZoomChanged,
    className,
    style,
    ...divProps
  },
  ref
) {
  const { isLoaded, status, error, google } = useGoogleMapsApi();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const initialMapIdRef = useRef(mapId);

  useImperativeHandle(
    ref,
    () => ({
      map,
      fitBounds(bounds) {
        map?.fitBounds(bounds);
      },
      panBy(x, y) {
        map?.panBy(x, y);
      },
      panTo(position) {
        map?.panTo(position);
      },
      panToBounds(bounds, padding) {
        map?.panToBounds(bounds, padding);
      },
      setZoom(nextZoom) {
        map?.setZoom(nextZoom);
      },
      setCenter(position) {
        map?.setCenter(position);
      },
      setOptions(nextOptions) {
        map?.setOptions(nextOptions);
      },
      getBounds() {
        return map?.getBounds() || null;
      },
      getCenter() {
        return map?.getCenter();
      },
      getClickableIcons() {
        return map?.getClickableIcons();
      },
      getHeading() {
        return map?.getHeading();
      },
      getMapTypeId() {
        return map?.getMapTypeId();
      },
      getProjection() {
        return map?.getProjection() || null;
      },
      getStreetView() {
        return map?.getStreetView() || null;
      },
      getTilt() {
        return map?.getTilt();
      },
      getZoom() {
        return map?.getZoom();
      },
      controls() {
        return map?.controls || null;
      },
      data() {
        return map?.data || null;
      },
      mapTypes() {
        return map?.mapTypes || null;
      },
      overlayMapTypes() {
        return map?.overlayMapTypes || null;
      }
    }),
    [map]
  );

  useEffect(() => {
    if (!isLoaded || !google || !containerRef.current || map) {
      return;
    }

    const nextMap = new google.maps.Map(
      containerRef.current,
      composeMapOptions(options, {
        center,
        zoom,
        mapId: initialMapIdRef.current
      })
    );

    setMap(nextMap);
    onMapLoad?.(nextMap);

    return () => {
      onMapUnmount?.(nextMap);
      setMap(null);
    };
  }, [isLoaded, google, map]);

  useEffect(() => {
    if (!map) {
      return;
    }

    map.setOptions(
      composeMapOptions(options, {
        center,
        zoom
      })
    );
  }, [map, options, center, zoom]);

  useEffect(() => {
    if (!map || !center) {
      return;
    }

    const nextCenter = toLatLng(center);
    if (nextCenter) {
      map.setCenter(nextCenter);
    }
  }, [map, center]);

  useEffect(() => {
    if (!map || zoom === undefined) {
      return;
    }

    if (map.getZoom() !== zoom) {
      map.setZoom(zoom);
    }
  }, [map, zoom]);

  useEffect(() => {
    if (!map) {
      return;
    }

    const listeners = [
      addListener(map, 'click', onClick),
      addListener(map, 'dblclick', onDblClick),
      addListener(map, 'drag', onDrag),
      addListener(map, 'dragstart', onDragStart),
      addListener(map, 'dragend', onDragEnd),
      addListener(map, 'idle', onIdle),
      addListener(map, 'bounds_changed', onBoundsChanged),
      addListener(map, 'center_changed', onCenterChanged),
      addListener(map, 'heading_changed', onHeadingChanged),
      addListener(map, 'maptypeid_changed', onMapTypeIdChanged),
      addListener(map, 'mousemove', onMouseMove),
      addListener(map, 'mouseout', onMouseOut),
      addListener(map, 'mouseover', onMouseOver),
      addListener(map, 'projection_changed', onProjectionChanged),
      addListener(map, 'rightclick', onRightClick),
      addListener(map, 'tilesloaded', onTilesLoaded),
      addListener(map, 'tilt_changed', onTiltChanged),
      addListener(map, 'zoom_changed', onZoomChanged)
    ].filter(Boolean);

    return () => {
      listeners.forEach((listener) => listener?.remove());
    };
  }, [
    map,
    onClick,
    onDblClick,
    onDrag,
    onDragStart,
    onDragEnd,
    onIdle,
    onBoundsChanged,
    onCenterChanged,
    onHeadingChanged,
    onMapTypeIdChanged,
    onMouseMove,
    onMouseOut,
    onMouseOver,
    onProjectionChanged,
    onRightClick,
    onTilesLoaded,
    onTiltChanged,
    onZoomChanged
  ]);

  useEffect(() => {
    if (!map || !google || !containerRef.current || typeof ResizeObserver === 'undefined') {
      return;
    }

    const observer = new ResizeObserver(() => {
      const currentCenter = map.getCenter();
      google.maps.event.trigger(map, 'resize');
      if (currentCenter) {
        map.setCenter(currentCenter);
      }
    });

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [map, google]);

  const mergedStyle = useMemo<CSSProperties>(
    () => ({
      width,
      height,
      minHeight: typeof height === 'number' ? `${height}px` : undefined,
      position: 'relative',
      overflow: 'hidden',
      ...style
    }),
    [width, height, style]
  );

  return (
    <div {...divProps} className={className} style={mergedStyle} ref={containerRef}>
      {status === 'error' ? errorFallback || <MapStatus message={error?.message || 'The Google Maps API failed to load.'} tone="error" /> : null}
      {!isLoaded && status !== 'error' ? loadingFallback || <MapStatus message="Loading Google Maps JavaScript API…" tone="loading" /> : null}
      {map ? <GoogleMapContext.Provider value={map}>{children}</GoogleMapContext.Provider> : null}
    </div>
  );
});

function MapStatus({ message, tone }: { message: string; tone: 'loading' | 'error' }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'grid',
        placeItems: 'center',
        padding: '1rem',
        background: tone === 'error' ? 'rgba(255, 245, 245, 0.9)' : 'rgba(244, 249, 255, 0.9)',
        color: tone === 'error' ? '#8c2b2b' : '#24415f',
        fontSize: '0.95rem',
        zIndex: 0
      }}
    >
      <div>{message}</div>
    </div>
  );
}
