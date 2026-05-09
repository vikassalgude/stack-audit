'use client';

import { useEffect, useState } from 'react';

import type { AuditResult } from '../lib/types';
import { CredexCTA } from './CredexCTA';
import { LeadCapture } from './LeadCapture';
import { SavingsHero } from './SavingsHero';
import { ShareButton } from './ShareButton';

interface AuditResultsProps {
  audit: AuditResult;
}

export function AuditResults({ audit }: AuditResultsProps) {
  const [summary, setSummary] = useState(audit.aiSummary ?? '');
  const [loadingSummary, setLoadingSummary] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoadingSummary(true);
      try {
        const response = await fetch('/api/summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ audit }),
        });

        const data = await response.json();
        if (response.ok && typeof data.summary === 'string') {
          setSummary(data.summary);
        }
      } catch (error) {
        // fallback summary is handled server-side
      } finally {
        setLoadingSummary(false);
      }
    };

    fetchSummary();
  }, [audit]);

  return (
    <section className="space-y-8">
      <SavingsHero audit={audit} />

      {audit.savingsTier === 'significant' && <CredexCTA variant="inline" />}

      <div className="grid gap-4">
        {audit.toolResults.map((tool) => (
          <div key={`${tool.toolId}-${tool.currentPlan}`} className="rounded-2xl border border-zinc-200 bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-zinc-900">{tool.toolName}</h3>
                <p className="text-sm text-zinc-600">
                  {tool.currentPlan} · ${tool.currentMonthlySpend.toFixed(0)}/month
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-zinc-900">
                  {tool.monthlySavings > 0
                    ? `$${tool.monthlySavings.toFixed(0)} savings`
                    : 'No savings'}
                </p>
                <p className="text-xs text-zinc-500">{tool.recommendedAction}</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-zinc-600">{tool.reasoning}</p>
            {tool.credexAvailable && (
              <span className="mt-3 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                Available via Credex credits
              </span>
            )}
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-zinc-900">Personalized summary</h3>
        <div className="mt-3 min-h-[96px] text-sm text-zinc-700">
          {loadingSummary ? 'Generating summary...' : summary}
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <ShareButton auditId={audit.auditId} />
        <p className="text-sm text-zinc-600">Share your audit with your team.</p>
      </div>

      <LeadCapture audit={audit} />
    </section>
  );
}
