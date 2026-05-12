'use client';

import { useState } from 'react';

import type { AuditResult } from '../lib/types';
import { CredexCTA } from './CredexCTA';

interface LeadCaptureProps {
  audit: AuditResult;
}

export function LeadCapture({ audit }: LeadCaptureProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('loading');
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      auditId: audit.auditId,
      email: String(formData.get('email') || ''),
      companyName: String(formData.get('companyName') || ''),
      role: String(formData.get('role') || ''),
      teamSize: audit.formInput.teamSize,
      website: String(formData.get('website') || ''),
    };

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Lead capture failed');
      }

      setStatus('success');
      setMessage(data.message || 'Report sent. Check your inbox.');
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message || 'Something went wrong. Try again.');
    }
  };

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6">
      <h3 className="text-lg font-semibold text-zinc-900">Get your full report by email</h3>
      <p className="mt-1 text-sm text-zinc-600">
        We will send a copy of your audit and notify you about new savings opportunities.
      </p>

      <form className="mt-4 grid gap-3" onSubmit={handleSubmit}>
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          className="hidden"
          aria-hidden="true"
        />
        <input
          type="email"
          name="email"
          required
          placeholder="Email address"
          className="h-11 rounded-lg border border-zinc-200 px-3 text-sm"
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            type="text"
            name="companyName"
            placeholder="Company name (optional)"
            className="h-11 rounded-lg border border-zinc-200 px-3 text-sm"
          />
          <input
            type="text"
            name="role"
            placeholder="Role (optional)"
            className="h-11 rounded-lg border border-zinc-200 px-3 text-sm"
          />
        </div>
        <button
          type="submit"
          className="h-11 rounded-full bg-zinc-900 text-sm font-semibold text-white"
          disabled={status === 'loading'}
        >
          {status === 'loading' ? 'Sending...' : 'Email me the report'}
        </button>
      </form>

      {status === 'success' && (
        <p className="mt-3 text-sm text-emerald-600">{message}</p>
      )}
      {status === 'error' && (
        <p className="mt-3 text-sm text-red-600">{message}</p>
      )}

      {audit.savingsTier === 'significant' && (
        <div className="mt-5">
          <CredexCTA />
        </div>
      )}
    </section>
  );
}
