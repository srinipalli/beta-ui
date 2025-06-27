import { useNavigate } from "react-router-dom"
import GaptixLogo from '/Users/varshikank/testtt/Frontend/beta-ui-6/src/logo.jpg'; // Adjust path if your image is elsewhere in src/

function LandingPage() {
  const navigate = useNavigate()

  const handleStart = () => {
    navigate("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr min-w-screen from-blue-100 via-white to-blue-200">
      <div className="bg-white/80 backdrop-blur-md border border-blue-100 shadow-2xl rounded-3xl px-10 py-12 w-[90vw] max-w-3xl text-center">
        {/* Use the imported variable in the src */}
        <img
          src={GaptixLogo} // Use the imported variable here
          alt="GAPTix AI Desk Logo"
          className="mx-auto mb-2 w-64 h-32 object-contain"
        />
        <h1 className="text-5xl font-extrabold text-blue-800 mb-4 tracking-tight">
          GAPTix AI Desk
        </h1>
        <p className="text-lg text-gray-700 mb-8 max-w-xl mx-auto">
          Your intelligent support ticket dashboard with smart summaries, duplication detection,
          RAG-based insights, and AI-powered routing.
        </p>
        <button
          onClick={handleStart}
          className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-medium py-3 px-8 rounded-xl shadow-md transition duration-200 hover:shadow-lg"
        >
          Launch Dashboard 
        </button>
      </div>
    </div>
  )
}

export default LandingPage