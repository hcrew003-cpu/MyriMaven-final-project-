
'use client';

import React from 'react';
import { useCareer } from '../context/CareerContext';
import type { OnetCareer } from '../context/CareerContext';
import { CAREERS } from '../data/careersData';
import {
  ArrowLeft,
  Bookmark,
  BarChart3,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  MessageSquare,
  Briefcase,
  Users,
  Crown,
  Palette,
  Puzzle,
  TrendingUp,
  ClipboardCheck,
  CheckSquare,
  Globe,
  Scale,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

const iconLookup: Record<string, React.ReactNode> = {
  MessageSquare: <MessageSquare size={20} />,
  Briefcase: <Briefcase size={20} />,
  Users: <Users size={20} />,
  Crown: <Crown size={20} />,
  Palette: <Palette size={20} />,
  Puzzle: <Puzzle size={20} />,
  TrendingUp: <TrendingUp size={20} />,
  ClipboardCheck: <ClipboardCheck size={20} />,
  CheckSquare: <CheckSquare size={20} />,
  Globe: <Globe size={20} />,
  Scale: <Scale size={20} />,
  ShieldCheck: <ShieldCheck size={20} />,
};

// O*NET profiles use occupational data.
// Existing prototype profiles remain available during migration.
function OnetCareerDetail({
  career,
  onBack,
  onRelated,
  onAskMaya,
}: {
  career: OnetCareer;
  onBack: () => void;
  onRelated: (id: string) => void;
  onAskMaya: (prompt: string) => void;
}) {
  const sectionTitle: React.CSSProperties = {
    fontSize: '1.25rem',
    fontWeight: 800,
    color: 'var(--dark-slate)',
    marginBottom: '14px',
  };

  const items: React.CSSProperties = {
    margin: '0 0 10px',
    lineHeight: 1.6,
    color: 'var(--text-muted)',
  };

  return (
    <div style={{ padding: '36px 0 80px' }}>
      <div className="container">
        <button
          onClick={onBack}
          className="btn-ghost"
          style={{ marginBottom: '24px' }}
        >
          <ArrowLeft size={16} />
          Back to Explore Careers
        </button>

        <div
          className="card"
          style={{ padding: '36px', marginBottom: '28px' }}
        >
          <span className="career-category">
            O*NET Occupation
          </span>

          <h1
            style={{
              fontSize: '2.4rem',
              fontWeight: 800,
              color: 'var(--dark-slate)',
              margin: '8px 0 14px',
            }}
          >
            {career.title}
          </h1>

          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: '1.05rem',
              lineHeight: 1.7,
            }}
          >
            {career.description}
          </p>

          <p
            style={{
              marginTop: '14px',
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
            }}
          >
            O*NET code: {career.id} · Personalized match
            score coming soon
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
            gap: '24px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
          >
            <section className="card">
              <h2 style={sectionTitle}>
                Typical Responsibilities
              </h2>

              <ul style={{ paddingLeft: '20px' }}>
                {(career.tasks?.task ?? []).map((task) => (
                  <li key={task.id} style={items}>
                    {task.title}
                  </li>
                ))}
              </ul>

              <p
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                }}
              >
                Showing the first available tasks from O*NET.
              </p>
            </section>

            <section className="card">
              <h2 style={sectionTitle}>
                Education Backgrounds
              </h2>

              <p style={{ ...items, marginBottom: '14px' }}>
                Education reported by O*NET survey
                respondents; not a formal entry requirement.
              </p>

              <ul style={{ paddingLeft: '20px' }}>
                {(career.education?.response ?? []).map(
                  (item) => (
                    <li key={item.code} style={items}>
                      {item.title} —{' '}
                      {item.percentage_of_respondents}%
                      of respondents
                    </li>
                  )
                )}
              </ul>
            </section>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
          >
            <section className="card">
              <h2 style={sectionTitle}>Key Skills</h2>

              <ul style={{ paddingLeft: '20px' }}>
                {(career.skills?.element ?? []).map(
                  (skill) => (
                    <li key={skill.id} style={items}>
                      <strong>{skill.name}:</strong>{' '}
                      {skill.description}
                    </li>
                  )
                )}
              </ul>
            </section>

            <section className="card">
              <h2 style={sectionTitle}>Knowledge Areas</h2>

              <ul style={{ paddingLeft: '20px' }}>
                {(career.knowledge?.element ?? []).map(
                  (item) => (
                    <li key={item.id} style={items}>
                      <strong>{item.name}:</strong>{' '}
                      {item.description}
                    </li>
                  )
                )}
              </ul>
            </section>

            <section
              className="card"
              style={{
                background:
                  'linear-gradient(135deg, #F8FAF9 0%, #EFF8F5 100%)',
              }}
            >
              <h2 style={sectionTitle}>
                <Sparkles
                  size={20}
                  style={{
                    display: 'inline',
                    marginRight: '8px',
                  }}
                />
                Ask Maya
              </h2>

              <button
                className="maya-prompt-chip"
                onClick={() =>
                  onAskMaya(
                    `What is a typical workday like for a ${career.title}? Use O*NET occupation code ${career.id} for context.`
                  )
                }
              >
                What's a typical day like in this career?
                <ChevronRight size={14} />
              </button>
            </section>
          </div>
        </div>

        <section style={{ marginTop: '38px' }}>
          <h2 style={sectionTitle}>
            Related Careers to Explore
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(min(100%, 270px), 1fr))',
              gap: '16px',
            }}
          >
            {(career.relatedOccupations?.occupation ?? []).map(
              (related) => (
                <button
                  key={related.code}
                  className="card card-hover"
                  onClick={() => {
                    onRelated(related.code);
                    window.scrollTo({
                      top: 0,
                      behavior: 'smooth',
                    });
                  }}
                  style={{
                    textAlign: 'left',
                    cursor: 'pointer',
                    padding: '20px',
                    color: 'var(--dark-slate)',
                    fontWeight: 700,
                  }}
                >
                  {related.title}
                  <ChevronRight
                    size={16}
                    style={{
                      display: 'inline',
                      verticalAlign: 'middle',
                    }}
                  />
                </button>
              )
            )}
          </div>
        </section>

        <p
          style={{
            marginTop: '32px',
            color: 'var(--text-muted)',
            fontSize: '0.8rem',
          }}
        >
          Occupational information from O*NET Web
          Services, U.S. Department of Labor/Employment
          and Training Administration. U.S. occupational
          information and education pathways may differ
          from Canadian requirements. Saving, comparing,
          and personalized matching for O*NET occupations
          will be added in a later update.
        </p>
      </div>
    </div>
  );
}

