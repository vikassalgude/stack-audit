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
    toolResults: z.array(z.record(z.string(), z.any())),
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
  console.log('[API POST /api/summary] Starting AI summary generation...');
  try {
    const body = await request.json();
    console.log('[API POST /api/summary] Raw body received');
    const parsed = summarySchema.parse(body);
    const audit = parsed.audit as AuditResult;
    console.log(`[API POST /api/summary] Validated request for auditId: ${audit.auditId}`);

    const summary = await generateAuditSummary(audit);
    console.log('[API POST /api/summary] Anthropic generated summary successfully');

    return Response.json({ summary });
  } catch (error) {
    console.error('[API POST /api/summary] Error generating AI summary:', error);
    return Response.json({ error: 'Unable to generate summary.' }, { status: 400 });
  }
}
