# 🎁 SmartBasket – AI-Powered Gifting Platform

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

---

### Backend

- Next.js API Routes (core backend: auth, cart, orders, events)
- FastAPI (AI / ML service layer)

---

### Database

- PostgreSQL (Neon / Supabase)
- Drizzle ORM
- pgvector (optional, for embeddings)

---

### AI / ML Layer

- Hybrid recommendation engine (rules + embeddings + LLM)
- Semantic search (embedding-based)
- Gift Finder (intent extraction via LLM)
- Conversational assistant (RAG-like)

---

### External Services

- Claude API (LLM reasoning + ranking)
- Razorpay (payments)
- Cloudinary (media storage)
- Redis (optional caching)

---

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
web/            # Next.js (frontend + API routes)
ai/             # FastAPI (AI/ML service)

packages/
db/             # Drizzle ORM (schema + queries)
ui/             # shared UI components
types/          # shared types
config/         # shared configs

```

---

## Getting Started

### Install

```bash
bun install
```

### Run Web App

```bash
bun run dev
```

### Run AI Service

```bash
bun run dev:ai
```

### Run DB Migrations

```bash
bun --cwd packages/db db:generate
bun --cwd packages/db db:migrate
```

---

## Environment Variables

```
DATABASE_URL=your_postgres_url
AI_SERVICE_URL=http://localhost:8000
ANTHROPIC_API_KEY=your_key
RAZORPAY_KEY_ID=xxx
RAZORPAY_KEY_SECRET=xxx
```

---

## Key Concepts

- Event-driven system powers personalization
- ML is used for ranking, not as the core system
- Strong separation between UI state and server state
- AI layer operates independently via FastAPI

---

## Development Workflow

1. Update schema → generate migration
2. Add query in `@workspace/db`
3. Use in API route
4. Fetch via TanStack Query
5. Update UI via Zustand

---

## Status

- ✅ DB schema + relations
- ✅ Monorepo setup (Bun + Turbo)
- ✅ Query layer
- 🔄 API routes
- 🔄 AI integration
- 🔄 Recommendation pipeline

---

## Next Steps

- Product + event APIs
- Recommendation engine (hybrid)
- AI Gift Finder
- Caching layer
- Chat assistant

```

---
```
