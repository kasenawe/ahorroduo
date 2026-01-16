
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

console.log("🚀 AhorroDuo: Iniciando sistema...");

const startApp = () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error("❌ AhorroDuo: No se encontró el elemento #root");
    return;
  }

  try {
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("✅ AhorroDuo: Renderizado completado");
  } catch (error) {
    console.error("❌ AhorroDuo: Error crítico en renderizado:", error);
    const errorDisplay = document.getElementById('error-display');
    const errorMessage = document.getElementById('error-message');
    if (errorDisplay && errorMessage) {
      errorDisplay.style.display = 'block';
      errorMessage.textContent = error instanceof Error ? error.message : String(error);
    }
  }
};

// Asegurar que el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}
