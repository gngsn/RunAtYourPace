import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global handler for Google Maps auth/activation/quota events so unactivated keys never crash the app
(window as unknown as Record<string, unknown>).gm_authFailure = () => {
  window.dispatchEvent(new CustomEvent('gmp-map-auth-error'));
};

const origConsoleError = console.error;
console.error = (...args: unknown[]) => {
  const msg = args.map((a) => String(a)).join(' ');
  if (
    msg.includes('ApiNotActivatedMapError') ||
    msg.includes('InvalidKeyMapError') ||
    msg.includes('RefererNotAllowedMapError')
  ) {
    window.dispatchEvent(new CustomEvent('gmp-map-auth-error'));
    return;
  }
  origConsoleError.apply(console, args);
};

createRoot(document.getElementById('root')!).render(<App />);
