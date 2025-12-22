# Sauna State 🔥

A simple web application to display and manage the status of your sauna tent.

## Features

- 🔥 **Status Display**: Shows whether the sauna is ready ("Yes!!") or not ("No...")
- 🔐 **Admin Login**: Secure login page to change the sauna status
- 🔔 **Push Notifications**: Subscribe to browser push notifications for status changes
- 📱 **Responsive Design**: Works perfectly on both desktop (ultrawide) and mobile devices
- 🎨 **Beautiful UI**: Modern design with animated status text (burning effect for "Yes", cold effect for "No")

## Tech Stack

- **React 18** with **TypeScript**
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Service Worker** for push notifications
- **Vercel KV** (Redis) for data persistence

## Getting Started

### Installation

```bash
npm install
```

### Development

For local development, you have three options:

**Option 1: Full development with API (recommended)**
```bash
npm run dev
```

This starts both the Vite frontend server and a local API server. The frontend will be available at `http://localhost:5173` and API requests are automatically proxied to the local API server. This is the recommended way to develop locally.

**Option 2: Vite only (no API routes)**
```bash
npm run dev:vite
```

This starts only Vite on `http://localhost:5173`. API endpoints will not be available in this mode.

**Option 3: Full Vercel dev server**
```bash
npm run dev:vercel
```

This starts the Vercel development server which handles both the frontend and API routes. The app will be available at `http://localhost:3000` (or the port Vercel assigns). Use this when you need to test the exact Vercel serverless function behavior.

### Build

```bash
npm run build
```

The built files will be in the `dist` directory.

## Deployment

### Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. **Set up Vercel KV**:
   - In your Vercel project dashboard, go to the Storage tab
   - Create a new KV database
   - The environment variables (`KV_REST_API_URL` and `KV_REST_API_TOKEN`) will be automatically added
4. Deploy!

The `vercel.json` file is already configured.

**Note**: For local development, the app will work without Vercel KV (using in-memory storage), but data won't persist between restarts. For production, Vercel KV is required for persistence.

## Default Password

The default admin password is: `sauna2024`

**⚠️ Important**: Change this password in production by modifying `src/contexts/AuthContext.tsx`

## Project Structure

```
sauna-state/
├── public/
│   ├── sauna-tent-no.png
│   ├── sauna-tent-yes.png
│   └── sw.js (Service Worker)
├── api/
│   ├── lib/
│   │   └── kv.ts (Vercel KV utilities)
│   ├── push/
│   │   ├── subscribe.ts (Push notification subscription endpoint)
│   │   └── vapid-public-key.ts (VAPID public key endpoint)
│   └── status.ts (Status API endpoint)
├── src/
│   ├── components/
│   │   ├── NotificationDialog.tsx
│   │   └── StatusToggle.tsx
│   ├── contexts/
│   │   ├── AuthContext.tsx
│   │   └── StatusContext.tsx
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   └── StatusPage.tsx
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── vercel.json
```

## Features in Detail

### Status Management

- Status is persisted in **Vercel KV** (Redis) for production
- Falls back to in-memory storage for local development (data won't persist between restarts)
- When status changes, push notifications are automatically sent to subscribed users
- Only authenticated users can change the status

### Push Notifications

- Users can subscribe to notifications via the bell icon (top left)
- Subscriptions are persisted in **Vercel KV** (Redis) for production
- Falls back to in-memory storage for local development
- Notifications are sent when the sauna status changes
- Uses browser's native Notification API and Service Worker
- Old subscriptions (older than 30 days) are automatically cleaned up

### Responsive Design

- Mobile-first approach with Tailwind CSS breakpoints
- Optimized for ultrawide desktop displays
- Touch-friendly buttons and interactions

## License

MIT

