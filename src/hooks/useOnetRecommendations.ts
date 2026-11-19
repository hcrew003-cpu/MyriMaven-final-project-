'use client';

import { useEffect, useMemo, useState } from 'react';
import { useCareer } from '../context/CareerContext';
import type { OnetCareer } from '../context/CareerContext';
import { calculateOnetMatch } from '../lib/onetMatching';
import type { UserProfile } from '../types/career';
import { selectOnetCandidates, getCareerBackgroundRelevance } from '../lib/onetRecommendations';
import type { CatalogCareer } from '../lib/onetRecommendations';

export type RankedOnetCareer = {
  career: OnetCareer;
  match: ReturnType<typeof calculateOnetMatch>;
  background: ReturnType<typeof getCareerBackgroundRelevance>;
  rankingScore: number;
};

// Shared caches survive navigation between app views.
let catalogCache: CatalogCareer[] | null = null;
const detailCache = new Map<string, OnetCareer>();
let catalogRequest: Promise<CatalogCareer[]> | null = null;
const detailRequests = new Map<string, Promise<OnetCareer>>();

// Keep concurrency bounded. Each occupation API route makes several
// upstream O*NET calls, so avoid launching dozens of occupations at once.
const CONCURRENT_OCCUPATIONS = 3;

async function fetchCatalog(): Promise<CatalogCareer[]> {
  if (catalogCache !== null) return catalogCache;

  if (!catalogRequest) {
    catalogRequest = fetch('/api/onet/catalog')
      .then(async (response) => {
        if (!response.ok) throw new Error('Unable to retrieve the O*NET catalog.');
        const data = await response.json();
        if (!Array.isArray(data.careers)) {
          throw new Error('Invalid O*NET catalog response.');
        }
        catalogCache = data.careers as CatalogCareer[];
        return catalogCache;
      })
      .finally(() => { catalogRequest = null; });
  }

  return catalogRequest;
}

async function fetchOccupation(id: string): Promise<OnetCareer> {
  const cached = detailCache.get(id);
  if (cached) return cached;

  const pending = detailRequests.get(id);
  if (pending) return pending;

  const request = fetch(`/api/onet/occupation?code=${encodeURIComponent(id)}`)
    .then(async (response) => {
      if (!response.ok) throw new Error('Occupation details unavailable.');
      const career = (await response.json()) as OnetCareer;
      if (!career.id || !career.title) {
        throw new Error('Invalid occupation details.');
      }
      detailCache.set(id, career);
      return career;
    })
    .finally(() => { detailRequests.delete(id); });

  detailRequests.set(id, request);
  return request;
}

export function useOnetRecommendations(profileOverride?: UserProfile) {
  const { userProfile: savedProfile } = useCareer();
  const userProfile = profileOverride ?? savedProfile;
  const [catalog, setCatalog] = useState<CatalogCareer[]>(() => catalogCache ?? []);
  const [careers, setCareers] = useState<OnetCareer[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(() => catalogCache === null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoadingCatalog(true);
    setError('');

    fetchCatalog()
      .then((result) => { if (!cancelled) setCatalog(result); })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load careers.');
        }
      })
      .finally(() => { if (!cancelled) setLoadingCatalog(false); });

    return () => { cancelled = true; };
  }, [reloadKey]);

  const candidates = useMemo(
    () => selectOnetCandidates(catalog, userProfile),
    [
      catalog,
      userProfile.interests,
      userProfile.goals,
      userProfile.useCareerBackground,
      userProfile.major,
      userProfile.minor,
      userProfile.completedDegree,
      userProfile.currentCareer,
    ]
  );

  const candidateKey = candidates.map((career) => career.id).join(',');

  useEffect(() => {
    let cancelled = false;
    if (!candidateKey) {
      setCareers([]);
      setLoadingDetails(false);
      return;
    }

    setError('');
    const ids = candidateKey.split(',');
    const loaded = new Map<string, OnetCareer>();
    for (const id of ids) {
      const cached = detailCache.get(id);
      if (cached) loaded.set(id, cached);
    }

    const publish = () => {
      if (!cancelled) {
        setCareers(ids.flatMap((id) => {
          const career = loaded.get(id);
          return career ? [career] : [];
        }));
      }
    };
    publish();

    const missingIds = ids.filter((id) => !loaded.has(id));
    if (missingIds.length === 0) {
      setLoadingDetails(false);
      return () => { cancelled = true; };
    }

    setLoadingDetails(true);
    let cursor = 0;

    async function worker() {
      while (!cancelled && cursor < missingIds.length) {
        const id = missingIds[cursor++];
        try {
          const career = await fetchOccupation(id);
          if (cancelled) return;
          loaded.set(id, career);
          publish();
        } catch {
          // A failed occupation should not block the other results.
        }
      }
    }

    void Promise.all(
      Array.from(
        { length: Math.min(CONCURRENT_OCCUPATIONS, missingIds.length) },
        () => worker()
      )
    ).finally(() => {
      if (!cancelled) {
        setLoadingDetails(false);
        if (loaded.size < ids.length) setError(`Loaded ${loaded.size} of ${ids.length} selected occupations. Retry to load missing details.`);
      }
    });

    return () => { cancelled = true; };
  }, [candidateKey, reloadKey]);

  const rankedCareers = useMemo<RankedOnetCareer[]>(() => careers.map(career => {
    const match = calculateOnetMatch(career, userProfile);
    const background = getCareerBackgroundRelevance(career, userProfile);
    return { career, match, background, rankingScore: match.score + background.strength * 8 };
  }).sort((a, b) => b.rankingScore - a.rankingScore || b.match.score - a.match.score), [careers, userProfile]);

  return {
    catalog,
    careers,
    rankedCareers,
    loadingCatalog,
    loadingDetails,
    error,
    reload: () => {
      catalogCache = null;
      setReloadKey((value) => value + 1);
    },
  };
}
