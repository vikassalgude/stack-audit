# TESTS

## Automated Tests
File: `tests/auditEngine.test.ts`

| Test Case | Description | Status |
|---|---|---|
| Team plan downgrade (small seats) | Team plan with <3 seats should recommend downgrade | ✅ |
| API + subscription consolidation | Claude Pro + Anthropic API → drop Claude Pro | ✅ |
| ChatGPT + OpenAI API consolidation | ChatGPT Plus + OpenAI API → drop ChatGPT | ✅ |
| Optimal tier | Well-sized stack returns `optimal` savings tier | ✅ |
| Significant tier | >$500/mo savings returns `significant` tier | ✅ |
| Annual savings math | `monthlySavings * 12 === annualSavings` | ✅ |
| Enterprise downgrade | Enterprise plan with <$500 spend → downgrade | ✅ |
| Coding use case switch | ChatGPT Plus in coding context → switch to Cursor | ✅ |
| Research consolidation (3+ tools) | 3+ tools in research context → consolidate | ✅ |
| Research consolidation (redundant tools zeroed) | Other tools in research stack get $0 cost | ✅ |

## How to Run
```bash
npx vitest run
```

## Manual Test Checklist
- [ ] Fill form with Cursor Pro + Claude Pro + Anthropic API → should consolidate Claude Pro
- [ ] Fill form with ChatGPT Team + 2 seats → should downgrade to Plus
- [ ] Fill form with 3 research tools → should consolidate into single tool
- [ ] Submit email in lead capture → should succeed even if Resend fails
- [ ] Copy "Share audit" link and open in incognito → should load full audit from URL alone
