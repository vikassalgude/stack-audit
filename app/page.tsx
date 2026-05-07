'use client';

import { useState } from 'react';

import { runAudit } from '../lib/auditEngine';
import type { AuditResult, FormInput } from '../lib/types';
import { SpendForm } from '../components/SpendForm';

export default function Home() {
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);

  const handleAudit = (input: FormInput) => {
    setAuditResult(runAudit(input));
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-12 px-6 py-16">
        <section className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Credex AI Spend Audit
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
            Know exactly where your AI spend is leaking.
          </h1>
          <p className="max-w-2xl text-lg text-zinc-600">
            Get a free, finance-grade audit of your AI tool stack. See the exact
            savings, the best plan swaps, and the vendors worth switching.
          </p>
        </section>

        <SpendForm onAudit={handleAudit} />

        {auditResult && (
          <section className="rounded-2xl border border-dashed border-zinc-300 bg-white p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Audit preview
            </p>
            <p className="mt-3 text-2xl font-semibold text-zinc-900">
              ${auditResult.totalMonthlySavings.toFixed(0)} monthly savings spotted.
            </p>
            <p className="mt-2 text-sm text-zinc-600">
              Detailed results, summary, and sharing flow come next.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}
