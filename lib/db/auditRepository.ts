import type { AuditResult } from '../types';
import { prisma } from '../prisma';

function serializeAudit(audit: AuditResult) {
  return {
    id: audit.auditId,
    slug: audit.auditId,
    audit_data: JSON.stringify(audit),
    total_monthly_savings: audit.totalMonthlySavings,
    savings_tier: audit.savingsTier,
    team_size: audit.formInput.teamSize,
    use_case: audit.formInput.useCase,
    tools_audited: JSON.stringify(audit.toolResults.map((tool) => tool.toolName)),
  };
}

function deserializeAudit(payload: { audit_data: string }): AuditResult {
  return JSON.parse(payload.audit_data) as AuditResult;
}

export async function createAudit(audit: AuditResult) {
  return prisma.audit.create({
    data: serializeAudit(audit),
  });
}

export async function getAuditById(id: string): Promise<AuditResult | null> {
  const auditRow = await prisma.audit.findUnique({
    where: { id },
    select: { audit_data: true },
  });

  if (!auditRow?.audit_data) {
    return null;
  }

  return deserializeAudit(auditRow);
}
