import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { useGoogleMap } from './hooks';
import { removeUndefined, toLatLng, type LatLngLike } from './utils';

export type HeatmapDatum =
  | LatLngLike
  | google.maps.visualization.WeightedLocation
  | {
      location: LatLngLike;
      weight: number;
    };

export type MapTrafficLayerHandle = {
  layer: google.maps.TrafficLayer | null;
  setMap: (map: google.maps.Map | null) => void;
  setOptions: (options: google.maps.TrafficLayerOptions) => void;
};

export type MapTransitLayerHandle = {
  layer: google.maps.TransitLayer | null;
  setMap: (map: google.maps.Map | null) => void;
};

export type MapBicyclingLayerHandle = {
  layer: google.maps.BicyclingLayer | null;
  setMap: (map: google.maps.Map | null) => void;
};

export type MapKmlLayerHandle = {
  layer: google.maps.KmlLayer | null;
  getDefaultViewport: () => google.maps.LatLngBounds | null;
  getMetadata: () => google.maps.KmlLayerMetadata | null;
  getStatus: () => google.maps.KmlLayerStatus | null;
  getUrl: () => string | null;
  setMap: (map: google.maps.Map | null) => void;
  setOptions: (options: google.maps.KmlLayerOptions) => void;
  setUrl: (url: string) => void;
};

export type MapHeatmapLayerHandle = {
  layer: google.maps.visualization.HeatmapLayer | null;
  getData: () => google.maps.MVCArray<google.maps.LatLng | google.maps.visualization.WeightedLocation> | null;
  setData: (data: HeatmapDatum[]) => void;
  setMap: (map: google.maps.Map | null) => void;
  setOptions: (options: google.maps.visualization.HeatmapLayerOptions) => void;
};

export type MapKmlLayerProps = {
  url: string;
  options?: google.maps.KmlLayerOptions;
  onLoad?: (layer: google.maps.KmlLayer) => void;
  onUnmount?: (layer: google.maps.KmlLayer) => void;
};

export type MapHeatmapLayerProps = {
  data: HeatmapDatum[];
  options?: google.maps.visualization.HeatmapLayerOptions;
  onLoad?: (layer: google.maps.visualization.HeatmapLayer) => void;
  onUnmount?: (layer: google.maps.visualization.HeatmapLayer) => void;
};

export const MapTrafficLayer = forwardRef<MapTrafficLayerHandle, { options?: google.maps.TrafficLayerOptions; onLoad?: (layer: google.maps.TrafficLayer) => void; onUnmount?: (layer: google.maps.TrafficLayer) => void }>(function MapTrafficLayer({ options, onLoad, onUnmount }, ref) {
  const map = useGoogleMap();
  const [layer, setLayer] = useState<google.maps.TrafficLayer | null>(null);

  useImperativeHandle(
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

  useEffect(() => {
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

  useEffect(() => {
    if (layer && options) {
      layer.setOptions(options);
    }
  }, [layer, options]);

  return null;
});

export const MapTransitLayer = forwardRef<MapTransitLayerHandle, { onLoad?: (layer: google.maps.TransitLayer) => void; onUnmount?: (layer: google.maps.TransitLayer) => void }>(function MapTransitLayer({ onLoad, onUnmount }, ref) {
  const map = useGoogleMap();
  const [layer, setLayer] = useState<google.maps.TransitLayer | null>(null);

  useImperativeHandle(
    ref,
    () => ({
      layer,
      setMap(nextMap) {
        layer?.setMap(nextMap);
      }
    }),
    [layer]
  );

  useEffect(() => {
    if (!map) {
      return;
    }

    const layer = new google.maps.TransitLayer();
    layer.setMap(map);
    setLayer(layer);
    onLoad?.(layer);

    return () => {
      onUnmount?.(layer);
      layer.setMap(null);
    };
  }, [map]);

  return null;
});

export const MapBicyclingLayer = forwardRef<MapBicyclingLayerHandle, { onLoad?: (layer: google.maps.BicyclingLayer) => void; onUnmount?: (layer: google.maps.BicyclingLayer) => void }>(function MapBicyclingLayer({ onLoad, onUnmount }, ref) {
  const map = useGoogleMap();
  const [layer, setLayer] = useState<google.maps.BicyclingLayer | null>(null);

  useImperativeHandle(
    ref,
    () => ({
      layer,
      setMap(nextMap) {
        layer?.setMap(nextMap);
      }
    }),
    [layer]
  );

  useEffect(() => {
    if (!map) {
      return;
    }

    const layer = new google.maps.BicyclingLayer();
    layer.setMap(map);
    setLayer(layer);
    onLoad?.(layer);

    return () => {
      onUnmount?.(layer);
      layer.setMap(null);
    };
  }, [map]);

  return null;
});

export const MapKmlLayer = forwardRef<MapKmlLayerHandle, MapKmlLayerProps>(function MapKmlLayer({
  url,
  options,
  onLoad,
  onUnmount
}, ref) {
  const map = useGoogleMap();
  const [layer, setLayer] = useState<google.maps.KmlLayer | null>(null);

  useImperativeHandle(
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

  useEffect(() => {
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

  useEffect(() => {
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

export const MapHeatmapLayer = forwardRef<MapHeatmapLayerHandle, MapHeatmapLayerProps>(function MapHeatmapLayer({
  data,
  options,
  onLoad,
  onUnmount
}, ref) {
  const map = useGoogleMap();
  const [layer, setLayer] = useState<google.maps.visualization.HeatmapLayer | null>(null);

  useImperativeHandle(
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

  useEffect(() => {
    if (!map) {
      return;
    }

    if (!google.maps.visualization?.HeatmapLayer) {
      throw new Error('HeatmapLayer is unavailable. Make sure the visualization library is enabled.');
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

  useEffect(() => {
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

function normalizeHeatmapData(data: HeatmapDatum[]) {
  return data.map((entry) => {
    if ('location' in (entry as any)) {
      const weighted = entry as { location: LatLngLike; weight: number };
      return {
        location: toLatLng(weighted.location)!,
        weight: weighted.weight
      } as google.maps.visualization.WeightedLocation;
    }

    return toLatLng(entry as LatLngLike)!;
  });
}
