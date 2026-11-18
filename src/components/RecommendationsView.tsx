
'use client';

import React, { useMemo } from 'react';
import { useCareer } from '../context/CareerContext';
import { useOnetRecommendations } from '../hooks/useOnetRecommendations';
import {
  GraduationCap,
  BarChart3,
  Bookmark,
  BookmarkCheck,
  ChevronRight,
  RefreshCw,
  Search,
  Sliders,
} from 'lucide-react';

type Filter = 'all' | 'creative' | 'business' | 'tech';

type ExplorationFilter = 'all' | 'best' | 'related' | 'unexpected';
const EXPLORATION_OPTIONS: [ExplorationFilter, string][] = [
  ['best', 'Best Matches'],
  ['related', 'Related Paths'],
  ['unexpected', 'Unexpected Possibilities'],
  ['all', 'All Recommendations'],
];
const EXPLORATION_DESCRIPTIONS: Record<ExplorationFilter, string> = {
  best: 'Your strongest available matches, balancing occupational alignment and overall compatibility. Review individual estimates and evidence before deciding.',
  related: 'Explore careers that build on your interests, strengths or enabled career background.',
  unexpected: 'Discover careers outside your leading occupational fields that still connect to your profile.',
  all: 'View every evaluated occupation, including those with limited matching evidence.',
};
const PAGE_SIZE = 30;

function categoryMatch(
  title: string,
  filter: Filter
): boolean {
  const value = title.toLowerCase();

  if (filter === 'creative') {
    return /design|artist|writer|media|advertis|creative|architect/.test(
      value
    );
  }

  if (filter === 'business') {
    return /manager|business|market|sales|financ|account|human resources|executive/.test(
      value
    );
  }

  if (filter === 'tech') {
    return /software|computer|information technology|data|cyber|network|web/.test(
      value
    );
  }

  return true;
}

