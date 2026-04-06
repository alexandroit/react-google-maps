import React, { useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import {
  GoogleMap,
  GoogleMapsProvider,
  MapCircle,
  MapControl,
  MapGroundOverlay,
  MapInfoWindow,
  MapMarker,
  MapMarkerClusterer,
  MapPolygon,
  MapPolyline,
  MapRectangle,
  useGoogleMapsApi,
  type GoogleMapHandle
} from '@revivejs/react-google-maps';
import './wrapper-no-key.css';

const TORONTO = { lat: 43.6532, lng: -79.3832 };
const MONTREAL = { lat: 45.5017, lng: -73.5673 };
const OTTAWA = { lat: 45.4215, lng: -75.6972 };
const NEW_YORK = { lat: 40.7128, lng: -74.006 };
const SAN_FRANCISCO = { lat: 37.7749, lng: -122.4194 };

function randomPoints(center: google.maps.LatLngLiteral, count: number) {
  return Array.from({ length: count }, (_, index) => ({
    lat: center.lat + Math.sin(index * 1.17) * 0.12 + ((index % 3) - 1) * 0.01,
    lng: center.lng + Math.cos(index * 0.93) * 0.12 + ((index % 5) - 2) * 0.008
  }));
}

const CLUSTER_POINTS = randomPoints(SAN_FRANCISCO, 24);
const exampleId = new URLSearchParams(window.location.search).get('example') || 'basic-roadmap';

type PreviewDefinition = {
  title: string;
  note: string;
  render: () => React.ReactNode;
};

function WrapperNoKeyStatus({ title, note }: { title: string; note: string }) {
  const { status, error } = useGoogleMapsApi();

  return (
    <div className="wrapper-preview-status">
      <span className="wrapper-preview-pill">wrapper no-key mode</span>
      <strong>{title}</strong>
      <p>{note}</p>
      <p>
        Status: <code>{status}</code>
      </p>
      {error ? <p className="wrapper-preview-error">Error: {error.message}</p> : null}
    </div>
  );
}

function WrapperNoKeyApp() {
  const preview = useMemo<PreviewDefinition>(() => getPreviewDefinition(exampleId), []);

  return (
    <GoogleMapsProvider>
      <main className="wrapper-preview-shell">
        <WrapperNoKeyStatus title={preview.title} note={preview.note} />
        <div className="wrapper-preview-map-card">{preview.render()}</div>
        <div className="wrapper-preview-note">
          <strong>About this browser preview</strong>
          <p>
            This iframe uses the real wrapper with no key so the docs can still show an actual Google Maps surface
            without destabilizing the main documentation shell. Scenarios that need extra Google APIs or a map ID fall
            back to a safe base-map preview here.
          </p>
        </div>
      </main>
    </GoogleMapsProvider>
  );
}

function getPreviewDefinition(id: string): PreviewDefinition {
  switch (id) {
    case 'hero-showcase':
      return {
        title: 'Hero showcase browser preview',
        note: 'A no-key visual preview with clusters and geometry so the top of the docs still opens with a real map.',
        render: () => <HeroNoKeyPreview />
      };
    case 'basic-roadmap':
      return {
        title: 'Basic map bootstrapping',
        note: 'The smallest working no-key wrapper surface: one map and one marker.',
        render: () => (
          <GoogleMap center={NEW_YORK} zoom={11} height={460}>
            <MapMarker position={NEW_YORK} title="New York City" />
          </GoogleMap>
        )
      };
    case 'controlled-camera':
      return {
        title: 'Controlled center and zoom',
        note: 'A real no-key map that still lets you move the camera around from React state.',
        render: () => <ControlledNoKeyPreview />
      };
    case 'map-events':
      return {
        title: 'Click events',
        note: 'Drop markers on click to validate map events with the wrapper directly inside the no-key browser preview.',
        render: () => <ClickEventsNoKeyPreview />
      };
    case 'marker-info-window':
      return {
        title: 'Markers and info windows',
        note: 'Classic marker + info window behavior stays testable in the isolated no-key iframe.',
        render: () => <InfoWindowNoKeyPreview />
      };
    case 'advanced-markers':
      return {
        title: 'Advanced markers',
        note: 'Advanced markers are documented here, but the no-key browser preview falls back to a stable base map surface so the docs never go blank.',
        render: () => <FallbackBaseMapPreview label="Advanced markers use fallback preview" />
      };
    case 'draggable-marker':
      return {
        title: 'Draggable markers',
        note: 'You can drag the marker and validate interaction directly in the no-key browser preview.',
        render: () => <DraggableNoKeyPreview />
      };
    case 'marker-clusterer':
      return {
        title: 'Marker clustering',
        note: 'Cluster many classic markers with the official clusterer package in an isolated no-key browser preview.',
        render: () => <ClusterNoKeyPreview />
      };
    case 'geometry-shapes':
      return {
        title: 'Polylines, polygons, rectangles, circles',
        note: 'A single geometry toolbox preview showing the four core shape components together on one real map.',
        render: () => <GeometryNoKeyPreview />
      };
    case 'ground-overlay':
      return {
        title: 'Ground overlays',
        note: 'Ground overlays still fit the wrapper mental model, so this preview keeps the base map visible and overlays a remote image.',
        render: () => <GroundOverlayNoKeyPreview />
      };
    case 'transport-layers':
      return {
        title: 'Traffic, transit, and bicycling layers',
        note: 'These Google-managed layers stay documented, but the no-key browser preview falls back to a stable base map surface.',
        render: () => <FallbackBaseMapPreview label="Transport layers use fallback preview" />
      };
    case 'kml-layer':
      return {
        title: 'KML layers',
        note: 'KML loading depends on Google services. The no-key browser preview keeps a stable base map visible while the docs explain the wrapper workflow.',
        render: () => <FallbackBaseMapPreview label="KML layers use fallback preview" />
      };
    case 'heatmap-layer':
      return {
        title: 'Heatmaps',
        note: 'Heatmaps depend on the visualization library, so the no-key browser preview uses a safe base map fallback.',
        render: () => <FallbackBaseMapPreview label="Heatmaps use fallback preview" />
      };
    case 'directions':
      return {
        title: 'Directions',
        note: 'Directions calls depend on Google services, so this no-key browser preview keeps the route stage visible with a safe base map fallback.',
        render: () => <FallbackBaseMapPreview label="Directions use fallback preview" />
      };
    case 'geocoder':
      return {
        title: 'Geocoding',
        note: 'Geocoding depends on Google services, so this no-key browser preview keeps a real map visible while the docs explain the hook usage.',
        render: () => <FallbackBaseMapPreview label="Geocoding uses fallback preview" />
      };
    case 'custom-cluster-html':
      return {
        title: 'Advanced markers + custom cluster HTML',
        note: 'Custom HTML cluster rendering is documented in the main page. The no-key iframe falls back to classic clustering to keep the map stable.',
        render: () => <ClusterNoKeyPreview />
      };
    case 'custom-control':
      return {
        title: 'Custom map controls and fitBounds',
        note: 'A compact control example still works well in no-key mode and keeps the imperative map handle visible.',
        render: () => <ControlNoKeyPreview />
      };
    default:
      return {
        title: 'Wrapper no-key preview',
        note: 'Fallback browser preview for the selected example.',
        render: () => <FallbackBaseMapPreview label="Preview fallback" />
      };
  }
}

function HeroNoKeyPreview() {
  return (
    <GoogleMap center={SAN_FRANCISCO} zoom={9} height={460}>
      <MapPolygon
        paths={[
          { lat: 37.92, lng: -122.58 },
          { lat: 37.86, lng: -122.25 },
          { lat: 37.68, lng: -122.17 },
          { lat: 37.64, lng: -122.52 }
        ]}
        options={{
          fillColor: '#1f5ba7',
          fillOpacity: 0.12,
          strokeColor: '#1f5ba7',
          strokeWeight: 3
        }}
      />
      <MapCircle
        center={SAN_FRANCISCO}
        radius={26000}
        options={{
          fillColor: '#d24b2a',
          fillOpacity: 0.08,
          strokeColor: '#d24b2a',
          strokeWeight: 2
        }}
      />
      <MapMarkerClusterer>
        {CLUSTER_POINTS.map((point, index) => (
          <MapMarker key={`hero-${index}`} position={point} title={`Spot ${index + 1}`} />
        ))}
      </MapMarkerClusterer>
    </GoogleMap>
  );
}

function ControlledNoKeyPreview() {
  const [center, setCenter] = useState(TORONTO);
  const [zoom, setZoom] = useState(10);

  return (
    <div className="wrapper-preview-stack">
      <div className="wrapper-preview-toolbar">
        <button type="button" onClick={() => setCenter(TORONTO)}>Toronto</button>
        <button type="button" onClick={() => setCenter(MONTREAL)}>Montreal</button>
        <button type="button" onClick={() => setCenter(OTTAWA)}>Ottawa</button>
        <button type="button" onClick={() => setZoom((value) => Math.min(value + 1, 14))}>Zoom in</button>
        <button type="button" onClick={() => setZoom((value) => Math.max(value - 1, 4))}>Zoom out</button>
      </div>
      <GoogleMap center={center} zoom={zoom} height={420}>
        <MapMarker position={center} title="Selected city" />
      </GoogleMap>
    </div>
  );
}

function ClickEventsNoKeyPreview() {
  const [markers, setMarkers] = useState([TORONTO, OTTAWA]);

  return (
    <GoogleMap
      center={OTTAWA}
      zoom={6}
      height={420}
      onClick={(event) => {
        const next = event.latLng?.toJSON();
        if (next) {
          setMarkers((current) => [...current, next]);
        }
      }}
    >
      {markers.map((marker, index) => (
        <MapMarker key={`click-${index}`} position={marker} title={`Point ${index + 1}`} />
      ))}
    </GoogleMap>
  );
}

function InfoWindowNoKeyPreview() {
  const cities = [
    { id: 'toronto', name: 'Toronto', position: TORONTO, text: 'Ontario capital.' },
    { id: 'ottawa', name: 'Ottawa', position: OTTAWA, text: 'Federal capital.' },
    { id: 'montreal', name: 'Montreal', position: MONTREAL, text: 'Festival city.' }
  ];
  const [active, setActive] = useState<string | null>('toronto');
  const markerRefs = useRef<Record<string, google.maps.Marker | null>>({});

  return (
    <GoogleMap center={OTTAWA} zoom={6} height={420}>
      {cities.map((city) => (
        <MapMarker
          key={city.id}
          position={city.position}
          title={city.name}
          onLoad={(marker) => {
            markerRefs.current[city.id] = marker;
          }}
          onUnmount={() => {
            markerRefs.current[city.id] = null;
          }}
          onClick={() => setActive(city.id)}
        />
      ))}
      <MapInfoWindow
        anchor={active ? markerRefs.current[active] : null}
        open={!!active}
        position={cities.find((city) => city.id === active)?.position}
        onCloseClick={() => setActive(null)}
      >
        {active ? (
          <div>
            <strong>{cities.find((city) => city.id === active)?.name}</strong>
            <p>{cities.find((city) => city.id === active)?.text}</p>
          </div>
        ) : null}
      </MapInfoWindow>
    </GoogleMap>
  );
}

function DraggableNoKeyPreview() {
  const [position, setPosition] = useState(TORONTO);

  return (
    <GoogleMap center={position} zoom={10} height={420}>
      <MapMarker
        position={position}
        draggable
        title="Drag me"
        icon="https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
        onDragEnd={(event) => {
          const next = event.latLng?.toJSON();
          if (next) {
            setPosition(next);
          }
        }}
      />
    </GoogleMap>
  );
}

function ClusterNoKeyPreview() {
  return (
    <GoogleMap center={SAN_FRANCISCO} zoom={8} height={420}>
      <MapMarkerClusterer>
        {CLUSTER_POINTS.map((point, index) => (
          <MapMarker key={`cluster-${index}`} position={point} title={`Cluster point ${index + 1}`} />
        ))}
      </MapMarkerClusterer>
    </GoogleMap>
  );
}

function GeometryNoKeyPreview() {
  return (
    <GoogleMap center={OTTAWA} zoom={6} height={420}>
      <MapPolyline
        path={[TORONTO, OTTAWA, MONTREAL]}
        options={{ strokeColor: '#1f5ba7', strokeWeight: 4, geodesic: true }}
      />
      <MapPolygon
        paths={[
          { lat: 44.8, lng: -79.9 },
          { lat: 46.2, lng: -79.2 },
          { lat: 45.8, lng: -72.8 },
          { lat: 43.9, lng: -74.3 }
        ]}
        options={{
          fillColor: '#0d5c9e',
          fillOpacity: 0.18,
          strokeColor: '#1f5ba7',
          strokeWeight: 3
        }}
      />
      <MapRectangle
        bounds={{ north: 45.74, south: 45.26, east: -73.18, west: -75.96 }}
        options={{ strokeColor: '#b43f3f', fillColor: '#f4b7b7', fillOpacity: 0.12 }}
      />
      <MapCircle
        center={TORONTO}
        radius={12000}
        options={{ strokeColor: '#30a46c', fillColor: '#8ad7b0', fillOpacity: 0.14 }}
      />
      <MapMarker position={TORONTO} title="Toronto" />
      <MapMarker position={OTTAWA} title="Ottawa" />
      <MapMarker position={MONTREAL} title="Montreal" />
    </GoogleMap>
  );
}

function GroundOverlayNoKeyPreview() {
  return (
    <GoogleMap center={{ lat: 62.323907, lng: -150.109291 }} zoom={10} height={420}>
      <MapGroundOverlay
        url="https://developers.google.com/maps/documentation/javascript/examples/full/images/talkeetna.png"
        bounds={{ north: 62.400471, south: 62.281819, east: -150.005608, west: -150.287132 }}
        opacity={0.7}
      />
    </GoogleMap>
  );
}

function ControlNoKeyPreview() {
  const mapRef = useRef<GoogleMapHandle>(null);
  const bounds = useMemo(
    () => new google.maps.LatLngBounds(TORONTO, MONTREAL),
    []
  );

  return (
    <GoogleMap ref={mapRef} center={OTTAWA} zoom={6} height={420}>
      <MapControl position={google.maps.ControlPosition.TOP_CENTER}>
        <div className="wrapper-preview-toolbar">
          <button type="button" onClick={() => mapRef.current?.fitBounds(bounds)}>
            Fit bounds
          </button>
        </div>
      </MapControl>
      <MapMarker position={TORONTO} title="Toronto" />
      <MapMarker position={OTTAWA} title="Ottawa" />
      <MapMarker position={MONTREAL} title="Montreal" />
    </GoogleMap>
  );
}

function FallbackBaseMapPreview({ label }: { label: string }) {
  return (
    <div className="wrapper-preview-stack">
      <div className="wrapper-preview-note wrapper-preview-note--inline">
        <strong>{label}</strong>
        <p>This specific scenario depends on extra Google APIs that are outside the no-key docs runtime. The base map stays visible here so the docs never feel blank.</p>
      </div>
      <GoogleMap center={NEW_YORK} zoom={10} height={420}>
        <MapMarker position={NEW_YORK} title="New York City" />
      </GoogleMap>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WrapperNoKeyApp />
  </React.StrictMode>
);
