import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getAuditById } from '../../../lib/db';
import type { AuditResult } from '../../../lib/types';
import { AuditResults } from '../../../components/AuditResults';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function getAudit(id: string): Promise<AuditResult | null> {
  return getAuditById(id);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  if (!id) {
    return { title: 'Audit not found' };
  }

  const audit = await getAudit(id);

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

export default async function AuditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!id) {
    notFound();
  }

  const audit = await getAudit(id);

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
