import { AuditResult } from '../types';

// In-memory store for the current server process session
// Note: This is "inbuilt" but will reset on server restarts/cold starts.
const auditStore = new Map<string, any>();
const leadStore = new Map<string, any[]>();

/**
 * Encodes audit data into a URL-safe Base64 string.
 * This allows the audit to be shared via URL WITHOUT a database.
 */
function encodeAudit(audit: AuditResult): string {
  try {
    const json = JSON.stringify(audit);
    // Using a simple base64 encoding for the "inbuilt" feel
    return Buffer.from(json).toString('base64url');
  } catch (e) {
    return audit.auditId;
  }
}

/**
 * Decodes audit data from a Base64 string.
 */
function decodeAudit(encoded: string): AuditResult | null {
  try {
    const json = Buffer.from(encoded, 'base64url').toString('utf8');
    return JSON.parse(json) as AuditResult;
  } catch (e) {
    return null;
  }
}

export async function createAudit(audit: AuditResult) {
  const encodedId = encodeAudit(audit);
  auditStore.set(audit.auditId, audit);
  auditStore.set(encodedId, audit); // Also allow lookup by encoded ID
  
  // We return the encoded ID so the share URL works even if the DB is wiped
  return { id: encodedId };
}

export async function getAuditById(id: string): Promise<AuditResult | null> {
  // 1. Try memory store
  if (auditStore.has(id)) {
    return auditStore.get(id);
  }

  // 2. Try decoding from the ID itself (Stateless mode)
  const decoded = decodeAudit(id);
  if (decoded) {
    return decoded;
  }

  return null;
}

export async function createLead(input: any) {
  const leads = leadStore.get(input.auditId) || [];
  leads.push({ ...input, created_at: new Date() });
  leadStore.set(input.auditId, leads);
  return { success: true };
}

export async function markLeadEmailSent(auditId: string, email: string) {
  // Memory store update
  return true;
}
