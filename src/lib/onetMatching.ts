import type { UserProfile, WhatIfState } from '../types/career';
import type { OnetCareer } from '../context/CareerContext';

export interface OnetMatchResult {
  score: number;
  confidence: 'limited' | 'moderate' | 'strong';
  reasons: string[];
  considerations: string[];
  skillsToDevelop: string[];
  occupationalAlignment?: number;
  matchedInterests?: string[];
  coreInterestMatches?: string[];
  dutyInterestScores?: Record<string, number>;
  goalAlignment?: number | null;
  breakdown: {
    interests: number | null;
    skills: number | null;
    preferences: number | null;
    goals: number | null;
  };
}

type MatchCategory = keyof OnetMatchResult['breakdown'];
type Preferences = UserProfile['preferences'];

const CATEGORY_WEIGHTS: Record<MatchCategory, number> = {
  interests: 30,
  skills: 30,
  preferences: 30,
  goals: 10,
};

const INTEREST_TERMS: Record<string, string[]> = {
  "Technology": [
    "software development",
    "develop software",
    "programming",
    "computer systems",
    "information technology",
    "digital systems",
    "cybersecurity",
    "network administration",
    "database design",
    "debug software",
    "systems integration",
    "technical support",
    "install software",
    "computer network",
    "software engineer"
  ],
  "Business": [
    "business administration",
    "business strategy",
    "marketing",
    "sales strategy",
    "sell products",
    "sales representatives",
    "finance",
    "accounting",
    "human resources",
    "market research",
    "procurement",
    "supply chain",
    "management analysis",
    "budgeting",
    "business development",
    "project management",
    "business operations",
    "organizational strategy",
    "market demand",
    "consumer research",
    "marketing policies",
    "financial planning",
    "inventory management"
  ],
  "Helping People": [
    "counsel",
    "psychotherapy",
    "mental health treatment",
    "treat mental",
    "patient care",
    "care for patients",
    "treat patients",
    "assist patients",
    "provide care",
    "community outreach",
    "social service",
    "rehabilitation",
    "support individuals",
    "advocacy",
    "social work",
    "emotional support",
    "behavioral health",
    "assess client needs",
    "help people",
    "crisis intervention",
    "teach students",
    "disability support",
    "protect people",
    "rescue people",
    "assist clients",
    "develop treatment plans",
    "therapist"
  ],
  "Creativity": [
    "artistic",
    "creative",
    "advertising",
    "visual design",
    "graphic design",
    "originality",
    "promotional campaigns",
    "creative concepts",
    "brand strategy",
    "content creation",
    "create artwork",
    "illustration",
    "design layouts",
    "fashion design",
    "interior design",
    "compose music",
    "perform music",
    "choreograph",
    "write stories",
    "photography",
    "sculpt",
    "design products",
    "develop concepts"
  ],
  "Environment": [
    "environmental protection",
    "environmental science",
    "environmental engineer",
    "environmental restoration",
    "environmental impact",
    "ecology",
    "conservation",
    "sustainability",
    "natural resources",
    "ecosystem",
    "wildlife habitat",
    "pollution",
    "soil conservation",
    "restore ecosystems",
    "wildlife",
    "natural environment",
    "water quality",
    "renewable energy",
    "waste reduction",
    "forest management",
    "climate change"
  ],
  "Problem Solving": [
    "problem solving",
    "troubleshooting",
    "critical thinking",
    "diagnos",
    "problem resolution",
    "evaluate alternatives",
    "identify problems",
    "decision making",
    "investigate causes",
    "resolve problems",
    "repair equipment",
    "analyze failures",
    "develop solutions"
  ],
  "Leadership": [
    "manage staff",
    "manage personnel",
    "manage employees",
    "supervise staff",
    "supervise workers",
    "supervise employees",
    "leadership",
    "direct operations",
    "coordinate teams",
    "project management",
    "lead teams",
    "staff development",
    "direct personnel",
    "train staff",
    "management of personnel",
    "supervisor",
    "allocate resources"
  ],
  "Working with Data": [
    "data analysis",
    "statistics",
    "analytics",
    "quantitative analysis",
    "statistical analysis",
    "analyze data",
    "interpret data",
    "statistical modeling",
    "survey data",
    "analyze trends",
    "data visualization",
    "analyze results",
    "data scientist",
    "statistician",
    "forecast demand",
    "evaluate data",
    "collect research data"
  ],
  "Communication": [
    "public speaking",
    "writing",
    "presentation",
    "interpersonal communication",
    "negotiation",
    "interview",
    "active listening",
    "public relations",
    "oral expression",
    "explain information",
    "advise clients",
    "train employees",
    "present findings",
    "marketing communications",
    "promotional campaigns",
    "media relations",
    "teach students",
    "interpret languages",
    "communicate findings",
    "write articles"
  ],
  "Working with Children": [
    "teach children",
    "teach students",
    "child development",
    "early childhood",
    "elementary school",
    "care for children",
    "child care",
    "childcare",
    "preschool",
    "pediatric care",
    "counsel children",
    "supervise children",
    "support children",
    "youth development",
    "child welfare",
    "kindergarten"
  ],
  "Healthcare": [
    "patient care",
    "care for patients",
    "treat patients",
    "examine patients",
    "diagnose disease",
    "diagnose illness",
    "clinical assessment",
    "clinical treatment",
    "medical treatment",
    "surgery",
    "nursing",
    "nurse",
    "administer medication",
    "medical imaging",
    "rehabilitation",
    "physical therapy",
    "occupational therapy",
    "medical laboratory",
    "clinical laboratory",
    "prevent disease",
    "health promotion",
    "dental care",
    "monitor patients",
    "physician",
    "paramedic",
    "mental health treatment",
    "treat mental"
  ],
  "Entrepreneurship": [
    "business development",
    "entrepreneur",
    "startup",
    "business strategy",
    "market opportunities",
    "new products",
    "product development",
    "business plans",
    "market research",
    "commercialization",
    "launch products",
    "develop business models",
    "identify market opportunities",
    "venture capital",
    "new business",
    "business ownership"
  ]
};

