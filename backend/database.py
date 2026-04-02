# database.py
import motor.motor_asyncio
import os
from dotenv import load_dotenv

# Load environment variables from the .env file
load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")

# Create the async MongoDB client
client = motor.motor_asyncio.AsyncIOMotorClient(MONGODB_URL)

# Create (or connect to) the specific database for your app
db = client.smart_doc_db

# Create references to your specific collections
users_collection = db.get_collection("users")
docs_collection = db.get_collection("documents")

print("MongoDB connection established.")