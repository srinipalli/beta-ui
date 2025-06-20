// function TicketDetailsModal({ ticket, onClose }) {
//   return (
//     <div className="fixed inset-0 z-50 bg-opacity-40 backdrop-blur-xl flex items-center justify-center">
//       <div className="bg-white w-[80vw] h-[70vh] overflow-y-auto p-6 rounded-2xl shadow-2xl relative">
//         <button
//           onClick={onClose}
//           className="absolute top-4 right-4 text-white hover:text-red-500 text-xl"
//         >
//           X
//         </button>
//         <h1 className="text-2xl font-bold mb-4 text-black">Ticket #{ticket.ticket_id}</h1>
//         <div className="space-y-2 text-gray-800">
//             <p><strong>Title:</strong> {ticket.ticket_title}</p>
//             <p><strong>Summary:</strong> {ticket.ticket_summary}</p>
//             <p><strong>Description:</strong> {ticket.ticket_description}</p>
//             <p><strong>Status:</strong> {ticket.ticket_status}</p>
//             <p><strong>Priority:</strong> {ticket.ticket_priority}</p>
//             <p><strong>Category:</strong> {ticket.ticket_category}</p>
//             <p><strong>Assigned To:</strong> {ticket.ticket_assigned_employee}</p>
//             <p><strong>Solution:</strong> {ticket.ticket_solution}</p>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default TicketDetailsModal

import { useState } from 'react'

function TicketDetailsModal({ ticket, onClose }) {
  const [showFullDescription, setShowFullDescription] = useState(false)

  const MAX_LENGTH = 300
  const descriptionTooLong = ticket.ticket_description?.length > MAX_LENGTH
  const shortDescription = ticket.ticket_description?.slice(0, MAX_LENGTH)

  return (
    <div className="fixed inset-0 z-50 bg-opacity-80 backdrop-blur-2xl flex items-center justify-center">
      <div className="bg-white w-[90vw] max-w-4xl h-[80vh] overflow-y-auto p-8 rounded-2xl shadow-2xl relative">
        {/* Close Modal */}
        <button
          onClick={onClose}
          className="bg-white absolute top-4 right-4 text-gray-500 hover:text-red-500 text-2xl font-bold"
        >
          &times;
        </button>

        {/* Title */}
        <h1 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-2">
          Ticket #{ticket.ticket_id}
        </h1>

        {/* Ticket Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-800">
          <Detail label="Title" value={ticket.ticket_title} />
          <Detail label="Summary" value={ticket.ticket_summary} />
          <Detail label="Status" value={<StatusBadge status={ticket.ticket_status} />} />
          <Detail label="Priority" value={<PriorityBadge level={ticket.ticket_priority} />} />
          <Detail label="Category" value={ticket.ticket_category} />
          <Detail label="Assigned To" value={ticket.ticket_assigned_employee} />
        </div>

        {/* Description Section */}
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2 text-gray-700">Description</h2>
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {descriptionTooLong ? shortDescription + '…' : ticket.ticket_description}
          </p>
          {descriptionTooLong && (
            <button
              onClick={() => setShowFullDescription(true)}
              className="bg-white mt-2 text-blue-600 hover:underline"
            >
              View Full Description
            </button>
          )}
        </div>

        {/* Solution Section */}
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2 text-gray-700">Solution</h2>
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {ticket.ticket_solution || "No solution yet."}
          </p>
        </div>
      </div>

      {/* Nested Modal for Full Description */}
      {showFullDescription && (
        <div className="fixed inset-0 z-60 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white w-[80vw] max-w-3xl h-[70vh] p-6 rounded-2xl shadow-xl overflow-y-auto relative">
            <button
              onClick={() => setShowFullDescription(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-2xl font-bold"
            >
              &times;
            </button>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Full Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {ticket.ticket_description}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// Reusable Detail Component
function Detail({ label, value }) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-base font-medium">{value}</p>
    </div>
  )
}

// Status Badge
function StatusBadge({ status }) {
  const statusColor = {
    Open: 'bg-green-100 text-green-700',
    Closed: 'bg-red-100 text-red-700',
    Pending: 'bg-yellow-100 text-yellow-700',
  }[status] || 'bg-gray-100 text-gray-700'

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${statusColor}`}>
      {status}
    </span>
  )
}

// Priority Badge
function PriorityBadge({ level }) {
  const badgeStyle = {
    L1: 'bg-red-500 text-white',
    L2: 'bg-orange-400 text-white',
    L3: 'bg-yellow-300 text-black',
    L4: 'bg-green-400 text-green-900',
  }[level] || 'bg-blue-400 text-white'

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${badgeStyle}`}>
      {level}
    </span>
  )
}

export default TicketDetailsModal
