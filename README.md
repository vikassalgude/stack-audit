# Credex AI Spend Audit

A free AI spend audit tool that helps founders and engineering managers identify waste across AI tooling subscriptions. Users input their plans and spend, get a savings breakdown, and can capture a shareable report with an optional Credex consultation prompt for large savings.

Live URL: TODO (deploy to Vercel)

## Screenshots / Demo
- Screenshot 1: TODO
- Screenshot 2: TODO
- Screenshot 3: TODO
- (Optional) 30-second demo video: TODO

## Quick Start

### Install
```bash
npm install
```

### Configure environment
Create a `.env` file with:
```
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
GEMINI_API_KEY="your_gemini_api_key"
RESEND_API_KEY="your_resend_api_key"
```

> **Note**: `DATABASE_URL` is no longer required. This app is fully stateless — no database setup needed.

### Run locally
```bash
npm run dev
```

### Tests
```bash
npx vitest run
```

## How it Works
1. User fills out the form with their AI tools, plans, seats, and monthly spend.
2. `POST /api/audit` runs the deterministic audit engine and returns a result with a **stateless Base64 ID**.
3. The UI renders the audit and calls `POST /api/summary` for the AI-generated 100-word summary (Gemini 1.5 Flash).
4. The **"Share audit"** button generates a URL like `/audit/<base64_id>` — the ID itself encodes all audit data, so the link works permanently without a database.
5. Optionally, the user enters their email and `POST /api/leads` captures the lead and sends a confirmation via Resend.

## Key Decisions (Trade-offs)
1. **Stateless Base64 over Prisma/SQLite** — eliminates DB cold-starts on Vercel; shareable URLs never expire.
2. **Deterministic audit logic (not LLM-based)** — keeps recommendations defensible and finance-friendly.
3. **Email capture after results** — aligns with the "value-first" requirement and reduces drop-off.
4. **AI summary as a separate endpoint** — keeps the core audit instant and resilient to LLM failures.
5. **Gemini 1.5 Flash over Pro** — 3x faster with equivalent quality for 100-word summaries.

## Deploy

### Vercel (Recommended)
1. Push this repo to GitHub.
2. Go to https://vercel.com/new and import the repo.
3. Add environment variables:
   - `NEXT_PUBLIC_BASE_URL` = your deployed URL (e.g. `https://your-app.vercel.app`)
   - `GEMINI_API_KEY` = your Gemini API key
   - `RESEND_API_KEY` = your Resend API key (optional — lead capture still works without it)
4. Deploy. No database setup required.

## Repository Files
This repo includes the required Credex deliverables at the root:
- `ARCHITECTURE.md` — system diagram and data flow
- `DEVLOG.md` — daily work log
- `REFLECTION.md` — technical reflection and self-assessment
- `PROMPTS.md` — AI prompt used for summaries
- `PRICING_DATA.md` — pricing sources and verification dates
- `ECONOMICS.md` — unit economics and $1M ARR math
- `GTM.md` — go-to-market strategy
- `METRICS.md` — north star metric and instrumentation plan
- `USER_INTERVIEWS.md` — user interview insights
- `TESTS.md` — test coverage and manual QA checklist
