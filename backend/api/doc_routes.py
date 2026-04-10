from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from datetime import datetime, timezone
from bson import ObjectId

from database import docs_collection
from models.document import DocumentCreate, DocumentResponse
from core.dependencies import get_current_user

router = APIRouter(prefix="/docs", tags=["Documents"])

# 1. CREATE a new document
@router.post("/", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def create_document(doc: DocumentCreate, current_user: dict = Depends(get_current_user)):
    new_doc = {
        "title": doc.title,
        "content": doc.content,
        "owner_id": str(current_user["_id"]), # Link the doc to the logged-in user
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
    
    result = await docs_collection.insert_one(new_doc)
    new_doc["id"] = str(result.inserted_id) # MongoDB uses '_id', we convert it to a string 'id' for the frontend
    return new_doc

# 2. READ all documents for the logged-in user
@router.get("/", response_model=List[DocumentResponse])
async def get_user_documents(current_user: dict = Depends(get_current_user)):
    # Find all docs where the owner_id matches the current user
    cursor = docs_collection.find({"owner_id": str(current_user["_id"])})
    docs = await cursor.to_list(length=100)
    
    # Format them for the frontend
    for doc in docs:
        doc["id"] = str(doc["_id"])
    return docs

# 3. READ a specific document by its ID
@router.get("/{doc_id}", response_model=DocumentResponse)
async def get_document(doc_id: str, current_user: dict = Depends(get_current_user)):
    # FIX: We removed the owner_id check so friends can open the link!
    doc = await docs_collection.find_one({"_id": ObjectId(doc_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    doc["id"] = str(doc["_id"])
    return doc

# 4. UPDATE (Save) an existing document
@router.put("/{doc_id}", response_model=DocumentResponse)
async def update_document(doc_id: str, doc_update: DocumentCreate, current_user: dict = Depends(get_current_user)):
    # FIX: We removed the owner_id check so friends can save their edits!
    updated_doc = await docs_collection.find_one_and_update(
        {"_id": ObjectId(doc_id)},
        {"$set": {
            "title": doc_update.title,
            "content": doc_update.content,
            "updated_at": datetime.now(timezone.utc)
        }},
        return_document=True 
    )
    
    if not updated_doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    updated_doc["id"] = str(updated_doc["_id"])
    return updated_doc
    
# 5. DELETE a document
@router.delete("/{doc_id}")
async def delete_document(doc_id: str, current_user: dict = Depends(get_current_user)):
    # Find the document by ID and delete it from the database
    result = await docs_collection.delete_one({"_id": ObjectId(doc_id)})
   
    # If the database couldn't find it to delete it, throw an error
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Document not found")
       
    return {"message": "Document deleted successfully"}
