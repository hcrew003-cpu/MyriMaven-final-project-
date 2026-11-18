
import type { UserProfile } from '../types/career';

export type CatalogCareer = {
  id: string;
  title: string;
  datalevel: boolean;
  jobZone: string | null;
};

export const DETAIL_LIMIT = 100;


const TOPIC_TERMS: Record<string, string[]> = {
  Technology: [
    'informatics', 'software quality', 'information systems',
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
    'business intelligence', 'recruit', 'human resources specialist',
    'buyer', 'procurement', 'financial analyst', 'credit analyst',
    'insurance', 'compliance', 'fundrais', 'event planner', 'cost estimator',
  ],

  'Helping People': [
    'case worker', 'community health worker', 'human resources specialist', 'training and development specialist', 'social and community service manager', 'health education specialist', 'rehabilitation counselor', 'patient advocate',
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
    'copywriter', 'set designer', 'technical writer',
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
    'conservation scientist', 'environmental economist', 'environmental engineer',
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
    'management analyst', 'compliance officer', 'quality control analyst', 'psycholog', 'counsel', 'market research', 'social and community service manager',
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
    'training and development specialist', 'project management specialist',
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
    'operations research analyst', 'survey researcher', 'business intelligence analyst',
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
    'public relations specialist', 'human resources specialist', 'fundraiser',
    'public relations', 'writer', 'reporter', 'counsel', 'psycholog', 'training and development', 'human resources', 'market research',
    'marketing', 'teacher', 'communications specialist', 'communications manager', 'communications teachers',
    'journalist', 'editor', 'interpreter',
    'translator', 'broadcast',
    'media relations', 'public affairs',
    'fundraising', 'recruiter',
    'training and development specialist', 'training specialist', 'speech',
    'advertising', 'announcer',
    'technical writer', 'customer relations',
    'community outreach',
  ],

  'Working with Children': [
    'childcare worker', 'school psychologist', 'speech language pathologist',
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
    'health information', 'medical records', 'health education specialist',
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
    'market research analyst', 'fundraiser', 'buyer', 'project management specialist',
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
  business: ['business', 'management analyst', 'marketing', 'sales', 'financial', 'account', 'human resources', 'procurement', 'logistics', 'project management', 'budget', 'auditor', 'compliance', 'administrative services'],
  management: ['management analyst', 'human resources', 'training and development', 'project management', 'logistics', 'procurement', 'administrative services', 'general manager', 'operations manager', 'business', 'community service manager'],
  entrepreneurship: ['business development', 'market research', 'marketing', 'sales', 'fundrais', 'project management', 'buyer', 'advertis', 'public relations', 'event planner', 'management analyst', 'business'],
  finance: ['financial', 'finance', 'account', 'budget', 'investment', 'auditor', 'credit analyst'],
  accounting: ['account', 'auditor', 'financial', 'tax', 'budget'],
  marketing: ['marketing', 'advertis', 'market research', 'public relations', 'brand', 'sales'],
  psychology: ['psycholog', 'counsel', 'behavior', 'mental health', 'human resources', 'social work'],
  education: ['teacher', 'education', 'school', 'instructor', 'training', 'curriculum'],
  engineering: ['engineer', 'manufacturing', 'industrial design', 'engineering technician'],
  computer: ['software', 'computer', 'developer', 'programmer', 'database', 'information systems'],
  nursing: ['nurs', 'patient care', 'clinical', 'medical'],
  healthcare: ['health', 'medical', 'clinical', 'patient care'],
  environmental: ['environment', 'conservation', 'ecolog', 'sustainab', 'natural resource', 'hydrolog', 'wildlife'],
  communication: ['communications specialist', 'communications manager', 'communications teachers', 'public relations', 'writer', 'media', 'marketing'],
  design: ['design', 'creative', 'graphic', 'architect', 'artist'],
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
    if (word.length >= 5 && !ignored.has(word) && !GENERIC.has(word) && !BACKGROUND_TERMS[word]) {
      terms.add(word);
    }
  }

  return [...terms];
}

