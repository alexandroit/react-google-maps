import React, { useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import {
  GoogleMap,
  GoogleMapsProvider,
  MapCircle,
  MapControl,
  MapGroundOverlay,
  MapPolygon,
  MapPolyline,
  MapRectangle,
  type GoogleMapHandle
} from '@stackline/react-google-maps';
import './wrapper-no-key.css';

const TORONTO = { lat: 43.6532, lng: -79.3832 };
const MONTREAL = { lat: 45.5017, lng: -73.5673 };
const OTTAWA = { lat: 45.4215, lng: -75.6972 };
const NEW_YORK = { lat: 40.7128, lng: -74.006 };
const SAN_FRANCISCO = { lat: 37.7749, lng: -122.4194 };
const NO_KEY_MAP_ID = 'DEMO_MAP_ID';

const exampleId = new URLSearchParams(window.location.search).get('example') || 'advanced-markers';

type PreviewDefinition = {
  render: () => React.ReactNode;
};

function WrapperNoKeyApp() {
  const preview = useMemo<PreviewDefinition>(() => getPreviewDefinition(exampleId), []);

  return (
    <GoogleMapsProvider>
      <main className="wrapper-preview-shell">{preview.render()}</main>
    </GoogleMapsProvider>
  );
}

function getPreviewDefinition(id: string): PreviewDefinition {
  switch (id) {
    case 'hero-showcase':
      return {
        render: () => <AdvancedMarkersNoKeyPreview variant="hero" />
      };
    case 'basic-roadmap':
      return {
        render: () => <BasicRoadmapNoKeyPreview />
      };
    case 'controlled-camera':
      return {
        render: () => <ControlledNoKeyPreview />
      };
    case 'map-events':
      return {
        render: () => <ClickEventsNoKeyPreview />
      };
    case 'marker-info-window':
      return {
        render: () => <InfoWindowNoKeyPreview />
      };
    case 'advanced-markers':
      return {
        render: () => <AdvancedMarkersNoKeyPreview variant="workbench" />
      };
    case 'draggable-marker':
      return {
        render: () => <DraggableNoKeyPreview />
      };
    case 'marker-clusterer':
      return {
        render: () => <ClusterNoKeyPreview />
      };
    case 'geometry-shapes':
      return {
        render: () => <GeometryNoKeyPreview />
      };
    case 'ground-overlay':
      return {
        render: () => <GroundOverlayNoKeyPreview />
      };
    case 'transport-layers':
      return {
        render: () => <FallbackBaseMapPreview label="Transport layers use fallback preview" />
      };
    case 'kml-layer':
      return {
        render: () => <FallbackBaseMapPreview label="KML layers use fallback preview" />
      };
    case 'heatmap-layer':
      return {
        render: () => <FallbackBaseMapPreview label="Heatmaps use fallback preview" />
      };
    case 'directions':
      return {
        render: () => <FallbackBaseMapPreview label="Directions use fallback preview" />
      };
    case 'geocoder':
      return {
        render: () => <FallbackBaseMapPreview label="Geocoding uses fallback preview" />
      };
    case 'custom-cluster-html':
      return {
        render: () => <ClusterNoKeyPreview />
      };
    case 'custom-control':
      return {
        render: () => <ControlNoKeyPreview />
      };
    default:
      return {
        render: () => <FallbackBaseMapPreview label="Preview fallback" />
      };
  }
}

function AdvancedMarkersNoKeyPreview({ variant }: { variant: 'hero' | 'workbench' }) {
  return (
    <div className={`wrapper-overlay-stage wrapper-overlay-stage--${variant}`}>
      <GoogleMap center={OTTAWA} zoom={6} mapId={NO_KEY_MAP_ID} height={variant === 'hero' ? 460 : 420}>
      </GoogleMap>

      <div className="wrapper-advanced-card wrapper-advanced-card--a">
        <strong>Ottawa</strong>
        <span>Advanced marker card</span>
      </div>

      <div className="wrapper-advanced-card wrapper-advanced-card--b">
        <strong>Montreal</strong>
        <span>HTML marker content</span>
      </div>

      {variant === 'hero' ? (
        <div className="wrapper-advanced-card wrapper-advanced-card--c">
          <strong>Toronto</strong>
          <span>Docs first-look marker</span>
        </div>
      ) : null}
    </div>
  );
}

function ControlledNoKeyPreview() {
  const [center, setCenter] = useState(TORONTO);
  const [zoom, setZoom] = useState(10);
  const topCenter = ((window as any).google?.maps?.ControlPosition?.TOP_CENTER ?? 2) as google.maps.ControlPosition;
  const bottomCenter = ((window as any).google?.maps?.ControlPosition?.BOTTOM_CENTER ?? 11) as google.maps.ControlPosition;

  return (
    <GoogleMap center={center} zoom={zoom} height={420}>
      <MapControl position={topCenter}>
        <div className="wrapper-preview-toolbar">
          <button type="button" onClick={() => setCenter(TORONTO)}>Toronto</button>
          <button type="button" onClick={() => setCenter(MONTREAL)}>Montreal</button>
          <button type="button" onClick={() => setCenter(OTTAWA)}>Ottawa</button>
          <button type="button" onClick={() => setZoom((value) => Math.min(value + 1, 14))}>+</button>
          <button type="button" onClick={() => setZoom((value) => Math.max(value - 1, 4))}>-</button>
        </div>
      </MapControl>
      <MapControl position={bottomCenter}>
        <div className="wrapper-preview-tag">{`Center: ${center.lat.toFixed(2)}, ${center.lng.toFixed(2)} · Zoom ${zoom}`}</div>
      </MapControl>
    </GoogleMap>
  );
}

function ClickEventsNoKeyPreview() {
  const [clicks, setClicks] = useState<string[]>([
    `${TORONTO.lat.toFixed(2)}, ${TORONTO.lng.toFixed(2)}`,
    `${OTTAWA.lat.toFixed(2)}, ${OTTAWA.lng.toFixed(2)}`
  ]);
  const topRight = ((window as any).google?.maps?.ControlPosition?.TOP_RIGHT ?? 3) as google.maps.ControlPosition;

  return (
    <GoogleMap
      center={OTTAWA}
      zoom={6}
      height={420}
      onClick={(event) => {
        const next = event.latLng?.toJSON();
        if (next) {
          setClicks((current) => [`${next.lat.toFixed(3)}, ${next.lng.toFixed(3)}`, ...current].slice(0, 3));
        }
      }}
    >
      <MapControl position={topRight}>
        <div className="wrapper-preview-stack">
          {clicks.map((entry) => (
            <div key={entry} className="wrapper-preview-tag">
              {entry}
            </div>
          ))}
        </div>
      </MapControl>
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

  return (
    <div className="wrapper-overlay-stage wrapper-overlay-stage--workbench">
      <GoogleMap center={OTTAWA} zoom={6} mapId={NO_KEY_MAP_ID} height={420} />
      <button type="button" className="wrapper-advanced-card wrapper-advanced-card--a wrapper-overlay-button" onClick={() => setActive('toronto')}>
        <strong>Toronto</strong>
        <span>Advanced marker card</span>
      </button>
      <button type="button" className="wrapper-advanced-card wrapper-advanced-card--b wrapper-overlay-button" onClick={() => setActive('montreal')}>
        <strong>Montreal</strong>
        <span>Click to inspect</span>
      </button>
      {active ? (
        <div className="wrapper-preview-popup">
          <strong>{cities.find((city) => city.id === active)?.name}</strong>
          <span>{cities.find((city) => city.id === active)?.text}</span>
        </div>
      ) : null}
    </div>
  );
}

function DraggableNoKeyPreview() {
  const [city, setCity] = useState<'toronto' | 'ottawa' | 'montreal'>('toronto');
  const positions = {
    toronto: { left: '15%', top: '62%' },
    ottawa: { left: '42%', top: '39%' },
    montreal: { left: '67%', top: '32%' }
  } as const;

  return (
    <div className="wrapper-overlay-stage wrapper-overlay-stage--workbench">
      <GoogleMap center={OTTAWA} zoom={6} mapId={NO_KEY_MAP_ID} height={420}>
        <MapControl position={google.maps.ControlPosition.TOP_CENTER}>
          <div className="wrapper-preview-toolbar">
            <button type="button" onClick={() => setCity('toronto')}>Toronto</button>
            <button type="button" onClick={() => setCity('ottawa')}>Ottawa</button>
            <button type="button" onClick={() => setCity('montreal')}>Montreal</button>
          </div>
        </MapControl>
      </GoogleMap>
      <div className="wrapper-advanced-card wrapper-advanced-card--floating" style={positions[city]}>
        <strong>{city[0].toUpperCase() + city.slice(1)}</strong>
        <span>Drag preview state</span>
      </div>
    </div>
  );
}

function ClusterNoKeyPreview() {
  return (
    <div className="wrapper-overlay-stage wrapper-overlay-stage--workbench">
      <GoogleMap center={SAN_FRANCISCO} zoom={8} mapId={NO_KEY_MAP_ID} height={420} />
      <div className="wrapper-advanced-card wrapper-advanced-card--cluster-a">
        <strong>Oakland</strong>
        <span>Advanced marker</span>
      </div>
      <div className="wrapper-advanced-card wrapper-advanced-card--cluster-b">
        <strong>San Jose</strong>
        <span>Advanced marker</span>
      </div>
      <div className="wrapper-cluster-bubble">
        <strong>24</strong>
        <span>clustered</span>
      </div>
    </div>
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
    </GoogleMap>
  );
}

function FallbackBaseMapPreview({ label }: { label: string }) {
  return (
    <GoogleMap center={NEW_YORK} zoom={10} height={420}>
      <MapControl position={google.maps.ControlPosition.TOP_CENTER}>
        <div className="wrapper-preview-tag">{label}</div>
      </MapControl>
    </GoogleMap>
  );
}

function BasicRoadmapNoKeyPreview() {
  return (
    <div className="wrapper-overlay-stage wrapper-overlay-stage--workbench">
      <GoogleMap center={NEW_YORK} zoom={11} mapId={NO_KEY_MAP_ID} height={460} />
      <div className="wrapper-advanced-card wrapper-advanced-card--basic">
        <strong>New York City</strong>
        <span>Advanced marker starter</span>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WrapperNoKeyApp />
  </React.StrictMode>
);
