
import type { UserProfile } from '../types/career';

export type CatalogCareer = {
  id: string;
  title: string;
  datalevel: boolean;
  jobZone: string | null;
};

export const DETAIL_LIMIT = 36;


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

export function selectOnetCandidates(
  catalog: CatalogCareer[],
  profile: UserProfile
): CatalogCareer[] {
  const interests = profile.interests ?? [];
  const goals = profile.goals ?? [];

  const interestTerms = [
    ...new Set(
      interests.flatMap((label) => TOPIC_TERMS[label] ?? [])
    ),
  ];

  const goalTerms = [
    ...new Set(
      goals.flatMap((label) => TOPIC_TERMS[label] ?? [])
    ),
  ];

  const backgroundTerms = getBackgroundTerms(profile);

  const ranked = catalog
    .map((career) => {
      const title = career.title.toLowerCase();

      const interestHits = interestTerms.filter((term) =>
        title.includes(term)
      ).length;

      const goalHits = goalTerms.filter((term) =>
        title.includes(term)
      ).length;

      const backgroundHits = backgroundTerms.filter((term) =>
        title.includes(term)
      ).length;

      // Interests remain the strongest discovery signal.
      // Background is only a small ranking influence.
      const score =
        interestHits * 3 +
        goalHits * 2 +
        Math.min(backgroundHits, 3) * 0.4;

      return {
        career,
        score,
        coreHits: interestHits + goalHits,
      };
    })
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.career.title.localeCompare(b.career.title)
    );

  // Prioritize careers supported by core interests/goals.
  const relevant = ranked
    .filter(({ coreHits }) => coreHits > 0)
    .map(({ career }) => career);

  // Keep exploration opportunities outside those interests.
  const others = ranked
    .filter(({ coreHits }) => coreHits === 0)
    .map(({ career }) => career);

  const selected: CatalogCareer[] = [];
  let i = 0;

  while (
    selected.length < DETAIL_LIMIT &&
    (i * 3 < relevant.length || i < others.length)
  ) {
    for (
      let j = 0;
      j < 3 &&
      i * 3 + j < relevant.length &&
      selected.length < DETAIL_LIMIT;
      j++
    ) {
      selected.push(relevant[i * 3 + j]);
    }

    if (others[i] && selected.length < DETAIL_LIMIT) {
      selected.push(others[i]);
    }

    i++;
  }

  return selected;
}
