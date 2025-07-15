import './App.css'

import { RestrictedGovtMasthead, ThemeProvider } from '@opengovsg/design-system-react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

function App({ children }) {
  return (
    <ThemeProvider>
      <RestrictedGovtMasthead />
      <Navbar />
      {children}
      <Footer />
    </ThemeProvider>
  )
}

export default App
