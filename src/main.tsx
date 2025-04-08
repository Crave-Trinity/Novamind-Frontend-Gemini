import React from 'react';
import ReactDOM from 'react-dom/client';
// Removed R3F extend imports as they caused type errors and might be handled implicitly
// import { extend } from '@react-three/fiber';
// import * as THREE from 'three';

import App from '@presentation/App.tsx'; // Use default import and correct path
import { ThemeProvider } from './application/providers/ThemeProvider';
import '@styles/index.css'; // Correct alias

// Removed extend(THREE) call

// Add error handler for uncaught errors
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
});

// Add promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Ensure the root element exists before rendering (prevents errors in test environments)
const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </React.StrictMode>
  );
} else {
  // Optional: Log a warning if the root element is not found,
  // which might indicate an issue in the HTML or test setup.
  console.warn('Root element with ID "root" not found. React app not rendered.');
}
