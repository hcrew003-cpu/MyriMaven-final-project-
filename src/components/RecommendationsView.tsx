
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useCareer } from '../context/CareerContext';
import type { OnetCareer } from '../context/CareerContext';
import { calculateOnetMatch } from '../lib/onetMatching';
import {
  Sliders,
  BarChart3,
  Bookmark,
  ChevronRight,
  RefreshCw,
  Search,
} from 'lucide-react';

type Filter = 'all' | 'high' | 'creative' | 'business' | 'tech';

type SearchOccupation = {
  id: string;
  title: string;
};

type RankedCareer = {
  career: OnetCareer;
  match: ReturnType<typeof calculateOnetMatch>;
};

const SEARCH_TERMS = [
  'management',
  'business',
  'technology',
  'healthcare',
  'education',
  'design',
  'engineering',
  'science',
  'finance',
  'social services',
];

const MAX_CANDIDATES = 24;

function extractOccupations(data: unknown): SearchOccupation[] {
  if (!data || typeof data !== 'object') return [];

  const object = data as Record<string, unknown>;

  const possibleLists = [
    object.occupation,
    object.occupations,
    object.results,
    object.careers,
    object.items,
    object.matches,
  ];

  const list = possibleLists.find(Array.isArray);

  if (!Array.isArray(list)) return [];

  return list
    .map((item): SearchOccupation | null => {
      if (!item || typeof item !== 'object') return null;

      const record = item as Record<string, unknown>;

      const id =
        typeof record.code === 'string'
          ? record.code
          : typeof record.id === 'string'
            ? record.id
            : null;

      const title =
        typeof record.title === 'string'
          ? record.title
          : typeof record.name === 'string'
            ? record.name
            : null;

      if (!id || !title) return null;

      if (!/^\d{2}-\d{4}\.\d{2}$/.test(id)) return null;

      return { id, title };
    })
    .filter((item): item is SearchOccupation => item !== null);
}

function matchesFilter(title: string, filter: Filter): boolean {
  const value = title.toLowerCase();

  if (filter === 'creative') {
    return /design|artist|writer|media|advertis|creative|architect/.test(
      value
    );
  }

  if (filter === 'business') {
    return /manager|business|market|sales|finance|account|human resources|executive/.test(
      value
    );
  }

  if (filter === 'tech') {
    return /software|computer|information technology|data|cyber|network|web developer/.test(
      value
    );
  }

  return true;
}

