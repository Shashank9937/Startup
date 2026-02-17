import { addDays } from 'date-fns';
import { dateISO, monthISO, next30DaysMilestones, nowISO, uid, weekStartISO } from './utils';

const ROADMAP_MONTHS = [
  'Idea Generation & Selection',
  'Deep Validation',
  'MVP Scoping & Build Sprint',
  'Product-Market Fit Sprint',
  'Growth Experimentation',
  'Scale Operations',
  'Fundraising Prep Begins',
  'Traction Obsession',
  'Fundraising Sprint',
  'Scale & Close',
  'Scale & Close',
  'Scale & Close'
];

const MONTH_1_WEEKS = [
  {
    title: 'Week 1: Problem Space Mapping',
    tasks: [
      'List 20 painful workflows in your target market',
      'Rank pains by urgency and willingness to pay',
      'Map alternatives currently used',
      'Identify underserved segments',
      'Write initial problem thesis'
    ]
  },
  {
    title: 'Week 2: Customer Discovery Sprint',
    tasks: [
      'Schedule and run 25 interviews',
      'Capture exact language from interviews',
      'Score problem intensity for each interview',
      'Track willingness to pay signal',
      'Summarize top recurring pains'
    ]
  },
  {
    title: 'Week 3: Market Sizing & Competition',
    tasks: [
      'Estimate TAM/SAM/SOM with assumptions',
      'Build competitive matrix',
      'Identify differentiation wedge',
      'Define 3 possible monetization models',
      'Validate segment economics'
    ]
  },
  {
    title: 'Week 4: Decision & Commitment',
    tasks: [
      'Pick one wedge and one ICP',
      'Create 90-day execution plan',
      'Define validation success criteria',
      'Outline initial MVP scope',
      'Commit publicly to one direction'
    ]
  }
];

function buildRoadmapMonth(index) {
  const month = index + 1;
  const defaultWeeks = month === 1
    ? MONTH_1_WEEKS
    : [
      { title: 'Week 1: Plan', tasks: ['Set measurable outcomes', 'Define weekly milestones', 'Identify risks', 'Assign owners', 'Confirm success metrics'] },
      { title: 'Week 2: Execute', tasks: ['Run planned experiments', 'Collect signal from customers', 'Track metrics daily', 'Document blockers', 'Ship one meaningful improvement'] },
      { title: 'Week 3: Optimize', tasks: ['Remove bottlenecks', 'Improve conversion/retention', 'Review unit economics', 'Strengthen systems', 'Close open loops'] },
      { title: 'Week 4: Review', tasks: ['Run monthly synthesis', 'Update playbooks', 'Decide continue/pivot/kill', 'Define next month priorities', 'Share stakeholder update'] }
    ];

  const exitCriteria = month === 1
    ? [
      '25+ customer interviews completed',
      'Clear problem statement validated by 80%+ of target customers',
      '$1B+ TAM identified',
      'Specific customer segment defined'
    ]
    : [
      'Primary monthly KPI target hit',
      'Critical checklist complete',
      'No unresolved blockers',
      'Next-month plan approved'
    ];

  const aiActions = month === 1
    ? ['Generate ideas', 'Analyze interviews', 'Size market']
    : ['Generate experiments', 'Summarize learnings', 'Flag risks'];

  return {
    id: uid('roadmap_month'),
    month,
    title: ROADMAP_MONTHS[index],
    status: 'Not Started',
    notes: '',
    progress: 0,
    weeks: defaultWeeks.map((week) => ({
      id: uid('week'),
      title: week.title,
      tasks: week.tasks.map((text) => ({ id: uid('task'), text, done: false, dueDate: dateISO(addDays(new Date(), month * 6)) }))
    })),
    exitCriteria: exitCriteria.map((text) => ({ id: uid('exit'), text, done: false })),
    activities: [
      { id: uid('activity'), text: 'Review goals and constraints', dueDate: dateISO(addDays(new Date(), month * 2)), done: false },
      { id: uid('activity'), text: 'Execute monthly strategic priority', dueDate: dateISO(addDays(new Date(), month * 5)), done: false }
    ],
    killCriteria: [
      { id: uid('kill'), text: 'Progress below minimum threshold for 2 consecutive weeks', triggered: false },
      { id: uid('kill'), text: 'No customer demand signal', triggered: false }
    ],
    dependencies: [],
    milestones: [
      { id: uid('milestone'), title: `Month ${month} Midpoint Review`, date: dateISO(addDays(new Date(), month * 4)), critical: month <= 4 },
      { id: uid('milestone'), title: `Month ${month} Exit Gate`, date: dateISO(addDays(new Date(), month * 8)), critical: true }
    ],
    aiActions
  };
}

