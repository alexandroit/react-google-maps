import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  createClusterRenderer,
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
  useMapGeocoder,
  type DirectionsServiceResult,
  type GoogleMapHandle
} from '@revivejs/react-google-maps';

type AppProps = {
  reactLine: string;
  reactVersion: string;
  docsPath: string;
  packageVersion: string;
};

type ExampleDefinition = {
  id: string;
  category: string;
  title: string;
  description: string;
  code: string;
  note?: string;
  render: (context: ExampleContext) => ReactNode;
};

type ExampleContext = {
  apiKey: string;
  mapId: string;
  pushLog: (message: string) => void;
};

const API_KEY_STORAGE_KEY = '@revivejs/react-google-maps/demo-api-key';
const MAP_ID_STORAGE_KEY = '@revivejs/react-google-maps/demo-map-id';
const DEFAULT_MAP_ID = 'DEMO_MAP_ID';

const INSTALL_CODE = `npm install @revivejs/react-google-maps`;

const PROVIDER_CODE = `import { GoogleMapsProvider, GoogleMap, MapMarker } from '@revivejs/react-google-maps';

function App() {
  return (
    <GoogleMapsProvider apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY} mapIds={['DEMO_MAP_ID']}>
      <GoogleMap center={{ lat: 40.7128, lng: -74.006 }} zoom={11} height={420}>
        <MapMarker position={{ lat: 40.7128, lng: -74.006 }} />
      </GoogleMap>
    </GoogleMapsProvider>
  );
}`;

const INDEX_HTML_CODE = `<!-- index.html -->
<script>
  (g=>{var h,a,k,p="The Google Maps JavaScript API",c="google",l="importLibrary",q="__ib__",m=document,b=window;
  b=b[c]||(b[c]={});var d=b.maps||(b.maps={}),r=new Set,e=new URLSearchParams;
  u=()=>h||(h=new Promise(async(f,n)=>{await (a=m.createElement("script"));
  e.set("libraries",[...r]+"");
  for(k in g)e.set(k.replace(/[A-Z]/g,t=>"_"+t[0].toLowerCase()),g[k]);
  e.set("callback",c+".maps."+q);
  a.src=\`https://maps.googleapis.com/maps/api/js?\${e}\`;
  d[q]=f;a.onerror=()=>h=n(Error(p+" could not load."));
  m.head.append(a)}));
  d[l]?console.warn(p+" only loads once. Ignoring:",g):d[l]=(f,...n)=>r.add(f)&&u().then(()=>d[l](f,...n))
  })({
    key: "YOUR_BROWSER_API_KEY",
    v: "weekly"
  });
</script>`;

const MIGRATION_CODE = `// Angular-style mental model, React-friendly surface:
// - <GoogleMap center={...} zoom={...} />
// - <MapMarker position={...} />
// - <MapInfoWindow anchor={marker} open={open} />
// - <MapMarkerClusterer>...</MapMarkerClusterer>
// - MapDirectionsService + MapDirectionsRenderer
// - useMapGeocoder() for geocoding flows`;

const REF_CODE = `const mapRef = useRef<GoogleMapHandle>(null);
const markerRef = useRef<MapMarkerHandle>(null);

mapRef.current?.fitBounds(bounds);
markerRef.current?.setVisible(false);
markerRef.current?.getPosition()?.toJSON();`;

const CLUSTER_HELPER_CODE = `import { createClusterRenderer } from '@revivejs/react-google-maps';

const renderer = createClusterRenderer({
  render: ({ count }) => {
    const element = document.createElement('div');
    element.className = 'cluster-card';
    element.innerHTML = \`<strong>\${count}</strong><span>places</span>\`;
    return element;
  }
});`;

const TORONTO = { lat: 43.6532, lng: -79.3832 };
const MONTREAL = { lat: 45.5017, lng: -73.5673 };
const OTTAWA = { lat: 45.4215, lng: -75.6972 };
const VANCOUVER = { lat: 49.2827, lng: -123.1207 };
const NEW_YORK = { lat: 40.7128, lng: -74.006 };
const SAN_FRANCISCO = { lat: 37.7749, lng: -122.4194 };
const CHICAGO = { lat: 41.8781, lng: -87.6298 };

function stamp(message: string) {
  return `${new Date().toLocaleTimeString('en-US', { hour12: false })} ${message}`;
}

function codeExample(title: string, content: string) {
  return `// ${title}\n${content}`;
}

function randomPoints(center: google.maps.LatLngLiteral, count: number) {
  return Array.from({ length: count }, (_, index) => ({
    lat: center.lat + Math.sin(index * 1.17) * 0.12 + ((index % 3) - 1) * 0.01,
    lng: center.lng + Math.cos(index * 0.93) * 0.12 + ((index % 5) - 2) * 0.008
  }));
}

const CLUSTER_POINTS = randomPoints(SAN_FRANCISCO, 36);
const DOC_SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'setup', label: 'Setup' },
  { id: 'loading', label: 'Loading Patterns' },
  { id: 'migration', label: 'Migration Guide' },
  { id: 'marker-model', label: 'Marker Strategy' },
  { id: 'customization', label: 'Customization' },
  { id: 'examples', label: 'Example Explorer' },
  { id: 'api-reference', label: 'API Reference' }
] as const;

