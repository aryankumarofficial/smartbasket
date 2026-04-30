# SmartBasket

SmartBasket is an AI-powered gifting and e-commerce platform built as a monorepo with a Next.js application (`apps/web`), a FastAPI ML service (`apps/ai`), and shared typed DB/query packages (`packages/db`).

## Project Overview

SmartBasket combines a traditional storefront with event-driven personalization:

- AI recommendations (cold-start + hybrid scoring + ML rerank)
- behavioral event tracking pipeline (`/api/events` -> DB -> workers)
- admin operations panel (products, orders, analytics, uploads)
- ML integration for recommendations, similar products, reranking, and embeddings

## Tech Stack

- Frontend: Next.js App Router, Zustand, TanStack Query
- Backend: Next.js Route Handlers (Node runtime patterns), PostgreSQL + Drizzle ORM
- ML: FastAPI service with `sentence-transformers` embeddings and hybrid recommendation logic
- Infra: Redis (BullMQ), Resend (email), object storage abstraction (R2/Cloudinary/ImageKit), Bun + Turborepo

## Feature Set

- authentication: JWT access token + refresh token HTTP-only cookie rotation
- RBAC: `user`, `admin`, `super_admin` role checks on protected APIs
- product catalog: structured metadata + tagging (`manual_tags`, `ai_tags`, `final_tags`)
- order lifecycle: user order APIs + admin order management
- event tracking: product/cart/wishlist/search/session + unified `user_events`
- recommendations: cache-backed local strategy + AI service integration
- admin dashboard: analytics, products, orders, upload flows
- email system: queue-based outbound mail via BullMQ + Resend + React Email templates

## Monorepo Structure

```txt
apps/
  web/                  # Next.js app (UI + API + workers)
  ai/                   # FastAPI ML service
packages/
  db/                   # Drizzle schema + query layer
  ui/                   # Shared UI components
  eslint-config/
  typescript-config/
scripts/
  seed.ts               # Root seeding entrypoint
```

## Getting Started

### Prerequisites

- Bun `>=1.3`
- Node.js `>=20`
- PostgreSQL (with pgvector extension enabled for vector features)
- Redis
- Python `>=3.12` (for `apps/ai`)

### Installation

```bash
git clone <repo-url>
cd smartbasket
bun install
cp .env.example .env
```

### Database Setup

```bash
bun --cwd packages/db db:migrate
```

### Seed Data (production-safe)

```bash
bun run seed
```

Seeding guard:

- `scripts/seed.ts` refuses to run in production unless `ALLOW_PRODUCTION_SEED=true`.

### Run Services

- Web app (frontend + API):
  ```bash
  bun run --filter=web dev
  ```
- Workers:
  ```bash
  bun --cwd apps/web run workers
  ```
- ML service (optional but recommended for full recommendation quality):
  ```bash
  cd apps/ai
  pip install -r requirements.txt
  uvicorn app.main:app --reload --port 8000
  ```

## Script Reference

Root (`package.json`):

- `bun run dev` - turbo dev for workspace
- `bun run build` - turbo build
- `bun run typecheck` - turbo typecheck
- `bun run seed` - run full bootstrap seed pipeline

Web (`apps/web/package.json`):

- `bun run --filter=web dev` - start Next.js dev server
- `bun run --filter=web build` - production build
- `bun run --filter=web start` - start production server
- `bun run --filter=web workers` - start BullMQ workers

DB (`packages/db/package.json`):

- `bun --cwd packages/db db:generate` - generate migrations
- `bun --cwd packages/db db:migrate` - apply migrations
- `bun --cwd packages/db db:push` - push schema directly

## API and Worker Highlights

Key API route groups in `apps/web/app/api`:

- `auth/*`: login/register/refresh/logout/forgot-password
- `products/*`, `search/*`, `recommendations/*`, `similar-products/*`
- `user/*`: account/cart/wishlist
- `orders/*`
- `admin/*`: products/orders/stats/analytics/uploads
- `events`: behavioral ingestion
- `workers`: queue health + manual job trigger

Key queue jobs in `apps/web/lib/workers/queues.ts`:

- profile aggregation
- embedding generation
- recommendation precompute
- session/cache cleanup
- product tag generation + tag signal updates
- email delivery

## Configuration

All environment variables are documented in `.env.example`.

Most important required variables:

- `DATABASE_URL`
- `REDIS_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `RESEND_API_KEY`
- `AI_SERVICE_URL`

For storage uploads:

- Set `UPLOAD_PROVIDER` to `r2`, `cloudinary`, or `imagekit`
- Provide matching provider credentials/base URLs