const MENTAL_MODELS = [
  ['Tier 1: Fundamental', ['First Principles', 'Second-Order Thinking', 'Inversion', 'Opportunity Cost', 'Pareto Principle', 'Compounding', 'Feedback Loops']],
  ['Tier 2: Business Models', ['Network Effects', 'Flywheel', 'Switching Costs', 'Jobs to Be Done', 'Pricing Power', 'Distribution Leverage', 'Unit Economics']],
  ['Tier 3: Psychology & Persuasion', ['Loss Aversion', 'Anchoring', 'Social Proof', 'Scarcity', 'Commitment Bias', 'Framing', 'Reciprocity']],
  ['Tier 4: Systems Thinking', ['Theory of Constraints', 'Bottleneck Analysis', 'Stock & Flow', 'Emergence', 'Path Dependence', 'Leverage Points']],
  ['Tier 5: Strategy & Competition', ['Game Theory', 'Blue Ocean', 'Barbell Strategy', 'Power Laws', 'Optionality', 'Antifragility', 'Moat Design']],
  ['Tier 6: Decision-Making', ['Expected Value', 'Bayesian Updating', 'Regret Minimization', 'Two-way vs One-way Doors', 'Pre-Mortem', 'Reversal Test']],
  ['Tier 7: Learning & Cognition', ['Deliberate Practice', 'Spaced Repetition', 'Interleaving', 'Chunking', 'Teach Back']],
  ['Tier 8: Team & Organization', ['Incentive Design', 'Principal-Agent', 'Ownership Mindset', 'Psychological Safety', 'Decision Velocity']]
].flatMap(([tier, names]) =>
  names.map((name) => ({
    id: uid('model'),
    tier,
    name,
    definition: `${name} model: concise decision lens to improve founder judgment and speed.`,
    whenToUse: 'Use when uncertainty is high and tradeoffs are non-obvious.',
    related: [],
    personalNotes: '',
    mastery: 1,
    usageCount: 0
  }))
);

const AGENTS = [
  {
    id: 'interview-analyzer',
    name: 'Interview Analyzer Agent',
    icon: '🎙️',
    description: 'Extracts pains, willingness-to-pay, feature demands, and validation signals from interviews.',
    outputTemplate: 'Pain points (ranked)\nWTP indicators\nFeature priorities\nRed flags\nSuggested follow-up questions'
  },
  {
    id: 'competitive-intel',
    name: 'Competitive Intelligence Agent',
    icon: '🕵️',
    description: 'Builds competitor matrix with pricing, positioning, and strategic opportunities.',
    outputTemplate: 'Competitor matrix\nStrengths/weaknesses\nPositioning wedges\nRecommended strategy'
  },
  {
    id: 'content-agent',
    name: 'Content Creation Agent',
    icon: '✍️',
    description: 'Generates content calendars and repurposed assets for multiple channels.',
    outputTemplate: '30-day calendar\nLinkedIn draft\nEmail draft\nThread draft\nRepurposing map'
  },
  {
    id: 'fundraising-agent',
    name: 'Fundraising Prep Agent',
    icon: '💼',
    description: 'Prepares investor lists, pitch critiques, and tough Q&A.',
    outputTemplate: 'Top target VCs\nPitch weaknesses\nDue diligence prep\nQ&A bank'
  },
  {
    id: 'product-agent',
    name: 'Product Development Agent',
    icon: '🧩',
    description: 'Converts ideas into PRDs, stories, architecture, and prioritization.',
    outputTemplate: 'PRD\nUser stories\nTech design\nRICE priorities\nTest script'
  },
  {
    id: 'hiring-agent',
    name: 'Hiring Assistant Agent',
    icon: '🧑‍💼',
    description: 'Builds job specs, interview scorecards, and onboarding plans.',
    outputTemplate: 'JD\nQuestion bank\nScorecard\n90-day onboarding plan'
  },
  {
    id: 'growth-agent',
    name: 'Growth Experiment Agent',
    icon: '📈',
    description: 'Designs experiments and recommends next actions from outcomes.',
    outputTemplate: '20 experiments\nPrioritization\nMeasurement plan\nNext bets'
  },
  {
    id: 'strategy-agent',
    name: 'Strategic Planning Agent',
    icon: '♟️',
    description: 'Generates options, scenarios, and strategic plans with tradeoffs.',
    outputTemplate: 'Scenario plan\nSWOT\nStrategic options\nOKRs'
  }
];

