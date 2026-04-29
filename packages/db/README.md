# @workspace/db

## Overview

Centralized database layer using Drizzle ORM.

Contains:

- schema definitions
- relations
- queries
- migrations

---

## Structure

```
src/
  schema/
  queries/
  client.ts
  index.ts
```

---

## Usage

### Import DB

```ts
import { db } from "@workspace/db"
```

### Import Schema

```ts
import { users } from "@workspace/db/schema"
```

### Import Queries

```ts
import { getUserByEmail } from "@workspace/db/queries/user"
```

---

## Migrations

Generate:

```bash
bun --cwd packages/db db:generate
```

Run:

```bash
bun --cwd packages/db db:migrate
```

---

## Rules

- Do NOT write raw SQL in app layer
- All DB access goes through queries
- One table per schema file
- Relations must match foreign keys

---

## Notes

- Uses PostgreSQL (Neon)
- NodeNext module system
- `.js` imports required

---

## Common Errors

### Missing schema typing

→ ensure `drizzle(client, { schema })`

### process not found

→ install `@types/node`

### import issues

→ use `.js` extensions

---

## Status

- ✅ schema complete
- ✅ relations wired
- ✅ migrations working
- ✅ client ready
- 🔄 queries expanding
