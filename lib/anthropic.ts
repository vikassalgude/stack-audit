import Anthropic from '@anthropic-ai/sdk';

import type { AuditResult } from './types';

const model = 'claude-3-5-sonnet-20241022';

function buildPrompt(audit: AuditResult) {
  const toolNames = audit.toolResults.map((tool) => tool.toolName).join(', ');
  const topRecommendations = audit.toolResults
    .filter((tool) => tool.monthlySavings > 0)
    .sort((a, b) => b.monthlySavings - a.monthlySavings)
    .slice(0, 3)
    .map((tool) => tool.recommendedAction)
    .join(' | ');

  return `You are a financial advisor specializing in software tooling costs for startups.

Given this AI spend audit result, write a concise 100-word personalized summary
for a startup founder or engineering manager.

Audit data:
- Team size: ${audit.formInput.teamSize}
- Primary use case: ${audit.formInput.useCase}
- Total current monthly spend: $${audit.totalMonthlySpend.toFixed(0)}
- Total potential monthly savings: $${audit.totalMonthlySavings.toFixed(0)}
- Tools audited: ${toolNames}
- Key recommendations: ${topRecommendations || 'No changes needed'}

Write in second person ("you", "your team"). Be specific with numbers.
Be direct and honest — if they're spending well, say so.
Do not be salesy. Do not mention Credex. End with one clear next step.
Maximum 100 words.`;
}

function generateFallbackSummary(audit: AuditResult): string {
  if (audit.savingsTier === 'optimal') {
    return `Your team of ${audit.formInput.teamSize} is running a lean AI stack. At $${audit.totalMonthlySpend.toFixed(
      0
    )}/month across ${audit.toolResults.length} tools, your spend is well-optimized for ${
      audit.formInput.useCase
    } work. We will notify you when new cost optimization opportunities emerge for your stack.`;
  }

  const topRecommendation = audit.toolResults
    .sort((a, b) => b.monthlySavings - a.monthlySavings)[0]?.recommendedAction;

  return `Your team of ${audit.formInput.teamSize} is spending $${audit.totalMonthlySpend.toFixed(
    0
  )}/month on AI tools. Our audit identified $${audit.totalMonthlySavings.toFixed(
    0
  )}/month ($${audit.totalAnnualSavings.toFixed(
    0
  )}/year) in potential savings through plan right-sizing and tool consolidation. The biggest opportunity is ${
    topRecommendation ?? 'consolidating overlapping subscriptions'
  }.`;
}

export async function generateAuditSummary(audit: AuditResult): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return generateFallbackSummary(audit);
  }

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model,
      max_tokens: 250,
      temperature: 0.3,
      messages: [
        {
          role: 'user',
          content: buildPrompt(audit),
        },
      ],
    });

    const content = response.content[0];
    if (content?.type === 'text' && content.text.trim().length > 0) {
      return content.text.trim();
    }
  } catch (error) {
    console.error('Anthropic summary error', error);
  }

  return generateFallbackSummary(audit);
}
