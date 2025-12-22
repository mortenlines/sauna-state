import type { VercelRequest, VercelResponse } from '@vercel/node'

// VAPID public key - in production, generate these using web-push library
// You can generate them using: npx web-push generate-vapid-keys
// Then set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY as environment variables
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || ''

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method === 'GET') {
    res.status(200).json({ publicKey: VAPID_PUBLIC_KEY })
    return
  }

  res.status(405).json({ error: 'Method not allowed' })
}

