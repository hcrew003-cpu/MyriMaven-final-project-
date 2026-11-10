
'use client';

import React, { useMemo, useState } from 'react';
import { useCareer } from '../context/CareerContext';
import { useOnetRecommendations } from '../hooks/useOnetRecommendations';
import {
  BarChart3,
  Bookmark,
  BookmarkCheck,
  ChevronRight,
  RefreshCw,
  Search,
  Sliders,
} from 'lucide-react';

type Filter = 'all' | 'creative' | 'business' | 'tech';

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

  const [mode, setMode] = useState<'recommended' | 'browse'>(
    'recommended'
  );

  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  const recommended = rankedCareers.filter(
    ({ career }) => categoryMatch(career.title, filter)
  );

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

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
                    gap: 24,
                  }}
                >
                  {recommended.map(
                    ({ career, match }) => (
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

                          <p className="career-desc">
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

                          <div className="watchout-box">
                            <strong>
                              What to consider:{' '}
                            </strong>
                            {match.considerations[0] ??
                              (match.skillsToDevelop.length
                                ? `Skills to develop: ${match.skillsToDevelop
                                    .slice(0, 2)
                                    .join(', ')}.`
                                : 'Review tasks and education requirements before deciding.')}
                          </div>

                          
<div className="tags-row">
  <span className="badge-tag">
    O*NET {career.id}
  </span>
</div>

                        </div>

                        <div className="card-actions">
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
                      No occupations match this
                      filter. Try All Fields.
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
