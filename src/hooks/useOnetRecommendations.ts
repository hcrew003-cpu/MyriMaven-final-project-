
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useCareer } from '../context/CareerContext';
import type { OnetCareer } from '../context/CareerContext';
import { calculateOnetMatch } from '../lib/onetMatching';
import {
  selectOnetCandidates,
} from '../lib/onetRecommendations';
import type {
  CatalogCareer,
} from '../lib/onetRecommendations';

export type RankedOnetCareer = {
  career: OnetCareer;
  match: ReturnType<typeof calculateOnetMatch>;
};

// Shared cache survives navigation between app views.
let catalogCache: CatalogCareer[] | null = null;
const detailCache = new Map<string, OnetCareer>();

let catalogRequest: Promise<CatalogCareer[]> | null = null;
const detailRequests = new Map<string, Promise<OnetCareer>>();

async function fetchCatalog(): Promise<CatalogCareer[]> {
  if (catalogCache !== null) return catalogCache;

  if (!catalogRequest) {
    catalogRequest = fetch('/api/onet/catalog')
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Unable to retrieve the O*NET catalog.');
        }

        const data = await response.json();

        if (!Array.isArray(data.careers)) {
          throw new Error('Invalid O*NET catalog response.');
        }

        catalogCache = data.careers as CatalogCareer[];
        return catalogCache;
      })
      .finally(() => {
        catalogRequest = null;
      });
  }

  return catalogRequest;
}

async function fetchOccupation(id: string): Promise<OnetCareer> {
  const cached = detailCache.get(id);
  if (cached) return cached;

  const pending = detailRequests.get(id);
  if (pending) return pending;

  const request = fetch(
    `/api/onet/occupation?code=${encodeURIComponent(id)}`
  )
    .then(async (response) => {
      if (!response.ok) {
        throw new Error('Occupation details unavailable.');
      }

      const career = (await response.json()) as OnetCareer;

      if (!career.id || !career.title) {
        throw new Error('Invalid occupation details.');
      }

      detailCache.set(id, career);
      return career;
    })
    .finally(() => {
      detailRequests.delete(id);
    });

  detailRequests.set(id, request);
  return request;
}

export function useOnetRecommendations() {
  const { userProfile } = useCareer();

  const [catalog, setCatalog] = useState<CatalogCareer[]>(
    () => catalogCache ?? []
  );
  const [careers, setCareers] = useState<OnetCareer[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(
    () => catalogCache === null
  );
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setLoadingCatalog(true);
    setError('');

    fetchCatalog()
      .then((result) => {
        if (!cancelled) setCatalog(result);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load careers.'
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingCatalog(false);
      });

    return () => {
      cancelled = true;
    };
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


  const candidateKey = candidates
    .map((career) => career.id)
    .join(',');

  useEffect(() => {
    let cancelled = false;

    if (!candidateKey) {
      setCareers([]);
      setLoadingDetails(false);
      return;
    }

    const ids = candidateKey.split(',');

    setCareers(
      ids
        .map((id) => detailCache.get(id))
        .filter((career): career is OnetCareer => Boolean(career))
    );

    setLoadingDetails(true);

    async function load() {
      const loaded = new Map<string, OnetCareer>();

      for (let i = 0; i < ids.length && !cancelled; i += 4) {
        const batch = await Promise.allSettled(
          ids.slice(i, i + 4).map(fetchOccupation)
        );

        if (cancelled) return;

        for (const result of batch) {
          if (result.status === 'fulfilled') {
            loaded.set(result.value.id, result.value);
          }
        }

        setCareers(
          ids
            .map((id) => loaded.get(id) ?? detailCache.get(id))
            .filter(
              (career): career is OnetCareer => Boolean(career)
            )
        );
      }

      if (!cancelled) setLoadingDetails(false);
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [candidateKey]);

  const rankedCareers = useMemo<RankedOnetCareer[]>(
    () =>
      careers
        .map((career) => ({
          career,
          match: calculateOnetMatch(career, userProfile),
        }))
        .sort((a, b) => b.match.score - a.match.score),
    [careers, userProfile]
  );

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
