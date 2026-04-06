import { createPortal } from 'react-dom';
import { forwardRef, useEffect, useImperativeHandle, useState, type ReactNode } from 'react';
import { useGoogleMap } from './hooks';
import { addListener, removeUndefined, shallowBoundsEqual, toLatLng, toMVCArrayPath, type LatLngLike } from './utils';

type ShapeBaseProps<T> = {
  options?: T;
  onLoad?: (instance: any) => void;
  onUnmount?: (instance: any) => void;
  onClick?: (event: google.maps.MapMouseEvent) => void;
  onDblClick?: (event: google.maps.MapMouseEvent) => void;
  onMouseDown?: (event: google.maps.MapMouseEvent) => void;
  onMouseMove?: (event: google.maps.MapMouseEvent) => void;
  onMouseOut?: (event: google.maps.MapMouseEvent) => void;
  onMouseOver?: (event: google.maps.MapMouseEvent) => void;
  onMouseUp?: (event: google.maps.MapMouseEvent) => void;
  onRightClick?: (event: google.maps.MapMouseEvent) => void;
  onDrag?: (event: google.maps.MapMouseEvent) => void;
  onDragEnd?: (event: google.maps.MapMouseEvent) => void;
  onDragStart?: (event: google.maps.MapMouseEvent) => void;
};

export type MapPolylineProps = ShapeBaseProps<google.maps.PolylineOptions> & {
  path: LatLngLike[];
};

export type MapPolygonProps = ShapeBaseProps<google.maps.PolygonOptions> & {
  paths: LatLngLike[] | LatLngLike[][];
};

export type MapRectangleProps = ShapeBaseProps<google.maps.RectangleOptions> & {
  bounds: google.maps.LatLngBoundsLiteral;
};

export type MapCircleProps = ShapeBaseProps<google.maps.CircleOptions> & {
  center: LatLngLike;
  radius: number;
};

export type MapGroundOverlayProps = {
  url: string;
  bounds: google.maps.LatLngBoundsLiteral;
  opacity?: number;
  clickable?: boolean;
  onLoad?: (overlay: google.maps.GroundOverlay) => void;
  onUnmount?: (overlay: google.maps.GroundOverlay) => void;
  onClick?: (event: google.maps.MapMouseEvent) => void;
};

export type MapControlProps = {
  position: google.maps.ControlPosition;
  children: ReactNode;
  index?: number;
};

export type MapPolylineHandle = {
  polyline: google.maps.Polyline | null;
  getPath: () => google.maps.MVCArray<google.maps.LatLng> | null;
  getVisible: () => boolean | undefined;
  getDraggable: () => boolean | undefined;
  getEditable: () => boolean | undefined;
  setPath: (path: LatLngLike[]) => void;
  setOptions: (options: google.maps.PolylineOptions) => void;
};

export type MapPolygonHandle = {
  polygon: google.maps.Polygon | null;
  getPath: () => google.maps.MVCArray<google.maps.LatLng> | null;
  getPaths: () => google.maps.MVCArray<google.maps.MVCArray<google.maps.LatLng>> | null;
  getVisible: () => boolean | undefined;
  getDraggable: () => boolean | undefined;
  getEditable: () => boolean | undefined;
  setPaths: (paths: LatLngLike[] | LatLngLike[][]) => void;
  setOptions: (options: google.maps.PolygonOptions) => void;
};

export type MapRectangleHandle = {
  rectangle: google.maps.Rectangle | null;
  getBounds: () => google.maps.LatLngBounds | null;
  getVisible: () => boolean | undefined;
  getDraggable: () => boolean | undefined;
  getEditable: () => boolean | undefined;
  setBounds: (bounds: google.maps.LatLngBounds | google.maps.LatLngBoundsLiteral) => void;
  setOptions: (options: google.maps.RectangleOptions) => void;
};

export type MapCircleHandle = {
  circle: google.maps.Circle | null;
  getBounds: () => google.maps.LatLngBounds | null;
  getCenter: () => google.maps.LatLng | null;
  getRadius: () => number | undefined;
  getVisible: () => boolean | undefined;
  getDraggable: () => boolean | undefined;
  getEditable: () => boolean | undefined;
  setCenter: (center: google.maps.LatLng | google.maps.LatLngLiteral) => void;
  setRadius: (radius: number) => void;
  setOptions: (options: google.maps.CircleOptions) => void;
};

