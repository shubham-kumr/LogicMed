from quart import Quart, request, jsonify
from quart_cors import cors
import os
import aiohttp
import asyncio
from bson import ObjectId
from utils import (
    allowed_file, process_pdf, ask_llm,
    patients_collection, UPLOAD_FOLDER, reports_collection
)
from werkzeug.utils import secure_filename
import json
from datetime import datetime
import logging

app = Quart(__name__)

# Configure CORS with more permissive settings for development
app = cors(
    app,
    allow_origin=["http://localhost:3000"],  # Frontend URL
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
    allow_credentials=True,
    max_age=3600
)

# Configuration
app.config['UPLOAD_FOLDER'] = os.path.join(os.getcwd(), UPLOAD_FOLDER)
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB limit

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# RAG Service URL
RAG_SERVICE_URL = "http://localhost:8080"  # Updated port to match RAG service

def index_to_rag(text, metadata):
    """Index document in RAG system"""
    try:
        response = aiohttp.post(
            f"{RAG_SERVICE_URL}/insert/",
            json={
                "content": text,
                "patient_id": metadata.get("patient_id"),
                "source": metadata.get("source", "medical_report")
            }
        )
        if response.status != 200:
            print(f"Error indexing to RAG: {response.text}")
            return False
        return True
    except Exception as e:
        print(f"Error connecting to RAG service: {str(e)}")
        return False

@app.route('/health', methods=['GET'])
async def health_check():
    return jsonify({'status': 'ok'}), 200

@app.route('/create-patient', methods=['POST'])
async def create_patient():
    try:
        patient_data = await request.json
        if not patient_data or not patient_data.get('name'):
            return jsonify({'error': 'Patient name is required'}), 400
        
        # Add default fields if not provided
        patient_data.setdefault('age', None)
        patient_data.setdefault('gender', None)
        patient_data.setdefault('contact', None)
        patient_data.setdefault('medical_history', [])
        
        # Insert patient into MongoDB
        result = patients_collection.insert_one(patient_data)
        
        # Return the created patient with string ID
        patient_data['_id'] = str(result.inserted_id)
        return jsonify(patient_data), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/get-all-patients', methods=['GET'])
