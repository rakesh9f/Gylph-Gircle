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
// THIS UNREGISTERS ALL SERVICE WORKERS TO FIX CACHING ISSUES
if ('serviceWorker' in navigator) {
  try {
    navigator.serviceWorker.getRegistrations()
      .then(registrations => {
        registrations.forEach(registration => {
          console.log('💀 Killing Service Worker:', registration);
          registration.unregister().catch(err => console.warn('Unregister failed', err));
        });
      })
      .catch(error => {
        console.warn('Failed to get ServiceWorker registrations:', error);
      });
  } catch (e) {
    console.warn('ServiceWorker API access error:', e);
  }

  // Clear caches
  if ('caches' in window) {
    try {
      caches.keys().then(names => {
        for (let name of names) {
            console.log('🧹 Clearing Cache:', name);
            caches.delete(name).catch(e => console.warn('Cache delete failed', e));
        }
      }).catch(e => console.warn('Cache keys failed', e));
    } catch(e) {
      console.warn('Cache API error:', e);
    }
  }
}

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