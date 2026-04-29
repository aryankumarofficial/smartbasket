# System Architecture

## Core Principle

> This system is a **decision engine with commerce attached**
> ML improves ranking — it is not the system itself.

---

## High-Level System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND LAYER                          │
│  Next.js (App Router) + React + Tailwind + shadcn/ui       │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────────┐  │
│  │  Zustand  │  │ TanStack │  │  Event Tracking SDK      │  │
│  │ (UI State)│  │  Query   │  │  (batching, sessions)    │  │
│  └──────────┘  └──────────┘  └──────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    API LAYER (Next.js)                       │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌─────────┐ │
│  │ /products │  │  /events  │  │  /search   │  │/workers │ │
│  └───────────┘  └───────────┘  └───────────┘  └─────────┘ │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ /recommendations  ·  /recommendations/similar/:id    │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │
          ┌────────────┼───────────────┐
          ▼            ▼               ▼
┌──────────────┐ ┌───────────┐ ┌─────────────────┐
│  SERVICE     │ │ WORKERS   │ │  AI SERVICE      │
│  LAYER       │ │           │ │  (FastAPI)        │
│              │ │ Profile   │ │                   │
│ EventTracker │ │ Aggregate │ │ /recommend/:id    │
│ UserProfile  │ │ Embeddings│ │ /similar/:id      │
│ Search       │ │ Rec Cache │ │ /search-rerank    │
│ Recommender  │ │ Cleanup   │ │ /embeddings       │
└──────┬───────┘ └─────┬─────┘ └────────┬──────────┘
       │               │                │
       └───────────────┼────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER                            │
│                  PostgreSQL + Drizzle ORM                    │
│                                                             │
│  ┌─────────┐ ┌──────────┐ ┌───────────┐ ┌───────────────┐ │
│  │  Core   │ │Behavioral│ │  ML-Ready │ │  Commerce     │ │
│  │ Tables  │ │ Tracking │ │  Tables   │ │  Tables       │ │
│  │         │ │          │ │           │ │               │ │
│  │ users   │ │ product_ │ │ user_     │ │ carts         │ │
│  │products │ │  views   │ │  profiles │ │ cart_items    │ │
│  │categor- │ │ cart_    │ │ product_  │ │ orders        │ │
│  │  ies    │ │  events  │ │  embed-   │ │ order_items  │ │
│  │         │ │ wishlist_│ │   dings   │ │               │ │
│  │         │ │  events  │ │ user_     │ │               │ │
│  │         │ │ search_  │ │  embed-   │ │               │ │
│  │         │ │  logs    │ │   dings   │ │               │ │
│  │         │ │ user_    │ │ rec_cache │ │               │ │
│  │         │ │  sessions│ │           │ │               │ │
│  │         │ │ user_    │ │           │ │               │ │
│  │         │ │  events  │ │           │ │               │ │
│  └─────────┘ └──────────┘ └───────────┘ └───────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Layer Breakdown

### 1. Frontend Layer

Responsibilities:
- UI rendering
- User interaction
- Event tracking (via SDK)

#### State Management

| Type | Tool | Responsibility |
|------|------|---------------|
| UI State | Zustand | modals, cart UI, chat UI |
| Server State | TanStack Query | API data, caching |
| Tracking | Event SDK | behavioral data capture |

---

### 2. API Layer (Next.js)

#### Routes

| Route | Method | Purpose |
|-------|--------|---------|
| /api/products | GET | Product listing with filters |
| /api/products/:id | GET | Product detail |
| /api/events | POST | Event ingestion (single/batch) |
| /api/recommendations | GET | Personalized recommendations |
| /api/recommendations/similar/:id | GET | Similar products |
| /api/search | GET | Full-text search |
| /api/workers | GET/POST | Job status & manual triggers |

#### Service Layer

| Service | Responsibility |
|---------|---------------|
| EventTrackingService | Route events to correct tables |
| UserProfileService | Aggregate behavior into profiles |
| SearchService | Full-text search with filters |
| RecommendationService | Hybrid recommendation engine |

---

### 3. Database Layer

Located in `@workspace/db`

#### Schema: 16 Tables

**Core:** users, products, categories
**Commerce:** carts, cart_items, orders, order_items
**Behavioral:** product_views, cart_events, wishlist_events, search_logs, user_sessions, user_events
**ML-Ready:** user_profiles, product_embeddings, user_embeddings, recommendation_cache, preferences

#### Design Principles

- Proper indexing on user_id, product_id, timestamp
- JSONB for flexible attributes (tags, occasions, affinities)
- Event-driven design (append-only behavioral logs)
- Foreign key relationships with cascading deletes

---

### 4. AI Layer (FastAPI)

#### Endpoints

| Endpoint | Purpose |
|----------|---------|
| POST /recommend/:user_id | Personalized recommendations |
| GET /similar-products/:product_id | Embedding-based similarity |
| POST /search-rerank | Semantic search reranking |
| POST /embeddings/product | Single product embedding |
| POST /embeddings/products/batch | Batch embedding generation |

