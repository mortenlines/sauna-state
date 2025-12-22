import { kv } from '@vercel/kv'

// Keys for KV storage
export const KV_KEYS = {
  STATUS: 'sauna:status',
  SUBSCRIPTIONS: 'sauna:subscriptions',
} as const

// Check if KV is available (will be undefined in local dev without KV configured)
export function isKvAvailable(): boolean {
  return !!process.env.KV_REST_API_URL && !!process.env.KV_REST_API_TOKEN
}

// Get the KV client (returns null if not available)
export function getKv() {
  if (!isKvAvailable()) {
    return null
  }
  return kv
}

