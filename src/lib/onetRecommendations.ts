
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
    'information', 'cyber', 'technology', 'web',
  ],
  Business: [
    'business', 'manager', 'management',
    'marketing', 'finance', 'account',
    'sales', 'operations',
  ],
  'Helping People': [
    'counsel', 'social', 'therap',
    'health', 'care', 'teacher',
    'advisor', 'service',
  ],
  Creativity: [
    'design', 'artist', 'writer',
    'media', 'advertis', 'creative', 'architect',
  ],
  Environment: [
    'environment', 'ecolog', 'conservation',
    'agricultur', 'forestry', 'wildlife',
  ],
  'Problem Solving': [
    'analyst', 'engineer', 'scientist',
    'technician', 'research', 'investigator',
  ],
  Leadership: [
    'manager', 'director', 'executive',
    'supervisor', 'administrator',
  ],
  'Working with Data': [
    'data', 'statistic', 'analyst',
    'research', 'actuar', 'financial',
  ],
  Communication: [
    'public relations', 'writer', 'reporter',
    'marketing', 'teacher', 'communications',
  ],
  'Working with Children': [
    'child', 'school', 'teacher',
    'education', 'pediatric', 'youth',
  ],
  Healthcare: [
    'medical', 'nurs', 'health',
    'patient', 'physician', 'therap', 'clinical',
  ],
  Entrepreneurship: [
    'business', 'manager', 'marketing',
    'sales', 'product', 'executive',
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