#### ML Components

- **EmbeddingService**: sentence-transformers (all-MiniLM-L6-v2)
- **RecommendationService**: hybrid scoring engine
- Direct PostgreSQL access for ML queries

---

### 5. Background Workers

| Worker | Interval | Purpose |
|--------|----------|---------|
| Profile Aggregator | 1 hour | Rebuild user_profiles from events |
| Embedding Generator | 6 hours | Generate product embeddings |
| Recommendation Precomputer | 30 min | Pre-cache for active users |
| Session Cleanup | Daily | Remove old sessions (>30 days) |
| Cache Cleanup | 15 min | Remove expired cache entries |

---

## Data Flow

### Event Tracking Pipeline

```
User Action (click, search, add to cart)
    │
    ▼
Frontend SDK (batch events, 5s flush)
    │
    ▼
POST /api/events
    │
    ▼
EventTrackingService (route to correct table)
    │
    ├──→ product_views (views with duration)
    ├──→ cart_events (add/remove/update)
    ├──→ wishlist_events (add/remove)
    ├──→ search_logs (queries, filters, clicks)
    ├──→ user_sessions (lifecycle)
    └──→ user_events (audit trail)
    │
    ▼
Background Workers (scheduled)
    │
    ├──→ Profile Aggregator → user_profiles
    ├──→ Embedding Generator → product_embeddings
    └──→ Recommendation Precomputer → recommendation_cache
    │
    ▼
ML Service (on-demand)
    │
    └──→ Personalized recommendations
```

### Recommendation Pipeline

```
Request (userId, context)
    │
    ▼
Strategy Selector
    │
    ├── Cold Start (< 5 views)
    │   └── Popular + Trending + Wishlisted → Merge & Score
    │
    ├── Warm User (5+ views)
    │   ├── Check Cache → Return if valid
    │   ├── Try ML Service → Hybrid scoring
    │   └── Fallback → Local rule-based scoring
    │
    └── Real-Time (search/chat)
        └── Bypass cache → Fresh computation
    │
    ▼
Score Computation
    │
    ├── Category Affinity (×3 weight)
    ├── Occasion Match (×4 weight)
    ├── Price Fit (×2 weight)
    ├── Rating Boost (×0.5 weight)
    └── Recency Boost (+1/+0.5)
    │
    ▼
Cache Result (TTL: 15-30 min)
    │
    ▼
Return to UI
```

---

## Key Tables Detail

| Table | Key Columns | Indexes |
|-------|-------------|---------|
| users | id, email, name, role | email, id |
| products | id, name, price, category, tags, occasions | category, price, occasions, tags |
| categories | id, name, slug, parent_id | slug, parent_id |
| product_views | user_id, product_id, duration, source | user_id, product_id, created_at |
| cart_events | user_id, product_id, action, quantity | user_id, product_id, action |
| search_logs | user_id, query, filters, result_count | user_id, query, created_at |
| user_profiles | user_id, category_affinities, segment | user_id, segment |
| product_embeddings | product_id, embedding, model | product_id, model |
| recommendation_cache | user_id, strategy, recommendations, expires_at | user_id+strategy, expires_at |

---

## Caching Strategy

| Data | TTL | Strategy |
|------|-----|----------|
| Homepage feed | 30 min | Precomputed via workers |
| Search results | 5–10 min | TanStack Query client cache |
| Recommendations (warm) | 30 min | DB-backed recommendation_cache |
| Recommendations (fallback) | 15 min | DB-backed recommendation_cache |
| Real-time recs | 0 (no cache) | Fresh computation per request |

---

## Design Decisions

### Zustand + TanStack Query
- Separates UI vs server state
- Reduces complexity

### FastAPI for ML
- Python ecosystem access
- sentence-transformers, scikit-learn, numpy
- Independent scaling from web app

### Drizzle ORM
- SQL-first, type-safe
- Relation support with query API

### Event-Driven Architecture
- Append-only behavioral logs
- Decoupled ingestion from processing
- Worker-based aggregation

### Hybrid Recommendations
- Rule-based is fast and reliable
- Embeddings improve relevance
- ML service is optional (graceful fallback)

---

## Scalability Considerations

- **Database**: Proper indexing, JSONB for flexibility, append-only logs
- **Workers**: Configurable intervals, independent job execution
- **ML Service**: Stateless, horizontally scalable, Docker-ready
- **Caching**: Multi-level (client, DB-backed, precomputed)
- **Event Pipeline**: Batched ingestion, async processing
- **Designed for 100K+ users**: Session management, profile aggregation, recommendation precomputation

---

## What We Avoid

- Heavy ML pipelines that block user requests
- Unnecessary microservices (just web + AI)
- Storing server state in client state
- Monolithic files (modular services pattern)

---

## Future Enhancements

- pgvector integration for native vector similarity
- Streaming AI responses (SSE)
- Advanced ranking models (collaborative filtering)
- A/B testing framework
- Feedback loops (implicit + explicit)
- WebSocket real-time updates
