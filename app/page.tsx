'use client';

import { useState } from 'react';

import type { AuditResult, FormInput } from '../lib/types';
import { AuditResults } from '../components/AuditResults';
import { SpendForm } from '../components/SpendForm';

export default function Home() {
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAudit = async (input: FormInput) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error ?? 'Unable to run audit');
      }

      setAuditResult(data.auditResult);
    } catch (err) {
      setError('We could not run the audit. Please try again.');
    } finally {
      setLoading(false);
    }
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

        {loading && (
          <p className="text-sm font-semibold text-zinc-600">Running audit...</p>
        )}
        {error && <p className="text-sm font-semibold text-red-600">{error}</p>}

        {auditResult && <AuditResults audit={auditResult} />}
      </main>
    </div>
  );
}
