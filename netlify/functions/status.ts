import type { Handler } from '@netlify/functions'

// Simple in-memory store (will reset on serverless function cold start)
// For production, consider using a database or persistent storage
let currentStatus: 'yes' | 'no' = 'no'

export const handler: Handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  }

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    }
  }

  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: currentStatus }),
    }
  }

  if (event.httpMethod === 'POST') {
    try {
      const { status } = JSON.parse(event.body || '{}')
      
      if (status === 'yes' || status === 'no') {
        currentStatus = status
        return {
          statusCode: 200,
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: currentStatus, message: 'Status updated' }),
        }
      } else {
        return {
          statusCode: 400,
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ error: 'Invalid status. Must be "yes" or "no"' }),
        }
      }
    } catch (error) {
      return {
        statusCode: 400,
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Invalid request body' }),
      }
    }
  }

  return {
    statusCode: 405,
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ error: 'Method not allowed' }),
  }
}