// Title-based discovery proxies only. Detailed matching still uses O*NET evidence.
const SKILL_TERMS: Record<string, string[]> = {
  Communication: ['public relations', 'writer', 'public affairs', 'counsel', 'recruit', 'sales', 'training specialist', 'fundrais'],
  Leadership: ['project management', 'training specialist', 'manager', 'supervisor', 'director', 'coordinator'],
  Organization: ['logistics', 'planner', 'project management', 'administrative', 'procurement', 'event planner', 'scheduler'],
  'Problem Solving': ['analyst', 'engineer', 'research', 'consultant', 'investigator', 'technician'],
  Research: ['research', 'scientist', 'economist', 'epidemiolog', 'survey', 'market research'],
  Creativity: ['design', 'writer', 'artist', 'advertis', 'editor', 'producer', 'architect'],
  Teamwork: ['coordinator', 'community', 'human resources', 'project management', 'social work', 'healthcare'],
  'Analytical Thinking': ['analyst', 'statistic', 'account', 'economist', 'data', 'research', 'auditor'],
};
const GOAL_TERMS: Record<string, string[]> = {
  leadership: TOPIC_TERMS.Leadership,
  helpingothers: TOPIC_TERMS['Helping People'],
  creativity: TOPIC_TERMS.Creativity,
  creativeexpression: TOPIC_TERMS.Creativity,
  makinganimpact: ['community', 'public health', 'conservation', 'social service', 'fundrais', 'policy'],
  impact: ['community', 'public health', 'conservation', 'social service', 'fundrais', 'policy'],
};
const GENERIC = new Set(['manager', 'management', 'director', 'supervisor', 'administrator', 'executive', 'operations', 'teacher', 'analyst', 'research', 'coordinator', 'care', 'systems', 'product', 'project', 'scientist', 'technician', 'engineer', 'support specialist', 'health', 'education', 'community', 'technology', 'testing', 'consultant', 'advisor', 'family', 'specialist', 'communications', 'digital', 'media']);
function titleStrength(title: string, terms: string[]): number {
  return terms.reduce((best, term) => {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const hit = new RegExp(`\\b${escaped}\\w*`, 'i').test(title);
    return Math.max(best, hit ? (GENERIC.has(term) ? 0.2 : 1) : 0);
  }, 0);
}

/**
 * Separate title-based background signal, not a compatibility percentage.
 * Only strong, field-specific title connections receive a ranking boost.
 */
export function getCareerBackgroundRelevance(
  career: { title: string },
  profile: UserProfile
): { strength: number; matchedTerms: string[] } {
  const terms = getBackgroundTerms(profile).filter(term => !GENERIC.has(term));
  const matchedTerms = terms.filter(term => titleStrength(career.title, [term]) === 1);
  return {
    strength: matchedTerms.length ? 1 : 0,
    matchedTerms,
  };
}