const PROMPT_CATEGORIES = [
  'Customer discovery',
  'Market research',
  'Product development',
  'Sales and marketing',
  'Fundraising',
  'Hiring and team',
  'Strategy and planning',
  'Learning and development'
];

function buildPromptLibrary() {
  const prompts = [];
  PROMPT_CATEGORIES.forEach((category) => {
    for (let i = 1; i <= 14; i += 1) {
      prompts.push({
        id: uid('prompt'),
        category,
        title: `${category} Prompt ${i}`,
        useCase: `Use this for ${category.toLowerCase()} analysis and execution speed.`,
        template: `You are a senior operator. For ${category.toLowerCase()}, generate a clear plan with assumptions, risks, and next actions. Include a checklist and KPI targets.`,
        exampleOutput: 'Structured summary with recommendations and action list',
        tips: 'Provide context, constraints, and success criteria for best output.'
      });
    }
  });
  return prompts.slice(0, 100);
}

function defaultSnapshots() {
  const today = dateISO();
  return [
    { id: uid('snapshot'), date: dateISO(addDays(new Date(), -28)), mrr: 2000, arr: 24000, customers: 18, wau: 120, retention: 52, momGrowth: 12, runway: 15, conversations: 20, burnRate: 15000, churn: 7, nrr: 96, cac: 650, ltv: 3600, payback: 6.5, grossMargin: 82, magicNumber: 0.8, northStar: 95, newCustomers: 6 },
    { id: uid('snapshot'), date: dateISO(addDays(new Date(), -14)), mrr: 2600, arr: 31200, customers: 24, wau: 168, retention: 58, momGrowth: 16, runway: 14, conversations: 23, burnRate: 16000, churn: 6, nrr: 101, cac: 710, ltv: 4200, payback: 6, grossMargin: 83, magicNumber: 0.9, northStar: 122, newCustomers: 8 },
    { id: uid('snapshot'), date: today, mrr: 3200, arr: 38400, customers: 31, wau: 232, retention: 64, momGrowth: 22, runway: 13, conversations: 27, burnRate: 16500, churn: 5.2, nrr: 107, cac: 730, ltv: 5100, payback: 5.4, grossMargin: 84, magicNumber: 1.1, northStar: 181, newCustomers: 10 }
  ];
}

function defaultTimeAudit() {
  return [
    { id: uid('audit'), weekStart: weekStartISO(), strategic: 38, execution: 33, management: 19, waste: 6, learning: 12 }
  ];
}