export default function RecommendationsView() {
  const {
    userProfile,
    setActiveView,
    setSelectedCareerId,
    compareCareerIds,
    toggleSaveCareer,
    isSaved,
    toggleCompareCareer,
    isComparing,
  } = useCareer();

  const [activeFilter, setActiveFilter] = useState<Filter>('all');
  const [careers, setCareers] = useState<OnetCareer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadCareers() {
      setLoading(true);
      setError('');
      setCareers([]);

      try {
        const searchResults = await Promise.allSettled(
          SEARCH_TERMS.map(async (term) => {
            const response = await fetch(
              `/api/onet?keyword=${encodeURIComponent(term)}`
            );

            if (!response.ok) {
              throw new Error(`O*NET search failed: ${term}`);
            }

            return extractOccupations(await response.json());
          })
        );

        const unique = new Map<string, SearchOccupation>();

        // Round-robin across subjects so the initial candidate
        // pool is not dominated by one search term.
        const groups = searchResults
          .filter(
            (
              result
            ): result is PromiseFulfilledResult<SearchOccupation[]> =>
              result.status === 'fulfilled'
          )
          .map((result) => result.value);

        const longest = Math.max(0, ...groups.map((g) => g.length));

        for (let index = 0; index < longest; index++) {
          for (const group of groups) {
            const occupation = group[index];

            if (occupation) {
              unique.set(occupation.id, occupation);
            }

            if (unique.size >= MAX_CANDIDATES) break;
          }

          if (unique.size >= MAX_CANDIDATES) break;
        }

        const candidates = [...unique.values()];

        if (candidates.length === 0) {
          throw new Error(
            'No O*NET occupations were returned. Check the search API.'
          );
        }

        const detailedCareers: OnetCareer[] = [];

        // Fetch a few occupations at a time.
        for (let index = 0; index < candidates.length; index += 3) {
          if (cancelled) return;

          const batch = candidates.slice(index, index + 3);

          const results = await Promise.allSettled(
            batch.map(async (occupation) => {
              const response = await fetch(
                `/api/onet/occupation?code=${encodeURIComponent(
                  occupation.id
                )}`
              );

              if (!response.ok) {
                throw new Error(
                  `Unable to load ${occupation.title}`
                );
              }

              const data = (await response.json()) as OnetCareer;

              if (!data || !data.id || !data.title) {
                throw new Error('Invalid occupation response');
              }

              return data;
            })
          );

          for (const result of results) {
            if (result.status === 'fulfilled') {
              detailedCareers.push(result.value);
            }
          }

          if (!cancelled) {
            setCareers([...detailedCareers]);
          }
        }

        if (detailedCareers.length === 0) {
          throw new Error(
            'O*NET occupations were found, but their details could not be loaded.'
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load recommendations.'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadCareers();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const rankedCareers = useMemo<RankedCareer[]>(() => {
    return careers
      .map((career) => ({
        career,
        match: calculateOnetMatch(career, userProfile),
      }))
      .sort((a, b) => {
        // Prefer better-supported estimates when scores tie.
        if (b.match.score !== a.match.score) {
          return b.match.score - a.match.score;
        }

        const confidenceRank = {
          strong: 3,
          moderate: 2,
          limited: 1,
        };

        return (
          confidenceRank[b.match.confidence] -
          confidenceRank[a.match.confidence]
        );
      });
  }, [careers, userProfile]);

  const filteredCareers = rankedCareers.filter(({ career, match }) => {
    if (activeFilter === 'high') {
      return match.score >= 90 &&
        match.confidence !== 'limited';
    }

    return matchesFilter(career.title, activeFilter);
  });

  const filters: { id: Filter; label: string }[] = [
    { id: 'all', label: `All Matches (${rankedCareers.length})` },
    { id: 'high', label: 'Top Matches (90%+)' },
    { id: 'creative', label: 'Creative & Design' },
    { id: 'business', label: 'Business & Leadership' },
    { id: 'tech', label: 'Technology' },
  ];

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        <div style={{ marginBottom: '32px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: 'var(--primary)',
                  textTransform: 'uppercase',
                }}
              >
                Your Personalized Match Report
              </span>

              <h1
                style={{
                  fontSize: '2.4rem',
                  fontWeight: 800,
                  color: 'var(--dark-slate)',
                  marginTop: '4px',
                }}
              >
                Careers Matched to You
              </h1>

              <p
                style={{
                  color: 'var(--text-muted)',
                  fontSize: '1.05rem',
                  marginTop: '8px',
                  maxWidth: '780px',
                }}
              >
                Explore real O*NET occupations ranked using your
                interests, self-rated skills, and available career
                information.
              </p>

              <p
                style={{
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem',
                  marginTop: '8px',
                }}
              >
                Match scores are experimental estimates, not
                predictions of career success. Results are ranked
                from a sampled set of occupations.
              </p>
            </div>

            <div
              style={{
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              <button
                onClick={() => setActiveView('what-if')}
                className="btn-secondary"
                style={{ fontSize: '0.9rem' }}
              >
                <Sliders size={16} />
                Test in What-If Sandbox
              </button>

              <button
                onClick={() => setActiveView('compare')}
                className="btn-primary"
                style={{ fontSize: '0.9rem' }}
              >
                <BarChart3 size={16} />
                Compare Selected ({compareCareerIds.length})
              </button>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '8px',
              marginTop: '24px',
              flexWrap: 'wrap',
            }}
          >
            {filters.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`tag-chip ${
                  activeFilter === tab.id ? 'active' : ''
                }`}
                style={{
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  backgroundColor:
                    activeFilter === tab.id
                      ? 'var(--primary)'
                      : 'white',
                  color:
                    activeFilter === tab.id
                      ? 'white'
                      : 'var(--dark-slate)',
                  border:
                    '1px solid ' +
                    (activeFilter === tab.id
                      ? 'var(--primary)'
                      : 'var(--border-strong)'),
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
            Loading O*NET occupations and calculating matches...
            {careers.length > 0
              ? ` ${careers.length} occupations loaded.`
              : ''}
          </p>
        )}

        {error && (
          <div className="card" style={{ marginBottom: '24px' }}>
            <h2>Unable to load career recommendations</h2>
            <p style={{ marginTop: '12px' }}>{error}</p>
            <button
              className="btn-primary"
              style={{ marginTop: '16px' }}
              onClick={() => setReloadKey((value) => value + 1)}
            >
              <RefreshCw size={16} />
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <p
            style={{
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
              marginBottom: '20px',
            }}
          >
            Showing {filteredCareers.length} of{' '}
            {rankedCareers.length} O*NET occupations evaluated.
          </p>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
            gap: '24px',
          }}
        >
          {filteredCareers.map(({ career, match }) => {
            const saved = isSaved(career.id);
            const comparing = isComparing(career.id);

            return (
              <div key={career.id} className="career-card">
                <div>
                  <div className="career-card-header">
                    <span className="career-category">
                      O*NET Occupation
                    </span>

                    <span
                      className={`match-badge ${
                        match.score >= 80
                          ? 'match-high'
                          : 'match-med'
                      }`}
                    >
                      {match.score}% Estimated Match
                    </span>
                  </div>

                  <h2
                    className="career-title"
                    style={{ fontSize: '1.35rem' }}
                  >
                    {career.title}
                  </h2>

                  <p className="career-desc">
                    {career.description ||
                      'Explore this occupation to learn about its responsibilities and required skills.'}
                  </p>

                  <div className="fit-box">
                    <strong>Why this may fit:</strong>{' '}
                    {match.reasons[0] ??
                      'Not enough matching evidence yet. Review the full profile for details.'}
                  </div>

                  <div className="watchout-box">
                    <strong>What to consider:</strong>{' '}
                    {match.considerations[0] ??
                      (match.skillsToDevelop.length > 0
                        ? `You may want to develop your ${match.skillsToDevelop
                            .slice(0, 2)
                            .join(' and ')} skills.`
                        : 'Review the daily tasks and education requirements to assess your fit.')}
                  </div>

                  <div className="tags-row">
                    <span className="badge-tag">
                      Evidence: {match.confidence}
                    </span>
                    <span className="badge-tag">
                      O*NET {career.id}
                    </span>
                  </div>
                </div>

                <div className="card-actions">
                  <div
                    style={{
                      display: 'flex',
                      gap: '8px',
                    }}
                  >
                    <button
                      onClick={() => toggleSaveCareer(career.id)}
                      className={`btn-secondary btn-sm ${
                        saved ? 'tag-active' : ''
                      }`}
                    >
                      <Bookmark
                        size={14}
                        style={{
                          fill: saved
                            ? 'var(--primary)'
                            : 'none',
                        }}
                      />
                      {saved ? 'Saved' : 'Save'}
                    </button>

                    <button
                      onClick={() => toggleCompareCareer(career.id)}
                      className={`btn-secondary btn-sm ${
                        comparing ? 'tag-active' : ''
                      }`}
                    >
                      <BarChart3 size={14} />
                      {comparing ? 'In Compare' : 'Compare'}
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedCareerId(career.id);
                      setActiveView('detail');
                    }}
                    className="btn-primary btn-sm"
                  >
                    Full Profile
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {!loading && !error && filteredCareers.length === 0 && (
          <div
            className="card"
            style={{
              textAlign: 'center',
              padding: '40px',
            }}
          >
            <Search size={28} style={{ marginBottom: '12px' }} />
            <h2>No careers match this filter</h2>
            <p style={{ marginTop: '8px' }}>
              Try All Matches to see the available O*NET
              recommendations.
            </p>
            <button
              className="btn-primary"
              style={{ marginTop: '16px' }}
              onClick={() => setActiveFilter('all')}
            >
              Show All Matches
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
