import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

type SaunaStatus = 'yes' | 'no'

interface StatusContextType {
  status: SaunaStatus
  setStatus: (status: SaunaStatus) => void
  toggleStatus: () => void
  isLoading: boolean
}

const StatusContext = createContext<StatusContextType | undefined>(undefined)

// API endpoint for Vercel
const API_URL = (import.meta as any).env?.VITE_API_URL || '/api/status'

export function StatusProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatusState] = useState<SaunaStatus>('no')
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)

  // Fetch status from API
  const fetchStatus = useCallback(async (skipIfUpdating = true) => {
    // Don't fetch if we're currently updating (to avoid race conditions)
    if (skipIfUpdating && isUpdating) {
      return
    }

    try {
      const response = await fetch(API_URL)
      if (response.ok) {
        const data = await response.json()
        if (data.status === 'yes' || data.status === 'no') {
          // Only update if status actually changed (avoid unnecessary re-renders)
          setStatusState((currentStatus) => {
            if (currentStatus !== data.status) {
              console.log('Status updated from API:', data.status)
              return data.status
            }
            return currentStatus
          })
        }
      } else if (response.status === 404) {
        // API not available (local dev) - this is OK, keep current state
        console.log('API endpoint not found (normal in local dev)')
      } else {
        console.warn('Failed to fetch status:', response.status, response.statusText)
        // Don't change state if API fails - keep current state
      }
    } catch (error) {
      // Network error or CORS - might be local dev
      console.log('Failed to fetch status (might be local dev):', error)
      // Don't change state if API fails - keep current state
    } finally {
      setIsLoading(false)
    }
  }, [isUpdating])

  useEffect(() => {
    // Load status from API on mount
    fetchStatus(false)

    // Poll for status updates every 30 seconds to keep all users in sync
    // But only if we're not currently updating
    const interval = setInterval(() => {
      if (!isUpdating) {
        fetchStatus(true)
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [fetchStatus, isUpdating])

  const setStatus = async (newStatus: SaunaStatus) => {
    // Prevent multiple simultaneous updates
    if (isUpdating) {
      return
    }

    setIsUpdating(true)
    
    // Optimistically update local state
    setStatusState(newStatus)
    
    try {
      // Get auth token
      const token = localStorage.getItem('sauna_auth_token')
      if (!token) {
        console.error('Not authenticated')
        setIsUpdating(false)
        return
      }

      // Save to API
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        // If API call fails, revert to previous state
        console.error('Failed to update status:', response.status, response.statusText)
        // For 404, the API might not be available (local dev)
        if (response.status === 404) {
          console.warn('API endpoint not found. This is normal in local development. Status will persist in this session only.')
          // Keep the optimistic update for local dev
        } else {
          // For other errors, re-fetch to get correct state
          setTimeout(() => {
            fetchStatus(false)
          }, 500)
        }
      } else {
        // Success - confirm the update worked
        const data = await response.json()
        if (data.status === newStatus) {
          console.log('Status updated successfully:', newStatus)
        } else {
          console.warn('Status mismatch. Expected:', newStatus, 'Got:', data.status)
          setStatusState(data.status)
        }
      }
    } catch (error) {
      console.error('Failed to update status:', error)
      // Re-fetch to get correct state after a short delay
      setTimeout(() => {
        fetchStatus(false)
      }, 500)
    } finally {
      // Allow polling to resume after a short delay
      setTimeout(() => {
        setIsUpdating(false)
      }, 1000)
    }
    
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
    <StatusContext.Provider value={{ status, setStatus, toggleStatus, isLoading }}>
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