async def get_all_patients():
    """Get all patients"""
    try:
        logger.info("Getting all patients")
        patients = patients_collection.find('patients')
        
        # Convert ObjectId to string for JSON serialization
        formatted_patients = []
        for patient in patients:
            patient['_id'] = str(patient['_id'])
            formatted_patients.append(patient)
            
        logger.info(f"Found {len(formatted_patients)} patients")
        return jsonify(formatted_patients), 200
    except Exception as e:
        logger.error(f"Error getting patients: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/add-patient', methods=['POST'])
async def add_patient():
    """Add a new patient"""
    try:
        patient_data = await request.get_json()
        logger.info(f"Adding new patient: {patient_data}")
        
        # Validate required fields
        if not patient_data.get('name'):
            return jsonify({'error': 'Patient name is required'}), 400
            
        # Add timestamps
        patient_data['created_at'] = datetime.now().isoformat()
        patient_data['updated_at'] = datetime.now().isoformat()
        
        # Insert into database
        result = patients_collection.insert_one('patients', patient_data)
        patient_data['_id'] = str(result['_id'])
        
        logger.info(f"Patient added successfully with ID: {patient_data['_id']}")
        return jsonify(patient_data), 201
    except Exception as e:
        logger.error(f"Error adding patient: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/get-patient-documents/<patient_id>', methods=['GET'])
async def get_patient_documents(patient_id):
    """Get all documents for a specific patient"""
    try:
        logger.info(f"Getting documents for patient: {patient_id}")
        documents = reports_collection.find('reports', {'patient_id': patient_id})
        
        # Convert documents to a format suitable for frontend
        formatted_docs = []
        for doc in documents:
            formatted_docs.append({
                '_id': doc['_id'],
                'filename': doc['filename'],
                'category': doc['file_category'],
                'uploadDate': doc['upload_date'],
                'textContent': doc['text_content'][:200] + '...' if len(doc['text_content']) > 200 else doc['text_content']
            })
            
        logger.info(f"Found {len(formatted_docs)} documents")
        return jsonify(formatted_docs), 200
    except Exception as e:
        logger.error(f"Error getting patient documents: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/delete-document/<document_id>', methods=['DELETE'])
async def delete_document(document_id):
    """Delete a specific document"""
    try:
        logger.info(f"Deleting document: {document_id}")
        
        # Get document from database
        document = reports_collection.find_one('reports', {'_id': document_id})
        if not document:
            return jsonify({'error': 'Document not found'}), 404
            
        # Delete document from RAG system
        async with aiohttp.ClientSession() as session:
            async with session.delete(
                f"{RAG_SERVICE_URL}/delete/",
                json={"document_id": document_id}
            ) as response:
                if response.status != 200:
                    logger.error("Failed to delete document from RAG")
                    return jsonify({'error': 'Failed to delete document from RAG system'}), 500
        
        # Delete from reports collection
        reports_collection.delete_one('reports', {'_id': document_id})
        
        logger.info("Document deleted successfully")
        return jsonify({'message': 'Document deleted successfully'}), 200
    except Exception as e:
        logger.error(f"Error deleting document: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/extract-text', methods=['POST'])
async def extract_text():
    """Extract text from uploaded file and index it in RAG"""
    try:
        logger.info("Received file upload request")
        
        # Check if the post request has the file part
        files = await request.files
        logger.debug(f"Request files: {files}")
        
        if 'file' not in files:
            logger.error("No file part in request")
            return jsonify({'error': 'No file part'}), 400
        
        file = files['file']
        if not file or not file.filename:
            logger.error("No selected file")
            return jsonify({'error': 'No selected file'}), 400
            
        if not allowed_file(file.filename):
            logger.error(f"Invalid file type: {file.filename}")
            return jsonify({'error': 'Invalid file type'}), 400

        # Get form data
        form = await request.form
        logger.debug(f"Form data: {form}")
        
        patient_id = form.get('patient_id')
        file_category = form.get('file_category')
        
        if not patient_id or not file_category:
            logger.error("Missing patient_id or file_category")
            return jsonify({'error': 'patient_id and file_category are required'}), 400

        # Create upload directory if it doesn't exist
        if not os.path.exists(app.config['UPLOAD_FOLDER']):
            os.makedirs(app.config['UPLOAD_FOLDER'])

        # Save the file
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        logger.info(f"Saving file to: {filepath}")
        
        await file.save(filepath)
        logger.info("File saved successfully")

        try:
            # Extract text from file
            logger.info("Extracting text from file")
            extracted_text = process_pdf(filepath) if filename.lower().endswith('.pdf') else ""
            
            if not extracted_text:
                logger.error("No text could be extracted")
                return jsonify({'error': 'No text could be extracted from the file'}), 400

            # Index document in RAG system
            logger.info("Indexing document in RAG system")
            async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=30)) as session:
                async with session.post(
                    f"{RAG_SERVICE_URL}/insert/",
                    json={
                        "content": extracted_text,
                        "metadata": {
                            "patient_id": patient_id,
                            "file_category": file_category,
                            "filename": filename,
                            "upload_date": datetime.now().isoformat()
                        }
                    }
                ) as response:
                    if response.status != 200:
                        logger.error("Failed to index document in RAG")
                        return jsonify({'error': 'Failed to index document in RAG system'}), 500
                        
                    # Save report to in-memory database
                    logger.info("Saving report to database")
                    report = {
                        'patient_id': patient_id,
                        'filename': filename,
                        'file_category': file_category,
                        'upload_date': datetime.now().isoformat(),
                        'text_content': extracted_text
                    }
                    reports_collection.insert_one('reports', report)
                    
                    logger.info("File processed successfully")
                    return jsonify({
                        'message': 'File processed successfully',
                        'text': extracted_text[:200] + '...' if len(extracted_text) > 200 else extracted_text
                    }), 200

        finally:
            # Clean up uploaded file
            if os.path.exists(filepath):
                os.remove(filepath)
                logger.info("Cleaned up temporary file")

    except Exception as e:
        logger.error(f"Error processing file: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/patients', methods=['GET'])
async def get_patients():
    """Get all patients"""
    try:
        patients = patients_collection.find('patients')
        return jsonify(patients), 200
    except Exception as e:
        logger.error(f"Error getting patients: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/reports/<patient_id>', methods=['GET'])
async def get_patient_reports(patient_id):
    """Get all reports for a patient"""
    try:
        reports = reports_collection.find('reports', {'patient_id': patient_id})
        return jsonify(reports), 200
    except Exception as e:
        logger.error(f"Error getting reports: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/chat', methods=['POST'])
async def chat():
    """Endpoint to chat with patient's medical data"""
    try:
        data = await request.json
        if not data or not data.get('query'):
            return jsonify({'error': 'Query is required'}), 400
            
        # Set a timeout for the RAG service request
        timeout = aiohttp.ClientTimeout(total=10)  # 10 second timeout
        
        # Forward the request to RAG service
        async with aiohttp.ClientSession(timeout=timeout) as session:
            async with session.post(
                f"{RAG_SERVICE_URL}/search/",
                json={
                    "query": data['query'],
                    "patient_id": data.get('patient_id')
                }
            ) as response:
                if response.status != 200:
                    return jsonify({'error': 'RAG service error'}), response.status
                    
                rag_response = await response.json()
                if rag_response.get('status') == 'error':
                    return jsonify({
                        'error': rag_response.get('message', 'Unknown error')
                    }), 400
                    
                return jsonify({
                    'answer': rag_response.get('answer', 'No answer found')
                }), 200
        
    except asyncio.TimeoutError:
        return jsonify({'error': 'Request timed out'}), 504
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)
    app.run(host='0.0.0.0', port=5000, debug=True)