
'use client';

import React, { useEffect, useState } from 'react';
import { useCareer } from '../context/CareerContext';
import {
  ALL_INTERESTS,
  ALL_SKILLS,
  ALL_GOALS,
} from '../data/careersData';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Sparkles,
  Cpu,
  Briefcase,
  HeartHandshake,
  Palette,
  Leaf,
  Puzzle,
  Crown,
  BarChart3,
  Megaphone,
  Smile,
  Stethoscope,
  Rocket,
  Edit2,
  Bookmark,
} from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  Cpu: <Cpu size={22} />,
  Briefcase: <Briefcase size={22} />,
  HeartHandshake: <HeartHandshake size={22} />,
  Palette: <Palette size={22} />,
  Leaf: <Leaf size={22} />,
  Puzzle: <Puzzle size={22} />,
  Crown: <Crown size={22} />,
  BarChart3: <BarChart3 size={22} />,
  Megaphone: <Megaphone size={22} />,
  Smile: <Smile size={22} />,
  Stethoscope: <Stethoscope size={22} />,
  Rocket: <Rocket size={22} />,
};

type PreferenceKey =
  | 'soloVsTeam'
  | 'structuredVsFlexible'
  | 'officeVsRemote'
  | 'peopleVsTask'
  | 'creativeVsAnalytical'
  | 'fastVsPredictable';

const WORK_PREFERENCE_SLIDERS: {
  key: PreferenceKey;
  label: string;
  left: string;
  right: string;
  descriptions: [string, string, string, string, string];
}[] = [
  {
    key: 'soloVsTeam',
    label: 'Collaboration preference',
    left: 'Solo work',
    right: 'Team collaboration',
    descriptions: [
      'Strongly prefers independent work and solo concentration',
      'Leans toward working independently',
      'Enjoys a balance of solo work and teamwork',
      'Leans toward collaborating with others',
      'Strongly prefers teamwork and shared projects',
    ],
  },
  {
    key: 'structuredVsFlexible',
    label: 'Work structure preference',
    left: 'Structured & clear tasks',
    right: 'Flexible & open-ended',
    descriptions: [
      'Strongly prefers clear instructions and predictable routines',
      'Leans toward structured plans and defined tasks',
      'Enjoys a mix of structure and flexibility',
      'Leans toward flexible tasks and changing plans',
      'Strongly prefers open-ended work and freedom to adapt',
    ],
  },
  {
    key: 'officeVsRemote',
    label: 'Work location preference',
    left: 'In-office presence',
    right: 'Fully remote freedom',
    descriptions: [
      'Strongly prefers working in person at a workplace',
      'Leans toward working in person most days',
      'Prefers a balance of in-person and remote work',
      'Leans toward working remotely most days',
      'Strongly prefers fully remote work',
    ],
  },
  {
    key: 'peopleVsTask',
    label: 'Daily work focus preference',
    left: 'People-oriented',
    right: 'Task & systems-oriented',
    descriptions: [
      'Strongly prefers people-focused interactions and relationships',
      'Leans toward helping and working directly with people',
      'Enjoys a balance of people-focused and task-focused work',
      'Leans toward completing tasks and working with systems',
      'Strongly prefers task-focused and systems-oriented work',
    ],
  },
  {
    key: 'creativeVsAnalytical',
    label: 'Thinking style preference',
    left: 'Creative expression',
    right: 'Analytical precision',
    descriptions: [
      'Strongly prefers imaginative and creative work',
      'Leans toward generating ideas and creative expression',
      'Enjoys a balance of creative and analytical thinking',
      'Leans toward logic, research, and analysis',
      'Strongly prefers analytical thinking and detailed problem-solving',
    ],
  },
  {
    key: 'fastVsPredictable',
    label: 'Work pace preference',
    left: 'Fast-paced & changing',
    right: 'Predictable & steady',
    descriptions: [
      'Strongly prefers a fast-moving and changing workday',
      'Leans toward variety and a faster pace',
      'Enjoys a balance of variety and predictable routines',
      'Leans toward a steady and predictable pace',
      'Strongly prefers consistent routines and a steady pace',
    ],
  },
];

