import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Register service worker for push notifications
if ('serviceWorker' in navigator) {
  // Register immediately, don't wait for load (better for iOS)
  navigator.serviceWorker.register('/sw.js', { scope: '/' })
    .then((registration) => {
      console.log('Service Worker registered:', registration)
      
      // Ensure the service worker is activated immediately
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      }
      
      // If service worker is installing, wait for it to activate
      if (registration.installing) {
        registration.installing.addEventListener('statechange', () => {
          if (registration.installing?.state === 'activated') {
            console.log('Service Worker activated')
            // Force it to take control
            registration.update()
          }
        })
      }
      
      // Check if update is available
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('New service worker installed')
            }
          })
        }
      })
      
      // Periodically check if service worker is controlling (important for iOS)
      const checkController = () => {
        if (!navigator.serviceWorker.controller && registration.active) {
          console.log('Service Worker active but not controlling, attempting to claim...')
          // Try to reload to get service worker to take control
          // But only do this once to avoid infinite reload
          if (!window.sessionStorage.getItem('sw-reload-attempted')) {
            window.sessionStorage.setItem('sw-reload-attempted', 'true')
            // Don't auto-reload, just log - user can manually refresh if needed
            console.log('Service Worker may need a page refresh to take control')
          }
        }
      }
      
      // Check after a delay
      setTimeout(checkController, 2000)
    })
    .catch((error) => {
      console.error('Service Worker registration failed:', error)
    })
  
  // Listen for controller change (when service worker takes control)
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('Service Worker is now controlling the page')
    // Clear the reload flag when controller changes
    window.sessionStorage.removeItem('sw-reload-attempted')
  })
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

