import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getKv, KV_KEYS } from '../kv.js'
import crypto from 'crypto'

// Get password from environment variable (fallback for local dev)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'sauna2026'

// Token expiration time (24 hours)
const TOKEN_EXPIRY = 24 * 60 * 60 * 1000

interface TokenData {
  token: string
  expiresAt: number
}

async function storeToken(token: string): Promise<void> {
  const kv = getKv()
  
  if (kv) {
    try {
      // Store token in KV with expiration (just store "1" as value, rely on KV TTL)
      const ttlSeconds = Math.floor(TOKEN_EXPIRY / 1000)
      await kv.set(`auth:token:${token}`, '1', { ex: ttlSeconds })
      console.log(`Token stored with TTL: ${ttlSeconds} seconds`)
    } catch (error) {
      console.error('Error storing token in KV:', error)
      throw error // Don't continue if we can't store the token
    }
  } else {
    console.warn('KV not available - token will not persist')
  }
}

async function verifyToken(token: string): Promise<boolean> {
  const kv = getKv()
  
  if (!kv) {
    console.warn('KV not available - cannot verify token')
    return false
  }
  
  try {
    const value = await kv.get<string>(`auth:token:${token}`)
    if (value === '1') {
      console.log('Token verified successfully')
      return true
    }
    console.log(`Token not found or invalid. Value: ${value}`)
    return false
  } catch (error) {
    console.error('Error verifying token:', error)
    return false
  }
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method === 'POST') {
    try {
      const { password } = req.body

      if (!password) {
        res.status(400).json({ error: 'Password is required' })
        return
      }

      // Compare password (simple string comparison)
      if (password === ADMIN_PASSWORD) {
        // Generate a secure token
        const token = crypto.randomBytes(32).toString('hex')
        
        try {
          // Store token
          await storeToken(token)
          console.log('Token generated and stored successfully')
          res.status(200).json({ token, expiresIn: TOKEN_EXPIRY })
          return
        } catch (error) {
          console.error('Failed to store token:', error)
          // Still return the token even if storage fails (for local dev)
          // In production, this should not happen if KV is configured
          res.status(200).json({ token, expiresIn: TOKEN_EXPIRY, warning: 'Token storage may have failed' })
          return
        }
      } else {
        res.status(401).json({ error: 'Invalid password' })
        return
      }
    } catch (error) {
      console.error('Error during login:', error)
      res.status(500).json({ error: 'Login failed' })
      return
    }
  }

  res.status(405).json({ error: 'Method not allowed' })
}

// Export verify function for use in other API routes
export { verifyToken }

