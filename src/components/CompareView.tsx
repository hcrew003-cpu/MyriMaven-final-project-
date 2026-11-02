
'use client';

import React, { useEffect, useState } from 'react';
import { useCareer, type OnetCareer } from '../context/CareerContext';
import { CAREERS } from '../data/careersData';
import { calculateOnetMatch } from '../lib/onetMatching';
import {
  ArrowLeft,
  X,
  Sparkles,
  Sliders,
  ChevronRight,
} from 'lucide-react';

type ComparisonCareer = {
  id: string;
  title: string;
  category: string;
  description: string;
  score: number | null;
  strengths: string[];
  whyFit: string;
  watchOut: string;
  environment: string[];
  education: string;
};

const isOnetId = (id: string) =>
  /^\d{2}-\d{4}\.\d{2}$/.test(id);

export default function CompareView() {
  const {
    compareCareerIds,
    toggleCompareCareer,
    setSelectedCareerId,
    setActiveView,
    openMayaWithPrompt,
    userProfile,
  } = useCareer();

  const [onetCareers, setOnetCareers] = useState<
    Record<string, OnetCareer>
  >({});

  const [loading, setLoading] = useState(false);
  const [loadErrors, setLoadErrors] = useState<string[]>([]);

  const onetIds = compareCareerIds.filter(isOnetId);
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

  const comparingCareers: ComparisonCareer[] =
    compareCareerIds.map((id) => {
      const prototype = CAREERS.find((career) => career.id === id);

      if (prototype) {
        return {
          id,
          title: prototype.title,
          category: prototype.category,
          description: prototype.description,
          score: prototype.baseMatch,
          strengths: prototype.skillsUsed.map(
            (skill) => skill.name
          ),
          whyFit: prototype.mayFitBecause,
          watchOut: prototype.watchOut,
          environment: prototype.workEnvironment,
          education: prototype.educationLevel,
        };
      }

      const onet = onetCareers[id];

      if (!onet) {
        return {
          id,
          title: `O*NET Occupation ${id}`,
          category: 'O*NET Occupation',
          description: loadErrors.includes(id)
            ? 'Occupation details could not be loaded.'
            : 'Loading occupation details...',
          score: null,
          strengths: [],
          whyFit: 'Waiting for O*NET occupation data.',
          watchOut: 'Not available yet.',
          environment: [],
          education: 'Not available',
        };
      }

      const match = calculateOnetMatch(onet, userProfile);

return {
  id,
  title: onet.title,
  category: 'O*NET Occupation',
  description: onet.description,
  score: match.score,
  strengths: [],
  whyFit:
    'This estimated match is based on your interests, skills, career goals, and work preferences. Open the full career profile to explore the details.',
  watchOut:
    'Consider the education requirements, daily responsibilities, and work environment to decide whether this career suits you.',
  environment: [],
  education: 'See full O*NET profile',
};

    });

  const rowStyle: React.CSSProperties = {
    padding: '16px 24px',
    verticalAlign: 'top',
    borderBottom: '1px solid var(--border)',
    fontSize: '0.9rem',
    lineHeight: 1.6,
  };

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
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          <div>
            <button
              onClick={() => setActiveView('saved')}
              className="btn-ghost"
              style={{
                marginBottom: '12px',
                fontSize: '0.88rem',
              }}
            >
              <ArrowLeft size={16} />
              <span>Back to Saved Careers</span>
            </button>

            <h1
              style={{
                fontSize: '2.4rem',
                fontWeight: 800,
                color: 'var(--dark-slate)',
                marginBottom: '6px',
              }}
            >
              Side-by-Side Comparison
            </h1>

            <p
              style={{
                color: 'var(--text-muted)',
                fontSize: '1.05rem',
              }}
            >
              Comparing {comparingCareers.length} roles
              against your strengths, work preferences,
              and career goals.
            </p>
          </div>

          <button
            onClick={() => setActiveView('what-if')}
            className="btn-secondary"
          >
            <Sliders size={16} />
            <span>Test Priorities in Sandbox</span>
          </button>
        </div>

        {comparingCareers.length === 0 ? (
          <div
            className="card"
            style={{
              padding: '60px 24px',
              textAlign: 'center',
            }}
          >
            <h2
              style={{
                fontSize: '1.3rem',
                fontWeight: 700,
                color: 'var(--dark-slate)',
                marginBottom: '8px',
              }}
            >
              No careers selected for comparison
            </h2>

            <p
              style={{
                color: 'var(--text-muted)',
                marginBottom: '20px',
              }}
            >
              Select 2 to 3 careers from Recommendations
              or Saved Careers to compare them here.
            </p>

            <button
              onClick={() =>
                setActiveView('recommendations')
              }
              className="btn-primary"
            >
              View Recommendations
            </button>
          </div>
        ) : (
          <>
            {loading && (
              <p
                style={{
                  color: 'var(--text-muted)',
                  marginBottom: '16px',
                }}
              >
                Loading O*NET comparison details...
              </p>
            )}

            <div
              style={{
                overflowX: 'auto',
                backgroundColor: 'white',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  minWidth: '780px',
                  textAlign: 'left',
                }}
              >
                <thead>
                  <tr
                    style={{
                      borderBottom:
                        '2px solid var(--border)',
                      backgroundColor: '#F8FAF9',
                    }}
                  >
                    <th
                      style={{
                        ...rowStyle,
                        width: '220px',
                      }}
                    >
                      Criteria
                    </th>

                    {comparingCareers.map((career) => (
                      <th
                        key={career.id}
                        style={{
                          ...rowStyle,
                          minWidth: '230px',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent:
                              'space-between',
                            alignItems: 'flex-start',
                            gap: '10px',
                          }}
                        >
                          <div>
                            <span className="career-category">
                              {career.category}
                            </span>

                            <div
                              style={{
                                fontSize: '1.2rem',
                                fontWeight: 800,
                                color: 'var(--dark-slate)',
                                marginTop: '6px',
                              }}
                            >
                              {career.title}
                            </div>

                            <div
                              style={{
                                fontSize: '0.75rem',
                                color: 'var(--text-muted)',
                                marginTop: '4px',
                              }}
                            >
                              {isOnetId(career.id)
                                ? career.id
                                : ''}
                            </div>
                          </div>

                          <button
                            onClick={() =>
                              toggleCompareCareer(career.id)
                            }
                            title="Remove from comparison"
                            style={{
                              color: 'var(--text-subtle)',
                              padding: '4px',
                            }}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td style={{ ...rowStyle, fontWeight: 700 }}>
                      Profile Match Score
                    </td>

                    {comparingCareers.map((career) => (
                      <td key={career.id} style={rowStyle}>
                        {career.score !== null ? (
                          <span
                            className={`match-badge ${
                              career.score >= 90
                                ? 'match-high'
                                : 'match-med'
                            }`}
                          >
                            {career.score}% Estimated Match
                          </span>
                        ) : (
                          'Not available'
                        )}
                      </td>
                    ))}
                  </tr>

                  <tr style={{ backgroundColor: '#FAF9F6' }}>
                    <td style={{ ...rowStyle, fontWeight: 700 }}>
                      Occupation Overview
                    </td>

                    {comparingCareers.map((career) => (
                      <td key={career.id} style={rowStyle}>
                        {career.description}
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td style={{ ...rowStyle, fontWeight: 700 }}>
                      Core Strengths Leveraged
                    </td>

                    {comparingCareers.map((career) => (
                      <td key={career.id} style={rowStyle}>
                        {career.strengths.length > 0
                          ? career.strengths.join(', ')
                          : 'See occupation profile for skills and abilities.'}
                      </td>
                    ))}
                  </tr>

                  <tr style={{ backgroundColor: '#FAF9F6' }}>
                    <td style={{ ...rowStyle, fontWeight: 700 }}>
                      Why It Fits You
                    </td>

                    {comparingCareers.map((career) => (
                      <td key={career.id} style={rowStyle}>
                        <div
                          className="fit-box"
                          style={{ margin: 0 }}
                        >
                          {career.whyFit}
                        </div>
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td style={{ ...rowStyle, fontWeight: 700 }}>
                      Trade-offs & Watch Outs
                    </td>

                    {comparingCareers.map((career) => (
                      <td key={career.id} style={rowStyle}>
                        <div
                          className="watchout-box"
                          style={{ margin: 0 }}
                        >
                          {career.watchOut}
                        </div>
                      </td>
                    ))}
                  </tr>

                  <tr style={{ backgroundColor: '#FAF9F6' }}>
                    <td style={{ ...rowStyle, fontWeight: 700 }}>
                      Work Environment
                    </td>

                    {comparingCareers.map((career) => (
                      <td key={career.id} style={rowStyle}>
                        {career.environment.length > 0
                          ? career.environment.join(', ')
                          : 'See full O*NET occupation profile.'}
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td style={{ ...rowStyle, fontWeight: 700 }}>
                      Education Path
                    </td>

                    {comparingCareers.map((career) => (
                      <td key={career.id} style={rowStyle}>
                        {career.education}
                      </td>
                    ))}
                  </tr>

                  <tr style={{ backgroundColor: '#FAF9F6' }}>
                    <td style={{ ...rowStyle, fontWeight: 700 }}>
                      Actions
                    </td>

                    {comparingCareers.map((career) => (
                      <td key={career.id} style={rowStyle}>
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                          }}
                        >
                          <button
                            onClick={() => {
                              setSelectedCareerId(career.id);
                              setActiveView('detail');
                            }}
                            className="btn-primary btn-sm"
                            style={{
                              width: '100%',
                              justifyContent: 'center',
                            }}
                          >
                            <span>Full Profile</span>
                            <ChevronRight size={14} />
                          </button>

                          <button
                            onClick={() =>
                              openMayaWithPrompt(
                                `How does ${career.title} compare to other roles in my list?`
                              )
                            }
                            className="btn-secondary btn-sm"
                            style={{
                              width: '100%',
                              justifyContent: 'center',
                            }}
                          >
                            <Sparkles size={14} />
                            <span>Ask Maya</span>
                          </button>
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
