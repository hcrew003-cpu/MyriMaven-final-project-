
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
  Compass,
  Target,
  CheckCircle2,
  Heart,
  Lightbulb,
  MessageCircle,
  BriefcaseBusiness,
  History,
  Clock3,
} from 'lucide-react';

const cardStyle: React.CSSProperties = {
  background: 'white',
  border: '1px solid #e5e7eb',
  borderRadius: 16,
  padding: 24,
};

export default function DashboardView() {
  const {
    userProfile,
    savedCareerIds,
    compareCareerIds,
    careerHistory,
    setActiveView,
    setSelectedCareerId,
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

  const isLoading = loadingCatalog || loadingDetails;
  const evaluatedCount = rankedCareers.length;

  const highMatchCount = rankedCareers.filter(
    ({ match }) => match.score >= 80
  ).length;

  const topMatches = rankedCareers.slice(0, 3);

  const interestsCount = userProfile.interests?.length ?? 0;
  const goalsCount = userProfile.goals?.length ?? 0;

  const skillsCount = Object.values(
    userProfile.skills ?? {}
  ).filter(
    (rating) =>
      typeof rating === 'number' &&
      Number.isFinite(rating) &&
      rating > 0
  ).length;

  const preferencesCount = Object.values(
    userProfile.preferences ?? {}
  ).filter(
    (value) =>
      typeof value === 'number' &&
      Number.isFinite(value)
  ).length;

  const profileSections = [
    interestsCount > 0,
    skillsCount > 0,
    preferencesCount > 0,
    goalsCount > 0,
  ];

  const completedSections = profileSections.filter(Boolean).length;
  const profileProgress = (completedSections / 4) * 100;

  const displayName = userProfile.name?.trim();

  const openCareer = (id: string) => {
    setSelectedCareerId(id);
    setActiveView('detail');
  };

  const openMaya = () => {
    openMayaWithPrompt(
      'Based on my career exploration profile, what should I consider when comparing different career paths? Please explain the potential benefits, challenges, and skills I may need to develop.'
    );
  };

  const metricCards = [
    {
      title: 'O*NET Roles Evaluated',
      value: loadingCatalog ? '...' : evaluatedCount,
      detail: isLoading
        ? 'Finding career matches...'
        : `${highMatchCount} estimated matches at 80%+`,
      icon: <Compass size={20} />,
      color: 'var(--primary)',
      destination: 'recommendations' as const,
    },
    {
      title: 'Saved Careers',
      value: savedCareerIds.length,
      detail: `${compareCareerIds.length} selected for comparison`,
      icon: <Bookmark size={20} />,
      color: '#b7791f',
      destination: 'saved' as const,
    },
    {
      title: 'Career Comparisons',
      value: `${compareCareerIds.length}/3`,
      detail: 'Explore careers side by side',
      icon: <BarChart3 size={20} />,
      color: '#2563eb',
      destination: 'compare' as const,
    },
    {
      title: 'My Career Profile',
      value: `${completedSections}/4`,
      detail: 'View and update your information',
      icon: <UserRound size={20} />,
      color: '#166534',
      destination: 'profile' as const,
    },
  ];

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container" style={{ maxWidth: 1150 }}>
        {/* Welcome Header */}
        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'var(--primary-subtle)',
              color: 'var(--primary)',
              padding: '6px 12px',
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 700,
              marginBottom: 12,
            }}
          >
            <Sparkles size={15} />
            Your Career Exploration Dashboard
          </div>

          <h1
            style={{
              fontSize: '2.4rem',
              fontWeight: 800,
              color: 'var(--dark-slate)',
            }}
          >
            Welcome back{displayName ? `, ${displayName}` : ''}!
          </h1>

          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: 16,
              marginTop: 8,
              lineHeight: 1.6,
            }}
          >
            Your career journey is yours to explore.
            Discover possibilities, compare your options,
            and revisit your priorities as they change.
          </p>
        </div>

        {/* Dashboard Metrics */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(210px, 1fr))',
            gap: 16,
            marginBottom: 28,
          }}
        >
          {metricCards.map((metric) => (
            <button
              key={metric.title}
              type="button"
              className="card card-hover"
              onClick={() => setActiveView(metric.destination)}
              style={{
                ...cardStyle,
                textAlign: 'left',
                cursor: 'pointer',
                width: '100%',
                fontFamily: 'inherit',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 12,
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 750,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: 0.4,
                  }}
                >
                  {metric.title}
                </span>

                <span style={{ color: metric.color }}>
                  {metric.icon}
                </span>
              </div>

              <div
                style={{
                  fontSize: 32,
                  fontWeight: 800,
                  color: metric.color,
                  marginBottom: 8,
                }}
              >
                {metric.value}
              </div>

              <div
                style={{
                  fontSize: 13,
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                {metric.detail}
                <ChevronRight size={14} />
              </div>
            </button>
          ))}
        </div>

        {/* Profile Snapshot */}
        <div
          style={{
            ...cardStyle,
            marginBottom: 32,
            background:
              'linear-gradient(135deg, #f0fdf9 0%, #ffffff 100%)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: 16,
              marginBottom: 18,
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: 19,
                  fontWeight: 800,
                  color: 'var(--dark-slate)',
                  marginBottom: 6,
                }}
              >
                Your Career Profile Snapshot
              </h2>

              <p
                style={{
                  fontSize: 14,
                  color: 'var(--text-muted)',
                }}
              >
                These are the details guiding your
                personalized career recommendations.
              </p>
            </div>

            <button
              className="btn-secondary btn-sm"
              onClick={() => setActiveView('profile')}
            >
              <UserRound size={15} />
              Edit Profile
            </button>
          </div>

          <div
            style={{
              height: 8,
              background: '#e5e7eb',
              borderRadius: 20,
              overflow: 'hidden',
              marginBottom: 18,
            }}
            role="progressbar"
            aria-valuenow={completedSections}
            aria-valuemin={0}
            aria-valuemax={4}
            aria-label="Profile areas with information"
          >
            <div
              style={{
                height: '100%',
                width: `${profileProgress}%`,
                background: 'var(--primary)',
                borderRadius: 20,
              }}
            />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 14,
            }}
          >
            {[
              {
                icon: <Heart size={17} />,
                label: 'Interests',
                value: `${interestsCount} selected`,
              },
              {
                icon: <Lightbulb size={17} />,
                label: 'Skills',
                value: `${skillsCount} rated`,
              },
              {
                icon: <Sliders size={17} />,
                label: 'Work Preferences',
                value: `${preferencesCount} available`,
              },
              {
                icon: <Target size={17} />,
                label: 'Career Goals',
                value: `${goalsCount} selected`,
              },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  padding: 14,
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: 12,
                }}
              >
                <div
                  style={{
                    color: 'var(--primary)',
                    marginBottom: 8,
                  }}
                >
                  {item.icon}
                </div>

                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: 'var(--dark-slate)',
                  }}
                >
                  {item.label}
                </div>

                <div
                  style={{
                    fontSize: 13,
                    color: 'var(--text-muted)',
                    marginTop: 4,
                  }}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          <p
            style={{
              fontSize: 12,
              color: 'var(--text-muted)',
              marginTop: 16,
            }}
          >
            Profile progress reflects available information,
            not a measure of career readiness.
          </p>
        </div>

        {/* Top Recommendations */}
        <section style={{ marginBottom: 36 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
              marginBottom: 12,
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: 23,
                  fontWeight: 800,
                  color: 'var(--dark-slate)',
                }}
              >
                Your Top Career Matches
              </h2>

              <p
                style={{
                  fontSize: 13,
                  color: 'var(--text-muted)',
                  marginTop: 5,
                }}
              >
                Your three highest-ranked matches
                from the O*NET occupations evaluated so far.
              </p>
            </div>

            <button
              className="btn-ghost"
              onClick={() => setActiveView('recommendations')}
            >
              View All Matches
              <ArrowRight size={16} />
            </button>
          </div>

          {catalog.length > 0 && (
            <p
              style={{
                fontSize: 12,
                color: 'var(--text-muted)',
                marginBottom: 14,
              }}
            >
              Exploring a shortlist drawn from
              {' '}{catalog.length} O*NET occupations.
            </p>
          )}

          {isLoading && (
            <p
              role="status"
              style={{
                color: 'var(--text-muted)',
                marginBottom: 16,
              }}
            >
              Evaluating O*NET careers...
              {' '}{evaluatedCount} loaded so far.
            </p>
          )}

          {error && (
            <div
              style={{ ...cardStyle, marginBottom: 18 }}
              role="alert"
            >
              <p style={{ marginBottom: 14 }}>{error}</p>
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
            <div style={cardStyle}>
              <p
                style={{
                  color: 'var(--text-muted)',
                  marginBottom: 16,
                }}
              >
                No career matches are available yet.
                Explore your personalized recommendations
                to get started.
              </p>

              <button
                className="btn-primary btn-sm"
                onClick={() => setActiveView('recommendations')}
              >
                Explore Careers
                <ArrowRight size={16} />
              </button>
            </div>
          )}

          {topMatches.length > 0 && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
                gap: 18,
              }}
            >
              {topMatches.map(({ career, match }, index) => (
                <button
                  type="button"
                  key={career.id}
                  onClick={() => openCareer(career.id)}
                  className="card card-hover"
                  style={{
                    ...cardStyle,
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 10,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        color: 'var(--primary)',
                        fontWeight: 750,
                      }}
                    >
                      #{index + 1} Estimated Match
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
                      fontSize: 19,
                      fontWeight: 750,
                      color: 'var(--dark-slate)',
                    }}
                  >
                    {career.title}
                  </h3>

                  <p
                    style={{
                      fontSize: 13,
                      color: 'var(--text-muted)',
                      lineHeight: 1.6,
                    }}
                  >
                    {career.description ||
                      'Explore this O*NET occupation to learn more.'}
                  </p>

                  {match.reasons.length > 0 && (
                    <div
                      style={{
                        padding: 12,
                        borderRadius: 10,
                        background: 'var(--primary-subtle)',
                        fontSize: 13,
                        lineHeight: 1.5,
                        color: 'var(--dark-slate)',
                      }}
                    >
                      <strong>Why this may fit: </strong>
                      {match.reasons[0]}
                    </div>
                  )}

                  <div
                    style={{
                      marginTop: 'auto',
                      paddingTop: 8,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      color: 'var(--primary)',
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    View Career Details
                    <ArrowRight size={15} />
                  </div>
                </button>
              ))}
            </div>
          )}

          <p
            style={{
              fontSize: 12,
              color: 'var(--text-muted)',
              marginTop: 16,
            }}
          >
            Match scores are exploratory estimates
            based on available information, not predictions
            of career success.
          </p>
        </section>

        {/* Recently Viewed Careers */}
        <section style={{ marginBottom: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <History size={23} style={{ color: 'var(--primary)' }} />
            <h2 style={{ fontSize: 23, fontWeight: 800, color: 'var(--dark-slate)' }}>
              Recently Viewed Careers
            </h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 18 }}>
            Pick up where you left off, even if you didn't save a career.
          </p>
          {careerHistory.length === 0 ? (
            <div style={cardStyle}>
              <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>
                You haven't viewed any career profiles yet. Explore the directory to get started.
              </p>
              <button type="button" className="btn-primary btn-sm" onClick={() => setActiveView('explore')}>
                Explore Careers <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 14 }}>
              {careerHistory.slice(0, 5).map((item) => {
                const viewedDate = new Date(item.viewed_at);
                const dateLabel = Number.isNaN(viewedDate.getTime())
                  ? 'Previously viewed'
                  : viewedDate.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
                return (
                  <button
                    key={item.id}
                    type="button"
                    className="card card-hover"
                    onClick={() => openCareer(item.career_id)}
                    style={{ ...cardStyle, textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', width: '100%' }}
                  >
                    <div style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 700, marginBottom: 10 }}>
                      {/^\d{2}-\d{4}\.\d{2}$/.test(item.career_id) ? 'O*NET Occupation' : 'Career Profile'}
                    </div>
                    <h3 style={{ fontSize: 17, fontWeight: 750, color: 'var(--dark-slate)', marginBottom: 10 }}>
                      {item.career_title}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 12, marginBottom: 14 }}>
                      <Clock3 size={14} /> Last viewed {dateLabel}
                    </div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--primary)', fontSize: 13, fontWeight: 700 }}>
                      Reopen Career <ArrowRight size={15} />
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Next Steps */}
        <section>
          <h2
            style={{
              fontSize: 23,
              fontWeight: 800,
              color: 'var(--dark-slate)',
              marginBottom: 8,
            }}
          >
            What Would You Like to Explore Next?
          </h2>

          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: 14,
              marginBottom: 20,
            }}
          >
            There is no single right career path.
            Use these tools to explore different possibilities.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
              gap: 18,
            }}
          >
            {[
              {
                title: 'Explore What-If Scenarios',
                description:
                  'Experiment with different career priorities and work preferences without changing your saved profile.',
                icon: <Sliders size={22} />,
                action: 'Launch Sandbox',
                onClick: () => setActiveView('what-if'),
              },
              {
                title: 'Ask Maya About Your Options',
                description:
                  'Discuss career responsibilities, important skills, potential challenges, and trade-offs with Maya.',
                icon: <MessageCircle size={22} />,
                action: 'Talk with Maya',
                onClick: openMaya,
              },
              {
                title: 'Compare Career Paths',
                description:
                  'Compare up to three selected careers side by side to better understand their similarities and differences.',
                icon: <BarChart3 size={22} />,
                action: 'Compare Careers',
                onClick: () => setActiveView('compare'),
              },
            ].map((action) => (
              <div
                key={action.title}
                style={{
                  ...cardStyle,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: 'var(--primary-subtle)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                  }}
                >
                  {action.icon}
                </div>

                <h3
                  style={{
                    fontSize: 18,
                    fontWeight: 750,
                    color: 'var(--dark-slate)',
                    marginBottom: 10,
                  }}
                >
                  {action.title}
                </h3>

                <p
                  style={{
                    fontSize: 14,
                    color: 'var(--text-muted)',
                    lineHeight: 1.6,
                    marginBottom: 20,
                    flex: 1,
                  }}
                >
                  {action.description}
                </p>

                <button
                  className="btn-secondary btn-sm"
                  onClick={action.onClick}
                  style={{ alignSelf: 'flex-start' }}
                >
                  {action.action}
                  <ArrowRight size={15} />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
