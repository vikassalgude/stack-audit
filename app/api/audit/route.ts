import { z } from 'zod';

import { runAudit } from '../../../lib/auditEngine';
import { prisma } from '../../../lib/prisma';
import type { FormInput } from '../../../lib/types';

const formSchema = z.object({
  tools: z
    .array(
      z.object({
        toolId: z.string(),
        toolName: z.string(),
        plan: z.string(),
        monthlySpend: z.number(),
        seats: z.number(),
      })
    )
    .min(1),
  teamSize: z.number(),
  useCase: z.enum(['coding', 'writing', 'data', 'research', 'mixed']),
});

export async function POST(request: Request) {
  console.log('[API POST /api/audit] Starting audit request processing...');
  try {
    const body = (await request.json()) as FormInput;
    console.log('[API POST /api/audit] Raw request body parsed:', JSON.stringify(body, null, 2));
    const parsed = formSchema.parse(body) as FormInput;
    console.log('[API POST /api/audit] Zod schema validation passed');

    const auditResult = runAudit(parsed);
    console.log(`[API POST /api/audit] runAudit completed. Generated auditId: ${auditResult.auditId}, total savings: $${auditResult.totalMonthlySavings}`);

    const insertPayload = {
      id: auditResult.auditId,
      slug: auditResult.auditId,
      audit_data: JSON.stringify(auditResult),
      total_monthly_savings: auditResult.totalMonthlySavings,
      savings_tier: auditResult.savingsTier,
      team_size: auditResult.formInput.teamSize,
      use_case: auditResult.formInput.useCase,
      tools_audited: JSON.stringify(auditResult.toolResults.map((tool) => tool.toolName)),
    };
    
    console.log('[API POST /api/audit] Attempting Prisma insert with payload...');

    await prisma.audit.create({
      data: insertPayload
    });

    console.log(`[API POST /api/audit] Prisma insert successful for auditId: ${auditResult.auditId}`);
    return Response.json({ auditId: auditResult.auditId, auditResult });
  } catch (error) {
    console.error('[API POST /api/audit] Audit route error:', error);
    return Response.json({ error: 'Invalid request payload or DB error.' }, { status: 400 });
  }
}
