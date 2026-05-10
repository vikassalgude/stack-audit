import { PRICING, TOOL_DEFINITIONS } from './pricing-data';
import type {
  AuditResult,
  FormInput,
  RecommendationType,
  SavingsTier,
  ToolAuditResult,
  ToolId,
} from './types';

const PLAN_KEY_BY_LABEL: Record<ToolId, Record<string, string>> = {
  cursor: {
    hobby: 'hobby',
    pro: 'pro',
    business: 'business',
    enterprise: 'enterprise',
  },
  'github-copilot': {
    individual: 'individual',
    business: 'business',
    enterprise: 'enterprise',
  },
  claude: {
    free: 'free',
    pro: 'pro',
    max: 'max',
    team: 'team',
    enterprise: 'enterprise',
    'api direct': 'api-direct',
  },
  chatgpt: {
    plus: 'plus',
    team: 'team',
    enterprise: 'enterprise',
    'api direct': 'api-direct',
  },
  'anthropic-api': {
    'pay-as-you-go': 'payg',
    payg: 'payg',
  },
  'openai-api': {
    'pay-as-you-go': 'payg',
    payg: 'payg',
  },
  gemini: {
    pro: 'pro',
    ultra: 'ultra',
    api: 'api',
  },
  windsurf: {
    free: 'free',
    pro: 'pro',
    teams: 'teams',
    team: 'teams',
  },
};

const TEAM_DOWNGRADE_PLAN: Partial<Record<ToolId, string>> = {
  claude: 'Pro',
  chatgpt: 'Plus',
  windsurf: 'Pro',
  'github-copilot': 'Individual',
};

const ENTERPRISE_DOWNGRADE_PLAN: Partial<Record<ToolId, string>> = {
  cursor: 'Business',
  'github-copilot': 'Business',
  claude: 'Team',
  chatgpt: 'Team',
};

const CREDEX_ELIGIBLE_TOOLS = new Set<ToolId>(['cursor', 'claude']);

const fallbackUuid = () =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const rand = Math.floor(Math.random() * 16);
    const value = char === 'x' ? rand : (rand % 4) + 8;
    return value.toString(16);
  });

const createAuditId = () => globalThis.crypto?.randomUUID?.() ?? fallbackUuid();

function normalizeLabel(label: string) {
  return label.trim().toLowerCase();
}

function getPlanPrice(toolId: ToolId, planLabel: string): number | null {
  const planKey = PLAN_KEY_BY_LABEL[toolId]?.[normalizeLabel(planLabel)];
  if (!planKey) return null;

  const toolPricing = PRICING[toolId] as any;
  const plan = toolPricing?.[planKey];
  if (!plan || typeof plan.price !== 'number') return null;

  return plan.price;
}

function estimatePlanCost(toolId: ToolId, planLabel: string, seats: number): number | null {
  const price = getPlanPrice(toolId, planLabel);
  if (price === null) return null;

  return price * Math.max(1, seats);
}

function getSavingsTier(totalMonthlySavings: number): SavingsTier {
  if (totalMonthlySavings < 100) return 'optimal';
  if (totalMonthlySavings <= 500) return 'moderate';
  return 'significant';
}

function isTeamPlan(planLabel: string) {
  const normalized = normalizeLabel(planLabel);
  return normalized === 'team' || normalized === 'teams';
}

function isEnterprisePlan(planLabel: string) {
  return normalizeLabel(planLabel) === 'enterprise';
}

function isApiDirectPlan(planLabel: string) {
  const normalized = normalizeLabel(planLabel);
  return normalized === 'api direct' || normalized === 'pay-as-you-go' || normalized === 'api';
}

function buildDefaultReason(toolName: string) {
  return `${toolName} is sized appropriately for your current usage and spend.`;
}

function getCredexAvailability(toolId: ToolId, planLabel: string) {
  if (isApiDirectPlan(planLabel)) return false;

  if (toolId === 'github-copilot') {
    const normalized = normalizeLabel(planLabel);
    return normalized === 'business' || normalized === 'enterprise';
  }

  if (toolId === 'chatgpt') {
    return normalizeLabel(planLabel) === 'enterprise';
  }

  return CREDEX_ELIGIBLE_TOOLS.has(toolId);
}

