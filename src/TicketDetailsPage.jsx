import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { HelpCircle, FileText, Zap, Lightbulb, Calendar, Gauge, Tag, CheckCircle, User, ArrowLeft } from 'lucide-react'

// A custom component for the "AI Generated" icon with a gradient background
const AiGeneratedIcon = () => (
    <span className="ml-2 px-2 py-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold rounded-full flex items-center shadow-lg">
        AI Generated
    </span>
)

function TicketDetails({ ticket }) {
    const [showTriageReason, setShowTriageReason] = useState(false)
    const [showCategoryReason, setShowCategoryReason] = useState(false)
    const [editMode, setEditMode] = useState(false)
    const [saving, setSaving] = useState(false)

    const [formData, setFormData] = useState({
        triage: ticket.ticket_triage,
        status: ticket.ticket_status,
        category: ticket.ticket_category
    })

    const [options, setOptions] = useState({
        triages: [],
        categories: [],
        statuses: []
    })

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const res = await axios.get("http://localhost:8000/ticket_data")
                setOptions({
                    triages: res.data.distinct_triages || [],
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
                triage: formData.triage,
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
            triage: ticket.ticket_triage,
            status: ticket.ticket_status,
            category: ticket.ticket_category
        })
        setEditMode(false)
    }

    // Helper component for content boxes with icons
    const ContentBox = ({ title, children, showHelp = false, onHelpClick, helpText, icon: Icon, aiIcon }) => (
        <div className="bg-gray-100 p-6 rounded-lg shadow-sm">
            <div className="flex items-center mb-2">
                {Icon && <Icon className="mr-3 text-gray-700" size={24} />}
                <h3 className="text-2xl font-extrabold text-gray-800">{title}</h3>
                {aiIcon && <AiGeneratedIcon />}
                {showHelp && (
                    <button onClick={onHelpClick} className="ml-2">
                        <HelpCircle size={18} className="text-gray-500 hover:text-gray-700" />
                    </button>
                )}
            </div>
            {children}
            {showHelp && helpText && (
                <p className="mt-2 text-gray-600 text-sm">{helpText}</p>
            )}
        </div>
    )

    return (
        <div className="w-full min-h-screen px-8 py-12 bg-gray-50">
            <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl p-10 space-y-12">
                {/* Top bar */}
                <div className="flex justify-between items-center">
                    {/* Ticket ID is the main title, make it prominent */}
                    <h2 className="text-5xl font-extrabold text-gray-800">
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
                    <div className="space-y-8">
                        {/* Modified: Added FileText icon */}
                        <ContentBox title="Ticket Title" icon={FileText}>
                            <p className="text-xl text-gray-800">{ticket.ticket_title}</p>
                        </ContentBox>

                        {/* Modified: Added Zap icon and aiIcon prop */}
                        <ContentBox title="Summary" icon={Zap} aiIcon={true}>
                            <p className="text-lg text-gray-700">{ticket.ticket_summary || <em className="text-gray-400">Not available</em>}</p>
                        </ContentBox>

                        {/* Modified: Added Lightbulb icon and aiIcon prop */}
                        <ContentBox title="Suggested Solution" icon={Lightbulb} aiIcon={true}>
                            <p className="text-lg text-gray-700">{ticket.ticket_solution || <em className="text-gray-400">Not available</em>}</p>
                        </ContentBox>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="space-y-8">
                        {/* Modified: Added Calendar icon */}
                        <ContentBox title="Reported Date" icon={Calendar}>
                            <p className="text-lg text-gray-800">{ticket.ticket_reported_date}</p>
                        </ContentBox>

                        <ContentBox
                            title="Triage Level"
                            icon={Gauge}
                            aiIcon={true}
                            showHelp={true}
                            onHelpClick={() => setShowTriageReason(!showTriageReason)}
                            helpText={showTriageReason ? ticket.ticket_triage_reason : ''}
                        >
                            <div className="flex items-center space-x-3">
                                {editMode ? (
                                    <select
                                        value={formData.triage}
                                        onChange={(e) => handleChange("triage", e.target.value)}
                                        className="appearance-none bg-white border border-gray-300 text-black rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {options.triages.map((p) => (
                                            <option key={p} value={p}>{p}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <span className="px-4 py-1 rounded-full text-lg font-semibold bg-blue-500 text-white">
                                        {formData.triage}
                                    </span>
                                )}
                            </div>
                        </ContentBox>

                        <ContentBox
                            title="Assigned Category"
                            icon={Tag}
                            aiIcon={true}
                            showHelp={true}
                            onHelpClick={() => setShowCategoryReason(!showCategoryReason)}
                            helpText={showCategoryReason ? ticket.ticket_category_reason : ''}
                        >
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
                                    <span className="px-4 py-1 rounded-full text-lg font-semibold bg-green-500 text-white">
                                        {formData.category}
                                    </span>
                                )}
                            </div>
                        </ContentBox>

                        <ContentBox title="Status" icon={CheckCircle}>
                            {editMode ? (
                                <select
                                    value={formData.status}
                                    onChange={(e) => handleChange("status", e.target.value)}
                                    className="appearance-none bg-white border border-gray-300 text-black rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                                >
                                    {options.statuses.map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            ) : (
                                <p className="text-lg text-gray-800">{formData.status}</p>
                            )}
                        </ContentBox>

                        <ContentBox title="Assigned Employee" icon={User}>
                            <p className="text-lg text-gray-800">{ticket.ticket_assigned_employee}</p>
                        </ContentBox>
                    </div>
                </div>

                {/* FULL WIDTH - DESCRIPTION */}
                <ContentBox title="Ticket Description" icon={FileText}>
                    <p className="text-lg text-gray-700 whitespace-pre-line">
                        {ticket.ticket_description || <em className="text-gray-400">Not available</em>}
                    </p>
                </ContentBox>
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
                {/* MODIFIED: Added a div to act as the container box with hover effect */}
                <div className="inline-block mb-6 rounded-lg overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center px-4 py-2 bg-gray-100 rounded-lg text-black font-semibold hover:bg-gray-200 transition-colors"
                    >
                        <ArrowLeft size={18} className="mr-2" />
                        Back to Dashboard
                    </button>
                </div>
                <TicketDetails ticket={ticket} />
            </div>
        </div>
    )
}