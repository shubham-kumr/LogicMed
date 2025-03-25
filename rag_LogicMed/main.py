from fastapi import FastAPI
from pydantic import BaseModel
from rag import run_pipeline, index_document
import uuid
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class InsertRequest(BaseModel):
    content: str

class SearchRequest(BaseModel):
    query: str

@app.post("/insert/")
async def insert_data(request: InsertRequest):
    doc_id = str(uuid.uuid4())
    
    index_document(doc_id=doc_id, text=request.content, metadata={"source": "api"})
    return {"status": "successfully inserted data"}

@app.post("/search/")
async def search_data(request: SearchRequest):
    return run_pipeline(request.query)
