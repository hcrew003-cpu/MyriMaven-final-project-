
import type { UserProfile } from '../types/career';

export type CatalogCareer = {
  id: string;
  title: string;
  datalevel: boolean;
  jobZone: string | null;
};

export const DETAIL_LIMIT = 60;


const TOPIC_TERMS: Record<string, string[]> = {
  Technology: [
    'software', 'computer', 'network',
    'information technology', 'cyber',
    'web', 'developer', 'programmer',
    'systems analyst', 'database',
    'information security', 'robotics',
    'automation', 'artificial intelligence',
    'machine learning', 'technical support',
    'electronics', 'telecommunications',
    'digital', 'technology',
  ],

  Business: [
    'business', 'management analyst',
    'marketing', 'finance', 'financial',
    'account', 'sales', 'operations',
    'project management', 'human resources',
    'market research', 'logistics',
    'purchasing', 'consultant',
    'supply chain', 'budget', 'auditor',
    'compensation', 'training specialist',
    'administrative services',
    'business intelligence',
  ],

  'Helping People': [
    'counsel', 'social work', 'social service',
    'therap', 'health', 'care',
    'teacher', 'advisor', 'advocate',
    'community', 'rehabilitation',
    'case manager', 'support specialist',
    'psycholog', 'mental health',
    'family', 'outreach', 'human services',
    'public health', 'occupational therapy',
    'career counselor', 'education',
  ],

  Creativity: [
    'design', 'artist', 'writer',
    'media', 'advertis', 'creative',
    'architect', 'graphic',
    'animation', 'film', 'video',
    'photograph', 'music', 'fashion',
    'interior', 'illustrat',
    'content', 'editor', 'producer',
    'game design', 'art director',
    'multimedia', 'industrial design',
    'landscape architect',
  ],

  Environment: [
    'environment', 'ecolog', 'conservation',
    'agricultur', 'forestry', 'wildlife',
    'sustainab', 'renewable',
    'solar', 'wind energy', 'biofuel',
    'hydrolog', 'water resource',
    'climate', 'natural resource',
    'environmental policy',
    'recycling', 'waste management',
    'geolog', 'marine', 'soil',
    'energy efficiency', 'green',
    'ecological restoration',
  ],

  'Problem Solving': [
    'analyst', 'engineer', 'scientist',
    'technician', 'research', 'investigator',
    'diagnostic', 'quality assurance',
    'quality control', 'operations research',
    'systems', 'forensic',
    'troubleshooting', 'risk analyst',
    'process improvement',
    'industrial engineering',
    'mathematician', 'statistician',
    'optimization', 'testing',
  ],

  Leadership: [
    'manager', 'director', 'executive',
    'supervisor', 'administrator',
    'coordinator', 'project manager',
    'program manager', 'team leader',
    'operations manager', 'general manager',
    'chief executive', 'department head',
    'training manager', 'human resources manager',
    'public administrator',
    'community service manager',
    'education administrator',
  ],

  'Working with Data': [
    'data', 'statistic', 'analyst',
    'research', 'actuar', 'financial',
    'business intelligence',
    'database', 'economist',
    'mathematician', 'operations research',
    'market research', 'survey',
    'data scientist', 'epidemiolog',
    'biostatistic', 'quantitative',
    'forecast', 'information analyst',
    'risk analyst',
  ],

  Communication: [
    'public relations', 'writer', 'reporter',
    'marketing', 'teacher', 'communications',
    'journalist', 'editor', 'interpreter',
    'translator', 'broadcast',
    'media relations', 'public affairs',
    'fundraising', 'recruiter',
    'training specialist', 'speech',
    'advertising', 'announcer',
    'technical writer', 'customer relations',
    'community outreach',
  ],

  'Working with Children': [
    'child', 'school', 'teacher',
    'education', 'pediatric', 'youth',
    'early childhood', 'preschool',
    'kindergarten', 'elementary',
    'special education', 'childcare',
    'school counselor', 'family services',
    'child psychologist',
    'recreation', 'child development',
    'educational assistant',
    'school social worker',
    'child life specialist',
  ],

  Healthcare: [
    'medical', 'nurs', 'health',
    'patient', 'physician', 'therap',
    'clinical', 'pharmac', 'dental',
    'surgeon', 'radiolog',
    'diagnostic', 'nutrition',
    'dietitian', 'occupational therapy',
    'physical therapy', 'paramedic',
    'public health', 'laboratory',
    'mental health', 'health informatics',
    'respiratory', 'rehabilitation',
    'healthcare administrator',
  ],

  Entrepreneurship: [
    'business', 'marketing', 'sales',
    'product', 'executive',
    'business development',
    'market research', 'consultant',
    'innovation', 'strategy',
    'operations', 'project management',
    'financial', 'advertising',
    'retail', 'purchasing',
    'business analyst', 'management analyst',
    'commercial', 'fundraising',
    'real estate', 'event planner',
  ],
};



