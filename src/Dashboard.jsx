import { useState, useEffect } from 'react'
import axios from 'axios'

function InfoCard({ title, value, error, loading }) {
  return (
    <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-700 mb-2">{title}</h2>
      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <p className="text-2xl font-bold text-blue-600">{value}</p>
      )}
    </div>
  )
}

function TicketTable({ tickets, details, onView, onSort, sortColumn, sortOrder }) {
    const handleView = (ticketId) => {
    const detail = details.find(t => String(t.ticket_id) === String(ticketId))
    if (detail) onView(detail)
    }

  if (!tickets || tickets.length === 0) {
    return <p className="text-gray-500">No processed tickets found.</p>
  }

  return (
    <div className="overflow-x-auto">
    <div className="max-h-[60vh] overflow-y-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg table-fixed">
        <thead className="bg-gray-200 sticky top-0 z-10">
            <tr>
            <th className="px-4 py-2 text-left text-black">
            <div className="flex items-center space-x-1">
                <span>ID</span>
                <button
                onClick={() => onSort('ticket_id')}
                className="text-xs text-blue-500 hover:underline"
                >
                {sortColumn === 'ticket_id' ? (sortOrder === 'asc' ? '⬆︎' : '⬇︎') : '⬇︎'}
                </button>
            </div>
            </th>
            <th className="px-4 py-2 text-left text-black">
            <div className="flex items-center space-x-1">
                <span>Title</span>
                <button
                onClick={() => onSort('title')}
                className="text-xs text-blue-500 hover:underline"
                >
                {sortColumn === 'title' ? (sortOrder === 'asc' ? '⬆︎' : '⬇︎') : '⬇︎'}
                </button>
            </div>
            </th>
            <th className="px-4 py-2 text-left text-black">
            <div className="flex items-center space-x-1">
                <span>Priority</span>
                <button
                onClick={() => onSort('priority')}
                className="text-xs text-blue-500 hover:underline"
                >
                {sortColumn === 'priority' ? (sortOrder === 'asc' ? '⬆︎' : '⬇︎') : '⬇︎'}
                </button>
            </div>
            </th>
            <th className="px-4 py-2 text-left text-black">
            <div className="flex items-center space-x-1">
                <span>Category</span>
                <button
                onClick={() => onSort('category')}
                className="text-xs text-blue-500 hover:underline"
                >
                {sortColumn === 'category' ? (sortOrder === 'asc' ? '⬆︎' : '⬇︎') : '⬇︎'}
                </button>
            </div>
            </th>
            <th className="px-4 py-2 text-left text-black">
            <div className="flex items-center space-x-1">
                <span>Status</span>
                <button
                onClick={() => onSort('status')}
                className="text-xs text-blue-500 hover:underline"
                >
                {sortColumn === 'status' ? (sortOrder === 'asc' ? '⬆︎' : '⬇︎') : '⬇︎'}
                </button>
            </div>
            </th>
            <th className="px-4 py-2 text-left text-black">
            <div className="flex items-center space-x-1">
                <span>Assigned To</span>
                <button
                onClick={() => onSort('assigned_to')}
                className="text-xs text-blue-500 hover:underline"
                >
                {sortColumn === 'assigned_to' ? (sortOrder === 'asc' ? '⬆︎' : '⬇︎') : '⬇︎'}
                </button>
            </div>
            </th>
            <th className="px-4 py-2 text-left text-black">
            <div className="flex items-center space-x-1">
                <span>Source</span>
                <button
                onClick={() => onSort('source')}
                className="text-xs text-blue-500 hover:underline"
                >
                {sortColumn === 'source' ? (sortOrder === 'asc' ? '⬆︎' : '⬇︎') : '⬇︎'}
                </button>
            </div>
            </th>
            <th className="px-4 py-2 text-left text-black">Actions</th>
            </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
            {tickets.map((ticket, index) => (
            <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-black">{ticket.ticket_id}</td>
                <td className="px-4 py-2 text-black">{ticket.title}</td>
                <td className="px-4 py-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    ticket.priority === 'L1' ? 'bg-red-500 text-white'
                    : ticket.priority === 'L2' ? 'bg-orange-400 text-white'
                    : ticket.priority === 'L3' ? 'bg-yellow-300 text-black'
                    : ticket.priority === 'L4' ? 'bg-green-400 text-green-950'
                    : 'bg-blue-400 text-blue-50'
                }`}>
                    {ticket.priority}
                </span>
                </td>
                <td className="px-4 py-2 text-black">{ticket.category}</td>
                <td className="px-4 py-2 text-black">{ticket.status}</td>
                <td className="px-4 py-2 text-black">{ticket.employee_name}</td>
                <td className="px-4 py-2 text-black">{ticket.source}</td>
                <td className="px-4 py-2 text-black">
                <button
                    onClick={() => handleView(ticket.ticket_id)}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    View
                </button>
                </td>
            </tr>
            ))}
        </tbody>
        </table>
    </div>
    </div>
  )
}

export default function Dashboard({ onView }) {
    const [ticketCount, setTicketCount] = useState(0)
    const [processedTickets, setProcessedTickets] = useState([])
    const [ticketDetails, setTicketDetails] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterType, setFilterType] = useState('')
    const [filterValue, setFilterValue] = useState('')
    const [filterOptions, setFilterOptions] = useState({
    priority: ['L1', 'L2', 'L3', 'L4', 'L5'],
    category: [],
    status: [],
    assigned_to: [],
    source: []
    })
    const [sortColumn, setSortColumn] = useState(null)
    const [sortOrder, setSortOrder] = useState('asc') // or 'desc'
useEffect(() => {
  axios.get("http://localhost:8000/ticket_data")
    .then(res => {
      setTicketCount(res.data.ticket_count)
      setProcessedTickets(res.data.table_contents)
      setTicketDetails(res.data.details)
      setFilterOptions({
        priority: ['L1', 'L2', 'L3', 'L4', 'L5'],
        category: res.data.distinct_categories,
        status: res.data.distinct_status,
        assigned_to: res.data.distinct_assigned_to,
        source: res.data.distinct_sources
      })
    })
    .catch(err => {
      console.error("Error fetching ticket data:", err)
      setError("Failed to load ticket data.")
    })
    .finally(() => setLoading(false))
}, [])

    const filteredAndSortedTickets = processedTickets
    .filter(ticket =>
        ticket.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(ticket => {
        if (!filterType || !filterValue) return true
        const keyMap = {
        priority: 'priority',
        category: 'category',
        status: 'status',
        assigned_to: 'employee_name',
        source: 'source'
        }
        return String(ticket[keyMap[filterType]]).toLowerCase() === filterValue.toLowerCase()
    })
    .sort((a, b) => {
        if (!sortColumn) return 0
        const valA = a[sortColumn]?.toString().toLowerCase()
        const valB = b[sortColumn]?.toString().toLowerCase()

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1
        return 0
    })

    const handleSort = (column) => {
    if (sortColumn === column) {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
        setSortColumn(column)
        setSortOrder('asc')
    }
    }


  return (
    <div className="w-screen h-screen bg-gray-50 overflow-auto">
      <div className="max-w-7xl mx-auto px-4 py-8 h-full flex flex-col">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Ticket Dashboard</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <InfoCard title="Total Tickets" value={ticketCount} error={error} loading={loading} />
          <InfoCard title="Pending Tickets" value="..." error={error} loading={loading} />
          <InfoCard title="Resolved Tickets" value="..." error={error} loading={loading} />
          <InfoCard title="Errors" value="..." error={error} loading={loading} />
        </div>

        <h2 className="text-xl font-semibold mb-4 text-gray-700">Ticket Details</h2>
        {/* SEARCH AND FILTER: */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 bg-white p-4 rounded-xl shadow-sm">
        {/*  Search Bar */}
        <div className="mb-6 flex items-center w-full sm:w-1/2 bg-white border border-gray-300 rounded-lg shadow-sm px-3 py-2">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-400 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
        </svg>
        <input
            type="text"
            placeholder="Search by ticket title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full focus:outline-none text-gray-800"
        />
        </div>

        <div className="flex flex-wrap gap-4 items-center mb-4">
        {/* Filter Type Dropdown */}
        <select
            className="appearance-none bg-white border border-gray-300 text-black rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filterType}
            onChange={(e) => {
            setFilterType(e.target.value)
            setFilterValue('')  // Reset filter value when type changes
            }}
        >
            <option value="">Filter by</option>
            <option value="priority">Priority</option>
            <option value="category">Category</option>
            <option value="status">Status</option>
            <option value="assigned_to">Assigned To</option>
            <option value="source">Source</option>
        </select>

        {/* Filter Value Dropdown */}
        <select
            className="appearance-none bg-white border border-gray-300 text-black rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            disabled={!filterType}
        >
            <option value="">Select value</option>
            {filterType && filterOptions[filterType]?.map((option, i) => (
            <option key={i} value={option}>{option}</option>
            ))}
        </select>
        </div>
        <TicketTable
        tickets={filteredAndSortedTickets}
        details={ticketDetails}
        onView={onView}
        onSort={handleSort}
        sortColumn={sortColumn}
        sortOrder={sortOrder}
        />
        </div>
      </div>
    </div>
  )
}
