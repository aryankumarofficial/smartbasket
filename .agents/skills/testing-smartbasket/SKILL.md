# SmartBasket Testing Guide

## Project Overview
SmartBasket is an AI gifting platform with a turborepo monorepo structure:
- `apps/web` — Next.js frontend + API routes
- `apps/ai` — FastAPI ML microservice (Python)
- `packages/db` — Drizzle ORM database schema
- `packages/ui` — Shared UI components

## Prerequisites

### Node/Bun
- Node.js v22+ and Bun v1.3+ are required
- Run `bun install` from repo root to install all dependencies

### Python (for ML service)
- Python 3.12+
- Install deps: `cd apps/ai && pip install fastapi uvicorn pydantic numpy scikit-learn psycopg2-binary python-dotenv httpx`
- sentence-transformers is optional — the service degrades gracefully with deterministic fallback embeddings

### Database
- PostgreSQL is required for full end-to-end testing of Next.js API routes
- Without PostgreSQL, you can still test: ML FastAPI service, TypeScript compilation, code structure
- The Next.js app (`apps/web`) requires `DATABASE_URL` to start — without it, the Drizzle client throws on import

## Devin Secrets Needed
- `DATABASE_URL` — PostgreSQL connection string (required for Next.js API routes and event ingestion testing)
- No secrets needed for ML service testing in fallback mode

## What Can Be Tested Without PostgreSQL

### ML FastAPI Service (apps/ai)
Start the service:
```bash
cd apps/ai && uvicorn app.main:app --port 8000 --host 0.0.0.0
```

Testable endpoints:
- `GET /health` — Returns `{"status":"healthy","model_loaded":false,"version":"1.0.0"}` (when sentence-transformers not installed)
- `GET /` — Lists all service endpoints
- `GET /openapi.json` — Full OpenAPI spec
- `GET /docs` — Swagger UI

DB-dependent endpoints (return HTTP 500 with JSON error gracefully):
- `GET /recommend/{user_id}` — Needs user_profiles + products tables
- `GET /similar-products/{product_id}` — Needs products + embeddings tables
- `POST /search-rerank` — Needs products table
- `POST /embeddings/product` — Needs products table for saving
- `POST /embeddings/products/batch` — Needs products table

### Embedding Service (Python unit-level)
```python
from app.services.embedding_service import embedding_service

# Deterministic fallback: same input → same 384-dim vector
v1 = embedding_service.encode("test")
v2 = embedding_service.encode("test")
assert v1 == v2
assert len(v1) == 384

# Cosine similarity
assert embedding_service.cosine_similarity([1,0,0], [1,0,0]) == 1.0
assert embedding_service.cosine_similarity([1,0,0], [0,1,0]) == 0.0
```

### TypeScript Compilation
```bash
bun run typecheck  # Runs tsc --noEmit across all packages via turborepo
```
Expected: 3 packages pass (db, ui, web)

## What Requires PostgreSQL

### Next.js API Routes (apps/web)
These routes all import the Drizzle DB client which requires `DATABASE_URL`:
- `POST /api/events` — Event ingestion (single + batch)
- `GET /api/products` — Product listing
- `GET /api/recommendations` — Personalized recommendations
- `GET /api/search` — Full-text search
- `GET/POST /api/workers` — Background job management

### Full E2E Testing
1. Set up PostgreSQL
2. Set `DATABASE_URL` environment variable
3. Run migrations: `bun --cwd packages/db db:generate && bun --cwd packages/db db:migrate`
4. Start Next.js: `bun --cwd apps/web dev`
5. Start ML service: `cd apps/ai && uvicorn app.main:app --port 8000`
6. Test event ingestion: `curl -X POST http://localhost:3000/api/events -H 'Content-Type: application/json' -d '{"events":[{"eventType":"product_view","productId":"1","sessionId":"test"}]}'`

## Key Architecture Notes
- The ML service (FastAPI) connects to PostgreSQL directly via psycopg2, NOT through Drizzle
- The Next.js API routes use Drizzle ORM for all DB access
- Background workers are interval-based (setInterval), not queue-based
- Event tracking SDK batches events (10 events or 5s flush interval)
- Recommendation strategy: cold start (<5 views) → popular, warm (5+ views) → hybrid ML

## CI
- Only GitGuardian security checks run on PRs
- No automated test suite exists — testing is manual
- TypeScript compilation (`bun run typecheck`) should be verified before PRs

## Common Issues
- If `bun run typecheck` fails, check that `drizzle-orm` is in `apps/web/package.json` dependencies
- ML service might fail to import if psycopg2 is not installed — use `psycopg2-binary` for dev environments
- The embedding service logs warnings about sentence-transformers not being installed — this is expected behavior, not an error
