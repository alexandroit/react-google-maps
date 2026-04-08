import { useMemo, useRef, useState, type ReactNode } from 'react';
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
} from '@stackline/react-google-maps';

type AppProps = {
  reactLine: string;
  reactVersion: string;
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
  pushLog: (message: string) => void;
};

const DEFAULT_MAP_ID = 'DEMO_MAP_ID';

const INSTALL_CODE = `npm install @stackline/react-google-maps@17`;

const PROVIDER_CODE = `import { GoogleMapsProvider } from '@stackline/react-google-maps';

function App() {
  return (
    <GoogleMapsProvider
      apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
      libraries={['marker']}
      mapIds={[process.env.REACT_APP_GOOGLE_MAP_ID]}
    >
      <AppShell />
    </GoogleMapsProvider>
  );
}`;

const PROVIDER_ONLY_CODE = `import { GoogleMapsProvider } from '@stackline/react-google-maps';

function Root() {
  return (
    <GoogleMapsProvider
      apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
      libraries={['marker']}
      mapIds={[process.env.REACT_APP_GOOGLE_MAP_ID]}
    >
      <App />
    </GoogleMapsProvider>
  );
}`;

const MAP_RENDER_CODE = `import { GoogleMap, MapAdvancedMarker } from '@stackline/react-google-maps';

const center = { lat: 40.7128, lng: -74.006 };

function BasicMap() {
  return (
    <GoogleMap center={center} zoom={11} mapId={process.env.REACT_APP_GOOGLE_MAP_ID} height={360}>
      <MapAdvancedMarker position={center} title="New York City">
        <div className="marker-chip marker-chip--mini">
          <strong>NYC</strong>
          <span>Advanced marker</span>
        </div>
      </MapAdvancedMarker>
    </GoogleMap>
  );
}`;

const CLASSIC_EXAMPLE_CODE = `import { GoogleMapsProvider, GoogleMap, MapAdvancedMarker } from '@stackline/react-google-maps';

const center = { lat: 40.7128, lng: -74.006 };

export function AdvancedMarkerQuickStart() {
  return (
    <GoogleMapsProvider
      apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
      libraries={['marker']}
      mapIds={[process.env.REACT_APP_GOOGLE_MAP_ID]}
    >
      <GoogleMap center={center} zoom={11} mapId={process.env.REACT_APP_GOOGLE_MAP_ID} height={420}>
        <MapAdvancedMarker position={center} title="New York City">
          <div className="marker-chip marker-chip--mini">
            <strong>NYC</strong>
            <span>Advanced marker</span>
          </div>
        </MapAdvancedMarker>
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

const REF_CODE = `const mapRef = useRef<GoogleMapHandle>(null);
const markerRef = useRef<MapAdvancedMarkerHandle>(null);

mapRef.current?.fitBounds(bounds);
markerRef.current?.setPosition(nextPoint);
markerRef.current?.setZIndex(40);`;

const CLUSTER_HELPER_CODE = `import { createClusterRenderer } from '@stackline/react-google-maps';

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

function wrapperNoKeyPreviewPath(exampleId: string) {
  return `./wrapper-no-key.html?example=${encodeURIComponent(exampleId)}`;
}

function randomPoints(center: google.maps.LatLngLiteral, count: number) {
  return Array.from({ length: count }, (_, index) => ({
    lat: center.lat + Math.sin(index * 1.17) * 0.12 + ((index % 3) - 1) * 0.01,
    lng: center.lng + Math.cos(index * 0.93) * 0.12 + ((index % 5) - 2) * 0.008
  }));
}

