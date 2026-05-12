import { z } from 'zod';

import { createLead, getAuditById, markLeadEmailSent } from '../../../lib/db';
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
  console.log('[API POST /api/leads] Processing new lead submission...');
  try {
    const body = await request.json();
    console.log('[API POST /api/leads] Raw request body parsed:', JSON.stringify(body, null, 2));
    const parsed = leadSchema.parse(body);
    console.log('[API POST /api/leads] Validation passed for email:', parsed.email);

    if (parsed.website) {
      console.log('[API POST /api/leads] Honeypot field (website) triggered. Silently rejecting.');
      return Response.json({ success: true });
    }

    const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
    if (isRateLimited(ip)) {
      console.log(`[API POST /api/leads] Rate limit hit for IP: ${ip}`);
      return Response.json({ error: 'Rate limit exceeded.' }, { status: 429 });
    }

    console.log(`[API POST /api/leads] Fetching audit data from Prisma for auditId: ${parsed.auditId}`);
    const audit = await getAuditById(parsed.auditId);

    if (!audit) {
      console.error('[API POST /api/leads] Audit fetch failed: No data found');
      return Response.json({ error: 'Audit not found.' }, { status: 404 });
    }
    console.log(`[API POST /api/leads] Audit data retrieved successfully. Inserting lead into DB.`);

    await createLead({
      auditId: parsed.auditId,
      email: parsed.email,
      companyName: parsed.companyName,
      role: parsed.role,
      teamSize: parsed.teamSize,
      monthlySavings: audit.totalMonthlySavings,
      savingsTier: audit.savingsTier,
    });

    console.log(`[API POST /api/leads] Lead successfully captured. Sending summary email to ${parsed.email}...`);

    await sendAuditEmail({ to: parsed.email, audit });
    console.log(`[API POST /api/leads] Email sent successfully.`);

    // If there are multiple leads for the same email + audit_id, updateMany resolves it.
    await markLeadEmailSent(parsed.auditId, parsed.email);
    console.log(`[API POST /api/leads] Successfully marked email as sent in DB.`);

    return Response.json({ success: true });
  } catch (error: any) {
    console.error('[API POST /api/leads] Route error Catch block:', error);
    const message = error?.message || 'Invalid request payload.';
    return Response.json({ error: message }, { status: 400 });
  }
}
