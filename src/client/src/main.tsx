import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App.js';
import { AccessibilityProvider } from './context/AccessibilityContext.js';
import './index.css';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <AccessibilityProvider>
        <App />
      </AccessibilityProvider>
    </React.StrictMode>
  );
}
