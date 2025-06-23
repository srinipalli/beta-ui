"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import Chatbot from "./Chatbot"
import { Tooltip as ReactTooltip } from "react-tooltip"
import ISIcon from './logo.jpg'
import { HelpCircle } from "lucide-react"

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#14B8A6"]

const STATUS_COLORS = {
  Closed: "#EF4444",
  Open: "#3B82F6",
  "In Progress": "#F59E0B",
  Resolved: "#10B981",
}

const triageTooltips = {
  L1: "Critical",
  L2: "High",
  L3: "Medium",
  L4: "Low",
  L5: "Planned",
}

const triageLabels = {
  L1: "Critical",
  L2: "High",
  L3: "Medium",
  L4: "Low",
  L5: "Planned",
}

// --- HelpPopover Component ---
function HelpPopover({ content }) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="relative inline-block">
      <HelpCircle
        className="w-5 h-5 text-blue-500 cursor-pointer hover:text-blue-700 transition"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        aria-label="Help"
      />
      {visible && (
  <div
    className="absolute right-0 mt-2 w-80 z-50 p-4 border border-blue-300 rounded-lg shadow-lg text-sm text-gray-700"
    style={{
      top: "28px",
      // backgroundColor: "rgb(243, 230, 242)", // <-- transparent white
      backgroundColor: "rgb(255, 255, 255)", // <-- transparent white
      backdropFilter: "blur(2px)", // Optional: adds a blur effect behind popup
      opacity: 0.95
    }}
    onMouseEnter={() => setVisible(true)}
    onMouseLeave={() => setVisible(false)}
  >
    {content}
  </div>
)}
    </div>
  )
}