export default function App({ reactLine, reactVersion, docsPath, packageVersion }: AppProps) {
  const [apiKey, setApiKey] = useState(() =>
    typeof window !== 'undefined' ? window.localStorage.getItem(API_KEY_STORAGE_KEY) || '' : ''
  );
  const [mapId, setMapId] = useState(() =>
    typeof window !== 'undefined' ? window.localStorage.getItem(MAP_ID_STORAGE_KEY) || DEFAULT_MAP_ID : DEFAULT_MAP_ID
  );
  const [selectedId, setSelectedId] = useState('basic-roadmap');
  const [logEntries, setLogEntries] = useState<string[]>(() => [stamp(`Loaded docs line ${reactLine}.`)]);

  const pushLog = (message: string) => {
    setLogEntries((current) => [stamp(message), ...current].slice(0, 18));
  };

  useEffect(() => {
    localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
  }, [apiKey]);

  useEffect(() => {
    localStorage.setItem(MAP_ID_STORAGE_KEY, mapId);
  }, [mapId]);

  const examples = useMemo<ExampleDefinition[]>(
    () => [
      {
        id: 'basic-roadmap',
        category: 'Getting Started',
        title: 'Basic roadmap map',
        description: 'The smallest useful setup: provider, map container, center, zoom, and a single marker.',
        code: codeExample(
          'Basic roadmap',
          `<GoogleMapsProvider apiKey={apiKey}>
  <GoogleMap center={TORONTO} zoom={11} height={420}>
    <MapMarker position={TORONTO} />
  </GoogleMap>
</GoogleMapsProvider>`
        ),
        render: ({ apiKey, mapId, pushLog }) => (
          <DemoSurface apiKey={apiKey} mapId={mapId}>
            <GoogleMap center={TORONTO} zoom={11} height={420} onIdle={() => pushLog('Basic roadmap idle event fired.')}>
              <MapMarker position={TORONTO} title="Toronto" onClick={() => pushLog('Toronto marker clicked.')} />
            </GoogleMap>
          </DemoSurface>
        )
      },
      {
        id: 'controlled-camera',
        category: 'Getting Started',
        title: 'Controlled camera',
        description: 'Drive center and zoom from React state and keep the map in sync with UI buttons.',
        code: codeExample(
          'Controlled camera',
          `const [center, setCenter] = useState(TORONTO);
const [zoom, setZoom] = useState(10);

<GoogleMap center={center} zoom={zoom} />`
        ),
        render: ({ apiKey, mapId, pushLog }) => <ControlledCameraExample apiKey={apiKey} mapId={mapId} pushLog={pushLog} />
      },
      {
        id: 'map-events',
        category: 'Getting Started',
        title: 'Map click events',
        description: 'Click the map to drop markers and log the clicked latitude and longitude.',
        code: codeExample(
          'Map click events',
          `<GoogleMap onClick={(event) => {
  const next = event.latLng?.toJSON();
  if (next) setMarkers((current) => [...current, next]);
}} />`
        ),
        render: ({ apiKey, mapId, pushLog }) => <MapClickExample apiKey={apiKey} mapId={mapId} pushLog={pushLog} />
      },
      {
        id: 'marker-info-window',
        category: 'Markers',
        title: 'Markers and info windows',
        description: 'Use state-driven info windows with familiar marker click interactions.',
        code: codeExample(
          'Info window workflow',
          `<MapMarker position={city.position} onClick={() => setActiveCity(city.id)} />
<MapInfoWindow anchor={activeMarker} open={activeCity === city.id}>
  <strong>{city.name}</strong>
</MapInfoWindow>`
        ),
        render: ({ apiKey, mapId, pushLog }) => <MarkerInfoWindowExample apiKey={apiKey} mapId={mapId} pushLog={pushLog} />
      },
      {
        id: 'advanced-markers',
        category: 'Markers',
        title: 'Advanced markers with HTML',
        description: 'Render rich marker content without dropping down to imperative DOM management.',
        note: 'Advanced markers require a mapId. The docs default to DEMO_MAP_ID so you can test quickly.',
        code: codeExample(
          'Advanced marker HTML',
          `<MapAdvancedMarker position={OTTAWA}>
  <div className="marker-chip">
    <strong>Ottawa</strong>
    <span>HTML content</span>
  </div>
</MapAdvancedMarker>`
        ),
        render: ({ apiKey, mapId, pushLog }) => (
          <DemoSurface apiKey={apiKey} mapId={mapId}>
            <GoogleMap center={OTTAWA} zoom={6} mapId={mapId} height={420}>
              <MapAdvancedMarker position={OTTAWA} title="Ottawa" onClick={() => pushLog('Advanced marker Ottawa clicked.')}>
                <div className="marker-chip">
                  <strong>Ottawa</strong>
                  <span>Federal capital</span>
                </div>
              </MapAdvancedMarker>
              <MapAdvancedMarker position={MONTREAL} title="Montreal">
                <div className="marker-chip marker-chip--accent">
                  <strong>Montreal</strong>
                  <span>Festival district</span>
                </div>
              </MapAdvancedMarker>
            </GoogleMap>
          </DemoSurface>
        )
      },
      {
        id: 'draggable-marker',
        category: 'Markers',
        title: 'Draggable marker',
        description: 'Track user drag interactions with a migration-friendly marker API.',
        code: codeExample(
          'Draggable marker',
          `<MapMarker
  position={marker}
  draggable
  onDragEnd={(event) => setMarker(event.latLng!.toJSON())}
/>`
        ),
        render: ({ apiKey, mapId, pushLog }) => <DraggableMarkerExample apiKey={apiKey} mapId={mapId} pushLog={pushLog} />
      },
      {
        id: 'marker-clusterer',
        category: 'Markers',
        title: 'Marker clustering',
        description: 'Cluster many points with the official Google Maps markerclusterer package.',
        code: codeExample(
          'Marker clusterer',
          `<MapMarkerClusterer>
  {points.map((point) => (
    <MapMarker key={point.id} position={point} />
  ))}
</MapMarkerClusterer>`
        ),
        render: ({ apiKey, mapId, pushLog }) => (
          <DemoSurface apiKey={apiKey} mapId={mapId}>
            <GoogleMap center={SAN_FRANCISCO} zoom={8} height={420}>
              <MapMarkerClusterer onClusterClick={() => pushLog('Cluster clicked.')}>
                {CLUSTER_POINTS.map((point, index) => (
                  <MapMarker key={`${point.lat}-${point.lng}-${index}`} position={point} title={`Cluster point ${index + 1}`} />
                ))}
              </MapMarkerClusterer>
            </GoogleMap>
          </DemoSurface>
        )
      },
      {
        id: 'custom-cluster-html',
        category: 'Markers',
        title: 'Advanced markers + custom cluster HTML',
        description: 'Use advanced markers together with a custom cluster renderer so both individual pins and aggregated clusters can be fully branded.',
        note: 'This example uses the same official markerclusterer package, but wraps the renderer with a React-friendly helper.',
        code: codeExample(
          'Custom cluster renderer',
          `const renderer = createClusterRenderer({
  render: ({ count }) => {
    const element = document.createElement('div');
    element.className = 'cluster-card';
    element.innerHTML = \`<strong>\${count}</strong><span>places</span>\`;
    return element;
  }
});

<MapMarkerClusterer renderer={renderer}>
  <MapAdvancedMarker position={point}>...</MapAdvancedMarker>
</MapMarkerClusterer>`
        ),
        render: ({ apiKey, mapId, pushLog }) => (
          <CustomClusterHtmlExample apiKey={apiKey} mapId={mapId} pushLog={pushLog} />
        )
      },
      {
        id: 'polyline',
        category: 'Shapes & Overlays',
        title: 'Polyline route',
        description: 'Render a route-like polyline with interaction callbacks.',
        code: codeExample(
          'Polyline',
          `<MapPolyline
  path={[TORONTO, OTTAWA, MONTREAL]}
  options={{ strokeColor: '#1f5ba7', strokeWeight: 4 }}
/>`
        ),
        render: ({ apiKey, mapId, pushLog }) => (
          <DemoSurface apiKey={apiKey} mapId={mapId}>
            <GoogleMap center={OTTAWA} zoom={6} height={420}>
              <MapPolyline
                path={[TORONTO, OTTAWA, MONTREAL]}
                options={{ strokeColor: '#1f5ba7', strokeWeight: 4, geodesic: true }}
                onClick={() => pushLog('Polyline clicked.')}
              />
              <MapMarker position={TORONTO} />
              <MapMarker position={OTTAWA} />
              <MapMarker position={MONTREAL} />
            </GoogleMap>
          </DemoSurface>
        )
      },
      {
        id: 'polygon',
        category: 'Shapes & Overlays',
        title: 'Polygon area',
        description: 'Model an area with a clickable polygon and semi-transparent fill.',
        code: codeExample(
          'Polygon',
          `<MapPolygon
  paths={[TORONTO, OTTAWA, MONTREAL]}
  options={{ fillColor: '#0d5c9e', fillOpacity: 0.18 }}
/>`
        ),
        render: ({ apiKey, mapId, pushLog }) => (
          <DemoSurface apiKey={apiKey} mapId={mapId}>
            <GoogleMap center={OTTAWA} zoom={6} height={420}>
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
                onClick={() => pushLog('Polygon clicked.')}
              />
            </GoogleMap>
          </DemoSurface>
        )
      },
      {
        id: 'rectangle-circle',
        category: 'Shapes & Overlays',
        title: 'Rectangle and circle',
        description: 'Use rectangle and circle overlays together for coverage or search radius workflows.',
        code: codeExample(
          'Rectangle and circle',
          `<MapRectangle bounds={bounds} />
<MapCircle center={TORONTO} radius={14000} />`
        ),
        render: ({ apiKey, mapId, pushLog }) => (
          <DemoSurface apiKey={apiKey} mapId={mapId}>
            <GoogleMap center={TORONTO} zoom={11} height={420}>
              <MapRectangle
                bounds={{ north: 43.72, south: 43.60, east: -79.30, west: -79.48 }}
                options={{ strokeColor: '#b43f3f', fillColor: '#f4b7b7', fillOpacity: 0.15 }}
                onClick={() => pushLog('Rectangle clicked.')}
              />
              <MapCircle
                center={TORONTO}
                radius={12000}
                options={{ strokeColor: '#30a46c', fillColor: '#8ad7b0', fillOpacity: 0.14 }}
                onClick={() => pushLog('Circle clicked.')}
              />
            </GoogleMap>
          </DemoSurface>
        )
      },
      {
        id: 'ground-overlay',
        category: 'Shapes & Overlays',
        title: 'Ground overlay',
        description: 'Place an image overlay on top of a map area with a declarative component.',
        code: codeExample(
          'Ground overlay',
          `<MapGroundOverlay
  url="https://developers.google.com/maps/documentation/javascript/examples/full/images/talkeetna.png"
  bounds={overlayBounds}
/>`
        ),
        render: ({ apiKey, mapId, pushLog }) => (
          <DemoSurface apiKey={apiKey} mapId={mapId}>
            <GoogleMap center={{ lat: 62.323907, lng: -150.109291 }} zoom={10} height={420}>
              <MapGroundOverlay
                url="https://developers.google.com/maps/documentation/javascript/examples/full/images/talkeetna.png"
                bounds={{ north: 62.400471, south: 62.281819, east: -150.005608, west: -150.287132 }}
                opacity={0.7}
                onClick={() => pushLog('Ground overlay clicked.')}
              />
            </GoogleMap>
          </DemoSurface>
        )
      },
      {
        id: 'transport-layers',
        category: 'Layers',
        title: 'Traffic, transit, and bicycling',
        description: 'Toggle Google’s live transportation layers without leaving declarative React.',
        code: codeExample(
          'Transportation layers',
          `{showTraffic && <MapTrafficLayer />}
{showTransit && <MapTransitLayer />}
{showBicycling && <MapBicyclingLayer />}`
        ),
        render: ({ apiKey, mapId, pushLog }) => <TransportLayersExample apiKey={apiKey} mapId={mapId} pushLog={pushLog} />
      },
      {
        id: 'kml-layer',
        category: 'Layers',
        title: 'KML layer',
        description: 'Load a remote KML feed through the same React composition model.',
        code: codeExample(
          'KML layer',
          `<MapKmlLayer url="https://googlemaps.github.io/js-v2-samples/ggeoxml/cta.kml" />`
        ),
        render: ({ apiKey, mapId, pushLog }) => (
          <DemoSurface apiKey={apiKey} mapId={mapId}>
            <GoogleMap center={CHICAGO} zoom={10} height={420}>
              <MapKmlLayer
                url="https://googlemaps.github.io/js-v2-samples/ggeoxml/cta.kml"
                options={{ preserveViewport: true }}
              />
            </GoogleMap>
          </DemoSurface>
        )
      },
      {
        id: 'heatmap-layer',
        category: 'Layers',
        title: 'Heatmap layer',
        description: 'Render weighted heatmap data for density-based visualizations.',
        code: codeExample(
          'Heatmap',
          `<MapHeatmapLayer data={[
  { location: TORONTO, weight: 4 },
  { location: OTTAWA, weight: 2 }
]} />`
        ),
        render: ({ apiKey, mapId, pushLog }) => (
          <DemoSurface apiKey={apiKey} mapId={mapId}>
            <GoogleMap center={OTTAWA} zoom={5} height={420}>
              <MapHeatmapLayer
                data={[
                  { location: TORONTO, weight: 4 },
                  { location: OTTAWA, weight: 2 },
                  { location: MONTREAL, weight: 3 },
                  { location: CHICAGO, weight: 5 },
                  { location: NEW_YORK, weight: 4 },
                  { location: SAN_FRANCISCO, weight: 1 }
                ]}
                options={{ radius: 32, opacity: 0.7 }}
              />
            </GoogleMap>
          </DemoSurface>
        )
      },
      {
        id: 'directions',
        category: 'Services',
        title: 'Directions service + renderer',
        description: 'Keep route requests declarative with a renderless service component and a visual renderer.',
        note: 'This example requires the Directions API to be enabled for the API key in Google Cloud.',
        code: codeExample(
          'Directions workflow',
          `<MapDirectionsService request={request} onResult={({ result }) => setDirections(result)} />
<MapDirectionsRenderer directions={directions} />`
        ),
        render: ({ apiKey, mapId, pushLog }) => <DirectionsExample apiKey={apiKey} mapId={mapId} pushLog={pushLog} />
      },
      {
        id: 'geocoder',
        category: 'Services',
        title: 'Geocoding with a hook',
        description: 'Use a React hook for address lookup and update the map with the geocoded result.',
        note: 'This example requires the Geocoding API to be enabled for the API key in Google Cloud.',
        code: codeExample(
          'Geocoding hook',
          `const geocoder = useMapGeocoder();
const response = await geocoder?.geocode({ address: 'Toronto City Hall' });`
        ),
        render: ({ apiKey, mapId, pushLog }) => <GeocoderExample apiKey={apiKey} mapId={mapId} pushLog={pushLog} />
      },
      {
        id: 'custom-control',
        category: 'Controls',
        title: 'Custom map control + imperative fit bounds',
        description: 'Compose React controls inside the map UI and still expose the native map handle for advanced flows.',
        code: codeExample(
          'Custom control',
          `const mapRef = useRef<GoogleMapHandle>(null);
<MapControl position={google.maps.ControlPosition.TOP_CENTER}>
  <button onClick={() => mapRef.current?.fitBounds(bounds)}>Fit bounds</button>
</MapControl>`
        ),
        render: ({ apiKey, mapId, pushLog }) => <CustomControlExample apiKey={apiKey} mapId={mapId} pushLog={pushLog} />
      }
    ],
    []
  );

  const selected = examples.find((example) => example.id === selectedId) || examples[0];

  return (
    <main className="shell">
      <section className="hero" id="overview">
        <div className="hero-card hero-main">
          <span className="badge">{reactLine} · GOOGLE MAPS · MARKERCLUSTERER</span>
          <h1>@revivejs/react-google-maps</h1>
          <p>
            A migration-friendly React wrapper for the Google Maps JavaScript API with declarative
            maps, markers, advanced markers, info windows, shapes, services, layers, and official
            marker clustering support.
          </p>

          <div className="feature-grid">
            <div className="feature">
              <strong>Angular-friendly migration</strong>
              Familiar component names like <code>GoogleMap</code>, <code>MapMarker</code>,
              <code>MapInfoWindow</code>, and <code>MapMarkerClusterer</code>.
            </div>
            <div className="feature">
              <strong>Official clustering</strong>
              Built around <code>@googlemaps/markerclusterer</code> instead of a custom clustering abstraction.
            </div>
            <div className="feature">
              <strong>Maps + services</strong>
              Shapes, overlays, transport layers, directions, and geocoding all sit in one package.
            </div>
            <div className="feature">
              <strong>Versioned docs history</strong>
              Dedicated docs builds exist for React 17, 18, and 19 under the same maintained package line.
            </div>
          </div>

          <div className="cta-row">
            <a className="btn" href="#examples">See examples</a>
            <a className="btn secondary" href="https://github.com/alexandroit/react-google-maps#readme" target="_blank" rel="noreferrer">
              README
            </a>
          </div>
        </div>

        <div className="hero-card hero-setup" id="setup">
          <h2>Setup in 3 steps</h2>

          <div className="step">
            <span className="step-num">1</span>
            <div>
              <strong>Install</strong>
              <pre>{INSTALL_CODE}</pre>
            </div>
          </div>

          <div className="step">
            <span className="step-num">2</span>
            <div>
              <strong>Wrap your app with the provider</strong>
              <pre>{PROVIDER_CODE}</pre>
            </div>
          </div>

          <div className="step">
            <span className="step-num">3</span>
            <div>
              <strong>Keep migration simple</strong>
              <pre>{MIGRATION_CODE}</pre>
            </div>
          </div>
        </div>
      </section>

      <section className="docs-layout">
        <aside className="docs-sidebar">
          <div className="panel docs-nav-panel">
            <h2>Documentation</h2>
            <p>Use this guide like a manual: load the API, choose the right marker model, then move through the explorer and the imperative APIs when your app needs more control.</p>
            <nav className="docs-nav">
              {DOC_SECTIONS.map((section) => (
                <a key={section.id} className="docs-nav-link" href={`#${section.id}`}>
                  {section.label}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        <section className="layout" id="examples">
        <div className="panels">
          <article className="panel" id="loading">
            <div className="panel-header">
              <h2>Loading patterns</h2>
              <p>
                The package supports both common Google Maps loading strategies. For most React apps,
                the recommended path is <code>GoogleMapsProvider</code>. If your organization already
                standardizes on a global script in <code>index.html</code>, the wrapper also respects
                an existing <code>window.google.maps</code>.
              </p>
            </div>

            <div className="guide-grid">
              <label className="field-card">
                <span>Provider-first setup</span>
                <p>The provider is the easiest option when you want React to own lifecycle, retries, loading, and versioned docs parity.</p>
                <pre>{PROVIDER_CODE}</pre>
              </label>

              <div className="field-card">
                <span>Script tag compatible</span>
                <p>
                  If your team already injects Google Maps globally, keep that pattern. The provider
                  detects an existing <code>window.google.maps</code> and reuses it.
                </p>
                <pre>{INDEX_HTML_CODE}</pre>
              </div>

              <div className="field-card">
                <span>Live demo credentials</span>
                <p>
                  Paste a browser API key to unlock the live explorer. Advanced markers need a map ID.
                  <code>DEMO_MAP_ID</code> works for demos. Directions and geocoding also need the
                  corresponding Google APIs enabled for the same key.
                </p>
                <input
                  className="text-input"
                  type="password"
                  value={apiKey}
                  onChange={(event) => setApiKey(event.target.value)}
                  placeholder="Paste a browser API key"
                />
                <input
                  className="text-input"
                  type="text"
                  value={mapId}
                  onChange={(event) => setMapId(event.target.value || DEFAULT_MAP_ID)}
                  placeholder="DEMO_MAP_ID"
                />
              </div>
            </div>
          </article>

          <article className="panel" id="migration">
            <div className="panel-header">
              <h2>Migration guide</h2>
              <p>
                The package is designed so a team coming from Angular Google Maps or direct Google Maps
                JavaScript can migrate in layers instead of rewriting everything at once.
              </p>
            </div>

            <div className="guide-grid guide-grid--two">
              <div className="field-card">
                <span>Mental model</span>
                <p>Think of it as a declarative shell around the same native objects you already know.</p>
                <pre>{MIGRATION_CODE}</pre>
              </div>

              <div className="field-card">
                <span>Imperative escape hatch</span>
                <p>When an app needs full control, use refs and native handles instead of breaking out of the wrapper entirely.</p>
                <pre>{REF_CODE}</pre>
              </div>
            </div>
          </article>

          <article className="panel" id="marker-model">
            <div className="panel-header">
              <h2>Marker strategy</h2>
              <p>
                The library intentionally keeps both marker models because large apps often need both:
                the classic marker for compatibility and the advanced marker for branded HTML content.
              </p>
            </div>

            <div className="guide-grid guide-grid--three">
              <div className="field-card">
                <span>Use MapMarker when</span>
                <p>You are migrating older code, reusing classic marker icons, or you want the simplest possible drop-in replacement.</p>
              </div>
              <div className="field-card">
                <span>Use MapAdvancedMarker when</span>
                <p>You want HTML content, branded pin cards, richer interaction states, or tighter control over marker presentation.</p>
              </div>
              <div className="field-card">
                <span>Use both together when</span>
                <p>You are migrating gradually. The clusterer accepts both classic markers and advanced markers in the same wrapper.</p>
              </div>
            </div>
          </article>

          <article className="panel" id="customization">
            <div className="panel-header">
              <h2>Customization patterns</h2>
              <p>
                This package is designed to stay simple for basic usage and still scale to highly customized maps.
                The latest addition is custom cluster rendering with branded HTML.
              </p>
            </div>

            <div className="guide-grid guide-grid--two">
              <div className="field-card">
                <span>Custom cluster renderer</span>
                <p>
                  Use <code>createClusterRenderer()</code> when you want a higher-level helper, while still staying
                  on the official clusterer API from Google.
                </p>
                <pre>{CLUSTER_HELPER_CODE}</pre>
              </div>

              <div className="field-card">
                <span>Why this helps</span>
                <p>
                  It keeps the official clusterer as the source of truth, but gives your React app an easy way
                  to brand cluster visuals, switch between advanced-marker and fallback marker output, and keep the
                  docs/examples readable.
                </p>
              </div>
            </div>
          </article>

          <article className="panel" id="examples">
            <div className="panel-header">
              <h2>Example explorer</h2>
              <p>
                The explorer below covers the main surfaces developers look for in the official
                Google Maps JavaScript API docs: base maps, markers, advanced markers, clustering,
                shapes, overlays, layers, directions, geocoding, and custom controls.
              </p>
            </div>

            <div className="example-explorer">
              <aside className="demo-nav">
                {groupExamples(examples).map((group) => (
                  <section key={group.category} className="demo-group">
                    <h3>{group.category}</h3>
                    <div className="demo-list">
                      {group.items.map((example) => (
                        <button
                          key={example.id}
                          type="button"
                          className={`demo-link ${selected.id === example.id ? 'active' : ''}`}
                          onClick={() => {
                            setSelectedId(example.id);
                            pushLog(`Opened example: ${example.category} / ${example.title}.`);
                          }}
                        >
                          {example.title}
                        </button>
                      ))}
                    </div>
                  </section>
                ))}
              </aside>

              <div className="demo-stage">
                <div className="demo-stage-header">
                  <div className="demo-breadcrumb">
                    <span className="meta-pill">{selected.category}</span>
                    <span className="meta-pill light">{reactLine}</span>
                  </div>
                  <h3>{selected.title}</h3>
                  <p>{selected.description}</p>
                  {selected.note ? <p className="demo-note">{selected.note}</p> : null}
                </div>

                <pre className="code">{selected.code}</pre>

                <div className="demo-card">{selected.render({ apiKey, mapId, pushLog })}</div>
              </div>
            </div>
          </article>

          <article className="panel" id="api-reference">
            <div className="panel-header">
              <h2>API reference</h2>
              <p>The package keeps the surface declarative, but still exposes native instances through refs and callbacks for advanced integrations.</p>
            </div>

            <div className="ref-grid">
              <div className="ref-card">
                <h4>Core components</h4>
                <table className="api-table">
                  <tbody>
                    <tr>
                      <td><code>&lt;GoogleMapsProvider /&gt;</code></td>
                      <td>Loads the Google Maps JavaScript API once and shares readiness through context.</td>
                    </tr>
                    <tr>
                      <td><code>&lt;GoogleMap /&gt;</code></td>
                      <td>Creates the map instance with familiar props like <code>center</code>, <code>zoom</code>, <code>mapId</code>, and <code>options</code>.</td>
                    </tr>
                    <tr>
                      <td><code>&lt;MapMarker /&gt;</code></td>
                      <td>Wraps <code>google.maps.Marker</code> with common props and events.</td>
                    </tr>
                    <tr>
                      <td><code>&lt;MapAdvancedMarker /&gt;</code></td>
                      <td>Wraps <code>AdvancedMarkerElement</code> and lets React render rich HTML marker content.</td>
                    </tr>
                    <tr>
                      <td><code>&lt;MapInfoWindow /&gt;</code></td>
                      <td>Anchors React content to markers or positions via <code>google.maps.InfoWindow</code>.</td>
                    </tr>
                    <tr>
                      <td><code>&lt;MapMarkerClusterer /&gt;</code></td>
                      <td>Groups markers using the official Google markerclusterer library.</td>
                    </tr>
                    <tr>
                      <td><code>createClusterRenderer()</code></td>
                      <td>Builds custom cluster HTML or fallback icon renderers without replacing the official clusterer API.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="ref-card">
                <h4>Overlays and layers</h4>
                <table className="api-table">
                  <tbody>
                    <tr><td><code>&lt;MapPolyline /&gt;</code></td><td>Polyline paths</td></tr>
                    <tr><td><code>&lt;MapPolygon /&gt;</code></td><td>Polygon areas</td></tr>
                    <tr><td><code>&lt;MapRectangle /&gt;</code></td><td>Bounds rectangles</td></tr>
                    <tr><td><code>&lt;MapCircle /&gt;</code></td><td>Radius overlays</td></tr>
                    <tr><td><code>&lt;MapGroundOverlay /&gt;</code></td><td>Image overlays</td></tr>
                    <tr><td><code>&lt;MapTrafficLayer /&gt;</code></td><td>Traffic data</td></tr>
                    <tr><td><code>&lt;MapTransitLayer /&gt;</code></td><td>Transit data</td></tr>
                    <tr><td><code>&lt;MapBicyclingLayer /&gt;</code></td><td>Bicycling data</td></tr>
                    <tr><td><code>&lt;MapKmlLayer /&gt;</code></td><td>KML feeds</td></tr>
                    <tr><td><code>&lt;MapHeatmapLayer /&gt;</code></td><td>Visualization heatmaps</td></tr>
                  </tbody>
                </table>
              </div>

              <div className="ref-card">
                <h4>Services and hooks</h4>
                <table className="api-table">
                  <tbody>
                    <tr><td><code>&lt;MapDirectionsService /&gt;</code></td><td>Renderless directions request runner.</td></tr>
                    <tr><td><code>&lt;MapDirectionsRenderer /&gt;</code></td><td>Visual directions overlay.</td></tr>
                    <tr><td><code>useGoogleMap()</code></td><td>Returns the current native <code>google.maps.Map</code> inside descendants.</td></tr>
                    <tr><td><code>useMapGeocoder()</code></td><td>Returns a memoized <code>google.maps.Geocoder</code> instance.</td></tr>
                    <tr><td><code>useDirectionsService()</code></td><td>Returns a memoized <code>google.maps.DirectionsService</code> instance.</td></tr>
                    <tr><td><code>&lt;MapControl /&gt;</code></td><td>Mounts React UI into native map control slots.</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </article>
        </div>

        <aside className="sidebar">
          <section className="panel log-panel">
            <div className="log-header">
              <div>
                <h2>Event Log</h2>
                <p>Map clicks, service responses, control interactions, and explorer changes appear here.</p>
              </div>
              <button className="clear-btn" type="button" onClick={() => setLogEntries([])}>
                Clear
              </button>
            </div>

            <div className="log-list">
              {logEntries.map((entry) => (
                <div key={entry} className="log-entry">
                  {entry}
                </div>
              ))}
            </div>

            <div className="release-card">
              <h3>Release line</h3>
              <p>This docs build matches the maintained React compatibility line and the published npm package.</p>
              <div className="api-row"><strong>Package line</strong><span>{packageVersion}</span></div>
              <div className="api-row"><strong>React line</strong><span>{reactVersion}</span></div>
              <div className="api-row"><strong>Docs path</strong><span>{docsPath}/</span></div>
              <div className="api-row"><strong>Pattern</strong><span>docs-src history + compiled docs history</span></div>
              <div className="api-row"><strong>Includes</strong><span>markerclusterer, layers, directions, geocoder</span></div>
            </div>
          </section>
        </aside>
        </section>
      </section>
    </main>
  );
}

function groupExamples(examples: ExampleDefinition[]) {
  const order = Array.from(new Set(examples.map((example) => example.category)));
  return order.map((category) => ({
    category,
    items: examples.filter((example) => example.category === category)
  }));
}

function DemoSurface({
  apiKey,
  mapId,
  children
}: {
  apiKey: string;
  mapId: string;
  children: ReactNode;
}) {
  if (!apiKey) {
    return (
      <div className="api-key-empty">
        <strong>Add a browser API key to unlock the live demo.</strong>
        <p>The docs shell and code samples work without a key, but live Google Maps examples require one.</p>
      </div>
    );
  }

  return (
    <GoogleMapsProvider apiKey={apiKey} mapIds={[mapId]} libraries={['marker', 'places', 'geometry', 'visualization']}>
      {children}
    </GoogleMapsProvider>
  );
}

function ControlledCameraExample({ apiKey, mapId, pushLog }: ExampleContext) {
  const [center, setCenter] = useState(TORONTO);
  const [zoom, setZoom] = useState(10);

  return (
    <DemoSurface apiKey={apiKey} mapId={mapId}>
      <div className="control-strip">
        <button type="button" onClick={() => setCenter(TORONTO)}>Toronto</button>
        <button type="button" onClick={() => setCenter(MONTREAL)}>Montreal</button>
        <button type="button" onClick={() => setCenter(OTTAWA)}>Ottawa</button>
        <button type="button" onClick={() => setZoom((current) => Math.min(current + 1, 15))}>Zoom in</button>
        <button type="button" onClick={() => setZoom((current) => Math.max(current - 1, 4))}>Zoom out</button>
      </div>
      <GoogleMap
        center={center}
        zoom={zoom}
        height={420}
        onIdle={() => pushLog(`Camera settled at ${center.lat.toFixed(3)}, ${center.lng.toFixed(3)} / zoom ${zoom}.`)}
      >
        <MapMarker position={center} title="Controlled center" />
      </GoogleMap>
    </DemoSurface>
  );
}

function MapClickExample({ apiKey, mapId, pushLog }: ExampleContext) {
  const [markers, setMarkers] = useState([TORONTO, OTTAWA]);

  return (
    <DemoSurface apiKey={apiKey} mapId={mapId}>
      <GoogleMap
        center={OTTAWA}
        zoom={6}
        height={420}
        onClick={(event) => {
          const next = event.latLng?.toJSON();
          if (next) {
            setMarkers((current) => [...current, next]);
            pushLog(`Dropped marker at ${next.lat.toFixed(4)}, ${next.lng.toFixed(4)}.`);
          }
        }}
      >
        {markers.map((marker, index) => (
          <MapMarker key={`${marker.lat}-${marker.lng}-${index}`} position={marker} title={`Marker ${index + 1}`} />
        ))}
      </GoogleMap>
    </DemoSurface>
  );
}

function MarkerInfoWindowExample({ apiKey, mapId, pushLog }: ExampleContext) {
  const cities = [
    { id: 'toronto', name: 'Toronto', position: TORONTO, text: 'Ontario capital and a common migration example base.' },
    { id: 'ottawa', name: 'Ottawa', position: OTTAWA, text: 'Good midpoint for routing demos and government data.' },
    { id: 'montreal', name: 'Montreal', position: MONTREAL, text: 'Useful for bilingual and transit-heavy examples.' }
  ];
  const [active, setActive] = useState<string | null>('toronto');
  const markerRefs = useRef<Record<string, google.maps.Marker | null>>({});

  return (
    <DemoSurface apiKey={apiKey} mapId={mapId}>
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
            onClick={() => {
              setActive(city.id);
              pushLog(`Opened info window for ${city.name}.`);
            }}
          />
        ))}
        <MapInfoWindow
          anchor={active ? markerRefs.current[active] : null}
          open={!!active}
          position={cities.find((city) => city.id === active)?.position}
          onCloseClick={() => {
            setActive(null);
            pushLog('Info window closed.');
          }}
        >
          {active ? (
            <div className="info-window-card">
              <strong>{cities.find((city) => city.id === active)?.name}</strong>
              <p>{cities.find((city) => city.id === active)?.text}</p>
            </div>
          ) : null}
        </MapInfoWindow>
      </GoogleMap>
    </DemoSurface>
  );
}

