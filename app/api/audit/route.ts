import { z } from 'zod';

import { runAudit } from '../../../lib/auditEngine';
import { createAudit } from '../../../lib/db';
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
    const parsed = formSchema.safeParse(body);
    if (!parsed.success) {
      console.warn('[API POST /api/audit] Zod validation failed', parsed.error.flatten());
      return Response.json(
        { error: 'Invalid request payload.', details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    console.log('[API POST /api/audit] Zod schema validation passed');

    const auditResult = runAudit(parsed.data as FormInput);
    console.log(`[API POST /api/audit] runAudit completed. Generated auditId: ${auditResult.auditId}, total savings: $${auditResult.totalMonthlySavings}`);

    console.log('[API POST /api/audit] Attempting Prisma insert with payload...');

    const { id } = await createAudit(auditResult);

    console.log(`[API POST /api/audit] Audit stored statelessly. Public ID: ${id}`);
    return Response.json({ auditId: id, auditResult });
  } catch (error: any) {
    console.error('[API POST /api/audit] Audit route error:', error);
    const message = error?.message || 'Audit server error.';
    return Response.json({ error: message }, { status: 500 });
  }
}