/** Discovery scores are not compatibility percentages. */
export function selectOnetCandidates(catalog: CatalogCareer[], profile: UserProfile): CatalogCareer[] {
  const interests = [...new Set(profile.interests ?? [])].filter(label => TOPIC_TERMS[label]);
  const skills = Object.entries(profile.skills ?? {}).filter(([name, rating]) => SKILL_TERMS[name] && typeof rating === 'number' && rating >= 4);
  const goals = [...new Set((profile.goals ?? []).map(goal => goal.toLowerCase().replace(/[^a-z]/g, '')))].filter(goal => GOAL_TERMS[goal]);
  const backgroundTerms = getBackgroundTerms(profile);
  const mean = (values: number[]) => values.length ? values.reduce((a,b) => a+b,0)/values.length : 0;
  const scored = catalog.map(career => {
    const title = career.title.toLowerCase();
    const interestHits = interests.map(label => titleStrength(title, TOPIC_TERMS[label]));
    const skillHits = skills.map(([name, rating]) => titleStrength(title, SKILL_TERMS[name]) * Number(rating)/5);
    const goalHits = goals.map(goal => titleStrength(title, GOAL_TERMS[goal]));
    const background = getCareerBackgroundRelevance(career, profile).strength;
    const strength = (hits: number[]) => 0.6 * Math.max(0,...hits) + 0.4 * mean(hits);
    const score = 5 * strength(interestHits) + 2 * strength(skillHits) + 2 * strength(goalHits) + 1.5 * background;
    return { career, score, interestHits, skillHits, goalHits, background };
  });
  type Item = (typeof scored)[number];
  const byScore = (a: Item,b: Item) => b.score-a.score || a.career.title.localeCompare(b.career.title);
  const ranked = [...scored].sort(byScore);
  const selected: CatalogCareer[] = [];
  const ids = new Set<string>();
  const groups = new Map<string,number>();
  const families = new Map<string,number>();
  const add = (item: Item, limit: number, diverse = true) => {
    const {career} = item;
    const group = career.id.split('-')[0];
    const family = career.title.toLowerCase().replace(/[^a-z ]/g,' ').trim().split(/\s+/).slice(0,2).join(' ');
    if (ids.has(career.id) || selected.length >= limit) return false;
    if (diverse && ((groups.get(group) ?? 0) >= Math.ceil(DETAIL_LIMIT * 0.13) || (families.get(family) ?? 0) >= 2)) return false;
    selected.push(career); ids.add(career.id);
    groups.set(group,(groups.get(group) ?? 0)+1);
    families.set(family,(families.get(family) ?? 0)+1);
    return true;
  };
  const roundRobin = (pools: Item[][], limit: number) => {
    const offsets = pools.map(() => 0);
    let progress = true;
    while (progress && selected.length < limit) {
      progress = false;
      pools.forEach((pool,i) => {
        while (selected.length < limit && offsets[i] < pool.length) {
          if (add(pool[offsets[i]++],limit)) { progress = true; break; }
        }
      });
    }
  };
  const limit = Math.min(DETAIL_LIMIT,catalog.length);
  const mainLimit = Math.max(0,limit-Math.floor(limit/10));
  const pools = [
    ...interests.map((_,i) => ranked.filter(item => item.interestHits[i]>=0.5)),
    ...skills.map((_,i) => ranked.filter(item => item.skillHits[i]>=0.5)),
    ...goals.map((_,i) => ranked.filter(item => item.goalHits[i]>=0.5)),
    ...(backgroundTerms.length ? [ranked.filter(item => item.background>0)] : []),
  ];
  // Reserve up to eight slots for background-connected occupations that
  // also have an interest, skill or goal connection. Do not force a quota.
  if (backgroundTerms.length) {
    const connected = ranked.filter(item =>
      item.background > 0 &&
      [...item.interestHits, ...item.skillHits, ...item.goalHits].some(hit => hit >= 0.5)
    );
    const reservedLimit = Math.min(mainLimit, 8);
    for (const item of connected) add(item, reservedLimit);
  }
  roundRobin(pools,mainLimit);
  for (const item of ranked) if (item.score>0) add(item,mainLimit);
  const exploration = Object.keys(TOPIC_TERMS).filter(label => !interests.includes(label)).map(label => ranked.filter(item => titleStrength(item.career.title,TOPIC_TERMS[label])>=0.5 && (item.interestHits.some(hit => hit >= 0.5) || item.goalHits.some(hit => hit >= 0.5) || item.skillHits.filter(hit => hit >= 0.5).length >= 2 || item.background > 0)));
  roundRobin(exploration,limit);
  for (const item of ranked) add(item,limit);
  for (const item of ranked) add(item,limit,false);
  return selected;
}
