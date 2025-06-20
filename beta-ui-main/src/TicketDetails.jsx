import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axios from 'axios'

function TicketDetails() {
  const { ticketId } = useParams()
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

useEffect(() => {
  axios.get('http://localhost:8000/ticket_data')
    .then(res => {
      console.log("▶️ ticketId from URL:", ticketId)
      console.log("▶️ All ticket IDs in response:", res.data.details.map(t => t.ticket_id))

      const found = res.data.details.find(
        t => String(t.ticket_id).trim() === ticketId.trim()
      )
      console.log("▶️ Found Ticket:", found)

      if (found) {
        setTicket(found)
      } else {
        setError("Ticket not found.")
      }
    })
    .catch(err => {
      console.error("Fetch error:", err)
      setError("Failed to fetch ticket.")
    })
    .finally(() => setLoading(false))
}, [ticketId])

  if (loading) return <div className="p-4 text-gray-500">Loading...</div>
  if (error) return <div className="p-4 text-red-500">{error}</div>

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-xl mt-10">
      <h1 className="text-2xl font-bold mb-4">Ticket #{ticket.ticket_id}</h1>

      <div className="mb-4">
        <p><strong className="text-gray-600">Title:</strong> {ticket.ticket_title}</p>
        <p><strong className="text-gray-600">Status:</strong> {ticket.ticket_status}</p>
        <p><strong className="text-gray-600">Reported Date:</strong> {ticket.ticket_reported_date}</p>
        <p><strong className="text-gray-600">Summary:</strong> {ticket.ticket_summary}</p>
        <p><strong className="text-gray-600">Description:</strong> {ticket.ticket_description}</p>
        <p><strong className="text-gray-600">Priority:</strong> {ticket.ticket_priority}</p>
        <p><strong className="text-gray-600">Priority Reason:</strong> {ticket.ticket_priority_reason}</p>
        <p><strong className="text-gray-600">Category:</strong> {ticket.ticket_category}</p>
        <p><strong className="text-gray-600">Category Reason:</strong> {ticket.ticket_category_reason}</p>
        <p><strong className="text-gray-600">Assigned Employee:</strong> {ticket.ticket_assigned_employee}</p>
        <p><strong className="text-gray-600">Solution:</strong> {ticket.ticket_solution}</p>
      </div>
    </div>
  )
}

export default TicketDetails
