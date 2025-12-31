import React, { createContext, useContext, useState, useEffect } from 'react'

interface AuthContextType {
  isAuthenticated: boolean
  login: (password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API_URL = (import.meta as any).env?.VITE_API_URL || ''

async function verifyToken(token: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/api/auth/verify`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    return response.ok
  } catch (error) {
    console.error('Error verifying token:', error)
    return false
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check if user is already logged in with a valid token
    const token = localStorage.getItem('sauna_auth_token')
    if (token) {
      // Verify token is still valid
      verifyToken(token).then((isValid) => {
        if (isValid) {
          setIsAuthenticated(true)
        } else {
          // Token expired or invalid, remove it
          localStorage.removeItem('sauna_auth_token')
        }
      })
    }
  }, [])

  const login = async (password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      })

      if (response.ok) {
        const data = await response.json()
        const token = data.token
        
        // Store token
        localStorage.setItem('sauna_auth_token', token)
        setIsAuthenticated(true)
        return true
      } else {
        return false
      }
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const logout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem('sauna_auth_token')
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

