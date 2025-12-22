import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getKv, KV_KEYS, isKvAvailable } from '../lib/kv'

// Fallback in-memory store for push subscriptions (only used if KV is not available)
let pushSubscriptions: Array<{ subscription: any; timestamp: number }> = []

// Clean up old subscriptions (older than 30 days)
const MAX_SUBSCRIPTION_AGE = 30 * 24 * 60 * 60 * 1000

interface SubscriptionData {
  subscription: any
  timestamp: number
}

async function getAllSubscriptions(): Promise<SubscriptionData[]> {
  const kv = getKv()
  if (kv) {
    try {
      const subscriptions = await kv.get<SubscriptionData[]>(KV_KEYS.SUBSCRIPTIONS)
      return subscriptions || []
    } catch (error) {
      console.error('Error reading subscriptions from KV:', error)
      return []
    }
  }
  // Fallback to in-memory store
  return pushSubscriptions
}

async function saveSubscriptions(subscriptions: SubscriptionData[]): Promise<void> {
  const kv = getKv()
  if (kv) {
    try {
      await kv.set(KV_KEYS.SUBSCRIPTIONS, subscriptions)
    } catch (error) {
      console.error('Error writing subscriptions to KV:', error)
      throw error
    }
  } else {
    // Fallback to in-memory store
    pushSubscriptions = subscriptions
  }
}

async function cleanupOldSubscriptions(): Promise<SubscriptionData[]> {
  const now = Date.now()
  const allSubscriptions = await getAllSubscriptions()
  const cleaned = allSubscriptions.filter(
    sub => now - sub.timestamp < MAX_SUBSCRIPTION_AGE
  )
  
  // Only save if we actually removed something
  if (cleaned.length !== allSubscriptions.length) {
    await saveSubscriptions(cleaned)
  }
  
  return cleaned
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
      const { subscription } = req.body

      if (!subscription || !subscription.endpoint) {
        res.status(400).json({ error: 'Invalid subscription data' })
        return
      }

      // Clean up old subscriptions
      const cleanedSubscriptions = await cleanupOldSubscriptions()

      // Check if subscription already exists
      const existingIndex = cleanedSubscriptions.findIndex(
        sub => sub.subscription.endpoint === subscription.endpoint
      )

      let updatedSubscriptions: SubscriptionData[]
      if (existingIndex >= 0) {
        // Update existing subscription
        updatedSubscriptions = [...cleanedSubscriptions]
        updatedSubscriptions[existingIndex] = {
          subscription,
          timestamp: Date.now()
        }
      } else {
        // Add new subscription
        updatedSubscriptions = [
          ...cleanedSubscriptions,
          {
            subscription,
            timestamp: Date.now()
          }
        ]
      }

      // Save updated subscriptions
      await saveSubscriptions(updatedSubscriptions)

      console.log(`Subscription stored. Total subscriptions: ${updatedSubscriptions.length}`)
      res.status(200).json({ success: true, count: updatedSubscriptions.length })
      return
    } catch (error) {
      console.error('Error storing subscription:', error)
      res.status(500).json({ error: 'Failed to store subscription' })
      return
    }
  }

  res.status(405).json({ error: 'Method not allowed' })
}

// Export function to get all subscriptions (for use in status.ts)
export async function getPushSubscriptions() {
  const cleaned = await cleanupOldSubscriptions()
  return cleaned.map(sub => sub.subscription)
}