const SKILL_TERMS: Record<string, string[]> = {
  Communication: [
    'speaking', 'writing', 'active listening',
    'negotiation', 'interpersonal communication',
  ],
  Leadership: [
    'management of personnel', 'leadership',
    'supervis', 'direct teams',
  ],
  Organization: [
    'time management', 'coordination',
    'planning', 'organizing',
  ],
  'Problem Solving': [
    'complex problem solving',
    'critical thinking', 'troubleshooting',
    'decision making', 'problem resolution',
  ],
  Research: [
    'research', 'information gathering',
    'investigation', 'collect data', 'review literature',
    'evaluate evidence', 'scientific inquiry',
  ],
  Creativity: [
    'artistic design', 'visual design', 'graphic design', 'originality', 'creative thinking',
    'creative concepts', 'content creation', 'develop concepts', 'design products',
  ],
  Teamwork: [
    'coordination', 'collaboration',
    'working with others', 'work as a team',
    'teamwork', 'collaborate',
  ],
  'Analytical Thinking': [
    'analysis', 'mathematics',
    'analytical thinking', 'reasoning',
  ],
};

const GOAL_TERMS: Record<string, string[]> = {
  Leadership: [
    'supervise staff', 'supervise employees', 'manage staff',
    'manage personnel', 'lead teams', 'leadership', 'direct operations',
    'coordinate teams', 'staff development', 'management of personnel',
  ],
  'Helping others': [
    ...INTEREST_TERMS['Helping People'],
  ],
  Creativity: [
    'creative', 'artistic', 'originality', 'design concepts',
    'visual design', 'graphic design', 'develop concepts',
    'content creation', 'promotional campaigns', 'create artwork',
    'design products', 'design layouts', 'brand strategy',
  ],
  'Making an impact': [
    'community outreach', 'conservation', 'environmental protection',
    'public health', 'social service', 'public safety', 'pollution prevention',
    'mental health', 'psychological well-being', 'psychological wellbeing',
    'emotional well-being', 'quality of life', 'behavioral health',
    'treat mental', 'psychotherapy', 'rehabilitation', 'prevent disease',
    'improve health', 'improve patient outcomes', 'health promotion',
    'community development', 'educational outcomes', 'student achievement',
    'protect natural resources', 'reduce pollution', 'restore ecosystems',
    'improve access', 'disability support', 'social work',
  ],
};

// Goals describe the purpose of work. Prioritize documented duties,
// not generic skill or knowledge mentions. This is a heuristic,
// not a measurement of actual social impact or employer outcomes.
function goalEvidence(sections: Sections, terms: readonly string[]) {
  const description = matchingTerms(sections.description, terms);
  const tasks = matchingTerms(sections.tasks, terms);
  const coverage = (hits: string[]) =>
    hits.length === 0 ? 0 : hits.length === 1 ? 0.7 : hits.length === 2 ? 0.9 : 1;
  const available = (sections.description ? 45 : 0) + (sections.tasks ? 55 : 0);
  return {
    score: Math.round((45 * coverage(description) + 55 * coverage(tasks)) / Math.max(75, available) * 100),
    evidence: [...new Set([...description, ...tasks])],
  };
}

// Preference evidence comes from O*NET occupation content.
// These terms are exploratory indicators, not validated
// measurements of workplace conditions.
const PREFERENCE_EVIDENCE = {
  peopleVsTask: {
    low: [
      'counsel', 'patient', 'customer', 'client',
      'teach', 'student', 'social service',
      'assist people', 'provide care',
    ],
    high: [
      'data analysis', 'programming',
      'troubleshooting', 'technical systems',
      'equipment maintenance', 'mathematics',
      'statistical analysis', 'database',
    ],
    label: 'Daily focus',
  },
  creativeVsAnalytical: {
    low: [
      'visual design', 'artistic', 'originality',
      'creative thinking', 'visual arts',
      'develop concepts', 'creative',
    ],
    high: [
      'data analysis', 'mathematics',
      'statistics', 'critical thinking',
      'analytical', 'quantitative',
      'scientific research',
    ],
    label: 'Thinking style',
  },
} as const;

type SupportedPreference = keyof typeof PREFERENCE_EVIDENCE;

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

function isNeutralPreference(value: number): boolean {
  return value >= 40 && value <= 60;
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/\s+/g, ' ').trim();
}

function matchesTerm(text: string, term: string): boolean {
  const escaped = term
    .toLowerCase()
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  return new RegExp(`\\b${escaped}\\w*\\b`, 'i').test(text);
}

function matchingTerms(
  text: string,
  terms: readonly string[]
): string[] {
  return terms.filter((term) => matchesTerm(text, term));
}

function getOccupationSections(career: OnetCareer) {
  const title = normalize(career.title ?? '');
  const description = normalize(career.description ?? '');

  const tasks = normalize(
    (career.tasks?.task ?? [])
      .map((task) => task.title)
      .join(' ')
  );

  const skills = normalize(
    (career.skills?.element ?? [])
      .map((skill) => skill.name)
      .join(' ')
  );

  const knowledge = normalize(
    (career.knowledge?.element ?? [])
      .map((item) => item.name)
      .join(' ')
  );

  const taskItems = (career.tasks?.task ?? []).map(task => normalize(task.title ?? '')).filter(Boolean);
  return { title, description, tasks, taskItems, skills, knowledge };
}

