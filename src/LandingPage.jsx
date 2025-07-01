import { useNavigate } from "react-router-dom";
import GaptixLogo from '/Users/varshikank/testtt/Frontend/beta-ui-6/src/logo.jpg';

// Placeholder icons (replace with your actual icons)
const IconSummary = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const IconRAG = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.5l8 4.5v9L12 21l-8-4.5v-9L12 6.5z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.5v9m-4-4.5l8 4.5m-8-9l8 4.5" />
  </svg>
);

const IconRouting = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 10l-4 4 4 4" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 12a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

function LandingPage() {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate("/dashboard");
  };


  return (
    <div className="relative min-h-screen bg-gradient-to-tr from-blue-100 via-white to-blue-200 overflow-y-auto scroll-smooth">
      {/* Sticky Navbar */}
      <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-lg shadow-lg py-4 px-8 flex justify-between items-center transition-all duration-300">
        <div className="flex items-center space-x-4">
          <img
            src={GaptixLogo}
            alt="GAPTix AI Desk Logo"
            className="w-12 h-12 object-contain"
          />
          <span className="text-2xl font-bold text-blue-800">GAPTix AI Desk</span>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleStart}
            className="hidden md:block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition duration-200"
          >
            Launch Dashboard
          </button>
        </div>
      </nav>

      {/* Hero Section - True Full-Screen Content */}
      <div id="hero" className="min-h-screen flex items-center justify-center p-8">
  <div className="bg-white/80 backdrop-blur-md border border-blue-100 shadow-2xl rounded-3xl p-10 md:p-16 w-full max-w-4xl mx-auto text-center">
    <img
      src={GaptixLogo}
      alt="GAPTix AI Desk Logo"
      className="mx-auto mb-4 w-64 h-32 object-contain"
    />
    <h1 className="text-5xl md:text-7xl font-extrabold text-blue-800 mb-6 tracking-tight">
      GAPTix AI Desk
    </h1>
    <p className="text-lg md:text-2xl text-gray-700 mb-10 leading-relaxed">
      Your intelligent support ticket dashboard with smart summaries, duplication detection,
      RAG-based insights, and AI-powered routing.
    </p>
    <button
      onClick={handleStart}
      className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-4 px-12 rounded-xl shadow-lg transition duration-300 transform hover:scale-105"
    >
      Launch Dashboard
    </button>
  </div>
</div>


      {/* About Section - True Full-Screen Content */}
      <section id="about" className="py-20 px-8 bg-white/90 backdrop-blur-lg w-full">
        <div className="w-full mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-blue-800 mb-6">
            What is GAPTix AI Desk?
          </h2>
          <p className="text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
            GAPTix AI Desk is a cutting-edge support ticket management platform designed to
            streamline your workflow and supercharge your team's efficiency. By leveraging
            the power of advanced AI, it automates mundane tasks, provides instant insights,
            and ensures every ticket is handled with precision and speed.
          </p>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-12 text-left px-8">
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-blue-100 transform transition duration-300 hover:scale-105">
              <h3 className="text-2xl font-bold text-blue-700 mb-4">Empower Your Agents</h3>
              <p className="text-gray-600 leading-relaxed">
                Our AI provides your support agents with instant summaries of complex tickets,
                suggested responses based on your knowledge base, and automated routing, freeing
                them up to focus on high-impact customer interactions.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-blue-100 transform transition duration-300 hover:scale-105">
              <h3 className="text-2xl font-bold text-blue-700 mb-4">Enhance Customer Satisfaction</h3>
              <p className="text-gray-600 leading-relaxed">
                With faster response times, accurate information, and proactive issue detection,
                GAPTix AI Desk helps you resolve customer queries more effectively, leading to
                happier customers and a stronger brand reputation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Centered content */}
      <section id="features" className="py-20 px-8 bg-white w-full">
        <div className="w-full mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-blue-800 mb-12">
            Key Features
          </h2>
          {/* This div is now centered using mx-auto */}
          <div className="max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 px-8">
            {/* Feature 1: Smart Summaries */}
            <div className="flex flex-col items-center bg-blue-50 p-8 rounded-2xl shadow-lg border border-blue-100 transform transition duration-300 hover:scale-105">
              <div className="mb-4">
                <IconSummary />
              </div>
              <h3 className="text-xl font-bold text-blue-700 mb-3">Smart Summaries</h3>
              <p className="text-gray-600 text-center">
                Get instant, concise summaries of long email threads and ticket histories, saving your agents valuable time.
              </p>
            </div>
            {/* Feature 3: RAG-based Insights */}
            <div className="flex flex-col items-center bg-blue-50 p-8 rounded-2xl shadow-lg border border-blue-100 transform transition duration-300 hover:scale-105">
              <div className="mb-4">
                <IconRAG />
              </div>
              <h3 className="text-xl font-bold text-blue-700 mb-3">RAG-based Insights</h3>
              <p className="text-gray-600 text-center">
                Access relevant knowledge base articles and FAQs based on ticket content, powered by Retrieval-Augmented Generation.
              </p>
            </div>
            {/* Feature 4: AI-powered Routing */}
            <div className="flex flex-col items-center bg-blue-50 p-8 rounded-2xl shadow-lg border border-blue-100 transform transition duration-300 hover:scale-105">
              <div className="mb-4">
                <IconRouting />
              </div>
              <h3 className="text-xl font-bold text-blue-700 mb-3">AI-powered Routing</h3>
              <p className="text-gray-600 text-center">
                Intelligently route tickets to the right team or agent based on their content, priority, and expertise.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section - Full width content */}
      <section id="cta" className="py-20 px-8 bg-blue-700 text-white w-full">
        <div className="w-full mx-auto text-center">
          <h2 className="text-4xl font-extrabold mb-6">
            Ready to revolutionize your support?
          </h2>
          <p className="text-lg md:text-xl mb-10 text-blue-100 max-w-2xl mx-auto">
            Join the GAPTix AI Desk community and experience the future of support ticket management.
          </p>
          <button
            onClick={handleStart}
            className="bg-white hover:bg-gray-100 text-blue-800 text-lg font-bold py-4 px-12 rounded-xl shadow-lg transition duration-300 transform hover:scale-105"
          >
            Launch Dashboard
          </button>
        </div>
      </section>

      {/* Footer - Full width content */}
      <footer className="bg-blue-900 text-white py-8 px-8 text-center w-full">
        <div className="w-full mx-auto">
          <p>&copy; 2025 GAPTix AI Desk. All rights reserved.</p>
          <div className="mt-4 text-sm text-blue-200">
            <a href="#" className="hover:underline mx-2">Privacy Policy</a> |
            <a href="#" className="hover:underline mx-2">Terms of Service</a> |
            <a href="#" className="hover:underline mx-2">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;