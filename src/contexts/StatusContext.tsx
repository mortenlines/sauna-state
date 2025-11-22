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
      const showNotification = async () => {
        const notificationOptions = {
          body: `Badstua e no ${newStatus === 'yes' ? 'tent opp🔥, og e klar om ca. 30 minutt⏱️' : 'sløkt!🌙'}`,
          icon: '/sauna-tent-' + newStatus + '.png',
          badge: '/sauna-tent-' + newStatus + '.png',
          tag: 'sauna-status',
          requireInteraction: false,
        }

        // iOS Safari requires Service Worker for notifications
        if ('serviceWorker' in navigator) {
          try {
            // Wait for service worker to be ready
            const registration = await navigator.serviceWorker.ready
            
            // Check if service worker is controlling the page (important for iOS)
            if (navigator.serviceWorker.controller) {
              console.log('Service Worker is controlling, showing notification via SW')
              await registration.showNotification('Badstu oppdatering!', notificationOptions)
            } else {
              // Service worker not controlling yet, try to send message to activate it
              console.log('Service Worker not controlling, attempting to activate...')
              
              // Try to get registration and activate
              const reg = await navigator.serviceWorker.getRegistration()
              if (reg) {
                // Send message to service worker to activate
                if (reg.active) {
                  reg.active.postMessage({ type: 'ACTIVATE' })
                }
                // Wait a bit and try again
                await new Promise(resolve => setTimeout(resolve, 500))
                await registration.showNotification('Badstu oppdatering!', notificationOptions)
              } else {
                // Fallback: try direct notification (may not work on iOS)
                console.warn('No service worker registration, trying direct notification')
                new Notification('Badstu oppdatering!', notificationOptions)
              }
            }
          } catch (error) {
            console.error('Service Worker notification failed:', error)
            // Fallback: try direct notification (may not work on iOS Safari)
            try {
              new Notification('Badstu oppdatering!', notificationOptions)
            } catch (fallbackError) {
              console.error('Direct notification also failed:', fallbackError)
            }
          }
        } else {
          // No service worker support
          console.log('No service worker support, using direct Notification API')
          try {
            new Notification('Badstu oppdatering!', notificationOptions)
          } catch (error) {
            console.error('Direct notification failed:', error)
          }
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

