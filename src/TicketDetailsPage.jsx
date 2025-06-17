import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axios from 'axios'

// function TicketDetails({ ticket }) {
//   const rows = [
//     { label: "Title", value: ticket.ticket_title },
//     { label: "Status", value: ticket.ticket_status },
//     { label: "Reported Date", value: ticket.ticket_reported_date },
//     { label: "Summary", value: ticket.ticket_summary },
//     { label: "Description", value: ticket.ticket_description },
//     { label: "Priority", value: ticket.ticket_priority },
//     { label: "Priority Reason", value: ticket.ticket_priority_reason },
//     { label: "Category", value: ticket.ticket_category },
//     { label: "Category Reason", value: ticket.ticket_category_reason },
//     { label: "Assigned Employee", value: ticket.ticket_assigned_employee },
//     { label: "Solution", value: ticket.ticket_solution }
//   ]

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
//       {rows.map((row, i) => (
//         <div key={i} className="flex flex-col">
//           <span className="text-gray-500 font-semibold">{row.label}</span>
//           <span className="text-gray-900">{row.value || <em className="text-gray-400">Not available</em>}</span>
//         </div>
//       ))}
//     </div>
//   )
// }
import { HelpCircle } from 'lucide-react'

function TicketDetails({ ticket }) {
    const [showPriorityReason, setShowPriorityReason] = useState(false)
    const [showCategoryReason, setShowCategoryReason] = useState(false)
    const [editMode, setEditMode] = useState(false)
    const [saving, setSaving] = useState(false)

    const [formData, setFormData] = useState({
        priority: ticket.ticket_priority,
        status: ticket.ticket_status,
        category: ticket.ticket_category
    })

    const [options, setOptions] = useState({
        priorities: [],
        categories: [],
        statuses: []
    })
        useEffect(() => {
        const fetchOptions = async () => {
            try {
            const res = await axios.get("http://localhost:8000/ticket_data")
            setOptions({
                priorities: res.data.distinct_priorities || [],
                categories: res.data.distinct_categories || [],
                statuses: res.data.distinct_status || [],
            })
            } catch (err) {
            console.error("Failed to fetch metadata:", err)
            alert("Failed to load dropdown options.")
            }
        }

        fetchOptions()
        }, [])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await axios.put(`http://localhost:8000/tickets/${ticket.ticket_id}`, {
        priority: formData.priority,
        status: formData.status,
        category: formData.category
      })
      console.log("Sending update for:", formData)
      setEditMode(false)
    } catch (err) {
      console.error("Failed to update ticket:", err)
      alert("Error saving ticket changes.")
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      priority: ticket.ticket_priority,
      status: ticket.ticket_status,
      category: ticket.ticket_category
    })
    setEditMode(false)
  }

  return (
    <div className="w-full min-h-screen px-8 py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl p-10 space-y-12">
        {/* Top bar */}
        <div className="flex justify-between items-center">
          <h2 className="text-4xl font-bold text-gray-800">
            Ticket #{ticket.ticket_id}
          </h2>
          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
            >
              Edit Ticket
            </button>
          ) : (
            <div className="flex space-x-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-lg text-sm"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* LEFT COLUMN */}
          <div className="space-y-10">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-2">Ticket Title</h3>
              <p className="text-xl text-gray-800">{ticket.ticket_title}</p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-2">AI Summary</h3>
              <p className="text-gray-700 text-lg">{ticket.ticket_summary || <em className="text-gray-400">Not available</em>}</p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-2">AI Suggested Solution</h3>
              <p className="text-gray-700 text-lg">{ticket.ticket_solution || <em className="text-gray-400">Not available</em>}</p>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-2">Reported Date</h3>
              <p className="text-gray-800 text-lg">{ticket.ticket_reported_date}</p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-2">Priority (AI)</h3>
              <div className="flex items-center space-x-3">
                {editMode ? (
                    <select
                    value={formData.priority}
                    onChange={(e) => handleChange("priority", e.target.value)}
                    className="appearance-none bg-white border border-gray-300 text-black rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                    {options.priorities.map((p) => (
                        <option key={p} value={p}>{p}</option>
                    ))}
                    </select>
                ) : (
                  <span className="px-4 py-1 rounded-full text-sm font-semibold bg-blue-500 text-white">
                    {formData.priority}
                  </span>
                )}
                <button onClick={() => setShowPriorityReason(!showPriorityReason)}>
                  <HelpCircle size={18} className="text-gray-500 hover:text-gray-700" />
                </button>
              </div>
              {showPriorityReason && (
                <p className="mt-2 text-gray-500 text-sm">{ticket.ticket_priority_reason}</p>
              )}
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-2">AI Assigned Category</h3>
              <div className="flex items-center space-x-3">
                {editMode ? (
                    <select
                    value={formData.category}
                    onChange={(e) => handleChange("category", e.target.value)}
                    className="appearance-none bg-white border border-gray-300 text-black rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                    {options.categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                    </select>
                ) : (
                  <span className="px-4 py-1 rounded-full text-sm font-semibold bg-green-500 text-white">
                    {formData.category}
                  </span>
                )}
                <button onClick={() => setShowCategoryReason(!showCategoryReason)}>
                  <HelpCircle size={18} className="text-gray-500 hover:text-gray-700" />
                </button>
              </div>
              {showCategoryReason && (
                <p className="mt-2 text-gray-500 text-sm">{ticket.ticket_category_reason}</p>
              )}
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-2">Status</h3>
              {editMode ? (
                <select
                value={formData.status}
                onChange={(e) => handleChange("status", e.target.value)}
                className="appearance-none bg-white border border-gray-300 text-black rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                {options.statuses.map((s) => (
                    <option key={s} value={s}>{s}</option>
                ))}
                </select>
              ) : (
                <p className="text-gray-800 text-lg">{formData.status}</p>
              )}
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-2">Suggested Employee</h3>
              <p className="text-gray-800 text-lg">{ticket.ticket_assigned_employee}</p>
            </div>
          </div>
        </div>

        {/* FULL WIDTH - DESCRIPTION */}
        <div className="md:col-span-2">
          <h3 className="text-sm font-semibold text-gray-500 mb-2">Ticket Description</h3>
          <p className="text-gray-700 text-lg whitespace-pre-line">
            {ticket.ticket_description || <em className="text-gray-400">Not available</em>}
          </p>
        </div>
      </div>
    </div>
  )
}



export default function TicketDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get('http://localhost:8000/ticket_data')
      .then(res => {
        const details = res.data.details
        const found = details.find(t => String(t.ticket_id) === id)
        setTicket(found)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch ticket details', err)
        setLoading(false)
      })
  }, [id])

  if (loading) return <div className="p-6">Loading...</div>

  if (!ticket) {
    return (
      <div className="p-6 text-red-500">
        Ticket not found.
        <button onClick={() => navigate(-1)} className="ml-4 underline text-blue-600">
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen min-w-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="min-w-screen min-h-screen max-w-4xl bg-white shadow-xl rounded-2xl p-8">
        <button onClick={() => navigate(-1)} className="text-blue-600 underline mb-6">
            ← Back to Dashboard
        </button>
        <TicketDetails ticket={ticket} />
        </div>
    </div>
  )
}