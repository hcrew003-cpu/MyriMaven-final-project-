
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


export function selectOnetCandidates(
  catalog: CatalogCareer[],
  profile: UserProfile
): CatalogCareer[] {
  const interests = profile.interests ?? [];
  const goals = profile.goals ?? [];

  const words = [...interests, ...goals].flatMap(
    (label) => TOPIC_TERMS[label] ?? []
  );

  const ranked = catalog
    .map((career) => {
      const title = career.title.toLowerCase();

      const hits = words.filter((term) =>
        title.includes(term)
      ).length;

      return { career, hits };
    })
    .sort(
      (a, b) =>
        b.hits - a.hits ||
        a.career.title.localeCompare(b.career.title)
    );

  const relevant = ranked
    .filter(({ hits }) => hits > 0)
    .map(({ career }) => career);

  const others = ranked
    .filter(({ hits }) => hits === 0)
    .map(({ career }) => career);

  const selected: CatalogCareer[] = [];
  let i = 0;

  while (
    selected.length < DETAIL_LIMIT &&
    (i < relevant.length || i < others.length)
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

    if (
      others[i] &&
      selected.length < DETAIL_LIMIT
    ) {
      selected.push(others[i]);
    }

    i++;
  }

  return selected;
}
