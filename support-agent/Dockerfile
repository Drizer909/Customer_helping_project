FROM python:3.11.7-slim

WORKDIR /app

# Install system dependencies for building python packages
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install uv
RUN pip install uv

# Copy project files
COPY pyproject.toml .
COPY app/ app/
COPY migrations/ migrations/
COPY knowledge_docs/ knowledge_docs/

# Install dependencies
RUN uv pip install --system -r pyproject.toml

# Expose port
EXPOSE 8000

# Run application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
