
import type { UserProfile } from '../types/career';
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
    'technology', 'software', 'computer', 'digital',
    'programming', 'information systems',
  ],
  Business: [
    'business', 'management', 'marketing', 'sales',
    'finance', 'administration', 'operations',
  ],
  'Helping People': [
    'help', 'support', 'service', 'care',
    'counsel', 'assist', 'patient',
  ],
  Creativity: [
    'creative', 'design', 'art', 'content',
    'advertising', 'innovation',
  ],
  Environment: [
    'environment', 'sustainability', 'conservation',
    'ecology', 'natural resources',
  ],
  'Problem Solving': [
    'problem solving', 'critical thinking',
    'troubleshooting', 'analysis', 'evaluate',
  ],
  Leadership: [
    'leadership', 'management', 'supervise',
    'coordinate', 'direct', 'strategic planning',
  ],
  'Working with Data': [
    'data', 'analytics', 'statistics',
    'research', 'forecasting', 'analysis',
  ],
  Communication: [
    'communication', 'speaking', 'writing',
    'listening', 'presentation', 'media',
  ],
  'Working with Children': [
    'children', 'child', 'youth', 'school',
    'early childhood', 'student',
  ],
  Healthcare: [
    'healthcare', 'health', 'medical',
    'patient', 'clinical', 'nursing',
  ],
  Entrepreneurship: [
    'entrepreneurship', 'business development',
    'business strategy', 'startup',
    'product development',
  ],
};

const SKILL_TERMS: Record<string, string[]> = {
  Communication: [
    'communication', 'speaking', 'writing',
    'active listening', 'negotiation',
  ],
  Leadership: [
    'leadership', 'management of personnel',
    'supervis', 'direct', 'coordinate',
  ],
  Organization: [
    'organizing', 'coordination', 'planning',
    'time management', 'administration',
  ],
  'Problem Solving': [
    'problem solving', 'critical thinking',
    'troubleshooting', 'decision making',
  ],
  Research: [
    'research', 'investigation',
    'information gathering', 'analysis',
  ],
  Creativity: [
    'creativity', 'design', 'innovation',
    'originality', 'creative thinking',
  ],
  Teamwork: [
    'teamwork', 'collaboration', 'cooperation',
    'working with others',
  ],
  'Analytical Thinking': [
    'analytical', 'analysis', 'critical thinking',
    'mathematics', 'reasoning',
  ],
};

const GOAL_TERMS: Record<string, string[]> = {
  Growth: [
    'learning', 'development', 'training',
    'advancement',
  ],
  Leadership: [
    'leadership', 'management', 'supervis',
    'direct',
  ],
  'Work-life balance': [
    'flexible schedule', 'work life balance',
    'predictable schedule',
  ],
  'Income potential': [
    'salary', 'earnings', 'wages', 'income',
  ],
  'Helping others': [
    'help', 'support', 'care', 'service',
    'community',
  ],
  'Job stability': [
    'job security', 'employment outlook',
    'job stability',
  ],
  Creativity: [
    'creative', 'design', 'innovation',
    'advertising',
  ],
  'Making an impact': [
    'improve', 'develop', 'support',
    'community', 'environment',
  ],
  Flexibility: [
    'flexible', 'remote', 'independent',
    'variable schedule',
  ],
};

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

function includesAny(text: string, terms: string[]): boolean {
  return terms.some((term) => text.includes(term.toLowerCase()));
}

function getCareerText(career: OnetCareer): string {
  return [
    career.title,
    career.description,
    ...(career.tasks?.task ?? []).map((item) => item.title),
    ...(career.skills?.element ?? []).flatMap((item) => [
      item.name,
      item.description,
    ]),
    ...(career.knowledge?.element ?? []).flatMap((item) => [
      item.name,
      item.description,
    ]),
  ]
    .join(' ')
    .toLowerCase();
}

function getSkillText(career: OnetCareer): string {
  return [
    ...(career.skills?.element ?? []).flatMap((item) => [
      item.name,
      item.description,
    ]),
    ...(career.tasks?.task ?? []).map((item) => item.title),
  ]
    .join(' ')
    .toLowerCase();
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;

  return values.reduce((sum, value) => sum + value, 0) /
    values.length;
}

