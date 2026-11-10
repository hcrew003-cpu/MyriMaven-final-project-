
import type { UserProfile, WhatIfState } from '../types/career';
import type { OnetCareer } from '../context/CareerContext';

export interface OnetMatchResult {
  score: number;
  confidence: 'limited' | 'moderate' | 'strong';
  reasons: string[];
  considerations: string[];
  skillsToDevelop: string[];
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
  interests: 35,
  skills: 30,
  preferences: 20,
  goals: 15,
};

const INTEREST_TERMS: Record<string, string[]> = {
  Technology: [
    'software', 'computer', 'programming',
    'information technology', 'digital systems',
  ],
  Business: [
    'business', 'management', 'marketing',
    'sales', 'finance', 'operations',
  ],
  'Helping People': [
    'counsel', 'patient', 'community',
    'social service', 'assist clients', 'teach',
  ],
  Creativity: [
    'design', 'artistic', 'creative',
    'advertising', 'visual', 'originality',
  ],
  Environment: [
    'environmental', 'ecology', 'conservation',
    'sustainability', 'natural resources',
  ],
  'Problem Solving': [
    'problem solving', 'troubleshooting',
    'critical thinking', 'diagnos',
  ],
  Leadership: [
    'manage', 'supervis', 'leadership',
    'direct operations', 'coordinate teams',
  ],
  'Working with Data': [
    'data analysis', 'statistics', 'analytics',
    'data collection', 'quantitative',
  ],
  Communication: [
    'public speaking', 'writing', 'presentation',
    'communication', 'negotiation',
  ],
  'Working with Children': [
    'children', 'child development',
    'early childhood', 'elementary school',
  ],
  Healthcare: [
    'patient', 'clinical', 'medical',
    'nursing', 'healthcare',
  ],
  Entrepreneurship: [
    'business development', 'entrepreneur',
    'startup', 'business strategy',
  ],
};

const SKILL_TERMS: Record<string, string[]> = {
  Communication: [
    'speaking', 'writing', 'active listening',
    'negotiation', 'communication',
  ],
  Leadership: [
    'management of personnel', 'leadership',
    'supervis', 'direct',
  ],
  Organization: [
    'time management', 'coordination',
    'planning', 'organizing',
  ],
  'Problem Solving': [
    'complex problem solving',
    'critical thinking', 'troubleshooting',
  ],
  Research: [
    'research', 'information gathering',
    'investigation',
  ],
  Creativity: [
    'design', 'originality', 'creative thinking',
    'innovation',
  ],
  Teamwork: [
    'coordination', 'collaboration',
    'working with others',
  ],
  'Analytical Thinking': [
    'analysis', 'mathematics',
    'analytical thinking', 'reasoning',
  ],
};

