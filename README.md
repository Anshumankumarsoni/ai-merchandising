# AI Product Catalog & Merchandising Assistant

A production-ready full-stack platform for AI-powered ecommerce merchandising.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, TailwindCSS, React Query, Recharts |
| Backend | Python 3.12, Django 5, Django REST Framework, JWT |
| AI | OpenAI GPT-4o-mini, Google Gemini 1.5 Flash |
| Workers | Celery 5, Redis 7 |
| Database | PostgreSQL 16 |
| Deploy | Docker, Docker Compose, GitHub Actions |

---

## Quick Start (Development)

### 1. Clone & configure

```bash
git clone <repo>
cd ai-merchandising
cp .env.example .env
# Edit .env — add your OPENAI_API_KEY and GEMINI_API_KEY
```

### 2. Start with Docker Compose

```bash
docker compose -f docker-compose.dev.yml up --build
```

Services:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Swagger docs: http://localhost:8000/api/docs/
- ReDoc: http://localhost:8000/api/redoc/

### 3. Create superuser

```bash
docker compose -f docker-compose.dev.yml exec backend python manage.py createsuperuser
```

---

## Local Development (without Docker)

### Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements/development.txt

# Set env vars (or use .env file with python-decouple)
export DJANGO_SECRET_KEY=dev-secret
export POSTGRES_HOST=localhost
export OPENAI_API_KEY=sk-...
export GEMINI_API_KEY=...

python manage.py migrate
python manage.py createsuperuser
python manage.py runserver

# In another terminal — start Celery worker
celery -A celery_tasks.celery worker --loglevel=info
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Running Tests

### Backend

```bash
cd backend
pytest                          # all tests with coverage
pytest apps/authentication/     # specific app
pytest -k test_login            # specific test
```

### Frontend

```bash
cd frontend
npm run test          # single run
npm run test:watch    # watch mode
npm run test:coverage # with coverage report
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register/` | Register user |
| POST | `/api/v1/auth/login/` | Login, get JWT tokens |
| POST | `/api/v1/auth/logout/` | Blacklist refresh token |
| POST | `/api/v1/auth/token/refresh/` | Refresh access token |
| GET | `/api/v1/auth/me/` | Current user profile |
| GET/POST | `/api/v1/catalog/products/` | List / create products |
| GET/PATCH/DELETE | `/api/v1/catalog/products/{id}/` | Product detail |
| POST | `/api/v1/catalog/products/{id}/update_inventory/` | Update stock |
| GET | `/api/v1/catalog/products/{id}/inventory_history/` | Stock history |
| GET/POST | `/api/v1/catalog/categories/` | Categories |
| GET/POST | `/api/v1/catalog/brands/` | Brands |
| POST | `/api/v1/ai/generate-description/` | AI description (async) |
| POST | `/api/v1/ai/classify-product/` | AI classification (async) |
| POST | `/api/v1/ai/analyze-reviews/` | Sentiment analysis (async) |
| POST | `/api/v1/ai/analyze-listing/` | Listing quality (sync) |
| GET | `/api/v1/ai/history/` | AI analysis history |
| GET | `/api/v1/analytics/dashboard/` | Dashboard stats |
| GET | `/api/v1/analytics/inventory/` | Inventory breakdown |
| GET | `/api/v1/analytics/ai-usage/` | AI usage stats |

Full interactive docs at: `http://localhost:8000/api/docs/`

---

## Project Structure

```
ai-merchandising/
├── backend/
│   ├── apps/
│   │   ├── authentication/   # User model, JWT auth, RBAC
│   │   ├── catalog/          # Products, Categories, Brands
│   │   ├── ai_tools/         # AI Analysis model + views
│   │   ├── reviews/          # Customer reviews
│   │   └── analytics/        # Dashboard aggregations
│   ├── services/ai/          # OpenAI & Gemini service wrappers
│   ├── celery_tasks/         # Async background tasks
│   ├── common/               # Pagination, permissions, exceptions
│   └── config/               # Django settings (base/dev/prod)
├── frontend/
│   └── src/
│       ├── api/              # Axios API calls
│       ├── components/       # Layout + shared UI components
│       ├── hooks/            # React Query hooks
│       ├── pages/            # Route-level page components
│       ├── store/            # Zustand auth store
│       └── types/            # TypeScript interfaces
├── docker/                   # Postgres init, nginx config
├── .github/workflows/        # GitHub Actions CI/CD
├── docker-compose.yml        # Production
└── docker-compose.dev.yml    # Development with hot reload
```

---

## RBAC Roles

| Role | Can Read | Can Create/Edit | Can Delete | Admin Panel |
|------|----------|-----------------|------------|-------------|
| analyst | ✅ | ❌ | ❌ | ❌ |
| manager | ✅ | ✅ | ✅ | ❌ |
| admin | ✅ | ✅ | ✅ | ✅ |

---

## Production Deployment

```bash
cp .env.example .env
# Set production values: DJANGO_DEBUG=False, strong SECRET_KEY, real DB credentials, API keys

docker compose up --build -d
```
