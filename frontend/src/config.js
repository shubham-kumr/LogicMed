const config = {
    backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000',  // Flask backend
    ragApiUrl: process.env.NEXT_PUBLIC_RAG_API_URL || 'http://localhost:8080',   // RAG service
};

export default config;
