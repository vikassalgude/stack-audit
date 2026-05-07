export const PRICING = {
  cursor: {
    hobby: { price: 0, name: 'Hobby', features: 'Limited completions' },
    pro: { price: 20, name: 'Pro', features: 'Unlimited completions' },
    business: { price: 40, name: 'Business', features: 'Team features + SSO' },
    enterprise: { price: 0, name: 'Enterprise', features: 'Custom pricing' },
  },
  'github-copilot': {
    individual: { price: 10, name: 'Individual', features: 'Basic AI assistance' },
    business: { price: 19, name: 'Business', features: 'Team management' },
    enterprise: { price: 0, name: 'Enterprise', features: 'SSO + audit logs' },
  },
  claude: {
    free: { price: 0, name: 'Free', features: 'Limited usage' },
    pro: { price: 20, name: 'Pro', features: 'Priority access' },
    max: { price: 100, name: 'Max', features: 'Maximum usage limits' },
    team: { price: 30, name: 'Team', features: 'Team features, min 5 seats' },
    enterprise: { price: 0, name: 'Enterprise', features: 'Custom pricing' },
    'api-direct': { price: 0, name: 'API Direct', features: 'Pay per token' },
  },
  chatgpt: {
    plus: { price: 20, name: 'Plus', features: 'Full GPT-4 access' },
    team: { price: 30, name: 'Team', features: 'Team workspace, min 2 seats' },
    enterprise: { price: 0, name: 'Enterprise', features: 'Custom pricing' },
    'api-direct': { price: 0, name: 'API Direct', features: 'Pay per token' },
  },
  'anthropic-api': {
    payg: {
      price: 0,
      name: 'Pay-as-you-go',
      features: 'Pay per token - Claude API direct usage',
    },
  },
  'openai-api': {
    payg: {
      price: 0,
      name: 'Pay-as-you-go',
      features: 'Pay per token - OpenAI API direct usage',
    },
  },
  gemini: {
    pro: { price: 19.99, name: 'Pro', features: 'Gemini Pro' },
    ultra: { price: 0, name: 'Ultra', features: 'Custom pricing' },
    api: { price: 0, name: 'API', features: 'Pay per token' },
  },
  windsurf: {
    free: { price: 0, name: 'Free', features: 'Limited prompts' },
    pro: { price: 15, name: 'Pro', features: 'Unlimited prompts' },
    teams: { price: 35, name: 'Teams', features: 'Team collaboration' },
  },
} as const;

export const TOOL_DEFINITIONS = {
  cursor: {
    name: 'Cursor',
    plans: ['Hobby', 'Pro', 'Business', 'Enterprise'],
  },
  'github-copilot': {
    name: 'GitHub Copilot',
    plans: ['Individual', 'Business', 'Enterprise'],
  },
  claude: {
    name: 'Claude',
    plans: ['Free', 'Pro', 'Max', 'Team', 'Enterprise', 'API Direct'],
  },
  chatgpt: {
    name: 'ChatGPT',
    plans: ['Plus', 'Team', 'Enterprise', 'API Direct'],
  },
  'anthropic-api': {
    name: 'Anthropic API Direct',
    plans: ['Pay-as-you-go'],
  },
  'openai-api': {
    name: 'OpenAI API Direct',
    plans: ['Pay-as-you-go'],
  },
  gemini: {
    name: 'Gemini',
    plans: ['Pro', 'Ultra', 'API'],
  },
  windsurf: {
    name: 'Windsurf',
    plans: ['Free', 'Pro', 'Teams'],
  },
} as const;

export const TOOL_NAMES: Record<string, string> = {
  cursor: 'Cursor',
  'github-copilot': 'GitHub Copilot',
  claude: 'Claude',
  chatgpt: 'ChatGPT',
  'anthropic-api': 'Anthropic API',
  'openai-api': 'OpenAI API',
  gemini: 'Gemini',
  windsurf: 'Windsurf',
};

export const ALTERNATIVES: Record<string, Record<string, string[]>> = {
  coding: {
    cursor: ['windsurf', 'github-copilot'],
    'github-copilot': ['cursor', 'windsurf'],
    windsurf: ['cursor', 'github-copilot'],
  },
  writing: {
    chatgpt: ['claude'],
    claude: ['chatgpt'],
  },
  mixed: {
    chatgpt: ['claude'],
    claude: ['chatgpt'],
    cursor: ['windsurf'],
  },
};
