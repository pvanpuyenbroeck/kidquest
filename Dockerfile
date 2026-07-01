# ──────────────────────────────────────────────
# Fase 1: Dependencies installeren
# ──────────────────────────────────────────────
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY package.json package-lock.json* ./
COPY prisma ./prisma/

RUN npm ci

# ──────────────────────────────────────────────
# Fase 2: Build de applicatie
# ──────────────────────────────────────────────
FROM node:20-alpine AS builder
RUN apk add --no-cache openssl
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Genereer Prisma client
RUN npx prisma generate

# Bundel seed voor runtime (geen tsx/esbuild-platform binaries in productie-image)
RUN ./node_modules/.bin/esbuild prisma/seed.ts \
  --bundle \
  --platform=node \
  --packages=external \
  --format=cjs \
  --outfile=prisma/seed.runtime.cjs

# Build Next.js
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL="file:/data/kidquest.db"
RUN npm run build

# ──────────────────────────────────────────────
# Fase 3: Productie image
# ──────────────────────────────────────────────
FROM node:20-alpine AS runner
RUN apk add --no-cache openssl
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Maak data directory voor SQLite
RUN mkdir -p /data

# Kopieer alleen wat nodig is
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
# prisma/ bevat seed.runtime.cjs (gebundeld in builder); geen tsx/esbuild in productie

# Startup script
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV DATABASE_URL="file:/data/kidquest.db"

ENTRYPOINT ["./docker-entrypoint.sh"]
