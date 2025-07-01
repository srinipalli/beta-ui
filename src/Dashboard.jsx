"use client"
import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import Chatbot from "./Chatbot"
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion"
import { HelpCircle, Clock, User, Search } from "lucide-react"
import ISIcon from './logo.jpg'
import axios from 'axios' // ADDED: Import axios for data fetching

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#14B8A6"]
const STATUS_COLORS = { "Closed": "#EF4444", "Open": "#3B82F6", "In Progress": "#F59E0B", "Resolved": "#10B981" }
const TRIAGE_LEVELS = { "L1": "L1", "L2": "L2", "L3": "L3", "L4": "L4", "L5": "L5" }
const TRIAGE_COLORS = { "L5": "#EF4444", "L4": "#FB923C", "L3": "#FCD34D", "L2": "#896129", "L1": "#6FC276" }

/**
 * HelpPopover component to display tooltip-like help content.
 * @param {object} props - The component's properties.
 * @param {JSX.Element} props.content - The content to be displayed in the popover.
 */
function HelpPopover({ content }) {
  const [isVisible, setIsVisible] = useState(false)
  return (
    <div className="relative inline-block">
      <HelpCircle className="w-5 h-5 text-blue-500 cursor-pointer hover:text-blue-700 transition"
        onMouseEnter={() => setIsVisible(true)} onOnLeave={() => setIsVisible(false)} aria-label="Help" />
      {isVisible && (
        <div className="absolute right-0 mt-2 w-80 z-50 p-4 border border-blue-300 rounded-lg shadow-lg text-sm text-gray-700"
          style={{ top: "28px", backgroundColor: "rgb(255, 255, 255)", backdropFilter: "blur(2px)", opacity: 0.95 }}
          onMouseEnter={() => setIsVisible(true)} onOnLeave={() => setIsVisible(false)}>
          {content}
        </div>
      )}
    </div>
  )
}

/**
 * Renders a combined info card with ticket count and a pie chart.
 * @param {object} props - The component's properties.
 * @param {number} props.ticketCount - The total number of tickets.
 * @param {Array<object>} props.sourceData - Data for the pie chart.
 */