export default function CareerDetailView() {
  const {
    selectedCareer,
    selectedCareerId,
    selectedOnetCareer,
    onetCareerLoading,
    onetCareerError,
    setSelectedCareerId,
    setActiveView,
    toggleSaveCareer,
    isSaved,
    toggleCompareCareer,
    isComparing,
    openMayaWithPrompt,
  } = useCareer();

  const saved = isSaved(selectedCareer.id);
  const comparing = isComparing(selectedCareer.id);

  const relatedCareers = CAREERS.filter((c) =>
    selectedCareer.relatedCareerIds.includes(c.id)
  );

  // Show the O*NET detail page for O*NET occupation IDs.
  if (/^\d{2}-\d{4}\.\d{2}$/.test(selectedCareerId)) {
    if (
      onetCareerLoading ||
      (!selectedOnetCareer && !onetCareerError)
    ) {
      return (
        <div
          className="container"
          style={{ padding: '60px 0' }}
        >
          Loading O*NET career profile...
        </div>
      );
    }

    if (onetCareerError || !selectedOnetCareer) {
      return (
        <div
          className="container"
          style={{ padding: '60px 0' }}
        >
          <p role="alert">
            {onetCareerError ||
              'Unable to load this career.'}
          </p>

          <button
            className="btn-secondary btn-sm"
            onClick={() => setActiveView('explore')}
          >
            Back to Explore
          </button>
        </div>
      );
    }

    return (
      <OnetCareerDetail
        career={selectedOnetCareer}
        onBack={() => setActiveView('explore')}
        onRelated={setSelectedCareerId}
        onAskMaya={openMayaWithPrompt}
      />
    );
  }

  // Original career profiles are preserved.
  return (
    <div style={{ padding: '36px 0 80px' }}>
      <div className="container">
        <button
          onClick={() => setActiveView('recommendations')}
          className="btn-ghost"
          style={{
            marginBottom: '24px',
            fontSize: '0.92rem',
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Recommendations</span>
        </button>

        <div
          className="card"
          style={{
            padding: '36px',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: '20px',
            }}
          >
            <div>
              <span className="career-category">
                {selectedCareer.category}
              </span>

              <h1
                style={{
                  fontSize: '2.5rem',
                  fontWeight: 800,
                  color: 'var(--dark-slate)',
                  marginTop: '4px',
                  marginBottom: '8px',
                }}
              >
                {selectedCareer.title}
              </h1>

              <p
                style={{
                  fontSize: '1.1rem',
                  color: 'var(--text-muted)',
                  maxWidth: '780px',
                  lineHeight: 1.6,
                }}
              >
                {selectedCareer.description}
              </p>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: '12px',
              }}
            >
              <div
                className={`match-badge ${
                  selectedCareer.baseMatch >= 90
                    ? 'match-high'
                    : 'match-med'
                }`}
              >
                {selectedCareer.baseMatch}% Match for You
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                }}
              >
                <button
                  onClick={() =>
                    toggleSaveCareer(selectedCareer.id)
                  }
                  className={`btn-secondary btn-sm ${
                    saved ? 'tag-active' : ''
                  }`}
                >
                  <Bookmark size={14} />
                  <span>
                    {saved ? 'Saved' : 'Save'}
                  </span>
                </button>

                <button
                  onClick={() =>
                    toggleCompareCareer(selectedCareer.id)
                  }
                  className={`btn-secondary btn-sm ${
                    comparing ? 'tag-active' : ''
                  }`}
                >
                  <BarChart3 size={14} />
                  <span>
                    {comparing ? 'In Compare' : 'Compare'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
            gap: '32px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '32px',
            }}
          >
            <div className="card">
              <h2
                style={{
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  marginBottom: '16px',
                }}
              >
                Why this may fit you
              </h2>

              {selectedCareer.matchReasons.map(
                (reason, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '16px',
                      marginBottom: '12px',
                      backgroundColor:
                        'var(--primary-subtle)',
                      borderRadius:
                        'var(--radius-md)',
                      display: 'flex',
                      gap: '14px',
                    }}
                  >
                    <div
                      style={{
                        color: 'var(--primary)',
                      }}
                    >
                      {iconLookup[reason.icon] || (
                        <CheckCircle2 size={20} />
                      )}
                    </div>

                    <div>
                      <h3
                        style={{
                          fontWeight: 700,
                          marginBottom: '4px',
                        }}
                      >
                        {reason.title}
                      </h3>

                      <p
                        style={{
                          color: 'var(--text-muted)',
                          fontSize: '0.88rem',
                        }}
                      >
                        {reason.description}
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>

            <div
              className="card"
              style={{
                borderLeft:
                  '4px solid var(--accent-gold)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '12px',
                }}
              >
                <AlertTriangle
                  size={22}
                  style={{
                    color: 'var(--accent-gold)',
                  }}
                />

                <h2
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 800,
                  }}
                >
                  What to watch out for
                </h2>
              </div>

              <p style={{ lineHeight: 1.6 }}>
                {selectedCareer.watchOut}
              </p>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '32px',
            }}
          >
            <div className="card">
              <h2
                style={{
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  marginBottom: '18px',
                }}
              >
                Day-to-day breakdown
              </h2>

              <h3
                style={{
                  marginBottom: '12px',
                  fontWeight: 700,
                }}
              >
                Key skills you'll use
              </h3>

              {selectedCareer.skillsUsed.map(
                (skill, idx) => (
                  <div
                    key={idx}
                    style={{
                      marginBottom: '12px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent:
                          'space-between',
                      }}
                    >
                      <strong>{skill.name}</strong>
                      <span>{skill.level}%</span>
                    </div>

                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${skill.level}%`,
                        }}
                      />
                    </div>
                  </div>
                )
              )}

              <h3
                style={{
                  marginTop: '24px',
                  marginBottom: '12px',
                  fontWeight: 700,
                }}
              >
                Skills to develop
              </h3>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px',
                }}
              >
                {selectedCareer.skillsToDevelop.map(
                  (skill, idx) => (
                    <span
                      key={idx}
                      className="badge-tag"
                    >
                      + {skill}
                    </span>
                  )
                )}
              </div>

              <h3
                style={{
                  marginTop: '24px',
                  marginBottom: '12px',
                  fontWeight: 700,
                }}
              >
                Work environment
              </h3>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px',
                }}
              >
                {selectedCareer.workEnvironment.map(
                  (environment, idx) => (
                    <span
                      key={idx}
                      className="badge-tag"
                    >
                      {environment}
                    </span>
                  )
                )}
              </div>
            </div>

            <div
              className="card"
              style={{
                background:
                  'linear-gradient(135deg, #F8FAF9 0%, #EFF8F5 100%)',
              }}
            >
              <h3
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: 'var(--primary)',
                  marginBottom: '14px',
                }}
              >
                <Sparkles
                  size={16}
                  style={{
                    display: 'inline',
                    marginRight: '8px',
                  }}
                />
                Ask Maya about {selectedCareer.title}
              </h3>

              {[
                `What's an average Tuesday like for a ${selectedCareer.title}?`,
                `How stressful is this role?`,
                `What does the first 1-2 years look like?`,
              ].map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() =>
                    openMayaWithPrompt(prompt)
                  }
                  className="maya-prompt-chip"
                  style={{
                    display: 'flex',
                    justifyContent:
                      'space-between',
                    marginBottom: '8px',
                  }}
                >
                  {prompt}
                  <Sparkles size={14} />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginTop: '48px' }}>
          <h2
            style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              marginBottom: '16px',
            }}
          >
            Related Careers to Explore
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
              gap: '20px',
            }}
          >
            {relatedCareers.map((career) => (
              <div
                key={career.id}
                className="card card-hover"
                onClick={() => {
                  setSelectedCareerId(career.id);
                  window.scrollTo({
                    top: 0,
                    behavior: 'smooth',
                  });
                }}
                style={{
                  cursor: 'pointer',
                  padding: '20px',
                }}
              >
                <span className="career-category">
                  {career.category}
                </span>

                <h3
                  style={{
                    fontSize: '1.15rem',
                    fontWeight: 700,
                    margin: '8px 0',
                  }}
                >
                  {career.title}
                </h3>

                <p
                  style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.88rem',
                  }}
                >
                  {career.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