export function calculateOnetMatch(
  career: OnetCareer,
  profile: UserProfile
): OnetMatchResult {
  const careerText = getCareerText(career);
  const skillText = getSkillText(career);

  const reasons: string[] = [];
  const considerations: string[] = [];
  const skillsToDevelop: string[] = [];

  // 1. INTEREST MATCHING
  const selectedInterests = profile.interests ?? [];

  const interestScores = selectedInterests.map((interest) => {
    const terms = INTEREST_TERMS[interest] ?? [
      interest.toLowerCase(),
    ];

    const matched = includesAny(careerText, terms);

    if (matched) {
      reasons.push(
        `Your interest in ${interest.toLowerCase()} connects with activities or knowledge associated with this career.`
      );
    }

    return matched ? 100 : 0;
  });

  const interestScore = average(interestScores);

  // 2. SKILL MATCHING
  const skillScores: number[] = [];

  for (const [skillName, rawRating] of Object.entries(
    profile.skills ?? {}
  )) {
    const terms = SKILL_TERMS[skillName];

    if (!terms || typeof rawRating !== 'number') {
      continue;
    }

    if (!includesAny(skillText, terms)) {
      continue;
    }

    const rating = clamp(rawRating, 1, 5);

    // A student's self-rating indicates current familiarity,
    // not an O*NET-measured requirement level.
    const score = ((rating - 1) / 4) * 100;

    skillScores.push(score);

    if (rating >= 4) {
      reasons.push(
        `Your self-rated strength in ${skillName.toLowerCase()} may be useful in this occupation.`
      );
    }

    if (rating <= 3) {
      skillsToDevelop.push(skillName);
    }
  }

  const skillScore = average(skillScores);

  // 3. WORK PREFERENCES
  // The current API response does not provide reliable,
  // structured work-context measures. Do not infer
  // remote work, schedule, pace, or autonomy from a title.
  const preferenceScore: number | null = null;

  // 4. CAREER GOALS
  const selectedGoals = profile.goals ?? [];
  const goalScores: number[] = [];

  for (const goal of selectedGoals) {
    const terms = GOAL_TERMS[goal];

    if (!terms) continue;

    // Some goals require labour-market or work-context data
    // that the current O*NET endpoint does not return.
    if (
      goal === 'Income potential' ||
      goal === 'Job stability' ||
      goal === 'Work-life balance' ||
      goal === 'Flexibility'
    ) {
      continue;
    }

    const matched = includesAny(careerText, terms);

    goalScores.push(matched ? 100 : 0);

    if (matched) {
      reasons.push(
        `Your goal of ${goal.toLowerCase()} has some alignment with the occupational activities described by O*NET.`
      );
    }
  }

  const goalScore = average(goalScores);

  const breakdown: OnetMatchResult['breakdown'] = {
    interests: interestScore === null
      ? null
      : Math.round(interestScore),
    skills: skillScore === null
      ? null
      : Math.round(skillScore),
    preferences: preferenceScore,
    goals: goalScore === null
      ? null
      : Math.round(goalScore),
  };

  // Only include categories with actual matching evidence.
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

  const score = availableWeight > 0
    ? Math.round(earned / availableWeight)
    : 0;

  // Confidence reflects how much of the intended
  // scoring model has usable evidence.
  const confidence: OnetMatchResult['confidence'] =
    availableWeight >= 75
      ? 'strong'
      : availableWeight >= 45
        ? 'moderate'
        : 'limited';

  if (preferenceScore === null) {
    considerations.push(
      'Work-style compatibility has not been assessed because detailed work-context data is not yet connected.'
    );
  }

  if (skillScore === null) {
    considerations.push(
      'There was not enough overlapping skill information to assess your current strengths.'
    );
  }

  if (goalScore === null) {
    considerations.push(
      'Your selected career goals could not be reliably assessed using the currently available occupational information.'
    );
  }

  if (availableWeight === 0) {
    considerations.push(
      'Complete your onboarding profile to receive a more meaningful compatibility estimate.'
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
