from asyncio import to_thread
from typing import List, TypedDict
from app.rag_engine import rag_engine

class SupportResult(TypedDict):
    response: str
    needs_escalation: bool
    confidence_score: float
    sources: List[str]

async def run_support_agent(query: str) -> SupportResult:
    # We use the RAG engine as the primary logic as per instructions for rag_engine.py
    response_text, sources, confidence = await to_thread(rag_engine.generate_response, query)
    
    needs_escalation = False
    if "ESCALATE:" in response_text or confidence < 0.4:
        needs_escalation = True
        
    return SupportResult(
        response=response_text,
        needs_escalation=needs_escalation,
        confidence_score=confidence,
        sources=sources
    )
