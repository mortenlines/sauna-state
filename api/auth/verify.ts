import type { VercelRequest, VercelResponse } from '@vercel/node'
import { verifyToken } from './login.js'

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method === 'GET' || req.method === 'POST') {
    try {
      // Get token from Authorization header or body
      const authHeader = req.headers.authorization
      const token = authHeader?.replace('Bearer ', '') || req.body?.token

      if (!token) {
        res.status(401).json({ error: 'No token provided' })
        return
      }

      const isValid = await verifyToken(token)
      
      if (isValid) {
        res.status(200).json({ valid: true })
        return
      } else {
        res.status(401).json({ error: 'Invalid or expired token' })
        return
      }
    } catch (error) {
      console.error('Error verifying token:', error)
      res.status(500).json({ error: 'Token verification failed' })
      return
    }
  }

  res.status(405).json({ error: 'Method not allowed' })
}