type Sections = ReturnType<typeof getOccupationSections>;

function evidenceStrength(
  sections: Sections,
  terms: readonly string[]
): { score: number; evidence: string[] } {
  const descriptionMatches = matchingTerms(
    sections.description, terms
  );

  const taskMatches = matchingTerms(sections.tasks, terms);
  const skillMatches = matchingTerms(sections.skills, terms);
  const knowledgeMatches = matchingTerms(
    sections.knowledge, terms
  );

  // Multiple distinct duty signals are stronger
  // than isolated mentions.
  const coverage = (hits: string[]) =>
    hits.length === 0
      ? 0
      : hits.length === 1
        ? 0.65
        : hits.length === 2
          ? 0.85
          : 1;

  const earned =
    45 * coverage(descriptionMatches) +
    35 * coverage(taskMatches) +
    15 * coverage(skillMatches) +
    5 * coverage(knowledgeMatches);

  const available =
    (sections.description ? 45 : 0) +
    (sections.tasks ? 35 : 0) +
    (sections.skills ? 15 : 0) +
    (sections.knowledge ? 5 : 0);

  // Do not penalize missing minor sources;
  // avoid amplifying sparse records.
  const score = Math.round(
    earned / Math.max(80, available) * 100
  );

  return {
    score,
    evidence: [
      ...new Set([
        ...descriptionMatches,
        ...taskMatches,
        ...skillMatches,
        ...knowledgeMatches,
      ]),
    ],
  };
}

// Direct occupational evidence is intentionally
// distinct from transferable skills.
function interestEvidence(
  sections: Sections,
  terms: readonly string[]
) {
  const title = matchingTerms(sections.title, terms);
  const description = matchingTerms(sections.description, terms);
  const tasks = matchingTerms(sections.tasks, terms);
  const knowledge = matchingTerms(sections.knowledge, terms);

  const coverage = (hits: string[]) => hits.length === 0 ? 0 : hits.length === 1 ? 0.7 : 1;
  const matchingTasks = sections.taskItems.filter(task => matchingTerms(task, terms).length > 0).length;
  const taskCoverage = sections.taskItems.length
    ? Math.min(1, matchingTasks / Math.max(2, sections.taskItems.length * 0.30))
    : 0;
  const primary = 20 * coverage(title) + 40 * coverage(description) + 30 * taskCoverage;
  // Knowledge supports direct work evidence, but cannot create it.
  const score = clamp(Math.round(primary + (primary > 0 ? 10 * coverage(knowledge) : 0)));

  return {
    score,
    evidence: [
      ...new Set([
        ...description,
        ...tasks,
        ...title,
        ...knowledge,
      ]),
    ],
  };
}

// Explicit crosswalk to O*NET skill names;
// not a professional qualification test.
const DIRECT_SKILLS: Record<string, string[]> = {
  Communication: [
    'active listening', 'speaking', 'writing',
    'reading comprehension', 'negotiation', 'persuasion',
  ],
  Leadership: [
    'management of personnel resources',
    'instructing', 'coordination',
  ],
  Organization: [
    'time management', 'coordination',
    'management of material resources',
  ],
  'Problem Solving': [
    'complex problem solving', 'critical thinking',
    'judgment and decision making', 'troubleshooting',
  ],
  Research: [
    'science', 'active learning', 'reading comprehension',
  ],
  Creativity: [
    // Technical design alone does not establish creative readiness.
  ],
  Teamwork: [
    'coordination', 'social perceptiveness', 'active listening',
  ],
  'Analytical Thinking': [
    'mathematics', 'critical thinking', 'systems analysis',
    'systems evaluation', 'judgment and decision making',
  ],
};