export default function RecommendationsView() {
  const {
    userProfile,
    recommendationNavigation,
    setRecommendationNavigation,
    setActiveView,
    setSelectedCareerId,
    compareCareerIds,
    toggleSaveCareer,
    isSaved,
    toggleCompareCareer,
    isComparing,
  } = useCareer();

  const {
    catalog,
    careers,
    rankedCareers,
    loadingCatalog,
    loadingDetails,
    error,
    reload,
  } = useOnetRecommendations();

  const { mode, filter, explorationFilter, query, page } = recommendationNavigation;
  const setMode = (mode: 'recommended' | 'browse') => setRecommendationNavigation(prev => ({ ...prev, mode }));
  const setFilter = (filter: Filter) => setRecommendationNavigation(prev => ({ ...prev, filter }));
  const setExplorationFilter = (explorationFilter: ExplorationFilter) => setRecommendationNavigation(prev => ({ ...prev, explorationFilter }));
  const setQuery = (query: string) => setRecommendationNavigation(prev => ({ ...prev, query }));
  const setPage = (page: number | ((previous: number) => number)) => setRecommendationNavigation(prev => ({ ...prev, page: typeof page === 'function' ? page(prev.page) : page }));

  const backgroundLabels = [userProfile.major, userProfile.minor]
    .filter((value): value is string => Boolean(value?.trim()));

  // Group by occupational alignment and transferable evidence, not score bands.
  const exploration = useMemo(() => {
    const rows = rankedCareers.map((entry) => {
      const { interests, skills, goals } = entry.match.breakdown;
      const alignment = entry.match.occupationalAlignment ?? interests ?? 0;
      const coreCount = entry.match.coreInterestMatches?.length ?? 0;
      const dutyScores = Object.values(entry.match.dutyInterestScores ?? {});
      const dutyPeak = Math.max(0, ...dutyScores);
      const dutyCount = dutyScores.filter(score => score >= 35).length;
      const skill = skills ?? 0;
      const goal = goals ?? 0;
      const background = userProfile.useCareerBackground === true
        ? (entry.background?.strength ?? 0) : 0;
      // Skills and goals support discovery, but do not replace occupational relevance.
      const personal = Math.max(alignment, skill * 0.8, goal * 0.65);
      const support = alignment * 0.45 + skill * 0.35 + goal * 0.20;
      const bestRank = entry.match.score * 0.55 + alignment * 0.45 + background * 6;
      const group = entry.career.id.split('-')[0];
      const family = entry.career.id.split('.')[0].slice(0, 5);
      return { entry, alignment, skill, goal, background,
        personal, support, bestRank, group, family, coreCount, dutyPeak, dutyCount };
    });
    type Row = (typeof rows)[number];
    const diverse = (pool: Row[], limit: number, familyLimit: number) => {
      const result: Row[] = [];
      const counts = new Map<string, number>();
      for (const row of pool) {
        if ((counts.get(row.family) ?? 0) >= familyLimit) continue;
        result.push(row);
        counts.set(row.family, (counts.get(row.family) ?? 0) + 1);
        if (result.length === limit) break;
      }
      return result;
    };
    const bestPool = [...rows].sort((a, b) => b.bestRank - a.bestRank || b.entry.match.score - a.entry.match.score);
    const best = diverse(bestPool.filter(row => row.personal >= 15 && row.entry.match.reasons.length > 0), 12, 2);
    const leadingGroups = new Set(best.slice(0, 6).map(row => row.group));
    const bestIds = new Set(best.map(row => row.entry.career.id));
    const remaining = rows.filter(row => !bestIds.has(row.entry.career.id));
    const peak = Math.max(0, ...rows.map(row => row.personal));
    const threshold = Math.max(20, peak * 0.4);
    const eligible = remaining.filter(row => row.personal >= threshold && row.entry.match.reasons.length > 0);
    const leadingFamilies = new Set(best.slice(0, 6).map(row => row.family));
    const relatedRank = (row: Row) => row.support + row.entry.match.score * 0.35 + row.background * 8;
    // Reserve cross-field occupations for discovery, even if they share a core interest.
    const isAdjacent = (row: Row) => leadingFamilies.has(row.family) ||
      (leadingGroups.has(row.group) && (row.coreCount > 0 || row.dutyPeak >= 35)) ||
      (row.background >= 0.35 && row.dutyPeak >= 25);
    const related = diverse(eligible.filter(row => isAdjacent(row) &&
      (row.coreCount > 0 || row.dutyPeak >= 35 || row.background >= 0.35))
      .sort((a, b) => relatedRank(b) - relatedRank(a)), 12, 2);
    const relatedIds = new Set(related.map(row => row.entry.career.id));
    const unexpectedRank = (row: Row) => row.dutyPeak * 0.35 + row.support * 0.35 + row.entry.match.score * 0.30;
    const unexpected = diverse(eligible.filter(row => !relatedIds.has(row.entry.career.id) &&
      !isAdjacent(row) && !leadingGroups.has(row.group) &&
      ((row.coreCount > 0 && row.dutyPeak >= 45) ||
       (row.dutyPeak >= 35 && row.skill >= 45 && (row.dutyCount >= 2 || row.goal >= 35))))
      .sort((a, b) => unexpectedRank(b) - unexpectedRank(a)), 8, 1);
    return {
      all: rankedCareers,
      best: best.map(row => row.entry),
      related: related.map(row => row.entry),
      unexpected: unexpected.map(row => row.entry),
    };
  }, [rankedCareers, userProfile.useCareerBackground]);

  const recommended = exploration[explorationFilter];
  const unscoredGoalNotes = useMemo(() => Array.from(new Set(
    rankedCareers.flatMap(({ match }) => match.considerations.filter(item => item.startsWith('Not scored:')))
  )), [rankedCareers]);

  const browsing = useMemo(
    () =>
      catalog.filter(
        (career) =>
          categoryMatch(career.title, filter) &&
          `${career.title} ${career.id}`
            .toLowerCase()
            .includes(query.trim().toLowerCase())
      ),
    [catalog, filter, query]
  );

  const pageCount = Math.max(
    1,
    Math.ceil(browsing.length / PAGE_SIZE)
  );

  const visibleCatalog = browsing.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const openCareer = (id: string) => {
    setSelectedCareerId(id);
    setActiveView('detail');
  };

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        <div style={{ marginBottom: 24 }}>
          <span
            style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              color: 'var(--primary)',
              textTransform: 'uppercase',
            }}
          >
            Your Career Exploration Sandbox
          </span>

          <h1
            style={{
              fontSize: '2.4rem',
              fontWeight: 800,
              color: 'var(--dark-slate)',
              marginTop: 4,
            }}
          >
            Explore O*NET Careers
          </h1>

          <p
            style={{
              color: 'var(--text-muted)',
              marginTop: 8,
            }}
          >
            Browse the complete O*NET occupation catalog
            or explore personalized estimates from a
            profile-informed shortlist.
          </p>

          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
              marginTop: 8,
            }}
          >
            Match percentages are exploratory estimates,
            not predictions of career success. Only
            occupations with loaded details are scored.
          </p>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 12,
              marginTop: 20,
            }}
          >
            <button
              className={
                mode === 'recommended'
                  ? 'btn-primary'
                  : 'btn-secondary'
              }
              onClick={() => setMode('recommended')}
            >
              Personalized Recommendations
            </button>

            <button
              className={
                mode === 'browse'
                  ? 'btn-primary'
                  : 'btn-secondary'
              }
              onClick={() => setMode('browse')}
            >
              Browse All Careers ({catalog.length})
            </button>

            <button
              className="btn-secondary"
              onClick={() => setActiveView('what-if')}
            >
              <Sliders size={16} />
              What-If Sandbox
            </button>

            <button
              className="btn-secondary"
              onClick={() => setActiveView('compare')}
            >
              <BarChart3 size={16} />
              Compare ({compareCareerIds.length})
            </button>
          </div>
        </div>

        {loadingCatalog && (
          <p>
            Loading the O*NET occupation catalog...
          </p>
        )}

        {error && (
          <div
            className="card"
            style={{
              padding: 24,
              marginBottom: 20,
            }}
          >
            <p>{error}</p>

            <button
              className="btn-primary"
              onClick={reload}
            >
              <RefreshCw size={16} />
              Retry
            </button>
          </div>
        )}

        {!loadingCatalog && !error && (
          <>
            {mode === 'browse' && (
              <div style={{ marginBottom: 18 }}>
                <label
                  htmlFor="onet-catalog-search"
                  style={{
                    display: 'block',
                    fontWeight: 700,
                    marginBottom: 8,
                  }}
                >
                  Search all {catalog.length} occupations
                </label>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <Search size={18} />

                  <input
                    id="onet-catalog-search"
                    type="search"
                    placeholder="Search career title or O*NET code..."
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setPage(1);
                    }}
                    style={{
                      flex: 1,
                      padding: 12,
                      border:
                        '1px solid var(--border-strong)',
                      borderRadius: 10,
                    }}
                  />
                </div>
              </div>
            )}

            {mode === 'browse' ? (
            <div
              style={{
                display: 'flex',
                gap: 8,
                flexWrap: 'wrap',
                marginBottom: 20,
              }}
            >
              {(
                [
                  ['all', 'All Fields'],
                  ['creative', 'Creative & Design'],
                  ['business', 'Business & Leadership'],
                  ['tech', 'Technology'],
                ] as [Filter, string][]
              ).map(([key, label]) => (
                <button
                  key={key}
                  className={`tag-chip ${
                    filter === key ? 'active' : ''
                  }`}
                  onClick={() => {
                    setFilter(key);
                    setPage(1);
                  }}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 24,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            ) : (
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {EXPLORATION_OPTIONS.map(([key, label]) => (
                    <button key={key} type="button"
                      className={explorationFilter === key ? 'btn-primary btn-sm' : 'btn-secondary btn-sm'}
                      aria-pressed={explorationFilter === key}
                      onClick={() => setExplorationFilter(key)}
                      style={{ padding: '8px 14px', borderRadius: 24, backgroundColor: explorationFilter === key ? '#0c6957' : '#ffffff', color: explorationFilter === key ? '#ffffff' : '#0c6957', border: '1px solid #0c6957', fontWeight: 600 }}>
                      {label} ({exploration[key].length})
                    </button>
                  ))}
                </div>
                <p style={{ color: 'var(--text-muted)', marginTop: 12, fontSize: '0.9rem' }}>
                  {EXPLORATION_DESCRIPTIONS[explorationFilter]}
                </p>
              </div>
            )}

            {mode === 'recommended' ? (
              <>
                <p
                  style={{
                    color: 'var(--text-muted)',
                    marginBottom: 18,
                  }}
                >
                  {loadingDetails
                    ? `Evaluating occupations... ${careers.length} loaded.`
                    : `${rankedCareers.length} occupations evaluated from a shortlist drawn from ${catalog.length} available careers.`}
                </p>

                {unscoredGoalNotes.length > 0 && (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 18 }}>
                    {unscoredGoalNotes.map(note => <p key={note}>{note}</p>)}
                  </div>
                )}

                {userProfile.useCareerBackground === true && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 18 }}>
                    Career background is enabled. Relevant connections may move occupations higher in the list without changing their estimated match percentages.
                  </p>
                )}

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fill, minmax(min(100%, 340px), 1fr))',
                    gap: 24,
                  }}
                >
                  {recommended.map(
                    ({ career, match, background }) => (
                      <div
                        key={career.id}
                        className="career-card"
                      >
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
                            style={{
                              fontSize: '1.35rem',
                            }}
                          >
                            {career.title}
                          </h2>

                          <p className="career-desc" style={{
                            display: '-webkit-box', WebkitLineClamp: 4,
                            WebkitBoxOrient: 'vertical', overflow: 'hidden',
                          }}>
                            {career.description ||
                              'Open the occupation profile to learn more.'}
                          </p>

                          <div className="fit-box">
                            <strong>
                              Why this may fit:{' '}
                            </strong>
                            {match.reasons[0] ??
                              'Limited matching evidence is available; review the occupation details.'}
                          </div>

                          {userProfile.useCareerBackground === true &&
                            background?.strength > 0 && (
                              <div className="fit-box" style={{ marginTop: 10 }}>
                                <strong style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <GraduationCap size={16} /> Background connection
                                </strong>
                                <p style={{ marginTop: 6 }}>
                                  {backgroundLabels.length
                                    ? `Your studies (${backgroundLabels.join(' and ')}) may be relevant to this occupation through ${background.matchedTerms.slice(0, 3).join(', ')}.`
                                    : `Your career background may connect to this occupation through ${background.matchedTerms.slice(0, 3).join(', ')}.`}
                                  {' '}This is a possible connection, not a qualification assessment.
                                </p>
                              </div>
                            )}

                          <div className="watchout-box">
                            <strong>
                              What to consider:{' '}
                            </strong>
                            {(() => {
                              const education = match.considerations.find(
                                item => item.startsWith('Education:')
                              );
                              const skills = match.skillsToDevelop.length
                                ? `Skills to develop: ${match.skillsToDevelop.slice(0, 2).join(', ')}.`
                                : null;
                              const other = match.considerations.find(item =>
                                !item.startsWith('Education:') &&
                                !item.startsWith('Skills to develop:') &&
                                !item.startsWith('Not scored:')
                              );
                              const items = [education, skills, other].filter(Boolean);
                              return items.length ? items.map((item, index) => (
                                <p key={index} style={{ marginTop: 6 }}>{item}</p>
                              )) : <p style={{ marginTop: 6 }}>Review tasks and education requirements before deciding.</p>;
                            })()}
                          </div>

                          
<div className="tags-row">
  <span className="badge-tag">
    O*NET {career.id}
  </span>
</div>

                        </div>

                        <div className="card-actions" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                          <div
                            style={{
                              display: 'flex',
                              gap: 8,
                              flexWrap: 'wrap',
                            }}
                          >
                            <button
                              className={
                                isSaved(career.id)
                                  ? 'btn-primary btn-sm'
                                  : 'btn-secondary btn-sm'
                              }
                              onClick={() =>
                                toggleSaveCareer(career.id)
                              }
                              aria-pressed={isSaved(career.id)}
                              style={{
                                backgroundColor: isSaved(career.id)
                                  ? '#0c6957'
                                  : undefined,
                                color: isSaved(career.id)
                                  ? '#ffffff'
                                  : undefined,
                                borderColor: isSaved(career.id)
                                  ? '#0c6957'
                                  : undefined,
                                fontWeight: isSaved(career.id)
                                  ? 700
                                  : 500,
                                transition: 'all 0.2s ease',
                                whiteSpace: 'nowrap', flexShrink: 0,
                              }}
                            >
                              {isSaved(career.id) ? (
                                <BookmarkCheck size={14} />
                              ) : (
                                <Bookmark size={14} />
                              )}
                              <span>
                                {isSaved(career.id)
                                  ? 'Saved ✓'
                                  : 'Save'}
                              </span>
                            </button>

                            <button
                              className="btn-secondary btn-sm"
                              style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
                              aria-pressed={isComparing(career.id)}
                              onClick={() =>
                                toggleCompareCareer(career.id)
                              }
                            >
                              <BarChart3 size={14} />
                              {isComparing(career.id)
                                ? 'In Compare'
                                : 'Compare'}
                            </button>
                          </div>

                          <button
                            className="btn-primary btn-sm"
                            style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
                            onClick={() =>
                              openCareer(career.id)
                            }
                          >
                            Full Profile
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                    )
                  )}
                </div>

                {!loadingDetails &&
                  recommended.length === 0 && (
                    <p>
                      No occupations meet this exploration category yet.
                      Try another category or All Recommendations.
                    </p>
                  )}
              </>
            ) : (
              <>
                <p
                  style={{
                    color: 'var(--text-muted)',
                    marginBottom: 16,
                  }}
                >
                  Showing{' '}
                  {browsing.length
                    ? (page - 1) * PAGE_SIZE + 1
                    : 0}
                  –
                  {Math.min(
                    page * PAGE_SIZE,
                    browsing.length
                  )}{' '}
                  of {browsing.length} occupations.
                  Select any career to see its
                  O*NET profile.
                </p>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
                    gap: 16,
                  }}
                >
                  {visibleCatalog.map((career) => (
                    <div
                      className="card"
                      key={career.id}
                      style={{ padding: 22 }}
                    >
                      <span
                        style={{
                          fontSize: 12,
                          color: 'var(--text-muted)',
                        }}
                      >
                        O*NET {career.id}
                      </span>

                      <h2
                        style={{
                          fontSize: 18,
                          margin: '8px 0',
                        }}
                      >
                        {career.title}
                      </h2>

                      {career.jobZone && (
                        <p
                          style={{
                            fontSize: 13,
                            color: 'var(--text-muted)',
                            marginBottom: 12,
                          }}
                        >
                          {career.jobZone}
                        </p>
                      )}

                      {!career.datalevel && (
                        <p
                          style={{
                            fontSize: 12,
                            color: 'var(--text-muted)',
                          }}
                        >
                          Limited O*NET detail available
                        </p>
                      )}

                      <button
                        className="btn-primary btn-sm"
                        onClick={() =>
                          openCareer(career.id)
                        }
                      >
                        View Profile
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                {browsing.length === 0 && (
                  <p>
                    No occupations match your search.
                  </p>
                )}

                {pageCount > 1 && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 16,
                      marginTop: 28,
                    }}
                  >
                    <button
                      className="btn-secondary"
                      disabled={page <= 1}
                      onClick={() =>
                        setPage((p) =>
                          Math.max(1, p - 1)
                        )
                      }
                    >
                      Previous
                    </button>

                    <span>
                      Page {page} of {pageCount}
                    </span>

                    <button
                      className="btn-secondary"
                      disabled={
                        page >= pageCount
                      }
                      onClick={() =>
                        setPage((p) =>
                          Math.min(
                            pageCount,
                            p + 1
                          )
                        )
                      }
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
