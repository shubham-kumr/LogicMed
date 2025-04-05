from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional
import os
from datetime import datetime
import logging
from dotenv import load_dotenv
import pinecone
from langchain.embeddings import AzureOpenAIEmbeddings
from langchain.chat_models import AzureChatOpenAI
from langchain.vectorstores import Pinecone
from langchain.chains import ConversationalRetrievalQA
from langchain.memory import ConversationBufferMemory

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Azure OpenAI
embeddings = AzureOpenAIEmbeddings(
    azure_deployment=os.getenv("AZURE_EMBEDDING_DEPLOYMENT"),
    openai_api_version=os.getenv("AZURE_OPENAI_API_VERSION"),
)

# Initialize Pinecone
pinecone.init(
    api_key=os.getenv("PINECONE_API_KEY"),
    environment=os.getenv("PINECONE_ENVIRONMENT")
)
index_name = os.getenv("PINECONE_INDEX_NAME")
index = pinecone.Index(index_name)

# Initialize vector store
vectorstore = Pinecone(
    index, embeddings.embed_query, "text",
    namespace="medical_documents"
)

# Initialize chat model
llm = AzureChatOpenAI(
    deployment_name=os.getenv("AZURE_CHAT_DEPLOYMENT"),
    openai_api_version=os.getenv("AZURE_OPENAI_API_VERSION"),
    temperature=0
)

# Initialize conversation memory
memory = ConversationBufferMemory(
    memory_key="chat_history",
    return_messages=True
)

# Initialize QA chain
qa = ConversationalRetrievalQA.from_llm(
    llm=llm,
    retriever=vectorstore.as_retriever(),
    memory=memory,
    verbose=True
)

class Document(BaseModel):
    content: str
    metadata: Dict[str, str]

class Query(BaseModel):
    query: str
    patient_id: Optional[str] = None

class DeleteRequest(BaseModel):
    document_id: str

@app.post("/insert/")
async def insert_document(document: Document):
    """Insert a document into the vector store"""
    try:
        logger.info("Inserting document into vector store")
        # Generate embeddings and store in Pinecone
        texts = [document.content]
        metadatas = [document.metadata]
        
        vectorstore.add_texts(
            texts=texts,
            metadatas=metadatas
        )
        
        logger.info("Document inserted successfully")
        return {"message": "Document inserted successfully"}
    except Exception as e:
        logger.error(f"Error inserting document: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/delete/")
async def delete_document(request: DeleteRequest):
    """Delete a document from the vector store"""
    try:
        logger.info(f"Deleting document {request.document_id}")
        # Delete from Pinecone
        index.delete(
            filter={"document_id": request.document_id},
            namespace="medical_documents"
        )
        logger.info("Document deleted successfully")
        return {"message": "Document deleted successfully"}
    except Exception as e:
        logger.error(f"Error deleting document: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/query/")
async def query_documents(query: Query):
    """Query the vector store"""
    try:
        logger.info(f"Processing query: {query.query}")
        
        # Add patient filter if provided
        filter_dict = {}
        if query.patient_id:
            filter_dict["patient_id"] = query.patient_id
            
        # Get response from QA chain
        response = qa(
            {"question": query.query},
            filter=filter_dict if filter_dict else None
        )
        
        logger.info("Query processed successfully")
        return {
            "answer": response["answer"],
            "source_documents": response.get("source_documents", [])
        }
    except Exception as e:
        logger.error(f"Error processing query: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
