import './App.css'
import { Routes, Route } from 'react-router-dom'

import { RestrictedGovtMasthead, ThemeProvider } from '@opengovsg/design-system-react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import InteractiveMap from './pages/InteractiveMap'
import Suggest from './pages/Suggest'
import ProgressTracker from './pages/ProgressTracker'

function App() {
  return (
    <ThemeProvider>
      <RestrictedGovtMasthead />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/interactive-map" element={<InteractiveMap />} />
        <Route path="/suggest" element={<Suggest />} />
        <Route path="/progress-tracker" element={<ProgressTracker />} />
      </Routes>
      <Footer />
    </ThemeProvider>
  )
}

export default App
