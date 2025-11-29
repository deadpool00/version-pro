import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// ⬇️ usa el CSS donde tienes todas las clases (.landing-*, .hero-*, etc.)
import './styles.css';   // <–– usa styles.css si ahí está tu diseño
// import './index.css';  // si este está vacío, lo puedes quitar
const rootElement = document.getElementById('root') as HTMLElement;
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