const CLUSTER_POINTS = randomPoints(SAN_FRANCISCO, 36);
export default function App({ reactLine, reactVersion, packageVersion }: AppProps) {
  const [selectedId, setSelectedId] = useState('advanced-markers');
  const [logEntries, setLogEntries] = useState<string[]>(() => [
    stamp(`Loaded ${reactLine} docs.`),
    stamp(`Selected example: Advanced markers.`)
  ]);

  const pushLog = (message: string) => {
    setLogEntries((current) => [stamp(message), ...current].slice(0, 18));
  };

  const examples = useMemo<ExampleDefinition[]>(
    () => [
      {
        id: 'basic-roadmap',
        category: 'Test menu',
        title: 'Basic map bootstrapping',
        description: 'The smallest useful setup: provider, map container, center, zoom, and one advanced marker.',
        code: codeExample(
          'Basic roadmap',
          `<GoogleMapsProvider>
  <GoogleMap center={TORONTO} zoom={11} mapId={GOOGLE_MAP_ID} height={420}>
    <MapAdvancedMarker position={TORONTO}>
      <div className="marker-chip marker-chip--mini">Toronto</div>
    </MapAdvancedMarker>
  </GoogleMap>
</GoogleMapsProvider>`
        ),
        render: ({ pushLog }) => (
          <DemoSurface>
            <GoogleMap center={TORONTO} zoom={11} height={420}>
              <MapMarker position={TORONTO} title="Toronto" onClick={() => pushLog('Toronto marker clicked.')} />
            </GoogleMap>
          </DemoSurface>
        )
      },
      {
        id: 'controlled-camera',
        category: 'Test menu',
        title: 'Controlled center and zoom',
        description: 'Drive center and zoom from React state and keep the map in sync with UI buttons.',
        code: codeExample(
          'Controlled camera',
          `const [center, setCenter] = useState(TORONTO);
const [zoom, setZoom] = useState(10);

<GoogleMap center={center} zoom={zoom} mapId={GOOGLE_MAP_ID}>
  <MapAdvancedMarker position={center}>...</MapAdvancedMarker>
</GoogleMap>`
        ),
        render: ({ pushLog }) => <ControlledCameraExample pushLog={pushLog} />
      },
      {
        id: 'map-events',
        category: 'Test menu',
        title: 'Click events',
        description: 'Click the map to drop markers and log the clicked latitude and longitude.',
        code: codeExample(
          'Map click events',
          `<GoogleMap onClick={(event) => {
  const next = event.latLng?.toJSON();
  if (next) setMarkers((current) => [...current, next]);
}}>
  {markers.map((point) => (
    <MapAdvancedMarker key={point.id} position={point}>...</MapAdvancedMarker>
  ))}
</GoogleMap>`
        ),
        render: ({ pushLog }) => <MapClickExample pushLog={pushLog} />
      },
      {
        id: 'marker-info-window',
        category: 'Test menu',
        title: 'Markers and info windows',
        description: 'Use state-driven info windows with familiar marker click interactions.',
        code: codeExample(
          'Info window workflow',
          `<MapAdvancedMarker position={city.position} onClick={() => setActiveCity(city.id)}>
  <div className="marker-chip">{city.name}</div>
</MapAdvancedMarker>
<MapInfoWindow anchor={activeMarker} open={activeCity === city.id}>
  <strong>{city.name}</strong>
</MapInfoWindow>`
        ),
        render: ({ pushLog }) => <MarkerInfoWindowExample pushLog={pushLog} />
      },
      {
        id: 'advanced-markers',
        category: 'Test menu',
        title: 'Advanced markers',
        description: 'Render rich marker content without dropping down to imperative DOM management.',
        code: codeExample(
          'Advanced marker HTML',
          `<MapAdvancedMarker position={OTTAWA}>
  <div className="marker-chip">
    <strong>Ottawa</strong>
    <span>HTML content</span>
  </div>
</MapAdvancedMarker>`
        ),
        render: ({ pushLog }) => (
          <DemoSurface>
            <GoogleMap center={OTTAWA} zoom={6} mapId={DEFAULT_MAP_ID} height={420}>
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
        category: 'Test menu',
        title: 'Draggable markers',
        description: 'Track user drag interactions with a modern marker API.',
        code: codeExample(
          'Draggable marker',
          `<MapAdvancedMarker
  position={marker}
  gmpDraggable
  onDragEnd={(event) => setMarker(event.latLng!.toJSON())}
>
  <div className="marker-chip marker-chip--mini">Drag me</div>
</MapAdvancedMarker>`
        ),
        render: ({ pushLog }) => <DraggableMarkerExample pushLog={pushLog} />
      },
      {
        id: 'marker-clusterer',
        category: 'Test menu',
        title: 'Marker clustering',
        description: 'Cluster many points with the official Google Maps markerclusterer package.',
        code: codeExample(
          'Marker clusterer',
          `<MapMarkerClusterer>
  {points.map((point) => (
    <MapAdvancedMarker key={point.id} position={point}>...</MapAdvancedMarker>
  ))}
</MapMarkerClusterer>`
        ),
        render: ({ pushLog }) => (
          <DemoSurface>
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
        category: 'Advanced customization',
        title: 'Advanced markers + custom cluster HTML',
        description: 'Use advanced markers together with a custom cluster renderer so both individual pins and aggregated clusters can be fully branded.',
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
        render: ({ pushLog }) => (
          <CustomClusterHtmlExample pushLog={pushLog} />
        )
      },
      {
        id: 'geometry-shapes',
        category: 'Test menu',
        title: 'Polylines, polygons, rectangles, circles',
        description: 'Render the full geometry toolbox in one map so teams can validate path, area, bounds, and radius flows together.',
        code: codeExample(
          'Geometry toolbox',
          `<GoogleMap center={OTTAWA} zoom={6} height={420}>
  <MapPolyline path={[TORONTO, OTTAWA, MONTREAL]} />
  <MapPolygon paths={polygonPaths} />
  <MapRectangle bounds={bounds} />
  <MapCircle center={TORONTO} radius={12000} />
</GoogleMap>`
        ),
        render: ({ pushLog }) => <GeometryShapesExample pushLog={pushLog} />
      },
      {
        id: 'ground-overlay',
        category: 'Test menu',
        title: 'Ground overlays',
        description: 'Place an image overlay on top of a map area with a declarative component.',
        code: codeExample(
          'Ground overlay',
          `<MapGroundOverlay
  url="https://developers.google.com/maps/documentation/javascript/examples/full/images/talkeetna.png"
  bounds={overlayBounds}
/>`
        ),
        render: ({ pushLog }) => (
          <DemoSurface>
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
        category: 'Test menu',
        title: 'Traffic, transit, and bicycling layers',
        description: 'Toggle Google’s live transportation layers without leaving declarative React.',
        code: codeExample(
          'Transportation layers',
          `{showTraffic && <MapTrafficLayer />}
{showTransit && <MapTransitLayer />}
{showBicycling && <MapBicyclingLayer />}`
        ),
        render: ({ pushLog }) => <TransportLayersExample pushLog={pushLog} />
      },
      {
        id: 'kml-layer',
        category: 'Test menu',
        title: 'KML layers',
        description: 'Load a remote KML feed through the same React composition model.',
        code: codeExample(
          'KML layer',
          `<MapKmlLayer url="https://googlemaps.github.io/js-v2-samples/ggeoxml/cta.kml" />`
        ),
        render: ({ pushLog }) => (
          <DemoSurface>
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
        category: 'Test menu',
        title: 'Heatmaps',
        description: 'Render weighted heatmap data for density-based visualizations.',
        code: codeExample(
          'Heatmap',
          `<MapHeatmapLayer data={[
  { location: TORONTO, weight: 4 },
  { location: OTTAWA, weight: 2 }
]} />`
        ),
        render: ({ pushLog }) => (
          <DemoSurface>
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
        category: 'Test menu',
        title: 'Directions',
        description: 'Keep route requests declarative with a renderless service component and a visual renderer.',
        code: codeExample(
          'Directions workflow',
          `<MapDirectionsService request={request} onResult={({ result }) => setDirections(result)} />
<MapDirectionsRenderer directions={directions} />`
        ),
        render: ({ pushLog }) => <DirectionsExample pushLog={pushLog} />
      },
      {
        id: 'geocoder',
        category: 'Test menu',
        title: 'Geocoding',
        description: 'Use a React hook for address lookup and update the map with the geocoded result.',
        code: codeExample(
          'Geocoding hook',
          `const geocoder = useMapGeocoder();
const response = await geocoder?.geocode({ address: 'Toronto City Hall' });

<MapAdvancedMarker position={result.location}>...</MapAdvancedMarker>`
        ),
        render: ({ pushLog }) => <GeocoderExample pushLog={pushLog} />
      },
      {
        id: 'custom-control',
        category: 'Advanced customization',
        title: 'Custom map controls and fitBounds',
        description: 'Compose React controls inside the map UI and still expose the native map handle for advanced flows.',
        code: codeExample(
          'Custom control',
          `const mapRef = useRef<GoogleMapHandle>(null);
<MapControl position={google.maps.ControlPosition.TOP_CENTER}>
  <button onClick={() => mapRef.current?.fitBounds(bounds)}>Fit bounds</button>
</MapControl>`
        ),
        render: ({ pushLog }) => <CustomControlExample pushLog={pushLog} />
      }
    ],
    []
  );

  const selected = examples.find((example) => example.id === selectedId) || examples[0];
  const groupedExamples = groupExamples(examples);

  function openExample(example: ExampleDefinition) {
    setSelectedId(example.id);
    pushLog(`Selected example: ${example.title}.`);
  }

  return (
    <main className="shell">
      <section className="hero" id="overview">
        <div className="hero-card hero-main">
          <span className="badge">{reactLine} · GOOGLE MAPS · MARKERCLUSTERER</span>
          <h1>@stackline/react-google-maps</h1>
          <p>
            A React wrapper for the Google Maps JavaScript API with declarative
            maps, markers, advanced markers, info windows, shapes, services, layers, and official
            marker clustering support.
          </p>

          <div className="map-showcase hero-map-showcase">
            <div className="quickstart-demo">
              <WrapperNoKeyPreview
                exampleId="hero-showcase"
                title="Hero showcase browser preview"
              />
            </div>
          </div>

          <div className="feature-grid">
            <div className="feature">
              <strong>Advanced markers first</strong>
              Start with <code>MapAdvancedMarker</code>, HTML marker content, and a modern marker workflow from the first example.
            </div>
            <div className="feature">
              <strong>Official clustering</strong>
              Built around <code>@googlemaps/markerclusterer</code> instead of a custom clustering abstraction.
            </div>
            <div className="feature">
              <strong>Maps + services</strong>
              Shapes, overlays, layers, directions, and geocoding all sit in one package.
            </div>
            <div className="feature">
              <strong>Versioned React support</strong>
              Dedicated docs builds exist for React 17, 18, and 19 under the same maintained package line.
            </div>
          </div>

          <div className="cta-row">
            <a className="btn" href="#examples">Open live examples</a>
            <a className="btn secondary" href="https://github.com/alexandroit/react-google-maps#readme" target="_blank" rel="noreferrer">
              README
            </a>
          </div>
        </div>
      </section>

      <section className="setup-section">
        <article className="panel hero-setup" id="setup">
          <div className="panel-header">
            <h2>Setup in 3 steps</h2>
            <p>Install the package, wrap the app once, then render the map.</p>
          </div>

          <div className="step">
            <span className="step-num">1</span>
            <div>
              <strong>Install</strong>
              <CodeBlock title="Install command" code={INSTALL_CODE} compact />
            </div>
          </div>

          <div className="step">
            <span className="step-num">2</span>
            <div>
              <strong>Wrap the app once</strong>
              <CodeBlock title="Provider setup" code={PROVIDER_ONLY_CODE} compact />
            </div>
          </div>

          <div className="step">
            <span className="step-num">3</span>
            <div>
              <strong>Render the map</strong>
              <CodeBlock title="Basic map render" code={MAP_RENDER_CODE} compact />
            </div>
          </div>
        </article>
      </section>

      <section className="docs-layout">
        <aside className="docs-sidebar">
          <div className="panel docs-nav-panel">
            <h2>Test menu</h2>
            <p>Choose a scenario and the map on the right updates immediately.</p>
            <div className="docs-nav examples-nav">
              {groupedExamples.map((group) => (
                <section key={group.category} className="demo-group">
                  <h3>
                    {group.category}
                    <span className="demo-group-count">{group.items.length}</span>
                  </h3>
                  <div className="demo-list">
                    {group.items.map((example) => (
                      <button
                        key={example.id}
                        type="button"
                        className={`demo-link ${selected.id === example.id ? 'active' : ''}`}
                        onClick={() => openExample(example)}
                      >
                        {example.title}
                      </button>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </aside>

        <section className="layout">
          <div className="panels">
            <article className="panel example-workbench" id="examples">
              <div className="panel-header">
                <h2>Live examples</h2>
                <p>Pick an item in the menu and the map updates here.</p>
              </div>

              <div className="selected-example-panel">
                <div className="example-workbench__summary example-workbench__summary--single">
                  <div className="demo-stage-header">
                    <div className="demo-breadcrumb">
                      <span className="meta-pill">{selected.category}</span>
                      <span className="meta-pill light">{reactLine}</span>
                    </div>
                    <h3>{selected.title}</h3>
                    <p>{selected.description}</p>
                  </div>
                </div>

                <div className="example-workbench__map">
                  <WrapperNoKeyPreview
                    exampleId={selected.id}
                    title={`${selected.title} browser preview`}
                  />
                </div>

                <div className="demo-card demo-card--code">
                  <CodeBlock title={`${selected.title} example`} code={selected.code} soft />
                </div>
              </div>
            </article>

            <article className="panel quickstart-panel" id="quickstart">
            <div className="panel-header">
              <h2>Advanced marker quick start</h2>
              <p>
                Start with one provider, one map, and one advanced marker.
              </p>
            </div>

            <div className="showcase-stack">
              <div className="field-card field-card--code">
                <span>Copy this first</span>
                <CodeBlock title="Advanced marker quick start" code={CLASSIC_EXAMPLE_CODE} />
              </div>
            </div>
          </article>

          <article className="panel" id="loading">
            <div className="panel-header">
              <h2>Loading patterns</h2>
              <p>
                Use the provider for normal React apps, or reuse an existing script tag setup if your project already loads Google Maps globally.
              </p>
            </div>

            <div className="guide-grid guide-grid--two loading-patterns-grid">
              <label className="field-card">
                <span>Provider-first setup</span>
                <p>The provider is the simplest way to load the API, control libraries, and keep the map lifecycle inside React.</p>
                <CodeBlock title="Provider-first setup" code={PROVIDER_CODE} />
              </label>

              <div className="field-card">
                <span>Script tag compatible</span>
                <p>If your project already injects Google Maps in <code>index.html</code>, the provider reuses <code>window.google.maps</code>.</p>
                <CodeBlock title="index.html script loading" code={INDEX_HTML_CODE} />
              </div>
            </div>
          </article>

          <article className="panel" id="customization">
            <div className="panel-header">
              <h2>Customization patterns</h2>
              <p>
                Build branded markers, custom cluster visuals, and imperative controls on top of the same component model.
              </p>
            </div>

            <div className="guide-grid guide-grid--two">
              <div className="field-card">
                <span>Custom cluster renderer</span>
                <p>Use <code>createClusterRenderer()</code> to build branded cluster HTML while keeping the official Google clusterer API.</p>
                <CodeBlock title="Custom cluster renderer" code={CLUSTER_HELPER_CODE} />
              </div>

              <div className="field-card">
                <span>Imperative refs and handles</span>
                <p>Use refs when you need direct access to the underlying map and marker instances.</p>
                <CodeBlock title="Imperative refs and handles" code={REF_CODE} />
              </div>
            </div>
          </article>

          <article className="panel" id="api-reference">
            <div className="panel-header">
              <h2>API reference</h2>
              <p>Core components, layers, services, and hooks in one place.</p>
            </div>

            <div className="ref-grid">
              <div className="ref-card">
                <h4>Core components</h4>
                <div className="api-list">
                  <div className="api-item"><code>&lt;GoogleMapsProvider /&gt;</code><p>Loads the Google Maps JavaScript API and exposes readiness through context.</p></div>
                  <div className="api-item"><code>&lt;GoogleMap /&gt;</code><p>Creates the map with props like <code>center</code>, <code>zoom</code>, <code>mapId</code>, and <code>options</code>.</p></div>
                  <div className="api-item"><code>&lt;MapAdvancedMarker /&gt;</code><p>Renders <code>AdvancedMarkerElement</code> with React HTML content.</p></div>
                  <div className="api-item"><code>&lt;MapMarker /&gt;</code><p>Wraps the classic marker for legacy integrations.</p></div>
                  <div className="api-item"><code>&lt;MapInfoWindow /&gt;</code><p>Anchors React content to a marker or position.</p></div>
                  <div className="api-item"><code>&lt;MapMarkerClusterer /&gt;</code><p>Clusters markers with the official Google package.</p></div>
                  <div className="api-item"><code>createClusterRenderer()</code><p>Builds custom cluster HTML without replacing the official clusterer API.</p></div>
                </div>
              </div>

              <div className="ref-card">
                <h4>Overlays and layers</h4>
                <div className="api-list">
                  <div className="api-item"><code>&lt;MapPolyline /&gt;</code><p>Polyline paths.</p></div>
                  <div className="api-item"><code>&lt;MapPolygon /&gt;</code><p>Polygon areas.</p></div>
                  <div className="api-item"><code>&lt;MapRectangle /&gt;</code><p>Bounds rectangles.</p></div>
                  <div className="api-item"><code>&lt;MapCircle /&gt;</code><p>Radius overlays.</p></div>
                  <div className="api-item"><code>&lt;MapGroundOverlay /&gt;</code><p>Image overlays.</p></div>
                  <div className="api-item"><code>&lt;MapTrafficLayer /&gt;</code><p>Traffic layer.</p></div>
                  <div className="api-item"><code>&lt;MapTransitLayer /&gt;</code><p>Transit layer.</p></div>
                  <div className="api-item"><code>&lt;MapBicyclingLayer /&gt;</code><p>Bicycling layer.</p></div>
                  <div className="api-item"><code>&lt;MapKmlLayer /&gt;</code><p>KML feeds.</p></div>
                  <div className="api-item"><code>&lt;MapHeatmapLayer /&gt;</code><p>Heatmaps.</p></div>
                </div>
              </div>

              <div className="ref-card">
                <h4>Services and hooks</h4>
                <div className="api-list">
                  <div className="api-item"><code>&lt;MapDirectionsService /&gt;</code><p>Renderless directions requests.</p></div>
                  <div className="api-item"><code>&lt;MapDirectionsRenderer /&gt;</code><p>Visual route overlay.</p></div>
                  <div className="api-item"><code>useGoogleMap()</code><p>Returns the current native <code>google.maps.Map</code>.</p></div>
                  <div className="api-item"><code>useMapGeocoder()</code><p>Returns a memoized <code>google.maps.Geocoder</code>.</p></div>
                  <div className="api-item"><code>useDirectionsService()</code><p>Returns a memoized <code>google.maps.DirectionsService</code>.</p></div>
                  <div className="api-item"><code>&lt;MapControl /&gt;</code><p>Mounts React UI into native map control slots.</p></div>
                </div>
              </div>
            </div>
          </article>
        </div>

        <aside className="sidebar">
          <section className="panel log-panel">
            <div className="log-header">
              <div>
                <h2>Event Log</h2>
                <p>Selection changes and interaction events appear here.</p>
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
              <p>Published package and compatibility line.</p>
              <div className="api-row"><strong>Package line</strong><span>{packageVersion}</span></div>
              <div className="api-row"><strong>React line</strong><span>{reactVersion}</span></div>
              <div className="api-row"><strong>Clustering</strong><span>@googlemaps/markerclusterer</span></div>
              <div className="api-row"><strong>Includes</strong><span>advanced markers, layers, directions, geocoding</span></div>
            </div>
          </section>
        </aside>
        </section>
      </section>
    </main>
  );
}

function groupExamples(examples: ExampleDefinition[]) {
  const preferredOrder = ['Test menu', 'Advanced customization'];
  const discovered = Array.from(new Set(examples.map((example) => example.category)));
  const order = [
    ...preferredOrder.filter((category) => discovered.includes(category)),
    ...discovered.filter((category) => !preferredOrder.includes(category))
  ];
  return order.map((category) => ({
    category,
    items: examples.filter((example) => example.category === category)
  }));
}

function CodeBlock({
  title,
  code,
  soft = false,
  compact = false
}: {
  title: string;
  code: string;
  soft?: boolean;
  compact?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className={`code-block${soft ? ' code-block--soft' : ''}${compact ? ' code-block--compact' : ''}`}>
      <div className="code-block__header">
        <span className="code-block__title">{title}</span>
        <button className="code-block__copy" type="button" onClick={handleCopy}>
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className={`code-block__pre${soft ? ' code' : ''}`}>{code}</pre>
    </div>
  );
}

function WrapperNoKeyPreview({
  exampleId,
  title
}: {
  exampleId: string;
  title: string;
}) {
  return (
    <iframe
      className="browser-preview-frame"
      title={title}
      src={wrapperNoKeyPreviewPath(exampleId)}
      loading="lazy"
      referrerPolicy="no-referrer"
    />
  );
}

function HeroShowcasePreview({ pushLog }: { pushLog: (message: string) => void }) {
  const heroPoints = useMemo(() => CLUSTER_POINTS.slice(0, 18), []);

  return (
    <DemoSurface>
      <GoogleMap center={SAN_FRANCISCO} zoom={9} mapId={DEFAULT_MAP_ID} height={460}>
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

        <MapMarkerClusterer onClusterClick={() => pushLog('Hero showcase cluster clicked.')}>
          {heroPoints.map((point, index) => (
            <MapAdvancedMarker
              key={`hero-${point.lat}-${point.lng}-${index}`}
              position={point}
              title={`Hero marker ${index + 1}`}
              onClick={() => pushLog(`Hero showcase marker ${index + 1} clicked.`)}
            >
              <div className="marker-chip marker-chip--mini">
                <strong>{index + 1}</strong>
                <span>Spot</span>
              </div>
            </MapAdvancedMarker>
          ))}
        </MapMarkerClusterer>
      </GoogleMap>
    </DemoSurface>
  );
}

function DemoSurface({ children }: { children: ReactNode }) {
  return <GoogleMapsProvider>{children}</GoogleMapsProvider>;
}

function ControlledCameraExample({ pushLog }: ExampleContext) {
  const [center, setCenter] = useState(TORONTO);
  const [zoom, setZoom] = useState(10);

  function moveTo(nextCenter: typeof TORONTO, label: string) {
    setCenter(nextCenter);
    pushLog(`Moved camera to ${label}.`);
  }

  function updateZoom(delta: number) {
    setZoom((current) => {
      const nextZoom = Math.max(4, Math.min(current + delta, 15));
      pushLog(`Changed zoom to ${nextZoom}.`);
      return nextZoom;
    });
  }

  return (
    <DemoSurface>
      <div className="control-strip">
        <button type="button" onClick={() => moveTo(TORONTO, 'Toronto')}>Toronto</button>
        <button type="button" onClick={() => moveTo(MONTREAL, 'Montreal')}>Montreal</button>
        <button type="button" onClick={() => moveTo(OTTAWA, 'Ottawa')}>Ottawa</button>
        <button type="button" onClick={() => updateZoom(1)}>Zoom in</button>
        <button type="button" onClick={() => updateZoom(-1)}>Zoom out</button>
      </div>
      <GoogleMap center={center} zoom={zoom} height={420}>
        <MapMarker position={center} title="Controlled center" />
      </GoogleMap>
    </DemoSurface>
  );
}

function MapClickExample({ pushLog }: ExampleContext) {
  const [markers, setMarkers] = useState([TORONTO, OTTAWA]);

  return (
    <DemoSurface>
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

function MarkerInfoWindowExample({ pushLog }: ExampleContext) {
  const cities = [
    { id: 'toronto', name: 'Toronto', position: TORONTO, text: 'Ontario capital and a common migration example base.' },
    { id: 'ottawa', name: 'Ottawa', position: OTTAWA, text: 'Good midpoint for routing demos and government data.' },
    { id: 'montreal', name: 'Montreal', position: MONTREAL, text: 'Useful for bilingual and transit-heavy examples.' }
  ];
  const [active, setActive] = useState<string | null>('toronto');
  const markerRefs = useRef<Record<string, google.maps.Marker | null>>({});

  return (
    <DemoSurface>
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

function DraggableMarkerExample({ pushLog }: ExampleContext) {
  const [position, setPosition] = useState(TORONTO);

  return (
    <DemoSurface>
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

function GeometryShapesExample({ pushLog }: ExampleContext) {
  return (
    <DemoSurface>
      <GoogleMap center={OTTAWA} zoom={6} height={420}>
        <MapPolyline
          path={[TORONTO, OTTAWA, MONTREAL]}
          options={{ strokeColor: '#1f5ba7', strokeWeight: 4, geodesic: true }}
          onClick={() => pushLog('Polyline clicked.')}
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
          onClick={() => pushLog('Polygon clicked.')}
        />
        <MapRectangle
          bounds={{ north: 45.74, south: 45.26, east: -73.18, west: -75.96 }}
          options={{ strokeColor: '#b43f3f', fillColor: '#f4b7b7', fillOpacity: 0.12 }}
          onClick={() => pushLog('Rectangle clicked.')}
        />
        <MapCircle
          center={TORONTO}
          radius={12000}
          options={{ strokeColor: '#30a46c', fillColor: '#8ad7b0', fillOpacity: 0.14 }}
          onClick={() => pushLog('Circle clicked.')}
        />
        <MapMarker position={TORONTO} title="Toronto" />
        <MapMarker position={OTTAWA} title="Ottawa" />
        <MapMarker position={MONTREAL} title="Montreal" />
      </GoogleMap>
    </DemoSurface>
  );
}

function CustomClusterHtmlExample({ pushLog }: ExampleContext) {
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
    <DemoSurface>
      <GoogleMap center={SAN_FRANCISCO} zoom={8} mapId={DEFAULT_MAP_ID} height={420}>
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

function TransportLayersExample({ pushLog }: ExampleContext) {
  const [traffic, setTraffic] = useState(true);
  const [transit, setTransit] = useState(false);
  const [bicycling, setBicycling] = useState(false);

  return (
    <DemoSurface>
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

function DirectionsExample({ pushLog }: ExampleContext) {
  const [travelMode, setTravelMode] = useState<google.maps.TravelMode>('DRIVING' as google.maps.TravelMode);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);

  return (
    <DemoSurface>
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

function GeocoderExample({ pushLog }: ExampleContext) {
  return (
    <DemoSurface>
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

function CustomControlExample({ pushLog }: ExampleContext) {
  const mapRef = useRef<GoogleMapHandle>(null);
  const topCenter = ((window as any).google?.maps?.ControlPosition?.TOP_CENTER ?? 2) as google.maps.ControlPosition;
  const bounds = {
    north: 45.7,
    south: 43.4,
    east: -72.8,
    west: -79.8
  };

  return (
    <DemoSurface>
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