function readableEvidence(terms: string[]): string {
  const labels: Record<string, string> = {
    counsel: 'counseling',
    psycholog: 'psychology',
    diagnos: 'diagnostic work',
    supervis: 'supervision',
    manage: 'management',
    nurs: 'nursing',
    patient: 'patient-related work',
    teach: 'teaching',
    interview: 'interviewing',
    design: 'design work',
    creative: 'creative work',
    artistic: 'artistic work',
    environmental: 'environmental work',
    environment: 'environmental work',
    'natural environment': 'the natural environment',
    'environmental protection': 'protecting the environment',
    'environmental impact': 'environmental impact assessment',
    'statistics': 'statistical analysis',
    'statistician': 'statistical analysis',
    'advertising': 'advertising-related work',
    quantitative: 'quantitative analysis',
    'assist clients': 'client assistance',
    'marketing policies': 'marketing strategy',
    'treat mental': 'mental health treatment',
    'therapist': 'therapeutic support',
    'care for patients': 'patient care',
    'treat patients': 'patient treatment',
    'assist patients': 'patient assistance',
    'provide care': 'providing care',
    'support individuals': 'supporting individuals',
    'assess client needs': 'assessing client needs',
    'help people': 'helping people',
    'teach students': 'teaching students',
    'protect people': 'protecting people',
    'rescue people': 'rescue work',
    'develop treatment plans': 'treatment planning',
    'develop software': 'software development',
    'debug software': 'software debugging',
    'install software': 'software installation',
    'sell products': 'product sales',
    'manage staff': 'staff management',
    'manage personnel': 'personnel management',
    'manage employees': 'employee management',
    'supervise staff': 'staff supervision',
    'supervise workers': 'worker supervision',
    'supervise employees': 'employee supervision',
    'direct operations': 'directing operations',
    'coordinate teams': 'team coordination',
    'lead teams': 'team leadership',
    'train staff': 'staff training',
    'direct personnel': 'personnel supervision',
    'allocate resources': 'resource allocation',
    'evaluate alternatives': 'evaluating alternatives',
    'identify problems': 'identifying problems',
    'investigate causes': 'investigating causes',
    'resolve problems': 'resolving problems',
    'repair equipment': 'equipment repair',
    'analyze failures': 'failure analysis',
    'develop solutions': 'developing solutions',
    'analyze data': 'data analysis',
    'interpret data': 'data interpretation',
    'analyze trends': 'trend analysis',
    'analyze results': 'results analysis',
    'forecast demand': 'demand forecasting',
    'evaluate data': 'data evaluation',
    'collect research data': 'research data collection',
    'explain information': 'explaining information',
    'advise clients': 'advising clients',
    'train employees': 'employee training',
    'present findings': 'presenting findings',
    'interpret languages': 'language interpretation',
    'communicate findings': 'communicating findings',
    'write articles': 'article writing',
    'create artwork': 'artwork creation',
    'design layouts': 'layout design',
    'compose music': 'music composition',
    'perform music': 'musical performance',
    'choreograph': 'choreography',
    'write stories': 'story writing',
    'sculpt': 'sculpture',
    'design products': 'product design',
    'develop concepts': 'concept development',
    'restore ecosystems': 'ecosystem restoration',
    'teach children': 'teaching children',
    'care for children': 'child care',
    'counsel children': 'child counseling',
    'supervise children': 'child supervision',
    'support children': 'supporting children',
    'examine patients': 'patient examinations',
    'diagnose disease': 'disease diagnosis',
    'diagnose illness': 'illness diagnosis',
    'administer medication': 'medication administration',
    'prevent disease': 'disease prevention',
    'monitor patients': 'patient monitoring',
    'launch products': 'product launches',
    'develop business models': 'business model development',
    'identify market opportunities': 'identifying market opportunities',
    'collect data': 'data collection',
    'review literature': 'literature review',
    'evaluate evidence': 'evidence evaluation',
    'improve health': 'improving health',
    'improve patient outcomes': 'improving patient outcomes',
    'protect natural resources': 'natural resource protection',
    'reduce pollution': 'pollution reduction',
    'improve access': 'improving access',
    'nurse': 'nursing',
    'physician': 'physician duties',
    'paramedic': 'paramedic duties',
    'supervisor': 'supervision',
    'data scientist': 'data science',
    'software engineer': 'software engineering',
    'environmental engineer': 'environmental engineering',
    'entrepreneur': 'entrepreneurship',
    'direct teams': 'team leadership',
    'collaborate': 'collaboration',
    'work as a team': 'teamwork',
    'customer': 'customer interaction',
    'client': 'client interaction',
    'student': 'student interaction',
  };

  const unique = [
    ...new Set(
      terms.map(term => labels[term] ?? term)
    ),
  ];

  // Avoid combining overlapping phrases such as
  // marketing and marketing strategy.
  const distinct = unique.filter((term, index) =>
    !unique.some(
      (other, otherIndex) =>
        otherIndex !== index &&
        other.length > term.length &&
        other.includes(term)
    )
  );

  return (distinct.length ? distinct : unique)
    .slice(0, 2)
    .join(' and ');
}

// Presentation only: prefer documented duties when explaining a skill.
function describeSkillConnection(
  skillName: string,
  sections: Sections,
  terms: readonly string[],
  fallback: string[]
): string {
  const duties = matchingTerms(`${sections.description} ${sections.tasks}`, terms);
  const label = skillName.toLowerCase();
  const specific = duties.filter(term => normalize(term) !== label);
  if (specific.length) {
    return `Your self-rated strength in ${label} may help with duties involving ${readableEvidence(specific)}.`;
  }
  if (duties.length) {
    return `This occupation's documented duties involve ${readableEvidence(duties)}, an area you rated as a personal strength.`;
  }
  const distinct = fallback.filter(term => normalize(term) !== label);
  if (distinct.length) {
    return `Your self-rated strength in ${label} may be transferable to this occupation, which lists or references ${readableEvidence(distinct)}.`;
  }
  return `Available occupation information references ${label}, an area you rated as a personal strength.`;
}

function describeInterestConnection(interest: string, evidence: string[]): string {
  const label = interest === 'Environment' ? 'the environment' : interest.toLowerCase();
  if (interest === 'Creativity' && evidence.every(term => term === 'advertising')) {
    return 'This occupation involves advertising-related work, which may connect with your interest in creativity. Review the actual duties to see how much creative work is involved.';
  }
  return `Your interest in ${label} may connect with this occupation’s focus on ${readableEvidence(evidence)}.`;
}

function average(values: number[]): number | null {
  if (!values.length) return null;

  return values.reduce((sum, value) => sum + value, 0) /
    values.length;
}

function normalizeGoal(goal: string): string {
  const key = normalize(goal).replace(/[^a-z]/g, '');

  const aliases: Record<string, string> = {
    growth: 'Growth',
    growthadvancement: 'Growth',
    leadership: 'Leadership',
    helpingothers: 'Helping others',
    creativity: 'Creativity',
    creativeexpression: 'Creativity',
    makinganimpact: 'Making an impact',
    impact: 'Making an impact',
  };

  return aliases[key] ?? goal;
}

