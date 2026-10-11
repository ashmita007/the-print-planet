# ==============================================================================
# The Print Planet — Production Single-Unit (All-in-One) Dockerfile
# Packages Django 5 (Backend), Next.js 16 (Frontend), and Nginx (Proxy) into 1 image
# ==============================================================================

# STAGE 1: Frontend Build
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# STAGE 2: Unified Production Runner
FROM python:3.12-slim-bookworm AS runner

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV NODE_ENV=production
ENV PORT=80

# Install system dependencies: Nginx, Supervisor, Node.js 20 runtime, curl
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    gnupg \
    nginx \
    supervisor \
    libpq-dev \
    build-essential \
    procps \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Python backend dependencies
WORKDIR /app/backend
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy Backend Source and Reference Catalog
COPY backend/ /app/backend/
COPY data/ /app/data/

# Copy Frontend Standalone Distribution from Builder
WORKDIR /app/frontend
COPY --from=frontend-builder /app/frontend/.next/standalone ./
COPY --from=frontend-builder /app/frontend/.next/static ./.next/static
COPY --from=frontend-builder /app/frontend/public ./public

# Setup Nginx and Supervisor configurations
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Ensure storage directories exist
RUN mkdir -p /app/backend/media/products /var/log/supervisor

WORKDIR /app
EXPOSE 80

ENTRYPOINT ["/app/entrypoint.sh"]
