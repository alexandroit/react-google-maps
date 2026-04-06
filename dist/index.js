// src/GoogleMapsProvider.tsx
import { useEffect, useMemo, useState } from "react";

// src/internal.tsx
import { createContext, useContext } from "react";
var GoogleMapsApiContext = createContext({
  status: "idle",
  error: null,
  google: null,
  options: null
});
var GoogleMapContext = createContext(null);
var MarkerClustererContext = createContext(null);
function useGoogleMapsApiContext() {
  return useContext(GoogleMapsApiContext);
}

// src/loadGoogleMapsApi.ts
var DEFAULT_LIBRARIES = [];
var loaderPromise = null;
var loadedOptionsKey = null;
function getDefaultGoogleMapsLibraries() {
  return [...DEFAULT_LIBRARIES];
}
function loadGoogleMapsApi(options) {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return Promise.reject(new Error("@revivejs/react-google-maps can only load the Google Maps API in a browser environment."));
  }
  if (window.google?.maps) {
    return Promise.resolve(window.google);
  }
  const normalizedOptions = normalizeLoaderOptions(options);
  const nextKey = JSON.stringify(normalizedOptions);
  if (loaderPromise) {
    if (loadedOptionsKey && loadedOptionsKey !== nextKey) {
      console.warn(
        "@revivejs/react-google-maps only loads the Google Maps JavaScript API once per page. Ignoring subsequent loader options and reusing the first loaded configuration."
      );
    }
    return loaderPromise;
  }
  loadedOptionsKey = nextKey;
  loaderPromise = new Promise((resolve, reject) => {
    const callbackName = "__revivejsReactGoogleMapsInit";
    const existingScript = document.querySelector('script[data-revivejs-google-maps-loader="true"]');
    if (existingScript) {
      existingScript.addEventListener("load", () => {
        if (window.google?.maps) {
          resolve(window.google);
        } else {
          reject(new Error("Google Maps script loaded but the google.maps namespace is still unavailable."));
        }
      });
      existingScript.addEventListener("error", () => reject(new Error("The Google Maps JavaScript API script failed to load.")));
      return;
    }
    const params = new URLSearchParams();
    params.set("key", normalizedOptions.apiKey ?? "");
    params.set("v", normalizedOptions.version);
    params.set("loading", "async");
    params.set("callback", callbackName);
    if (normalizedOptions.language) {
      params.set("language", normalizedOptions.language);
    }
    if (normalizedOptions.region) {
      params.set("region", normalizedOptions.region);
    }
    if (normalizedOptions.libraries.length) {
      params.set("libraries", normalizedOptions.libraries.join(","));
    }
    if (normalizedOptions.mapIds.length) {
      params.set("map_ids", normalizedOptions.mapIds.join(","));
    }
    if (normalizedOptions.authReferrerPolicy) {
      params.set("auth_referrer_policy", normalizedOptions.authReferrerPolicy);
    }
    if (normalizedOptions.channel) {
      params.set("channel", normalizedOptions.channel);
    }
    if (normalizedOptions.solutionChannel) {
      params.set("solution_channel", normalizedOptions.solutionChannel);
    }
    const script = document.createElement("script");
    script.async = true;
    script.defer = true;
    script.dataset.revivejsGoogleMapsLoader = "true";
    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    if (normalizedOptions.nonce) {
      script.nonce = normalizedOptions.nonce;
    }
    window[callbackName] = () => {
      delete window[callbackName];
      if (window.google?.maps) {
        resolve(window.google);
      } else {
        reject(new Error("Google Maps callback fired but the google.maps namespace is unavailable."));
      }
    };
    script.onerror = () => {
      loaderPromise = null;
      loadedOptionsKey = null;
      delete window[callbackName];
      reject(new Error("The Google Maps JavaScript API script failed to load."));
    };
    document.head.appendChild(script);
  });
  return loaderPromise;
}
function normalizeLoaderOptions(options) {
  return {
    ...options,
    version: options.version || "weekly",
    libraries: Array.from(/* @__PURE__ */ new Set([...options.libraries || [], ...DEFAULT_LIBRARIES])).sort(),
    mapIds: Array.from(new Set(options.mapIds || [])).sort()
  };
}

