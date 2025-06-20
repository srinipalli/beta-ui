import { Routes, Route } from 'react-router-dom'
import Dashboard from './Dashboard'
import TicketDetailsPage from './TicketDetailsPage'



function App() {
  return (
    <div className="relative">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/ticket/:id" element={<TicketDetailsPage />} />
      </Routes>
    </div>
  )
}

export default App
