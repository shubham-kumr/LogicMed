import os
from typing import Dict, List
from datetime import datetime
import logging
import PyPDF2
from dataclasses import dataclass, asdict
import json
import fitz
import requests
from PIL import Image
from werkzeug.utils import secure_filename
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# File upload configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'bmp', 'gif', 'tiff', 'pdf'}

# In-memory storage for development
class InMemoryDB:
    def __init__(self):
        self.patients: List[Dict] = []
        self.reports: List[Dict] = []
        self._patient_id_counter = 1
        self._report_id_counter = 1

    def insert_one(self, collection: str, document: Dict) -> Dict:
        if '_id' not in document:
            document['_id'] = str(self._get_next_id(collection))
        
        if collection == 'patients':
            self.patients.append(document)
        elif collection == 'reports':
            self.reports.append(document)
            
        return document

    def find_one(self, collection: str, query: Dict) -> Dict:
        target_list = self.patients if collection == 'patients' else self.reports
        for doc in target_list:
            if all(doc.get(k) == v for k, v in query.items()):
                return doc
        return None

    def find(self, collection: str, query: Dict = None) -> List[Dict]:
        target_list = self.patients if collection == 'patients' else self.reports
        if not query:
            return target_list
        
        return [
            doc for doc in target_list 
            if all(doc.get(k) == v for k, v in query.items())
        ]

    def delete_one(self, collection: str, query: Dict) -> bool:
        """Delete a single document from the collection"""
        target_list = self.patients if collection == 'patients' else self.reports
        for i, doc in enumerate(target_list):
            if all(doc.get(k) == v for k, v in query.items()):
                target_list.pop(i)
                return True
        return False

    def _get_next_id(self, collection: str) -> int:
        if collection == 'patients':
            id_val = self._patient_id_counter
            self._patient_id_counter += 1
        else:
            id_val = self._report_id_counter
            self._report_id_counter += 1
        return id_val

# Initialize in-memory database
db = InMemoryDB()
patients_collection = db
reports_collection = db

TOGETHER_API_KEY = os.getenv("TOGETHER_API_KEY", "default_key")

TOGETHER_HEADERS = {
    "Authorization": f"Bearer {TOGETHER_API_KEY}",
    "Content-Type": "application/json"
}

def allowed_file(filename: str) -> bool:
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def process_pdf(filepath: str) -> str:
    """Extract text from PDF file"""
    try:
        logger.info(f"Processing PDF file: {filepath}")
        if not os.path.exists(filepath):
            logger.error(f"File not found: {filepath}")
            return ""
            
        pdf_document = fitz.open(filepath)
        if not pdf_document:
            logger.error("Failed to open PDF document")
            return ""
            
        text = []
        for page_num in range(len(pdf_document)):
            page = pdf_document.load_page(page_num)
            if page:
                page_text = page.get_text()
                if page_text:
                    text.append(page_text)
                    
        pdf_document.close()
        
        result = '\n\n'.join(text)
        logger.info(f"Successfully extracted {len(result)} characters from PDF")
        return result
            
    except Exception as e:
        logger.error(f"Error processing PDF: {str(e)}")
        return ""

def ask_llm(raw_text):
    """Process text using Together AI API"""
    try:
        logger.info(f"Sending request to Together AI API")
        url = "https://api.together.xyz/inference"
        system_prompt = """You are a medical AI assistant. Analyze the following medical text and provide 
        a concise summary of key findings, diagnoses, and recommendations. Be precise and professional."""
        
        prompt = f"{system_prompt}\n\nText: {raw_text}\n\nAnalysis:"
        
        response = requests.post(
            url,
            headers=TOGETHER_HEADERS,
            json={
                "model": "togethercomputer/llama-2-70b-chat",
                "prompt": prompt,
                "max_tokens": 200,
                "temperature": 0.2,
                "top_p": 0.7,
                "top_k": 50,
                "repetition_penalty": 1.1
            }
        )
        
        if response.status_code != 200:
            raise Exception(f"Error from Together AI: {response.text}")
            
        result = response.json()
        logger.info(f"Received response from Together AI API")
        return {
            "message": result['output']['choices'][0]['text'],
            "input_text": raw_text
        }
        
    except Exception as e:
        logger.error(f"Error processing text with Together AI API: {str(e)}")
        return {"error": str(e)}

# Add sample data
sample_patients = [
    {
        '_id': '1',
        'name': 'John Doe',
        'age': 45,
        'gender': 'Male',
        'email': 'john@example.com'
    },
    {
        '_id': '2',
        'name': 'Jane Smith',
        'age': 32,
        'gender': 'Female',
        'email': 'jane@example.com'
    },
    {
        '_id': '3',
        'name': 'Bob Wilson',
        'age': 58,
        'gender': 'Male',
        'email': 'bob@example.com'
    }
]

# Initialize database with sample data
for patient in sample_patients:
    patients_collection.insert_one('patients', patient)
