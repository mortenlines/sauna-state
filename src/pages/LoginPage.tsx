import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (login(password)) {
      navigate('/')
    } else {
      setError('Feil passord')
    }
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 md:p-12 w-full max-w-md">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">
            Adminpanel
          </h1>
          
          <div className="bg-green-500/20 border border-green-500/50 text-green-200 px-4 py-3 rounded-lg mb-6">
            ✓ Du er innlogget
          </div>

          <button
            onClick={() => {
              logout()
              navigate('/')
            }}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 mb-4"
          >
            Logg ut
          </button>

          <button
            onClick={() => navigate('/')}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Tilbake til status
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 md:p-12 w-full max-w-md">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">
          Admin-innlogging
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-white mb-2 font-medium">
              Passord
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Skriv inn passord"
              autoFocus
            />
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Logg inn
          </button>
        </form>

        <button
          onClick={() => navigate('/')}
          className="mt-6 w-full text-white/70 hover:text-white text-center transition-colors duration-200"
        >
          ← Tilbake til status
        </button>
      </div>
    </div>
  )
}