function getPreferenceDescription(
  key: PreferenceKey,
  value: number
): string {
  const slider = WORK_PREFERENCE_SLIDERS.find(
    (item) => item.key === key
  );

  if (!slider) return '';

  const index =
    value < 20
      ? 0
      : value < 40
      ? 1
      : value <= 60
      ? 2
      : value <= 80
      ? 3
      : 4;

  return slider.descriptions[index];
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px 18px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--border-strong)',
  fontSize: '1rem',
  backgroundColor: 'white',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontWeight: 700,
  fontSize: '0.95rem',
  marginBottom: '8px',
  color: 'var(--dark-slate)',
};

const mutedStyle: React.CSSProperties = {
  color: 'var(--text-muted)',
  fontSize: '0.95rem',
  lineHeight: 1.6,
};

export default function OnboardingView() {
  const {
    onboardingStep,
    setOnboardingStep,
    userProfile,
    updateUserProfile,
    setActiveView,
    saveProfile,
    authUser,
  } = useCareer();

  const [editingSection, setEditingSection] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  // UI preference until the profile model and recommendation engine are connected.
  const [useCareerBackground, setUseCareerBackground] = useState(false);

  useEffect(() => {
    try {
      setUseCareerBackground(
        window.localStorage.getItem('careerSandboxUseBackground') === 'true'
      );
    } catch {
      // Storage may be unavailable in private browsing.
    }
  }, []);

  const handleBackgroundChoice = (checked: boolean) => {
    setUseCareerBackground(checked);
    try {
      window.localStorage.setItem('careerSandboxUseBackground', String(checked));
    } catch {
      // The choice still works for the current session.
    }
  };

  const handleGenerateRecommendations = async () => {
    if (isSaving) return;

    setSaveError('');

    if (!authUser) {
      setSaveError(
        'Please sign in before generating your recommendations.'
      );
      return;
    }

    setIsSaving(true);

    try {
      await saveProfile();
      setActiveView('recommendations');
    } catch (error) {
      console.error(
        'Failed to save onboarding profile:',
        error
      );

      setSaveError(
        error instanceof Error
          ? error.message
          : 'Something went wrong while saving your profile. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const openEditor = (step: number) => {
    setEditingSection(true);
    setOnboardingStep(step);
  };

  const saveAndReturn = () => {
    setEditingSection(false);
    setOnboardingStep(6);
  };

  const handleInterestToggle = (label: string) => {
    const current = userProfile.interests;

    updateUserProfile({
      interests: current.includes(label)
        ? current.filter((item) => item !== label)
        : [...current, label],
    });
  };

  const handleSkillRate = (
    skillName: string,
    rating: number
  ) => {
    updateUserProfile({
      skills: {
        ...userProfile.skills,
        [skillName]: rating,
      },
    });
  };

  const handleSliderChange = (
    key: PreferenceKey,
    value: number
  ) => {
    updateUserProfile({
      preferences: {
        ...userProfile.preferences,
        [key]: value,
      },
    });
  };

  const handleGoalToggle = (goalLabel: string) => {
    const current = userProfile.goals;

    if (current.includes(goalLabel)) {
      updateUserProfile({
        goals: current.filter(
          (goal) => goal !== goalLabel
        ),
      });
    } else if (current.length >= 4) {
      updateUserProfile({
        goals: [...current.slice(1), goalLabel],
      });
    } else {
      updateUserProfile({
        goals: [...current, goalLabel],
      });
    }
  };

  const next = (step: number) => {
    if (editingSection) {
      saveAndReturn();
    } else {
      setOnboardingStep(step);
    }
  };

  const stage = userProfile.careerStage;


  return (
    <div
      className="onboarding-container"
      style={{ padding: '40px 0 80px' }}
    >
      <div className="container-narrow">
        {/* Progress Header */}
        <div style={{ marginBottom: '36px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px',
              fontSize: '0.88rem',
              fontWeight: 600,
              color: 'var(--text-muted)',
            }}
          >
            <span>
              {onboardingStep <= 5
                ? `Step ${onboardingStep} of 5`
                : 'Profile Summary'}
            </span>

            <span>
              {onboardingStep === 1 && 'Welcome & Intro'}
              {onboardingStep === 2 && 'Your Interests'}
              {onboardingStep === 3 && 'Skills & Strengths'}
              {onboardingStep === 4 && 'Work Preferences'}
              {onboardingStep === 5 && 'Top Priorities & Goals'}
              {onboardingStep === 6 && 'Ready to Match'}
            </span>
          </div>

          <div className="progress-track">
            <div
              className="progress-fill"
              style={{
                width: `${
                  (Math.min(onboardingStep, 6) / 6) * 100
                }%`,
              }}
            />
          </div>
        </div>

        {/* STEP 1: Welcome and Background */}
        {onboardingStep === 1 && (
          <div
            className="card"
            style={{ padding: '40px 36px' }}
          >
            <div
              style={{
                display: 'inline-flex',
                padding: '8px 14px',
                backgroundColor: 'var(--primary-subtle)',
                color: 'var(--primary)',
                borderRadius: 'var(--radius-full)',
                fontWeight: 700,
                fontSize: '0.85rem',
                marginBottom: '20px',
              }}
            >
              Welcome to MyriMaven
            </div>

            <h1
              style={{
                fontSize: '2.2rem',
                fontWeight: 800,
                color: 'var(--dark-slate)',
                marginBottom: '14px',
              }}
            >
              Let's build your exploration profile
            </h1>

            <p
              style={{
                ...mutedStyle,
                fontSize: '1.05rem',
                marginBottom: '32px',
              }}
            >
              Your interests, skills, work preferences, and goals
              will always guide your career recommendations.
              You can also share your education or career background,
              but it's completely optional.
            </p>

            <div style={{ marginBottom: '28px' }}>
              <label
                htmlFor="profile-name"
                style={labelStyle}
              >
                What should we call you?
              </label>

              <input
                id="profile-name"
                type="text"
                value={userProfile.name}
                onChange={(e) =>
                  updateUserProfile({
                    name: e.target.value,
                  })
                }
                placeholder="Enter your first name..."
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: '28px' }}>
              <label style={labelStyle}>
                Where are you in your journey right now?
              </label>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '12px',
                }}
              >
                {[
                  'High school student',
                  'College / University',
                  'Recent graduate',
                  'Career switcher',
                ].map((option) => {
                  const selected = stage === option;

                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() =>
                        updateUserProfile({
                          careerStage: option,
                        })
                      }
                      aria-pressed={selected}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-md)',
                        border: selected
                          ? '2px solid var(--primary)'
                          : '1px solid var(--border-strong)',
                        backgroundColor: selected
                          ? 'var(--primary-subtle)'
                          : 'white',
                        fontWeight: 600,
                        color: selected
                          ? 'var(--primary)'
                          : 'var(--dark-slate)',
                        textAlign: 'center',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                      }}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* College / University */}
            {stage === 'College / University' && (
              <div style={{ marginBottom: '32px' }}>
                <h3
                  style={{
                    fontSize: '1.15rem',
                    fontWeight: 700,
                    marginBottom: '8px',
                    color: 'var(--dark-slate)',
                  }}
                >
                  Tell us about your studies
                </h3>

                <p
                  style={{
                    ...mutedStyle,
                    marginBottom: '20px',
                  }}
                >
                  You can share your studies if you'd like.
                  They will only influence recommendations
                  when you choose to include your background.
                </p>

                <label
                  htmlFor="profile-major"
                  style={labelStyle}
                >
                  Current major or program (optional)
                </label>

                <input
                  id="profile-major"
                  type="text"
                  value={userProfile.major ?? ''}
                  onChange={(e) =>
                    updateUserProfile({
                      major: e.target.value,
                    })
                  }
                  placeholder="e.g., Business Administration"
                  style={{
                    ...inputStyle,
                    marginBottom: '20px',
                  }}
                />

                <label
                  htmlFor="profile-minor"
                  style={labelStyle}
                >
                  Minor (optional)
                </label>

                <input
                  id="profile-minor"
                  type="text"
                  value={userProfile.minor ?? ''}
                  onChange={(e) =>
                    updateUserProfile({
                      minor: e.target.value,
                    })
                  }
                  placeholder="e.g., Psychology"
                  style={inputStyle}
                />
              </div>
            )}

            {/* Recent Graduate */}
            {stage === 'Recent graduate' && (
              <div style={{ marginBottom: '32px' }}>
                <h3
                  style={{
                    fontSize: '1.15rem',
                    fontWeight: 700,
                    marginBottom: '8px',
                    color: 'var(--dark-slate)',
                  }}
                >
                  What did you graduate with?
                </h3>

                <p
                  style={{
                    ...mutedStyle,
                    marginBottom: '20px',
                  }}
                >
                  Sharing your education is optional.
                  It will only influence recommendations
                  if you choose to include your background.
                </p>

                <label
                  htmlFor="profile-degree"
                  style={labelStyle}
                >
                  Completed degree or diploma (optional)
                </label>

                <input
                  id="profile-degree"
                  type="text"
                  value={userProfile.completedDegree ?? ''}
                  onChange={(e) =>
                    updateUserProfile({
                      completedDegree: e.target.value,
                    })
                  }
                  placeholder="e.g., Bachelor of Commerce"
                  style={inputStyle}
                />
              </div>
            )}

            {/* Career Switcher */}
            {stage === 'Career switcher' && (
              <div style={{ marginBottom: '32px' }}>
                <h3
                  style={{
                    fontSize: '1.15rem',
                    fontWeight: 700,
                    marginBottom: '8px',
                    color: 'var(--dark-slate)',
                  }}
                >
                  Tell us about your career background
                </h3>

                <p
                  style={{
                    ...mutedStyle,
                    marginBottom: '20px',
                  }}
                >
                  Sharing your experience is optional.
                  It will only influence recommendations
                  if you choose to include your background.
                </p>

                <label
                  htmlFor="profile-career"
                  style={labelStyle}
                >
                  Current or most recent career (optional)
                </label>

                <input
                  id="profile-career"
                  type="text"
                  value={userProfile.currentCareer ?? ''}
                  onChange={(e) =>
                    updateUserProfile({
                      currentCareer: e.target.value,
                    })
                  }
                  placeholder="e.g., Restaurant Supervisor"
                  style={inputStyle}
                />
              </div>
            )}

            {/* High School */}
            {stage === 'High school student' && (
              <div
                style={{
                  padding: '18px',
                  marginBottom: '32px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--primary-subtle)',
                }}
              >
                <p
                  style={{
                    color: 'var(--dark-slate)',
                    lineHeight: 1.6,
                  }}
                >
                  You don't need to have a career or
                  college program picked out yet.
                  We'll help you explore a wide range
                  of possibilities based on your
                  interests and strengths.
                </p>
              </div>
            )}

            {/* Optional background influence — core matching is always active. */}
            <div
              style={{
                padding: '22px',
                border: '1px solid var(--border-strong)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '28px',
                backgroundColor: 'var(--bg-subtle)',
              }}
            >
              <label
                htmlFor="use-career-background"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  cursor: 'pointer',
                  fontWeight: 700,
                  color: 'var(--dark-slate)',
                }}
              >
                <input
                  id="use-career-background"
                  type="checkbox"
                  checked={useCareerBackground}
                  onChange={(e) => handleBackgroundChoice(e.target.checked)}
                  style={{ marginTop: '4px', width: '18px', height: '18px' }}
                />
                <span>Also consider my career background</span>
              </label>
              <p style={{ ...mutedStyle, marginTop: '12px' }}>
                {useCareerBackground
                  ? 'You have chosen to include your education or work experience as additional context. Your interests, skills, preferences, and goals will still be the main factors, and careers outside your background can still appear.'
                  : 'Your career background will not influence recommendations. Your interests, skills, preferences, and goals will always guide your results.'}
              </p>
              <p style={{ ...mutedStyle, fontSize: '0.85rem', marginTop: '8px' }}>
                This choice is optional and can be changed later.
              </p>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              <button
                onClick={() => next(2)}
                className="btn-primary"
                style={{
                  padding: '14px 28px',
                }}
              >
                <span>
                  {editingSection
                    ? 'Save & Return'
                    : 'Next: Your Interests'}
                </span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Interests */}
        {onboardingStep === 2 && (
          <div>
            <div
              style={{
                textAlign: 'center',
                marginBottom: '32px',
              }}
            >
              <h1
                style={{
                  fontSize: '2rem',
                  fontWeight: 800,
                  color: 'var(--dark-slate)',
                  marginBottom: '8px',
                }}
              >
                What areas spark your curiosity?
              </h1>

              <p style={mutedStyle}>
                Pick at least 3 topics that sound
                interesting to you. Don't worry
                about specific job titles yet.
              </p>

              <div
                style={{
                  marginTop: '12px',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  color:
                    userProfile.interests.length >= 3
                      ? 'var(--primary)'
                      : 'var(--accent-gold)',
                }}
              >
                {userProfile.interests.length} selected
                {userProfile.interests.length < 3 &&
                  ` (pick ${
                    3 - userProfile.interests.length
                  } more)`}
              </div>
            </div>

            <div
              className="selection-grid"
              style={{ marginBottom: '40px' }}
            >
              {ALL_INTERESTS.map((item) => {
                const selected =
                  userProfile.interests.includes(item.label);

                return (
                  <div
                    key={item.id}
                    onClick={() =>
                      handleInterestToggle(item.label)
                    }
                    className={`select-card ${
                      selected ? 'selected' : ''
                    }`}
                  >
                    <div
                      style={{
                        color: selected
                          ? 'var(--primary)'
                          : 'var(--text-muted)',
                        backgroundColor: selected
                          ? 'white'
                          : 'var(--bg-subtle)',
                        padding: '10px',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {iconMap[item.icon] || (
                        <Sparkles size={22} />
                      )}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: '0.98rem',
                          color: 'var(--dark-slate)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent:
                            'space-between',
                        }}
                      >
                        <span>{item.label}</span>

                        {selected && (
                          <Check
                            size={18}
                            style={{
                              color: 'var(--primary)',
                            }}
                          />
                        )}
                      </div>

                      <div
                        style={{
                          fontSize: '0.82rem',
                          color: 'var(--text-muted)',
                          marginTop: '2px',
                        }}
                      >
                        {item.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              {!editingSection && (
                <button
                  onClick={() => setOnboardingStep(1)}
                  className="btn-secondary"
                >
                  <ArrowLeft size={18} />
                  Back
                </button>
              )}

              <button
                onClick={() => next(3)}
                disabled={
                  userProfile.interests.length < 3
                }
                className="btn-primary"
                style={{
                  opacity:
                    userProfile.interests.length < 3
                      ? 0.6
                      : 1,
                }}
              >
                {editingSection
                  ? 'Save & Return'
                  : 'Next: Skills & Strengths'}
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Skills */}
        {onboardingStep === 3 && (
          <div>
            <div
              style={{
                textAlign: 'center',
                marginBottom: '32px',
              }}
            >
              <h1
                style={{
                  fontSize: '2rem',
                  fontWeight: 800,
                  color: 'var(--dark-slate)',
                  marginBottom: '8px',
                }}
              >
                Rate your confidence in these areas
              </h1>

              <p style={mutedStyle}>
                Be honest — this isn't a test.
                High ratings aren't better.
                They simply help identify your strengths.
              </p>

              <div
                style={{
                  display: 'inline-flex',
                  flexWrap: 'wrap',
                  gap: '16px',
                  marginTop: '12px',
                  fontSize: '0.82rem',
                  color: 'var(--text-muted)',
                }}
              >
                <span>1 = Still developing</span>
                <span>3 = Confident</span>
                <span>5 = Superpower</span>
              </div>
            </div>

            <div
              className="card"
              style={{
                padding: '24px 32px',
                marginBottom: '36px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '24px',
                }}
              >
                {ALL_SKILLS.map((skill) => {
                  const rating =
                    userProfile.skills[skill.label] || 3;

                  return (
                    <div
                      key={skill.id}
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingBottom: '16px',
                        borderBottom:
                          '1px solid var(--border-subtle)',
                        gap: '12px',
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: '1.02rem',
                            color: 'var(--dark-slate)',
                          }}
                        >
                          {skill.label}
                        </div>

                        <div
                          style={{
                            fontSize: '0.85rem',
                            color: 'var(--text-muted)',
                          }}
                        >
                          {skill.desc}
                        </div>
                      </div>

                      <div className="rating-pills">
                        {[1, 2, 3, 4, 5].map(
                          (number) => (
                            <button
                              key={number}
                              onClick={() =>
                                handleSkillRate(
                                  skill.label,
                                  number
                                )
                              }
                              className={`rating-pill-btn ${
                                rating === number
                                  ? 'active'
                                  : ''
                              }`}
                              aria-label={`Rate ${skill.label} ${number} out of 5`}
                            >
                              {number}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              {!editingSection && (
                <button
                  onClick={() => setOnboardingStep(2)}
                  className="btn-secondary"
                >
                  <ArrowLeft size={18} />
                  Back
                </button>
              )}

              <button
                onClick={() => next(4)}
                className="btn-primary"
              >
                {editingSection
                  ? 'Save & Return'
                  : 'Next: Work Preferences'}
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Work Preferences */}
        {onboardingStep === 4 && (
          <div>
            <div
              style={{
                textAlign: 'center',
                marginBottom: '32px',
              }}
            >
              <h1
                style={{
                  fontSize: '2rem',
                  fontWeight: 800,
                  color: 'var(--dark-slate)',
                  marginBottom: '8px',
                }}
              >
                How do you prefer to work?
              </h1>

              <p style={mutedStyle}>
                Drag the sliders to reflect your
                ideal work environment.
              </p>
            </div>

            <div
              className="card"
              style={{
                padding: '32px',
                marginBottom: '36px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '32px',
                }}
              >
                {WORK_PREFERENCE_SLIDERS.map(
                  (slider) => {
                    const value =
                      userProfile.preferences[
                        slider.key
                      ];

                    return (
                      <div key={slider.key}>
                        <div
                          style={{
                            fontWeight: 700,
                            marginBottom: '10px',
                            color: 'var(--dark-slate)',
                          }}
                        >
                          {slider.label}
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            justifyContent:
                              'space-between',
                            gap: '16px',
                            marginBottom: '8px',
                            fontSize: '0.9rem',
                            fontWeight: 700,
                          }}
                        >
                          <span
                            style={{
                              color:
                                value < 45
                                  ? 'var(--primary)'
                                  : 'var(--text-muted)',
                            }}
                          >
                            {slider.left}
                          </span>

                          <span
                            style={{
                              color:
                                value > 55
                                  ? 'var(--primary)'
                                  : 'var(--text-muted)',
                              textAlign: 'right',
                            }}
                          >
                            {slider.right}
                          </span>
                        </div>

                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="1"
                          value={value}
                          onChange={(e) =>
                            handleSliderChange(
                              slider.key,
                              Number(e.target.value)
                            )
                          }
                          className="custom-range-slider"
                          aria-label={slider.label}
                          aria-valuetext={getPreferenceDescription(
                            slider.key,
                            value
                          )}
                        />

                        <div
                          aria-live="polite"
                          style={{
                            textAlign: 'center',
                            fontSize: '0.78rem',
                            color: 'var(--text-subtle)',
                            marginTop: '4px',
                            minHeight: '20px',
                          }}
                        >
                          {getPreferenceDescription(
                            slider.key,
                            value
                          )}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              {!editingSection && (
                <button
                  onClick={() => setOnboardingStep(3)}
                  className="btn-secondary"
                >
                  <ArrowLeft size={18} />
                  Back
                </button>
              )}

              <button
                onClick={() => next(5)}
                className="btn-primary"
              >
                {editingSection
                  ? 'Save & Return'
                  : 'Next: Goals & Values'}
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: Goals */}
        {onboardingStep === 5 && (
          <div>
            <div
              style={{
                textAlign: 'center',
                marginBottom: '32px',
              }}
            >
              <h1
                style={{
                  fontSize: '2rem',
                  fontWeight: 800,
                  color: 'var(--dark-slate)',
                  marginBottom: '8px',
                }}
              >
                What matters most to you in a career?
              </h1>

              <p style={mutedStyle}>
                Select and prioritize up to 3–4 values
                that matter most right now.
              </p>

              <div
                style={{
                  marginTop: '12px',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  color: 'var(--primary)',
                }}
              >
                {userProfile.goals.length} prioritized
              </div>
            </div>

            <div
              className="selection-grid"
              style={{ marginBottom: '40px' }}
            >
              {ALL_GOALS.map((goal) => {
                const rank =
                  userProfile.goals.indexOf(
                    goal.label
                  );

                const selected = rank !== -1;

                return (
                  <div
                    key={goal.id}
                    onClick={() =>
                      handleGoalToggle(goal.label)
                    }
                    className={`select-card ${
                      selected ? 'selected' : ''
                    }`}
                  >
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: selected
                          ? 'var(--primary)'
                          : 'var(--bg-subtle)',
                        color: selected
                          ? 'white'
                          : 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                      }}
                    >
                      {selected
                        ? `#${rank + 1}`
                        : '+'}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: '0.98rem',
                          color: 'var(--dark-slate)',
                        }}
                      >
                        {goal.label}
                      </div>

                      <div
                        style={{
                          fontSize: '0.82rem',
                          color: 'var(--text-muted)',
                          marginTop: '2px',
                        }}
                      >
                        {goal.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              {!editingSection && (
                <button
                  onClick={() => setOnboardingStep(4)}
                  className="btn-secondary"
                >
                  <ArrowLeft size={18} />
                  Back
                </button>
              )}

              <button
                onClick={() => next(6)}
                disabled={
                  userProfile.goals.length === 0
                }
                className="btn-primary"
              >
                {editingSection
                  ? 'Save & Return'
                  : 'Review Profile'}
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: Profile Summary */}
        {onboardingStep === 6 && (
          <div>
            <div
              style={{
                textAlign: 'center',
                marginBottom: '36px',
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  padding: '6px 14px',
                  backgroundColor:
                    'var(--accent-green-bg)',
                  color: 'var(--accent-green-text)',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  marginBottom: '14px',
                }}
              >
                Profile Complete
              </div>

              <h1
                style={{
                  fontSize: '2.2rem',
                  fontWeight: 800,
                  color: 'var(--dark-slate)',
                  marginBottom: '8px',
                }}
              >
                Here's what we learned about you,
                {' '}{userProfile.name}
              </h1>

              <p
                style={{
                  ...mutedStyle,
                  fontSize: '1.05rem',
                }}
              >
                Review your profile summary before
                generating your personalized
                career recommendations.
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(min(100%, 360px), 1fr))',
                gap: '24px',
                marginBottom: '40px',
              }}
            >
              {/* Career Background Card */}
              <div className="card">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '14px',
                  }}
                >
                  <h3
                    style={{
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      color: 'var(--dark-slate)',
                    }}
                  >
                    Your Career Background
                  </h3>

                  <button
                    onClick={() => openEditor(1)}
                    className="btn-ghost"
                    style={{ fontSize: '0.85rem' }}
                  >
                    <Edit2 size={14} /> Edit
                  </button>
                </div>

                <p style={mutedStyle}>
                  {stage || 'Not selected'}
                </p>

                <p style={{ ...mutedStyle, marginTop: '10px', fontWeight: 700 }}>
                  Include background in career suggestions: {useCareerBackground ? 'Yes' : 'No'}
                </p>

                {stage === 'College / University' && (
                  <div style={{ marginTop: '12px' }}>
                    <p style={mutedStyle}>
                      <strong>Major / Program:</strong>{' '}
                      {userProfile.major?.trim() ||
                        'Not provided'}
                    </p>

                    {userProfile.minor?.trim() && (
                      <p
                        style={{
                          ...mutedStyle,
                          marginTop: '6px',
                        }}
                      >
                        <strong>Minor:</strong>{' '}
                        {userProfile.minor}
                      </p>
                    )}
                  </div>
                )}

                {stage === 'Recent graduate' && (
                  <p
                    style={{
                      ...mutedStyle,
                      marginTop: '12px',
                    }}
                  >
                    <strong>Completed education:</strong>{' '}
                    {userProfile.completedDegree?.trim() ||
                      'Not provided'}
                  </p>
                )}

                {stage === 'Career switcher' && (
                  <p
                    style={{
                      ...mutedStyle,
                      marginTop: '12px',
                    }}
                  >
                    <strong>Current / Previous Career:</strong>{' '}
                    {userProfile.currentCareer?.trim() ||
                      'Not provided'}
                  </p>
                )}
              </div>

              {/* Interests Card */}
              <div className="card">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '14px',
                  }}
                >
                  <h3
                    style={{
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      color: 'var(--dark-slate)',
                    }}
                  >
                    Curiosity Areas (
                    {userProfile.interests.length})
                  </h3>

                  <button
                    onClick={() => openEditor(2)}
                    className="btn-ghost"
                    style={{ fontSize: '0.85rem' }}
                  >
                    <Edit2 size={14} /> Edit
                  </button>
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                  }}
                >
                  {userProfile.interests.map(
                    (interest, index) => (
                      <span
                        key={index}
                        className="badge-tag tag-active"
                      >
                        {interest}
                      </span>
                    )
                  )}
                </div>
              </div>

              {/* Strengths Card */}
              <div className="card">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '14px',
                  }}
                >
                  <h3
                    style={{
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      color: 'var(--dark-slate)',
                    }}
                  >
                    Top Strengths
                  </h3>

                  <button
                    onClick={() => openEditor(3)}
                    className="btn-ghost"
                    style={{ fontSize: '0.85rem' }}
                  >
                    <Edit2 size={14} /> Edit
                  </button>
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                  }}
                >
                  {Object.entries(userProfile.skills)
                    .filter(
                      ([, score]) => score >= 4
                    )
                    .map(
                      ([skill, score], index) => (
                        <span
                          key={index}
                          className="badge-tag"
                          style={{
                            backgroundColor:
                              'var(--primary-subtle)',
                            color: 'var(--primary)',
                            fontWeight: 700,
                          }}
                        >
                          {skill} ({score}/5)
                        </span>
                      )
                    )}
                </div>
              </div>

              {/* Preferences Card */}
              <div className="card">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '14px',
                  }}
                >
                  <h3
                    style={{
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      color: 'var(--dark-slate)',
                    }}
                  >
                    Work Style Tendencies
                  </h3>

                  <button
                    onClick={() => openEditor(4)}
                    className="btn-ghost"
                    style={{ fontSize: '0.85rem' }}
                  >
                    <Edit2 size={14} /> Edit
                  </button>
                </div>

                <ul
                  style={{
                    listStyle: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    fontSize: '0.9rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  {WORK_PREFERENCE_SLIDERS.map(
                    (slider) => (
                      <li
                        key={slider.key}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '6px',
                        }}
                      >
                        <CheckCircle2
                          size={16}
                          style={{
                            color: 'var(--primary)',
                            flexShrink: 0,
                            marginTop: '2px',
                          }}
                        />

                        <span>
                          {getPreferenceDescription(
                            slider.key,
                            userProfile.preferences[
                              slider.key
                            ]
                          )}
                        </span>
                      </li>
                    )
                  )}
                </ul>
              </div>

              {/* Goals Card */}
              <div className="card">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '14px',
                  }}
                >
                  <h3
                    style={{
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      color: 'var(--dark-slate)',
                    }}
                  >
                    Top Career Priorities
                  </h3>

                  <button
                    onClick={() => openEditor(5)}
                    className="btn-ghost"
                    style={{ fontSize: '0.85rem' }}
                  >
                    <Edit2 size={14} /> Edit
                  </button>
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  {userProfile.goals.map(
                    (goal, index) => (
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '0.92rem',
                        }}
                      >
                        <span
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor:
                              'var(--primary)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                          }}
                        >
                          {index + 1}
                        </span>

                        <strong
                          style={{
                            color: 'var(--dark-slate)',
                          }}
                        >
                          {goal}
                        </strong>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              {saveError && (
                <p
                  role="alert"
                  style={{
                    color: '#b91c1c',
                    marginBottom: '16px',
                    fontWeight: 600,
                  }}
                >
                  {saveError}
                </p>
              )}

              <button
                onClick={
                  handleGenerateRecommendations
                }
                disabled={isSaving}
                className="btn-primary"
                style={{
                  padding: '16px 40px',
                  fontSize: '1.15rem',
                  opacity: isSaving ? 0.6 : 1,
                  cursor: isSaving
                    ? 'not-allowed'
                    : 'pointer',
                }}
              >
                <span>
                  {isSaving
                    ? 'Saving Your Profile...'
                    : 'Generate My Recommendations'}
                </span>

                {!isSaving && (
                  <ArrowRight size={20} />
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
