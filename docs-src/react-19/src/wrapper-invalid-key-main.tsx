import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleMap, GoogleMapsProvider, MapMarker, useGoogleMapsApi } from '@stackline/react-google-maps';
import './wrapper-no-key.css';

const NEW_YORK = { lat: 40.7128, lng: -74.006 };
const INVALID_KEY = 'InladKey';

function WrapperInvalidKeyStatus() {
  const { status, error } = useGoogleMapsApi();

  return (
    <div className="wrapper-preview-status">
      <span className="wrapper-preview-pill">wrapper invalid-key mode</span>
      <strong>Status: {status}</strong>
      <p>
        This page uses <code>GoogleMapsProvider</code> with an intentionally invalid API key:
        <code> {INVALID_KEY}</code>.
      </p>
      {error ? <p className="wrapper-preview-error">Error: {error.message}</p> : null}
    </div>
  );
}

function WrapperInvalidKeyApp() {
  return (
    <GoogleMapsProvider apiKey={INVALID_KEY}>
      <main className="wrapper-preview-shell">
        <WrapperInvalidKeyStatus />
        <div className="wrapper-preview-map-card">
          <GoogleMap center={NEW_YORK} zoom={11} height={420}>
            <MapMarker position={NEW_YORK} title="New York City" />
          </GoogleMap>
        </div>
        <div className="wrapper-preview-note">
          <strong>Why this page exists</strong>
          <p>
            It isolates the wrapper behavior when a syntactically present but invalid API key is provided, so we can
            compare it with the no-key behavior and with the raw Google Maps script.
          </p>
        </div>
      </main>
    </GoogleMapsProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WrapperInvalidKeyApp />
  </React.StrictMode>
);
