# PRD Chamber — Server

Hono + Drizzle + SQLite backend for PRD Chamber.

## Setup

```bash
npm install
npm run db:generate
npm run db:migrate
npm run dev
```

## Endpoints (Step 1)

- `GET /api/health` — health check
- `GET /api/db-test` — database connectivity test

## Development

Server runs on port 3000.
Frontend proxies `/api` → `http://localhost:3000` via Vite config.
