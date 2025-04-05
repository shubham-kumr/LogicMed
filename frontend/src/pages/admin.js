'use client';

import { useState, useEffect } from "react";
import { Search, Upload, User, FileText, Calendar, Check, Plus, X, Settings, ChevronRight, LogOut } from "lucide-react";

export default function AdminDashboard() {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [file, setFile] = useState(null);
  const [search, setSearch] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [patientsData, setPatientsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fileCategory, setFileCategory] = useState("");
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [patientDocuments, setPatientDocuments] = useState([]);
  const [newPatient, setNewPatient] = useState({
    name: "",
    age: "",
    gender: "",
    contact: "",
    medical_history: []
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      fetchPatientDocuments();
    }
  }, [selectedPatient]);

  const fetchPatients = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/get-all-patients");
      if (!response.ok) {
        throw new Error("Failed to fetch patients data");
      }
      const data = await response.json();
      setPatientsData(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientDocuments = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/get-patient-documents/${selectedPatient._id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch patient documents");
      }
      const data = await response.json();
      setPatientDocuments(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file || !selectedPatient || !fileCategory) {
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('patient_id', selectedPatient._id);
    formData.append('file_category', fileCategory);

    try {
      const response = await fetch("http://127.0.0.1:5000/extract-text", {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload file');
      }

      await fetchPatientDocuments();
      
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
      setFile(null);
      setFileCategory("");
    } catch (error) {
      console.error('Error:', error);
      alert(error.message);
    }
  };

  const handleDeleteDocument = async (documentId) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/delete-document/${documentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete document');
      }

      fetchPatientDocuments();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleAddPatient = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://127.0.0.1:5000/add-patient", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPatient),
      });

      if (!response.ok) {
        throw new Error('Failed to add patient');
      }

      fetchPatients();
      setShowAddPatient(false);
      setNewPatient({
        name: "",
        age: "",
        gender: "",
        contact: "",
        medical_history: []
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              
              <div>
                <h1 className="text-xl font-bold text-gray-900">LogicMed</h1>
                <p className="text-sm text-gray-500">Admin Portal</p>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-4">
            <button
              onClick={() => setShowAddPatient(true)}
              className="w-full flex items-center p-3 rounded-xl text-emerald-600 hover:bg-emerald-50 border-2 border-emerald-500"
            >
              <Plus className="h-5 w-5 mr-3" />
              <span className="text-sm font-medium">Add New Patient</span>
            </button>

            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search patients..."
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="px-4 py-2">
            <h2 className="text-xs font-semibold text-gray-400 px-2 mb-3">PATIENTS</h2>
            <div className="space-y-1">
              {patientsData
                .filter(patient => patient.name.toLowerCase().includes(search.toLowerCase()))
                .map((patient) => (
                  <button
                    key={patient._id}
                    onClick={() => setSelectedPatient(patient)}
                    className={`w-full flex items-center p-2 rounded-xl transition-all ${
                      selectedPatient?._id === patient._id
                        ? "bg-emerald-50 text-emerald-600 border-2 border-emerald-500"
                        : "text-gray-600 hover:bg-gray-50 border-2 border-transparent"
                    }`}
                  >
                    <div className="relative">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center mr-3">
                        <span className="font-medium text-emerald-600">
                          {patient.name.split(" ").map(name => name[0]).join("")}
                        </span>
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="text-sm font-medium">{patient.name}</h3>
                      <p className="text-xs text-gray-500">
                        {patient.age} yrs • {patient.gender || "N/A"}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 opacity-50" />
                  </button>
                ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <User className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Patient Management</h2>
                <p className="text-sm text-gray-500">Manage patient records and documents</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50">
                <Settings className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Main Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {selectedPatient ? (
              <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                        <span className="text-lg font-medium text-emerald-600">
                          {selectedPatient.name.split(" ").map(name => name[0]).join("")}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{selectedPatient.name}</h3>
                        <div className="flex space-x-2">
                          <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">
                            {selectedPatient.age} years old
                          </span>
                          <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">
                            {selectedPatient.gender || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-4">Upload Medical Document</h4>
                      <form onSubmit={handleFileUpload} className="space-y-4">
                        <div className="flex items-center space-x-4">
                          <select
                            value={fileCategory}
                            onChange={(e) => setFileCategory(e.target.value)}
                            className="flex-1 py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          >
                            <option value="">Select category</option>
                            <option value="lab_report">Lab Report</option>
                            <option value="prescription">Prescription</option>
                            <option value="medical_history">Medical History</option>
                            <option value="imaging">Imaging Results</option>
                            <option value="other">Other</option>
                          </select>

                          <label className="flex-1 relative">
                            <input
                              type="file"
                              onChange={(e) => setFile(e.target.files[0])}
                              className="hidden"
                              accept=".pdf,.doc,.docx,.txt"
                            />
                            <div className="w-full py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm cursor-pointer hover:bg-gray-100 flex items-center justify-center">
                              <Upload className="h-4 w-4 mr-2" />
                              <span>{file ? file.name : "Choose file"}</span>
                            </div>
                          </label>

                          <button
                            type="submit"
                            disabled={!file || !fileCategory}
                            className={`py-2 px-4 rounded-xl text-sm font-medium transition-all ${
                              !file || !fileCategory
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "bg-emerald-500 text-white hover:bg-emerald-600"
                            }`}
                          >
                            Upload
                          </button>
                        </div>
                      </form>
                    </div>

                    {uploadSuccess && (
                      <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl flex items-center">
                        <Check className="h-5 w-5 mr-2" />
                        <span>File uploaded successfully!</span>
                      </div>
                    )}

                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-4">Patient Documents</h4>
                      <div className="space-y-3">
                        {patientDocuments.map((doc) => (
                          <div key={doc._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-emerald-100 rounded-lg">
                                <FileText className="h-5 w-5 text-emerald-600" />
                              </div>
                              <div>
                                <h5 className="text-sm font-medium text-gray-900">{doc.filename}</h5>
                                <p className="text-xs text-gray-500">
                                  {doc.category} • {new Date(doc.uploadDate).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteDocument(doc._id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                        {patientDocuments.length === 0 && (
                          <p className="text-center text-gray-500 py-4">No documents uploaded yet</p>
                        )}
                      </div>
                    </div>

                    <div className="mt-6">
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-4">
                  <User className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Patient</h3>
                <p className="text-gray-500 max-w-sm">
                  Choose a patient from the list to view their details and manage their documents.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Patient Modal */}
      {showAddPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Add New Patient</h3>
              <button
                onClick={() => setShowAddPatient(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddPatient} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={newPatient.name}
                  onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                  className="w-full py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    value={newPatient.age}
                    onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                    className="w-full py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    value={newPatient.gender}
                    onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
                    className="w-full py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Number
                </label>
                <input
                  type="tel"
                  value={newPatient.contact}
                  onChange={(e) => setNewPatient({ ...newPatient, contact: e.target.value })}
                  className="w-full py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddPatient(false)}
                  className="py-2 px-4 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600"
                >
                  Add Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}