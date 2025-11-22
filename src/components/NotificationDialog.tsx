import { useState, useEffect } from 'react'
import { useStatus } from '../contexts/StatusContext'

interface NotificationDialogProps {
  onClose: () => void
}

export default function NotificationDialog({ onClose }: NotificationDialogProps) {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const { status } = useStatus()

  useEffect(() => {
    // Check if browser supports notifications
    if ('Notification' in window && 'serviceWorker' in navigator) {
      setIsSupported(true)
      
      // Check if already subscribed
      if (Notification.permission === 'granted') {
        setIsSubscribed(true)
      }
    }
  }, [])

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('Denne nettleseren støtter ikke varsler')
      return
    }

    if (Notification.permission === 'granted') {
      setIsSubscribed(true)
      return
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        setIsSubscribed(true)
        
        // Register service worker for push notifications
        if ('serviceWorker' in navigator) {
          try {
            const registration = await navigator.serviceWorker.register('/sw.js')
            console.log('Service Worker registered:', registration)
          } catch (error) {
            console.error('Service Worker registration failed:', error)
          }
        }
      }
    }
  }

  if (!isSupported) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4">Varsler støttes ikke</h2>
          <p className="text-gray-600 mb-6">
            Nettleseren din støtter ikke push-varsler.
          </p>
          <button
            onClick={onClose}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Lukk
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Push-varsler</h2>
        
        {isSubscribed ? (
          <>
            <p className="text-gray-600 mb-6">
              Du abonnér no på badstua! Du vil motta varsler når den fyres opp eller slukkes.
            </p>
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6">
              ✓ Varsler aktivert
            </div>
          </>
        ) : (
          <>
            <p className="text-gray-600 mb-6">
              Få varsel når badstua fyres opp?
            </p>
            <button
              onClick={requestNotificationPermission}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 mb-4"
            >
              Aktiver varsler
            </button>
          </>
        )}

        <button
          onClick={onClose}
          className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg transition-colors duration-200"
        >
          Close
        </button>
      </div>
    </div>
  )
}

