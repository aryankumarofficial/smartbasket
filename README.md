# SmartBasket – AI Gifting Platform

## Overview

SmartBasket is an AI-powered gifting platform that provides personalized product recommendations using hybrid ML techniques (rules + embeddings + LLM).

---

## Tech Stack

### Frontend

- Next.js (App Router)
- Tailwind CSS
- shadcn/ui

### Backend

- Next.js API Routes (primary backend)
- FastAPI (ML inference layer)

### Database

- PostgreSQL (Neon)
- Drizzle ORM

### ML Layer

- Recommendation engine (rules + LLM)
- Semantic search (planned pgvector)
- Gift finder + chatbot

### Infra

- Turborepo
- Bun (package manager)
- Inngest (background jobs)
- Redis (caching – planned)

---

## Monorepo Structure

```
apps/
  web/            # Next.js app (frontend + API routes)
  api/            # FastAPI (ML layer)

packages/
  db/             # Drizzle ORM (schema + queries)
  ui/             # shared UI components
  types/          # shared schemas
```

---

## Getting Started

### Install

```bash
bun install
```

### Run Web

```bash
bun run dev
```

### Run DB Migrations

```bash
bun --cwd packages/db db:generate
bun --cwd packages/db db:migrate
```

---

## Environment Variables

Create `.env` at root:

```
DATABASE_URL=your_postgres_url
```

---

## Key Concepts

- DB schema is centralized in `@workspace/db`
- Queries are abstracted in `/queries`
- ML is a separate service (FastAPI)
- Events power personalization

---

## Development Workflow

1. Update schema → generate migration
2. Add query in `/queries`
3. Use in API route
4. Connect to frontend

---

## Status

- ✅ Schema + relations
- ✅ Migrations
- ✅ Query layer
- 🔄 API routes
- 🔄 ML integration

---

## Next Steps

- API routes (`/api/products`, `/api/events`)
- Recommendation engine
- Redis caching
- FastAPI ML endpoints