export function createDefaultState() {
  const startDate = dateISO(addDays(new Date(), -42));
  const roadmap = Array.from({ length: 12 }, (_, i) => buildRoadmapMonth(i));

  return {
    version: 2,
    currentMonth: 1,
    profile: {
      founderName: 'Founder',
      companyName: 'NewCo',
      stage: 'Pre-seed',
      startDate,
      targetSeriesADate: dateISO(addDays(new Date(startDate), 365)),
      industry: 'B2B SaaS',
      businessModel: 'Subscription',
      hourlyRate: 150,
      aiApiKeyEncrypted: '',
      aiApiKeyHint: ''
    },
    settings: {
      darkMode: false,
      colorScheme: 'blue',
      externalIntegrationsEnabled: false,
      keyboardShortcutsEnabled: true,
      notifications: {
        dailyReflection: true,
        weeklyReview: true,
        monthlySynthesis: true,
        metricReminder: true,
        followUpReminder: true,
        burnRateWarning: true
      },
      integrations: {
        googleCalendar: false,
        stripe: false,
        mixpanel: false,
        gmail: false,
        crm: false
      }
    },
    dashboard: {
      weeklyGoals: [
        { id: uid('goal'), text: 'Run 15 customer calls this week', done: false },
        { id: uid('goal'), text: 'Ship onboarding v2 and improve activation by 10%', done: false },
        { id: uid('goal'), text: 'Close 3 design partners', done: false }
      ],
      priorities: [
        { id: uid('priority'), text: 'Finalize PMF survey and send to top users', done: false },
        { id: uid('priority'), text: 'Update investor pipeline notes', done: false },
        { id: uid('priority'), text: 'Write weekly operating memo', done: false }
      ],
      deadlines: next30DaysMilestones(),
      quickActions: ['Log metric', 'Add task', 'Record learning', 'Make decision'],
      operatingRhythm: [
        { id: uid('rhythm'), day: 'Monday', focus: 'Planning', target: 'Set top 3 goals and milestones', log: '', done: false },
        { id: uid('rhythm'), day: 'Tuesday', focus: 'Sales', target: 'Log calls and objections', log: '', done: false },
        { id: uid('rhythm'), day: 'Wednesday', focus: 'Product', target: 'Ship one product improvement', log: '', done: false },
        { id: uid('rhythm'), day: 'Thursday', focus: 'Growth', target: 'Run one experiment', log: '', done: false },
        { id: uid('rhythm'), day: 'Friday', focus: 'Review', target: 'Write reflection and next week plan', log: '', done: false }
      ]
    },
    roadmap: {
      months: roadmap
    },
    metrics: {
      snapshots: defaultSnapshots(),
      expenses: [
        { id: uid('expense'), month: monthISO(), category: 'Founder salary', amount: 6000 },
        { id: uid('expense'), month: monthISO(), category: 'Software/tools', amount: 900 },
        { id: uid('expense'), month: monthISO(), category: 'Marketing/ads', amount: 2200 },
        { id: uid('expense'), month: monthISO(), category: 'Legal/accounting', amount: 700 },
        { id: uid('expense'), month: monthISO(), category: 'Team salaries', amount: 6700 }
      ],
      cohorts: [
        { id: uid('cohort'), month: '2025-11', users: 45, d1: 61, d7: 47, d30: 34, revenueRetention: 88 },
        { id: uid('cohort'), month: '2025-12', users: 52, d1: 63, d7: 49, d30: 36, revenueRetention: 93 },
        { id: uid('cohort'), month: '2026-01', users: 60, d1: 66, d7: 53, d30: 40, revenueRetention: 98 }
      ],
      unitEconomicsInputs: {
        arpu: 180,
        avgLifetimeMonths: 24,
        grossMarginPct: 84,
        marketingSpend: 3200,
        salesCost: 2600,
        newCustomers: 10
      },
      scenario: {
        baseGrowth: 12,
        upsideGrowth: 20,
        downsideGrowth: 6
      }
    },
    knowledge: {
      dailyJournal: [
        {
          id: uid('journal'),
          date: dateISO(),
          worked: 'Founder-led sales calls produced clear objections',
          didntWork: 'Landing page copy was too broad',
          insight: 'Narrow positioning lifted call conversion',
          tomorrowPriorities: ['Refine ICP messaging', 'Follow up warm leads', 'Review week metrics']
        }
      ],
      weeklyReviews: [],
      mentalModels: MENTAL_MODELS,
      playbooks: {
        sales: 'Sales script, objection handling, and call scorecard.',
        growth: 'Experiment design template + channel playbook.',
        product: 'PRD template + prioritization framework.',
        fundraising: 'Deck outline + investor Q&A playbook.',
        hiring: 'Role scorecard + interview loop plan.'
      },
      interviews: [
        { id: uid('interview'), date: dateISO(addDays(new Date(), -4)), customer: 'Apex Logistics', problemIntensity: 8, willingnessToPay: 'yes', keyQuotes: '“This saves our ops team 6 hours weekly.”', painPoints: 'Manual workflow, no visibility', currentSolutions: 'Spreadsheets + Slack', featureRequests: 'Automated alerts', followUp: 'Share pilot proposal' }
      ],
      ideaInbox: [{ id: uid('idea'), text: 'Usage-based pricing for power users', tags: ['pricing', 'expansion'], createdAt: nowISO(), processed: false }],
      infoDiet: {
        consumption: [
          { id: uid('consumption'), weekStart: weekStartISO(), tier1Hours: 6, tier2Items: 8, tier3Items: 2, tier4Violations: 1, source: 'Customer calls', valueScore: 9 }
        ],
        sources: [
          { id: uid('source'), name: 'Direct customer interviews', type: 'Tier 1', quality: 10 },
          { id: uid('source'), name: 'YC Library', type: 'Tier 2', quality: 8 },
          { id: uid('source'), name: 'First Round Review', type: 'Tier 2', quality: 8 }
        ],
        newsFastStreak: 14,
        socialMinutesLimit: 10,
        violations: []
      }
    },
    learning: {
      booksGoal: 100,
      books: [
        {
          id: uid('book'),
          title: 'The Mom Test',
          author: 'Rob Fitzpatrick',
          category: 'Customer Discovery',
          status: 'Complete',
          startDate: dateISO(addDays(new Date(), -20)),
          finishDate: dateISO(addDays(new Date(), -12)),
          timeInvested: 3,
          pass1: true,
          pass2: true,
          pass3: true,
          takeaways: ['Ask about past behavior', 'Avoid pitching in interviews'],
          actionItems: ['Update interview script'],
          rating: 5,
          modelsLearned: ['Jobs to Be Done']
        }
      ],
      courses: [{ id: uid('course'), title: 'B2B Sales Fundamentals', completed: true, hours: 6 }],
      mentalModelsMastered: [],
      domainExpertise: 4,
      learningHoursLogs: [{ id: uid('learning_hours'), weekStart: weekStartISO(), hours: 7 }],
      skills: {
        technical: [
          { id: uid('skill'), name: 'SQL', proficiency: 5, practiceHours: 18, projects: 2 },
          { id: uid('skill'), name: 'Git', proficiency: 6, practiceHours: 14, projects: 4 }
        ],
        business: [
          { id: uid('skill'), name: 'Founder-led Sales', proficiency: 6, practiceHours: 42, projects: 8 },
          { id: uid('skill'), name: 'Performance Marketing', proficiency: 4, practiceHours: 20, projects: 3 }
        ],
        leadership: [
          { id: uid('skill'), name: 'Decision Communication', proficiency: 5, practiceHours: 16, projects: 4 }
        ]
      },
      path: [
        { id: uid('path'), label: 'Month 1: Foundation Layer', progress: 65 },
        { id: uid('path'), label: 'Month 2-3: Execution Layer', progress: 35 },
        { id: uid('path'), label: 'Month 4-6: Scaling Layer', progress: 10 },
        { id: uid('path'), label: 'Month 7-9: Fundraising Layer', progress: 0 },
        { id: uid('path'), label: 'Month 10-12: Leadership Layer', progress: 0 }
      ],
      domainTracker: {
        week: 7,
        tasks: ['Publish one operator insight post', 'Meet one industry expert', 'Build one micro-tool in domain'],
        expertConnections: 6,
        contentPublished: 9,
        practiceProjects: 4
      }
    },
    decisions: {
      items: [
        {
          id: uid('decision'),
          date: dateISO(addDays(new Date(), -10)),
          statement: 'Focus on logistics ICP before expansion',
          context: 'Early signals from interviews showed strongest urgency in logistics ops teams.',
          options: ['Broad horizontal SMB', 'Logistics vertical ICP', 'Enterprise-only wedge'],
          criteria: 'Fast sales cycle, high pain intensity, budget access',
          chosen: 'Logistics vertical ICP',
          reasoning: 'Highest pain and willingness to pay with clear distribution path.',
          expectedOutcomes: 'Faster PMF signals and better retention baseline.',
          mentalModels: ['First Principles', 'Jobs to Be Done', 'Expected Value'],
          reversibility: 'Two-way',
          monitoringPlan: 'Track conversion, retention, and NPS for logistics segment.',
          reviewDate: dateISO(addDays(new Date(), 20)),
          reversalCriteria: 'If activation <20% for 6 weeks, re-evaluate wedge',
          tags: ['ICP', 'strategy'],
          qualityScore: 0,
          reviewStatus: 'pending'
        }
      ],
      premortems: []
    },
    ai: {
      agents: AGENTS,
      prompts: buildPromptLibrary(),
      customPrompts: [],
      agentRuns: [],
      hoursSavedLogs: [
        { id: uid('ai_hours'), date: dateISO(), task: 'Interview summary', withoutAi: 2.5, withAi: 0.8, quality: 4 }
      ]
    },
    productivity: {
      timeAudit: defaultTimeAudit(),
      elimination: [{ id: uid('eliminate'), item: 'Daily status meetings', savedHours: 3, date: dateISO(addDays(new Date(), -14)) }],
      batchingSchedule: [
        { day: 'Monday', focus: 'Planning & Strategy', adherence: 80 },
        { day: 'Tuesday', focus: 'Sales & Customer', adherence: 72 },
        { day: 'Wednesday', focus: 'Product & Development', adherence: 68 },
        { day: 'Thursday', focus: 'Growth & Marketing', adherence: 74 },
        { day: 'Friday', focus: 'Team & Learning', adherence: 78 }
      ],
      delegation: [{ id: uid('delegate'), task: 'Lead enrichment', delegatedTo: 'VA', date: dateISO(addDays(new Date(), -9)), status: 'Active', savedHours: 2.5 }],
      focusSessions: [{ id: uid('focus'), date: dateISO(), pomodoros: 6, deepWorkMins: 190, distractions: 3 }]
    },
    network: {
      customers: [],
      investors: [
        { id: uid('investor'), firm: 'Northstar Ventures', partner: 'Alex Chen', stage: 'warm intro', focus: 'B2B SaaS', fundSize: '$500M', status: 'warm', nextStep: 'Share monthly update', lastContact: dateISO(addDays(new Date(), -8)) }
      ],
      advisors: [],
      partners: [],
      team: [],
      warmIntros: []
    },
    fundraising: {
      target: 2000000,
      raised: 250000,
      runwayBefore: 13,
      runwayAfter: 24,
      pipeline: [
        { id: uid('pipeline'), firm: 'Northstar Ventures', partner: 'Alex Chen', stage: 'meeting', date: dateISO(addDays(new Date(), 6)), concern: 'Retention depth', likelihood: 'warm', notes: 'Asked for cohort retention and expansion metrics.' }
      ],
      dataRoom: [
        { id: uid('dataroom'), label: 'Financials', status: 'in_progress' },
        { id: uid('dataroom'), label: 'Cap table', status: 'complete' },
        { id: uid('dataroom'), label: 'Legal docs', status: 'not_started' },
        { id: uid('dataroom'), label: 'Customer data', status: 'in_progress' },
        { id: uid('dataroom'), label: 'Product docs', status: 'complete' },
        { id: uid('dataroom'), label: 'Team docs', status: 'not_started' }
      ],
      pitchDeck: {
        version: 'v12',
        lastUpdated: dateISO(addDays(new Date(), -2)),
        practiceCount: 18,
        feedback: ['Clarify market expansion narrative', 'Strengthen competition slide'],
        slides: [
          { id: uid('slide'), name: 'Problem', status: 'complete' },
          { id: uid('slide'), name: 'Solution', status: 'complete' },
          { id: uid('slide'), name: 'Traction', status: 'in_progress' },
          { id: uid('slide'), name: 'Financials', status: 'in_progress' }
        ]
      },
      termSheets: []
    },
    financialModel: {
      budget: [
        { id: uid('budget'), month: monthISO(), category: 'Founder salary', budgeted: 6000, actual: 6000 },
        { id: uid('budget'), month: monthISO(), category: 'Marketing/ads', budgeted: 2500, actual: 2200 }
      ],
      projections: {
        revenue: [3200, 4500, 6100, 8200, 10900, 14200],
        cogs: [500, 700, 820, 1000, 1300, 1650],
        sm: [3200, 3600, 4100, 4600, 5100, 5600],
        rd: [4800, 5100, 5400, 5700, 6100, 6500],
        ga: [2000, 2100, 2200, 2400, 2500, 2600]
      },
      scenarios: [
        { id: uid('scenario'), name: 'Base', growth: 12, burn: 16500 },
        { id: uid('scenario'), name: 'Upside', growth: 20, burn: 18500 },
        { id: uid('scenario'), name: 'Downside', growth: 6, burn: 14000 }
      ]
    },
    reports: {
      weekly: [],
      monthly: [],
      investorUpdates: [],
      launchChecklist: [
        { id: uid('check'), label: 'All core features functional', done: false },
        { id: uid('check'), label: 'Mobile responsive', done: false },
        { id: uid('check'), label: 'Data persistence working', done: false },
        { id: uid('check'), label: 'Export/import working', done: false },
        { id: uid('check'), label: 'No console errors', done: false },
        { id: uid('check'), label: 'Fast performance', done: false },
        { id: uid('check'), label: 'Beautiful UI', done: false },
        { id: uid('check'), label: 'Helpful onboarding', done: false },
        { id: uid('check'), label: 'Documentation/help section', done: false },
        { id: uid('check'), label: 'Demo mode with sample data', done: false }
      ]
    },
    ui: {
      toast: null,
      modal: null,
      demoMode: true
    }
  };
}