export type MapGroundOverlayHandle = {
  overlay: google.maps.GroundOverlay | null;
  getBounds: () => google.maps.LatLngBounds | null;
  getOpacity: () => number | null | undefined;
  getUrl: () => string | undefined;
  setOpacity: (opacity: number) => void;
  setMap: (map: google.maps.Map | null) => void;
};

export const MapPolyline = forwardRef<MapPolylineHandle, MapPolylineProps>(function MapPolyline({
  path,
  options,
  onLoad,
  onUnmount,
  onClick,
  onDblClick,
  onMouseDown,
  onMouseMove,
  onMouseOut,
  onMouseOver,
  onMouseUp,
  onRightClick,
  onDrag,
  onDragEnd,
  onDragStart
}: MapPolylineProps, ref) {
  const map = useGoogleMap();
  const [polyline, setPolyline] = useState<google.maps.Polyline | null>(null);

  useImperativeHandle(
    ref,
    () => ({
      polyline,
      getPath() {
        return polyline?.getPath() || null;
      },
      getVisible() {
        return polyline?.getVisible();
      },
      getDraggable() {
        return polyline?.getDraggable();
      },
      getEditable() {
        return polyline?.getEditable();
      },
      setPath(nextPath) {
        polyline?.setPath(toMVCArrayPath(nextPath));
      },
      setOptions(nextOptions) {
        polyline?.setOptions(nextOptions);
      }
    }),
    [polyline]
  );

  useEffect(() => {
    if (!map || polyline) {
      return;
    }

    const instance = new google.maps.Polyline({ map });
    setPolyline(instance);
    onLoad?.(instance);

    return () => {
      onUnmount?.(instance);
      instance.setMap(null);
    };
  }, [map, polyline]);

  useEffect(() => {
    if (!polyline) {
      return;
    }

    polyline.setOptions({
      ...options,
      path: toMVCArrayPath(path),
      map
    });
  }, [polyline, map, path, options]);

  useShapeEvents(polyline, { onClick, onDblClick, onMouseDown, onMouseMove, onMouseOut, onMouseOver, onMouseUp, onRightClick, onDrag, onDragEnd, onDragStart });
  return null;
});

export const MapPolygon = forwardRef<MapPolygonHandle, MapPolygonProps>(function MapPolygon({
  paths,
  options,
  onLoad,
  onUnmount,
  onClick,
  onDblClick,
  onMouseDown,
  onMouseMove,
  onMouseOut,
  onMouseOver,
  onMouseUp,
  onRightClick,
  onDrag,
  onDragEnd,
  onDragStart
}: MapPolygonProps, ref) {
  const map = useGoogleMap();
  const [polygon, setPolygon] = useState<google.maps.Polygon | null>(null);

  useImperativeHandle(
    ref,
    () => ({
      polygon,
      getPath() {
        return polygon?.getPath() || null;
      },
      getPaths() {
        return polygon?.getPaths() || null;
      },
      getVisible() {
        return polygon?.getVisible();
      },
      getDraggable() {
        return polygon?.getDraggable();
      },
      getEditable() {
        return polygon?.getEditable();
      },
      setPaths(nextPaths) {
        const value = Array.isArray(nextPaths[0])
          ? (nextPaths as LatLngLike[][]).map((path) => toMVCArrayPath(path))
          : toMVCArrayPath(nextPaths as LatLngLike[]);
        polygon?.setPaths(value as any);
      },
      setOptions(nextOptions) {
        polygon?.setOptions(nextOptions);
      }
    }),
    [polygon]
  );

  useEffect(() => {
    if (!map || polygon) {
      return;
    }

    const instance = new google.maps.Polygon({ map });
    setPolygon(instance);
    onLoad?.(instance);

    return () => {
      onUnmount?.(instance);
      instance.setMap(null);
    };
  }, [map, polygon]);

  useEffect(() => {
    if (!polygon) {
      return;
    }

    const nextPaths = Array.isArray(paths[0])
      ? (paths as LatLngLike[][]).map((path) => toMVCArrayPath(path))
      : toMVCArrayPath(paths as LatLngLike[]);

    polygon.setOptions({
      ...options,
      paths: nextPaths as any,
      map
    });
  }, [polygon, map, paths, options]);

  useShapeEvents(polygon, { onClick, onDblClick, onMouseDown, onMouseMove, onMouseOut, onMouseOver, onMouseUp, onRightClick, onDrag, onDragEnd, onDragStart });
  return null;
});

