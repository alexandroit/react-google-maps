import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleMap, GoogleMapsProvider, MapMarker, useGoogleMapsApi } from '@revivejs/react-google-maps';
import './wrapper-no-key.css';

const NEW_YORK = { lat: 40.7128, lng: -74.006 };

function WrapperNoKeyStatus() {
  const { status, error } = useGoogleMapsApi();

  return (
    <div className="wrapper-preview-status">
      <span className="wrapper-preview-pill">wrapper no-key mode</span>
      <strong>Status: {status}</strong>
      <p>
        This page uses <code>GoogleMapsProvider</code> without an API key and keeps the setup intentionally minimal:
        one map, one marker, no extra libraries, no map ID.
      </p>
      {error ? <p className="wrapper-preview-error">Error: {error.message}</p> : null}
    </div>
  );
}

function WrapperNoKeyApp() {
  return (
    <GoogleMapsProvider>
      <main className="wrapper-preview-shell">
        <WrapperNoKeyStatus />
        <div className="wrapper-preview-map-card">
          <GoogleMap center={NEW_YORK} zoom={11} height={420}>
            <MapMarker position={NEW_YORK} title="New York City" />
          </GoogleMap>
        </div>
        <div className="wrapper-preview-note">
          <strong>Why this page exists</strong>
          <p>
            It isolates the raw no-key behavior of the wrapper from the main docs app. That makes it much easier to verify
            whether the library itself is behaving correctly without causing the whole docs page to blink.
          </p>
        </div>
      </main>
    </GoogleMapsProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WrapperNoKeyApp />
  </React.StrictMode>
);
