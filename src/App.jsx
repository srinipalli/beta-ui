import { Routes, Route } from 'react-router-dom'
import Dashboard from './Dashboard'
import TicketDetailsPage from './TicketDetailsPage'
import LandingPage from './LandingPage'

function App() {
  return (
    <div className="relative">
      <Routes>
        <Route path="/" element={<LandingPage />} />         {/* Show landing page at "/" */}
        <Route path="/dashboard" element={<Dashboard />} />  {/* Show dashboard at "/dashboard" */}
        <Route path="/ticket/:id" element={<TicketDetailsPage />} />
      </Routes>
    </div>
  )
}

export default App