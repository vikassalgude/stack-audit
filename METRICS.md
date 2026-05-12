# METRICS

## North Star Metric
**Qualified consultations booked per week.** This reflects the core business goal (Credex revenue) and captures whether the audit drives real demand beyond vanity metrics.

## Input Metrics
1. **Audit completion rate** — visits → completed audits (target: 20%)
2. **Lead capture rate** — completed audits → email captured (target: 20%)
3. **Consultation booking rate** — email captured → consultation booked (target: 15–25%)
4. **AI summary success rate** — Gemini successful vs. fallback (target: >95%)

## First Instrumentation (Week 1)
- Log every `POST /api/audit` with savings tier and tool count
- Log every `POST /api/leads` with `emailSent: true/false`
- Log every Credex CTA click (significant tier only)
- Log summary generation success vs. fallback rate

## Pivot Triggers
| Metric | Threshold | Action |
|---|---|---|
| Audit completion rate | <10% after 1,000 visits | Redesign form UX |
| Lead capture rate | <5% after 500 audits | Revise lead capture copy |
| Consultation booking | 0 after 50 leads | Fix email CTA or follow-up |
| AI summary failures | >20% | Switch model or widen fallback |

## Week-1 Traction Targets
- 500 unique visitors
- 120 completed audits (24% completion)
- 25 email captures (21% of audits)
- 5 consultation requests (20% of leads)
