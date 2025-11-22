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
      const notificationOptions = {
        body: `Badstua e ${newStatus === 'yes' ? 'tent opp🔥, og klar om ca. 30 minutt⏱️' : 'sløkt!🌙'}`,
        icon: '/sauna-tent-' + newStatus + '.png',
        badge: '/sauna-tent-' + newStatus + '.png',
        tag: 'sauna-status',
        requireInteraction: false,
      }

      // Try to show notification via service worker first (required for iOS Safari)
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready
          .then((registration) => {
            // Use service worker notification (works on all browsers including iOS)
            return registration.showNotification('Badstu oppdatering!', notificationOptions)
          })
          .catch((error) => {
            console.error('Service Worker notification failed:', error)
            // Fallback to direct notification for browsers that support it
            if ('Notification' in window && Notification.permission === 'granted') {
              try {
                new Notification('Badstu oppdatering!', notificationOptions)
              } catch (fallbackError) {
                console.error('Direct notification also failed:', fallbackError)
              }
            }
          })
      } else {
        // No service worker support, use direct Notification API
        try {
          new Notification('Badstu oppdatering!', notificationOptions)
        } catch (error) {
          console.error('Direct notification failed:', error)
        }
      }
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

