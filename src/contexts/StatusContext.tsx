import React, { createContext, useContext, useState, useEffect } from 'react'

type SaunaStatus = 'yes' | 'no'

interface StatusContextType {
  status: SaunaStatus
  setStatus: (status: SaunaStatus) => void
  toggleStatus: () => void
}

const StatusContext = createContext<StatusContextType | undefined>(undefined)

export function StatusProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatusState] = useState<SaunaStatus>('no')

  useEffect(() => {
    // Load status from localStorage
    const savedStatus = localStorage.getItem('sauna_status') as SaunaStatus
    if (savedStatus === 'yes' || savedStatus === 'no') {
      setStatusState(savedStatus)
    }
  }, [])

  const setStatus = (newStatus: SaunaStatus) => {
    setStatusState(newStatus)
    localStorage.setItem('sauna_status', newStatus)
    
    // Trigger push notification if permission is granted
    if ('Notification' in window && Notification.permission === 'granted') {
      const showNotification = () => {
        const notificationOptions = {
          body: `Badstua e no ${newStatus === 'yes' ? 'tent opp🔥, og e klar om ca. 30 minutt⏱️' : 'sløkt!🌙'}`,
          icon: '/sauna-tent-' + newStatus + '.png',
          badge: '/sauna-tent-' + newStatus + '.png',
          tag: 'sauna-status',
          requireInteraction: false,
        }

        // Try to use service worker first, fallback to direct Notification API
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.ready
            .then((registration) => {
              console.log('Service Worker ready, showing notification via SW')
              return registration.showNotification('Badstu oppdatering!', notificationOptions)
            })
            .catch((error) => {
              console.warn('Service Worker notification failed, using fallback:', error)
              // Fallback to direct Notification API
              new Notification('Badstu oppdatering!', notificationOptions)
            })
        } else {
          // No service worker, use direct Notification API
          console.log('No service worker, using direct Notification API')
          new Notification('Badstu oppdatering!', notificationOptions)
        }
      }

      // Small delay to ensure state is updated
      setTimeout(showNotification, 100)
    } else {
      console.log('Notification permission not granted:', Notification.permission)
    }
  }

  const toggleStatus = () => {
    setStatus(status === 'yes' ? 'no' : 'yes')
  }

  return (
    <StatusContext.Provider value={{ status, setStatus, toggleStatus }}>
      {children}
    </StatusContext.Provider>
  )
}

export function useStatus() {
  const context = useContext(StatusContext)
  if (context === undefined) {
    throw new Error('useStatus must be used within a StatusProvider')
  }
  return context
}

