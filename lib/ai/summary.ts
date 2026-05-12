import { GoogleGenerativeAI } from '@google/generative-ai';

import type { AuditResult } from '../types';

const MODEL_NAME = 'gemini-1.5-flash';
const MAX_TOKENS = 300;
const TEMPERATURE = 0.3;
const MAX_RETRIES = 2;

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

function shouldRetry(error: unknown) {
  if (!error) return false;
  const message = String((error as Error).message || error);
  return message.includes('429') || message.includes('rate') || message.includes('timeout');
}

function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function generateAuditSummary(audit: AuditResult): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return generateFallbackSummary(audit);
  }

  const client = new GoogleGenerativeAI(apiKey);
  const model = client.getGenerativeModel({
    model: MODEL_NAME,
    generationConfig: {
      maxOutputTokens: MAX_TOKENS,
      temperature: TEMPERATURE,
    },
  });

  const prompt = buildPrompt(audit);

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      const response = await model.generateContent(prompt);
      const text = response.response.text();
      if (text && text.trim().length > 0) {
        return text.trim();
      }
    } catch (error) {
      if (attempt < MAX_RETRIES && shouldRetry(error)) {
        await delay(300 * (attempt + 1));
        continue;
      }
      console.error('Gemini summary error', error);
      break;
    }
  }

  return generateFallbackSummary(audit);
}

export async function streamAuditSummary(audit: AuditResult): Promise<AsyncIterable<string>> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return (async function* fallback() {
      yield generateFallbackSummary(audit);
    })();
  }

  const client = new GoogleGenerativeAI(apiKey);
  const model = client.getGenerativeModel({
    model: MODEL_NAME,
    generationConfig: {
      maxOutputTokens: MAX_TOKENS,
      temperature: TEMPERATURE,
    },
  });

  const prompt = buildPrompt(audit);
  const stream = await model.generateContentStream(prompt);

  async function* iterator() {
    for await (const chunk of stream.stream) {
      const text = chunk.text();
      if (text) {
        yield text;
      }
    }
  }

  return iterator();
}
