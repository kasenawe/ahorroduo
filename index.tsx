
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
const loader = document.getElementById('initial-loader');

if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  
  // Ocultar loader tras el primer renderizado
  if (loader) {
    setTimeout(() => {
      loader.style.display = 'none';
      rootElement.style.display = 'block';
    }, 100);
  }
}