function calculatePreferenceMatch(
  sections: Sections,
  preferences: Preferences
): {
  score: number | null;
  scores: number[];
  reasons: string[];
} {
  const scores: number[] = [];
  const reasons: string[] = [];

  const keys: SupportedPreference[] = [
    'peopleVsTask',
    'creativeVsAnalytical',
  ];

  for (const key of keys) {
    const config = PREFERENCE_EVIDENCE[key];

    const low = evidenceStrength(sections, config.low);
    const high = evidenceStrength(sections, config.high);

    // No evidence means no score for this preference.
    if (low.score === 0 && high.score === 0) continue;

    // When both directions appear, use their relative
    // evidence strengths rather than choosing arbitrarily.
    const occupationPosition =
      (high.score / (low.score + high.score)) * 100;

    const rawPreference = Number(preferences[key] ?? 50);

    const userPosition = clamp(
      Number.isFinite(rawPreference) ? rawPreference : 50
    );

    if (isNeutralPreference(userPosition)) continue;

    // 100 means the preference and available evidence
    // align; 0 means they point in opposite directions.
    const fit = 100 - Math.abs(
      userPosition - occupationPosition
    );

    scores.push(clamp(fit));

    const evidence = [
      ...low.evidence.slice(0, 1),
      ...high.evidence.slice(0, 1),
    ];

    reasons.push(
      `${config.label}: your preference was compared with occupation references to ${readableEvidence(evidence)}.`
    );
  }

  return {
    score: average(scores),
    scores,
    reasons,
  };
}

type WorkContextResponse = {
  percentage_of_respondents?: number;
  description?: string;
};

type WorkContextElement = {
  id?: string;
  name?: string;
  response?: WorkContextResponse[];
};

function getWorkContextElements(
  career: OnetCareer
): WorkContextElement[] {
  const context = career.workContext;

  if (!context || typeof context !== 'object') {
    return [];
  }

  if (!('element' in context)) {
    return [];
  }

  const elements = context.element;

  return Array.isArray(elements)
    ? (elements as WorkContextElement[])
    : [];
}

// These positions are exploratory interpretations
// of O*NET response categories, not O*NET fit scores.
function responsePosition(
  description: string,
  category: 'teamwork' | 'freedom' | 'deadlines'
): number | null {
  const value = description.toLowerCase().trim();

  if (category === 'teamwork') {
    if (value.includes('not important')) return 0;
    if (value.includes('somewhat important')) return 35;
    if (value.includes('extremely important')) return 100;
    if (value.includes('very important')) return 80;
    if (value.includes('important')) return 60;
  }

  if (category === 'freedom') {
    if (value.includes('a lot of freedom')) return 100;
    if (value.includes('a lot')) return 90;
    if (value.includes('some freedom')) return 60;
    if (value.includes('moderate freedom')) return 60;
    if (value.includes('very little freedom')) return 15;
    if (value.includes('no freedom')) return 0;
  }

  if (category === 'deadlines') {
    if (value.includes('every day')) return 100;
    if (value.includes('once a week or more')) return 75;
    if (value.includes('once a month or more')) return 45;
    if (value.includes('once a year or more')) return 20;
    if (value.includes('never')) return 0;
  }

  return null;
}

// Exploratory location flexibility indicators from O*NET duties.
// These are NOT employer remote-work policies or verified job arrangements.
const ON_SITE_DUTY_PATTERNS: RegExp[] = [
  /\b(?:patient|patients|resident|residents|client|clients)\b.{0,65}\b(?:examin|treat|care|assist|monitor|transport|administer|physical)\w*/i,
  /\b(?:examin|treat|care for|assist|monitor|transport|administer)\w*\b.{0,65}\b(?:patient|patients|resident|residents)\b/i,
  /\b(?:surgery|surgical|clinical procedure|physical examination|dental procedure|laboratory specimen|blood samples?)\b/i,
  /\b(?:machinery|equipment|vehicles?|aircraft|engines?|tools?)\b.{0,60}\b(?:operat|repair|maintain|install|inspect|test|adjust|calibrat)\w*/i,
  /\b(?:operat|repair|maintain|install|inspect|test|adjust|calibrat)\w*\b.{0,60}\b(?:machinery|equipment|vehicles?|aircraft|engines?|tools?)\b/i,
  /\b(?:construction|job sites?|building sites?|factory|factories|warehouse|warehouses|production floor|field work|on.site|in.person)\b/i,
  /\b(?:farm|farms|crops?|livestock|animals?|forests?|wildlife|soil|water samples?|field samples?)\b.{0,65}\b(?:collect|inspect|monitor|feed|plant|harvest|maintain|survey|test)\w*/i,
  /\b(?:plant|harvest|feed|inspect|monitor|survey|collect)\w*\b.{0,65}\b(?:crops?|livestock|animals?|forests?|wildlife|soil|field samples?)\b/i,
  /\b(?:drive|driving|deliver|delivery|transport|patrol|respond to emergencies|emergency response|security patrol)\b/i,
  /\b(?:prepare|cook|serve|clean|sanitize|stock shelves|load|unload)\w*\b.{0,55}\b(?:food|meals?|beverages?|rooms?|facilities|merchandise|shipments?)\b/i,
  /\b(?:teach|instruct|supervise)\w*\b.{0,55}\b(?:classrooms?|students?|children|pupils)\b/i,
];

// Digital/desk-based duties may be more location-flexible,
// but they do not establish that a job is remote or hybrid.
const DIGITAL_DUTY_PATTERNS: RegExp[] = [
  /\b(?:analy[sz]|interpret|model|forecast|research|evaluate|review)\w*\b.{0,70}\b(?:data|information|reports?|financial|statistics|trends|markets?)\b/i,
  /\b(?:develop|design|write|maintain|test|debug|program)\w*\b.{0,70}\b(?:software|code|applications?|websites?|digital|databases?|systems?)\b/i,
  /\b(?:prepare|write|edit|draft|publish|create)\w*\b.{0,65}\b(?:reports?|documents?|content|plans?|proposals?|presentations?)\b/i,
  /\b(?:coordinate|communicate|consult|advise|plan|schedule)\w*\b.{0,65}\b(?:projects?|teams?|clients?|operations|activities|meetings?)\b/i,
];

