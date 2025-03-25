import Link from "next/link";
import { Stethoscope, Building2, ArrowRight } from "lucide-react";

export default function GetStarted() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="max-w-4xl w-full mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800 mb-3">Welcome to MediPortal</h1>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            Select your role to access the appropriate dashboard and features
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Doctor Card */}
          <Link href="/doctor" className="block">
            
              <div className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                <div className="p-8">
                  <div className="w-16 h-16 bg-blue-50 rounded-lg flex items-center justify-center mb-6">
                    <Stethoscope className="w-8 h-8 text-blue-500" />
                  </div>
                  <h2 className="text-2xl font-semibold text-slate-800 mb-3">Doctor Portal</h2>
                  <p className="text-slate-500 mb-6">
                    Access patient medical records, review test results, and manage treatment plans.
                  </p>
                  <div className="flex items-center text-blue-600 font-medium group-hover:text-blue-700 transition-colors">
                    Continue as Doctor
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
                <div className="h-1.5 w-full bg-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
              </div>
     
          </Link>
          
          {/* Admin Card */}
          <Link href="/admin" className="block">
          
              <div className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                <div className="p-8">
                  <div className="w-16 h-16 bg-emerald-50 rounded-lg flex items-center justify-center mb-6">
                    <Building2 className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h2 className="text-2xl font-semibold text-slate-800 mb-3">Admin Portal</h2>
                  <p className="text-slate-500 mb-6">
                    Upload patient documents, manage hospital records, and oversee administrative tasks.
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
        
        <div className="mt-12 text-center text-slate-400 text-sm">
          <p>Need help? Contact technical support</p>
        </div>
      </div>
    </div>
  );
}