export const MapRectangle = forwardRef<MapRectangleHandle, MapRectangleProps>(function MapRectangle({
  bounds,
  options,
  onLoad,
  onUnmount,
  onClick,
  onDblClick,
  onMouseDown,
  onMouseMove,
  onMouseOut,
  onMouseOver,
  onMouseUp,
  onRightClick,
  onDrag,
  onDragEnd,
  onDragStart
}: MapRectangleProps, ref) {
  const map = useGoogleMap();
  const [rectangle, setRectangle] = useState<google.maps.Rectangle | null>(null);

  useImperativeHandle(
    ref,
    () => ({
      rectangle,
      getBounds() {
        return rectangle?.getBounds() || null;
      },
      getVisible() {
        return rectangle?.getVisible();
      },
      getDraggable() {
        return rectangle?.getDraggable();
      },
      getEditable() {
        return rectangle?.getEditable();
      },
      setBounds(nextBounds) {
        rectangle?.setBounds(nextBounds);
      },
      setOptions(nextOptions) {
        rectangle?.setOptions(nextOptions);
      }
    }),
    [rectangle]
  );

  useEffect(() => {
    if (!map || rectangle) {
      return;
    }

    const instance = new google.maps.Rectangle({ map });
    setRectangle(instance);
    onLoad?.(instance);

    return () => {
      onUnmount?.(instance);
      instance.setMap(null);
    };
  }, [map, rectangle]);

  useEffect(() => {
    if (!rectangle) {
      return;
    }

    if (!shallowBoundsEqual(rectangle.getBounds()?.toJSON(), bounds)) {
      rectangle.setBounds(bounds);
    }

    rectangle.setOptions({
      ...options,
      map
    });
  }, [rectangle, map, bounds, options]);

  useShapeEvents(rectangle, { onClick, onDblClick, onMouseDown, onMouseMove, onMouseOut, onMouseOver, onMouseUp, onRightClick, onDrag, onDragEnd, onDragStart });
  return null;
});

export const MapCircle = forwardRef<MapCircleHandle, MapCircleProps>(function MapCircle({
  center,
  radius,
  options,
  onLoad,
  onUnmount,
  onClick,
  onDblClick,
  onMouseDown,
  onMouseMove,
  onMouseOut,
  onMouseOver,
  onMouseUp,
  onRightClick,
  onDrag,
  onDragEnd,
  onDragStart
}: MapCircleProps, ref) {
  const map = useGoogleMap();
  const [circle, setCircle] = useState<google.maps.Circle | null>(null);

  useImperativeHandle(
    ref,
    () => ({
      circle,
      getBounds() {
        return circle?.getBounds() || null;
      },
      getCenter() {
        return circle?.getCenter() || null;
      },
      getRadius() {
        return circle?.getRadius();
      },
      getVisible() {
        return circle?.getVisible();
      },
      getDraggable() {
        return circle?.getDraggable();
      },
      getEditable() {
        return circle?.getEditable();
      },
      setCenter(nextCenter) {
        circle?.setCenter(nextCenter);
      },
      setRadius(nextRadius) {
        circle?.setRadius(nextRadius);
      },
      setOptions(nextOptions) {
        circle?.setOptions(nextOptions);
      }
    }),
    [circle]
  );

  useEffect(() => {
    if (!map || circle) {
      return;
    }

    const instance = new google.maps.Circle({ map });
    setCircle(instance);
    onLoad?.(instance);

    return () => {
      onUnmount?.(instance);
      instance.setMap(null);
    };
  }, [map, circle]);

  useEffect(() => {
    if (!circle) {
      return;
    }

    circle.setOptions({
      ...options,
      center,
      radius,
      map
    });
  }, [circle, map, center, radius, options]);

  useShapeEvents(circle, { onClick, onDblClick, onMouseDown, onMouseMove, onMouseOut, onMouseOver, onMouseUp, onRightClick, onDrag, onDragEnd, onDragStart });
  return null;
});