function DraggableMarkerExample({ apiKey, mapId, pushLog }: ExampleContext) {
  const [position, setPosition] = useState(TORONTO);

  return (
    <DemoSurface apiKey={apiKey} mapId={mapId}>
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
              pushLog(`Dragged marker to ${next.lat.toFixed(4)}, ${next.lng.toFixed(4)}.`);
            }
          }}
        />
      </GoogleMap>
    </DemoSurface>
  );
}

function CustomClusterHtmlExample({ apiKey, mapId, pushLog }: ExampleContext) {
  const renderer = useMemo(
    () =>
      createClusterRenderer({
        className: 'cluster-card',
        title: ({ count }) => `Cluster with ${count} advanced markers`,
        render: ({ count }) => {
          const element = document.createElement('div');
          element.className = 'cluster-card';

          const strong = document.createElement('strong');
          strong.textContent = String(count);

          const span = document.createElement('span');
          span.textContent = count === 1 ? 'place' : 'places';

          element.append(strong, span);
          return element;
        }
      }),
    []
  );

  return (
    <DemoSurface apiKey={apiKey} mapId={mapId}>
      <GoogleMap center={SAN_FRANCISCO} zoom={8} mapId={mapId} height={420}>
        <MapMarkerClusterer
          renderer={renderer}
          onClusterClick={() => pushLog('Custom HTML cluster clicked.')}
        >
          {CLUSTER_POINTS.map((point, index) => (
            <MapAdvancedMarker
              key={`advanced-${point.lat}-${point.lng}-${index}`}
              position={point}
              title={`Location ${index + 1}`}
              onClick={() => pushLog(`Advanced marker ${index + 1} clicked.`)}
            >
              <div className="marker-chip marker-chip--mini">
                <strong>{index + 1}</strong>
                <span>Place</span>
              </div>
            </MapAdvancedMarker>
          ))}
        </MapMarkerClusterer>
      </GoogleMap>
    </DemoSurface>
  );
}

