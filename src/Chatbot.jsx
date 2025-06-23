import { useState, useEffect } from 'react'
import axios from 'axios'
import { MessageCircle } from 'lucide-react'

// 🔐 Generate or reuse session ID
const getSessionId = () => {
  const stored = localStorage.getItem('chat_session_id')
  if (stored) return stored
  const newId = crypto.randomUUID()
  localStorage.setItem('chat_session_id', newId)
  return newId
}

export default function Chatbot() {
  const [sessionId] = useState(getSessionId())
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])

  // 🔁 Fetch chat history on open
  useEffect(() => {
    if (!open) return
    axios
      .get('http://127.0.0.1:8000/chat/history', {
        params: { session_id: sessionId },
      })
      .then((res) => {
        if (Array.isArray(res.data.history)) {
          const formatted = res.data.history.map((msg) => ({
            sender: msg.sender,
            text: msg.content,
          }))
          setMessages(formatted)
        }
      })
      .catch((err) => {
        console.error('❌ Error fetching history:', err)
      })
  }, [open, sessionId])

  // 🔽 Scroll to bottom on new messages
  useEffect(() => {
    const el = document.querySelector('.chat-scroll')
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!query.trim()) return

    const userMsg = { sender: 'user', text: query }
    setMessages((prev) => [...prev, userMsg])
    setLoading(true)
    setQuery('')

    try {
      const res = await axios.post('http://127.0.0.1:8000/chat', {
        user_query: query,
        session_id: sessionId,
      })

      const botReply = {
        sender: 'bot',
        text: res.data.response || '🤖 No response',
      }
      setMessages((prev) => [...prev, botReply])
    } catch (error) {
      console.error('❌ Error contacting server:', error)
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: '⚠️ Error contacting server.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!open ? (
        <button
          className="w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center"
          onClick={() => setOpen(true)}
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      ) : (
        <div className="w-80 h-[500px] p-4 bg-white border border-gray-200 rounded-2xl shadow-2xl flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-bold text-gray-800">💬 Ticket Chatbot</h2>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-gray-600 text-sm"
            >
              ✖
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-2 mb-3 chat-scroll">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                  msg.sender === 'user'
                    ? 'bg-blue-100 text-blue-900 ml-auto rounded-br-none'
                    : 'bg-gray-200 text-gray-900 mr-auto rounded-bl-none'
                }`}
              >
                {msg.text}
              </div>
            ))}
            {loading && (
              <div className="text-sm italic text-gray-500">Typing...</div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-2 mt-auto">
            <input
              type="text"
              placeholder="Ask something..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition disabled:opacity-50"
            >
              {loading ? 'Thinking...' : 'Ask'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