function getToolName(toolId: ToolId, fallback: string) {
  return TOOL_DEFINITIONS[toolId]?.name ?? fallback;
}

export function runAudit(input: FormInput): AuditResult {
  console.log(`[auditEngine runAudit] Starting pure audit engine logic for ${input.tools.length} tools. Use Case: ${input.useCase}, Team Size: ${input.teamSize}`);
  
  const toolIds = new Set(input.tools.map((tool) => tool.toolId));
  const hasAnthropicApi = toolIds.has('anthropic-api');
  const hasOpenAiApi = toolIds.has('openai-api');

  console.log(`[auditEngine runAudit] Detected API tools - Anthropic: ${hasAnthropicApi}, OpenAI: ${hasOpenAiApi}`);

  const shouldConsolidateResearch = input.useCase === 'research' && input.tools.length >= 3;
  const consolidationTarget = input.teamSize >= 5 ? 'Claude Team' : 'ChatGPT Team';

  if (shouldConsolidateResearch) {
    console.log(`[auditEngine runAudit] Flagged for research consolidation. Target: ${consolidationTarget}`);
  }

  const consolidationToolId = shouldConsolidateResearch
    ? input.tools.reduce((max, tool) =>
        tool.monthlySpend > max.monthlySpend ? tool : max
      ).toolId
    : null;

  const toolResults: ToolAuditResult[] = input.tools.map((tool) => {
    const toolName = getToolName(tool.toolId, tool.toolName);
    const currentPlan = tool.plan;
    const currentSpend = tool.monthlySpend;
    const seats = tool.seats;

    let recommendation: RecommendationType = 'keep';
    let recommendedAction = 'Keep your current plan.';
    let recommendedPlan: string | undefined;
    let recommendedTool: string | undefined;
    let estimatedMonthlyCost = currentSpend;
    let reasoning = buildDefaultReason(toolName);

    if (tool.toolId === 'claude' && normalizeLabel(currentPlan) === 'pro' && hasAnthropicApi) {
      recommendation = 'consolidate';
      recommendedAction = 'Drop Claude Pro and keep Anthropic API Direct.';
      estimatedMonthlyCost = 0;
      reasoning =
        'API Direct access already covers Claude Pro capabilities, so paying for both is redundant.';
    } else if (
      tool.toolId === 'chatgpt' &&
      ['plus', 'team'].includes(normalizeLabel(currentPlan)) &&
      hasOpenAiApi
    ) {
      recommendation = 'consolidate';
      recommendedAction = 'Drop ChatGPT and keep OpenAI API Direct.';
      estimatedMonthlyCost = 0;
      reasoning =
        'ChatGPT subscriptions overlap with OpenAI API access for technical users, creating duplicate costs.';
    } else if (isTeamPlan(currentPlan) && seats < 3 && TEAM_DOWNGRADE_PLAN[tool.toolId]) {
      recommendation = 'downgrade';
      recommendedPlan = TEAM_DOWNGRADE_PLAN[tool.toolId] as string;
      recommendedAction = `Downgrade to ${recommendedPlan}.`;
      const downgradeCost = estimatePlanCost(tool.toolId, recommendedPlan, seats);
      if (downgradeCost !== null) {
        estimatedMonthlyCost = downgradeCost;
      }
      reasoning = `Team plans are designed for 3+ users; at ${seats} seats you pay a per-seat premium with no added value.`;
    } else if (isEnterprisePlan(currentPlan) && currentSpend < 500 && ENTERPRISE_DOWNGRADE_PLAN[tool.toolId]) {
      recommendation = 'downgrade';
      recommendedPlan = ENTERPRISE_DOWNGRADE_PLAN[tool.toolId] as string;
      recommendedAction = `Downgrade to ${recommendedPlan}.`;
      const downgradeCost = estimatePlanCost(tool.toolId, recommendedPlan, seats);
      if (downgradeCost !== null) {
        estimatedMonthlyCost = downgradeCost;
      }
      reasoning =
        'Enterprise tiers typically break even above $500/month; your current usage suggests a lower tier suffices.';
    } else if (
      input.useCase === 'coding' &&
      tool.toolId === 'chatgpt' &&
      normalizeLabel(currentPlan) === 'plus' &&
      !toolIds.has('cursor') &&
      !toolIds.has('github-copilot')
    ) {
      recommendation = 'switch';
      recommendedTool = 'Cursor';
      recommendedPlan = 'Hobby';
      recommendedAction = 'Switch to Cursor Hobby (free) or GitHub Copilot Individual for coding work.';
      const switchCost = estimatePlanCost('cursor', recommendedPlan, seats);
      if (switchCost !== null) {
        estimatedMonthlyCost = switchCost;
      }
      reasoning = 'Coding-focused tools provide better ROI for editor workflows than general chat plans.';
    } else if (
      input.useCase === 'writing' &&
      tool.toolId === 'cursor' &&
      normalizeLabel(currentPlan) === 'pro'
    ) {
      recommendation = 'switch';
      recommendedTool = 'Claude';
      recommendedPlan = 'Pro';
      recommendedAction = 'Switch to Claude Pro for writing-focused workflows.';
      const switchCost = estimatePlanCost('claude', recommendedPlan, seats);
      if (switchCost !== null) {
        estimatedMonthlyCost = switchCost;
      }
      reasoning = 'Cursor is optimized for coding, while Claude Pro delivers better value for writing-heavy work.';
    } else if (shouldConsolidateResearch && consolidationToolId === tool.toolId) {
      recommendation = 'consolidate';
      recommendedTool = consolidationTarget.split(' ')[0];
      recommendedPlan = consolidationTarget.split(' ').slice(1).join(' ');
      recommendedAction = `Consolidate research tooling into ${consolidationTarget}.`;
      const targetToolId = recommendedTool?.toLowerCase() === 'claude' ? 'claude' : 'chatgpt';
      const consolidationCost = estimatePlanCost(
        targetToolId,
        recommendedPlan,
        input.teamSize
      );
      if (consolidationCost !== null) {
        estimatedMonthlyCost = consolidationCost;
      }
      reasoning =
        'Using three or more overlapping tools for research creates redundant spend; consolidation lowers costs.';
    }

    const monthlySavings = Math.max(0, currentSpend - estimatedMonthlyCost);
    const annualSavings = monthlySavings * 12;

    if (monthlySavings === 0) {
      recommendation = 'keep';
      recommendedAction = 'Keep your current plan.';
      recommendedPlan = undefined;
      recommendedTool = undefined;
    }

    return {
      toolId: tool.toolId,
      toolName,
      currentPlan,
      currentMonthlySpend: currentSpend,
      seats,
      recommendation,
      recommendedAction,
      recommendedPlan,
      recommendedTool,
      estimatedMonthlyCost,
      monthlySavings,
      annualSavings,
      reasoning,
      credexAvailable: getCredexAvailability(tool.toolId, currentPlan),
    };
  });

  const totalMonthlySpend = toolResults.reduce(
    (sum, tool) => sum + tool.currentMonthlySpend,
    0
  );
  const totalOptimizedMonthlySpend = toolResults.reduce(
    (sum, tool) => sum + tool.estimatedMonthlyCost,
    0
  );
  const totalMonthlySavings = toolResults.reduce(
    (sum, tool) => sum + tool.monthlySavings,
    0
  );
  const totalAnnualSavings = totalMonthlySavings * 12;

  const result: AuditResult = {
    auditId: createAuditId(),
    formInput: input,
    toolResults,
    totalMonthlySpend,
    totalOptimizedMonthlySpend,
    totalMonthlySavings,
    totalAnnualSavings,
    savingsTier: getSavingsTier(totalMonthlySavings),
    generatedAt: new Date().toISOString(),
  };

  console.log(`[auditEngine runAudit] Completed engine evaluation. Savings generated: $${totalMonthlySavings}/mo (${result.savingsTier} tier).`);
  return result;
}
