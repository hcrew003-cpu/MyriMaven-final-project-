
'use client';

import React from 'react';
import { useCareer } from '../context/CareerContext';
import {
  UserRound,
  Mail,
  GraduationCap,
  Heart,
  Lightbulb,
  Target,
  Sliders,
  ArrowRight,
  CheckCircle2,
  Compass,
  Bookmark,
  BarChart3,
  Pencil,
} from 'lucide-react';

export default function ProfileView() {
  const {
    authUser,
    userProfile,
    savedCareerIds,
    compareCareerIds,
    setActiveView,
    setOnboardingStep,
  } = useCareer();

  if (!authUser) {
    return (
      <section
        className="container"
        style={{
          maxWidth: 800,
          margin: '60px auto',
          padding: 24,
        }}
      >
        <h1>My Profile</h1>
        <p>Please log in to view your profile.</p>

        <button
          className="btn-primary"
          onClick={() => setActiveView('auth')}
          style={{ marginTop: 20 }}
        >
          Sign Up / Log In
        </button>
      </section>
    );
  }

  const editProfile = (step: number) => {
    setOnboardingStep(step);
    setActiveView('onboarding');
  };

  const interests = userProfile.interests ?? [];
  const goals = userProfile.goals ?? [];

  const skills = Object.entries(
    userProfile.skills ?? {}
  )
    .filter(([, level]) => level > 0)
    .sort((a, b) => b[1] - a[1]);

  const preferences = Object.entries(
    userProfile.preferences ?? {}
  );

  const completedSections = [
    interests.length > 0,
    skills.length > 0,
    preferences.length > 0,
    goals.length > 0,
  ].filter(Boolean).length;

  const displayName =
    userProfile.name?.trim() ||
    authUser.email?.split('@')[0] ||
    'Career Explorer';

  const cardStyle: React.CSSProperties = {
    background: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: 16,
    padding: 24,
  };

  const chipStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '8px 12px',
    borderRadius: 20,
    background: 'var(--primary-subtle)',
    color: 'var(--primary)',
    fontSize: 13,
    fontWeight: 600,
  };

  const sectionHeader = (
    icon: React.ReactNode,
    title: string,
    description: string,
    step: number
  ) => (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 16,
        marginBottom: 18,
      }}
    >
      <div style={{ display: 'flex', gap: 12 }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: 'var(--primary-subtle)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {icon}
        </div>

        <div>
          <h2
            style={{
              fontSize: 18,
              fontWeight: 750,
              color: 'var(--dark-slate)',
              margin: 0,
            }}
          >
            {title}
          </h2>

          <p
            style={{
              fontSize: 13,
              color: 'var(--text-muted)',
              marginTop: 4,
            }}
          >
            {description}
          </p>
        </div>
      </div>

      <button
        className="btn-secondary btn-sm"
        onClick={() => editProfile(step)}
        aria-label={`Edit ${title}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          flexShrink: 0,
        }}
      >
        <Pencil size={14} />
        Edit
      </button>
    </div>
  );

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div
        className="container"
        style={{ maxWidth: 1100 }}
      >
        {/* Profile Header */}
        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 20,
              background: 'var(--primary-subtle)',
              color: 'var(--primary)',
              fontSize: 13,
              fontWeight: 700,
              marginBottom: 12,
            }}
          >
            <UserRound size={15} />
            My Career Profile
          </div>

          <h1
            style={{
              fontSize: '2.3rem',
              fontWeight: 800,
              color: 'var(--dark-slate)',
            }}
          >
            Your Career Exploration Profile
          </h1>

          <p
            style={{
              color: 'var(--text-muted)',
              marginTop: 8,
              fontSize: 16,
            }}
          >
            Review your interests, strengths, work
            preferences, and goals. Update them as
            you explore different career possibilities.
          </p>
        </div>

        {/* Profile Overview */}
        <div
          style={{
            ...cardStyle,
            marginBottom: 24,
            background:
              'linear-gradient(135deg, #f0fdf9 0%, #ffffff 100%)',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 20,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
              }}
            >
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 18,
                  background: 'var(--primary)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <UserRound size={30} />
              </div>

              <div>
                <h2
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    marginBottom: 5,
                  }}
                >
                  {displayName}
                </h2>

                <p
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 14,
                    color: 'var(--text-muted)',
                    overflowWrap: 'anywhere',
                  }}
                >
                  <Mail size={14} />
                  {authUser.email}
                </p>

                {userProfile.careerStage && (
                  <p
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      marginTop: 6,
                      fontSize: 13,
                      color: 'var(--text-muted)',
                    }}
                  >
                    <GraduationCap size={15} />
                    {userProfile.careerStage}
                  </p>
                )}
              </div>
            </div>

            <div
              style={{
                textAlign: 'center',
                padding: '12px 18px',
                borderRadius: 12,
                background: 'white',
                border: '1px solid #e5e7eb',
              }}
            >
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 800,
                  color: 'var(--primary)',
                }}
              >
                {completedSections}/4
              </div>

              <div
                style={{
                  fontSize: 12,
                  color: 'var(--text-muted)',
                }}
              >
                Profile areas with information
              </div>
            </div>
          </div>
        </div>

        {/* Exploration Stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 16,
            marginBottom: 28,
          }}
        >
          {[
            {
              label: 'Interests',
              value: interests.length,
              icon: <Heart size={19} />,
            },
            {
              label: 'Skills',
              value: skills.length,
              icon: <Lightbulb size={19} />,
            },
            {
              label: 'Saved Careers',
              value: savedCareerIds.length,
              icon: <Bookmark size={19} />,
            },
            {
              label: 'Comparing',
              value: compareCareerIds.length,
              icon: <BarChart3 size={19} />,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                ...cardStyle,
                padding: 20,
              }}
            >
              <div
                style={{
                  color: 'var(--primary)',
                  marginBottom: 10,
                }}
              >
                {stat.icon}
              </div>

              <div
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  color: 'var(--dark-slate)',
                }}
              >
                {stat.value}
              </div>

              <div
                style={{
                  fontSize: 13,
                  color: 'var(--text-muted)',
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Career Profile Sections */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(min(100%, 420px), 1fr))',
            gap: 20,
          }}
        >
          {/* Interests */}
          <div style={cardStyle}>
            {sectionHeader(
              <Heart size={20} />,
              'My Interests',
              'Career areas that spark your curiosity',
              1
            )}

            {interests.length > 0 ? (
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 8,
                }}
              >
                {interests.map((interest) => (
                  <span
                    key={interest}
                    style={chipStyle}
                  >
                    {interest}
                  </span>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>
                No interests selected yet.
              </p>
            )}
          </div>

          {/* Skills */}
          <div style={cardStyle}>
            {sectionHeader(
              <Lightbulb size={20} />,
              'My Skills & Strengths',
              'Skills you bring to your career exploration',
              2
            )}

            {skills.length > 0 ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                {skills.map(([skill, level]) => (
                  <div key={skill}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 12,
                        fontSize: 13,
                        marginBottom: 6,
                      }}
                    >
                      <strong>{skill}</strong>
                      <span
                        style={{
                          color: 'var(--text-muted)',
                        }}
                      >
                        {level}/5
                      </span>
                    </div>

                    <div
                      style={{
                        width: '100%',
                        height: 7,
                        background: '#e5e7eb',
                        borderRadius: 20,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${Math.min(
                            100,
                            Math.max(0, (level / 5) * 100)
                          )}%`,
                          background: 'var(--primary)',
                          borderRadius: 20,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>
                No skills selected yet.
              </p>
            )}
          </div>

          {/* Preferences */}
          <div style={cardStyle}>
            {sectionHeader(
              <Sliders size={20} />,
              'My Work Preferences',
              'How you prefer to work and collaborate',
              3
            )}

            {preferences.length > 0 ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                {preferences.map(([key, value]) => (
                  <div
                    key={key}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 10,
                      background: '#f8fafc',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 12,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        textTransform: 'capitalize',
                      }}
                    >
                      {key
                        .replace(/([A-Z])/g, ' $1')
                        .replace(/_/g, ' ')}
                    </span>

                    <span
                      style={{
                        fontSize: 13,
                        color: 'var(--primary)',
                        fontWeight: 700,
                      }}
                    >
                      {String(value)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>
                No work preferences selected yet.
              </p>
            )}
          </div>

          {/* Goals */}
          <div style={cardStyle}>
            {sectionHeader(
              <Target size={20} />,
              'My Career Goals',
              'What matters most in your future career',
              4
            )}

            {goals.length > 0 ? (
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 8,
                }}
              >
                {goals.map((goal) => (
                  <span
                    key={goal}
                    style={chipStyle}
                  >
                    <CheckCircle2
                      size={13}
                      style={{ marginRight: 5 }}
                    />
                    {goal}
                  </span>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>
                No career goals selected yet.
              </p>
            )}
          </div>
        </div>

        {/* Bottom Actions */}
        <div
          style={{
            ...cardStyle,
            marginTop: 28,
            background: '#f8fafc',
          }}
        >
          <h2
            style={{
              fontSize: 19,
              fontWeight: 800,
              marginBottom: 8,
            }}
          >
            Ready to Explore What's Next?
          </h2>

          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: 14,
              marginBottom: 20,
            }}
          >
            Your career profile helps MyriMaven
            generate personalized O*NET career
            recommendations. You can update
            your profile as your interests and
            priorities change.
          </p>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <button
              className="btn-primary"
              onClick={() =>
                setActiveView('recommendations')
              }
            >
              <Compass size={17} />
              Explore My Career Matches
              <ArrowRight size={16} />
            </button>

            <button
              className="btn-secondary"
              onClick={() => editProfile(6)}
            >
              <Pencil size={16} />
              Review Full Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
