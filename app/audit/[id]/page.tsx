import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { supabaseAdmin } from '../../../lib/supabase';
import type { AuditResult } from '../../../lib/types';
import { AuditResults } from '../../../components/AuditResults';

async function getAudit(id: string): Promise<AuditResult | null> {
  const { data, error } = await supabaseAdmin
    .from('audits')
    .select('audit_data')
    .eq('id', id)
    .single();

  if (error || !data?.audit_data) {
    return null;
  }

  return data.audit_data as AuditResult;
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const audit = await getAudit(params.id);

  if (!audit) {
    return {
      title: 'Audit not found',
    };
  }

  return {
    title: `AI Spend Audit — $${audit.totalMonthlySavings.toFixed(0)}/mo savings found`,
    description: `This team audited ${audit.toolResults.length} AI tools and found $${audit.totalAnnualSavings.toFixed(
      0
    )}/year in savings opportunities.`,
    openGraph: {
      title: `I could save $${audit.totalMonthlySavings.toFixed(0)}/month on AI tools`,
      description: `Free AI spend audit found ${audit.savingsTier} opportunities across ${audit.toolResults.length} tools.`,
      images: ['/og-image.png'],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `AI Spend Audit — $${audit.totalMonthlySavings.toFixed(0)}/mo savings found`,
      description: `Audited ${audit.toolResults.length} AI tools. Here is what we found.`,
    },
  };
}

export default async function AuditPage({ params }: { params: { id: string } }) {
  const audit = await getAudit(params.id);

  if (!audit) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <main className="mx-auto w-full max-w-5xl px-6 py-16">
        <AuditResults audit={audit} />
      </main>
    </div>
  );
}
