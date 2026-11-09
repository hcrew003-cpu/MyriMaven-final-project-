
'use client';

import React from 'react';
import { useCareer } from '../context/CareerContext';
import { useOnetRecommendations } from '../hooks/useOnetRecommendations';
import {
  Sparkles,
  Sliders,
  BarChart3,
  ArrowRight,
  ChevronRight,
  Bookmark,
  UserRound,
  RefreshCw,
} from 'lucide-react';

export default function DashboardView() {
  const {
    userProfile,
    savedCareerIds,
    compareCareerIds,
    setActiveView,
    setSelectedCareerId,
    setOnboardingStep,
    openMayaWithPrompt,
  } = useCareer();

  const {
    catalog,
    rankedCareers,
    loadingCatalog,
    loadingDetails,
    error,
    reload,
  } = useOnetRecommendations();

  const evaluatedCount = rankedCareers.length;

  const highMatchCount = rankedCareers.filter(
    ({ match }) => match.score >= 80
  ).length;

  const topMatches = rankedCareers.slice(0, 3);

  const isLoading = loadingCatalog || loadingDetails;

  const interestsCount = userProfile.interests?.length ?? 0;
  const goalsCount = userProfile.goals?.length ?? 0;

  const skillsCount = Object.values(
    userProfile.skills ?? {}
  ).filter(
    (rating) =>
      typeof rating === 'number' &&
      Number.isFinite(rating)
  ).length;

  const profileSections = [
    interestsCount > 0,
    skillsCount > 0,
    goalsCount > 0,
    Boolean(userProfile.preferences),
  ];

  const completedSections = profileSections.filter(Boolean).length;

  const openCareer = (id: string) => {
    setSelectedCareerId(id);
    setActiveView('detail');
  };

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        {/* Welcome Header */}
        <div style={{ marginBottom: '32px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'var(--primary-subtle)',
              color: 'var(--primary)',
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.85rem',
              fontWeight: 700,
              marginBottom: '10px',
            }}
          >
            <Sparkles size={14} />
            Student Explorer Dashboard
          </div>

          <h1
            style={{
              fontSize: '2.4rem',
              fontWeight: 800,
              color: 'var(--dark-slate)',
            }}
          >
            Welcome back{userProfile.name ? `, ${userProfile.name}` : ''}!
          </h1>

          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: '1.05rem',
              marginTop: '4px',
            }}
          >
            Here is your current career exploration landscape
            and tailored next steps.
          </p>
        </div>

        {/* Four Metric Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px',
            marginBottom: '36px',
          }}
        >
          {/* Recommended Roles */}
          <div
            onClick={() => setActiveView('recommendations')}
            className="card card-hover"
            style={{
              cursor: 'pointer',
              padding: '22px',
            }}
          >
            <div
              style={{
                fontSize: '0.85rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
              }}
            >
              Recommended Roles
            </div>

            <div
              style={{
                fontSize: '2.2rem',
                fontWeight: 800,
                color: 'var(--primary)',
                margin: '4px 0',
              }}
            >
              {loadingCatalog ? '...' : evaluatedCount}
            </div>

            <div
              style={{
                fontSize: '0.82rem',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>
                {isLoading
                  ? 'Evaluating O*NET careers...'
                  : `${highMatchCount} estimated matches at 80%+`}
              </span>
              <ChevronRight size={14} />
            </div>
          </div>

          {/* Saved Careers */}
          <div
            onClick={() => setActiveView('saved')}
            className="card card-hover"
            style={{
              cursor: 'pointer',
              padding: '22px',
            }}
          >
            <div
              style={{
                fontSize: '0.85rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
              }}
            >
              Saved for Later
            </div>

            <div
              style={{
                fontSize: '2.2rem',
                fontWeight: 800,
                color: 'var(--accent-gold)',
                margin: '4px 0',
              }}
            >
              {savedCareerIds.length}
            </div>

            <div
              style={{
                fontSize: '0.82rem',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>
                {compareCareerIds.length} in comparison
              </span>
              <ChevronRight size={14} />
            </div>
          </div>

          {/* What-If Sandbox */}
          <div
            onClick={() => setActiveView('what-if')}
            className="card card-hover"
            style={{
              cursor: 'pointer',
              padding: '22px',
            }}
          >
            <div
              style={{
                fontSize: '0.85rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
              }}
            >
              What-If Sandbox
            </div>

            <div
              style={{
                fontSize: '2.2rem',
                fontWeight: 800,
                color: '#2563EB',
                margin: '4px 0',
              }}
            >
              Explore
            </div>

            <div
              style={{
                fontSize: '0.82rem',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>Test different career priorities</span>
              <ChevronRight size={14} />
            </div>
          </div>

          {/* Profile Information */}
          <div
            onClick={() => {
              setOnboardingStep(6);
              setActiveView('onboarding');
            }}
            className="card card-hover"
            style={{
              cursor: 'pointer',
              padding: '22px',
            }}
          >
            <div
              style={{
                fontSize: '0.85rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
              }}
            >
              Profile Information
            </div>

            <div
              style={{
                fontSize: '2.2rem',
                fontWeight: 800,
                color: '#166534',
                margin: '4px 0',
              }}
            >
              {completedSections} / {profileSections.length}
            </div>

            <div
              style={{
                fontSize: '0.82rem',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>Profile sections with information</span>
              <ChevronRight size={14} />
            </div>
          </div>
        </div>

        {/* Recommended Next Actions */}
        <div style={{ marginBottom: '40px' }}>
          <h2
            style={{
              fontSize: '1.4rem',
              fontWeight: 800,
              color: 'var(--dark-slate)',
              marginBottom: '16px',
            }}
          >
            Recommended Next Actions
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
              gap: '20px',
            }}
          >
            {/* What-If Action */}
            <div
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '24px',
              }}
            >
              <div>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--primary-subtle)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '14px',
                  }}
                >
                  <Sliders size={20} />
                </div>

                <h3
                  style={{
                    fontSize: '1.15rem',
                    fontWeight: 700,
                    marginBottom: '6px',
                  }}
                >
                  Explore What-If Scenarios
                </h3>

                <p
                  style={{
                    fontSize: '0.9rem',
                    color: 'var(--text-muted)',
                    lineHeight: 1.5,
                    marginBottom: '20px',
                  }}
                >
                  Change your career priorities and work preferences
                  to explore how different choices affect your
                  estimated career matches.
                </p>
              </div>

              <button
                onClick={() => setActiveView('what-if')}
                className="btn-primary btn-sm"
                style={{ alignSelf: 'flex-start' }}
              >
                <span>Launch Sandbox</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Maya Action */}
            <div
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '24px',
              }}
            >
              <div>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--accent-gold-bg)',
                    color: 'var(--accent-gold)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '14px',
                  }}
                >
                  <Sparkles size={20} />
                </div>

                <h3
                  style={{
                    fontSize: '1.15rem',
                    fontWeight: 700,
                    marginBottom: '6px',
                  }}
                >
                  Ask Maya for Honest Trade-offs
                </h3>

                <p
                  style={{
                    fontSize: '0.9rem',
                    color: 'var(--text-muted)',
                    lineHeight: 1.5,
                    marginBottom: '20px',
                  }}
                >
                  Ask Maya about career responsibilities,
                  important skills, daily challenges, and
                  how different paths may fit your goals.
                </p>
              </div>

              <button
                onClick={() =>
                  openMayaWithPrompt(
                    'What should I consider when comparing career options based on my interests, skills, and goals?'
                  )
                }
                className="btn-secondary btn-sm"
                style={{ alignSelf: 'flex-start' }}
              >
                <span>Talk with Maya</span>
                <Sparkles size={14} />
              </button>
            </div>

            {/* Compare Action */}
            <div
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '24px',
              }}
            >
              <div>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: '#EFF6FF',
                    color: '#2563EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '14px',
                  }}
                >
                  <BarChart3 size={20} />
                </div>

                <h3
                  style={{
                    fontSize: '1.15rem',
                    fontWeight: 700,
                    marginBottom: '6px',
                  }}
                >
                  Compare Your Saved Careers
                </h3>

                <p
                  style={{
                    fontSize: '0.9rem',
                    color: 'var(--text-muted)',
                    lineHeight: 1.5,
                    marginBottom: '20px',
                  }}
                >
                  Compare selected O*NET careers side by side
                  to review their responsibilities, skills,
                  and potential trade-offs.
                </p>
              </div>

              <button
                onClick={() => setActiveView('compare')}
                className="btn-secondary btn-sm"
                style={{ alignSelf: 'flex-start' }}
              >
                <span>Compare Roles</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Top O*NET Recommendations */}
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '16px',
            }}
          >
            <h2
              style={{
                fontSize: '1.4rem',
                fontWeight: 800,
                color: 'var(--dark-slate)',
              }}
            >
              Your Top 3 Recommendations
            </h2>

            <button
              onClick={() => setActiveView('recommendations')}
              className="btn-ghost"
              style={{ fontSize: '0.92rem' }}
            >
              <span>View All Matches</span>
              <ChevronRight size={16} />
            </button>
          </div>

          <p
            style={{
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
              marginBottom: '18px',
            }}
          >
            Personalized estimates based on your profile
            and available O*NET occupation information.
            {catalog.length > 0 &&
              ` Evaluating a shortlist from ${catalog.length} occupations.`}
          </p>

          {isLoading && (
            <p
              style={{
                color: 'var(--text-muted)',
                marginBottom: '16px',
              }}
            >
              Evaluating careers... {evaluatedCount} loaded.
            </p>
          )}

          {error && (
            <div
              className="card"
              style={{
                padding: '24px',
                marginBottom: '20px',
              }}
            >
              <p style={{ marginBottom: '12px' }}>
                {error}
              </p>

              <button
                className="btn-primary btn-sm"
                onClick={reload}
              >
                <RefreshCw size={16} />
                Retry
              </button>
            </div>
          )}

          {!isLoading && !error && topMatches.length === 0 && (
            <div
              className="card"
              style={{ padding: '24px' }}
            >
              <p>
                No career recommendations are available
                yet. Visit Personalized Recommendations
                to explore O*NET occupations.
              </p>
            </div>
          )}

          {topMatches.length > 0 && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
                gap: '20px',
              }}
            >
              {topMatches.map(({ career, match }) => (
                <div
                  key={career.id}
                  onClick={() => openCareer(career.id)}
                  className="card card-hover"
                  style={{
                    cursor: 'pointer',
                    padding: '22px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '8px',
                    }}
                  >
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
                      {match.score}%
                    </span>
                  </div>

                  <h3
                    style={{
                      fontSize: '1.2rem',
                      fontWeight: 700,
                      color: 'var(--dark-slate)',
                      marginBottom: '6px',
                    }}
                  >
                    {career.title}
                  </h3>

                  <p
                    style={{
                      fontSize: '0.88rem',
                      color: 'var(--text-muted)',
                      lineHeight: 1.4,
                      marginBottom: '12px',
                    }}
                  >
                    {career.description ||
                      'Open this occupation to learn more.'}
                  </p>

                  {match.reasons.length > 0 && (
                    <p
                      style={{
                        fontSize: '0.85rem',
                        color: 'var(--primary)',
                        marginBottom: '12px',
                      }}
                    >
                      <strong>Why this may fit: </strong>
                      {match.reasons[0]}
                    </p>
                  )}

                  <div
                    style={{
                      fontSize: '0.85rem',
                      color: 'var(--primary)',
                      fontWeight: 600,
                    }}
                  >
                    View full career breakdown →
                  </div>
                </div>
              ))}
            </div>
          )}

          <p
            style={{
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              marginTop: '16px',
            }}
          >
            Match percentages are exploratory estimates,
            not predictions of career success.
          </p>
        </div>
      </div>
    </div>
  );
}
