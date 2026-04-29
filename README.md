# SmartBasket – AI-Powered Gifting Platform

## Overview

SmartBasket is an **AI-powered gifting platform that functions as a decision engine rather than a traditional e-commerce store**, designed to eliminate the complexity of choosing the right gift. Instead of browsing large product catalogs, users express intent through natural language or structured inputs such as recipient type, occasion, budget, and preferences. The system interprets this input, combines it with behavioral data (views, searches, purchases), and generates personalized, explainable recommendations. The experience is centered around AI-driven entry points such as the Gift Finder and conversational assistant, which guide users toward decisions instead of overwhelming them with options. Once a selection is made, the system transitions into a seamless purchase flow including cart management, checkout, and payment processing.

---

## Tech Stack

### Frontend

- Next.js (App Router)
- React
- Tailwind CSS
- shadcn/ui
- Zustand (UI state management)
- TanStack Query (server state, caching, API sync)

### Backend

- Next.js API Routes (core backend: auth, cart, orders, events)
- FastAPI (AI / ML service layer)

### Database

- PostgreSQL (Neon / Supabase)
- Drizzle ORM
- pgvector (optional, for embeddings)

### AI / ML Layer

- Hybrid recommendation engine (rules + embeddings + LLM)
- Semantic search (embedding-based)
- Gift Finder (intent extraction via LLM)
- Conversational assistant (RAG-like)

### External Services

- Claude API (LLM reasoning + ranking)
- Razorpay (payments)
- Cloudinary (media storage)
- Redis (optional caching)

### Infrastructure

- Bun (package manager)
- Turborepo (monorepo orchestration)
- Docker (optional)
- Vercel (frontend)
- Railway / Render (AI service)

---

## Monorepo Structure

```
apps/
  web/              # Next.js (frontend + API routes)
    app/
      api/
        products/     # Product listing & detail APIs
        events/       # Event ingestion API (behavioral tracking)
        recommendations/  # Personalized recommendations API
        search/       # Full-text search with filters
        workers/      # Background job management API
    lib/
      services/       # Service layer (recommendation, search, events, profiles)
      tracking/       # Frontend event tracking SDK
      workers/        # Background workers (profile, embeddings, cache, cleanup)
      types/          # Shared TypeScript types
    hooks/            # React hooks (useTracking)
  ai/               # FastAPI (AI/ML service)
    app/
      routers/        # API endpoint routers
      services/       # ML services (embeddings, recommendations)
      models/         # Pydantic schemas
      utils/          # Database utilities

packages/
  db/               # Drizzle ORM (schema + queries)
    src/
      schema/         # 16 tables: core + behavioral + ML-ready
      queries/        # Query functions for all tables
  ui/               # Shared UI components
  types/            # Shared types
  config/           # Shared configs
```

---

## Getting Started

### Prerequisites

- Node.js >= 20
- Bun >= 1.3
- Python >= 3.12 (for AI service)
- PostgreSQL database

### Install

```bash
bun install
```

### Environment Variables

Create a `.env` file in the root:

```
DATABASE_URL=your_postgres_url
AI_SERVICE_URL=http://localhost:8000
ANTHROPIC_API_KEY=your_key
RAZORPAY_KEY_ID=xxx
RAZORPAY_KEY_SECRET=xxx
```

### Run Web App

```bash
bun run dev
```

### Run AI Service

