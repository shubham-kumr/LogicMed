import os
import io
import fitz
from PIL import Image
from werkzeug.utils import secure_filename
from azure.ai.inference import ChatCompletionsClient
from azure.ai.inference.models import SystemMessage, UserMessage
from azure.core.credentials import AzureKeyCredential
from pymongo import MongoClient
from bson import ObjectId
from dotenv import load_dotenv

load_dotenv()

# Load environment variables
token = os.getenv("GITHUB_TOKEN")
mongo_uri = os.getenv("MONGO_URI")

# Initialize MongoDB Client
client = MongoClient(mongo_uri)
db = client["medical_db"]
patients_collection = db["patients"]
reports_collection=db["files"]

# Initialize Azure AI Client
azure_client = ChatCompletionsClient(
    endpoint="https://models.inference.ai.azure.com",
    credential=AzureKeyCredential(token),
)

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'bmp', 'gif', 'tiff', 'pdf'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# def process_image(image_path):
#     img = Image.open(image_path)
#     return pytesseract.image_to_string(img, lang='eng')

def process_pdf(pdf_path):
    text = []
    pdf_document = fitz.open(pdf_path)
    for page_num in range(len(pdf_document)):
        page = pdf_document.load_page(page_num)
        pix = page.get_pixmap()
        img = Image.open(io.BytesIO(pix.tobytes('ppm')))
        # text.append(pytesseract.image_to_string(img, lang='eng').strip())
    pdf_document.close()
    return '\n\n'.join(text)

def ask_llm(raw_text):
    try:
        response = azure_client.complete(
            messages=[
                SystemMessage(content="""You are an advanced medical report analyzer with expertise in clinical documentation. 
                Your task is to extract and structure medical report data into a **valid JSON object** that strictly follows this schema:

                {
                  "report_id": "Unique identifier for the medical report",
                  "patient_info": {
                    "patient_id": "Unique identifier for the patient",
                    "name": "Full name of the patient",
                    "date_of_birth": "Date of birth (YYYY-MM-DD)",
                    "address": "Residential address"
                  },
                  "ordering_physician_info": {
                    "physician_id": "Unique identifier for the physician",
                    "name": "Physician's full name",
                    "contact_info": {
                      "phone": "Physician's contact number",
                      "email": "Physician's email address"
                    }
                  },
                  "specimen_details": {
                    "specimen_id": "Unique identifier for the specimen",
                    "type": "Type of specimen collected (e.g., blood, urine, tissue)",
                    "collection_datetime": "Timestamp of specimen collection (YYYY-MM-DD HH:MM:SS)",
                    "collected_by": "Name of the person who collected the specimen"
                  },
                  "tests": [
                    {
                      "test_id": "Unique identifier for the test",
                      "name": "Name of the test performed",
                      "result": "Result of the test",
                      "units": "Measurement units",
                      "reference_range": "Normal range for the test",
                      "flag": "Indicates if the result is normal, high, or low"
                    }
                  ],
                  "interpretation": "Doctor's interpretation of test results",
                  "report_date": "Date of report generation (YYYY-MM-DD)",
                  "laboratory_info": {
                    "lab_id": "Unique identifier for the laboratory",
                    "name": "Laboratory name",
                    "address": "Laboratory address",
                    "contact_info": {
                      "phone": "Laboratory's contact number",
                      "email": "Laboratory's email address"
                    }
                  }
                }

                **Guidelines:**
                - Ensure the response is a valid JSON .
                - **Do NOT format the output as Markdown or include any extra text.**
                - Exclude explanations, headers, or unnecessary formatting.
                - Convert dates to **ISO 8601** format (YYYY-MM-DD or YYYY-MM-DD HH:MM:SS).
                - Ensure accurate mapping of data.
                

                **Your output must be only a JSON object without any additional text.**
                """),
                UserMessage(content=f"Extract and return structured JSON from this medical report:\n\n{raw_text}")
            ],
            model="gpt-4o",
            temperature=1,
            max_tokens=4096,
            top_p=1
        )

        # Get the response content
        json_string = response.choices[0].message.content.strip()

        # Clean the response if it has markdown formatting
        if json_string.startswith("```json"):
            json_string = json_string[7:].strip()
        if json_string.endswith("```"):
            json_string = json_string[:-3].strip()

        # Parse the string to a JSON object and then convert back to a properly formatted JSON string
        import json
        parsed_json = json.loads(json_string)
        
        # Return the parsed JSON object directly (not as a string)
        return parsed_json

    except Exception as e:
        return {"error": str(e)}