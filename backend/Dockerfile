FROM python:3.11-slim

WORKDIR /app

# Install system deps for psycopg2 and docker
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libpq-dev curl && \
    rm -rf /var/lib/apt/lists/*

# Install Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app code
COPY . .

# Initialize database
RUN python init_db.py || true

EXPOSE 8000

CMD ["sh", "-c", "python init_db.py && gunicorn -w 2 -b 0.0.0.0:${PORT:-8000} 'app:create_app()' --timeout 120"]
