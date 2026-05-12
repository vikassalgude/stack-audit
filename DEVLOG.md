# DEVLOG

## Day 1 — 2026-05-08
**Hours worked:** 6
**What I did:** Initial project setup. Scaffolded Next.js with Tailwind CSS 4. Defined the core `AuditResult` types and `pricing-data.ts`.
**What I learned:** Tailwind 4 configuration is much simpler but requires modern PostCSS setups.
**Blockers:** Deciding on the most accurate way to model "Seats" vs "Spend" for enterprise tiers.
**Plan for tomorrow:** Build the Audit Engine logic.

## Day 2 — 2026-05-09
**Hours worked:** 8
**What I did:** Implemented the `auditEngine.ts`. Built out rules for team downgrades, API consolidation, and use-case-specific tool switching.
**What I learned:** Deterministic logic is easier to test and more reliable for financial recommendations than pure LLM prompting.
**Blockers:** Handling the "Research" consolidation rule correctly across multiple tools.
**Plan for tomorrow:** Build the Spend Form and Audit Results UI.

## Day 3 — 2026-05-10
**Hours worked:** 7
**What I did:** Created `SpendForm` with React Hook Form and Zod. Built the `AuditResults` dashboard with the "Savings Hero" component.
**What I learned:** Client-side local storage is great for UX (preserving form state) but needs careful validation on reload.
**Blockers:** UI layout for comparing "Current" vs "Recommended" plans on mobile.
**Plan for tomorrow:** Integrate Gemini for AI summaries.

## Day 4 — 2026-05-11
**Hours worked:** 5
**What I did:** Integrated `@google/generative-ai`. Implemented the `/api/summary` route with fallback logic.
**What I learned:** `gemini-1.5-flash` is significantly faster than `pro` for this use case.
**Blockers:** Gemini 404 errors during initial testing (fixed by switching model versions).
**Plan for tomorrow:** Deployment and Lead Capture.

## Day 5 — 2026-05-12 (Today)
**Hours worked:** 9
**What I did:** Replaced Prisma/SQLite with a **Stateless Base64 Architecture** to fix deployment issues on Vercel. Integrated Resend for email delivery. Finalized all documentation.
**What I learned:** Encoding state in the URL is a powerful way to build "Serverless" shareable tools without DB overhead.
**Blockers:** Resend "onboarding" email restrictions (added better user feedback).
**Plan for tomorrow:** Final QA and launch.
