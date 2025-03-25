import { useState, useEffect } from "react";

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
                setPatientsData(data); // Update state with fetched data
            } catch (error) {
                setError(error.message); // Set error message if something goes wrong
            } finally {
                setLoading(false); // Set loading to false after fetching
            }
        };

        fetchPatients();
    }, []); // Empty dependency array ensures this runs only once on mount

    const filteredPatients = patientsData.filter(patient =>
        patient.name.toLowerCase().includes(search.toLowerCase())
    );

    const sendMessage = async () => {
        if (message.trim() !== "") {
            // Add doctor's message to chat
            const doctorMessage = {
                sender: "Doctor",
                text: message,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            
            setChat(prevChat => [...prevChat, doctorMessage]);
            setIsResponseLoading(true);
            
            try {
                // Prepare query data
                const queryData = {
                    query: message,
                    patient_id: selectedPatient?._id || null,
                    mode: chatMode
                };

                console.log("Query data:", queryData);
                
                // Send the query to the API
                const response = await fetch("http://127.0.0.1:8000/search", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(queryData)
                });
                
                console.log("API response:", response);

                if (!response.ok) {
                    throw new Error(`API Error: ${response.status}`);
                }
                
                // Parse the response
                const responseData = await response.json();

                console.log("Response data:", responseData);
                
                // Add the AI response to chat
                const aiMessage = {
                    sender: chatMode === "patient" ? selectedPatient?.name : "System",
                    text: responseData || "Sorry, I couldn't find an answer to that query.",
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };
                
                setChat(prevChat => [...prevChat, aiMessage]);
                
            } catch (error) {
                console.error("Error sending query:", error);
                
                // Add error message to chat
                const errorMessage = {
                    sender: "System",
                    text: `Error: ${error.message || "Failed to get a response. Please try again."}`,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };
                
                setChat(prevChat => [...prevChat, errorMessage]);
                
            } finally {
                setIsResponseLoading(false);
                setMessage(""); // Clear the input field
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
        setChat([]); // Clear chat when switching patients
    };

    const switchToGeneralChat = () => {
        setChatMode("general");
        setSelectedPatient(null);
        setChat([]); // Clear chat when switching to general mode
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <div className="text-gray-700">Loading patients data...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <div className="text-red-600">Error: {error}</div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-1/4 bg-white shadow-md flex flex-col">
                <div className="p-4 border-b border-gray-200">
                    <h1 className="text-2xl font-bold text-blue-600">DocuMedIQ</h1>
                    <p className="text-sm text-gray-500">Doctor Dashboard</p>
                </div>

                <div className="p-4">
                    <button
                        onClick={switchToGeneralChat}
                        className={`w-full mb-4 p-3 rounded-lg transition-all flex items-center ${
                            chatMode === "general"
                                ? "bg-blue-500 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        General Chat
                    </button>

                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search patients..."
                            className="w-full p-3 pl-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    <h2 className="text-xs uppercase font-semibold text-gray-500 mb-2 tracking-wider">Patients</h2>
                    <ul>
                        {filteredPatients.map((patient) => (
                            <li
                                key={patient._id} // Use _id from MongoDB
                                className={`p-3 mb-2 cursor-pointer rounded-lg transition-all flex items-center ${
                                    selectedPatient?._id === patient._id && chatMode === "patient"
                                        ? "bg-blue-500 text-white"
                                        : "hover:bg-gray-100"
                                }`}
                                onClick={() => selectPatient(patient)}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                                    selectedPatient?._id === patient._id && chatMode === "patient"
                                        ? "bg-blue-400"
                                        : "bg-blue-100"
                                }`}>
                                    <span className={selectedPatient?._id === patient._id && chatMode === "patient" ? "text-white" : "text-blue-500"}>
                                        {patient.name.split(" ").map(name => name[0]).join("")}
                                    </span>
                                </div>
                                <div>
                                    <h3 className={`font-medium ${selectedPatient?._id === patient._id && chatMode === "patient" ? "text-white" : "text-gray-800"}`}>
                                        {patient.name}
                                    </h3>
                                    <p className={`text-xs ${selectedPatient?._id === patient._id && chatMode === "patient" ? "text-blue-100" : "text-gray-500"}`}>
                                        Age: {patient.age}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Chat Section */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="bg-white p-4 shadow-sm border-b border-gray-200 flex items-center">
                    {chatMode === "patient" && selectedPatient ? (
                        <>
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                <span className="text-blue-500">{selectedPatient.name.split(" ").map(name => name[0]).join("")}</span>
                            </div>
                            <div>
                                <h2 className="font-medium text-gray-800">{selectedPatient.name}</h2>
                                <p className="text-xs text-gray-500">Age: {selectedPatient.age}</p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <h2 className="font-medium text-gray-800">General Chat</h2>
                        </>
                    )}
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                    {chat.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <p>No messages yet</p>
                            <p className="text-sm mt-2">
                                {chatMode === "patient" && selectedPatient
                                    ? `Start a conversation with ${selectedPatient.name}`
                                    : "Send a message to start chatting"
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {chat.map((msg, index) => (
                                <div key={index} className={`flex ${msg.sender === "Doctor" ? "justify-end" : "justify-start"}`}>
                                    <div className={`max-w-xs md:max-w-md lg:max-w-lg rounded-2xl px-4 py-3 ${
                                        msg.sender === "Doctor"
                                            ? "bg-blue-500 text-white rounded-tr-none"
                                            : "bg-white shadow-sm rounded-tl-none"
                                    }`}>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className={`text-xs font-medium ${msg.sender === "Doctor" ? "text-blue-100" : "text-gray-500"}`}>
                                                {msg.sender}
                                            </span>
                                            <span className={`text-xs ${msg.sender === "Doctor" ? "text-blue-100" : "text-gray-400"}`}>
                                                {msg.timestamp}
                                            </span>
                                        </div>
                                        <p className={msg.sender === "Doctor" ? "text-white" : "text-gray-800"}>
                                            {msg.text}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            
                            {/* Loading indicator */}
                            {isResponseLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white shadow-sm rounded-2xl rounded-tl-none px-4 py-3">
                                        <div className="flex space-x-2">
                                            <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                                            <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "300ms" }}></div>
                                            <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "600ms" }}></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Message Input */}
                <div className="p-4 bg-white border-t border-gray-200">
                    <div className="flex items-center bg-gray-100 rounded-lg p-1">
                        <input
                            type="text"
                            className="flex-1 p-3 bg-transparent border-none focus:outline-none"
                            placeholder={`Type a message to ${chatMode === "patient" && selectedPatient ? selectedPatient.name : "General Chat"}...`}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isResponseLoading}
                        />
                        <button
                            className={`p-3 text-white rounded-lg transition duration-200 ml-2 flex items-center ${
                                isResponseLoading || !message.trim() 
                                    ? "bg-blue-300 cursor-not-allowed" 
                                    : "bg-blue-500 hover:bg-blue-600"
                            }`}
                            onClick={sendMessage}
                            disabled={isResponseLoading || !message.trim()}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}