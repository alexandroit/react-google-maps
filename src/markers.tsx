import { MarkerClusterer, type Algorithm, type Cluster, type Renderer } from '@googlemaps/markerclusterer';
import {
  useContext,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from 'react';
import { createPortal } from 'react-dom';
import { MarkerClustererContext, type MarkerLike } from './internal';
import { useGoogleMap, useGoogleMapsApi } from './hooks';
import { addListener, removeUndefined, toLatLng, type LatLngLike } from './utils';

export type MapMarkerHandle = {
  marker: google.maps.Marker | null;
  getAnimation: () => google.maps.Animation | null | undefined;
  getClickable: () => boolean | undefined;
  getDraggable: () => boolean | undefined;
  getIcon: () => string | google.maps.Icon | google.maps.Symbol | null | undefined;
  getLabel: () => string | google.maps.MarkerLabel | null | undefined;
  getPosition: () => google.maps.LatLng | null | undefined;
  getTitle: () => string | null | undefined;
  getVisible: () => boolean | undefined;
  getZIndex: () => number | null | undefined;
  setAnimation: (animation: google.maps.Animation | null) => void;
  setOptions: (options: google.maps.MarkerOptions) => void;
  setPosition: (position: google.maps.LatLng | google.maps.LatLngLiteral) => void;
  setTitle: (title: string) => void;
  setVisible: (visible: boolean) => void;
  setZIndex: (zIndex: number) => void;
};

export type MapAdvancedMarkerHandle = {
  marker: google.maps.marker.AdvancedMarkerElement | null;
  content: HTMLElement | null;
  setMap: (map: google.maps.Map | null) => void;
  setPosition: (position: google.maps.LatLng | google.maps.LatLngLiteral) => void;
  setZIndex: (zIndex: number) => void;
};

export type MapInfoWindowHandle = {
  infoWindow: google.maps.InfoWindow | null;
  open: (anchor?: MarkerLike | null) => void;
  close: () => void;
  getContent: () => string | Node | null | undefined;
  getPosition: () => google.maps.LatLng | null | undefined;
  getZIndex: () => number | undefined;
  setContent: (content: string | Element | Text) => void;
  setPosition: (position: google.maps.LatLng | google.maps.LatLngLiteral) => void;
  setZIndex: (zIndex: number) => void;
};

export type MapMarkerClustererHandle = {
  clusterer: MarkerClusterer | null;
  addMarker: (marker: MarkerLike, noDraw?: boolean) => void;
  addMarkers: (markers: MarkerLike[], noDraw?: boolean) => void;
  removeMarker: (marker: MarkerLike, noDraw?: boolean) => boolean;
  clearMarkers: (noDraw?: boolean) => void;
  render: () => void;
};

export type MapMarkerProps = {
  position: LatLngLike;
  title?: string;
  label?: string | google.maps.MarkerLabel;
  clickable?: boolean;
  draggable?: boolean;
  icon?: string | google.maps.Icon | google.maps.Symbol;
  visible?: boolean;
  zIndex?: number;
  animation?: google.maps.Animation;
  options?: google.maps.MarkerOptions;
  onLoad?: (marker: google.maps.Marker) => void;
  onUnmount?: (marker: google.maps.Marker) => void;
  onClick?: (event: google.maps.MapMouseEvent) => void;
  onDblClick?: (event: google.maps.MapMouseEvent) => void;
  onDrag?: (event: google.maps.MapMouseEvent) => void;
  onDragEnd?: (event: google.maps.MapMouseEvent) => void;
  onDragStart?: (event: google.maps.MapMouseEvent) => void;
  onMouseDown?: (event: google.maps.MapMouseEvent) => void;
  onMouseOut?: (event: google.maps.MapMouseEvent) => void;
  onMouseOver?: (event: google.maps.MapMouseEvent) => void;
  onMouseUp?: (event: google.maps.MapMouseEvent) => void;
  onRightClick?: (event: google.maps.MapMouseEvent) => void;
};

export type MapAdvancedMarkerProps = {
  position: LatLngLike;
  title?: string;
  zIndex?: number;
  gmpClickable?: boolean;
  gmpDraggable?: boolean;
  options?: google.maps.marker.AdvancedMarkerElementOptions;
  collisionBehavior?: google.maps.CollisionBehavior;
  children?: ReactNode;
  onLoad?: (marker: google.maps.marker.AdvancedMarkerElement) => void;
  onUnmount?: (marker: google.maps.marker.AdvancedMarkerElement) => void;
  onClick?: (event: google.maps.MapMouseEvent) => void;
  onDragStart?: (event: google.maps.MapMouseEvent) => void;
  onDrag?: (event: google.maps.MapMouseEvent) => void;
  onDragEnd?: (event: google.maps.MapMouseEvent) => void;
};

export type MapInfoWindowProps = {
  anchor?: MarkerLike | null;
  open?: boolean;
  position?: LatLngLike;
  zIndex?: number;
  options?: google.maps.InfoWindowOptions;
  children?: ReactNode;
  onLoad?: (infoWindow: google.maps.InfoWindow) => void;
  onUnmount?: (infoWindow: google.maps.InfoWindow) => void;
  onCloseClick?: () => void;
  onDomReady?: () => void;
  onContentChanged?: () => void;
  onPositionChanged?: () => void;
  onZIndexChanged?: () => void;
};

export type MapMarkerClustererProps = {
  children?: ReactNode;
  algorithm?: Algorithm;
  renderer?: Renderer;
  onLoad?: (clusterer: MarkerClusterer) => void;
  onUnmount?: (clusterer: MarkerClusterer) => void;
  onClusterClick?: (event: google.maps.MapMouseEvent, cluster: Cluster, map: google.maps.Map) => void;
};

export const MapMarker = forwardRef<MapMarkerHandle, MapMarkerProps>(function MapMarker(
  {
    position,
    title,
    label,
    clickable,
    draggable,
    icon,
    visible,
    zIndex,
    animation,
    options,
    onLoad,
    onUnmount,
    onClick,
    onDblClick,
    onDrag,
    onDragEnd,
    onDragStart,
    onMouseDown,
    onMouseOut,
    onMouseOver,
    onMouseUp,
    onRightClick
  },
  ref
) {
  const map = useGoogleMap();
  const clustererContext = useContext(MarkerClustererContext);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const onLoadRef = useRef(onLoad);
  const onUnmountRef = useRef(onUnmount);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);

  onLoadRef.current = onLoad;
  onUnmountRef.current = onUnmount;

  useImperativeHandle(
    ref,
    () => ({
      marker,
      getAnimation() {
        return marker?.getAnimation();
      },
      getClickable() {
        return marker?.getClickable();
      },
      getDraggable() {
        return marker?.getDraggable();
      },
      getIcon() {
        return marker?.getIcon();
      },
      getLabel() {
        return marker?.getLabel();
      },
      getPosition() {
        return marker?.getPosition();
      },
      getTitle() {
        return marker?.getTitle();
      },
      getVisible() {
        return marker?.getVisible();
      },
      getZIndex() {
        return marker?.getZIndex();
      },
      setAnimation(nextAnimation) {
        marker?.setAnimation(nextAnimation);
      },
      setOptions(nextOptions) {
        marker?.setOptions(nextOptions);
      },
      setPosition(nextPosition) {
        marker?.setPosition(nextPosition);
      },
      setTitle(nextTitle) {
        marker?.setTitle(nextTitle);
      },
      setVisible(nextVisible) {
        marker?.setVisible(nextVisible);
      },
      setZIndex(nextZIndex) {
        marker?.setZIndex(nextZIndex);
      }
    }),
    [marker]
  );

  useEffect(() => {
    if (!map || markerRef.current) {
      return;
    }

    const instance = new google.maps.Marker();
    markerRef.current = instance;
    setMarker(instance);
    onLoadRef.current?.(instance);

    return () => {
      google.maps.event.clearInstanceListeners(instance);
      onUnmountRef.current?.(instance);
      clustererContext?.unregisterMarker(instance);
      instance.setMap(null);
      markerRef.current = null;
      setMarker(null);
    };
  }, [map, clustererContext]);

  useEffect(() => {
    if (!marker || !map) {
      return;
    }

    marker.setOptions({
      ...options,
      ...removeUndefined({
        position,
        title,
        label,
        clickable,
        draggable,
        icon,
        visible,
        zIndex,
        animation
      })
    });

    if (clustererContext) {
      marker.setMap(null);
      clustererContext.registerMarker(marker);
    } else {
      marker.setMap(map);
    }
  }, [marker, map, clustererContext, position, title, label, clickable, draggable, icon, visible, zIndex, animation, options]);

  useEffect(() => {
    if (!marker) {
      return;
    }

    const listeners = [
      addListener(marker, 'click', onClick),
      addListener(marker, 'dblclick', onDblClick),
      addListener(marker, 'drag', onDrag),
      addListener(marker, 'dragend', onDragEnd),
      addListener(marker, 'dragstart', onDragStart),
      addListener(marker, 'mousedown', onMouseDown),
      addListener(marker, 'mouseout', onMouseOut),
      addListener(marker, 'mouseover', onMouseOver),
      addListener(marker, 'mouseup', onMouseUp),
      addListener(marker, 'rightclick', onRightClick)
    ].filter(Boolean);

    return () => {
      listeners.forEach((listener) => listener?.remove());
    };
  }, [marker, onClick, onDblClick, onDrag, onDragEnd, onDragStart, onMouseDown, onMouseOut, onMouseOver, onMouseUp, onRightClick]);

  return null;
});

