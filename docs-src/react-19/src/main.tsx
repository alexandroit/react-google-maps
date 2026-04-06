import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './app.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App reactLine="React 19" reactVersion="19.2.4" docsPath="react-19" packageVersion="19.0.1" />
  </React.StrictMode>
);
