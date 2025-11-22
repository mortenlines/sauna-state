import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStatus } from '../contexts/StatusContext'
import { useAuth } from '../contexts/AuthContext'
import { StatusProvider } from '../contexts/StatusContext'
import NotificationDialog from '../components/NotificationDialog'
import StatusToggle from '../components/StatusToggle'

function StatusPageContent() {
  const { status } = useStatus()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [showNotificationDialog, setShowNotificationDialog] = useState(false)

  const statusText = status === 'yes' ? 'Ja!!' : 'Nei...'
  const statusImage = status === 'yes' ? '/sauna-tent-yes.png' : '/sauna-tent-no.png'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-4">
      {/* Header with icons */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
        <button
          onClick={() => setShowNotificationDialog(true)}
          className="p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-all duration-200 text-white"
          aria-label="Abonner på varsler"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 md:h-8 md:w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        </button>

        <button
          onClick={() => navigate('/login')}
          className="p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-all duration-200 text-white"
          aria-label={isAuthenticated ? "Admin" : "Logg inn"}
          title={isAuthenticated ? "Admin" : "Logg inn"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 md:h-8 md:w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </button>
      </div>

      {/* Main content */}
      <div className="flex flex-col items-center justify-center space-y-8 md:space-y-12 max-w-7xl w-full">
        {/* Headline */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white text-center">
          E det fyr i badstua?🔥
        </h1>

        {/* Status text with animation */}
        <div className="text-center">
          {status === 'yes' ? (
            <h2 className="text-5xl md:text-7xl lg:text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 animate-pulse">
              {statusText}
            </h2>
          ) : (
            <h2 className="text-5xl md:text-7xl lg:text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600">
              {statusText}
            </h2>
          )}
        </div>

        {/* Image */}
        <div className="flex justify-center items-center">
          <img
            src={statusImage}
            alt={`Badstutelt ${status === 'yes' ? 'ja' : 'nei'}`}
            className="max-w-full h-auto max-h-[50vh] md:max-h-[70vh] object-contain rounded-lg shadow-2xl"
          />
        </div>

        {/* Status toggle (only visible when authenticated) */}
        {isAuthenticated && <StatusToggle />}
      </div>

      {/* Notification Dialog */}
      {showNotificationDialog && (
        <NotificationDialog onClose={() => setShowNotificationDialog(false)} />
      )}
    </div>
  )
}

export default function StatusPage() {
  return (
    <StatusProvider>
      <StatusPageContent />
    </StatusProvider>
  )
}