export const MapAdvancedMarker = forwardRef<MapAdvancedMarkerHandle, MapAdvancedMarkerProps>(function MapAdvancedMarker(
  {
    position,
    title,
    zIndex,
    gmpClickable,
    gmpDraggable,
    options,
    collisionBehavior,
    children,
    onLoad,
    onUnmount,
    onClick,
    onDragStart,
    onDrag,
    onDragEnd
  },
  ref
) {
  const map = useGoogleMap();
  const { isLoaded } = useGoogleMapsApi();
  const clustererContext = useContext(MarkerClustererContext);
  const [marker, setMarker] = useState<google.maps.marker.AdvancedMarkerElement | null>(null);
  const [contentElement] = useState(() => (typeof document !== 'undefined' ? document.createElement('div') : null));

  useImperativeHandle(
    ref,
    () => ({
      marker,
      content: contentElement,
      setMap(nextMap) {
        if (marker) {
          marker.map = nextMap;
        }
      },
      setPosition(nextPosition) {
        if (marker) {
          marker.position = toLatLng(nextPosition) || nextPosition;
        }
      },
      setZIndex(nextZIndex) {
        if (marker) {
          marker.zIndex = nextZIndex;
        }
      }
    }),
    [marker, contentElement]
  );

  useEffect(() => {
    if (!map || !isLoaded || marker) {
      return;
    }

    if (!google.maps.marker?.AdvancedMarkerElement) {
      throw new Error(
        'AdvancedMarkerElement is unavailable. Make sure the marker library is enabled and the map uses a valid mapId.'
      );
    }

    const instance = new google.maps.marker.AdvancedMarkerElement({
      map: clustererContext ? undefined : map,
      content: children && contentElement ? contentElement : options?.content,
      ...options
    });

    setMarker(instance);
    onLoad?.(instance);

    return () => {
      onUnmount?.(instance);
      clustererContext?.unregisterMarker(instance);
      instance.map = null;
    };
  }, [map, isLoaded, marker, clustererContext, children, contentElement, options]);

  useEffect(() => {
    if (!marker || !map) {
      return;
    }

    marker.position = toLatLng(position) || position;
    if (title !== undefined) {
      marker.title = title;
    }
    marker.zIndex = zIndex;
    marker.gmpClickable = gmpClickable;
    marker.gmpDraggable = gmpDraggable;
    if (collisionBehavior !== undefined) {
      marker.collisionBehavior = collisionBehavior;
    }
    if (children && contentElement) {
      marker.content = contentElement;
    }

    if (clustererContext) {
      marker.map = null;
      clustererContext.registerMarker(marker);
    } else {
      marker.map = map;
    }
  }, [marker, map, clustererContext, position, title, zIndex, gmpClickable, gmpDraggable, collisionBehavior, children, contentElement]);

  useEffect(() => {
    if (!marker) {
      return;
    }

    const listeners = [
      addListener(marker, 'click', onClick),
      addListener(marker, 'dragstart', onDragStart),
      addListener(marker, 'drag', onDrag),
      addListener(marker, 'dragend', onDragEnd)
    ].filter(Boolean);

    return () => {
      listeners.forEach((listener) => listener?.remove());
    };
  }, [marker, onClick, onDragStart, onDrag, onDragEnd]);

  return children && contentElement ? createPortal(children, contentElement) : null;
});

