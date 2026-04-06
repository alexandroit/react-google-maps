import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './app.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found.');
}

createRoot(rootElement).render(
  <React.StrictMode>
    <App reactLine="React 18" reactVersion="18.3.1" docsPath="react-18" packageVersion="18.0.0" />
  </React.StrictMode>
);