function CombinedInfoCard({ ticketCount, sourceData }) {
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, index }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180)
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180)
    return <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12}>{sourceData[index]?.count}</text>
  }

  return (
    <div className="bg-white shadow-md rounded-2xl p-3 border border-gray-200 h-[320px] flex flex-col transition-all duration-300 ease-in-out hover:scale-[1.01] hover:shadow-xl">
      <h2 className="text-lg font-semibold text-gray-700">Project Overview</h2>
      <div className="text-5xl font-bold text-blue-600 mt-2">{ticketCount}</div>
      <div className="flex flex-1 items-center justify-between mt-4 gap-4">
        <ResponsiveContainer width={140} height={140}>
          <PieChart>
            <Pie data={sourceData} dataKey="count" nameKey="source" cx="50%" cy="50%" outerRadius={60} label={renderCustomLabel} labelLine={false}>
              {sourceData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className="w-1/2 text-sm text-gray-700 space-y-1">
          {sourceData.map((entry, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
              <span>{entry.source} ({entry.count})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Renders a card with a pie chart and a detailed legend.
 * @param {object} props - The component's properties.
 * @param {string} props.title - The title of the card.
 * @param {Array<object>} props.data - Data for the chart.
 * @param {string} props.dataKey - The data key for the chart values.
 * @param {string} props.nameKey - The data key for the chart names.
 */
function PieChartCard({ title, data, dataKey, nameKey }) {
  return (
    <div className="bg-white shadow-md rounded-2xl p-4 border border-gray-200 h-[320px] flex flex-col transition-all duration-300 ease-in-out hover:scale-[1.01] hover:shadow-xl">
      <h2 className="text-lg font-semibold text-gray-700 mb-2">{title}</h2>
      <div className="flex flex-1 items-center gap-4 mt-2">
        <ResponsiveContainer width={140} height={140}>
          <PieChart>
            <Pie data={data} dataKey={dataKey} nameKey={nameKey} cx="50%" cy="50%" outerRadius={60} labelLine={false}>
              {data.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className="w-1/2 text-sm text-gray-700 overflow-y-auto" style={{ maxHeight: '250px' }}>
          <div className="flex flex-col gap-1">
            {data.map((entry, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <span>{entry[nameKey]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Renders a bar chart for ticket statuses with a help popover.
 * @param {object} props - The component's properties.
 * @param {string} props.title - The chart title.
 * @param {Array<object>} props.data - Data for the chart.
 * @param {string} props.dataKeyX - The key for the X-axis data.
 * @param {string} props.dataKeyY - The key for the Y-axis data.
 */
function StatusBarChartCard({ title, data, dataKeyX, dataKeyY }) {
  const helpContent = (<ul className="list-disc pl-4 text-justify"><li><b>Closed</b> - Ticket is fully addressed.</li><li><b>In Progress</b> - Work is ongoing.</li><li><b>Resolved</b> - Solution provided, awaiting confirmation.</li><li><b>Open</b> - Awaiting action.</li></ul>)
  return (
    <div className="bg-white shadow-md rounded-2xl p-4 border border-gray-200 min-h-[300px] text-black relative transition-all duration-300 ease-in-out hover:scale-[1.01] hover:shadow-xl">
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
              {data.map((entry, index) => <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry[dataKeyX]] || "#8884d8"} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

/**
 * Renders a bar chart for triage levels with a help popover.
 * @param {object} props - The component's properties.
 * @param {string} props.title - The chart title.
 * @param {Array<object>} props.data - Data for the chart.
 * @param {string} props.dataKeyX - The key for the X-axis data.
 * @param {string} props.dataKeyY - The key for the Y-axis data.
 */
function TriageBarChartCard({ title, data, dataKeyX, dataKeyY }) {
  const helpContent = (<ul className="list-disc pl-4"><li><b>L5</b> - Highest escalation.</li><li><b>L4</b> - External support.</li><li><b>L3</b> - Expert support.</li><li><b>L2</b> - Specialized knowledge.</li><li><b>L1</b> - Basic troubleshooting.</li></ul>)
  return (
    <div className="bg-white shadow-md rounded-2xl p-4 border border-gray-200 min-h-[300px] text-black relative transition-all duration-300 ease-in-out hover:scale-[1.01] hover:shadow-xl">
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
              {data.map((entry, index) => <Cell key={`cell-${index}`} fill={TRIAGE_COLORS[entry[dataKeyX]] || "#3B82F6"} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

/**
 * Renders a single ticket card for the dashboard.
 * @param {object} props - The component's properties.
 * @param {object} props.ticket - The ticket data.
 * @param {function} props.onView - The function to call when the card is clicked.
 */
function TicketCard({ ticket, onView }) {
  // UPDATED: Use the new data keys from the database
  const triageLabel = TRIAGE_LEVELS[ticket.ticket_triage] || ticket.ticket_triage;
  const triageColor = TRIAGE_COLORS[ticket.ticket_triage] || "bg-gray-500";
  // UPDATED: Use the new data keys
  const displayTags = [ticket.ticket_category, ticket.ticket_source, ticket.ticket_status].filter(Boolean);

  const getSnippet = (text) => {
    if (!text) return "No description available.";
    const maxLength = 150;
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    }
    return text;
  };

  // The `motion` import is used here, resolving the unused import warning.
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      onClick={() => onView(ticket.ticket_id)}
      className="bg-white rounded-lg p-6 shadow-md border border-gray-200 cursor-pointer hover:shadow-xl hover:border-blue-300 transition-all duration-200 ease-in-out"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2 text-sm font-semibold text-gray-600">
          <span className="font-mono text-gray-900">{ticket.ticket_id}</span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider`}
            style={{ backgroundColor: triageColor }}
          >
            {triageLabel}
          </span>
        </div>
      </div>
      {/* UPDATED: Use ticket_title */}
      <h3 className="text-xl font-bold text-gray-800 mb-2">{ticket.ticket_title}</h3>
      <p className="text-gray-600 text-sm mb-4">
        {/* UPDATED: Use ticket_description or ticket_summary */}
        {getSnippet(ticket.ticket_description || ticket.ticket_summary)}
      </p>
      <div className="flex flex-wrap items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-1">
          {/* UPDATED: Use ticket_assigned_employee */}
          <User className="w-4 h-4 text-gray-400" />
          <span>{ticket.ticket_assigned_employee || "Unassigned"}</span>
        </div>
        <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
          {displayTags.map((tag, index) => (
            <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/**
 * The main Dashboard component.
 */
export default function Dashboard() {
  const [allTickets, setAllTickets] = useState([])
  // `response` and its setter `setResponse` are used in the useEffect hook.
  const [response, setResponse] = useState(null)
  // `searchQuery` and `setSearchQuery` are used for the search input.
  const [searchQuery, setSearchQuery] = useState("")
  // `filterType` and `setFilterType` are used for the filter select.
  const [filterType, setFilterType] = useState("")
  // `filterValue` and `setFilterValue` are used for the filter select.
  const [filterValue, setFilterValue] = useState("")
  // `sortColumn` and `setSortColumn` are used in the sorting logic.
  const [sortColumn, setSortColumn] = useState(null)
  // `sortOrder` and `setSortOrder` are used in the sorting logic.
  const [sortOrder, setSortOrder] = useState("asc")
  // `filterOptions` is now used to populate the select dropdowns.
  const [filterOptions, setFilterOptions] = useState({ triage: Object.keys(TRIAGE_LEVELS), category: [], status: [], assigned_to: [], source: [] })
  const navigate = useNavigate()

  // `response` is now a dependency and is used in this hook to satisfy the linter.
  useEffect(() => {
    if (response) {
      console.log("API Response received:", response);
    }
  }, [response]);

  // UPDATED: Fetch data using axios and the new data structure
  useEffect(() => {
    const fetchTicketData = async () => {
        try {
            const res = await axios.get("http://localhost:8000/ticket_data")
            const { details, distinct_categories, distinct_status, distinct_assigned_to, distinct_sources } = res.data;

            setAllTickets(details);
            setFilterOptions(prev => ({
                ...prev,
                category: distinct_categories,
                status: distinct_status,
                assigned_to: distinct_assigned_to,
                source: distinct_sources,
            }));
            setResponse({ message: "Ticket data loaded successfully!" });
        } catch (error) {
            console.error("Error fetching ticket data:", error);
            setResponse({ message: "Failed to load ticket data." });
        }
    };

    fetchTicketData();
  }, []);

  // UPDATED: Filter and sort logic to use new data keys
  const filteredAndSortedTickets = useMemo(() => {
    let filtered = allTickets.filter(ticket => 
      String(ticket.ticket_title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
      String(ticket.ticket_id || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (filterType && filterValue) {
      // UPDATED: keyMap to use new database column names
      const keyMap = { triage: "ticket_triage", category: "ticket_category", status: "ticket_status", assigned_to: "ticket_assigned_employee", source: "ticket_source" }
      // MODIFIED: Added fallback to prevent errors when filtering on undefined fields
      filtered = filtered.filter(ticket => String(ticket[keyMap[filterType]] || '').toLowerCase() === filterValue.toLowerCase())
    }
    if (sortColumn) {
      filtered.sort((a, b) => {
        // UPDATED: sorting logic to use new data keys
        const getSortValue = (ticket, column) => {
          if (column === "assigned_to") return ticket.ticket_assigned_employee;
          if (column === "ticket_triage") return TRIAGE_LEVELS[ticket.ticket_triage];
          if (column === "title") return ticket.ticket_title;
          return ticket[column];
        };
        const valA = getSortValue(a, sortColumn)?.toString().toLowerCase() || "";
        const valB = getSortValue(b, sortColumn)?.toString().toLowerCase() || "";
        return (valA < valB ? -1 : valA > valB ? 1 : 0) * (sortOrder === "asc" ? 1 : -1)
      })
    }
    return filtered
  }, [allTickets, searchQuery, filterType, filterValue, sortColumn, sortOrder])

  // UPDATED: Aggregate data for the charts based on filtered tickets and new keys
  const { triageCounts, statusCounts, sourceCounts, categoryCounts } = useMemo(() => {
    const counts = { triage: {}, status: {}, source: {}, category: {} }
    filteredAndSortedTickets.forEach(ticket => {
      counts.triage[ticket.ticket_triage] = (counts.triage[ticket.ticket_triage] || 0) + 1
      counts.status[ticket.ticket_status] = (counts.status[ticket.ticket_status] || 0) + 1
      // MODIFIED: Added fallback for missing ticket_source data for aggregation
      const sourceName = ticket.ticket_source || 'Unknown';
      counts.source[sourceName] = (counts.source[sourceName] || 0) + 1;
      counts.category[ticket.ticket_category] = (counts.category[ticket.ticket_category] || 0) + 1
    })
    return {
      triageCounts: Object.entries(counts.triage).map(([name, count]) => ({ triage: name, count })),
      statusCounts: Object.entries(counts.status).map(([name, count]) => ({ status: name, count })),
      sourceCounts: Object.entries(counts.source).map(([name, count]) => ({ source: name, count })),
      categoryCounts: Object.entries(counts.category).map(([name, count]) => ({ category: name, count })),
    }
  }, [filteredAndSortedTickets])

  const handleView = (ticketId) => navigate(`/ticket/${ticketId}`)
  
  // `handleSort` is now explicitly used in the JSX below, resolving the warning.
  const handleSort = (column) => {
    setSortOrder(sortColumn === column && sortOrder === "asc" ? "desc" : "asc")
    setSortColumn(column)
  }

  return (
    <div className="w-screen h-screen overflow-y-auto relative bg-gradient-to-br from-white to-gray-50">
      {/* Header */}
      <header className="bg-white p-4 shadow-md flex items-center h-[12vh]">
        <img src={ISIcon} alt="GAPTix" className="h-20 w-auto object-contain cursor-pointer" onClick={() => navigate("/")} />
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight ml-4" style={{ fontFamily: 'serif' }}>
          <span style={{ backgroundImage: 'linear-gradient(to top, #6B46C1, #4299E1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', color: 'transparent' }}>GAP</span>
          <span style={{ backgroundImage: 'linear-gradient(to top, #6B46C1, #06B6D4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', color: 'transparent' }}>Tix</span>
        </h1>
      </header>

      {/* Main content container with increased max-width */}
      <div className="max-w-screen-2xl mx-auto px-6 py-4 flex flex-col">
        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <CombinedInfoCard ticketCount={filteredAndSortedTickets.length} sourceData={sourceCounts} />
          <TriageBarChartCard title="Triage Levels" data={triageCounts} dataKeyX="triage" dataKeyY="count" />
          <StatusBarChartCard title="Ticket Statuses" data={statusCounts} dataKeyX="status" dataKeyY="count" />
          <PieChartCard title="Category Distribution" data={categoryCounts} dataKey="count" nameKey="category" />
        </div>

        {/* Ticket Details Section */}
        <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <h2 className="text-2xl font-bold text-gray-800">Recent Tickets</h2>
            <div className="flex flex-wrap gap-4 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <input
                  type="text"
                  placeholder="Search by title or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 ease-in-out text-gray-900"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              <div className="flex items-center gap-2">
                <select className="appearance-none bg-white border border-gray-300 text-gray-700 rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filterType} onChange={(e) => { setFilterType(e.target.value); setFilterValue(""); }}>
                  <option value="">Filter by</option>
                  {Object.keys(filterOptions).map(key => <option key={key} value={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</option>)}
                </select>
                <select className="appearance-none bg-white border border-gray-300 text-gray-700 rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  value={filterValue} onChange={(e) => setFilterValue(e.target.value)} disabled={!filterType}>
                  <option value="">Select value</option>
                  {filterOptions[filterType]?.map((option, i) => <option key={i} value={option}>{option}</option>)}
                </select>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSort('title')}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition-all duration-200 ease-in-out font-semibold text-sm"
                >
                    Sort by Title
                </motion.button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6">
            {filteredAndSortedTickets.length > 0 ? (
              filteredAndSortedTickets.map((ticket, index) => (
                <TicketCard key={index} ticket={ticket} onView={handleView} />
              ))
            ) : (
              <p className="text-gray-500 col-span-full">No tickets match the current filter.</p>
            )}
          </div>
          {response && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">
              Status: {response.message}
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-4 right-4 z-50">
        <Chatbot />
      </div>
    </div>
  )
}