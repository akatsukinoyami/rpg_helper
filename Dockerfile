# Stage 1 — build
FROM oven/bun:1 AS builder
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

# Stage 2 — run
FROM oven/bun:1-slim AS runner
WORKDIR /app

COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./
COPY --from=builder /app/bun.lock ./

RUN bun install --production --frozen-lockfile

EXPOSE 3000
ENV NODE_ENV=production

CMD ["bun", "./build/index.js"]