const BACKGROUND_TERMS: Record<string, string[]> = {
  business: [
    'business', 'manager', 'management', 'marketing',
    'sales', 'operations', 'consultant', 'administrative',
  ],
  management: [
    'manager', 'management', 'supervisor', 'director',
    'administrator', 'operations', 'project',
  ],
  entrepreneurship: [
    'business', 'marketing', 'sales', 'product',
    'innovation', 'consultant', 'management',
  ],
  finance: [
    'financial', 'finance', 'account', 'budget',
    'investment', 'analyst', 'auditor',
  ],
  accounting: [
    'account', 'auditor', 'financial', 'tax',
    'budget',
  ],
  marketing: [
    'marketing', 'advertis', 'market research',
    'public relations', 'brand', 'sales',
  ],
  psychology: [
    'psycholog', 'counsel', 'human resources',
    'social', 'behavior', 'research',
  ],
  education: [
    'teacher', 'education', 'school',
    'instructor', 'training', 'curriculum',
  ],
  engineering: [
    'engineer', 'technical', 'systems',
    'design', 'manufacturing',
  ],
  computer: [
    'software', 'computer', 'developer',
    'programmer', 'data', 'systems',
  ],
  nursing: [
    'nurs', 'health', 'patient',
    'clinical', 'medical',
  ],
  healthcare: [
    'health', 'medical', 'clinical',
    'patient', 'care',
  ],
  environmental: [
    'environment', 'conservation', 'ecolog',
    'sustainab', 'natural resource',
  ],
  communication: [
    'communications', 'public relations',
    'writer', 'media', 'marketing',
  ],
  design: [
    'design', 'creative', 'graphic',
    'architect', 'artist',
  ],
};

function getBackgroundTerms(profile: UserProfile): string[] {
  if (profile.useCareerBackground !== true) {
    return [];
  }

  const background = [
    profile.major,
    profile.minor,
    profile.completedDegree,
    profile.currentCareer,
  ]
    .filter((value): value is string => Boolean(value?.trim()))
    .join(' ')
    .toLowerCase();

  if (!background) return [];

  const terms = new Set<string>();

  for (const [keyword, relatedTerms] of Object.entries(
    BACKGROUND_TERMS
  )) {
    if (background.includes(keyword)) {
      relatedTerms.forEach((term) => terms.add(term));
    }
  }

  // Include meaningful words from the student's own background.
  const ignored = new Set([
    'bachelor', 'masters', 'master', 'degree',
    'diploma', 'general', 'major', 'minor',
    'student', 'studies', 'science', 'arts',
    'university', 'college', 'current',
    'associate', 'certificate',
  ]);

  for (const word of background.split(/[^a-z]+/)) {
    if (word.length >= 5 && !ignored.has(word)) {
      terms.add(word);
    }
  }

  return [...terms];
}

/**
 * Build a balanced discovery shortlist before the detailed O*NET matching step.
 * These scores choose which occupations to inspect; they are NOT match percentages.
 */
