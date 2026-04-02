from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class DocumentCreate(BaseModel):
    title: str
    content: Dict[str, Any]  # This accepts TipTap's rich-text JSON format

class DocumentResponse(BaseModel):
    id: str
    title: str
    content: Dict[str, Any]
    owner_id: str
    created_at: datetime
    updated_at: datetime