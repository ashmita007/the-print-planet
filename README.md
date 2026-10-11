# The Print Planet — Production B2B Product Website & Owner Management Portal

> **Industrial B2B Catalogue, Quotation System, and Owner Portal inspired by [Plastic ID Card Lanyard](https://www.plasticidcardlanyard.com/)**

---

## 1. Project Overview

**The Print Planet** is a high-performance, mobile-first B2B e-commerce and catalogue management platform engineered for an industrial manufacturer and supplier of identification products, digital lanyard rolls, PVC card holders, clips, hooks, RFID smart cards, and ID card fusion machinery.

### Key Highlights
- **Exact Reference Catalogue:** 63 verified industrial products across 10 categories scraped and normalized directly from `plasticidcardlanyard.com`.
- **Industrial Agency UI/UX:** Built with a disciplined palette (Navy `#17365D`, Deep Navy `#102742`, Orange `#E87832`, Industrial White/Grey `#F5F7FA`) with zero generic AI slop.
- **Mobile-First Responsive Design:** Fully verified and tested for 360px, 390px, 430px, 768px, 1024px, and 1440px displays with zero horizontal overflow.
- **Enterprise Owner Admin Portal (`/owner`):** Complete catalogue CRUD, Cloudinary image management, CSV/JSON bulk importer with deduplication strategies, RFQ enquiry management with status updating, and live business settings.
- **Dual API Integration:** Server-side internal Docker network rendering (`http://backend:8000`) and client-side browser requests (`http://localhost:8000`).
- **Single Docker Compose Orchestration:** PostgreSQL 16 Alpine, Django 5 + DRF backend, and Next.js 16 App Router frontend with healthchecks.

---

## 2. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Lucide React, React Hook Form, Zod |
| **Backend** | Python 3.12+, Django 5.1, Django REST Framework, django-filter, django-cors-headers, drf-spectacular (OpenAPI 3.0) |
| **Database** | PostgreSQL 16 Alpine (with fallback SQLite support for local unit tests) |
| **Media / Assets** | Cloudinary Python SDK (managed cloud storage) with graceful local media fallback |
| **Containerization** | Docker, Multi-stage Dockerfile, Docker Compose |

---

## 3. Reference Product Catalogue Coverage

The database contains the complete publicly listed reference catalogue with technical specifications, dimensions, materials, and pack details:

1. **Color ID Card Lanyard Roll (12 variants):** Indian Royal Blue, Purple, Orange, Black, Yellow, Golden Yellow, Sky Blue, Dark Green, Parrot Green, Red, White, Maroon (20mm & 16mm widths).
2. **Semi-Transparent PVC ID Card Holder (8 models):** V2 (Vertical), V4, H4 (Horizontal), H2H, V2H, etc.
3. **Crystal Clear PVC ID Card Holder (7 models):** VS-T, C2T, V4T, H2T, HS-T, etc.
4. **PVC ID Card Sticker Pasting Holder (4 models):** Sticky back adhesive models for industrial badges.
5. **Executive PVC ID Card Holder (3 models):** High-density executive frames.
6. **White Satin Digital Lanyard Roll (4 variants):** Single & double-sided digital sublimation rolls (16mm, 20mm, 25mm).
7. **ID Card Lanyard Hooks & Fittings (17 models):** Plastic hooks, dog hooks/side lever, wire hooks, fish hooks, crocodile clips, safety breakaway buckles, metal rivets.
8. **Digital Printed ID Card Lanyards (2 products):** Multi-color sublimation custom branded lanyards.
9. **RFID Smart Cards & Consumables (3 items):** Mifare 1K RFID cards, 125KHz LF cards, digital inkjet PVC sheets.
10. **ID Card Machinery & Equipment (3 machines):** A4 PVC fusing machine, digital lanyard heat press, heavy-duty card die cutter.

All raw datasets are documented in:
- `data/reference-products.json`
- `data/reference-products.csv`
- `docs/product-import-report.md`
- `docs/reference-analysis.md`
- `docs/design-system.md`

---

## 4. Single-Unit (All-in-One) Docker Deployment

Deploy the entire application (Next.js 16 standalone frontend, Django 5 REST backend, and Nginx reverse proxy) as a **single standalone container** on a single port.

Perfect for single-container hosting: **AWS App Runner, Google Cloud Run, Render, Railway, DigitalOcean App Platform, Fly.io, or any VPS**.

### Run with Docker CLI:
```bash
# 1. Build the single-unit image
docker build -t the-print-planet .

# 2. Run container (exposes unified port 80 and 8080)
docker run -d -p 80:80 -p 8080:80 --name print_planet the-print-planet
```

### Or Run with Single-Service Docker Compose:
```bash
docker compose -f docker-compose.single.yml up --build
```

**Unified Endpoints (Single Port):**
- **Public Website & Catalogue:** `http://localhost/` (or `http://localhost:8080/`)
- **Owner Admin Portal:** `http://localhost/owner/login` (`admin` / `AdminPass123!Secure`)
- **REST API:** `http://localhost/api/v1/`
- **Swagger Documentation:** `http://localhost/api/docs/`
- **Direct Media Assets:** `http://localhost/media/products/...`

---

## 5. Multi-Container Quick Start (PostgreSQL + Backend + Frontend)

If you prefer isolated microservice containers with a dedicated PostgreSQL database container:

```bash
cp .env.example .env
docker compose up --build
```

Docker Compose orchestrates:
1. `db`: PostgreSQL 16 Alpine container with healthchecks.
2. `backend`: Django REST API at `http://localhost:8000`.
3. `frontend`: Next.js App Router at `http://localhost:3000`.

---

## 5. Default Credentials & Portal URLs

### Public Website
- **Homepage:** `http://localhost:3000`
- **Product Catalogue:** `http://localhost:3000/products`
- **Category Browsing:** `http://localhost:3000/categories/semi-transparent-pvc-id-card-holder`
- **Live Search:** `http://localhost:3000/search?q=lanyard`
- **Request for Quote:** Interactive modal on every product page and `http://localhost:3000/contact`

### Owner Admin Portal
- **Owner Login:** `http://localhost:3000/owner/login`
  - **Username:** `admin`
  - **Password:** `AdminPass123!Secure`
- **Owner Dashboard:** `http://localhost:3000/owner/dashboard`
- **Catalogue Manager:** `http://localhost:3000/owner/products`
- **Category Manager:** `http://localhost:3000/owner/categories`
- **Enquiry / Lead Manager:** `http://localhost:3000/owner/enquiries`
- **Bulk CSV/JSON Import:** `http://localhost:3000/owner/import`
- **Business Profile & SEO Settings:** `http://localhost:3000/owner/settings`

### Backend & API Documentation
- **Django Admin:** `http://localhost:8000/admin/`
- **OpenAPI Schema (JSON):** `http://localhost:8000/api/schema/`
- **Swagger Interactive UI:** `http://localhost:8000/api/docs/`
- **API Root:** `http://localhost:8000/api/v1/`

---

## 6. Cloudinary Configuration

To enable Cloudinary cloud image uploads for products:
1. Open your `.env` file or export environment variables:
   ```env
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
2. Restart the backend container (`docker compose restart backend`).
3. In the Owner Portal (`/owner/products/new` or `/owner/products/[id]/edit`), uploaded images will automatically be delivered via Cloudinary CDN.
4. *Graceful Fallback:* If Cloudinary credentials are omitted or empty, the application automatically falls back to local disk storage (`/app/media/`) without breaking or throwing runtime errors.

---

## 7. Local Development Without Docker

### Quick Local Launch (Single Command)
```bash
# Automatically checks venv, migrates DB, seeds reference catalog, and starts both servers:
./run_local.sh
```

### Download / Seed Product Images Locally
```bash
# Downloads and caches all 63 authentic reference images into backend/media/products:
./seed_images.sh
```

### Manual Backend Setup (Django)
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run migrations and seed data (Automatically falls back to SQLite if PostgreSQL is not running locally)
python manage.py migrate
python manage.py seed_reference_data --create-owner

# Run server
python manage.py runserver 0.0.0.0:8000
```

### Manual Frontend Setup (Next.js)
```bash
cd frontend
npm install

# Start Next.js development server
npm run dev
# App will run on http://localhost:3000
```

---

## 8. Automated Testing & Verification

### Running Backend Tests (Django)
```bash
cd backend
USE_SQLITE=true ./venv/bin/python manage.py test apps
```
**Result:** 21 automated tests covering category serialization, product filtering, slug deduplication, authentication tokens, enquiry validation, and bulk import logic.

### Running Frontend Tests (Node.js Test Runner)
```bash
cd frontend
npm test
```
**Result:** 5 test suites covering API fallback handling, Zod enquiry form validation, specification parsing, duplicate import detection, and currency formatting.

### Running Frontend Linter & Production Build
```bash
cd frontend
npm run lint    # 0 errors
npm run build   # 19/19 routes statically prerendered and dynamically bundled
```

---

## 9. Architecture & Project Layout

```
the_print_planet/
├── backend/
│   ├── apps/
│   │   ├── catalog/         # Categories, Products, Images, Seed command
│   │   ├── enquiries/       # RFQ Quotes, Enquiries, Email notifications
│   │   ├── settings_app/    # SiteSettings, Contact details, SEO
│   │   └── authentication/  # Token auth, Owner profile, Security
│   ├── config/              # Django settings, URLs, WSGI
│   ├── Dockerfile           # Backend container
│   ├── requirements.txt     # Python dependencies
│   └── manage.py
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js 16 App Router pages
│   │   │   ├── categories/  # Category catalogue views
│   │   │   ├── products/    # Product listings & detail pages
│   │   │   ├── owner/       # Secure owner dashboard & management
│   │   │   ├── search/      # Live search page
│   │   │   └── contact/     # Contact & RFQ inquiry forms
│   │   ├── components/      # UI components (Navbar, Footer, ProductCard, etc.)
│   │   └── lib/             # API client, TypeScript definitions, utils
│   ├── tests/               # Client unit tests
│   ├── Dockerfile           # Frontend multi-stage container
│   ├── package.json
│   └── tailwind.config.ts
├── data/
│   ├── reference-products.json  # 63 verified products
│   ├── reference-products.csv   # Structured CSV export
│   └── extract_reference_products.py # Extraction and normalizer script
├── docs/
│   ├── reference-analysis.md    # Reference site breakdown & UX notes
│   ├── design-system.md         # Design system tokens and guidelines
│   └── product-import-report.md # Reference discovery and catalog audit
├── docker-compose.yml       # Production-ready compose configuration
├── .env.example             # Documented environment variables
└── README.md                # Project documentation
```

---

## 10. License

Developed for **The Print Planet**. Proprietary & Confidential.
