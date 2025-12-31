import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getKv, KV_KEYS } from './kv.js'
import { verifyToken } from './auth/login.js'

// Fallback in-memory store (only used if KV is not available, e.g., local dev)
let currentStatus: 'yes' | 'no' = 'no'

async function getStatus(): Promise<'yes' | 'no'> {
  const kv = getKv()
  if (kv) {
    try {
      const status = await kv.get<'yes' | 'no'>(KV_KEYS.STATUS)
      return status || 'no'
    } catch (error) {
      console.error('Error reading status from KV:', error)
      return 'no'
    }
  }
  // Fallback to in-memory store
  return currentStatus
}

async function setStatus(status: 'yes' | 'no'): Promise<void> {
  const kv = getKv()
  if (kv) {
    try {
      await kv.set(KV_KEYS.STATUS, status)
    } catch (error) {
      console.error('Error writing status to KV:', error)
      throw error
    }
  } else {
    // Fallback to in-memory store
    currentStatus = status
  }
}

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

  if (req.method === 'GET') {
    try {
      const status = await getStatus()
      res.status(200).json({ status })
      return
    } catch (error) {
      console.error('Error getting status:', error)
      res.status(500).json({ error: 'Failed to get status' })
      return
    }
  }

  if (req.method === 'POST') {
    try {
      // Verify authentication token
      const authHeader = req.headers.authorization
      const token = authHeader?.replace('Bearer ', '')
      
      if (!token) {
        res.status(401).json({ error: 'Authentication required' })
        return
      }

      const isValid = await verifyToken(token)
      if (!isValid) {
        res.status(401).json({ error: 'Invalid or expired token' })
        return
      }

      const { status } = req.body
      
      if (status === 'yes' || status === 'no') {
        await setStatus(status)
        const updatedStatus = await getStatus()
        res.status(200).json({ status: updatedStatus, message: 'Status updated' })
        return
      } else {
        res.status(400).json({ error: 'Invalid status. Must be "yes" or "no"' })
        return
      }
    } catch (error) {
      console.error('Error updating status:', error)
      res.status(500).json({ error: 'Failed to update status' })
      return
    }
  }

  res.status(405).json({ error: 'Method not allowed' })
}