// src/GoogleMapsProvider.tsx
import { jsx } from "react/jsx-runtime";
function GoogleMapsProvider({ children, ...options }) {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [googleApi, setGoogleApi] = useState(
    () => typeof window !== "undefined" && window.google?.maps ? window.google : null
  );
  const serializedOptions = JSON.stringify({
    ...options,
    libraries: options.libraries || [],
    mapIds: options.mapIds || []
  });
  useEffect(() => {
    let cancelled = false;
    setStatus((current) => current === "ready" ? current : "loading");
    setError(null);
    loadGoogleMapsApi(options).then((googleNamespace) => {
      if (cancelled) {
        return;
      }
      setGoogleApi(googleNamespace);
      setStatus("ready");
    }).catch((nextError) => {
      if (cancelled) {
        return;
      }
      setError(nextError instanceof Error ? nextError : new Error(String(nextError)));
      setStatus("error");
    });
    return () => {
      cancelled = true;
    };
  }, [serializedOptions]);
  const value = useMemo(
    () => ({
      status,
      error,
      google: googleApi,
      options
    }),
    [status, error, googleApi, serializedOptions]
  );
  return /* @__PURE__ */ jsx(GoogleMapsApiContext.Provider, { value, children });
}

// src/clusterRenderer.ts
function createClusterRenderer(options = {}) {
  return {
    render(cluster, stats, map) {
      const count = cluster.count;
      const position = cluster.position;
      const contextBase = {
        cluster,
        stats,
        map,
        count,
        position,
        color: "",
        isAdvancedMarkerAvailable: false
      };
      const color = typeof options.color === "function" ? options.color(contextBase) : options.color || getDefaultClusterColor(count, stats);
      const isAdvancedMarkerAvailable = options.useAdvancedMarker !== false && !!google.maps.marker?.AdvancedMarkerElement && !!map.get("mapId");
      const context = {
        ...contextBase,
        color,
        isAdvancedMarkerAvailable
      };
      const title = typeof options.title === "function" ? options.title(context) : options.title || `Cluster with ${count} markers`;
      const zIndex = (options.zIndexBase || 1e3) + count;
      if (isAdvancedMarkerAvailable) {
        return new google.maps.marker.AdvancedMarkerElement({
          position,
          title,
          zIndex,
          content: buildAdvancedClusterContent(context, options)
        });
      }
      return new google.maps.Marker({
        position,
        title,
        zIndex,
        label: {
          text: String(count),
          color: options.fallbackTextColor || "#ffffff",
          fontSize: "12px",
          fontWeight: "700"
        },
        icon: {
          url: buildFallbackClusterSvg(
            color,
            options.fallbackBorderColor || "rgba(255,255,255,0.92)"
          ),
          scaledSize: new google.maps.Size(46, 46)
        }
      });
    }
  };
}
function buildAdvancedClusterContent(context, options) {
  const customContent = options.render?.(context);
  if (customContent instanceof HTMLElement) {
    return customContent;
  }
  const element = document.createElement("div");
  element.className = options.className || "revivejs-cluster-badge";
  element.style.display = "grid";
  element.style.gap = "2px";
  element.style.minWidth = "52px";
  element.style.padding = "10px 12px";
  element.style.borderRadius = "999px";
  element.style.background = context.color;
  element.style.color = "#ffffff";
  element.style.boxShadow = "0 12px 24px rgba(16, 32, 51, 0.18)";
  element.style.border = "2px solid rgba(255,255,255,0.88)";
  element.style.textAlign = "center";
  element.style.fontFamily = "Avenir Next, Segoe UI, sans-serif";
  const countNode = document.createElement("strong");
  countNode.textContent = String(context.count);
  countNode.style.fontSize = "14px";
  countNode.style.lineHeight = "1";
  const labelNode = document.createElement("span");
  labelNode.textContent = typeof customContent === "string" ? customContent : "markers";
  labelNode.style.fontSize = "10px";
  labelNode.style.opacity = "0.92";
  labelNode.style.lineHeight = "1";
  element.append(countNode, labelNode);
  return element;
}
function getDefaultClusterColor(count, stats) {
  return count > Math.max(10, stats.clusters.markers.mean) ? "#d94b2b" : "#0d5c9e";
}
function buildFallbackClusterSvg(fill, stroke) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="28" fill="${fill}" stroke="${stroke}" stroke-width="4" />
    </svg>
  `;
  return `data:image/svg+xml;base64,${window.btoa(svg)}`;
}

// src/GoogleMap.tsx
import {
  forwardRef,
  useEffect as useEffect2,
  useImperativeHandle,
  useMemo as useMemo2,
  useRef as useRef2,
  useState as useState2
} from "react";

// src/hooks.ts
import { useContext as useContext2, useRef } from "react";
function useGoogleMapsApi() {
  const context = useGoogleMapsApiContext();
  return {
    ...context,
    isLoaded: context.status === "ready" && !!context.google
  };
}
function useGoogleMap() {
  return useContext2(GoogleMapContext);
}
function useMapGeocoder() {
  const { google: google2, isLoaded } = useGoogleMapsApi();
  const geocoderRef = useRef(null);
  if (isLoaded && google2 && !geocoderRef.current) {
    geocoderRef.current = new google2.maps.Geocoder();
  }
  return geocoderRef.current;
}
function useDirectionsService() {
  const { google: google2, isLoaded } = useGoogleMapsApi();
  const directionsServiceRef = useRef(null);
  if (isLoaded && google2 && !directionsServiceRef.current) {
    directionsServiceRef.current = new google2.maps.DirectionsService();
  }
  return directionsServiceRef.current;
}

// src/utils.ts
function addListener(target, eventName, handler) {
  if (!target || !handler) {
    return null;
  }
  return google.maps.event.addListener(target, eventName, (...args) => {
    handler(...args);
  });
}
function composeMapOptions(options, extra) {
  return {
    ...options,
    ...removeUndefined(extra)
  };
}
function removeUndefined(input) {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== void 0));
}
function toLatLng(value) {
  if (!value) {
    return null;
  }
  if (value instanceof google.maps.LatLng) {
    return value;
  }
  return new google.maps.LatLng(value);
}
function toMVCArrayPath(path) {
  return path.map((point) => point instanceof google.maps.LatLng ? point : new google.maps.LatLng(point));
}
function shallowBoundsEqual(left, right) {
  return left?.east === right?.east && left?.west === right?.west && left?.north === right?.north && left?.south === right?.south;
}

// src/GoogleMap.tsx
import { jsx as jsx2, jsxs } from "react/jsx-runtime";
var DEFAULT_CENTER = { lat: 37.421995, lng: -122.084092 };
var DEFAULT_ZOOM = 13;
var GoogleMap = forwardRef(function GoogleMap2({
  children,
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  mapId,
  options,
  width = "100%",
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
}, ref) {
  const { isLoaded, status, error, google: google2 } = useGoogleMapsApi();
  const containerRef = useRef2(null);
  const mapRef = useRef2(null);
  const onMapLoadRef = useRef2(onMapLoad);
  const onMapUnmountRef = useRef2(onMapUnmount);
  const [map, setMap] = useState2(null);
  const initialMapIdRef = useRef2(mapId);
  onMapLoadRef.current = onMapLoad;
  onMapUnmountRef.current = onMapUnmount;
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
  useEffect2(() => {
    if (!isLoaded || !google2 || !containerRef.current || mapRef.current) {
      return;
    }
    const nextMap = new google2.maps.Map(
      containerRef.current,
      composeMapOptions(options, {
        center,
        zoom,
        mapId: initialMapIdRef.current
      })
    );
    mapRef.current = nextMap;
    setMap(nextMap);
    onMapLoadRef.current?.(nextMap);
    return () => {
      google2.maps.event.clearInstanceListeners(nextMap);
      onMapUnmountRef.current?.(nextMap);
      mapRef.current = null;
      setMap(null);
    };
  }, [isLoaded, google2]);
  useEffect2(() => {
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
  useEffect2(() => {
    if (!map || !center) {
      return;
    }
    const nextCenter = toLatLng(center);
    if (nextCenter) {
      map.setCenter(nextCenter);
    }
  }, [map, center]);
  useEffect2(() => {
    if (!map || zoom === void 0) {
      return;
    }
    if (map.getZoom() !== zoom) {
      map.setZoom(zoom);
    }
  }, [map, zoom]);
  useEffect2(() => {
    if (!map) {
      return;
    }
    const listeners = [
      addListener(map, "click", onClick),
      addListener(map, "dblclick", onDblClick),
      addListener(map, "drag", onDrag),
      addListener(map, "dragstart", onDragStart),
      addListener(map, "dragend", onDragEnd),
      addListener(map, "idle", onIdle),
      addListener(map, "bounds_changed", onBoundsChanged),
      addListener(map, "center_changed", onCenterChanged),
      addListener(map, "heading_changed", onHeadingChanged),
      addListener(map, "maptypeid_changed", onMapTypeIdChanged),
      addListener(map, "mousemove", onMouseMove),
      addListener(map, "mouseout", onMouseOut),
      addListener(map, "mouseover", onMouseOver),
      addListener(map, "projection_changed", onProjectionChanged),
      addListener(map, "rightclick", onRightClick),
      addListener(map, "tilesloaded", onTilesLoaded),
      addListener(map, "tilt_changed", onTiltChanged),
      addListener(map, "zoom_changed", onZoomChanged)
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
  useEffect2(() => {
    if (!map || !google2 || !containerRef.current || typeof ResizeObserver === "undefined") {
      return;
    }
    const observer = new ResizeObserver(() => {
      const currentCenter = map.getCenter();
      google2.maps.event.trigger(map, "resize");
      if (currentCenter) {
        map.setCenter(currentCenter);
      }
    });
    observer.observe(containerRef.current);
    return () => {
      observer.disconnect();
    };
  }, [map, google2]);
  const mergedStyle = useMemo2(
    () => ({
      width,
      height,
      minHeight: typeof height === "number" ? `${height}px` : void 0,
      position: "relative",
      overflow: "hidden",
      ...style
    }),
    [width, height, style]
  );
  return /* @__PURE__ */ jsxs("div", { ...divProps, className, style: mergedStyle, ref: containerRef, children: [
    status === "error" ? errorFallback || /* @__PURE__ */ jsx2(MapStatus, { message: error?.message || "The Google Maps API failed to load.", tone: "error" }) : null,
    !isLoaded && status !== "error" ? loadingFallback || /* @__PURE__ */ jsx2(MapStatus, { message: "Loading Google Maps JavaScript API\u2026", tone: "loading" }) : null,
    map ? /* @__PURE__ */ jsx2(GoogleMapContext.Provider, { value: map, children }) : null
  ] });
});
function MapStatus({ message, tone }) {
  return /* @__PURE__ */ jsx2(
    "div",
    {
      style: {
        position: "absolute",
        inset: 0,
        display: "grid",
        placeItems: "center",
        padding: "1rem",
        background: tone === "error" ? "rgba(255, 245, 245, 0.9)" : "rgba(244, 249, 255, 0.9)",
        color: tone === "error" ? "#8c2b2b" : "#24415f",
        fontSize: "0.95rem",
        zIndex: 0
      },
      children: /* @__PURE__ */ jsx2("div", { children: message })
    }
  );
}

// src/markers.tsx
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import {
  useContext as useContext3,
  forwardRef as forwardRef2,
  useEffect as useEffect3,
  useImperativeHandle as useImperativeHandle2,
  useMemo as useMemo3,
  useRef as useRef3,
  useState as useState3
} from "react";
import { createPortal } from "react-dom";
import { jsx as jsx3 } from "react/jsx-runtime";
var MapMarker = forwardRef2(function MapMarker2({
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
}, ref) {
  const map = useGoogleMap();
  const clustererContext = useContext3(MarkerClustererContext);
  const markerRef = useRef3(null);
  const onLoadRef = useRef3(onLoad);
  const onUnmountRef = useRef3(onUnmount);
  const [marker, setMarker] = useState3(null);
  onLoadRef.current = onLoad;
  onUnmountRef.current = onUnmount;
  useImperativeHandle2(
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
  useEffect3(() => {
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
  useEffect3(() => {
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
  useEffect3(() => {
    if (!marker) {
      return;
    }
    const listeners = [
      addListener(marker, "click", onClick),
      addListener(marker, "dblclick", onDblClick),
      addListener(marker, "drag", onDrag),
      addListener(marker, "dragend", onDragEnd),
      addListener(marker, "dragstart", onDragStart),
      addListener(marker, "mousedown", onMouseDown),
      addListener(marker, "mouseout", onMouseOut),
      addListener(marker, "mouseover", onMouseOver),
      addListener(marker, "mouseup", onMouseUp),
      addListener(marker, "rightclick", onRightClick)
    ].filter(Boolean);
    return () => {
      listeners.forEach((listener) => listener?.remove());
    };
  }, [marker, onClick, onDblClick, onDrag, onDragEnd, onDragStart, onMouseDown, onMouseOut, onMouseOver, onMouseUp, onRightClick]);
  return null;
});
var MapAdvancedMarker = forwardRef2(function MapAdvancedMarker2({
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
}, ref) {
  const map = useGoogleMap();
  const { isLoaded } = useGoogleMapsApi();
  const clustererContext = useContext3(MarkerClustererContext);
  const [marker, setMarker] = useState3(null);
  const [contentElement] = useState3(() => typeof document !== "undefined" ? document.createElement("div") : null);
  useImperativeHandle2(
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
  useEffect3(() => {
    if (!map || !isLoaded || marker) {
      return;
    }
    if (!google.maps.marker?.AdvancedMarkerElement) {
      throw new Error(
        "AdvancedMarkerElement is unavailable. Make sure the marker library is enabled and the map uses a valid mapId."
      );
    }
    const instance = new google.maps.marker.AdvancedMarkerElement({
      map: clustererContext ? void 0 : map,
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
  useEffect3(() => {
    if (!marker || !map) {
      return;
    }
    marker.position = toLatLng(position) || position;
    if (title !== void 0) {
      marker.title = title;
    }
    marker.zIndex = zIndex;
    marker.gmpClickable = gmpClickable;
    marker.gmpDraggable = gmpDraggable;
    if (collisionBehavior !== void 0) {
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
  useEffect3(() => {
    if (!marker) {
      return;
    }
    const listeners = [
      addListener(marker, "click", onClick),
      addListener(marker, "dragstart", onDragStart),
      addListener(marker, "drag", onDrag),
      addListener(marker, "dragend", onDragEnd)
    ].filter(Boolean);
    return () => {
      listeners.forEach((listener) => listener?.remove());
    };
  }, [marker, onClick, onDragStart, onDrag, onDragEnd]);
  return children && contentElement ? createPortal(children, contentElement) : null;
});
var MapInfoWindow = forwardRef2(function MapInfoWindow2({
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
}, ref) {
  const map = useGoogleMap();
  const [infoWindow, setInfoWindow] = useState3(null);
  const [contentElement] = useState3(() => typeof document !== "undefined" ? document.createElement("div") : null);
  useImperativeHandle2(
    ref,
    () => ({
      infoWindow,
      open(nextAnchor) {
        if (!infoWindow) {
          return;
        }
        infoWindow.open({
          map,
          anchor: nextAnchor || anchor || void 0
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
  useEffect3(() => {
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
  useEffect3(() => {
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
  useEffect3(() => {
    if (!infoWindow) {
      return;
    }
    if (!open) {
      infoWindow.close();
      return;
    }
    infoWindow.open({
      map,
      anchor
    });
  }, [infoWindow, map, anchor, open, position]);
  useEffect3(() => {
    if (!infoWindow) {
      return;
    }
    const listeners = [
      addListener(infoWindow, "closeclick", onCloseClick),
      addListener(infoWindow, "domready", onDomReady),
      addListener(infoWindow, "content_changed", onContentChanged),
      addListener(infoWindow, "position_changed", onPositionChanged),
      addListener(infoWindow, "zindex_changed", onZIndexChanged)
    ].filter(Boolean);
    return () => {
      listeners.forEach((listener) => listener?.remove());
    };
  }, [infoWindow, onCloseClick, onDomReady, onContentChanged, onPositionChanged, onZIndexChanged]);
  return children && contentElement ? createPortal(children, contentElement) : null;
});
var MapMarkerClusterer = forwardRef2(function MapMarkerClusterer2({
  children,
  algorithm,
  renderer,
  onLoad,
  onUnmount,
  onClusterClick
}, ref) {
  const map = useGoogleMap();
  const [clusterer, setClusterer] = useState3(null);
  const pendingMarkersRef = useRef3(/* @__PURE__ */ new Set());
  useImperativeHandle2(
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
  useEffect3(() => {
    if (!map || clusterer) {
      return;
    }
    const instance = new MarkerClusterer({
      map,
      markers: Array.from(pendingMarkersRef.current),
      algorithm,
      renderer,
      onClusterClick
    });
    setClusterer(instance);
    onLoad?.(instance);
    return () => {
      onUnmount?.(instance);
      instance.clearMarkers();
      instance.setMap?.(null);
    };
  }, [map, clusterer, algorithm, renderer, onClusterClick]);
  const contextValue = useMemo3(
    () => ({
      clusterer,
      registerMarker(marker) {
        if (clusterer) {
          clusterer.addMarker(marker, true);
          clusterer.render();
        } else {
          pendingMarkersRef.current.add(marker);
        }
      },
      unregisterMarker(marker) {
        pendingMarkersRef.current.delete(marker);
        if (clusterer) {
          clusterer.removeMarker(marker, true);
          clusterer.render();
        }
      }
    }),
    [clusterer]
  );
  return /* @__PURE__ */ jsx3(MarkerClustererContext.Provider, { value: contextValue, children });
});

// src/shapes.tsx
import { createPortal as createPortal2 } from "react-dom";
import { forwardRef as forwardRef3, useEffect as useEffect4, useImperativeHandle as useImperativeHandle3, useState as useState4 } from "react";
var MapPolyline = forwardRef3(function MapPolyline2({
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
}, ref) {
  const map = useGoogleMap();
  const [polyline, setPolyline] = useState4(null);
  useImperativeHandle3(
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
  useEffect4(() => {
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
  useEffect4(() => {
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
var MapPolygon = forwardRef3(function MapPolygon2({
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
}, ref) {
  const map = useGoogleMap();
  const [polygon, setPolygon] = useState4(null);
  useImperativeHandle3(
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
        const value = Array.isArray(nextPaths[0]) ? nextPaths.map((path) => toMVCArrayPath(path)) : toMVCArrayPath(nextPaths);
        polygon?.setPaths(value);
      },
      setOptions(nextOptions) {
        polygon?.setOptions(nextOptions);
      }
    }),
    [polygon]
  );
  useEffect4(() => {
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
  useEffect4(() => {
    if (!polygon) {
      return;
    }
    const nextPaths = Array.isArray(paths[0]) ? paths.map((path) => toMVCArrayPath(path)) : toMVCArrayPath(paths);
    polygon.setOptions({
      ...options,
      paths: nextPaths,
      map
    });
  }, [polygon, map, paths, options]);
  useShapeEvents(polygon, { onClick, onDblClick, onMouseDown, onMouseMove, onMouseOut, onMouseOver, onMouseUp, onRightClick, onDrag, onDragEnd, onDragStart });
  return null;
});
var MapRectangle = forwardRef3(function MapRectangle2({
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
}, ref) {
  const map = useGoogleMap();
  const [rectangle, setRectangle] = useState4(null);
  useImperativeHandle3(
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
  useEffect4(() => {
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
  useEffect4(() => {
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
var MapCircle = forwardRef3(function MapCircle2({
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
}, ref) {
  const map = useGoogleMap();
  const [circle, setCircle] = useState4(null);
  useImperativeHandle3(
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
  useEffect4(() => {
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
  useEffect4(() => {
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
var MapGroundOverlay = forwardRef3(function MapGroundOverlay2({ url, bounds, opacity, clickable, onLoad, onUnmount, onClick }, ref) {
  const map = useGoogleMap();
  const [overlay, setOverlay] = useState4(null);
  useImperativeHandle3(
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
  useEffect4(() => {
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
  useEffect4(() => {
    if (!overlay) {
      return;
    }
    const listener = addListener(overlay, "click", onClick);
    return () => {
      listener?.remove();
    };
  }, [overlay, onClick]);
  return null;
});
function MapControl({ position, children, index }) {
  const map = useGoogleMap();
  const [element] = useState4(() => typeof document !== "undefined" ? document.createElement("div") : null);
  useEffect4(() => {
    if (!map || !element) {
      return;
    }
    const controls = map.controls[position];
    if (typeof index === "number" && index >= 0 && index < controls.getLength()) {
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
  return element ? createPortal2(children, element) : null;
}
function useShapeEvents(shape, handlers) {
  useEffect4(() => {
    if (!shape) {
      return;
    }
    const listeners = [
      addListener(shape, "click", handlers.onClick),
      addListener(shape, "dblclick", handlers.onDblClick),
      addListener(shape, "mousedown", handlers.onMouseDown),
      addListener(shape, "mousemove", handlers.onMouseMove),
      addListener(shape, "mouseout", handlers.onMouseOut),
      addListener(shape, "mouseover", handlers.onMouseOver),
      addListener(shape, "mouseup", handlers.onMouseUp),
      addListener(shape, "rightclick", handlers.onRightClick),
      addListener(shape, "drag", handlers.onDrag),
      addListener(shape, "dragend", handlers.onDragEnd),
      addListener(shape, "dragstart", handlers.onDragStart)
    ].filter(Boolean);
    return () => {
      listeners.forEach((listener) => listener?.remove());
    };
  }, [shape, handlers.onClick, handlers.onDblClick, handlers.onMouseDown, handlers.onMouseMove, handlers.onMouseOut, handlers.onMouseOver, handlers.onMouseUp, handlers.onRightClick, handlers.onDrag, handlers.onDragEnd, handlers.onDragStart]);
}

// src/layers.tsx
import { forwardRef as forwardRef4, useEffect as useEffect5, useImperativeHandle as useImperativeHandle4, useState as useState5 } from "react";
var MapTrafficLayer = forwardRef4(function MapTrafficLayer2({ options, onLoad, onUnmount }, ref) {
  const map = useGoogleMap();
  const [layer, setLayer] = useState5(null);
  useImperativeHandle4(
    ref,
    () => ({
      layer,
      setMap(nextMap) {
        layer?.setMap(nextMap);
      },
      setOptions(nextOptions) {
        layer?.setOptions(nextOptions);
      }
    }),
    [layer]
  );
  useEffect5(() => {
    if (!map || layer) {
      return;
    }
    const instance = new google.maps.TrafficLayer(options);
    instance.setMap(map);
    setLayer(instance);
    onLoad?.(instance);
    return () => {
      onUnmount?.(instance);
      instance.setMap(null);
    };
  }, [map, layer]);
  useEffect5(() => {
    if (layer && options) {
      layer.setOptions(options);
    }
  }, [layer, options]);
  return null;
});
var MapTransitLayer = forwardRef4(function MapTransitLayer2({ onLoad, onUnmount }, ref) {
  const map = useGoogleMap();
  const [layer, setLayer] = useState5(null);
  useImperativeHandle4(
    ref,
    () => ({
      layer,
      setMap(nextMap) {
        layer?.setMap(nextMap);
      }
    }),
    [layer]
  );
  useEffect5(() => {
    if (!map) {
      return;
    }
    const layer2 = new google.maps.TransitLayer();
    layer2.setMap(map);
    setLayer(layer2);
    onLoad?.(layer2);
    return () => {
      onUnmount?.(layer2);
      layer2.setMap(null);
    };
  }, [map]);
  return null;
});
var MapBicyclingLayer = forwardRef4(function MapBicyclingLayer2({ onLoad, onUnmount }, ref) {
  const map = useGoogleMap();
  const [layer, setLayer] = useState5(null);
  useImperativeHandle4(
    ref,
    () => ({
      layer,
      setMap(nextMap) {
        layer?.setMap(nextMap);
      }
    }),
    [layer]
  );
  useEffect5(() => {
    if (!map) {
      return;
    }
    const layer2 = new google.maps.BicyclingLayer();
    layer2.setMap(map);
    setLayer(layer2);
    onLoad?.(layer2);
    return () => {
      onUnmount?.(layer2);
      layer2.setMap(null);
    };
  }, [map]);
  return null;
});
var MapKmlLayer = forwardRef4(function MapKmlLayer2({
  url,
  options,
  onLoad,
  onUnmount
}, ref) {
  const map = useGoogleMap();
  const [layer, setLayer] = useState5(null);
  useImperativeHandle4(
    ref,
    () => ({
      layer,
      getDefaultViewport() {
        return layer?.getDefaultViewport() || null;
      },
      getMetadata() {
        return layer?.getMetadata() || null;
      },
      getStatus() {
        return layer?.getStatus() || null;
      },
      getUrl() {
        return layer?.getUrl() || null;
      },
      setMap(nextMap) {
        layer?.setMap(nextMap);
      },
      setOptions(nextOptions) {
        layer?.setOptions(nextOptions);
      },
      setUrl(nextUrl) {
        layer?.setUrl(nextUrl);
      }
    }),
    [layer]
  );
  useEffect5(() => {
    if (!map) {
      return;
    }
    const instance = new google.maps.KmlLayer({
      ...options,
      map,
      url
    });
    setLayer(instance);
    onLoad?.(instance);
    return () => {
      onUnmount?.(instance);
      instance.setMap(null);
    };
  }, [map, url]);
  useEffect5(() => {
    if (!layer) {
      return;
    }
    layer.setOptions({
      ...options,
      map
    });
    layer.setUrl(url);
  }, [layer, options, map, url]);
  return null;
});
var MapHeatmapLayer = forwardRef4(function MapHeatmapLayer2({
  data,
  options,
  onLoad,
  onUnmount
}, ref) {
  const map = useGoogleMap();
  const [layer, setLayer] = useState5(null);
  useImperativeHandle4(
    ref,
    () => ({
      layer,
      getData() {
        return layer?.getData() || null;
      },
      setData(nextData) {
        layer?.setData(normalizeHeatmapData(nextData));
      },
      setMap(nextMap) {
        layer?.setMap(nextMap);
      },
      setOptions(nextOptions) {
        layer?.setOptions(nextOptions);
      }
    }),
    [layer]
  );
  useEffect5(() => {
    if (!map) {
      return;
    }
    if (!google.maps.visualization?.HeatmapLayer) {
      throw new Error("HeatmapLayer is unavailable. Make sure the visualization library is enabled.");
    }
    const instance = new google.maps.visualization.HeatmapLayer({
      ...options,
      map,
      data: normalizeHeatmapData(data)
    });
    setLayer(instance);
    onLoad?.(instance);
    return () => {
      onUnmount?.(instance);
      instance.setMap(null);
    };
  }, [map]);
  useEffect5(() => {
    if (!layer) {
      return;
    }
    layer.setOptions({
      ...options,
      data: normalizeHeatmapData(data),
      map
    });
  }, [layer, options, data, map]);
  return null;
});
function normalizeHeatmapData(data) {
  return data.map((entry) => {
    if ("location" in entry) {
      const weighted = entry;
      return {
        location: toLatLng(weighted.location),
        weight: weighted.weight
      };
    }
    return toLatLng(entry);
  });
}

// src/directions.tsx
import { forwardRef as forwardRef5, useEffect as useEffect6, useImperativeHandle as useImperativeHandle5, useRef as useRef4, useState as useState6 } from "react";
var MapDirectionsRenderer = forwardRef5(function MapDirectionsRenderer2({
  directions,
  options,
  onLoad,
  onUnmount,
  onDirectionsChanged
}, ref) {
  const map = useGoogleMap();
  const [renderer, setRenderer] = useState6(null);
  useImperativeHandle5(
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
  useEffect6(() => {
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
  useEffect6(() => {
    if (!renderer) {
      return;
    }
    renderer.setOptions({
      ...options,
      directions: directions || void 0,
      map
    });
  }, [renderer, directions, options, map]);
  useEffect6(() => {
    if (!renderer) {
      return;
    }
    const listener = addListener(renderer, "directions_changed", onDirectionsChanged);
    return () => {
      listener?.remove();
    };
  }, [renderer, onDirectionsChanged]);
  return null;
});
function MapDirectionsService({
  request,
  onResult,
  onError
}) {
  const service = useDirectionsService();
  const requestIdRef = useRef4(0);
  useEffect6(() => {
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
export {
  GoogleMap,
  GoogleMapsProvider,
  MapAdvancedMarker,
  MapBicyclingLayer,
  MapCircle,
  MapControl,
  MapDirectionsRenderer,
  MapDirectionsService,
  MapGroundOverlay,
  MapHeatmapLayer,
  MapInfoWindow,
  MapKmlLayer,
  MapMarker,
  MapMarkerClusterer,
  MapPolygon,
  MapPolyline,
  MapRectangle,
  MapTrafficLayer,
  MapTransitLayer,
  createClusterRenderer,
  getDefaultGoogleMapsLibraries,
  loadGoogleMapsApi,
  useDirectionsService,
  useGoogleMap,
  useGoogleMapsApi,
  useMapGeocoder
};
//# sourceMappingURL=index.js.map