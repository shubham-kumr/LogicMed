import os
from pinecone import Pinecone, ServerlessSpec
from openai import OpenAI
import torch
from transformers import CLIPProcessor, CLIPModel
from typing import List, Dict, Any
from dotenv import load_dotenv
from azure.ai.inference import EmbeddingsClient,ChatCompletionsClient
from azure.ai.inference.models import SystemMessage, UserMessage
from azure.core.credentials import AzureKeyCredential

load_dotenv()


pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))

index_name = "docmediq-rag-text-embedding-3-large"
if index_name not in pc.list_indexes().names():
    pc.create_index(
        name=index_name,
        dimension=3072,
        metric="cosine",
        spec=ServerlessSpec(
            cloud="aws",
            region="us-east-1"
        ) 
    )

index = pc.Index(index_name)


#CLIP initialisation
clip_model_name = "openai/clip-vit-base-patch32"
clip_model = CLIPModel.from_pretrained(clip_model_name)
clip_processor = CLIPProcessor.from_pretrained(clip_model_name)


endpoint = "https://models.inference.ai.azure.com"
model_name = "text-embedding-3-large"
token = os.environ["GITHUB_TOKEN"]
client = EmbeddingsClient(
    endpoint=endpoint,
    credential=AzureKeyCredential(token)
)

#embed text data on pinecone
def embed_text(text: str) -> List[float]:
    response = client.embed(
        input=[text],
        model="text-embedding-3-large"
    )

    return response['data'][0]['embedding']


#embed image data on pinecone 
def embed_image(image) -> List[float]:
    inputs = clip_processor(images=image, return_tensors="pt")
    with torch.no_grad():
        outputs = clip_model.get_image_features(**inputs)
    embedding = outputs[0].cpu().tolist()
    return embedding


#index a document that contains both text and image data
def index_document(doc_id: str, text: str = None, image = None, metadata: Dict[str, Any] = None):
    vector_list = []
    
    if text:
        vec = embed_text(text)
        vector_list.append({
            "id": f"{doc_id}_text",
            "values": vec,
            "metadata": {"modality": "text", "content": text, **(metadata or {})}
        })

    if image:
        vec = embed_image(image)
        vector_list.append({
            "id": f"{doc_id}_image",
            "values": vec,
            "metadata": {"modality": "image", **(metadata or {})}
        })

    if vector_list:
        index.upsert(vectors=vector_list)


#query pinecone for similar data
def query_pinecone(query: str, top_k: int = 5) -> List[Dict[str, Any]]:
    query_vec = embed_text(query)
    results = index.query(vector=query_vec, top_k=top_k, include_metadata=True)
    return results.get("matches", [])

#synthesise answer using GPT-4
def synthesize_answer_gpt4(query: str, retrieved_data: List[Dict[str, Any]]) -> str:
    context_parts = []
    image_urls = []
    for match in retrieved_data:
        modality = match["metadata"].get("modality")
        if modality == "text":
            context_parts.append(match["metadata"].get("content", ""))
        elif modality == "image":
            # Assuming 'docstore_url' is where your image is stored.
            image_url = match["metadata"].get("docstore_url")
            if image_url:
                image_urls.append(image_url)
            else:
                context_parts.append("[Image with no URL]")
    
    context = "\n".join(context_parts)
    prompt = f"Question: {query}\nContext: {context}\nAnswer:"

    endpoint = "https://models.inference.ai.azure.com"
    model_name = "gpt-4o"
    token = os.environ["GITHUB_TOKEN"]

    client = ChatCompletionsClient(
        endpoint=endpoint,
        credential=AzureKeyCredential(token),
    )

    # Prepare the messages for GPT-4. For images, depending on the API, you might need to attach them specially.
    # Here, we embed the image URLs in the prompt as a simple approach.
    messages = [{"role": "user", "content": prompt}]
    
    # If you have the ability to attach images directly, this is where you’d integrate that.
    # The following call assumes a GPT-4 vision-enabled model (model name is an example).
    response = client.complete(
        model=model_name,
        messages=messages,
        temperature=0.2
    )
    return response.choices[0].message['content']

def run_pipeline(query: str):
    retrieved_matches = query_pinecone(query, top_k=5)
    answer = synthesize_answer_gpt4(query, retrieved_matches)
    
    # Get index statistics
    stats = index.describe_index_stats()
    print(f"Total vector count: {stats['total_vector_count']}")
    print(f"Dimension: {stats['dimension']}")
    print(f"Index fullness: {stats['index_fullness']}")
    print(f"Namespaces: {stats['namespaces']}")

    return answer


