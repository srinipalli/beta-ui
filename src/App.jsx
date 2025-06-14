import { useState } from 'react'
import Dashboard from './Dashboard'
import TicketDetailsModal from './TicketDetailsModal'

function App() {
  const [selectedTicket, setSelectedTicket] = useState(null)

  return (
    <div className="relative">
      <Dashboard onView={setSelectedTicket} />
      {selectedTicket && (
        <TicketDetailsModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}
    </div>
  )
}

export default App