function CombinedInfoCard({ ticketCount, sourceData }) {
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, index }) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)
    const value = sourceData[index].count

    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12}>
        {value}
      </text>
    )
  }

  return (
    <div className="bg-white shadow-md rounded-2xl p-3 border border-gray-200 h-[320px] flex flex-col ">
      <h2 className="text-lg font-semibold text-gray-700">Project Overview</h2>
      <div className="text-5xl font-bold text-blue-600 mt-2">{ticketCount}</div>
      <div className="flex flex-1 items-center justify-between mt-4 gap-4">
        <div className="w-1/2 flex justify-center items-center">
          <ResponsiveContainer width={140} height={140}>
            <PieChart>
              <Pie
                data={sourceData}
                dataKey="count"
                nameKey="source"
                cx="50%"
                cy="50%"
                outerRadius={60}
                label={renderCustomLabel}
                labelLine={false}
              >
                {sourceData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="w-1/2 text-sm text-gray-700 space-y-1">
          {sourceData.map((entry, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
              <span>
                {entry.source} ({entry.count})
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function PieChartCard({ title, data, dataKey, nameKey }) {
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, index }) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)
    const value = data[index][dataKey]

    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12}>
        {value}
      </text>
    )
  }

  return (
    <div className="bg-white shadow-md rounded-2xl p-4 border border-gray-200 h-[320px] flex flex-col">
      <h2 className="text-lg font-semibold text-gray-700 mb-2">{title}</h2>
      <div className="flex flex-1 items-center justify-between mt-2 gap-4">
        <div className="w-1/2 flex justify-center items-center">
          <ResponsiveContainer width={140} height={140}>
            <PieChart>
              <Pie
                data={data}
                dataKey={dataKey}
                nameKey={nameKey}
                cx="50%"
                cy="50%"
                outerRadius={60}
                label={renderCustomLabel}
                labelLine={false}
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="w-1/2 text-sm text-gray-700 space-y-1">
          {data.map((entry, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
              <span>
                {entry[nameKey]} ({entry[dataKey]})
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const CustomXAxisTick = ({ x, y, payload }) => {
  const words = payload.value.split(" ")
  return (
    <g transform={`translate(${x},${y})`}>
      {words.map((word, i) => (
        <text key={i} x={0} y={i * 12} dy={12} textAnchor="middle" fill="#444" fontSize={12}>
          {word}
        </text>
      ))}
    </g>
  )
}

// --- Modified StatusBarChartCard with Help Icon ---
function StatusBarChartCard({ title, data, dataKeyX, dataKeyY }) {
  const helpContent = (
    <ul className="list-disc pl-4 text-justify">
      <li><b>Closed</b> - The issue or ticket has been fully addressed and no further action is needed.</li>
      <li><b>In Progress</b> - Work on the issue or task is currently ongoing.</li>
      <li><b>Resolved</b> - The solution has been provided, but the ticket may remain open for confirmation or monitoring.</li>
      <li><b>Open</b> - The issue or ticket has been created and is awaiting action.</li>
    </ul>
  )
  return (
    <div className="bg-white shadow-md rounded-2xl p-4 border border-gray-200 min-h-[300px] text-black relative">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
        <HelpPopover content={helpContent} />
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 20, left: 20, bottom: 50 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={dataKeyX} interval={0} angle={-40} textAnchor="end" tick={{ fontSize: 15 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey={dataKeyY}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry[dataKeyX]] || "#8884d8"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// --- Modified BarChartCard (Triage Levels) with Help Icon ---
function BarChartCard({ title, data, dataKeyX, dataKeyY }) {
  const triageColors = {
    L1: "#EF4444",
    L2: "#FB923C",
    L3: "#FCD34D",
    L4: "#896129",
    L5: "#6FC276",
  }

  const helpContent = (
    <ul className="list-disc pl-4 ">
      <li><b>L1</b> - The highest escalation level, often involving executive management or specialized external consultants.</li>
      <li><b>L2</b> - External or vendor-level support, engaged when the issue requires intervention from outside the organization.</li>
      <li><b>L3</b> - Advanced support for the most complex problems, usually involving subject matter experts or developers.</li>
      <li><b>L4</b> - Handles more complex issues, often requiring specialized knowledge.</li>
      <li><b>L5</b> - The last line of support, handling basic issues and initial troubleshooting.</li>
    </ul>
  )

  return (
    <div className="bg-white shadow-md rounded-2xl p-4 border border-gray-200 min-h-[300px] text-black relative">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
        <HelpPopover content={helpContent} />
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={dataKeyX} tick={{ fontSize: 14 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 14 }} />
            <Tooltip />
            <Bar dataKey={dataKeyY}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={triageColors[entry[dataKeyX]] || "#3B82F6"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function TicketTable({ tickets, onSort, sortColumn, sortOrder }) {
  const navigate = useNavigate()

  const handleView = (ticketId) => {
    navigate(`/ticket/${ticketId}`)
  }

  const getTriageLabel = (level) => {
    switch (level) {
      case "L1":
        return "Critical"
      case "L2":
        return "High"
      case "L3":
        return "Medium"
      case "L4":
        return "Low"
      case "L5":
        return "Planned"
      default:
        return level
    }
  }

  if (!tickets || tickets.length === 0) {
    return <p className="text-gray-500">No processed tickets found.</p>
  }

  return (
    <div className="flex-1 overflow-x-auto">
      <div className="overflow-y-auto border rounded-lg transition-all duration-500" style={{ maxHeight: "650px" }}>
        <table className="min-w-full bg-white shadow-md rounded-lg table-fixed">
          <thead className="bg-gray-200 sticky top-0 z-10">
            <tr>
              {[
                { key: "source", label: "Project Name" },
                { key: "ticket_id", label: "ID" },
                { key: "title", label: "Title" },
                {
                  key: "triage",
                  label: (
                    <span>
                      Triage Level <span className="text-xs text-gray-500">(AI generated)</span>
                    </span>
                  ),
                },
                {
                  key: "category",
                  label: (
                    <span>
                      Category <span className="text-xs text-gray-500">(AI generated)</span>
                    </span>
                  ),
                },
                { key: "status", label: "Status" },
                { key: "assigned_to", label: "Assigned To" },
                { key: "ticket_triage", label: "Priority" },
              ].map((col) => (
                <th key={col.key} className="px-4 py-2 text-left text-black">
                  <div className="flex items-center space-x-1">
                    <span>{col.label}</span>
                    {col.key !== "ticket_triage" && (
                      <button onClick={() => onSort(col.key)} className="text-xs text-blue-500 hover:underline">
                        {sortColumn === col.key ? (sortOrder === "asc" ? "⬆︎" : "⬇︎") : "⬇︎"}
                      </button>
                    )}
                  </div>
                </th>
              ))}
              <th className="px-4 py-2 text-left text-black">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tickets.map((ticket, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-black">{ticket.source}</td>
                <td className="px-4 py-2 text-black">{ticket.ticket_id}</td>
                <td className="px-4 py-2 text-black">{ticket.title}</td>
                <td className="px-4 py-2">
                  <span
                    data-tooltip-id={`triage-tooltip-${index}`}
                    data-tooltip-content={triageTooltips[ticket.triage]}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      ticket.triage === "L1"
                        ? "bg-red-500 text-white"
                        : ticket.triage === "L2"
                          ? "bg-orange-400 text-white"
                          : ticket.triage === "L3"
                            ? "bg-yellow-400 text-white"
                            : ticket.triage === "L4"
                              ? "bg-yellow-700 text-white"
                              : "bg-green-600 text-white"
                    }`}
                    style={{ cursor: "pointer" }}
                  >
                    {ticket.triage}
                  </span>
                  <ReactTooltip id={`triage-tooltip-${index}`} place="top" />
                </td>
                <td className="px-4 py-2 text-black">{ticket.category}</td>
                <td className="px-4 py-2 text-black">{ticket.status}</td>
                <td className="px-4 py-2 text-black">{ticket.employee_name}</td>
                <td className="px-4 py-2 text-black">{getTriageLabel(ticket.triage)}</td>
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
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("")
  const [filterValue, setFilterValue] = useState("")
  const [filterOptions, setFilterOptions] = useState({
    triage: ["L1", "L2", "L3", "L4", "L5"],
    category: [],
    status: [],
    assigned_to: [],
    source: [],
  })
  const [triageCounts, setTriageCounts] = useState([])
  const [categoryCounts, setCategoryCounts] = useState([])
  const [sortColumn, setSortColumn] = useState(null)
  const [sortOrder, setSortOrder] = useState("asc")
  const [statusCounts, setStatusCounts] = useState([])
  const [sourceCounts, setSourceCounts] = useState([])

  useEffect(() => {
    fetch("http://localhost:8000/ticket_data")
      .then((res) => res.json())
      .then((data) => {
        setTicketCount(data.ticket_count)
        setProcessedTickets(data.table_contents)
        setTicketDetails(data.details)
        setCategoryCounts(data.distinct_categories)
        setFilterOptions({
          triage: ["L1", "L2", "L3", "L4", "L5"],
          category: data.distinct_categories,
          status: data.distinct_status,
          assigned_to: data.distinct_assigned_to,
          source: data.distinct_sources,
        })
        const counts = ["L1", "L2", "L3", "L4", "L5"].map((level) => ({
          triage: level,
          count: data.table_contents.filter((ticket) => ticket.triage === level).length,
        }))
        setTriageCounts(counts)
        const statusCounts = data.distinct_status.map((status) => ({
          status,
          count: data.table_contents.filter((ticket) => ticket.status === status).length,
        }))
        setStatusCounts(statusCounts)
        const sourceCounts = data.distinct_sources.map((source) => ({
          source,
          count: data.table_contents.filter((ticket) => ticket.source === source).length,
        }))
        setSourceCounts(sourceCounts)
        const categoryCounts = data.distinct_categories.map((category) => ({
          category,
          count: data.table_contents.filter((ticket) => ticket.category === category).length,
        }))
        setCategoryCounts(categoryCounts)
      })
      .catch((error) => console.error("Error fetching ticket data:", error))
  }, [])

  const filteredAndSortedTickets = processedTickets
    .filter((ticket) => ticket.title.toLowerCase().trim().includes(searchQuery.toLowerCase().trim()))
    .filter((ticket) => {
      if (!filterType || !filterValue) return true
      const keyMap = {
        triage: "triage",
        category: "category",
        status: "status",
        assigned_to: "employee_name",
        source: "source",
      }
      return String(ticket[keyMap[filterType]]).toLowerCase() === filterValue.toLowerCase()
    })
    .sort((a, b) => {
      if (!sortColumn) return 0

      let valA, valB

      if (sortColumn === "assigned_to") {
        valA = a.employee_name?.toString().toLowerCase() || ""
        valB = b.employee_name?.toString().toLowerCase() || ""
      } else if (sortColumn === "ticket_triage") {
        valA = triageLabels[a.triage]?.toLowerCase() || ""
        valB = triageLabels[b.triage]?.toLowerCase() || ""
      } else {
        valA = a[sortColumn]?.toString().toLowerCase() || ""
        valB = b[sortColumn]?.toString().toLowerCase() || ""
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1
      if (valA > valB) return sortOrder === "asc" ? 1 : -1
      return 0
    })

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortOrder("asc")
    }
  }

  return (
    <div className="w-screen h-screen overflow-y-auto relative bg-gradient-to-br from-white to-gray-50">
      <div className="flex items-start mb-2">
        <img
          src={ISIcon}
          alt="VoltTix"
          className="h-40 w-60 object-contain"
          style={{ marginLeft: 20 }}
        />
      </div>
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-col">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <CombinedInfoCard ticketCount={ticketCount} sourceData={sourceCounts} />
          <BarChartCard title="Triage Levels" data={triageCounts} dataKeyX="triage" dataKeyY="count" />
          <StatusBarChartCard title="Ticket Statuses" data={statusCounts} dataKeyX="status" dataKeyY="count" />
          <PieChartCard title="Category Distribution" data={categoryCounts} dataKey="count" nameKey="category" />
        </div>

        <h2 className="text-xl font-semibold mb-2 text-gray-700">Ticket Details</h2>
        <div className="flex flex-wrap items-center justify-between gap-1 mb-2 bg-white p-4 rounded-xl shadow-sm">
          <div className="mb-1 flex items-center w-full sm:w-1/2 bg-white border border-gray-300 rounded-lg shadow-sm px-3 py-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-400 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search by ticket title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full focus:outline-none text-gray-800"
            />
          </div>
          <div className="flex flex-wrap gap-4 items-center mb-3">
            <select
              className="appearance-none bg-white border border-gray-300 text-black rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value)
                setFilterValue("")
              }}
            >
              <option value="">Filter by</option>
              <option value="triage">Triage</option>
              <option value="category">Category</option>
              <option value="status">Status</option>
              <option value="assigned_to">Assigned To</option>
              <option value="source">Project Name</option>
            </select>
            <select
              className="appearance-none bg-white border border-gray-300 text-black rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              disabled={!filterType}
            >
              <option value="">Select value</option>
              {filterType &&
                filterOptions[filterType]?.map((option, i) => (
                  <option key={i} value={option}>
                    {option}
                  </option>
                ))}
            </select>
          </div>
          <div className="w-full text-sm text-gray-600 ml-1">
            {filteredAndSortedTickets.length} ticket{filteredAndSortedTickets.length !== 1 ? "s" : ""} found
          </div>
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
      <div className="fixed bottom-4 right-4 z-50">
        <Chatbot />
      </div>
    </div>
  )
}