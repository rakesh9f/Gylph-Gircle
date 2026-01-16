
import React from 'react';
import ReactDOM from 'react-dom/client';
// @ts-ignore
import { HashRouter } from 'react-router-dom';
import App from './App';
import './App.css';
import { PaymentProvider } from './context/PaymentContext';
import { LanguageProvider } from './context/LanguageContext';
import { DbProvider } from './context/DbContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// --- SECURITY: RUNTIME OBFUSCATION HOOKS ---
// 1. Disable Context Menu
document.addEventListener('contextmenu', (e) => e.preventDefault());

// 2. Disable DevTools Shortcuts (F12, Ctrl+Shift+I)
document.addEventListener('keydown', (e) => {
  if (
    e.key === 'F12' || 
    (e.ctrlKey && e.shiftKey && e.key === 'I') || 
    (e.ctrlKey && e.shiftKey && e.key === 'J') || 
    (e.ctrlKey && e.key === 'U')
  ) {
    e.preventDefault();
  }
});

// 3. PWA SERVICE WORKER KILL SWITCH
// Safely wrapped to prevent "Invalid State" errors
const killServiceWorkers = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        console.log('💀 Killing Service Worker:', registration);
        await registration.unregister();
      }
    } catch (e) {
      console.warn('ServiceWorker API warning:', e);
    }
  }

  // Clear caches
  if ('caches' in window) {
    try {
      const keys = await caches.keys();
      for (const key of keys) {
        console.log('🧹 Clearing Cache:', key);
        await caches.delete(key);
      }
    } catch(e) {
      console.warn('Cache API warning:', e);
    }
  }
};

// Execute kill switch safely after window load to avoid document state errors
window.addEventListener('load', () => {
  setTimeout(killServiceWorkers, 1000);
});

// 4. Clear Console (Poor man's obfuscation)
setInterval(() => {
  if (process.env.NODE_ENV === 'production') {
    // console.clear(); // Uncomment for aggressive clearing
  }
}, 2000);

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <HashRouter>
      <LanguageProvider>
        <ThemeProvider>
          <DbProvider>
            <AuthProvider>
              <PaymentProvider>
                <App />
              </PaymentProvider>
            </AuthProvider>
          </DbProvider>
        </ThemeProvider>
      </LanguageProvider>
    </HashRouter>
  </React.StrictMode>
);
