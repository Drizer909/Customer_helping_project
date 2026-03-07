-- Users table for ticket attribution
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Knowledge base source documents
CREATE TABLE IF NOT EXISTS knowledge_base (
    id SERIAL PRIMARY KEY,
    doc_title VARCHAR(500) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    embedding_id VARCHAR(100) UNIQUE,
    file_path VARCHAR(500),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tickets (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    query TEXT NOT NULL,
    retrieved_context TEXT, -- Context from vector DB
    model_response TEXT NOT NULL,
    resolution_time_ms INT,
    status VARCHAR(20) DEFAULT 'resolved',
    confidence_score FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Escalation tracking
CREATE TABLE IF NOT EXISTS escalations (
    id SERIAL PRIMARY KEY,
    ticket_id INT REFERENCES tickets(id),
    reason TEXT,
    escalated_to_email VARCHAR(255),
    resolved_at TIMESTAMP
);

-- Dashboard metrics cache
CREATE TABLE IF NOT EXISTS metrics_cache (
    date DATE PRIMARY KEY,
    total_tickets INT,
    avg_resolution_time_ms INT,
    escalation_rate FLOAT,
    automated_resolution_rate FLOAT
);

-- Add pgvector extension for hybrid search capability
CREATE EXTENSION IF NOT EXISTS vector;
