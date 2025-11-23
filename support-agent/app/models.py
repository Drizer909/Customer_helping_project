from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class SupportRequest(BaseModel):
    email: EmailStr
    query: str
    name: Optional[str] = None

class SupportResponse(BaseModel):
    response: str
    confidence_score: float
    sources: List[str] = []
    status: str = "resolved"

class IngestRequest(BaseModel):
    pass # File upload handled separately

class Ticket(BaseModel):
    id: int
    user_id: int
    query: str
    retrieved_context: Optional[str]
    gemini_response: str
    resolution_time_ms: Optional[int]
    status: str
    confidence_score: Optional[float]
    created_at: datetime

class MetricsResponse(BaseModel):
    metrics: Dict[str, Any]
    trend_data: List[Dict[str, Any]]
