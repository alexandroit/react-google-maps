# @revivejs/react-google-maps

> A maintained **React 19 wrapper for Google Maps** with declarative maps, markers, advanced markers, clustering, overlays, directions, geocoding hooks, and versioned live demos.

[![npm version](https://img.shields.io/npm/v/@revivejs/react-google-maps.svg?style=flat-square)](https://www.npmjs.com/package/@revivejs/react-google-maps)
[![npm downloads](https://img.shields.io/npm/dt/@revivejs/react-google-maps.svg?style=flat-square)](https://www.npmjs.com/package/@revivejs/react-google-maps)
[![license](https://img.shields.io/npm/l/@revivejs/react-google-maps.svg?style=flat-square)](https://github.com/alexandroit/react-google-maps/blob/main/LICENSE)
[![React 19](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev)
[![Google Maps](https://img.shields.io/badge/Google%20Maps-JavaScript%20API-34a853?style=flat-square)](https://developers.google.com/maps/documentation/javascript)

**[Documentation & Live Demos](https://alexandroit.github.io/react-google-maps/)** | **[npm](https://www.npmjs.com/package/@revivejs/react-google-maps)** | **[Issues](https://github.com/alexandroit/react-google-maps/issues)** | **[Repository](https://github.com/alexandroit/react-google-maps)**

**Latest version:** `19.0.1`

## Why this library?

`@revivejs/react-google-maps` is built for teams that want the same clarity people liked in the Angular Google Maps package, but in React:

- a single provider that loads the Google Maps JavaScript API once
- a declarative `<GoogleMap>` shell with familiar props like `center`, `zoom`, `mapId`, and `options`
- component wrappers for markers, advanced markers, info windows, overlays, layers, controls, and directions
- hooks for service-style flows like geocoding
- official marker clustering support through `@googlemaps/markerclusterer`

The result is intentionally migration-friendly. A complex Angular or imperative Google Maps codebase can usually move over one feature at a time without giving up access to the native map instances.

## Extension-friendly by design

This package is not a "locked box" wrapper. The components are meant to stay declarative for common usage, while still giving you the same escape hatches teams rely on in Angular:

- `ref` handles on `GoogleMap`, `MapMarker`, `MapInfoWindow`, `MapMarkerClusterer`, `MapPolyline`, `MapPolygon`, `MapRectangle`, `MapCircle`, `MapGroundOverlay`, and `MapDirectionsRenderer`
- `onLoad` callbacks that expose the native Google Maps instances directly
- `useGoogleMap()` to access the current native `google.maps.Map` from nested React components
- `useMapGeocoder()` and `useDirectionsService()` for service-style integrations

That means you can keep a typed React API for the 90% case and still drop to native Google Maps methods when a complex application needs something custom.

## React Version Compatibility

| Package version | React version | Google Maps support | Demo link |
| :---: | :---: | :---: | :--- |
| **19.0.1** | **19.2.x** | Maps, markers, advanced markers, clustering, shapes, layers, directions, geocoder | [React 19 demo](https://alexandroit.github.io/react-google-maps/react-19/) |
| **18.0.1** | **18.3.x** | Maps, markers, advanced markers, clustering, shapes, layers, directions, geocoder | [React 18 demo](https://alexandroit.github.io/react-google-maps/react-18/) |
| **17.0.1** | **17.0.x** | Maps, markers, advanced markers, clustering, shapes, layers, directions, geocoder | [React 17 demo](https://alexandroit.github.io/react-google-maps/react-17/) |

## Installation

```bash
npm install @revivejs/react-google-maps
```

## Basic Usage

```tsx
import {
  GoogleMap,
  GoogleMapsProvider,
  MapMarker
} from '@revivejs/react-google-maps';

const center = { lat: 40.7128, lng: -74.006 };

export function App() {
  return (
    <GoogleMapsProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} mapIds={['DEMO_MAP_ID']}>
      <GoogleMap center={center} zoom={11} height={420}>
        <MapMarker position={center} title="New York City" />
      </GoogleMap>
    </GoogleMapsProvider>
  );
}
```

## Advanced Markers

```tsx
import {
  GoogleMap,
  GoogleMapsProvider,
  MapAdvancedMarker
} from '@revivejs/react-google-maps';

export function CapitalMap() {
  return (
    <GoogleMapsProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} mapIds={['DEMO_MAP_ID']}>
      <GoogleMap center={{ lat: 45.4215, lng: -75.6972 }} zoom={6} mapId="DEMO_MAP_ID" height={420}>
        <MapAdvancedMarker position={{ lat: 45.4215, lng: -75.6972 }}>
          <div style={{ padding: 12, borderRadius: 12, background: 'white' }}>
            <strong>Ottawa</strong>
            <div>Advanced marker content</div>
          </div>
        </MapAdvancedMarker>
      </GoogleMap>
    </GoogleMapsProvider>
  );
}
```

## Marker Clustering

```tsx
import {
  createClusterRenderer,
  GoogleMap,
  GoogleMapsProvider,
  MapAdvancedMarker,
  MapMarker,
  MapMarkerClusterer
} from '@revivejs/react-google-maps';

const points = [
  { lat: 37.782, lng: -122.447 },
  { lat: 37.789, lng: -122.405 },
  { lat: 37.766, lng: -122.438 }
];

export function ClusteredMap() {
  return (
    <GoogleMapsProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <GoogleMap center={{ lat: 37.7749, lng: -122.4194 }} zoom={10} height={420}>
        <MapMarkerClusterer>
          {points.map((point, index) => (
            <MapMarker key={index} position={point} />
          ))}
        </MapMarkerClusterer>
      </GoogleMap>
    </GoogleMapsProvider>
  );
}
```

If you need branded cluster visuals, the wrapper also exposes a helper for HTML or advanced-marker-based cluster rendering:

```tsx
const renderer = createClusterRenderer({
  render: ({ count }) => {
    const element = document.createElement('div');
    element.className = 'cluster-card';
    element.innerHTML = `<strong>${count}</strong><span>places</span>`;
    return element;
  }
});

<MapMarkerClusterer renderer={renderer}>
  <MapAdvancedMarker position={point}>...</MapAdvancedMarker>
</MapMarkerClusterer>
```

## Directions

```tsx
import { useState } from 'react';
import {
  GoogleMap,
  GoogleMapsProvider,
  MapDirectionsRenderer,
  MapDirectionsService
} from '@revivejs/react-google-maps';

export function DirectionsDemo() {
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);

  return (
    <GoogleMapsProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <GoogleMap center={{ lat: 45.4215, lng: -75.6972 }} zoom={6} height={420}>
        <MapDirectionsService
          request={{
            origin: 'Toronto, ON',
            destination: 'Montreal, QC',
            travelMode: 'DRIVING' as google.maps.TravelMode
          }}
          onResult={({ result }) => setDirections(result ?? null)}
        />
        <MapDirectionsRenderer directions={directions} />
      </GoogleMap>
    </GoogleMapsProvider>
  );
}
```

## Geocoding Hook

```tsx
import { useState } from 'react';
import {
  GoogleMap,
  GoogleMapsProvider,
  MapMarker,
  useMapGeocoder
} from '@revivejs/react-google-maps';

function GeocoderInner() {
  const geocoder = useMapGeocoder();
  const [center, setCenter] = useState({ lat: 43.6532, lng: -79.3832 });

  async function geocodeAddress() {
    const response = await geocoder?.geocode({ address: 'Toronto City Hall' });
    const first = response?.results[0];
    if (first?.geometry.location) {
      setCenter(first.geometry.location.toJSON());
    }
  }

  return (
    <>
      <button onClick={geocodeAddress}>Geocode</button>
      <GoogleMap center={center} zoom={14} height={420}>
        <MapMarker position={center} />
      </GoogleMap>
    </>
  );
}

export function GeocoderDemo() {
  return (
    <GoogleMapsProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <GeocoderInner />
    </GoogleMapsProvider>
  );
}
```

## Main API

| Surface | Notes |
| :--- | :--- |
| `GoogleMapsProvider` | Loads the API once and shares readiness through context. |
| `GoogleMap` | Creates the native `google.maps.Map` and supports refs for imperative access. |
| `MapMarker` | Thin wrapper around `google.maps.Marker`. |
| `MapAdvancedMarker` | Thin wrapper around `google.maps.marker.AdvancedMarkerElement`. |
| `MapInfoWindow` | Declarative info window with React content via portal. |
| `MapMarkerClusterer` | Official clustering through `@googlemaps/markerclusterer`. |
| `MapPolyline`, `MapPolygon`, `MapRectangle`, `MapCircle` | Declarative shape overlays. |
| `MapGroundOverlay`, `MapKmlLayer`, `MapHeatmapLayer` | Common overlays and layers. |
| `MapTrafficLayer`, `MapTransitLayer`, `MapBicyclingLayer` | Built-in transportation layers. |
| `MapDirectionsService`, `MapDirectionsRenderer` | Declarative routing request + display flow. |
| `useMapGeocoder()` | Memoized geocoder hook. |
| `useDirectionsService()` | Memoized directions service hook. |
| `useGoogleMap()` | Access the native `google.maps.Map` from nested components. |
| `MapControl` | Mount React UI inside native map control positions. |

## Docs Coverage

The live docs are intentionally rich and mirror the kinds of workflows developers look for in the official Google Maps documentation:

- basic map bootstrapping
- controlled center and zoom
- click events
- markers and info windows
- advanced markers
- draggable markers
- marker clustering
- polylines, polygons, rectangles, circles
- ground overlays
- traffic, transit, and bicycling layers
- KML layers
- heatmaps
- directions
- geocoding
- custom map controls

## Changelog

### 19.0.0
- Initial React 19 line
- Added versioned docs for React 17, 18, and 19
- Added declarative wrappers for maps, markers, advanced markers, clustering, shapes, layers, directions, and geocoding

### 18.0.0
- React 18 compatibility line

### 17.0.0
- React 17 compatibility line
