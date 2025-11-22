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

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

The built files will be in the `dist` directory.

## Deployment

### Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Vercel will automatically detect the Vite configuration
4. Deploy!

The `vercel.json` file is already configured.

### Netlify

1. Push your code to GitHub
2. Import the project in Netlify
3. Netlify will automatically detect the build settings from `netlify.toml`
4. Deploy!

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
├── vercel.json
└── netlify.toml
```

## Features in Detail

### Status Management

- Status is stored in `localStorage` for persistence
- When status changes, push notifications are automatically sent to subscribed users
- Only authenticated users can change the status

### Push Notifications

- Users can subscribe to notifications via the bell icon (top left)
- Notifications are sent when the sauna status changes
- Uses browser's native Notification API and Service Worker

### Responsive Design

- Mobile-first approach with Tailwind CSS breakpoints
- Optimized for ultrawide desktop displays
- Touch-friendly buttons and interactions

## License

MIT

