
'use client';

import React, { useMemo } from 'react';
import { useCareer, type OccupationalFilter } from '../context/CareerContext';
import { useOnetRecommendations } from '../hooks/useOnetRecommendations';
import { getMatchPresentation } from '../lib/matchPresentation';
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

type Filter = OccupationalFilter;

type ExplorationFilter = 'all' | 'best' | 'related' | 'unexpected';
const EXPLORATION_OPTIONS: [ExplorationFilter, string][] = [
  ['best', 'Best Matches'],
  ['related', 'Related Paths'],
  ['unexpected', 'Unexpected Possibilities'],
  ['all', 'All Recommendations'],
];
const EXPLORATION_DESCRIPTIONS: Record<ExplorationFilter, string> = {
  best: 'Your strongest available matches, balancing occupational alignment and overall compatibility. Review individual estimates and evidence before deciding.',
  related: 'Explore careers with meaningful connections to your leading matches, including shared interests and occupational relationships.',
  unexpected: 'Discover less obvious career directions supported by your interests, transferable strengths, goals or enabled career background.',
  all: 'View every evaluated occupation, including those with limited matching evidence.',
};
const PAGE_SIZE = 30;

const OCCUPATIONAL_FIELDS: Record<string, string> = {
  "11": "Management",
  "13": "Business & Finance",
  "15": "Computer & Mathematics",
  "17": "Architecture & Engineering",
  "19": "Life, Physical & Social Sciences",
  "21": "Community & Social Services",
  "23": "Legal",
  "25": "Education & Library",
  "27": "Arts, Design, Entertainment, Sports & Media",
  "29": "Healthcare Practitioners & Technical",
  "31": "Healthcare Support",
  "33": "Protective Services",
  "35": "Food Preparation & Serving",
  "37": "Building & Grounds Maintenance",
  "39": "Personal Care & Service",
  "41": "Sales",
  "43": "Office & Administrative Support",
  "45": "Farming, Fishing & Forestry",
  "47": "Construction & Extraction",
  "49": "Installation, Maintenance & Repair",
  "51": "Production",
  "53": "Transportation & Material Moving",
  "55": "Military Specific"
};

function occupationalField(id: string): string {
  return OCCUPATIONAL_FIELDS[id.split("-")[0]] ?? "Other / unclassified occupation";
}

function categoryMatch(id: string, filter: Filter): boolean {
  const group = id.split('-')[0];
  if (filter === 'all') return true;
  if (filter === 'other') return !Object.prototype.hasOwnProperty.call(OCCUPATIONAL_FIELDS, group);
  // Preserve compatibility with existing navigation callers.
  if (filter === 'creative') return group === '27';
  if (filter === 'business') return ['11', '13', '41'].includes(group);
  if (filter === 'tech') return group === '15';
  return group === filter;
}

