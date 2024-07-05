import json
import os
import requests
from dotenv import load_dotenv
from pinecone import Pinecone

# Load environment variables from .env file
load_dotenv()

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME")
PINECONE_ENVIRONMENT = os.getenv("PINECONE_ENVIRONMENT")
VOYAGE_API_KEY = os.getenv("VOYAGE_API_KEY")


# Directory containing GeoJSON files
data_dir = '.'

# Get a list of all GeoJSON files in the directory
geojson_files = [f for f in os.listdir(data_dir) if f.endswith('.json')]

voyage_api_url = "https://api.voyageai.com/v1/embeddings"

pc = Pinecone(api_key=PINECONE_API_KEY)
index = pc.Index(PINECONE_INDEX_NAME)

# Process each GeoJSON file
for file in geojson_files:
    # Load the GeoJSON file
    with open(os.path.join(data_dir, file), 'r') as f:
        geojson_data = json.load(f)
    
    # Extract region name from the filename (excluding the extension)
    region = os.path.splitext(file)[0]

    # Extract subregions
    subregions = [feature['properties']['NAME'] for feature in geojson_data['features']]

    # Create the JSON object
    json_object = {
        "region": region,
        "subregions": subregions
    }

    # Convert JSON object to string
    json_string = json.dumps(json_object)

    # Get embedding using Voyage API
    payload = {
        "input": [json_string],
        "model": "voyage-large-2"
    }

    headers = {
        "Authorization": f"Bearer {VOYAGE_API_KEY}",
        "Content-Type": "application/json"
    }

    response = requests.post(voyage_api_url, headers=headers, data=json.dumps(payload))
    if response.status_code == 200:
        embedding = response.json()["data"][0]["embedding"]
        print(f"Embedding for {file}: {len(embedding)}")
    else:
        print(f"Error getting embedding from Voyage API for file {file}: {response.text}")
        continue

    # Prepare metadata
    metadata = {
        "region": region,
        "subregions": subregions
    }

    # Upsert data into Pinecone
    index.upsert([
        {
            "id": region,
            "values": embedding,
            "metadata": metadata
        }
    ])

    print(f"Data upserted successfully for {file}!")

print("All files processed.")