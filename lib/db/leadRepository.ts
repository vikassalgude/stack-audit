import { prisma } from '../prisma';

export async function createLead(input: {
  auditId: string;
  email: string;
  companyName?: string;
  role?: string;
  teamSize?: number;
  monthlySavings: number;
  savingsTier: string;
}) {
  return prisma.lead.create({
    data: {
      audit_id: input.auditId,
      email: input.email,
      company_name: input.companyName,
      role: input.role,
      team_size: input.teamSize,
      monthly_savings: input.monthlySavings,
      savings_tier: input.savingsTier,
      email_sent: false,
    },
  });
}

export async function markLeadEmailSent(auditId: string, email: string) {
  return prisma.lead.updateMany({
    where: {
      audit_id: auditId,
      email,
    },
    data: {
      email_sent: true,
    },
  });
}