const GOAL_TERMS: Record<string, string[]> = {
  Growth: [
    'training', 'professional development',
    'learning', 'advancement',
  ],
  Leadership: [
    'management', 'supervis',
    'leadership', 'direct operations',
  ],
  'Helping others': [
    'patient', 'community', 'counsel',
    'social service', 'teach', 'assist clients',
  ],
  Creativity: [
    'design', 'creative', 'artistic',
    'originality',
  ],
  'Making an impact': [
    'community', 'conservation',
    'public health', 'social service',
  ],
};

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
      'design', 'artistic', 'originality',
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
  const description = normalize(career.description ?? '');

  const tasks = normalize(
    (career.tasks?.task ?? [])
      .map((task) => task.title)
      .join(' ')
  );

  const skills = normalize(
    (career.skills?.element ?? [])
      .map((skill) => `${skill.name} ${skill.description}`)
      .join(' ')
  );

  const knowledge = normalize(
    (career.knowledge?.element ?? [])
      .map((item) => `${item.name} ${item.description}`)
      .join(' ')
  );

  return { description, tasks, skills, knowledge };
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

  const score =
    (descriptionMatches.length ? 45 : 0) +
    (taskMatches.length ? 35 : 0) +
    (skillMatches.length ? 15 : 0) +
    (knowledgeMatches.length ? 5 : 0);

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
      `${config.label}: your preference was compared with occupation references to ${evidence.join(' and ')}.`
    );
  }

  return {
    score: average(scores),
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
    if (value.includes('extremely important')) return 100;
    if (value.includes('very important')) return 80;
    if (value.includes('important')) return 60;
    if (value.includes('somewhat important')) return 35;
    if (value.includes('not important')) return 0;
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
// Patterns intentionally match ordinary task wording rather than a few exact phrases.
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

// Digital/desk-based duties may be more location-flexible, but they do not
// establish that a job is remote or hybrid. Use a smaller scoring effect.
const DIGITAL_DUTY_PATTERNS: RegExp[] = [
  /\b(?:analy[sz]|interpret|model|forecast|research|evaluate|review)\w*\b.{0,70}\b(?:data|information|reports?|financial|statistics|trends|markets?)\b/i,
  /\b(?:develop|design|write|maintain|test|debug|program)\w*\b.{0,70}\b(?:software|code|applications?|websites?|digital|databases?|systems?)\b/i,
  /\b(?:prepare|write|edit|draft|publish|create)\w*\b.{0,65}\b(?:reports?|documents?|content|plans?|proposals?|presentations?)\b/i,
  /\b(?:coordinate|communicate|consult|advise|plan|schedule)\w*\b.{0,65}\b(?:projects?|teams?|clients?|operations|activities|meetings?)\b/i,
];

function calculateWorkLocationPreference(
  sections: Sections,
  preferences: Preferences
): { score: number | null; reason: string | null } {
  const duties = `${sections.description} ${sections.tasks}`;
  const onsite = ON_SITE_DUTY_PATTERNS.filter((pattern) => pattern.test(duties)).length;
  const digital = DIGITAL_DUTY_PATTERNS.filter((pattern) => pattern.test(duties)).length;

  if (onsite === 0 && digital === 0) {
    return { score: null, reason: null };
  }

  const raw = Number(preferences.officeVsRemote ?? 50);
  const remotePreference = clamp(Number.isFinite(raw) ? raw : 50);

  // If both kinds of duties appear, prefer caution: physical presence may
  // still be necessary. This is a heuristic, not a remote eligibility test.
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
    // More frequent deadlines are treated as
    // evidence of greater time pressure.
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
  const considerations: string[] = [];
  const skillsToDevelop: string[] = [];

  // INTERESTS
  const interestScores: number[] = [];

  for (const interest of (scenarioProfile?.interests ?? profile.interests) ?? []) {
    const terms = INTEREST_TERMS[interest] ?? [
      normalize(interest),
    ];

    const evidence = evidenceStrength(sections, terms);
    interestScores.push(evidence.score);

    if (evidence.score >= 35) {
      reasons.push(
        `Your interest in ${interest.toLowerCase()} connects with ${evidence.evidence
          .slice(0, 2)
          .join(' and ')} mentioned in this occupation's O*NET information.`
      );
    }
  }

  
  // INTEREST SCORING
  // Give more importance to the student's strongest
  // connections while still considering all interests.

  const interestScore = (() => {
    if (interestScores.length === 0) return null;

    const sortedScores = [...interestScores].sort(
      (a, b) => b - a
    );

    // Average the strongest two interest connections.
    const strongestScores = sortedScores.slice(0, 2);

    const strongestAverage =
      strongestScores.reduce((sum, score) => sum + score, 0) /
      strongestScores.length;

    // Keep all selected interests in the calculation.
    const overallAverage =
      interestScores.reduce((sum, score) => sum + score, 0) /
      interestScores.length;

    // Strong connections receive more weight,
    // but weaker connections still matter.
    return Math.round(
      strongestAverage * 0.65 +
      overallAverage * 0.35
    );
  })();


  // SKILLS
  const skillScores: number[] = [];

  for (const [skillName, rawRating] of Object.entries(
    scenarioProfile?.skills ?? profile.skills ?? {}
  )) {
    if (typeof rawRating !== 'number') continue;

    const terms = SKILL_TERMS[skillName] ?? [
      normalize(skillName),
    ];

    const evidence = evidenceStrength(sections, terms);

    if (evidence.score === 0) continue;

    const rating = clamp(rawRating, 1, 5);
    const readiness = ((rating - 1) / 4) * 100;

    skillScores.push(
      readiness * 0.7 + evidence.score * 0.3
    );

    if (rating >= 4) {
      reasons.push(
        `Your self-rated strength in ${skillName.toLowerCase()} may help with ${evidence.evidence[0]}-related work.`
      );
    } else {
      skillsToDevelop.push(skillName);
    }
  }

  const skillScore = average(skillScores);

  // WORK PREFERENCES
  // Baseline uses saved preferences.
  // What-If uses temporary preferences when supplied.
  const selectedPreferences =
    scenarioPreferences ?? profile.preferences;

  const preferenceResult = calculatePreferenceMatch(
    sections,
    selectedPreferences
  );

  
const workContextResult =
  calculateWorkContextPreferences(
    career,
    selectedPreferences
  );

const workLocationResult = calculateWorkLocationPreference(
  sections,
  selectedPreferences
);

const combinedPreferenceScores = [
  ...(workLocationResult.score === null ? [] : [workLocationResult.score]),
  ...(preferenceResult.score === null
    ? []
    : [preferenceResult.score]),
  ...workContextResult.scores,
];

const preferenceScore = average(
  combinedPreferenceScores
);


  if (preferenceScore !== null) {
    reasons.push(
  ...preferenceResult.reasons,
  ...workContextResult.reasons,
  ...(workLocationResult.reason ? [workLocationResult.reason] : [])
);
  }

  if (workLocationResult.reason) {
    considerations.push(workLocationResult.reason);
  } else {
    considerations.push('Work location: insufficient task evidence to estimate location flexibility for this occupation. The slider does not affect its score.');
  }

  // GOALS
  const activePriorities = scenarioPriorities
    ? Object.entries(scenarioPriorities)
        .filter(([, enabled]) => enabled)
        .map(([key]) => key)
    : [];

  const selectedGoals = activePriorities.length
    ? activePriorities
    : profile.goals ?? [];

  const goalScores: number[] = [];

  for (const rawGoal of selectedGoals) {
    const goal = normalizeGoal(rawGoal);
    const terms = GOAL_TERMS[goal];

    // Unsupported goals are excluded rather than
    // assigned an invented earnings or schedule score.
    if (!terms) continue;

    const evidence = evidenceStrength(sections, terms);
    goalScores.push(evidence.score);

    if (evidence.score >= 35) {
      reasons.push(
        `Your goal of ${goal.toLowerCase()} connects with ${evidence.evidence
          .slice(0, 2)
          .join(' and ')} described in this occupation.`
      );
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

  for (const category of Object.keys(
    CATEGORY_WEIGHTS
  ) as MatchCategory[]) {
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

  if (preferenceScore === null) {
    considerations.push(
      'Available occupation descriptions did not provide enough evidence to score work preferences.'
    );
  } else {
  considerations.push(
    'Work-preference estimates combine descriptive keyword evidence with available O*NET workplace survey responses.'
  );
}

  considerations.push(
  'Collaboration, work structure, and work pace use available O*NET workplace survey responses. These are exploratory estimates, not guaranteed working conditions.'
);

considerations.push(
  'Work location uses exploratory on-site and digital-duty indicators. A digital task does not establish remote availability, and employers may require attendance. Careers with insufficient evidence remain unscored for location.'
);

  if (skillScore === null) {
    considerations.push(
      'There was not enough overlapping skill information to evaluate your current strengths.'
    );
  }

  if (goalScore === null) {
    considerations.push(
      'Some goals, including salary, stability, and work-life balance, require additional information.'
    );
  }

  if (availableWeight === 0) {
    considerations.push(
      'Complete onboarding to receive a more meaningful compatibility estimate.'
    );
  }

  return {
    score: clamp(score),
    confidence,
    reasons: [...new Set(reasons)].slice(0, 5),
    considerations,
    skillsToDevelop: [...new Set(skillsToDevelop)].slice(0, 6),
    breakdown,
  };
}