export function ensureStateShape(incoming) {
  if (!incoming || typeof incoming !== 'object') return createDefaultState();
  return {
    ...createDefaultState(),
    ...incoming,
    profile: { ...createDefaultState().profile, ...(incoming.profile || {}) },
    settings: { ...createDefaultState().settings, ...(incoming.settings || {}) },
    dashboard: { ...createDefaultState().dashboard, ...(incoming.dashboard || {}) },
    roadmap: { ...createDefaultState().roadmap, ...(incoming.roadmap || {}) },
    metrics: { ...createDefaultState().metrics, ...(incoming.metrics || {}) },
    knowledge: { ...createDefaultState().knowledge, ...(incoming.knowledge || {}) },
    learning: { ...createDefaultState().learning, ...(incoming.learning || {}) },
    decisions: { ...createDefaultState().decisions, ...(incoming.decisions || {}) },
    ai: { ...createDefaultState().ai, ...(incoming.ai || {}) },
    productivity: { ...createDefaultState().productivity, ...(incoming.productivity || {}) },
    network: { ...createDefaultState().network, ...(incoming.network || {}) },
    fundraising: { ...createDefaultState().fundraising, ...(incoming.fundraising || {}) },
    financialModel: { ...createDefaultState().financialModel, ...(incoming.financialModel || {}) },
    reports: { ...createDefaultState().reports, ...(incoming.reports || {}) },
    ui: { ...createDefaultState().ui, ...(incoming.ui || {}) }
  };
}
