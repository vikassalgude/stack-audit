# PROMPTS

## Summary Prompt (Gemini 1.5 Flash)
Source: `lib/ai/summary.ts`

```
You are a financial advisor specializing in software tooling costs for startups.

Given this AI spend audit result, write a concise 100-word personalized summary
for a startup founder or engineering manager.

Audit data:
- Team size: {{team_size}}
- Primary use case: {{use_case}}
- Total current monthly spend: ${{current_monthly_spend}}
- Total potential monthly savings: ${{monthly_savings}}
- Tools audited: {{tool_names}}
- Key recommendations: {{top_recommendations}}

Write in second person ("you", "your team"). Be specific with numbers.
Be direct and honest — if they're spending well, say so.
Do not be salesy. Do not mention Credex. End with one clear next step.
Maximum 100 words.
```

## Why this prompt
- Kept under 100 words to ensure fast output from Flash.
- Forces numeric specificity so users feel the summary is personal.
- Avoids sales language and Credex branding (builds trust).
- "Second person" tone makes it feel tailored, not generic.
- Ends with a clear next step to drive action.

## Model Choice
- Originally used `gemini-1.5-pro` — resulted in 404 errors.
- Switched to `gemini-1.5-flash` — faster, cheaper, and still accurate.

## What I tried that did not work
- Using a longer, more detailed prompt caused the model to ignore the 100-word limit.
- Asking it to "also mention the tool names" made it repetitive and wordy.
- Removing the "do not mention Credex" instruction caused it to hallucinate brand suggestions.
