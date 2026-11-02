
'use client';

import React, { useEffect, useState } from 'react';
import { useCareer, type OnetCareer } from '../context/CareerContext';
import { CAREERS } from '../data/careersData';
import {
  Bookmark,
  BarChart3,
  Trash2,
  ArrowRight,
  Compass,
} from 'lucide-react';

const isOnetId = (id: string) =>
  /^\d{2}-\d{4}\.\d{2}$/.test(id);

export default function SavedView() {
  const {
    savedCareerIds,
    toggleSaveCareer,
    setSelectedCareerId,
    setActiveView,
    compareCareerIds,
    toggleCompareCareer,
    isComparing,
  } = useCareer();

  const [onetCareers, setOnetCareers] = useState<
    Record<string, OnetCareer>
  >({});

  const [loading, setLoading] = useState(false);
  const [loadErrors, setLoadErrors] = useState<string[]>([]);

  const onetIds = savedCareerIds.filter(isOnetId);
  const onetKey = onetIds.join('|');

  useEffect(() => {
    let cancelled = false;

    async function loadCareers() {
      if (onetIds.length === 0) {
        setOnetCareers({});
        setLoadErrors([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setLoadErrors([]);

      const results = await Promise.allSettled(
        onetIds.map(async (id) => {
          const response = await fetch(
            `/api/onet/occupation?code=${encodeURIComponent(id)}`
          );

          if (!response.ok) {
            throw new Error(`Could not load occupation ${id}`);
          }

          const career = (await response.json()) as OnetCareer;

          return { id, career };
        })
      );

      if (cancelled) return;

      const loaded: Record<string, OnetCareer> = {};
      const errors: string[] = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          loaded[result.value.id] = result.value.career;
        } else {
          errors.push(onetIds[index]);
        }
      });

      setOnetCareers(loaded);
      setLoadErrors(errors);
      setLoading(false);
    }

    loadCareers();

    return () => {
      cancelled = true;
    };
  }, [onetKey]);

  const savedCareers = savedCareerIds.map((id) => {
    const prototype = CAREERS.find((career) => career.id === id);

    if (prototype) {
      return {
        id,
        title: prototype.title,
        description: prototype.description,
        category: prototype.category,
        match: prototype.baseMatch,
        isOnet: false,
        unavailable: false,
      };
    }

    const onet = onetCareers[id];

    return {
      id,
      title: onet?.title ?? `O*NET Occupation ${id}`,
      description:
        onet?.description ??
        'Occupation information is being loaded or is temporarily unavailable.',
      category: 'O*NET Occupation',
      match: null as number | null,
      isOnet: true,
      unavailable: loadErrors.includes(id),
    };
  });

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '20px',
            marginBottom: '36px',
          }}
        >
          <div>
            <h1
              style={{
                fontSize: '2.4rem',
                fontWeight: 800,
                color: 'var(--dark-slate)',
                marginBottom: '8px',
              }}
            >
              Saved Careers ({savedCareers.length})
            </h1>

            <p
              style={{
                color: 'var(--text-muted)',
                fontSize: '1.05rem',
                maxWidth: '680px',
              }}
            >
              Your shortlisted careers. Compare them side-by-side,
              ask Maya specific questions, or adjust priorities
              in the Sandbox.
            </p>
          </div>

          {savedCareers.length > 0 && (
            <button
              onClick={() => setActiveView('compare')}
              className="btn-primary"
            >
              <BarChart3 size={18} />
              <span>
                Compare Selected ({compareCareerIds.length})
              </span>
              <ArrowRight size={16} />
            </button>
          )}
        </div>

        {/* Empty State */}
        {savedCareers.length === 0 ? (
          <div
            className="card"
            style={{
              padding: '60px 24px',
              textAlign: 'center',
            }}
          >
            <Bookmark
              size={48}
              style={{
                color: 'var(--text-subtle)',
                margin: '0 auto 16px',
              }}
            />

            <h2
              style={{
                fontSize: '1.4rem',
                fontWeight: 700,
                color: 'var(--dark-slate)',
                marginBottom: '8px',
              }}
            >
              No saved careers yet
            </h2>

            <p
              style={{
                color: 'var(--text-muted)',
                fontSize: '0.95rem',
                maxWidth: '460px',
                margin: '0 auto 24px',
              }}
            >
              When exploring matches or browsing the directory,
              save careers here to compare your options.
            </p>

            <button
              onClick={() => setActiveView('recommendations')}
              className="btn-primary"
            >
              <Compass size={16} />
              <span>Explore Recommendations</span>
            </button>
          </div>
        ) : (
          <>
            {loading && (
              <p
                style={{
                  color: 'var(--text-muted)',
                  marginBottom: '20px',
                }}
              >
                Loading your saved O*NET careers...
              </p>
            )}

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              {savedCareers.map((career) => {
                const inCompare = isComparing(career.id);

                return (
                  <div
                    key={career.id}
                    className="card card-hover"
                    style={{ padding: '24px' }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '16px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '16px',
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={inCompare}
                          onChange={() =>
                            toggleCompareCareer(career.id)
                          }
                          style={{
                            width: '20px',
                            height: '20px',
                            accentColor: 'var(--primary)',
                            cursor: 'pointer',
                            flexShrink: 0,
                          }}
                          title="Include in Comparison"
                        />

                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              flexWrap: 'wrap',
                              gap: '10px',
                              marginBottom: '6px',
                            }}
                          >
                            <span className="career-category">
                              {career.category}
                            </span>

                            {career.match !== null && (
                              <span
                                className={`match-badge ${
                                  career.match >= 90
                                    ? 'match-high'
                                    : 'match-med'
                                }`}
                              >
                                {career.match}% Match
                              </span>
                            )}

                            {career.isOnet && (
                              <span
                                style={{
                                  fontSize: '0.75rem',
                                  color: 'var(--text-muted)',
                                }}
                              >
                                {career.id}
                              </span>
                            )}
                          </div>

                          <h2
                            style={{
                              fontSize: '1.3rem',
                              fontWeight: 700,
                              color: 'var(--dark-slate)',
                              marginTop: '2px',
                            }}
                          >
                            {career.title}
                          </h2>

                          <p
                            style={{
                              fontSize: '0.88rem',
                              color: 'var(--text-muted)',
                              marginTop: '4px',
                              maxWidth: '650px',
                              lineHeight: 1.6,
                            }}
                          >
                            {career.description}
                          </p>

                          {career.unavailable && (
                            <p
                              style={{
                                color: '#b45309',
                                fontSize: '0.82rem',
                                marginTop: '8px',
                              }}
                            >
                              This occupation's details could not
                              be loaded right now.
                            </p>
                          )}
                        </div>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '12px',
                        }}
                      >
                        <button
                          onClick={() =>
                            toggleCompareCareer(career.id)
                          }
                          className={`btn-secondary btn-sm ${
                            inCompare ? 'tag-active' : ''
                          }`}
                        >
                          <BarChart3 size={14} />
                          <span>
                            {inCompare
                              ? 'Comparing'
                              : 'Add to Compare'}
                          </span>
                        </button>

                        <button
                          onClick={() => {
                            setSelectedCareerId(career.id);
                            setActiveView('detail');
                          }}
                          className="btn-primary btn-sm"
                        >
                          <span>View Details</span>
                        </button>

                        <button
                          onClick={() =>
                            toggleSaveCareer(career.id)
                          }
                          className="btn-ghost"
                          style={{
                            color: '#E11D48',
                            padding: '6px',
                          }}
                          title="Remove from saved"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
