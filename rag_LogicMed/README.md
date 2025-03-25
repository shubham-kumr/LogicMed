# Vector Database Microservice

## Overview
This microservice is designed to create embeddings from input data, store them in a vector database, and retrieve relevant data using Approximate Nearest Neighbors (ANN) or K-Nearest Neighbors (KNN) based on natural language queries. It supports multi-modal embeddings, ensuring fast and accurate retrieval.

## Features
- **Multi-modal Embedding & Retrieval:** Supports text, image, and other data types for embedding.
- **Fast & Scalable:** Optimized for high-speed searches.
- **Accurate & Efficient:** Uses state-of-the-art embedding models and efficient nearest neighbor algorithms.

## Technologies Used
- **Backend:** Python (FastAPI / Flask)
- **Vector Database:** FAISS / Pinecone / Weaviate / ChromaDB
- **Embedding Model:** OpenAI, Hugging Face Transformers, Sentence Transformers
- **Dependencies:**
  - `faiss-cpu` / `pinecone-client`
  - `sentence-transformers`
  - `fastapi` / `flask`
  - `uvicorn` (for FastAPI)
  - `numpy`, `pandas`

## Installation

### Prerequisites
- Install Python (>=3.8)
- Create a virtual environment
  ```bash
  python -m venv venv
  source venv/bin/activate  # On Windows use `venv\Scripts\activate`
  ```

### Install Dependencies
```bash
pip install -r requirements.txt
```

## Running the Microservice

### 1. Start the API Server
```bash
uvicorn app:main --host 0.0.0.0 --port 8000 --reload
```

### 2. Example Usage
#### Insert Data & Create Embeddings
```python
POST /embed
{
  "text": "This is a sample document."
}
```

![Screenshot](screenshots\search.jpg)

#### Query the Vector Database
```python
POST /query
{
  "query": "Find similar documents."
}
```
![Screenshot](screenshots\insert.jpg)

## API Endpoints
| Method | Endpoint | Description |
|--------|---------|-------------|
| POST   | `/embed` | Stores data and embeddings in the vector DB |
| POST   | `/query` | Retrieves similar data based on query embeddings |

## Future Enhancements
- Support for real-time data updates
- Multi-modal embedding improvements
- Deployable as a containerized service

## License
MIT License

