export type ToolId =
  | 'cursor'
  | 'github-copilot'
  | 'claude'
  | 'chatgpt'
  | 'anthropic-api'
  | 'openai-api'
  | 'gemini'
  | 'windsurf';

export type UseCase = 'coding' | 'writing' | 'data' | 'research' | 'mixed';

export type RecommendationType = 'keep' | 'downgrade' | 'switch' | 'consolidate';

export type SavingsTier = 'optimal' | 'moderate' | 'significant';

export interface ToolInput {
  toolId: ToolId;
  toolName: string;
  plan: string;
  monthlySpend: number;
  seats: number;
}

export interface FormInput {
  tools: ToolInput[];
  teamSize: number;
  useCase: UseCase;
}

export interface ToolAuditResult {
  toolId: ToolId;
  toolName: string;
  currentPlan: string;
  currentMonthlySpend: number;
  seats: number;
  recommendation: RecommendationType;
  recommendedAction: string;
  recommendedPlan?: string;
  recommendedTool?: string;
  estimatedMonthlyCost: number;
  monthlySavings: number;
  annualSavings: number;
  reasoning: string;
  credexAvailable: boolean;
}

export interface AuditResult {
  auditId: string;
  formInput: FormInput;
  toolResults: ToolAuditResult[];
  totalMonthlySpend: number;
  totalOptimizedMonthlySpend: number;
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  savingsTier: SavingsTier;
  generatedAt: string;
  aiSummary?: string;
}

export interface LeadInput {
  auditId: string;
  email: string;
  companyName?: string;
  role?: string;
  teamSize?: number;
}
