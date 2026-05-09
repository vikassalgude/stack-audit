import type { AuditResult } from '../lib/types';

interface SavingsHeroProps {
  audit: AuditResult;
}

export function SavingsHero({ audit }: SavingsHeroProps) {
  const isOptimal = audit.savingsTier === 'optimal';

  return (
    <section
      className={`rounded-3xl border px-6 py-8 sm:px-10 ${
        isOptimal
          ? 'border-blue-200 bg-blue-50 text-blue-900'
          : 'border-emerald-200 bg-emerald-50 text-emerald-900'
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.3em]">
        {isOptimal ? 'Spending looks healthy' : 'Savings opportunity'}
      </p>
      <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
        {isOptimal
          ? 'You are spending well.'
          : `You could save $${audit.totalMonthlySavings.toFixed(0)}/month.`}
      </h2>
      <p className="mt-2 text-base">
        {isOptimal
          ? `Your current AI stack costs $${audit.totalMonthlySpend.toFixed(0)} per month.`
          : `That is $${audit.totalAnnualSavings.toFixed(0)} per year in potential savings.`}
      </p>
    </section>
  );
}
