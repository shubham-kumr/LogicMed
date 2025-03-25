import React from "react";
import Link from "next/link";
import { ChevronRight, CheckCircle, Star, Menu, X, ChevronDown, Shield, Clock, Database } from "lucide-react";

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex-shrink-0 flex items-center">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-md flex items-center justify-center mr-2">
                  <span className="text-white font-bold">D</span>
                </div>
                <span className="text-xl font-bold text-gray-900">DocuMedIQ</span>
              </div>
            </div>
            
            {/* Desktop menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition font-medium">Features</a>
              <a href="#testimonials" className="text-gray-600 hover:text-blue-600 transition font-medium">Testimonials</a>
              <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition font-medium">Pricing</a>
              <div className="flex items-center space-x-4">
                <a href="#" className="text-gray-600 hover:text-blue-600 transition font-medium">Log in</a>
                <a 
                  href="#get-started" 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow font-medium hover:bg-blue-700 transition"
                >
                  Get Started
                </a>
              </div>
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white shadow-md">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <a href="#features" className="block px-3 py-2 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-md">Features</a>
              <a href="#testimonials" className="block px-3 py-2 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-md">Testimonials</a>
              <a href="#pricing" className="block px-3 py-2 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-md">Pricing</a>
              <a href="#" className="block px-3 py-2 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-md">Log in</a>
              <a 
                href="#get-started" 
                className="block px-3 py-2 bg-blue-600 text-white rounded-md shadow font-medium hover:bg-blue-700"
              >
                Get Started
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="text-center md:text-left md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
                Revolutionizing Medical Document Management
              </h1>
              <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl md:mx-0 mx-auto">
                Secure, smart, and seamless. Managing medical documents has never been more efficient, compliant, and accessible.
              </p>
              <div className="flex flex-col sm:flex-row justify-center md:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
                <a 
                  href="#get-started" 
                  className="px-8 py-4 bg-white text-blue-600 font-bold rounded-lg shadow-lg hover:bg-gray-100 transition flex items-center justify-center"
                >
                  Get Started
                  <ChevronRight className="ml-2 w-5 h-5" />
                </a>
                <a 
                  href="#demo" 
                  className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-lg hover:bg-white hover:text-blue-600 transition flex items-center justify-center"
                >
                  Watch Demo
                </a>
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
                <div className="p-1 bg-gradient-to-r from-blue-500 to-purple-600"></div>
                <div className="p-6">
                  <div className="bg-blue-50 p-4 rounded-lg mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <div className="text-sm font-medium text-blue-800">Patient Records</div>
                    </div>
                    <div className="h-32 bg-white rounded-md shadow-sm"></div>
                  </div>
                  <div className="flex space-x-4">
                    <div className="bg-purple-50 p-4 rounded-lg flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <div className="text-sm font-medium text-purple-800">Analytics</div>
                      </div>
                      <div className="h-24 bg-white rounded-md shadow-sm"></div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <div className="text-sm font-medium text-green-800">Security</div>
                      </div>
                      <div className="h-24 bg-white rounded-md shadow-sm"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="py-8 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Trusted by leading healthcare providers</p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {['MediCorp', 'HealthFirst', 'CareGroup', 'MedTrust', 'LifeClinic'].map((company) => (
              <div key={company} className="text-gray-400 font-semibold text-lg">
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Features */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose DocuMedIQ?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform provides a comprehensive solution for healthcare document management with industry-leading features.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">HIPAA Compliant Security</h3>
              <p className="text-gray-600 mb-4">
                Bank-level encryption and security protocols ensure your medical documents stay private and protected.
              </p>
              <ul className="space-y-2">
                {['End-to-end encryption', 'Access controls', 'Audit trails'].map((item) => (
                  <li key={item} className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <Database className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Document Processing</h3>
              <p className="text-gray-600 mb-4">
                AI-powered OCR and data extraction turn complex medical documents into actionable insights.
              </p>
              <ul className="space-y-2">
                {['Automated categorization', 'Medical term recognition', 'Data extraction'].map((item) => (
                  <li key={item} className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Seamless Integration</h3>
              <p className="text-gray-600 mb-4">
                Works with your existing EHR systems and medical software for a streamlined workflow.
              </p>
              <ul className="space-y-2">
                {['Open API access', 'Pre-built integrations', 'Custom workflows'].map((item) => (
                  <li key={item} className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
      
      
      
      
      
      {/* CTA */}
      <section id="get-started" className="py-20 bg-gradient-to-r from-blue-600 to-purple-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Transform Your Document Management?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Join hundreds of healthcare providers who've streamlined their operations, improved security, and saved time with DocuMedIQ.
          </p>
          
          
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/get-started" className="px-8 py-4 bg-white text-blue-600 font-bold rounded-lg shadow-lg hover:bg-gray-100 transition flex items-center justify-center">
           
              Start Your Free Trial
              <ChevronRight className="ml-2 w-5 h-5" />
         
            </Link>
            <a 
              href="#contact" 
              className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-lg hover:bg-white hover:text-blue-600 transition flex items-center justify-center"
            >
              Schedule a Demo
            </a>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                {['Features', 'Security', 'Pricing', 'Integrations', 'Updates'].map((item) => (
                  <li key={item}><a href="#" className="hover:text-white transition">{item}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                {['About Us', 'Careers', 'Blog', 'Press', 'Partners'].map((item) => (
                  <li key={item}><a href="#" className="hover:text-white transition">{item}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                {['Documentation', 'Help Center', 'Community', 'Webinars', 'API'].map((item) => (
                  <li key={item}><a href="#" className="hover:text-white transition">{item}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                {['Privacy', 'Terms', 'Security', 'HIPAA Compliance', 'Cookie Policy'].map((item) => (
                  <li key={item}><a href="#" className="hover:text-white transition">{item}</a></li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-md flex items-center justify-center mr-2">
                <span className="text-white font-bold">D</span>
              </div>
              <span className="text-white font-bold text-xl">DocuMedIQ</span>
            </div>
            <div className="text-sm">
              © 2025 DocuMedIQ, Inc. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
