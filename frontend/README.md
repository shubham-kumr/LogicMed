# DocuMedIQ

DocuMedIQ is an advanced medical data management web application that converts unstructured medical data into structured data, allowing doctors and hospital administrators to derive valuable insights efficiently.

## Features
- **Real-Time Insights:** Doctors can query the patient database and retrieve real-time insights using AI.
- **Unstructured to Structured Data Conversion:** Hospital admins can upload patient records such as prescriptions, lab reports, and scans, which are automatically structured and stored in a vector database and MongoDB.
- **Efficient Storage:** Using MongoDB for metadata storage and a vector database for fast retrieval and similarity search enhances system efficiency.
- **AI-Powered Querying:** Retrieval-Augmented Generation (RAG) with OpenAI enables intelligent querying of patient records.

## Technologies Used
- **Frontend:** Next.js, Tailwind CSS
- **Backend:** OpenAI, RAG-based AI processing
- **Database:** MongoDB (structured data storage), Vector Database (efficient similarity search)

## Installation Guide
Follow these steps to clone and set up the project:

### Prerequisites
Make sure you have the following installed:
- **Node.js** (Latest LTS version recommended)

### Steps to Clone and Install

1. **Clone the Repository:**
   ```sh
   git clone https://github.com/your-username/DocuMedIQ.git
   cd DocuMedIQ
   ```

2. **Install Dependencies:**
   ```sh
   npm install
   ```


3. **Run the Development Server:**
   ```sh
   npm run dev
   ```
   The application will be available at `http://localhost:3000/`.

## Screenshots
### Home Page
![Home Page](screenshots/homepage1.jpg)
![Home Page](screenshots/homepage2.jpg)

### Doctor Interface
![Patient Query](screenshots/doctor.jpg)

### Admin Interface
![Admin Dashboard](screenshots/admin.jpg)

## Contributing
Feel free to open issues or submit pull requests to enhance DocuMedIQ.

## License
This project is licensed under the MIT License.