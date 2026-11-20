# Intelligent Customer Support Agent

A production-ready Intelligent Customer Support Agent that automates customer service queries using Retrieval-Augmented Generation (RAG) powered by Claude Haiku 4.5 (with an optional Gemini fallback).

## Architecture
- **Backend**: FastAPI, Python 3.11
- **AI/ML**: Claude Haiku 4.5 by default (Gemini 1.5 Pro fallback available), ChromaDB (Vector Store), FastEmbed
- **Database**: PostgreSQL 16.2
- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Deployment**: Docker Compose

## Setup Instructions

### Prerequisites
- Docker & Docker Compose
- Anthropic Claude API Key (required for the default experience)
- Google Gemini API Key (optional, only needed if you want to keep using Gemini)

### Quick Start
1. Clone the repository.
2. Create `.env` file (already created if you followed the setup).
   ```bash
   cp .env.example .env
   # Edit .env and add your ANTHROPIC_API_KEY (set AI_PROVIDER=anthropic)
   ```
3. (Optional) If you need to rely on Gemini instead of Claude, set `AI_PROVIDER=gemini` and provide `GEMINI_API_KEY` in `.env`.
4. Start the services:
   ```bash
   docker-compose up --build
   ```
5. Access the application:
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

## Public help center

Run `python3 public-help/build.py` after editing customer guides and commit the generated `docs/index.html`. GitHub Pages publishes the `docs` directory on `main`.
