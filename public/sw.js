// Service Worker for push notifications
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...')
  // Skip waiting to activate immediately
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...')
  event.waitUntil(
    Promise.all([
      // Take control of all clients immediately
      self.clients.claim(),
    ])
  )
})

self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked')
  event.notification.close()
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i]
        if (client.url === '/' && 'focus' in client) {
          return client.focus()
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow('/')
      }
    })
  )
})

// Listen for messages from the main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data)
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  if (event.data && event.data.type === 'ACTIVATE') {
    self.skipWaiting()
    clients.claim()
  }
})

