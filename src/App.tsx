import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import StatusPage from './pages/StatusPage'
import LoginPage from './pages/LoginPage'
import { AuthProvider } from './contexts/AuthContext'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<StatusPage />} />
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  )
}

export default App

