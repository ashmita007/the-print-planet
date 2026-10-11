FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies for PostgreSQL and building
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies
COPY backend/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application and reference data
COPY backend/ /app/
COPY data/ /app/data/

# Collect static files directory
RUN mkdir -p /app/staticfiles /app/media

EXPOSE 8000

# Entrypoint script to run migrations and start server
CMD ["sh", "-c", "python manage.py migrate --noinput && python manage.py seed_reference_data --create-owner && gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 3 --timeout 120"]
