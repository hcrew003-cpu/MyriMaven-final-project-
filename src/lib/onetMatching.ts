
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

  const pattern = new RegExp(`\\b${escaped}\\w*\\b`, 'i');

  return pattern.test(text);
}

function matchingTerms(
  text: string,
  terms: string[]
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

function evidenceStrength(
  sections: ReturnType<typeof getOccupationSections>,
  terms: string[]
): { score: number; evidence: string[] } {
  const descriptionMatches = matchingTerms(
    sections.description,
    terms
  );
  const taskMatches = matchingTerms(sections.tasks, terms);
  const skillMatches = matchingTerms(sections.skills, terms);
  const knowledgeMatches = matchingTerms(
    sections.knowledge,
    terms
  );

  // Description and tasks receive more emphasis than
  // incidental mentions in skill or knowledge descriptions.
  const score =
    (descriptionMatches.length > 0 ? 45 : 0) +
    (taskMatches.length > 0 ? 35 : 0) +
    (skillMatches.length > 0 ? 15 : 0) +
    (knowledgeMatches.length > 0 ? 5 : 0);

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

  return (
    values.reduce((sum, value) => sum + value, 0) /
    values.length
  );
}

function normalizeGoal(goal: string): string {
  const normalized = normalize(goal)
    .replace(/[^a-z]/g, '');

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

  return aliases[normalized] ?? goal;
}

export function calculateOnetMatch(
  career: OnetCareer,
  profile: UserProfile,
  scenarioPriorities?: Partial<WhatIfState>
): OnetMatchResult {
  const sections = getOccupationSections(career);

  const reasons: string[] = [];
  const considerations: string[] = [];
  const skillsToDevelop: string[] = [];

  // INTERESTS
  const interests = profile.interests ?? [];
  const interestScores: number[] = [];

  for (const interest of interests) {
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

  const interestScore = average(interestScores);

  // SKILLS
  const skillScores: number[] = [];

  for (const [skillName, rawRating] of Object.entries(
    profile.skills ?? {}
  )) {
    if (typeof rawRating !== 'number') continue;

    const terms = SKILL_TERMS[skillName] ?? [
      normalize(skillName),
    ];

    const evidence = evidenceStrength(sections, terms);

    if (evidence.score === 0) continue;

    const rating = clamp(rawRating, 1, 5);

    // Self-assessed ability, not a validated proficiency test.
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
  // Not scored until reliable structured O*NET work-context
  // measures are available. Do not guess remote work,
  // schedule, autonomy or pace from occupational titles.
  const preferenceScore: number | null = null;

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

    // No earnings, job outlook or schedule information
    // is currently included in the O*NET detail response.
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
      interestScore === null ? null : Math.round(interestScore),
    skills:
      skillScore === null ? null : Math.round(skillScore),
    preferences: preferenceScore,
    goals:
      goalScore === null ? null : Math.round(goalScore),
  };

  // Weighted average using only categories with evidence.
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
      'Work preferences have not been scored because structured work-context data is not yet connected.'
    );
  }

  if (skillScore === null) {
    considerations.push(
      'There was not enough overlapping skill information to evaluate your current strengths.'
    );
  }

  if (goalScore === null) {
    considerations.push(
      'Some goals, including salary, stability and work-life balance, require additional information.'
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
