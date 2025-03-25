from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
import os
from bson import ObjectId
from utils import (
    allowed_file, process_pdf, ask_llm,
    patients_collection, UPLOAD_FOLDER, reports_collection
)
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app, origins=['http://localhost:3001'])

# Configuration
app.config['UPLOAD_FOLDER'] = os.path.join(os.getcwd(), UPLOAD_FOLDER)

if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB limit

@app.route('/extract-text', methods=['POST'])
@cross_origin(origins=['http://localhost:3001'])
def extract_text():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if not file or not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file'}), 400

    try:
        # Get patient_id and file_category from the request
        patient_id = request.form.get('patient_id')
        file_category = request.form.get('file_category')

        if not patient_id or not file_category:
            return jsonify({'error': 'patient_id and file_category are required'}), 400

        # Validate if the patient exists
        if not patients_collection.find_one({"_id": ObjectId(patient_id)}):
            return jsonify({'error': 'Patient not found'}), 404

        # Secure the filename and save the file
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        
        # Save the file and wait for it to complete
        file.save(filepath)
        
        # Verify that the file exists and is not empty
        if not os.path.exists(filepath) or os.path.getsize(filepath) == 0:
            return jsonify({'error': 'File upload failed or file is empty'}), 500

        # Extract text based on file type
        if filename.lower().endswith('.pdf'):
            raw_text = process_pdf(filepath)
        # else:
        #     raw_text = process_image(filepath)
        
        # Get structured data from LLM
        structured_data = ask_llm(raw_text)
        
        # Save structured data to MongoDB
        report_data = {
            "patient_id": ObjectId(patient_id),  # Ensure patient_id is stored as ObjectId
            "file_category": file_category,
            "raw_text": raw_text,
            "structured_data": structured_data,
            "filename": filename,
        }
        reports_collection.insert_one(report_data)
        
        # Clean up: Remove the file after processing
        os.remove(filepath)
        
        response = jsonify({
            'raw_text': raw_text,
            'structured_data': structured_data,
            'message': 'Report saved successfully'
        })
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3001')
        return response, 200

    except Exception as e:
        # Clean up: Remove the file if an error occurs
        if os.path.exists(filepath):
            os.remove(filepath)
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)
    app.run(host='0.0.0.0', port=5000, debug=True)