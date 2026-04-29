# 🏗️ System Architecture

## Core Principle

> This system is a **decision engine with commerce attached**  
> ML improves ranking — it is not the system itself.

---

## High-Level Architecture

````

Frontend (Next.js UI)
↓
Next.js API Layer
↓
-

| PostgreSQL (Drizzle ORM)     |
| FastAPI (AI Layer)           |
| Redis (Cache - optional)     |
--------------------------------

```

---

## Layer Breakdown

### 1. Frontend Layer

Responsibilities:
- UI rendering
- User interaction
- Event tracking

---

### State Management Architecture

| Type | Tool | Responsibility |
|------|------|---------------|
| UI State | Zustand | modals, cart UI, chat UI |
| Server State | TanStack Query | API data, caching |
| Real-time | WebSockets (optional) | order tracking |

---

### 2. API Layer (Next.js)

Handles:
- authentication
- products
- cart & orders
- event logging
- communication with AI service

---

### 3. Database Layer

Located in `@workspace/db`

Contains:
- schema
- relations
- query logic

---

### 4. AI Layer (FastAPI)

Responsibilities:
- recommendation ranking
- intent parsing (gift finder)
- semantic search
- chatbot responses

---

## Data Flow

```

User → Events → Database
↓
Build User Profile
↓
Filter Products (SQL)
↓
Rank (Rules → Embeddings → LLM)
↓
Cache
↓
UI

```

---

## Key Tables

| Table            | Purpose                  |
|------------------|--------------------------|
| users            | authentication + profile |
| products         | catalog                  |
| user_events      | behavior tracking        |
| carts            | cart state               |
| orders           | purchases                |
| user_preferences | derived ML profile       |

---

## Caching Strategy

| Data           | TTL      |
|----------------|----------|
| homepage feed  | 30 min   |
| search results | 5–10 min |
| recommendations| 30 min   |

---

## Design Decisions

### Zustand + TanStack Query
- separates UI vs server state
- reduces complexity

### FastAPI for ML
- Python ecosystem
- easier ML integration

### Drizzle ORM
- SQL-first
- type-safe

---

## What We Avoid

- ❌ heavy ML pipelines
- ❌ unnecessary microservices
- ❌ storing server state in client state

---

## Future Enhancements

- pgvector integration
- streaming AI responses
- advanced ranking models
```

---