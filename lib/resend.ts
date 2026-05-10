import { Resend } from 'resend';

import type { AuditResult } from './types';

export async function sendAuditEmail(params: {
  to: string;
  audit: AuditResult;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  if (!apiKey || !baseUrl) {
    throw new Error('Resend or base URL environment variables are not set.');
  }

  const resend = new Resend(apiKey);

  const topRecommendations = params.audit.toolResults
    .filter((tool) => tool.monthlySavings > 0)
    .sort((a, b) => b.monthlySavings - a.monthlySavings)
    .slice(0, 3)
    .map((tool) => `<li>${tool.recommendedAction}</li>`)
    .join('');

  const auditUrl = `${baseUrl.replace(/\/$/, '')}/audit/${params.audit.auditId}`;

  const includeCredex = params.audit.savingsTier === 'significant';

  return resend.emails.send({
    from: 'Credex Audit <onboarding@resend.dev>',
    to: params.to,
    subject: `Your AI Spend Audit — ${params.audit.toolResults.length} tools analyzed`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Your AI Spend Audit</h2>
        <p><strong>Potential monthly savings:</strong> $${params.audit.totalMonthlySavings.toFixed(0)}</p>
        <p><strong>Potential annual savings:</strong> $${params.audit.totalAnnualSavings.toFixed(0)}</p>
        <h3>Top recommendations</h3>
        <ul>${topRecommendations || '<li>No changes needed.</li>'}</ul>
        <p><a href="${auditUrl}">View your full audit</a></p>
        ${
          includeCredex
            ? '<p>Credex can help you capture these savings with discounted AI credits. Book a free consultation.</p>'
            : '<p>We will notify you when new optimizations apply to your stack.</p>'
        }
      </div>
    `,
  });
}