export const MapInfoWindow = forwardRef<MapInfoWindowHandle, MapInfoWindowProps>(function MapInfoWindow(
  {
    anchor,
    open = true,
    position,
    zIndex,
    options,
    children,
    onLoad,
    onUnmount,
    onCloseClick,
    onDomReady,
    onContentChanged,
    onPositionChanged,
    onZIndexChanged
  },
  ref
) {
  const map = useGoogleMap();
  const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow | null>(null);
  const [contentElement] = useState(() => (typeof document !== 'undefined' ? document.createElement('div') : null));

  useImperativeHandle(
    ref,
    () => ({
      infoWindow,
      open(nextAnchor) {
        if (!infoWindow) {
          return;
        }
        infoWindow.open({
          map,
          anchor: (nextAnchor || anchor || undefined) as any
        });
      },
      close() {
        infoWindow?.close();
      },
      getContent() {
        return infoWindow?.getContent();
      },
      getPosition() {
        return infoWindow?.getPosition() || null;
      },
      getZIndex() {
        return infoWindow?.getZIndex();
      },
      setContent(content) {
        infoWindow?.setContent(content);
      },
      setPosition(nextPosition) {
        infoWindow?.setPosition(nextPosition);
      },
      setZIndex(nextZIndex) {
        infoWindow?.setZIndex(nextZIndex);
      }
    }),
    [infoWindow, map, anchor]
  );

  useEffect(() => {
    if (!map || infoWindow) {
      return;
    }

    const instance = new google.maps.InfoWindow({
      ...options,
      content: contentElement || options?.content,
      position,
      zIndex
    });

    setInfoWindow(instance);
    onLoad?.(instance);

    return () => {
      onUnmount?.(instance);
      instance.close();
    };
  }, [map, infoWindow, options, contentElement, position, zIndex]);

  useEffect(() => {
    if (!infoWindow) {
      return;
    }

    infoWindow.setOptions({
      ...options,
      content: children && contentElement ? contentElement : options?.content,
      position,
      zIndex
    });
  }, [infoWindow, options, position, zIndex, children, contentElement]);

  useEffect(() => {
    if (!infoWindow) {
      return;
    }

    if (!open) {
      infoWindow.close();
      return;
    }

    infoWindow.open({
      map,
      anchor: anchor as any
    });
  }, [infoWindow, map, anchor, open, position]);

  useEffect(() => {
    if (!infoWindow) {
      return;
    }

    const listeners = [
      addListener(infoWindow, 'closeclick', onCloseClick),
      addListener(infoWindow, 'domready', onDomReady),
      addListener(infoWindow, 'content_changed', onContentChanged),
      addListener(infoWindow, 'position_changed', onPositionChanged),
      addListener(infoWindow, 'zindex_changed', onZIndexChanged)
    ].filter(Boolean);

    return () => {
      listeners.forEach((listener) => listener?.remove());
    };
  }, [infoWindow, onCloseClick, onDomReady, onContentChanged, onPositionChanged, onZIndexChanged]);

  return children && contentElement ? createPortal(children, contentElement) : null;
});

