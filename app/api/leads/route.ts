import { z } from 'zod';

import { supabaseAdmin } from '../../../lib/supabase';
import { sendAuditEmail } from '../../../lib/resend';
import type { AuditResult } from '../../../lib/types';

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX = 3;
const rateLimitStore = new Map<string, number[]>();

const leadSchema = z.object({
  auditId: z.string(),
  email: z.string().email(),
  companyName: z.string().optional(),
  role: z.string().optional(),
  teamSize: z.number().optional(),
  website: z.string().optional(),
});

function isRateLimited(ip: string) {
  const now = Date.now();
  const timestamps = rateLimitStore.get(ip) ?? [];
  const recent = timestamps.filter((time) => now - time < RATE_LIMIT_WINDOW_MS);

  if (recent.length >= RATE_LIMIT_MAX) {
    rateLimitStore.set(ip, recent);
    return true;
  }

  recent.push(now);
  rateLimitStore.set(ip, recent);
  return false;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = leadSchema.parse(body);

    if (parsed.website) {
      return Response.json({ success: true });
    }

    const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
    if (isRateLimited(ip)) {
      return Response.json({ error: 'Rate limit exceeded.' }, { status: 429 });
    }

    const { data: auditRow, error: auditError } = await supabaseAdmin
      .from('audits')
      .select('audit_data')
      .eq('id', parsed.auditId)
      .single();

    if (auditError || !auditRow?.audit_data) {
      return Response.json({ error: 'Audit not found.' }, { status: 404 });
    }

    const audit = auditRow.audit_data as AuditResult;

    const { error } = await supabaseAdmin.from('leads').insert({
      audit_id: parsed.auditId,
      email: parsed.email,
      company_name: parsed.companyName,
      role: parsed.role,
      team_size: parsed.teamSize,
      monthly_savings: audit.totalMonthlySavings,
      savings_tier: audit.savingsTier,
      email_sent: false,
    });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    await sendAuditEmail({ to: parsed.email, audit });

    await supabaseAdmin
      .from('leads')
      .update({ email_sent: true })
      .eq('audit_id', parsed.auditId)
      .eq('email', parsed.email);

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: 'Invalid request payload.' }, { status: 400 });
  }
}
