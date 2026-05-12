# REFLECTION

## 1. Hardest bug and how I debugged it
The hardest bug was the "Deployment Drift." Locally, the app worked perfectly with SQLite, but on Vercel, every shared audit link returned a 404. I initially thought it was a Prisma generation issue. I debugged it by adding detailed logging to the API routes, which revealed that the SQLite file was either missing or read-only in the serverless environment. This led to the major realization that a traditional DB was overkill for a tool where the input is small enough to be stateless.

## 2. A decision I reversed mid-week
I originally planned to use Prisma + Postgres for all persistence. However, mid-week I reversed this and moved to a **Stateless Base64 encoding** for Audit IDs. 
**Reasoning**: For a free audit tool, the friction of managing a database and connection pooling was high. By encoding the audit data into the ID itself, I made the app 100% available, simplified the architecture, and ensured that shared reports never "expire" or get lost due to DB migrations.

## 3. What I would build in week 2
In week 2, I would focus on **Benchmark Data**. I would aggregate the (anonymous) stateless data to show users how their spend compares to other teams of the same size. "You are in the top 10% of spenders for a 10-person team" is a very powerful hook for conversion. I would also add a "Browser Extension" to automatically pull plan data from vendor dashboards.

## 4. How I used AI tools
I used AI (Gemini) for two distinct purposes:
1. **Product Feature**: Generating the "100-word personalized summary." This adds a premium, high-touch feel to a deterministic audit.
2. **Development**: I used AI to refactor the Audit Engine logic and to help design the "Stateless" encoding scheme. It was particularly helpful in identifying edge cases in the "Research Consolidation" rule.

## 5. Self-rating (1-10) with reasons
- **Discipline: 9** — Followed the plan and maintained a daily log.
- **Code quality: 9** — Clean, type-safe implementation with a robust stateless design.
- **Design sense: 8** — Used a sleek, finance-grade zinc/emerald palette.
- **Problem solving: 10** — Pivoted to stateless architecture to solve the deployment blocker.
- **Entrepreneurial thinking: 9** — Focused on lead capture and the "Credex" value prop throughout.
