
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

console.log("🚀 AhorroDuo: Cargando versión estable...");

const startApp = () => {
  const rootElement = document.getElementById('root');
  const loader = document.getElementById('initial-loader');

  if (rootElement) {
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    if (loader) loader.style.display = 'none';
    rootElement.style.display = 'block';
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}
