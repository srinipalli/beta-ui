import { useState } from 'react'
import axios from 'axios'
import { MessageCircle } from 'lucide-react'

export default function Chatbot() {
  const [query, setQuery] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false) // toggle chat window

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setResponse('')

    try {
      const res = await axios.get('http://127.0.0.1:8000/chat', {
        params: { user_query: query },
      })
      setResponse(res.data.response || res.data.error || 'No response')
    } catch (error) {
      console.error('Chatbot request error:', error)
      setResponse('Error contacting server')
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
        <div className="w-80 p-4 bg-white border border-gray-200 rounded-2xl shadow-2xl">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-bold text-gray-800">💬 Ticket Chatbot</h2>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-gray-600 text-sm"
            >
              ✖
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
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
          <div className="mt-3">
            <h3 className="text-sm font-semibold text-gray-700 mb-1">Response:</h3>
            <div className="bg-gray-100 p-3 rounded-xl text-gray-800 text-sm whitespace-pre-wrap min-h-[60px]">
              {response || 'No answer yet.'}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
