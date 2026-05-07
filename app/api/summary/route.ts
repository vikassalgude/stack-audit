import { z } from 'zod';

import { generateAuditSummary } from '../../../lib/anthropic';
import type { AuditResult } from '../../../lib/types';

const summarySchema = z.object({
  audit: z.object({
    auditId: z.string(),
    formInput: z.object({
      tools: z.array(
        z.object({
          toolId: z.string(),
          toolName: z.string(),
          plan: z.string(),
          monthlySpend: z.number(),
          seats: z.number(),
        })
      ),
      teamSize: z.number(),
      useCase: z.enum(['coding', 'writing', 'data', 'research', 'mixed']),
    }),
    toolResults: z.array(z.record(z.any())),
    totalMonthlySpend: z.number(),
    totalOptimizedMonthlySpend: z.number(),
    totalMonthlySavings: z.number(),
    totalAnnualSavings: z.number(),
    savingsTier: z.enum(['optimal', 'moderate', 'significant']),
    generatedAt: z.string(),
    aiSummary: z.string().optional(),
  }),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = summarySchema.parse(body);
    const audit = parsed.audit as AuditResult;

    const summary = await generateAuditSummary(audit);

    return Response.json({ summary });
  } catch (error) {
    return Response.json({ error: 'Unable to generate summary.' }, { status: 400 });
  }
}
