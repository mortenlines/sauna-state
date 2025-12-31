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
  const expiresAt = Date.now() + TOKEN_EXPIRY
  
  if (kv) {
    try {
      // Store token in KV with expiration
      await kv.set(`auth:token:${token}`, expiresAt, { ex: Math.floor(TOKEN_EXPIRY / 1000) })
    } catch (error) {
      console.error('Error storing token in KV:', error)
      // Continue anyway - token will be validated but won't persist
    }
  }
}

async function verifyToken(token: string): Promise<boolean> {
  const kv = getKv()
  
  if (kv) {
    try {
      const expiresAt = await kv.get<number>(`auth:token:${token}`)
      if (expiresAt && expiresAt > Date.now()) {
        return true
      }
      return false
    } catch (error) {
      console.error('Error verifying token:', error)
      return false
    }
  }
  
  // Fallback: if KV not available, we can't verify tokens (local dev)
  // In production, KV should always be available
  return false
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
        
        // Store token
        await storeToken(token)
        
        res.status(200).json({ token, expiresIn: TOKEN_EXPIRY })
        return
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

