import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './shared/i18n/config';
import { registerSW } from 'virtual:pwa-register';
import App from './app/App.tsx';
import { resolveHomeRedirect } from './shared/i18n';
import './index.css';

registerSW({ immediate: true });

// Antes do primeiro render: a home já abre no idioma da pessoa, sem piscar em português nem criar
// entrada no histórico (decisão D10).
const homeRedirect = resolveHomeRedirect(
  window.location.pathname,
  window.location.search,
  navigator.userAgent
);
if (homeRedirect) {
  window.history.replaceState(window.history.state, '', homeRedirect);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
