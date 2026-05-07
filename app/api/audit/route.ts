import { z } from 'zod';

import { runAudit } from '../../../lib/auditEngine';
import { supabaseAdmin } from '../../../lib/supabase';
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
  try {
    const body = (await request.json()) as FormInput;
    const parsed = formSchema.parse(body);

    const auditResult = runAudit(parsed);

    const { error } = await supabaseAdmin.from('audits').insert({
      id: auditResult.auditId,
      audit_data: auditResult,
      total_monthly_savings: auditResult.totalMonthlySavings,
      savings_tier: auditResult.savingsTier,
      team_size: auditResult.formInput.teamSize,
      use_case: auditResult.formInput.useCase,
      tools_audited: auditResult.toolResults.map((tool) => tool.toolName),
    });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ auditId: auditResult.auditId, auditResult });
  } catch (error) {
    return Response.json({ error: 'Invalid request payload.' }, { status: 400 });
  }
}
