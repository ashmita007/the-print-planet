# Render Single Docker & Cloudinary Deployment Guide

This guide details the single Docker container deployment for **The Print Planet** on [Render](https://render.com), pairing the unified Next.js + Django image with Render Managed PostgreSQL and [Cloudinary](https://cloudinary.com) for image storage and CDN delivery.

---

## 1. Single-Container Architecture

```
                          Render Ingress ($PORT)
                                    │
                                    ▼
                     ┌──────────────────────────────┐
                     │  All-in-One Docker Container │
                     │                              │
                     │   ┌──────────────────────┐   │
                     │   │   Nginx (Port $PORT) │   │
                     │   └──────────┬───────────┘   │
                     │              │               │
                     │      ┌───────┴───────┐       │
                     │      ▼               ▼       │
                     │ ┌─────────┐    ┌──────────┐  │
                     │ │ Next.js │    │  Django  │  │
                     │ │ (3000)  │    │  (8000)  │  │
                     │ └─────────┘    └────┬─────┘  │
                     └─────────────────────┼────────┘
                                           │
                        ┌──────────────────┴──────────────────┐
                        │                                     │
                        ▼                                     ▼
           ┌────────────────────────┐             ┌───────────────────────┐
           │ Render PostgreSQL (DB) │             │ Cloudinary Image CDN  │
           │  the-print-planet-db   │             │   (Product Media)     │
           └────────────────────────┘             └───────────────────────┘
```

### Why Single-Unit Docker?
1. **Zero CORS Issues**: Both frontend and backend share the same origin URL under Nginx.
2. **Simplified Infrastructure**: 1 Web Service + 1 Database on Render.
3. **Optimized Networking**: Internal communication between Next.js and Django occurs over `127.0.0.1` without public internet latency.
4. **Cloudinary Persistence**: Solves container ephemeral disk wipes by storing product media permanently on Cloudinary CDN.

---

## 2. Quick Deploy via Render Blueprint (`render.yaml`)

The repository includes a production [`render.yaml`](./render.yaml) blueprint:

1. **Push Changes to GitHub**:
   ```bash
   git push origin main
   ```
2. **Open Render Dashboard**:
   - Go to [dashboard.render.com](https://dashboard.render.com).
   - Click **New +** -> **Blueprint**.
   - Select your repository (`ashmita007/the-print-planet`).
3. **Render Automatically Provisions**:
   - **`the-print-planet-db`**: Managed PostgreSQL database.
   - **`the-print-planet-app`**: Single-unit Docker web service running [`Dockerfile`](./Dockerfile).
4. **Set Cloudinary Credentials**:
   In the Render Dashboard under **the-print-planet-app** -> **Environment**:
   ```env
   CLOUDINARY_URL=cloudinary://<API_KEY>:<API_SECRET>@<CLOUD_NAME>
   ```
   *(Obtain this from your Cloudinary Dashboard under Programmable Media -> API Keys)*.

---

## 3. Container Startup Lifecycle (`docker/entrypoint.sh`)

When the single Docker container starts on Render:
1. **Dynamic Port Adaptation**: Reads `$PORT` assigned by Render (e.g. `10000`) and updates `/etc/nginx/conf.d/default.conf`.
2. **Database Migrations**: Runs `python manage.py migrate --noinput` against PostgreSQL (`DATABASE_URL`).
3. **Static Collection**: Runs `python manage.py collectstatic --noinput` to prepare Django Admin and Swagger assets for Nginx.
4. **Catalog Seeding**: Runs `python manage.py seed_reference_data --create-owner` to bootstrap products, categories, and the `admin` owner user.
5. **Cloudinary Media Sync**: If `CLOUDINARY_URL` is set, scans images and uploads them to Cloudinary CDN via `python manage.py sync_media_to_cloudinary`.
6. **Supervisor Launch**: Starts Gunicorn (Django 8000), Node.js (Next.js 3000), and Nginx ($PORT) simultaneously with automatic process restart.

---

## 4. Manual Cloudinary Media Sync

To trigger a media sync manually inside the running container:
1. Open Render Dashboard -> **the-print-planet-app** -> **Shell**.
2. Run:
   ```bash
   cd /app/backend
   python manage.py sync_media_to_cloudinary
   ```
   *(Add `--force` to re-upload existing assets if updated on disk)*.

---

## 5. Local Docker Testing

To test the unified single-container build locally:
```bash
# Build and run the single-unit container on port 8080:
docker compose -f docker-compose.single.yml up --build
```
Access the application at `http://localhost:8080`.
Admin credentials:
- **Username**: `admin`
- **Password**: `AdminPass123!Secure`
