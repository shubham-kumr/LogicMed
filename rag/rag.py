import os
import json
import faiss
import numpy as np
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
from sentence_transformers import SentenceTransformer
import requests

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Ollama API endpoint
OLLAMA_API = "http://localhost:11434/api"

class OllamaLLM:
    def __init__(self, model="llama2"):
        self.model = model
        self.api_url = f"{OLLAMA_API}/generate"
        
    def generate(self, prompt: str, **kwargs) -> str:
        try:
            response = requests.post(
                self.api_url,
                json={
                    "model": self.model,
                    "prompt": prompt,
                    "stream": False,
                    **kwargs
                }
            )
            response.raise_for_status()
            return response.json()["response"]
        except Exception as e:
            logger.error(f"Error calling Ollama: {str(e)}")
            return None

# Initialize models
logger.info("Initializing models...")
EMBEDDING_MODEL = SentenceTransformer('all-MiniLM-L6-v2')  # Small, fast, good quality
LLM = OllamaLLM(model="llama2")  # Using Llama 2 from Ollama

class VectorStore:
    def __init__(self):
        """Initialize vector store"""
        self.index_path = "vector_store"
        self.metadata_path = "vector_store/metadata.json"
        
        # Create directory if it doesn't exist
        os.makedirs(self.index_path, exist_ok=True)
        
        # Load or create metadata
        if os.path.exists(self.metadata_path):
            with open(self.metadata_path, 'r') as f:
                self.metadata = json.load(f)
        else:
            self.metadata = []
            self._save_metadata()
            
        # Initialize FAISS index
        self.dimension = 384  # MiniLM embedding dimension
        if os.path.exists(os.path.join(self.index_path, "index.faiss")):
            self.index = faiss.read_index(os.path.join(self.index_path, "index.faiss"))
            logger.info(f"Loaded existing index with {self.index.ntotal} vectors")
        else:
            self.index = faiss.IndexFlatL2(self.dimension)
            logger.info("Created new FAISS index")
            
    def _save_metadata(self):
        """Save metadata to disk"""
        with open(self.metadata_path, 'w') as f:
            json.dump(self.metadata, f)
            
    def _save_index(self):
        """Save FAISS index to disk"""
        faiss.write_index(self.index, os.path.join(self.index_path, "index.faiss"))
            
    async def add_document(self, vector: List[float], metadata: Dict[str, Any]):
        """Add a document to the vector store"""
        try:
            # Convert vector to numpy array
            vector_np = np.array([vector], dtype=np.float32)
            
            # Add to index
            self.index.add(vector_np)
            self.metadata.append(metadata)
            
            # Save changes
            self._save_metadata()
            self._save_index()
            
            logger.info(f"Added document with metadata: {metadata}")
            return True
        except Exception as e:
            logger.error(f"Error adding document: {str(e)}")
            return False
            
    async def search(self, query_vector: List[float], k: int = 3, patient_id: Optional[str] = None):
        """Search for similar documents"""
        try:
            # Convert query vector to numpy array
            query_np = np.array([query_vector], dtype=np.float32)
            
            # Search in index
            scores, indices = self.index.search(query_np, k)
            
            # Format results
            results = []
            for score, idx in zip(scores[0], indices[0]):
                if idx < 0 or idx >= len(self.metadata):
                    continue
                    
                metadata = self.metadata[idx]
                
                # Filter by patient_id if specified
                if patient_id and metadata.get('patient_id') != patient_id:
                    continue
                    
                results.append({
                    'id': metadata.get('id', str(idx)),
                    'score': float(score),
                    'metadata': metadata
                })
                
            logger.info(f"Found {len(results)} similar documents")
            return results
            
        except Exception as e:
            logger.error(f"Error searching: {str(e)}")
            return []

async def get_embeddings(texts: List[str], input_type: str = "search_document") -> List[List[float]]:
    """Get embeddings using Sentence Transformers"""
    try:
        # Ensure texts are strings and not too long
        texts = [str(text)[:4096] for text in texts]  # Limit text length
        
        # Generate embeddings
        embeddings = EMBEDDING_MODEL.encode(texts, convert_to_numpy=True).tolist()
        logger.info(f"Generated {len(embeddings)} embeddings")
        return embeddings
        
    except Exception as e:
        logger.error(f"Error getting embeddings: {str(e)}")
        return []

async def synthesize_answer(query: str, context: str) -> str:
    """Generate answer using Ollama"""
    try:
        # Prepare prompt
        prompt = f"""You are a medical assistant helping doctors analyze patient records. Answer briefly and directly based on the context.

Context: {context}
Question: {query}
Answer: """

        # Generate response using Ollama
        response = LLM.generate(
            prompt,
            temperature=0.7,
            top_p=0.95,
            num_predict=150  # Similar to max_tokens
        )
        
        if response is None:
            return "Error: Could not generate response. Please check if Ollama is running."
            
        return response.strip()
        
    except Exception as e:
        logger.error(f"Error generating answer: {str(e)}")
        return "Error analyzing medical information. Please try again."

async def run_pipeline(query: str, patient_id: Optional[str] = None) -> str:
    """Run the complete RAG pipeline"""
    try:
        # Generate query embedding
        embeddings = await get_embeddings([query])
        if not embeddings:
            return "Failed to process query. Please try again."
            
        # Search with reduced k for faster response
        vector_store = VectorStore()
        results = await vector_store.search(embeddings[0], k=2, patient_id=patient_id)
        
        if not results:
            return "No relevant medical records found."
        
        # Extract relevant contexts (shorter)
        contexts = []
        for result in results:
            if result['score'] > 0.5:  # Only use high-confidence matches
                text = result['metadata']['text']
                if len(text) > 300:  # Reduced context size
                    text = text[:300] + "..."
                contexts.append(text)
        
        if not contexts:
            return "No relevant information found."
        
        # Join contexts and generate answer
        context = "\n---\n".join(contexts)
        return await synthesize_answer(query, context)
        
    except Exception as e:
        logger.error(f"Error in RAG pipeline: {str(e)}")
        return f"Error: {str(e)}"

async def index_document(text: str, metadata: Dict[str, Any] = None) -> bool:
    """Index a document in the vector store"""
    try:
        # Generate embeddings
        embeddings = await get_embeddings([text])
        if not embeddings:
            return False
            
        # Add to vector store
        vector_store = VectorStore()
        metadata = metadata or {}
        metadata['text'] = text
        
        success = await vector_store.add_document(embeddings[0], metadata)
        return success
        
    except Exception as e:
        logger.error(f"Error indexing document: {str(e)}")
        return False