function formatConnectionTerms(terms: string[]): string {
  if (terms.length <= 1) return terms[0] ?? 'related areas of study';
  if (terms.length === 2) return terms.join(' and ');
  return `${terms.slice(0, -1).join(', ')}, and ${terms[terms.length - 1]}`;
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

  // Category placement uses occupational evidence, not changes to match scores.
  const exploration = useMemo(() => {
    const broad = new Set(['Communication', 'Problem Solving', 'Leadership']);
    const selected = [...new Set(userProfile.interests ?? [])];
    const specific = selected.filter(interest => !broad.has(interest));
    const hasSpecific = specific.length > 0;
    const rows = rankedCareers.map(entry => {
      const { interests, skills, goals } = entry.match.breakdown;
      const alignment = entry.match.occupationalAlignment ?? interests ?? 0;
      const skill = skills ?? 0;
      const goal = goals ?? 0;
      const duties = entry.match.dutyInterestScores ?? {};
      const dutyPeak = Math.max(0, ...Object.values(duties));
      const specificPeak = Math.max(0, ...specific.map(interest => duties[interest] ?? 0));
      const broadCount = (entry.match.supportedTransferableInterests ?? []).filter(interest => selected.includes(interest) && broad.has(interest)).length;
      const core = new Set(entry.match.coreInterestMatches ?? []);
      const background = userProfile.useCareerBackground === true ? entry.background?.strength ?? 0 : 0;
      const group = entry.career.id.split('-')[0];
      const family = entry.career.id.split(".")[0].slice(0, 6);
      const relatedCodes = new Set((entry.career.relatedOccupations?.occupation ?? []).map(item => item.code));
      const direct = hasSpecific ? specificPeak >= 35 : dutyPeak >= 35;
      const support = alignment * .40 + (hasSpecific ? specificPeak : dutyPeak) * .25 + skill * .20 + goal * .15;
      const bestRank = entry.match.score * .70 + alignment * .20 + (hasSpecific ? specificPeak : dutyPeak) * .10 + background * 2;
      return { entry, group, family, relatedCodes, alignment, skill, goal, dutyPeak, specificPeak, broadCount, core, background, direct, support, bestRank };
    });
    type Row = (typeof rows)[number];
    const diverse = (pool: Row[], limit: number, familyLimit: number, groupLimit: number, initial: Row[] = []) => {
      const result = [...initial];
      const families = new Map<string, number>();
      const groups = new Map<string, number>();
      for (const row of initial) {
        families.set(row.family, (families.get(row.family) ?? 0) + 1);
        groups.set(row.group, (groups.get(row.group) ?? 0) + 1);
      }
      for (const row of pool) {
        if (result.length >= limit) break;
        if ((families.get(row.family) ?? 0) >= familyLimit || (groups.get(row.group) ?? 0) >= groupLimit) continue;
        result.push(row);
        families.set(row.family, (families.get(row.family) ?? 0) + 1);
        groups.set(row.group, (groups.get(row.group) ?? 0) + 1);
      }
      return result;
    };
    const eligible = rows.filter(row => row.entry.match.reasons.length > 0 && row.entry.match.score >= 40);
    const bestPool = eligible.filter(row => row.direct || (!selected.length && (row.skill >= 55 || row.goal >= 40)))
      .sort((a,b) => b.bestRank-a.bestRank || b.entry.match.score-a.entry.match.score);
    const anchors = diverse(bestPool, 6, 3, 6);
    const anchorIds = new Set(anchors.map(row => row.entry.career.id));
    const best = diverse(bestPool.filter(row => !anchorIds.has(row.entry.career.id) && row.bestRank >= (anchors[0]?.bestRank ?? 0) * .85), 8, 3, 6, anchors);
    const bestIds = new Set(best.map(row => row.entry.career.id));
    const remaining = eligible.filter(row => !bestIds.has(row.entry.career.id));
    const linked = (a: Row, b: Row) => a.relatedCodes.has(b.entry.career.id) || b.relatedCodes.has(a.entry.career.id);
    const sharedInterestCount = (row: Row, anchor: Row) =>
      (hasSpecific ? specific : selected).filter(interest =>
        (row.core.has(interest) && anchor.core.has(interest)) ||
        ((row.entry.match.dutyInterestScores?.[interest] ?? 0) >= 35 &&
         (anchor.entry.match.dutyInterestScores?.[interest] ?? 0) >= 35)
      ).length;
    // Shared interests establish relevance, not necessarily occupational closeness.
    const adjacent = (row: Row) => best.some(anchor => {
      const shared = sharedInterestCount(row, anchor);
      return (linked(row, anchor) && (row.direct || row.alignment >= 25 || row.goal >= 40)) ||
        (row.family === anchor.family && row.direct) ||
        (row.group === anchor.group && shared >= 1) ||
        (shared >= 2 && row.direct) ||
        (hasSpecific && shared >= 1 && row.specificPeak >= 45 && anchor.specificPeak >= 45);
    });
    const related = diverse(remaining.filter(row => adjacent(row))
      .sort((a,b) => (b.support + b.entry.match.score * .35 + b.background * 2) - (a.support + a.entry.match.score * .35 + a.background * 2)), 12, 3, 5);
    const relatedIds = new Set(related.map(row => row.entry.career.id));
    const unexpected = diverse(remaining.filter(row => !relatedIds.has(row.entry.career.id) && !adjacent(row) && (
      (row.direct && row.skill >= 40) ||
      (hasSpecific && row.specificPeak >= 25 && row.skill >= 50 && (row.broadCount >= 1 || row.goal >= 40)) ||
      (hasSpecific && row.background >= .35 && row.skill >= 55 && row.broadCount >= 1 && (row.specificPeak >= 20 || row.goal >= 40 || row.broadCount >= 2)) ||
      (!hasSpecific && row.skill >= 50 && row.broadCount >= 1 && (row.goal >= 35 || row.background >= .35 || row.broadCount >= 2)) ||
      (!selected.length && row.background >= .35 && row.skill >= 55 && row.goal >= 40)
    )).sort((a,b) => (b.support + b.entry.match.score * .30 + b.background * 5) - (a.support + a.entry.match.score * .30 + a.background * 5)), 8, 1, 2);
    return { all: rankedCareers, best: best.map(row => row.entry), related: related.map(row => row.entry), unexpected: unexpected.map(row => row.entry) };
  }, [rankedCareers, userProfile.useCareerBackground, userProfile.interests]);

  // Sort displayed careers by match score without changing category membership.
  // Stable sorting preserves the internal ranking when match scores are equal.
  const recommended = useMemo(
    () => [...exploration[explorationFilter]].sort((a, b) => b.match.score - a.match.score),
    [exploration, explorationFilter]
  );
  const unscoredGoalNotes = useMemo(() => Array.from(new Set(
    rankedCareers.flatMap(({ match }) => match.considerations.filter(item => item.startsWith('Not scored:')))
  )), [rankedCareers]);

  const browsing = useMemo(
    () =>
      catalog.filter(
        (career) =>
          categoryMatch(career.id, filter) &&
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
            Discover careers that connect to your interests, strengths,
            work preferences and goals, or browse the complete O*NET catalog.
          </p>

          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
              marginTop: 8,
            }}
          >
            Your match score is a guide for exploration, not a measure of
            your qualifications or potential to succeed.
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
              <div style={{ marginBottom: 20 }}>
                <label htmlFor="onet-field-filter" style={{ display: 'block', fontWeight: 700, marginBottom: 8 }}>
                  Occupational field
                </label>
                <select id="onet-field-filter" value={filter}
                  onChange={(e) => { setFilter(e.target.value as Filter); setPage(1); }}
                  style={{ width: '100%', maxWidth: 520, padding: 12, borderRadius: 10, border: '1px solid var(--border-strong)', background: '#fff' }}>
                  <option value="all">All Fields ({catalog.length})</option>
                  {(['creative', 'business', 'tech'] as Filter[]).includes(filter) && <option value={filter}>Previous field selection</option>}
                  {Object.entries(OCCUPATIONAL_FIELDS).map(([code, label]) => (
                    <option key={code} value={code}>{label} ({catalog.filter(c => c.id.split('-')[0] === code).length})</option>
                  ))}
                  <option value="other">Other / unclassified ({catalog.filter(c => categoryMatch(c.id, 'other')).length})</option>
                </select>
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
                    ? `Finding career matches for you... ${careers.length} careers loaded.`
                    : `We’ve evaluated ${rankedCareers.length} of ${catalog.length.toLocaleString('en-CA')} available careers using your profile.`}
                </p>

                {unscoredGoalNotes.length > 0 && (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 18 }}>
                    {unscoredGoalNotes.map(note => (
                      <p key={note}>
                        {note.split('. Available occupation data')[0].replace('Not scored: ', '')}:
                        {' '}These goals are not included in your match score because outcomes vary by employer and reliable occupation-level evidence is limited.
                      </p>
                    ))}
                  </div>
                )}

                {userProfile.useCareerBackground === true && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 18 }}>
                    Career background included. Your education or experience may change which careers appear and their ranking, but does not change your estimated match percentages.
                  </p>
                )}

                <details className="card" style={{ padding: '16px 20px', marginBottom: 24 }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 700, color: 'var(--primary)' }}>
                    How are my matches calculated?
                  </summary>
                  <p style={{ color: 'var(--text-muted)', marginTop: 12 }}>
                    Your estimated match compares your profile with available O*NET occupation information.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginTop: 14 }}>
                    {[
                      ['Interests', 30], ['Skills & Strengths', 30],
                      ['Work Preferences', 30], ['Career Goals', 10],
                    ].map(([label, weight]) => (
                      <div key={label} style={{ padding: 12, background: 'var(--primary-subtle)', borderRadius: 10 }}>
                        <strong>{label}</strong><div>{weight}% standard weight</div>
                      </div>
                    ))}
                  </div>
                  <p style={{ color: 'var(--text-muted)', marginTop: 14, fontSize: '0.9rem' }}>
                    Neutral preferences and categories without enough evidence are excluded, and their weights are redistributed across scored categories. Open any full profile to see its individual breakdown. Career background can influence ranking, but not the match percentage.
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
                    {[[85, '85–100%'], [70, '70–84%'], [55, '55–69%'], [40, '40–54%'], [0, '0–39%']].map(([minimum, range]) => {
                      const presentation = getMatchPresentation(Number(minimum));
                      return <span key={minimum} className="match-badge" style={{ backgroundColor: presentation.background, color: presentation.color }}>{range} · {presentation.label}</span>;
                    })}
                  </div>
                  <p style={{ color: 'var(--text-muted)', marginTop: 12, fontSize: '0.85rem' }}>
                    These ranges are exploratory guides, not validated cutoffs or entry requirements.
                  </p>
                </details>

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
                          <div className="career-card-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
                            <span className="career-category">
                              {occupationalField(career.id)}
                            </span>

                            <span
                              className="match-badge"
                              title={getMatchPresentation(match.score).label}
                              aria-label={`${match.score}% Estimated Match — ${getMatchPresentation(match.score).label}`}
                              style={{
                                whiteSpace: 'nowrap', flexShrink: 0,
                                backgroundColor: getMatchPresentation(match.score).background,
                                color: getMatchPresentation(match.score).color,
                              }}
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
                                    ? `Your studies (${backgroundLabels.join(' and ')}) may be relevant to this occupation through ${formatConnectionTerms(background.matchedTerms.slice(0, 3))}.`
                                    : `Your career background may connect to this occupation through ${formatConnectionTerms(background.matchedTerms.slice(0, 3))}.`}
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
                        {occupationalField(career.id)} · O*NET {career.id}
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