export const MapMarkerClusterer = forwardRef<MapMarkerClustererHandle, MapMarkerClustererProps>(function MapMarkerClusterer({
  children,
  algorithm,
  renderer,
  onLoad,
  onUnmount,
  onClusterClick
}, ref) {
  const map = useGoogleMap();
  const [clusterer, setClusterer] = useState<MarkerClusterer | null>(null);
  const pendingMarkersRef = useRef<Set<MarkerLike>>(new Set());

  useImperativeHandle(
    ref,
    () => ({
      clusterer,
      addMarker(marker, noDraw) {
        clusterer?.addMarker(marker, noDraw);
      },
      addMarkers(markers, noDraw) {
        clusterer?.addMarkers(markers, noDraw);
      },
      removeMarker(marker, noDraw) {
        return clusterer?.removeMarker(marker, noDraw) ?? false;
      },
      clearMarkers(noDraw) {
        clusterer?.clearMarkers(noDraw);
      },
      render() {
        clusterer?.render();
      }
    }),
    [clusterer]
  );

  useEffect(() => {
    if (!map || clusterer) {
      return;
    }

    const instance = new MarkerClusterer({
      map,
      markers: Array.from(pendingMarkersRef.current),
      algorithm,
      renderer,
      onClusterClick: onClusterClick as any
    });

    setClusterer(instance);
    onLoad?.(instance);

    return () => {
      onUnmount?.(instance);
      instance.clearMarkers();
      (instance as any).setMap?.(null);
    };
  }, [map, clusterer, algorithm, renderer, onClusterClick]);

  const contextValue = useMemo(
    () => ({
      clusterer,
      registerMarker(marker: MarkerLike) {
        if (clusterer) {
          clusterer.addMarker(marker, true);
          clusterer.render();
        } else {
          pendingMarkersRef.current.add(marker);
        }
      },
      unregisterMarker(marker: MarkerLike) {
        pendingMarkersRef.current.delete(marker);
        if (clusterer) {
          clusterer.removeMarker(marker, true);
          clusterer.render();
        }
      }
    }),
    [clusterer]
  );

  return <MarkerClustererContext.Provider value={contextValue}>{children}</MarkerClustererContext.Provider>;
});
