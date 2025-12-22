// Simple Express server for local API development
// This mimics the Vercel serverless functions for local dev

import express from 'express'
import cors from 'cors'

const app = express()
const PORT = 3001

// In-memory stores (matching the Vercel function behavior)
let currentStatus = 'no'
let pushSubscriptions = []

const MAX_SUBSCRIPTION_AGE = 30 * 24 * 60 * 60 * 1000

function cleanupOldSubscriptions() {
  const now = Date.now()
  pushSubscriptions = pushSubscriptions.filter(
    sub => now - sub.timestamp < MAX_SUBSCRIPTION_AGE
  )
}

// Middleware
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}))
app.use(express.json())

// Status endpoint
app.all('/api/status', async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method === 'GET') {
    res.status(200).json({ status: currentStatus })
    return
  }

  if (req.method === 'POST') {
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
})

// Push subscription endpoint
app.all('/api/push/subscribe', async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method === 'POST') {
    try {
      const { subscription } = req.body

      if (!subscription || !subscription.endpoint) {
        res.status(400).json({ error: 'Invalid subscription data' })
        return
      }

      cleanupOldSubscriptions()

      const existingIndex = pushSubscriptions.findIndex(
        sub => sub.subscription.endpoint === subscription.endpoint
      )

      if (existingIndex >= 0) {
        pushSubscriptions[existingIndex] = {
          subscription,
          timestamp: Date.now()
        }
      } else {
        pushSubscriptions.push({
          subscription,
          timestamp: Date.now()
        })
      }

      console.log(`Subscription stored. Total subscriptions: ${pushSubscriptions.length}`)
      res.status(200).json({ success: true, count: pushSubscriptions.length })
      return
    } catch (error) {
      console.error('Error storing subscription:', error)
      res.status(500).json({ error: 'Failed to store subscription' })
      return
    }
  }

  res.status(405).json({ error: 'Method not allowed' })
})

// VAPID public key endpoint
app.all('/api/push/vapid-public-key', (req, res) => {
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method === 'GET') {
    const publicKey = process.env.VAPID_PUBLIC_KEY || ''
    res.status(200).json({ publicKey })
    return
  }

  res.status(405).json({ error: 'Method not allowed' })
})

app.listen(PORT, () => {
  console.log(`🚀 Local API server running on http://localhost:${PORT}`)
  console.log(`   Proxying API requests from Vite dev server...`)
})

