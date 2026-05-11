# Credex AI Spend Audit

A free AI spend audit tool that helps founders and engineering managers identify waste across AI tooling subscriptions. Users input their plans and spend, get a savings breakdown, and can capture a shareable report with an optional Credex consultation prompt for large savings.

Live URL: TODO

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
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
GEMINI_API_KEY=""
RESEND_API_KEY=""
```

### Prisma setup
```bash
npx prisma db push
npx prisma generate
```

### Run locally
```bash
npm run dev
```

### Tests
```bash
npx vitest run
```

## Decisions (Trade-offs)
1. Prisma + SQLite for local simplicity and fast iteration; can swap to Postgres for scale.
2. Deterministic audit logic (not LLM-based) to keep recommendations defensible and finance-friendly.
3. Email capture after results to align with the “value-first” requirement and reduce drop-off.
4. JSON serialized audit payloads stored in SQLite to keep schema simple while preserving full reports.
5. AI summary as a separate endpoint to keep the core audit instant and resilient to LLM failures.

## Deploy
Recommended: Vercel or Render. Ensure env vars are configured and Prisma is migrated.

### Vercel Deployment Guide (No Vercel config files)
1. Push this repo to GitHub.
2. Go to https://vercel.com/new and import the repo.
3. Set the project to use the default Next.js settings.
4. Add environment variables:
	- `DATABASE_URL` = `file:./dev.db`
	- `NEXT_PUBLIC_BASE_URL` = your deployed URL (for example, `https://your-app.vercel.app`)
	- `GEMINI_API_KEY` (if you want AI summaries)
	- `RESEND_API_KEY` (for email sending)
5. Deploy.

Notes:
- SQLite is fine for demos and local testing, but for production scale use Postgres and update `DATABASE_URL` accordingly.
- Re-run `npx prisma generate` locally if you change the schema.

## Repository Files
This repo includes the required Credex deliverables (ARCHITECTURE, DEVLOG, REFLECTION, PROMPTS, PRICING_DATA, etc.) at the root.
