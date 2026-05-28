# VedaAI — AI Assessment Creator

> Full-stack AI-powered question paper generator for educators.

[![CI](https://github.com/BiplabaKrSamal/vedaai/actions/workflows/ci.yml/badge.svg)](https://github.com/BiplabaKrSamal/vedaai/actions/workflows/ci.yml)
[![Deploy to Render](https://github.com/BiplabaKrSamal/vedaai/actions/workflows/deploy.yml/badge.svg)](https://github.com/BiplabaKrSamal/vedaai/actions/workflows/deploy.yml)

## 🚀 Live Demo

| Service | URL |
|---------|-----|
| **Web App** | https://vedaai-web.onrender.com |
| **API** | https://vedaai-api.onrender.com/health |
| **GitHub** | https://github.com/BiplabaKrSamal/vedaai |

---

## Architecture

```
vedaai/
├── apps/
│   ├── api/          # Node.js + Express + TypeScript  (port 4000)
│   └── web/          # Next.js 15 + TypeScript          (port 3000)
├── packages/
│   └── shared/       # Shared TypeScript types
├── render.yaml       # One-click Render Blueprint deploy
└── turbo.json        # Turborepo pipeline
```

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, TypeScript, Zustand, TailwindCSS |
| Backend | Node.js, Express, TypeScript |
| Queue | BullMQ / in-memory (demo mode) |
| Realtime | WebSocket (`ws`) |
| Database | MongoDB / in-memory (demo mode) |
| AI | Anthropic Claude `claude-sonnet-4` |
| Monorepo | Turborepo + pnpm workspaces |
| Deploy | Render (Docker) |
| CI/CD | GitHub Actions |

---

## Request Flow

```
User submits form
    │
    ▼
POST /api/assignments
    │  ① Save to store  (status: pending)
    │  ② Enqueue job
    │  ③ Return { _id, status } immediately
    ▼
Frontend subscribes via WebSocket
    │
    ▼
Worker (BullMQ / in-memory)
    │  ④ status → processing  →  broadcast WS
    │  ⑤ Build prompt → Claude API (or demo bank)
    │  ⑥ Parse + validate typed GeneratedPaper
    │  ⑦ Store paper  (status: completed)
    │  ⑧ Broadcast WS: job:completed
    ▼
Frontend renders question paper
```

---

## Getting Started

### Prerequisites
- Node.js ≥ 20, pnpm ≥ 9, Docker

### Local Setup

```bash
git clone https://github.com/BiplabaKrSamal/vedaai.git
cd vedaai
pnpm install

# API (.env)
cp apps/api/.env.example apps/api/.env
# Set ANTHROPIC_API_KEY=demo  (or your real key)

# Web (.env.local)
cp apps/web/.env.example apps/web/.env.local

# Start
pnpm dev
```

### Docker (recommended)

```bash
ANTHROPIC_API_KEY=demo docker compose up
```

Open http://localhost:3000

---

## Demo Mode

Set `ANTHROPIC_API_KEY=demo` to run without a real Anthropic key.

Built-in question banks for: **Biology · Mathematics · History · Physics · Chemistry**

All question types supported: MCQ, Short Answer, Long Answer, True/False, Fill Blanks.

To enable live Claude AI: swap `demo` for a real `sk-ant-...` key in Render env vars.

---

## Deploy to Render (one click)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/BiplabaKrSamal/vedaai)

All env vars are pre-configured in `render.yaml`. Zero setup required.

---

## API Reference

### `POST /api/assignments`
```json
{
  "title": "Chapter 5 – Photosynthesis",
  "subject": "Biology",
  "grade": "Grade 10",
  "dueDate": "2025-03-01",
  "difficulty": "medium",
  "totalMarks": 50,
  "questionTypes": [
    { "type": "mcq", "count": 5, "marksPerQuestion": 2 },
    { "type": "short_answer", "count": 4, "marksPerQuestion": 5 }
  ]
}
```

Other endpoints: `GET /api/assignments` · `GET /api/assignments/:id` · `POST /api/assignments/:id/regenerate` · `DELETE /api/assignments/:id`
