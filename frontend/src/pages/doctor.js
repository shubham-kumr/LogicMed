import { useState, useEffect } from "react";
import { MessageCircle, Search, User, ChevronRight, Settings, LogOut, Plus } from "lucide-react";

export default function DoctorDashboard() {
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [message, setMessage] = useState("");
    const [chat, setChat] = useState([]);
    const [search, setSearch] = useState("");
    const [chatMode, setChatMode] = useState("general"); // "patient" or "general"
    const [patientsData, setPatientsData] = useState([]); // State to store fetched patient data
    const [loading, setLoading] = useState(true); // State to handle loading state
    const [error, setError] = useState(null); // State to handle errors
    const [isResponseLoading, setIsResponseLoading] = useState(false); // State to track when waiting for API response

    // Fetch patients data from the API
    useEffect(() => {
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

        fetchPatients();
    }, []);

    const filteredPatients = patientsData.filter(patient =>
        patient.name.toLowerCase().includes(search.toLowerCase())
    );

    const sendMessage = async () => {
        if (message.trim() !== "") {
            const doctorMessage = {
                sender: "Doctor",
                text: message,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            
            setChat(prevChat => [...prevChat, doctorMessage]);
            setIsResponseLoading(true);
            
            try {
                const queryData = {
                    query: message,
                    patient_id: selectedPatient?._id || null,
                    mode: chatMode
                };
                
                const response = await fetch("http://127.0.0.1:8000/search", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(queryData)
                });

                if (!response.ok) {
                    throw new Error(`API Error: ${response.status}`);
                }
                
                const responseData = await response.json();
                
                const aiMessage = {
                    sender: chatMode === "patient" ? selectedPatient?.name : "LogicMed AI",
                    text: responseData || "I couldn't find relevant information for that query.",
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };
                
                setChat(prevChat => [...prevChat, aiMessage]);
                
            } catch (error) {
                console.error("Error:", error);
                
                const errorMessage = {
                    sender: "System",
                    text: `Error: ${error.message || "Failed to get a response"}`,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };
                
                setChat(prevChat => [...prevChat, errorMessage]);
                
            } finally {
                setIsResponseLoading(false);
                setMessage("");
            }
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const selectPatient = (patient) => {
        setSelectedPatient(patient);
        setChatMode("patient");
        setChat([]);
    };

    const switchToGeneralChat = () => {
        setChatMode("general");
        setSelectedPatient(null);
        setChat([]);
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
        <div className="min-h-screen bg-gray-50">
            <div className="flex h-screen">
                {/* Sidebar */}
                <div className="w-80 bg-white border-r border-gray-100">
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
        
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">LogicMed</h1>
                                <p className="text-sm text-gray-500">Doctor Portal</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 space-y-4">
                        <button
                            onClick={switchToGeneralChat}
                            className={`w-full flex items-center p-3 rounded-xl transition-all ${
                                chatMode === "general"
                                    ? "bg-emerald-50 text-emerald-600 border-2 border-emerald-500"
                                    : "text-gray-600 hover:bg-gray-50 border-2 border-transparent"
                            }`}
                        >
                            <MessageCircle className="h-5 w-5 mr-3" />
                            <span className="text-sm font-medium">General Chat</span>
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
                            {filteredPatients.map((patient) => (
                                <button
                                    key={patient._id}
                                    onClick={() => selectPatient(patient)}
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
                            {chatMode === "patient" && selectedPatient ? (
                                <>
                                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                                        <span className="font-medium text-emerald-600">
                                            {selectedPatient.name.split(" ").map(name => name[0]).join("")}
                                        </span>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900">{selectedPatient.name}</h2>
                                        <div className="flex space-x-2">
                                            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                                                {selectedPatient.age} years old
                                            </span>
                                            <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">
                                                Active
                                            </span>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                                        <MessageCircle className="h-5 w-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900">General Chat</h2>
                                        <p className="text-sm text-gray-500">Ask anything about the hospital</p>
                                    </div>
                                </>
                            )}
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

                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {chat.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center">
                                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
                                    <MessageCircle className="h-8 w-8 text-blue-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Start a Conversation</h3>
                                <p className="text-gray-500 max-w-sm">
                                    {chatMode === "patient"
                                        ? `Ask about ${selectedPatient?.name}'s medical history, test results, or request an analysis.`
                                        : "Get insights about hospital statistics, department performance, or general medical queries."}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {chat.map((msg, index) => (
                                    <div key={index} className={`flex ${msg.sender === "Doctor" ? "justify-end" : "justify-start"}`}>
                                        <div
                                            className={`max-w-2xl rounded-2xl px-4 py-3 ${
                                                msg.sender === "Doctor"
                                                    ? "bg-emerald-500 text-white"
                                                    : "bg-gray-100 text-gray-900"
                                            }`}
                                        >
                                            <div className="flex items-center space-x-2 mb-1">
                                                <span className={`text-xs font-medium ${
                                                    msg.sender === "Doctor" ? "text-emerald-100" : "text-gray-400"
                                                }`}>
                                                    {msg.sender}
                                                </span>
                                                <span className={`text-xs ${
                                                    msg.sender === "Doctor" ? "text-emerald-100" : "text-gray-400"
                                                }`}>
                                                    {msg.timestamp}
                                                </span>
                                            </div>
                                            <p className="text-sm leading-relaxed">{msg.text}</p>
                                        </div>
                                    </div>
                                ))}

                                {isResponseLoading && (
                                    <div className="flex justify-start">
                                        <div className="max-w-2xl bg-gray-100 rounded-2xl p-4">
                                            <div className="flex space-x-1">
                                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                                            </div>
                                            <span className="text-sm text-gray-500">Processing your request...</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white border-t border-gray-100">
                        <div className="relative flex items-center">
                            <textarea
                                rows="1"
                                className="flex-1 py-3 px-4 pr-16 bg-gray-50 border border-gray-200 rounded-xl resize-none text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                placeholder={`Message ${chatMode === "patient" ? selectedPatient?.name : "LogicMed"}...`}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={isResponseLoading}
                            />
                            <button
                                className={`absolute right-2 p-2 rounded-lg transition-all ${
                                    isResponseLoading || !message.trim()
                                        ? "text-gray-400 cursor-not-allowed"
                                        : "text-emerald-600 hover:bg-emerald-50"
                                }`}
                                onClick={sendMessage}
                                disabled={isResponseLoading || !message.trim()}
                            >
                                <Plus className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}