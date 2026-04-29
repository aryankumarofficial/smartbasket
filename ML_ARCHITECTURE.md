# 🤖 ML Architecture

## Goal

Provide **accurate, fast, and explainable gift recommendations** using a hybrid approach.

---

## Core Components

1. Recommendation Engine
2. Personalization Engine
3. Semantic Search
4. Gift Finder (Intent Engine)
5. Conversational Assistant

---

## Core Strategy

Hybrid system:

- Rule-based filtering & scoring (fast, reliable)
- Embedding similarity (pgvector-backed retrieval)
- LLM-based reasoning (top results only)

---

## Recommendation Pipeline

```

User Input / Events
↓
Intent Extraction (LLM)
↓
Candidate Filtering (SQL)
↓
Rule-Based Scoring
↓
Embedding Similarity (pgvector cosine distance)
↓
LLM Re-ranking
↓
Cache Results
↓
Return to UI

```

---

## Algorithms Used

### 1. SQL Filtering

- reduces dataset early
- improves efficiency

---

### 2. Rule-Based Scoring

```ts
score =
  interest_match * 3 + occasion_match * 4 + price_fit * 2 + recency_boost * 3
```

---

### 3. Semantic Search

- embedding generation
- cosine similarity with pgvector nearest-neighbor queries

```
similarity = (A · B) / (||A|| ||B||)
```

---

### 4. Intent Extraction

- LLM converts text → structured data

---

### 5. LLM Re-ranking

- improves ordering
- adds reasoning

---

## Personalization Engine

### Input:

- product views
- searches
- purchases

### Output:

- dynamic user preferences

---

## Modes

| Mode      | Use Case                  |
| --------- | ------------------------- |
| Cached    | homepage feed             |
| Real-time | search, chat, gift finder |

---

## Data Source

`user_events` table (event-driven system)

---

## Key Insight

> Good filtering + scoring beats complex ML

---

## Failure Handling

Fallback strategies:

- popular products
- category-based recommendations

---

## Future Enhancements

- pgvector embeddings
- advanced ranking models
- A/B testing
- feedback loops
