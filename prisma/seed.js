const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  await prisma.audit.create({
    data: {
      id: 'seed-audit',
      slug: 'seed-audit',
      audit_data: JSON.stringify({
        auditId: 'seed-audit',
        formInput: { tools: [], teamSize: 1, useCase: 'mixed' },
        toolResults: [],
        totalMonthlySpend: 0,
        totalOptimizedMonthlySpend: 0,
        totalMonthlySavings: 0,
        totalAnnualSavings: 0,
        savingsTier: 'optimal',
        generatedAt: new Date().toISOString(),
      }),
      total_monthly_savings: 0,
      savings_tier: 'optimal',
      team_size: 1,
      use_case: 'mixed',
      tools_audited: JSON.stringify([]),
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
