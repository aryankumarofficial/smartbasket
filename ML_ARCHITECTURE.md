# ML Architecture

## Goal

Provide personalized gifting recommendations using hybrid logic.

---

## Components

1. Recommendation Engine
2. Personalization Engine
3. Semantic Search
4. Gift Finder
5. Chat Assistant

---

## Strategy

Hybrid system:

- rules (fast)
- embeddings (optional)
- LLM (top results only)

---

## Pipeline

```
Events → Profile → Filter → Rank → Cache
```

---

## Modes

| Mode      | Use         |
| --------- | ----------- |
| cached    | homepage    |
| real-time | search/chat |

---

## Data Source

`user_events` table

---

## Key Insight

> Good filtering > fancy ML

---

## Failure Handling

Fallback:

- popular products
- category-based

---

## Future

- embeddings (pgvector)
- better ranking models
- A/B testing
