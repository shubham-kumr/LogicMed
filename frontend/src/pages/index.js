"use client"

import React from "react"
import { ChevronRight, Menu, X, Activity, Stethoscope, Database } from "lucide-react"

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const [scrollPosition, setScrollPosition] = React.useState(0)

  React.useEffect(() => {
    const handleScroll = () => setScrollPosition(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* Dynamic Navigation */}
      <nav
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
          scrollPosition > 10 ? "bg-white/90 backdrop-blur-lg shadow-md" : "bg-white"
        } rounded-full w-[95%] max-w-screen-xl`}
      >
        <div className="max-w-screen-xl mx-auto px-4">
          <div
            className={`flex items-center justify-between ${
              scrollPosition > 10 ? "h-14" : "h-14"
            } transition-all duration-300`}
          >
            {/* LogicMed Logo */}
            <div className="flex items-center space-x-2">
              <LogicMedLogo />
              <span className="font-bold text-xl text-gray-800">LogicMed</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-4">
              {/* <a href="#features" className="text-gray-600 hover:text-emerald-500 px-3 py-1 rounded-lg transition">
                Features
              </a> */}
              <a href="#solution" className="text-gray-600 hover:text-emerald-500 px-3 py-1 rounded-lg transition">
                Solutions
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-emerald-500 px-3 py-1 rounded-lg transition">
                Pricing
              </a>
              <a
                href="get-started"
                className="ml-4 px-4 py-1.5 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-all flex items-center"
              >
                Get Started
                <ChevronRight className="ml-2 w-4 h-4" />
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 rounded-lg transition">
              {isMenuOpen ? <X className="w-5 h-5 text-gray-600" /> : <Menu className="w-5 h-5 text-gray-600" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/10 backdrop-blur-sm pt-20">
          <div className="mx-4 bg-white rounded-xl shadow-xl border">
            <div className="p-2 space-y-1 text-black">
              {/* <a href="#features" className="block px-4 py-3 rounded-lg hover:bg-gray-50">
                Features
              </a> */}
              <a href="#solution" className="block px-4 py-3 rounded-lg hover:bg-gray-50">
                Solutions
              </a>
              <a href="#pricing" className="block px-4 py-3 rounded-lg hover:bg-gray-50">
                Pricing
              </a>
              <div className="p-2">
                <a
                  href="#get-started"
                  className="block w-full px-4 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 text-center"
                >
                  Get Started
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section with LogicMed Gradient Background */}
      <section className="relative min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-emerald-950">
          <div className="absolute inset-0 opacity-30">
            <GradientBackground />
          </div>
        </div>
        <div className="max-w-7xl mx-auto text-center relative z-10 mt-40">
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-6">
            Intelligent Healthcare
            <br />
            <span className="bg-gradient-to-r from-emerald-300 to-emerald-400 bg-clip-text text-transparent">
              Powered by Logic
            </span>
          </h1>
          <p className="text-xl text-emerald-100 mb-8 max-w-3xl mx-auto">
            Advanced medical solutions that combine data intelligence with healthcare expertise
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="/get-started"
              className="px-8 py-4 bg-emerald-500 text-white rounded-full hover:shadow-lg hover:bg-emerald-600 transition-all flex items-center justify-center"
            >
              Start Free Trial
              <ChevronRight className="ml-2 w-5 h-5" />
            </a>
            <a
              href="#demo"
              className="px-8 py-4 border border-emerald-300/30 text-white rounded-full hover:bg-emerald-800/30 transition-all"
            >
              Watch Demo
            </a>
          </div>
        </div>
        
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white" id="solution">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Advanced Healthcare Solutions</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Combining medical expertise with cutting-edge technology
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6">
                <Activity className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Real-time Monitoring</h3>
              <p className="text-gray-600">
                Advanced analytics and real-time patient monitoring systems for proactive care
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6">
                <Database className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Data Intelligence</h3>
              <p className="text-gray-600">
                Powerful data processing algorithms that transform medical data into actionable insights
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6">
                <Stethoscope className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Clinical Decision Support</h3>
              <p className="text-gray-600">
                Evidence-based recommendations to assist healthcare providers in making informed decisions
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Trusted by Healthcare Leaders</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See what medical professionals are saying about LogicMed
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-emerald-600 font-bold">JD</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Dr. Jane Doe</h4>
                  <p className="text-gray-600 text-sm">Chief Medical Officer, General Hospital</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                &quot;LogicMed has transformed our approach to patient care. The data insights have helped us reduce
                readmission rates by 23% in just six months.&quot;
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-emerald-600 font-bold">MS</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Dr. Michael Smith</h4>
                  <p className="text-gray-600 text-sm">Director of Innovation, MedTech Institute</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                &quot;The clinical decision support tools from LogicMed have become an essential part of our diagnostic
                process, improving accuracy and saving valuable time.&quot;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-emerald-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <GradientBackground />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Transform Healthcare Delivery?</h2>
          <p className="text-xl text-emerald-100 mb-8 max-w-3xl mx-auto">
            Join leading healthcare institutions using LogicMed to improve patient outcomes
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="/get-started"
              className="px-8 py-4 bg-emerald-500 text-white rounded-full shadow-lg hover:shadow-xl hover:bg-emerald-600 transition-all flex items-center justify-center"
            >
              Start Free Trial
              <ChevronRight className="ml-2 w-5 h-5" />
            </a>
            <a
              href="#contact"
              className="px-8 py-4 border border-emerald-300/30 text-white rounded-full hover:bg-emerald-800/30 transition-all"
            >
              Contact Sales
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-gray-900 font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                {["Features", "Solutions", "Pricing", "Docs"].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-gray-600 hover:text-emerald-500 transition">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-gray-900 font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                {["About", "Blog", "Careers", "Partners"].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-gray-600 hover:text-emerald-500 transition">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-gray-900 font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                {["Support", "API Docs", "Status", "Security"].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-gray-600 hover:text-emerald-500 transition">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-gray-900 font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                {["Privacy", "Terms", "GDPR", "Contact"].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-gray-600 hover:text-emerald-500 transition">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <LogicMedLogo />
              <span className="text-gray-900 font-medium ml-2">LogicMed</span>
              <span className="text-xs align-top ml-1">®</span>
            </div>
            <div className="text-sm text-gray-600">
              © {new Date().getFullYear()} LogicMed Technologies. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

// LogicMed Logo Component
const LogicMedLogo = ({ size = "default" }) => {
  const sizeClasses = {
    default: "w-8 h-8",
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