function calculateWorkLocationPreference(
  sections: Sections,
  preferences: Preferences
): {
  score: number | null;
  reason: string | null;
} {
  const duties = `${sections.description} ${sections.tasks}`;

  const onsite = ON_SITE_DUTY_PATTERNS.filter(
    (pattern) => pattern.test(duties)
  ).length;

  const digital = DIGITAL_DUTY_PATTERNS.filter(
    (pattern) => pattern.test(duties)
  ).length;

  if (onsite === 0 && digital === 0) {
    return { score: null, reason: null };
  }

  const raw = Number(preferences.officeVsRemote ?? 50);

  const remotePreference = clamp(
    Number.isFinite(raw) ? raw : 50
  );

  if (isNeutralPreference(remotePreference)) {
    return { score: null, reason: null };
  }

  // If both kinds of duties appear, prefer caution:
  // physical presence may still be necessary.
  if (onsite > 0) {
    return {
      score: Math.round(100 - remotePreference * 0.7),
      reason: 'Work location: O*NET duties suggest some physical or on-site work. A stronger remote preference may reduce this exploratory fit estimate; actual arrangements vary by employer.',
    };
  }

  return {
    score: Math.round(55 + remotePreference * 0.35),
    reason: 'Work location: O*NET describes digital, analytical, or coordination duties that may offer location flexibility. This is only a weak indicator, not evidence that remote jobs are available.',
  };
}

function calculateWorkContextPreferences(
  career: OnetCareer,
  preferences: Preferences
): {
  scores: number[];
  reasons: string[];
} {
  const elements = getWorkContextElements(career);
  const scores: number[] = [];
  const reasons: string[] = [];

  const dimensions = [
    {
      id: '4.C.1.b.1.e',
      key: 'soloVsTeam',
      category: 'teamwork',
      label: 'Collaboration',
    },
    {
      id: '4.C.3.b.8',
      key: 'structuredVsFlexible',
      category: 'freedom',
      label: 'Work structure',
    },
    {
      id: '4.C.3.d.1',
      key: 'fastVsPredictable',
      category: 'deadlines',
      label: 'Work pace',
    },
  ] as const;

  for (const dimension of dimensions) {
    const element = elements.find(
      (item) => item.id === dimension.id
    );

    if (!element || !Array.isArray(element.response)) {
      continue;
    }

    // Only use responses with a recognized description
    // and a valid respondent percentage.
    const validResponses = element.response
      .map((response) => ({
        percentage: Number(
          response.percentage_of_respondents
        ),
        position: responsePosition(
          response.description ?? '',
          dimension.category
        ),
      }))
      .filter(
        (response) =>
          Number.isFinite(response.percentage) &&
          response.percentage > 0 &&
          response.percentage <= 100 &&
          response.position !== null
      );

    if (!validResponses.length) {
      continue;
    }

    const totalPercentage = validResponses.reduce(
      (sum, response) => sum + response.percentage,
      0
    );

    if (totalPercentage <= 0) {
      continue;
    }

    // Weighted interpretation of the available
    // response categories.
    const measuredPosition =
      validResponses.reduce(
        (sum, response) =>
          sum +
          response.percentage *
          (response.position as number),
        0
      ) / totalPercentage;

    // Work Pace slider:
    // 0 = fast-paced, 100 = predictable.
    const occupationPosition =
      dimension.category === 'deadlines'
        ? 100 - measuredPosition
        : measuredPosition;

    const rawPreference = Number(
      preferences[dimension.key] ?? 50
    );

    const userPosition = clamp(
      Number.isFinite(rawPreference)
        ? rawPreference
        : 50
    );

    if (isNeutralPreference(userPosition)) continue;

    const fit = clamp(
      100 - Math.abs(
        userPosition - occupationPosition
      )
    );

    scores.push(fit);

    reasons.push(
      `${dimension.label}: your preference was compared with O*NET workplace survey responses for ${element.name ?? 'this occupation'}.`
    );
  }

  return { scores, reasons };
}