function TransportLayersExample({ apiKey, mapId, pushLog }: ExampleContext) {
  const [traffic, setTraffic] = useState(true);
  const [transit, setTransit] = useState(false);
  const [bicycling, setBicycling] = useState(false);

  return (
    <DemoSurface apiKey={apiKey} mapId={mapId}>
      <div className="control-strip">
        <button type="button" onClick={() => { setTraffic((current) => !current); pushLog(`Traffic layer ${traffic ? 'disabled' : 'enabled'}.`); }}>Traffic</button>
        <button type="button" onClick={() => { setTransit((current) => !current); pushLog(`Transit layer ${transit ? 'disabled' : 'enabled'}.`); }}>Transit</button>
        <button type="button" onClick={() => { setBicycling((current) => !current); pushLog(`Bicycling layer ${bicycling ? 'disabled' : 'enabled'}.`); }}>Bicycling</button>
      </div>
      <GoogleMap center={NEW_YORK} zoom={12} height={420}>
        {traffic ? <MapTrafficLayer /> : null}
        {transit ? <MapTransitLayer /> : null}
        {bicycling ? <MapBicyclingLayer /> : null}
      </GoogleMap>
    </DemoSurface>
  );
}

function DirectionsExample({ apiKey, mapId, pushLog }: ExampleContext) {
  const [travelMode, setTravelMode] = useState<google.maps.TravelMode>('DRIVING' as google.maps.TravelMode);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);

  return (
    <DemoSurface apiKey={apiKey} mapId={mapId}>
      <div className="control-strip">
        <button type="button" onClick={() => setTravelMode('DRIVING' as google.maps.TravelMode)}>Driving</button>
        <button type="button" onClick={() => setTravelMode('TRANSIT' as google.maps.TravelMode)}>Transit</button>
        <button type="button" onClick={() => setTravelMode('WALKING' as google.maps.TravelMode)}>Walking</button>
      </div>
      <GoogleMap center={OTTAWA} zoom={6} height={420}>
        <MapDirectionsService
          request={{
            origin: 'Toronto, ON',
            destination: 'Montreal, QC',
            travelMode
          }}
          onResult={({ status, result }: DirectionsServiceResult) => {
            if (result) {
              setDirections(result);
            }
            pushLog(`Directions request completed with status ${status}.`);
          }}
          onError={(error) => pushLog(error.message)}
        />
        <MapDirectionsRenderer directions={directions} />
      </GoogleMap>
    </DemoSurface>
  );
}