```bash
cd apps/ai
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Run DB Migrations

```bash
bun --cwd packages/db db:generate
bun --cwd packages/db db:migrate
```

---

## Database Schema

### Core Tables

| Table | Purpose |
|-------|---------|
| users | Authentication + profile |
| products | Product catalog with rich metadata |
| categories | Hierarchical product categories |
| orders | Purchase records |
| order_items | Line items per order |
| carts | Cart state per user |
| cart_items | Items in cart |

### Behavioral Tracking Tables

| Table | Purpose |
|-------|---------|
| product_views | Page views with duration tracking |
| cart_events | Add/remove/update cart actions |
| wishlist_events | Wishlist add/remove actions |
| search_logs | Search queries with filters and results |
| user_sessions | Session lifecycle tracking |
| user_events | Generic event audit trail |

### ML-Ready Tables

| Table | Purpose |
|-------|---------|
| user_profiles | Aggregated behavioral profiles |
| product_embeddings | Vector storage for products |
| user_embeddings | Vector storage for users |
| recommendation_cache | Precomputed recommendations |
| preferences | User preference settings |

---

## API Reference

### Products

- `GET /api/products` — List products (filters: category, minPrice, maxPrice)
- `GET /api/products/:id` — Get product by ID

### Events

- `POST /api/events` — Ingest tracking events (single or batch)

### Recommendations

- `GET /api/recommendations?userId=` — Personalized recommendations
- `GET /api/recommendations/similar/:productId` — Similar products

### Search

- `GET /api/search?q=` — Full-text search with filters, sorting, pagination

### Workers

- `GET /api/workers` — Get background job status
- `POST /api/workers` — Trigger a specific background job

### AI Service (FastAPI)

- `POST /recommend/:user_id` — ML-powered recommendations
- `GET /similar-products/:product_id` — Embedding-based similarity
- `POST /search-rerank` — Semantic search reranking
- `POST /embeddings/product` — Generate product embedding
- `POST /embeddings/products/batch` — Batch embedding generation
- `GET /health` — Health check

---

## Event Tracking

The system captures deep user behavior through a multi-layer pipeline:

```
Frontend (SDK) → /api/events → Database (raw logs) → Workers → ML Service
```

### Tracked Events

- Product views (with time spent)
- Cart actions (add, remove, quantity change)
- Wishlist actions (add, remove)
- Search queries and result clicks
- Purchases
- Session lifecycle (start, end, device info)

### Frontend Integration

```tsx
import { useTracking } from "@/hooks/use-tracking"

function ProductPage({ product }) {
  const { trackProductView, trackCartAdd } = useTracking(userId)

  useEffect(() => {
    const endTracking = trackProductView(product.id, "search")
    return endTracking // tracks view duration on unmount
  }, [product.id])

  return <button onClick={() => trackCartAdd(product.id)}>Add to Cart</button>
}
```

---

## Background Workers

| Job | Interval | Purpose |
|-----|----------|---------|
| Profile Aggregation | 1 hour | Rebuild user profiles from behavioral data |
| Embedding Generation | 6 hours | Generate product embeddings via ML service |
| Recommendation Precompute | 30 min | Pre-cache recommendations for active users |
| Session Cleanup | Daily | Remove old sessions (> 30 days) |
| Cache Cleanup | 15 min | Remove expired recommendation cache entries |

---

## Recommendation Strategy

| User State | Strategy | Details |
|-----------|----------|---------|
| Anonymous / New | Cold Start | Popular + trending + wishlisted products |
| < 5 views | Cold Start | Same as above with context boosting |
| Active (5+ views) | Hybrid | ML service → local rule-based fallback |
| Real-time (search/chat) | Real-time | Bypasses cache, fresh computation |

---

## Key Concepts

- Event-driven system powers personalization
- ML is used for ranking, not as the core system
- Strong separation between UI state and server state
- AI layer operates independently via FastAPI
- Hybrid recommendation: rules + embeddings + LLM

---

## Development Workflow

1. Update schema → generate migration
2. Add query in `@workspace/db`
3. Create/update service in `lib/services/`
4. Add API route in `app/api/`
5. Fetch via TanStack Query
6. Update UI via Zustand

---

## Status

- DB schema + relations (16 tables)
- Monorepo setup (Bun + Turbo)
- Query layer (12 query modules)
- Service layer (4 services)
- API routes (products, events, recommendations, search, workers)
- ML FastAPI service (recommendations, embeddings, search rerank)
- Background workers (profile, embeddings, cache, cleanup)
- Event tracking pipeline (frontend SDK → API → DB → Workers → ML)
- Recommendation strategies (cold start, hybrid, real-time)
