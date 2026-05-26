# VedaAI — AI Assessment Creator

> Full-stack monorepo for generating AI-powered question papers.

[![CI](https://github.com/your-org/vedaai/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/vedaai/actions/workflows/ci.yml)
[![Deploy](https://github.com/your-org/vedaai/actions/workflows/deploy.yml/badge.svg)](https://github.com/your-org/vedaai/actions/workflows/deploy.yml)

---

## Architecture Overview

```
vedaai/
├── apps/
│   ├── api/          # Node.js + Express + TypeScript  (port 4000)
│   └── web/          # Next.js 15 + TypeScript          (port 3000)
├── packages/
│   └── shared/       # Shared TypeScript types
├── docker-compose.yml          # Local dev (Mongo + Redis + apps)
├── docker-compose.prod.yml     # Production stack
└── turbo.json                  # Turborepo pipeline
```

### Tech Stack

| Layer       | Technology                                               |
|-------------|----------------------------------------------------------|
| Frontend    | Next.js 15, TypeScript, Zustand, React Hook Form, TailwindCSS |
| Backend     | Node.js, Express, TypeScript                             |
| Queue       | BullMQ on Redis                                          |
| Realtime    | WebSocket (`ws`)                                         |
| Database    | MongoDB (Mongoose)                                       |
| AI          | Anthropic Claude (claude-sonnet-4)                       |
| Monorepo    | Turborepo + pnpm workspaces                              |
| Deploy      | Vercel (web) + Railway (API)                             |
| CI/CD       | GitHub Actions                                           |

---

## Request Flow

```
User submits form
    │
    ▼
POST /api/assignments
    │  ① Save to MongoDB  (status: pending)
    │  ② Enqueue BullMQ job
    │  ③ Return { _id, status } immediately
    ▼
Frontend subscribes via WebSocket (ws://…/ws)
    │
    ▼
BullMQ Worker
    │  ④ status → processing  →  broadcast WS: job:processing
    │  ⑤ Build structured prompt → Claude API
    │  ⑥ Parse + validate typed GeneratedPaper
    │  ⑦ Store paper  (status: completed)
    │  ⑧ Broadcast WS: job:completed
    ▼
Frontend receives event → fetch full paper → render output
```

---

## Getting Started (Local)

### Prerequisites

- Node.js ≥ 20
- pnpm ≥ 9
- Docker + Docker Compose

### 1 · Clone & install

```bash
git clone https://github.com/your-org/vedaai.git
cd vedaai
pnpm install
```

### 2 · Configure environment

```bash
# API
cp apps/api/.env.example apps/api/.env
# Set ANTHROPIC_API_KEY in apps/api/.env

# Web
cp apps/web/.env.example apps/web/.env.local
```

### 3a · Run with Docker (recommended)

```bash
# Starts Mongo, Redis, API, and Web
ANTHROPIC_API_KEY=sk-ant-... docker compose up
```

Open http://localhost:3000

### 3b · Run manually

```bash
# Terminal 1 — infrastructure
docker compose up mongo redis

# Terminal 2 — API
cd apps/api && cp .env.example .env   # fill in keys
pnpm dev

# Terminal 3 — Web
cd apps/web && cp .env.example .env.local
pnpm dev
```

---

## Environment Variables

### `apps/api/.env`

| Variable            | Description                        | Default                          |
|---------------------|------------------------------------|----------------------------------|
| `PORT`              | API server port                    | `4000`                           |
| `MONGODB_URI`       | MongoDB connection string          | `mongodb://localhost:27017/vedaai`|
| `REDIS_URL`         | Redis connection string            | `redis://localhost:6379`         |
| `ANTHROPIC_API_KEY` | Your Anthropic API key (**required**) | —                             |
| `FRONTEND_URL`      | Allowed CORS origin                | `http://localhost:3000`          |

### `apps/web/.env.local`

| Variable                | Description           | Default                     |
|-------------------------|-----------------------|-----------------------------|
| `NEXT_PUBLIC_API_URL`   | Backend base URL      | `http://localhost:4000`     |
| `NEXT_PUBLIC_WS_URL`    | WebSocket URL         | `ws://localhost:4000/ws`    |

---

## Key Design Decisions

### Why BullMQ + Redis?
AI generation is slow (15–30 s). Putting it in a queue means the API responds in <100 ms and the worker can retry on failure without the user waiting. Redis also caches job state so the frontend can poll as fallback.

### Why WebSocket instead of SSE?
Bidirectional — the client sends a `subscribe` message with the assignment ID, so we only push to clients watching a specific job. SSE would push to everyone or require per-connection channels at the HTTP layer.

### Structured prompt → typed output
The AI is instructed to return **strict JSON only**. The response is parsed and every field is validated before being stored. The frontend never renders raw AI text.

### Shared types package
`@vedaai/shared` is consumed by both `api` and `web`. This guarantees the API response shape and the frontend's TypeScript types are always in sync — any breaking change is a compile error.

---

## API Reference

### `POST /api/assignments`
Create an assignment and enqueue generation.

```jsonc
// body (JSON or multipart/form-data with file)
{
  "title": "Chapter 5 – Photosynthesis",
  "subject": "Biology",
  "grade": "Grade 10",
  "dueDate": "2025-03-01",
  "difficulty": "medium",
  "totalMarks": 50,
  "questionTypes": [
    { "type": "mcq",          "count": 5,  "marksPerQuestion": 2 },
    { "type": "short_answer", "count": 4,  "marksPerQuestion": 5 },
    { "type": "long_answer",  "count": 2,  "marksPerQuestion": 10 }
  ],
  "additionalInstructions": "Focus on light-dependent reactions"
}

// response
{ "success": true, "data": { "_id": "...", "status": "pending", "jobId": "..." } }
```

### `GET /api/assignments`         — list all  
### `GET /api/assignments/:id`     — single + full paper  
### `POST /api/assignments/:id/regenerate` — re-queue  
### `DELETE /api/assignments/:id`  — delete  

---

## Deployment

### Vercel (Web)
1. Connect your GitHub repo to Vercel
2. Set root directory: `apps/web` (or use `vercel.json` at root)
3. Add env vars: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_WS_URL`

### Railway (API)
1. Connect repo, select `apps/api` service
2. Railway uses `apps/api/railway.toml` automatically
3. Add env vars: `MONGODB_URI`, `REDIS_URL`, `ANTHROPIC_API_KEY`, `FRONTEND_URL`

### GitHub Actions
- **CI** (`ci.yml`) — runs on every push/PR: type-check → build → docker-build
- **Deploy** (`deploy.yml`) — runs on `main`: deploy API to Railway, then web to Vercel

---

## Approach & Learnings

**Product thinking first** — I read the Figma flow (0-state → form → upload → output) and mapped it to actual user journeys before writing a line of code.

**Queue architecture from day one** — AI calls are long-running. Building the queue and WS layer upfront meant the UI was always reactive, never blocking.

**Typed end-to-end** — sharing types across the monorepo catches interface mismatches at compile time, not runtime.

**Print-first output** — the question paper is styled for both screen and print (`@media print`), and the PDF export uses jsPDF for proper A4 pagination rather than capturing a screenshot.