function GeocoderExample({ apiKey, mapId, pushLog }: ExampleContext) {
  return (
    <DemoSurface apiKey={apiKey} mapId={mapId}>
      <GeocoderInner pushLog={pushLog} />
    </DemoSurface>
  );
}

function GeocoderInner({ pushLog }: { pushLog: (message: string) => void }) {
  const geocoder = useMapGeocoder();
  const [address, setAddress] = useState('Toronto City Hall');
  const [center, setCenter] = useState(TORONTO);
  const [resultText, setResultText] = useState('Use the button to geocode an address.');

  return (
    <>
      <div className="control-strip">
        <input className="text-input compact" value={address} onChange={(event) => setAddress(event.target.value)} />
        <button
          type="button"
          onClick={async () => {
            if (!geocoder) {
              pushLog('Geocoder is not ready yet.');
              return;
            }
            const response = await geocoder.geocode({ address });
            const first = response.results[0];
            if (first?.geometry.location) {
              const next = first.geometry.location.toJSON();
              setCenter(next);
              setResultText(first.formatted_address);
              pushLog(`Geocoded "${address}" to ${next.lat.toFixed(4)}, ${next.lng.toFixed(4)}.`);
            } else {
              pushLog(`No geocoding results for "${address}".`);
            }
          }}
        >
          Geocode
        </button>
      </div>
      <GoogleMap center={center} zoom={13} height={420}>
        <MapMarker position={center} title={resultText} />
      </GoogleMap>
      <p className="inline-note">{resultText}</p>
    </>
  );
}

function CustomControlExample({ apiKey, mapId, pushLog }: ExampleContext) {
  const mapRef = useRef<GoogleMapHandle>(null);
  const topCenter = ((window as any).google?.maps?.ControlPosition?.TOP_CENTER ?? 2) as google.maps.ControlPosition;
  const bounds = {
    north: 45.7,
    south: 43.4,
    east: -72.8,
    west: -79.8
  };

  return (
    <DemoSurface apiKey={apiKey} mapId={mapId}>
      <GoogleMap ref={mapRef} center={OTTAWA} zoom={6} height={420}>
        <MapControl position={topCenter}>
          <div className="map-control">
            <button
              type="button"
              onClick={() => {
                mapRef.current?.fitBounds(bounds);
                pushLog('Fit bounds control clicked.');
              }}
            >
              Fit Ontario–Quebec corridor
            </button>
          </div>
        </MapControl>
        <MapMarker position={TORONTO} />
        <MapMarker position={OTTAWA} />
        <MapMarker position={MONTREAL} />
      </GoogleMap>
    </DemoSurface>
  );
}
