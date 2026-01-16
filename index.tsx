import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

console.log("🚀 AhorroDuo: Cargando versión estable...");

const rootElement = document.getElementById('root');
const loader = document.getElementById('initial-loader');

if (rootElement) {
  try {
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    
    // Ocultar el cargador una vez React toma el control
    if (loader) loader.style.display = 'none';
    rootElement.style.display = 'block';
  } catch (error) {
    console.error("Error fatal durante el renderizado:", error);
  }
}