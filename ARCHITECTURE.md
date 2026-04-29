# Architecture Overview

## System Design

```
Frontend (Next.js UI)
        ↓
Next.js API Routes (Backend)
        ↓
---------------------------------
| PostgreSQL (Drizzle ORM)     |
| Redis (Cache - planned)      |
| FastAPI (ML Layer)           |
---------------------------------
```

---

## Core Principle

> ML is a ranking layer, not the system.

System = data + filtering + caching
ML = improves ranking

---

## Layers

### 1. Frontend

- UI rendering
- triggers API calls
- collects events

---

### 2. API Layer (Next.js)

Handles:

- users
- products
- events
- ML proxy

---

### 3. Database Layer

Located in `@workspace/db`

Contains:

- schema
- relations
- queries

---

### 4. ML Layer (FastAPI)

Responsibilities:

- recommendation ranking
- semantic search
- gift parsing
- chatbot

---

## Data Flow

```
User → Events → DB
            ↓
     Build Preferences
            ↓
   Filter Products (SQL)
            ↓
   Rank (Rules / ML / LLM)
            ↓
        Cache
            ↓
         UI
```

---

## Key Tables

| Table       | Purpose           |
| ----------- | ----------------- |
| users       | accounts + auth   |
| products    | catalog           |
| user_events | behavior tracking |
| carts       | shopping cart     |
| orders      | purchase records  |
| preferences | derived ML state  |

---

## Recommendation Pipeline

1. Fetch recent events
2. Build user profile
3. Filter products (SQL)
4. Rank (rules → ML → LLM)
5. Cache result

---

## Event System

Events tracked:

- product_view
- search
- add_to_cart
- wishlist
- purchase

---

## Caching Strategy

| Data           | TTL      |
| -------------- | -------- |
| homepage feed  | 30 min   |
| search results | 5-10 min |
| user profile   | 1 hour   |

---

## Design Decisions

### Why Drizzle

- type-safe
- SQL-like
- lightweight

### Why Next.js API

- simple backend
- fast iteration

### Why FastAPI

- ML-friendly ecosystem

---

## What We Avoid

- ❌ heavy ML pipelines
- ❌ microservices early
- ❌ over-engineering

---

## Future Enhancements

- pgvector for embeddings
- real-time recommendations
- advanced ranking models
