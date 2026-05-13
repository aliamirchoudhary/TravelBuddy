import { Outlet } from 'react-router-dom'
import Navbar from './Navbar.jsx'
import StitchShell from './StitchShell.jsx'

/**
 * MainLayout provides the global shell for all internal pages.
 * It includes the StitchShell background, Sidebar, and Navbar.
 */
export default function MainLayout() {
  return (
    <StitchShell>
      <Navbar />
      <div style={{ padding: '80px 24px 40px' }}>
        <Outlet />
      </div>
    </StitchShell>
  )
}