export function calculateOnetMatch(
  career: OnetCareer,
  profile: UserProfile,
  scenarioPriorities?: Partial<WhatIfState>,
  scenarioPreferences?: Preferences,
  scenarioProfile?: Pick<UserProfile, 'interests' | 'skills'>
): OnetMatchResult {
  const sections = getOccupationSections(career);

  const reasons: string[] = [];
  const rankedReasons: {
    text: string;
    strength: number;
  }[] = [];

  const considerations: string[] = [];
  const skillsToDevelop: string[] = [];

  // INTERESTS
  const interestScores: number[] = [];
  const directInterestScores: number[] = [];
  const transferableInterestScores: number[] = [];
  const matchedInterests: string[] = [];
  const coreInterestMatches: string[] = [];
  const dutyInterestScores: Record<string, number> = {};

  // Broad transferable interests are distinguished
  // from more occupation-specific interests.
  const broadInterests = new Set([
    'Communication',
    'Problem Solving',
    'Leadership',
  ]);

  const selectedInterests = [...new Set((scenarioProfile?.interests ?? profile.interests) ?? [])];
  const hasSpecificInterests = selectedInterests.some(interest => !broadInterests.has(interest));

  for (const interest of selectedInterests) {
    const terms = INTEREST_TERMS[interest] ?? [
      normalize(interest),
    ];

    const evidence = interestEvidence(sections, terms);

    const isTransferable = broadInterests.has(interest);
    if (isTransferable) {
      transferableInterestScores.push(evidence.score);
    } else {
      directInterestScores.push(evidence.score);
    }
    // Broad interests remain valid but cannot substitute for a selected field.
    const adjustedScore = isTransferable && hasSpecificInterests
      ? Math.round(evidence.score * 0.65)
      : evidence.score;
    interestScores.push(adjustedScore);

    const dutyEvidence = interestEvidence(
      { ...sections, knowledge: '' },
      terms
    );

    dutyInterestScores[interest] = dutyEvidence.score;

    if (
      !broadInterests.has(interest) &&
      dutyEvidence.score >= 45
    ) {
      coreInterestMatches.push(interest);
    }

    if (evidence.score >= 35) {
      matchedInterests.push(interest);

      rankedReasons.push({
        text: describeInterestConnection(interest, dutyEvidence.evidence.length ? dutyEvidence.evidence : evidence.evidence),
        strength: isTransferable && hasSpecificInterests
          ? adjustedScore
          : evidence.score + 25,
      });
    }
  }

  // INTEREST SCORING
  // Give more importance to the student's strongest
  // connections while still considering all interests.
  const interestScore = (() => {
    if (interestScores.length === 0 || !(sections.description || sections.tasks || sections.knowledge)) return null;

    const sortedScores = [...interestScores].sort(
      (a, b) => b - a
    );

    const strongestScores = sortedScores.slice(0, 2);

    const strongestAverage =
      strongestScores.reduce((sum, score) => sum + score, 0) /
      strongestScores.length;

    const overallAverage =
      interestScores.reduce((sum, score) => sum + score, 0) /
      interestScores.length;

    return Math.round(
      strongestAverage * 0.70 +
      overallAverage * 0.30
    );
  })();

  // Field alignment is separate from overall compatibility. A profile
  // containing only broad interests still receives an alignment estimate.
  const summarizeAlignment = (scores: number[]) =>
    (average([...scores].sort((a, b) => b - a).slice(0, 2)) ?? 0) * 0.5 +
    (average(scores) ?? 0) * 0.5;
  const occupationalAlignment = hasSpecificInterests
    ? Math.round(summarizeAlignment(directInterestScores) *
        (transferableInterestScores.length ? 0.85 : 1) +
        summarizeAlignment(transferableInterestScores) * 0.15)
    : Math.round(summarizeAlignment(transferableInterestScores));

  // SKILLS
  const skillScores: number[] = [];
  const skillWeights: number[] = [];

  for (
    const [skillName, rawRating] of Object.entries(
      scenarioProfile?.skills ?? profile.skills ?? {}
    )
  ) {
    if (
      typeof rawRating !== 'number' ||
      !Number.isFinite(rawRating) ||
      rawRating < 1
    ) {
      continue;
    }

    const terms = SKILL_TERMS[skillName] ?? [
      normalize(skillName),
    ];

    const evidence = evidenceStrength(sections, terms);

    const directNames = new Set(
      (DIRECT_SKILLS[skillName] ?? []).map(normalize)
    );

    const direct = (career.skills?.element ?? []).filter(
      skill => directNames.has(normalize(skill.name))
    );

    const relevance = Math.max(
      evidence.score,
      direct.length ? 45 : 0
    );

    if (relevance < 15) continue;

    const rating = clamp(rawRating, 1, 5);
    const readiness = ((rating - 1) / 4) * 100;

    // Readiness matters only to the extent that
    // the occupation uses the skill.
    skillScores.push(readiness);
    // Modestly emphasize existing self-rated strengths without changing readiness.
    skillWeights.push(relevance * (rating >= 4 ? 1.20 : 1));

    if (rating >= 4 && relevance >= 45) {
      rankedReasons.push({
        text: describeSkillConnection(
          skillName, sections, terms,
          direct.length ? direct.map(skill => skill.name.toLowerCase()) : evidence.evidence
        ),
        strength: relevance * readiness / 100 * 0.75,
      });
    } else if (
      rating <= 2 &&
      (
        direct.length >= 2 ||
        (
          evidence.score >= 55 &&
          matchingTerms(
            `${sections.description} ${sections.tasks}`,
            terms
          ).length >= 2
        )
      )
    ) {
      // A moderate self-rating is not automatically
      // treated as a skill deficiency.
      skillsToDevelop.push(skillName);
    }
  }

  const skillWeight = skillWeights.reduce(
    (sum, weight) => sum + weight,
    0
  );

  const skillScore = skillWeight
    ? skillScores.reduce(
        (sum, value, i) => sum + value * skillWeights[i],
        0
      ) / skillWeight
    : null;

  // WORK PREFERENCES
  // Baseline uses saved preferences.
  // What-If uses temporary preferences when supplied.
  const selectedPreferences =
    scenarioPreferences ?? profile.preferences;

  const preferenceResult = calculatePreferenceMatch(
    sections,
    selectedPreferences
  );

  const workContextResult = calculateWorkContextPreferences(
    career,
    selectedPreferences
  );

  const workLocationResult = calculateWorkLocationPreference(
    sections,
    selectedPreferences
  );

  const combinedPreferenceScores = [
    ...(
      workLocationResult.score === null
        ? []
        : [workLocationResult.score]
    ),
    ...preferenceResult.scores,
    ...workContextResult.scores,
  ];

  const preferenceScore = average(
    combinedPreferenceScores
  );

  if (preferenceScore !== null) {
    reasons.push(
      ...preferenceResult.reasons,
      ...workContextResult.reasons,
      ...(
        workLocationResult.reason
          ? [workLocationResult.reason]
          : []
      )
    );
  }

  const locationPreference = Number(
    selectedPreferences.officeVsRemote ?? 50
  );

  if (
    locationPreference > 60 &&
    workLocationResult.reason &&
    workLocationResult.score !== null &&
    workLocationResult.score < 70
  ) {
    considerations.push(workLocationResult.reason);
  }

  if (skillsToDevelop.length) {
    considerations.push(
      `Skills to develop: ${[
        ...new Set(skillsToDevelop),
      ].slice(0, 2).join(', ')}.`
    );
  }

  if (
    combinedPreferenceScores.some(value => value < 50) &&
    considerations.length === 0
  ) {
    considerations.push(
      'Some work preferences may differ from this occupation’s typical duties or surveyed working conditions. Review the preference breakdown and full profile.'
    );
  }

  // GOALS
  const activePriorities = scenarioPriorities
    ? Object.entries(scenarioPriorities)
        .filter(([, enabled]) => enabled)
        .map(([key]) => key)
    : [];

  const selectedGoals = scenarioPriorities !== undefined
    ? activePriorities
    : profile.goals ?? [];

  const goalScores: number[] = [];
  const unsupportedGoals: string[] = [];

  const seenGoals = new Set<string>();
  for (const rawGoal of selectedGoals) {
    const goal = normalizeGoal(rawGoal);
    if (seenGoals.has(goal)) continue;
    seenGoals.add(goal);
    const terms = GOAL_TERMS[goal];

    // Unsupported goals are excluded rather than
    // assigned an invented earnings or schedule score.
    // Advancement opportunities depend on employers,
    // not whether an occupation includes training duties.
    if (!terms || goal === 'Growth') {
      unsupportedGoals.push(
        goal === 'Growth'
          ? 'Growth & Advancement'
          : rawGoal
      );

      continue;
    }

    if (!(sections.description || sections.tasks)) {
      unsupportedGoals.push(rawGoal);
      continue;
    }
    const evidence = goalEvidence(sections, terms);
    goalScores.push(evidence.score);

    if (evidence.score >= 35) {
      rankedReasons.push({
        text: `The documented duties involve ${readableEvidence(evidence.evidence)}, which may support your goal of ${goal.toLowerCase()}.`,
        strength: evidence.score + 5,
      });
    }
  }

  const goalScore = average(goalScores);

  const breakdown: OnetMatchResult['breakdown'] = {
    interests:
      interestScore === null
        ? null
        : Math.round(interestScore),
    skills:
      skillScore === null
        ? null
        : Math.round(skillScore),
    preferences:
      preferenceScore === null
        ? null
        : Math.round(preferenceScore),
    goals:
      goalScore === null
        ? null
        : Math.round(goalScore),
  };

  // Weighted average of categories with evidence.
  let earned = 0;
  let availableWeight = 0;

  for (
    const category of Object.keys(
      CATEGORY_WEIGHTS
    ) as MatchCategory[]
  ) {
    const categoryScore = breakdown[category];

    if (categoryScore === null) continue;

    const weight = CATEGORY_WEIGHTS[category];

    earned += categoryScore * weight;
    availableWeight += weight;
  }

  const score =
    availableWeight > 0
      ? Math.round(earned / availableWeight)
      : 0;

  const confidence: OnetMatchResult['confidence'] =
    availableWeight >= 75
      ? 'strong'
      : availableWeight >= 45
        ? 'moderate'
        : 'limited';

  const hasActivePreference = Object.values(
    selectedPreferences
  ).some(
    value =>
      typeof value === 'number' &&
      Number.isFinite(value) &&
      !isNeutralPreference(clamp(value))
  );

  if (preferenceScore === null && hasActivePreference) {
    considerations.push(
      'Available occupation information did not provide enough evidence to evaluate your selected work preferences.'
    );
  }

  if (skillScore === null) {
    considerations.push(
      'There was not enough overlapping skill information to evaluate your current strengths.'
    );
  }

  if (unsupportedGoals.length) {
    considerations.push(
      `Not scored: ${[
        ...new Set(unsupportedGoals),
      ].join(', ')}. Available occupation data cannot reliably establish these outcomes; check employer and local labour market information.`
    );
  }

  if (availableWeight === 0) {
    considerations.push(
      'Complete onboarding to receive a more meaningful compatibility estimate.'
    );
  }

  // EDUCATION
  const education = (career.education?.response ?? [])
    .filter(
      item =>
        typeof item.title === 'string' &&
        Number.isFinite(item.percentage_of_respondents)
    )
    .sort(
      (a, b) =>
        b.percentage_of_respondents -
        a.percentage_of_respondents
    )[0];

  if (
    education &&
    education.percentage_of_respondents > 0
  ) {
    considerations.unshift(
      `Education: ${Math.round(education.percentage_of_respondents)}% of O*NET respondents reported ${education.title.toLowerCase()} as the required education level. Check local requirements.`
    );
  }

  return {
    score: clamp(score),
    occupationalAlignment,
    matchedInterests,
    coreInterestMatches,
    dutyInterestScores,
    goalAlignment:
      goalScore === null
        ? null
        : Math.round(goalScore),
    confidence,
    reasons: [
      ...new Set([
        ...rankedReasons
          .sort((a, b) => b.strength - a.strength)
          .map(item => item.text),
        ...reasons,
      ]),
    ].slice(0, 5),
    considerations: [...new Set(considerations)],
    skillsToDevelop: [
      ...new Set(skillsToDevelop),
    ].slice(0, 6),
    breakdown,
  };
}
