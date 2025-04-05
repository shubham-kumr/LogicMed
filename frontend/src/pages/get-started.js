import Link from "next/link"
import { Stethoscope, Building2, ArrowRight } from "lucide-react"

export default function GetStarted() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white relative overflow-hidden">
      {/* Background gradient similar to landing page */}
      <div className="absolute inset-0 bg-emerald-950/5">
        <div className="absolute inset-0 opacity-10">
          <GradientBackground />
        </div>
      </div>

      <div className="max-w-4xl w-full mx-auto px-6 py-12 relative z-10">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <LogicMedLogo size="medium" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Welcome to LogicMed</h1>
          <p className="text-gray-600 text-lg max-w-xl mx-auto">
            Select your role to access the appropriate dashboard and features
          </p>
        </div>

        <div className="grid md:grid-rows-2 gap-8">
          {/* Physician Card */}
          <Link href="/doctor" className="block">
            <div className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
              <div className="p-8">
                <div className="w-16 h-16 bg-emerald-100 rounded-lg flex items-center justify-center mb-6">
                  <Stethoscope className="w-8 h-8 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-3">Doctor Portal</h2>
                <p className="text-gray-600 mb-6">
                  Access patient medical records, review diagnostic data, and manage treatment plans with AI-assisted
                  insights.
                </p>
                <div className="flex items-center text-emerald-600 font-medium group-hover:text-emerald-700 transition-colors">
                  Continue as Doctor
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
              <div className="h-1.5 w-full bg-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
            </div>
          </Link>

          {/* Administrator Card */}
          <Link href="/admin" className="block">
            <div className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
              <div className="p-8">
                <div className="w-16 h-16 bg-emerald-100 rounded-lg flex items-center justify-center mb-6">
                  <Building2 className="w-8 h-8 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-3">Administrator Portal</h2>
                <p className="text-gray-600 mb-6">
                  Manage healthcare data systems, analyze operational metrics, and oversee clinical workflows with
                  advanced analytics.
                </p>
                <div className="flex items-center text-emerald-600 font-medium group-hover:text-emerald-700 transition-colors">
                  Continue as Administrator
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
              <div className="h-1.5 w-full bg-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
            </div>
          </Link>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            Need help?{" "}
            <a href="#" className="text-emerald-600 hover:text-emerald-700 transition-colors">
              Contact technical support
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

// LogicMed Logo Component
const LogicMedLogo = ({ size = "default" }) => {
  const sizeClasses = {
    default: "w-8 h-8",
    medium: "w-12 h-12",
    large: "w-16 h-16 md:w-24 md:h-24",
  }

  return (
    <div className={`relative ${sizeClasses[size]}`}>
      <div className="flex items-center justify-center h-full">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path d="M12 2L20 7V17L12 22L4 17V7L12 2Z" fill="#10B981" className="text-emerald-500" />
          <path d="M12 6V12H18V16H8V6H12Z" fill="white" />
        </svg>
      </div>
    </div>
  )
}

// Gradient Background Component
const GradientBackground = () => (
  <div className="w-full h-full">
    <svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#065F46" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      <g transform="rotate(45 50 50)">
        {Array.from({ length: 10 }).map((_, i) => (
          <rect key={i} x="-50" y={-10 + i * 20} width="200" height="10" fill="url(#greenGradient)" />
        ))}
      </g>
    </svg>
  </div>
)