export function selectOnetCandidates(
  catalog: CatalogCareer[],
  profile: UserProfile
): CatalogCareer[] {
  if (catalog.length === 0) return [];

  const interests = [...new Set(profile.interests ?? [])].filter(
    (label) => (TOPIC_TERMS[label]?.length ?? 0) > 0
  );
  const goals = [...new Set(profile.goals ?? [])];
  const goalTerms = [...new Set(goals.flatMap((label) => TOPIC_TERMS[label] ?? []))];
  const backgroundTerms = getBackgroundTerms(profile);

  const scored = catalog.map((career) => {
    const title = career.title.toLowerCase();
    const interestHits = interests.map((label) =>
      (TOPIC_TERMS[label] ?? []).filter((term) => title.includes(term)).length
    );
    const goalHits = goalTerms.filter((term) => title.includes(term)).length;
    const backgroundHits = backgroundTerms.filter((term) => title.includes(term)).length;
    const matchingInterests = interestHits.filter((hits) => hits > 0).length;

    // Reward alignment with more than one selected interest, not just many
    // overlapping words from one broad category such as Leadership.
    const score =
      matchingInterests * 4 +
      interestHits.reduce((sum, hits) => sum + Math.min(hits, 2), 0) +
      Math.min(goalHits, 2) * 1.5 +
      Math.min(backgroundHits, 3) * 0.4;

    return { career, score, interestHits, matchingInterests, goalHits };
  });

  const byScore = (a: (typeof scored)[number], b: (typeof scored)[number]) =>
    b.score - a.score || a.career.title.localeCompare(b.career.title);

  const selected: CatalogCareer[] = [];
  const selectedIds = new Set<string>();
  const familyCounts = new Map<string, number>();

  // Prevent one title family (e.g. many kinds of supervisors) from
  // filling the shortlist. This is a soft limit, relaxed if needed.
  const familyOf = (title: string) =>
    title.toLowerCase().replace(/[^a-z ]/g, ' ').trim().split(/\s+/).slice(0, 2).join(' ');

  const add = (item: (typeof scored)[number], enforceFamily = true) => {
    const id = item.career.id;
    const family = familyOf(item.career.title);
    if (selectedIds.has(id) || selected.length >= DETAIL_LIMIT) return false;
    if (enforceFamily && (familyCounts.get(family) ?? 0) >= 2) return false;
    selected.push(item.career);
    selectedIds.add(id);
    familyCounts.set(family, (familyCounts.get(family) ?? 0) + 1);
    return true;
  };

  // Reserve a small portion for exploration beyond the selected topics.
  const explorationSlots = Math.min(6, Math.floor(DETAIL_LIMIT / 6));
  const mainLimit = Math.min(catalog.length, DETAIL_LIMIT - explorationSlots);

  // Round-robin across the user's selected interests instead of allowing
  // the broadest keyword list to dominate the entire candidate shortlist.
  const pools = interests.map((_, index) =>
    scored.filter((item) => item.interestHits[index] > 0).sort(byScore)
  );
  const offsets = pools.map(() => 0);
  let progressed = true;
  while (selected.length < mainLimit && progressed) {
    progressed = false;
    for (let i = 0; i < pools.length && selected.length < mainLimit; i++) {
      while (offsets[i] < pools[i].length) {
        const item = pools[i][offsets[i]++];
        if (add(item)) {
          progressed = true;
          break;
        }
      }
    }
  }

  // Fill remaining main slots with strong cross-interest or goal matches.
  const coreMatches = scored
    .filter((item) => item.matchingInterests > 0 || item.goalHits > 0)
    .sort(byScore);
  for (const item of coreMatches) {
    if (selected.length >= mainLimit) break;
    add(item);
  }

  // Exploratory occupations: distribute across other topic areas rather
  // than taking the first alphabetically named occupations in O*NET.
  const otherTopics = Object.keys(TOPIC_TERMS).filter(
    (label) => !interests.includes(label)
  );
  const exploratoryPools = otherTopics.map((label) =>
    scored
      .filter((item) =>
        (TOPIC_TERMS[label] ?? []).some((term) =>
          item.career.title.toLowerCase().includes(term)
        )
      )
      .sort(byScore)
  );
  const explorationStart = selected.length;
  let round = 0;
  while (selected.length < Math.min(DETAIL_LIMIT, explorationStart + explorationSlots)) {
    let addedInRound = false;
    for (const pool of exploratoryPools) {
      if (selected.length >= Math.min(DETAIL_LIMIT, explorationStart + explorationSlots)) break;
      if (pool[round] && add(pool[round])) addedInRound = true;
    }
    round++;
    if (!addedInRound && round > Math.max(0, ...exploratoryPools.map((p) => p.length))) break;
  }

  // Always fill the available detail budget, even for sparse profiles.
  for (const item of [...scored].sort(byScore)) {
    if (selected.length >= Math.min(DETAIL_LIMIT, catalog.length)) break;
    add(item);
  }
  for (const item of [...scored].sort(byScore)) {
    if (selected.length >= Math.min(DETAIL_LIMIT, catalog.length)) break;
    add(item, false);
  }

  return selected;
}