export const MapGroundOverlay = forwardRef<MapGroundOverlayHandle, MapGroundOverlayProps>(function MapGroundOverlay({ url, bounds, opacity, clickable, onLoad, onUnmount, onClick }: MapGroundOverlayProps, ref) {
  const map = useGoogleMap();
  const [overlay, setOverlay] = useState<google.maps.GroundOverlay | null>(null);

  useImperativeHandle(
    ref,
    () => ({
      overlay,
      getBounds() {
        return overlay?.getBounds() || null;
      },
      getOpacity() {
        return overlay?.getOpacity();
      },
      getUrl() {
        return overlay?.getUrl();
      },
      setOpacity(nextOpacity) {
        overlay?.setOpacity(nextOpacity);
      },
      setMap(nextMap) {
        overlay?.setMap(nextMap);
      }
    }),
    [overlay]
  );

  useEffect(() => {
    if (!map) {
      return;
    }

    const instance = new google.maps.GroundOverlay(url, bounds, removeUndefined({ opacity, clickable }));
    instance.setMap(map);
    setOverlay(instance);
    onLoad?.(instance);

    return () => {
      onUnmount?.(instance);
      instance.setMap(null);
    };
  }, [map, url, JSON.stringify(bounds), opacity, clickable]);

  useEffect(() => {
    if (!overlay) {
      return;
    }

    const listener = addListener(overlay, 'click', onClick);
    return () => {
      listener?.remove();
    };
  }, [overlay, onClick]);

  return null;
});

export function MapControl({ position, children, index }: MapControlProps) {
  const map = useGoogleMap();
  const [element] = useState(() => (typeof document !== 'undefined' ? document.createElement('div') : null));

  useEffect(() => {
    if (!map || !element) {
      return;
    }

    const controls = map.controls[position];
    if (typeof index === 'number' && index >= 0 && index < controls.getLength()) {
      controls.insertAt(index, element);
    } else {
      controls.push(element);
    }

    return () => {
      const nextControls = map.controls[position];
      for (let currentIndex = 0; currentIndex < nextControls.getLength(); currentIndex += 1) {
        if (nextControls.getAt(currentIndex) === element) {
          nextControls.removeAt(currentIndex);
          break;
        }
      }
    };
  }, [map, element, position, index]);

  return element ? createPortal(children, element) : null;
}

function useShapeEvents(
  shape: google.maps.Polyline | google.maps.Polygon | google.maps.Rectangle | google.maps.Circle | null,
  handlers: {
    onClick?: (event: google.maps.MapMouseEvent) => void;
    onDblClick?: (event: google.maps.MapMouseEvent) => void;
    onMouseDown?: (event: google.maps.MapMouseEvent) => void;
    onMouseMove?: (event: google.maps.MapMouseEvent) => void;
    onMouseOut?: (event: google.maps.MapMouseEvent) => void;
    onMouseOver?: (event: google.maps.MapMouseEvent) => void;
    onMouseUp?: (event: google.maps.MapMouseEvent) => void;
    onRightClick?: (event: google.maps.MapMouseEvent) => void;
    onDrag?: (event: google.maps.MapMouseEvent) => void;
    onDragEnd?: (event: google.maps.MapMouseEvent) => void;
    onDragStart?: (event: google.maps.MapMouseEvent) => void;
  }
) {
  useEffect(() => {
    if (!shape) {
      return;
    }

    const listeners = [
      addListener(shape, 'click', handlers.onClick),
      addListener(shape, 'dblclick', handlers.onDblClick),
      addListener(shape, 'mousedown', handlers.onMouseDown),
      addListener(shape, 'mousemove', handlers.onMouseMove),
      addListener(shape, 'mouseout', handlers.onMouseOut),
      addListener(shape, 'mouseover', handlers.onMouseOver),
      addListener(shape, 'mouseup', handlers.onMouseUp),
      addListener(shape, 'rightclick', handlers.onRightClick),
      addListener(shape, 'drag', handlers.onDrag),
      addListener(shape, 'dragend', handlers.onDragEnd),
      addListener(shape, 'dragstart', handlers.onDragStart)
    ].filter(Boolean);

    return () => {
      listeners.forEach((listener) => listener?.remove());
    };
  }, [shape, handlers.onClick, handlers.onDblClick, handlers.onMouseDown, handlers.onMouseMove, handlers.onMouseOut, handlers.onMouseOver, handlers.onMouseUp, handlers.onRightClick, handlers.onDrag, handlers.onDragEnd, handlers.onDragStart]);
}
