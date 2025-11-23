# Intelligent Customer Support Agent

A production-ready Intelligent Customer Support Agent that automates customer service queries using Retrieval-Augmented Generation (RAG) with Gemini 1.5 Pro.

## Architecture
- **Backend**: FastAPI, Python 3.11
- **AI/ML**: Gemini 1.5 Pro, ChromaDB (Vector Store), FastEmbed
- **Database**: PostgreSQL 16.2
- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Deployment**: Docker Compose

## Setup Instructions

### Prerequisites
- Docker & Docker Compose
- Google Gemini API Key

### Quick Start
1. Clone the repository.
2. Create `.env` file (already created if you followed the setup).
   ```bash
   cp .env.example .env
   # Edit .env and add your GEMINI_API_KEY
   ```
3. Start the services:
   ```bash
   docker-compose up --build
   ```
4. Access the application:
   - **Dashboard**: http://localhost:3000
   - **Backend API**: http://localhost:8000/docs

## Documentation

### Backend API
The API documentation is available at `http://localhost:8000/docs` (Swagger UI).
Key endpoints:
- `POST /api/v1/support`: Submit a support query.
- `POST /api/v1/knowledge/ingest`: Upload knowledge base documents.
- `GET /api/v1/dashboard/metrics`: Get dashboard metrics.

### Dashboard
The dashboard provides real-time insights into support ticket volume, resolution rates, and agent performance.
- **Overview**: KPI cards and trend charts.
- **Tickets**: View and manage support tickets.
- **Knowledge Base**: Manage ingested documents.
- **Test Agent**: Playground to test the RAG agent.

## Testing
- **Backend**: Run `pytest` in the `support-agent` directory.
- **Dashboard**: Run `npm test` in the `dashboard` directory.

## Cost Estimation
- **Gemini 1.5 Pro**: Free tier available. Paid tier pricing depends on token usage.
- **Hosting**: Can be hosted on any Docker-compatible platform (AWS ECS, Google Cloud Run, DigitalOcean).

## License
MIT
