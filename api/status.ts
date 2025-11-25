import type { VercelRequest, VercelResponse } from '@vercel/node'

// Simple in-memory store (will reset on serverless function cold start)
// For production, consider using Vercel KV, a database, or file storage
let currentStatus: 'yes' | 'no' = 'no'

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method === 'GET') {
    // Return current status
    res.status(200).json({ status: currentStatus })
    return
  }

  if (req.method === 'POST') {
    // Update status
    const { status } = req.body
    
    if (status === 'yes' || status === 'no') {
      currentStatus = status
      res.status(200).json({ status: currentStatus, message: 'Status updated' })
      return
    } else {
      res.status(400).json({ error: 'Invalid status. Must be "yes" or "no"' })
      return
    }
  }

  res.status(405).json({ error: 'Method not allowed' })
}


