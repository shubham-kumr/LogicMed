from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
import logging
from rag import index_document, run_pipeline

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

class SearchQuery(BaseModel):
    query: str
    patient_id: Optional[str] = None

class Document(BaseModel):
    content: str
    metadata: Optional[Dict[str, Any]] = None

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok"}

@app.post("/search/")
async def search(query: SearchQuery):
    """Search endpoint using RAG pipeline"""
    try:
        answer = await run_pipeline(query.query, query.patient_id)
        return {"answer": answer, "status": "success"}
    except Exception as e:
        logger.error(f"Error in search: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/insert/")
async def insert(document: Document):
    """Insert document into vector store"""
    try:
        success = await index_document(document.content, document.metadata)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to index document")
        return {"status": "success"}
    except Exception as e:
        logger.error(f"Error in insert: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
