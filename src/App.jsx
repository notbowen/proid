import './App.css'
import { Routes, Route } from 'react-router-dom'

import { RestrictedGovtMasthead, ThemeProvider } from '@opengovsg/design-system-react'
import { AuthProvider } from './contexts/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import InteractiveMap from './pages/InteractiveMap'
import Suggest from './pages/Suggest'
import ProgressTracker from './pages/ProgressTracker'
import AIChatbot from './pages/AIChatbot'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Profile from './pages/Profile'
import AuthCallback from './pages/AuthCallback'

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <RestrictedGovtMasthead />
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/interactive-map" element={<InteractiveMap />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/suggest" element={
            <ProtectedRoute>
              <Suggest />
            </ProtectedRoute>
          } />
          <Route path="/progress-tracker" element={
            <ProtectedRoute>
              <ProgressTracker />
            </ProtectedRoute>
          } />
          <Route path="/ai-chatbot" element={<AIChatbot />} />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
        </Routes>
        <Footer />
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App
