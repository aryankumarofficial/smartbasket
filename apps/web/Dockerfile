FROM node:22-alpine AS base
WORKDIR /app

# ── Install dependencies ─────────────────────────────────────────────
FROM base AS deps
RUN apk add --no-cache libc6-compat

COPY package.json bun.lock turbo.json ./
COPY apps/web/package.json apps/web/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/ui/package.json packages/ui/package.json
COPY packages/eslint-config/package.json packages/eslint-config/package.json
COPY packages/typescript-config/package.json packages/typescript-config/package.json

# Use npm for the Docker build (most portable)
RUN npm install --legacy-peer-deps

# ── Build ─────────────────────────────────────────────────────────────
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Env vars needed at build time for Next.js (inlined into the client bundle)
# These can be overridden via docker-compose build args if needed.
ENV NEXT_TELEMETRY_DISABLED=1

RUN npx turbo run build --filter=web

# ── Runner ────────────────────────────────────────────────────────────
FROM base AS runner

RUN apk add --no-cache libc6-compat
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Next.js standalone output
COPY --from=builder /app/apps/web/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "apps/web/server.js"]
