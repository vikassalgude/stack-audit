import { describe, expect, test } from 'vitest';

import { runAudit } from '../lib/auditEngine';
import type { FormInput } from '../lib/types';

describe('runAudit', () => {
  test('flags Team plan as overkill for under 3 seats', () => {
    const input: FormInput = {
      tools: [
        {
          toolId: 'claude',
          toolName: 'Claude',
          plan: 'Team',
          monthlySpend: 60,
          seats: 2,
        },
      ],
      teamSize: 2,
      useCase: 'mixed',
    };

    const result = runAudit(input);
    const toolResult = result.toolResults[0];

    expect(toolResult.recommendation).toBe('downgrade');
    expect(toolResult.recommendedPlan).toBe('Pro');
    expect(toolResult.monthlySavings).toBeGreaterThan(0);
  });

  test('flags redundant Anthropic API + Claude Pro subscription', () => {
    const input: FormInput = {
      tools: [
        {
          toolId: 'anthropic-api',
          toolName: 'Anthropic API Direct',
          plan: 'Pay-as-you-go',
          monthlySpend: 50,
          seats: 1,
        },
        {
          toolId: 'claude',
          toolName: 'Claude',
          plan: 'Pro',
          monthlySpend: 20,
          seats: 1,
        },
      ],
      teamSize: 1,
      useCase: 'mixed',
    };

    const result = runAudit(input);
    const claudeResult = result.toolResults.find((tool) => tool.toolId === 'claude');

    expect(claudeResult?.recommendation).toBe('consolidate');
    expect(claudeResult?.monthlySavings).toBeGreaterThan(0);
  });

  test('returns optimal tier and zero savings for right-sized spend', () => {
    const input: FormInput = {
      tools: [
        {
          toolId: 'cursor',
          toolName: 'Cursor',
          plan: 'Pro',
          monthlySpend: 20,
          seats: 1,
        },
      ],
      teamSize: 1,
      useCase: 'coding',
    };

    const result = runAudit(input);

    expect(result.totalMonthlySavings).toBe(0);
    expect(result.savingsTier).toBe('optimal');
  });

  test('marks savingsTier as significant when savings exceed $500/month', () => {
    const input: FormInput = {
      tools: [
        {
          toolId: 'chatgpt',
          toolName: 'ChatGPT',
          plan: 'Plus',
          monthlySpend: 800,
          seats: 1,
        },
      ],
      teamSize: 1,
      useCase: 'coding',
    };

    const result = runAudit(input);

    expect(result.totalMonthlySavings).toBeGreaterThan(500);
    expect(result.savingsTier).toBe('significant');
  });

  test('annual savings equals monthly savings times 12', () => {
    const input: FormInput = {
      tools: [
        {
          toolId: 'windsurf',
          toolName: 'Windsurf',
          plan: 'Teams',
          monthlySpend: 70,
          seats: 2,
        },
      ],
      teamSize: 2,
      useCase: 'mixed',
    };

    const result = runAudit(input);

    result.toolResults.forEach((tool) => {
      expect(tool.annualSavings).toBe(tool.monthlySavings * 12);
    });
  });

  test('downgrades enterprise plans below $500/month', () => {
    const input: FormInput = {
      tools: [
        {
          toolId: 'cursor',
          toolName: 'Cursor',
          plan: 'Enterprise',
          monthlySpend: 200,
          seats: 2,
        },
      ],
      teamSize: 2,
      useCase: 'mixed',
    };

    const result = runAudit(input);

    expect(result.toolResults[0].recommendation).toBe('downgrade');
    expect(result.toolResults[0].recommendedPlan).toBe('Business');
  });

  test('recommends coding tool when ChatGPT Plus is used for coding', () => {
    const input: FormInput = {
      tools: [
        {
          toolId: 'chatgpt',
          toolName: 'ChatGPT',
          plan: 'Plus',
          monthlySpend: 20,
          seats: 1,
        },
      ],
      teamSize: 1,
      useCase: 'coding',
    };

    const result = runAudit(input);

    expect(result.toolResults[0].recommendation).toBe('switch');
  });

  test('consolidates research tools into a team plan when using 3+ tools', () => {
    const input: FormInput = {
      tools: [
        {
          toolId: 'cursor',
          toolName: 'Cursor',
          plan: 'Business',
          monthlySpend: 120,
          seats: 4,
        },
        {
          toolId: 'claude',
          toolName: 'Claude',
          plan: 'Pro',
          monthlySpend: 80,
          seats: 2,
        },
        {
          toolId: 'chatgpt',
          toolName: 'ChatGPT',
          plan: 'Plus',
          monthlySpend: 20,
          seats: 1,
        },
      ],
      teamSize: 4,
      useCase: 'research',
    };

    const result = runAudit(input);
    const consolidated = result.toolResults.find((tool) => tool.recommendation === 'consolidate');

    expect(consolidated).toBeDefined();
    expect(consolidated?.recommendedAction).toContain('Consolidate');
  });
});
