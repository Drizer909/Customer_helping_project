from fastapi import FastAPI, HTTPException, UploadFile, File, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.models import SupportRequest, SupportResponse, Ticket, MetricsResponse
from app.agents.support_agent import run_support_agent
from app.database import db
from app.ingest_pipeline import ingest_pipeline
from app.metrics import get_daily_metrics, get_trend_data
from datetime import date, datetime
import time
import shutil
import os

app = FastAPI(title="Support Agent API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await db.connect()
    # Ingest sample docs on startup if needed, or rely on manual trigger
    # await ingest_pipeline.ingest_directory("knowledge_docs")

@app.on_event("shutdown")
async def shutdown():
    await db.disconnect()

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.post("/api/v1/support", response_model=SupportResponse)
async def support_endpoint(request: SupportRequest):
    start_time = time.time()
    
    # 1. Get User ID (create if not exists)
    pool = await db.get_pool()
    async with pool.acquire() as conn:
        user_id = await conn.fetchval("""
            INSERT INTO users (email, name) VALUES ($1, $2)
            ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
            RETURNING id
        """, request.email, request.name)

        # 2. Run Agent
        result = await run_support_agent(request.query)
        
        resolution_time_ms = int((time.time() - start_time) * 1000)
        status = "escalated" if result['needs_escalation'] else "resolved"

        # 3. Log Ticket
        ticket_id = await conn.fetchval("""
            INSERT INTO tickets (user_id, query, retrieved_context, gemini_response, resolution_time_ms, status, confidence_score)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id
        """, user_id, request.query, str(result['sources']), result['response'], resolution_time_ms, status, result['confidence_score'])

        # 4. Handle Escalation
        if result['needs_escalation']:
            await conn.execute("""
                INSERT INTO escalations (ticket_id, reason, escalated_to_email)
                VALUES ($1, $2, $3)
            """, ticket_id, "Low confidence or explicit escalate", "human@support.com")

    return SupportResponse(
        response=result['response'],
        confidence_score=result['confidence_score'],
        sources=result['sources'],
        status=status
    )

@app.post("/api/v1/knowledge/ingest")
async def ingest_document(file: UploadFile = File(...)):
    file_location = f"knowledge_docs/{file.filename}"
    with open(file_location, "wb+") as file_object:
        shutil.copyfileobj(file.file, file_object)
    
    with open(file_location, "r") as f:
        content = f.read()
        
    await ingest_pipeline.ingest_file(file_location, content, file.filename)
    return {"status": "ingested", "filename": file.filename}

@app.get("/api/v1/tickets/{user_email}")
async def get_user_tickets(user_email: str):
    pool = await db.get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch("""
            SELECT t.* 
            FROM tickets t
            JOIN users u ON t.user_id = u.id
            WHERE u.email = $1
            ORDER BY t.created_at DESC
        """, user_email)
        return [dict(row) for row in rows]

@app.get("/api/v1/dashboard/metrics")
async def get_dashboard_metrics(start_date: date = Query(...), end_date: date = Query(...)):
    # For simplicity, returning metrics for the end_date or calculating aggregate
    # The requirement says "Returns: {'metrics': {...}, 'trend_data': [...]}"
    
    # Get trend data
    trend_data = await get_trend_data(days=30)
    
    # Get aggregate metrics for the period (simplified to daily for now or just today)
    # Let's just return the latest day's metrics as "current" metrics
    latest_metrics = await get_daily_metrics(end_date)
    
    return {"metrics": latest_metrics, "trend_data": trend_data}

@app.get("/api/v1/dashboard/recent-tickets")
async def get_recent_tickets(limit: int = 50):
    pool = await db.get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch("""
            SELECT t.id, u.email, t.query, t.status, t.confidence_score, t.created_at, t.resolution_time_ms
            FROM tickets t
            JOIN users u ON t.user_id = u.id
            ORDER BY t.created_at DESC
            LIMIT $1
        """, limit)
        return [dict(row) for row in rows]

@app.get("/api/v1/dashboard/kb-stats")
async def get_kb_stats():
    pool = await db.get_pool()
    async with pool.acquire() as conn:
        total_docs = await conn.fetchval("SELECT COUNT(*) FROM knowledge_base")
        last_updated = await conn.fetchval("SELECT MAX(last_updated) FROM knowledge_base")
        titles = await conn.fetch("SELECT doc_title FROM knowledge_base")
        
        return {
            "total_docs": total_docs,
            "last_updated": last_updated,
            "doc_titles": [r['doc_title'] for r in titles]
        }
