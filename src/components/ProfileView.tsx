
'use client';

import React, { useState } from 'react';
import { useCareer } from '../context/CareerContext';
import type { UserProfile } from '../types/career';
import { saveUserProfile } from '../lib/profile';
import {
  ALL_INTERESTS,
  ALL_SKILLS,
  ALL_GOALS,
} from '../data/careersData';
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
  X,
  Save,
} from 'lucide-react';

type Section =
  | 'background'
  | 'interests'
  | 'skills'
  | 'preferences'
  | 'goals';

type PreferenceKey = keyof UserProfile['preferences'];

const PREFERENCE_OPTIONS: {
  key: PreferenceKey;
  label: string;
  left: string;
  right: string;
  descriptions: string[];
}[] = [
  {
    key: 'soloVsTeam',
    label: 'Collaboration preference',
    left: 'Solo work',
    right: 'Team collaboration',
    descriptions: [
      'Strongly prefers independent work',
      'Leans toward independent work',
      'Enjoys a balance of solo work and teamwork',
      'Leans toward collaborating',
      'Strongly prefers teamwork',
    ],
  },
  {
    key: 'structuredVsFlexible',
    label: 'Work structure preference',
    left: 'Structured & clear tasks',
    right: 'Flexible & open-ended',
    descriptions: [
      'Strongly prefers clear routines',
      'Leans toward structured plans',
      'Enjoys a mix of structure and flexibility',
      'Leans toward flexible tasks',
      'Strongly prefers open-ended work',
    ],
  },
  {
    key: 'officeVsRemote',
    label: 'Work location preference',
    left: 'In-office presence',
    right: 'Fully remote freedom',
    descriptions: [
      'Strongly prefers in-person work',
      'Leans toward working in person',
      'Prefers a balance of in-person and remote work',
      'Leans toward remote work',
      'Strongly prefers fully remote work',
    ],
  },
  {
    key: 'peopleVsTask',
    label: 'Daily work focus preference',
    left: 'People-oriented',
    right: 'Task & systems-oriented',
    descriptions: [
      'Strongly prefers people-focused work',
      'Leans toward working with people',
      'Enjoys a balance of people and tasks',
      'Leans toward tasks and systems',
      'Strongly prefers task-focused work',
    ],
  },
  {
    key: 'creativeVsAnalytical',
    label: 'Thinking style preference',
    left: 'Creative expression',
    right: 'Analytical precision',
    descriptions: [
      'Strongly prefers creative work',
      'Leans toward creative expression',
      'Enjoys a balance of creative and analytical thinking',
      'Leans toward logic and research',
      'Strongly prefers analytical thinking',
    ],
  },
  {
    key: 'fastVsPredictable',
    label: 'Work pace preference',
    left: 'Fast-paced & changing',
    right: 'Predictable & steady',
    descriptions: [
      'Strongly prefers a fast-moving workday',
      'Leans toward variety and a faster pace',
      'Enjoys a balance of variety and routine',
      'Leans toward a predictable pace',
      'Strongly prefers steady routines',
    ],
  },
];

function preferenceDescription(
  descriptions: string[],
  value: number
) {
  const index =
    value < 20 ? 0 :
    value < 40 ? 1 :
    value <= 60 ? 2 :
    value <= 80 ? 3 : 4;

  return descriptions[index];
}

const cardStyle: React.CSSProperties = {
  background: 'white',
  border: '1px solid #e5e7eb',
  borderRadius: 16,
  padding: 24,
};

const chipStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '8px 12px',
  borderRadius: 20,
  background: 'var(--primary-subtle)',
  color: 'var(--primary)',
  fontSize: 13,
  fontWeight: 600,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  border: '1px solid #d1d5db',
  borderRadius: 10,
  fontSize: 14,
};

export default function ProfileView() {
  const {
    authUser,
    userProfile,
    updateUserProfile,
    savedCareerIds,
    compareCareerIds,
    setActiveView,
  } = useCareer();

  const [editing, setEditing] = useState<Section | null>(null);
  const [draft, setDraft] = useState<UserProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!authUser) {
    return (
      <section style={{ maxWidth: 800, margin: '60px auto', padding: 24 }}>
        <h1>My Profile</h1>
        <p>Please log in to view your profile.</p>
        <button
          className="btn-primary"
          onClick={() => setActiveView('auth')}
        >
          Sign Up / Log In
        </button>
      </section>
    );
  }

  const startEditing = (section: Section) => {
    if (saving) return;

    setDraft({
      ...userProfile,
      interests: [...userProfile.interests],
      goals: [...userProfile.goals],
      skills: { ...userProfile.skills },
      preferences: { ...userProfile.preferences },
    });

    setEditing(section);
    setError('');
    setSuccess('');
  };

  const cancelEditing = () => {
    if (saving) return;
    setEditing(null);
    setDraft(null);
    setError('');
  };

  const updateDraft = (updates: Partial<UserProfile>) => {
    setDraft((previous) =>
      previous ? { ...previous, ...updates } : previous
    );
  };

  const toggleInterest = (interest: string) => {
    if (!draft) return;

    updateDraft({
      interests: draft.interests.includes(interest)
        ? draft.interests.filter((item) => item !== interest)
        : [...draft.interests, interest],
    });
  };

  const rateSkill = (skill: string, rating: number) => {
    if (!draft) return;

    updateDraft({
      skills: {
        ...draft.skills,
        [skill]: rating,
      },
    });
  };

  const changePreference = (
    key: PreferenceKey,
    value: number
  ) => {
    if (!draft) return;

    updateDraft({
      preferences: {
        ...draft.preferences,
        [key]: value,
      },
    });
  };

  const toggleGoal = (goal: string) => {
    if (!draft) return;

    if (draft.goals.includes(goal)) {
      updateDraft({
        goals: draft.goals.filter((item) => item !== goal),
      });
      return;
    }

    // Match onboarding's maximum of four priorities.
    updateDraft({
      goals:
        draft.goals.length >= 4
          ? [...draft.goals.slice(1), goal]
          : [...draft.goals, goal],
    });
  };

  const saveChanges = async () => {
    if (!draft || !editing || saving) return;

    if (editing === 'interests' && draft.interests.length < 3) {
      setError('Please select at least three interests.');
      return;
    }

    if (editing === 'goals' && draft.goals.length === 0) {
      setError('Please select at least one career goal.');
      return;
    }

    if (
      editing === 'background' &&
      draft.careerStage === 'College / University' &&
      !draft.major?.trim()
    ) {
      setError('Please enter your current major or program.');
      return;
    }

    if (
      editing === 'background' &&
      draft.careerStage === 'Recent graduate' &&
      !draft.completedDegree?.trim()
    ) {
      setError('Please enter your completed degree or diploma.');
      return;
    }

    if (
      editing === 'background' &&
      draft.careerStage === 'Career switcher' &&
      !draft.currentCareer?.trim()
    ) {
      setError('Please enter your current or most recent career.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Save the exact edited draft to Supabase first.
      await saveUserProfile(authUser, draft);

      // Update the shared profile after the save succeeds.
      updateUserProfile(draft);

      setEditing(null);
      setDraft(null);
      setSuccess(
        'Your profile changes were saved successfully.'
      );
    } catch (err) {
      console.error('Profile update failed:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to save your changes. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const interests = userProfile.interests ?? [];
  const goals = userProfile.goals ?? [];

  const skills = Object.entries(userProfile.skills ?? {})
    .filter(([, rating]) => rating > 0)
    .sort((a, b) => b[1] - a[1]);

  const completedSections = [
    interests.length > 0,
    skills.length > 0,
    Object.keys(userProfile.preferences ?? {}).length > 0,
    goals.length > 0,
  ].filter(Boolean).length;

  const displayName =
    userProfile.name?.trim() ||
    authUser.email?.split('@')[0] ||
    'Career Explorer';

  const sectionHeader = (
    icon: React.ReactNode,
    title: string,
    description: string,
    section: Section
  ) => (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 18,
      }}
    >
      <div style={{ display: 'flex', gap: 12, flex: 1 }}>
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

      {editing !== section && (
        <button
          className="btn-secondary btn-sm"
          onClick={() => startEditing(section)}
          disabled={saving}
        >
          <Pencil size={14} />
          Edit
        </button>
      )}
    </div>
  );

  const editorActions = () => (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 24,
        paddingTop: 16,
        borderTop: '1px solid #e5e7eb',
      }}
    >
      <button
        className="btn-primary"
        onClick={saveChanges}
        disabled={saving}
      >
        <Save size={16} />
        {saving ? 'Saving...' : 'Save Changes'}
      </button>

      <button
        className="btn-secondary"
        onClick={cancelEditing}
        disabled={saving}
      >
        <X size={16} />
        Cancel
      </button>
    </div>
  );

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container" style={{ maxWidth: 1100 }}>
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
            }}
          >
            Review your interests, strengths, work preferences,
            and goals. Edit any section without repeating onboarding.
          </p>
        </div>

        {success && (
          <div
            role="status"
            style={{
              ...cardStyle,
              background: '#f0fdf4',
              color: '#166534',
              marginBottom: 20,
            }}
          >
            <CheckCircle2 size={18} style={{ display: 'inline', marginRight: 8 }} />
            {success}
          </div>
        )}

        {error && (
          <div
            role="alert"
            style={{
              ...cardStyle,
              background: '#fef2f2',
              color: '#b91c1c',
              marginBottom: 20,
            }}
          >
            {error}
          </div>
        )}

        {/* Account Overview */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
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
                <h2 style={{ fontSize: 22, fontWeight: 800 }}>
                  {displayName}
                </h2>
                <p
                  style={{
                    display: 'flex',
                    gap: 6,
                    alignItems: 'center',
                    fontSize: 14,
                    color: 'var(--text-muted)',
                    overflowWrap: 'anywhere',
                  }}
                >
                  <Mail size={14} />
                  {authUser.email}
                </p>
                <p
                  style={{
                    display: 'flex',
                    gap: 6,
                    alignItems: 'center',
                    fontSize: 13,
                    color: 'var(--text-muted)',
                    marginTop: 6,
                  }}
                >
                  <GraduationCap size={15} />
                  {userProfile.careerStage || 'Career explorer'}
                </p>
              </div>
            </div>

            <div
              style={{
                padding: '12px 18px',
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: 12,
                textAlign: 'center',
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
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
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
            { label: 'Interests', value: interests.length, icon: <Heart size={19} /> },
            { label: 'Skills', value: skills.length, icon: <Lightbulb size={19} /> },
            { label: 'Saved Careers', value: savedCareerIds.length, icon: <Bookmark size={19} /> },
            { label: 'Comparing', value: compareCareerIds.length, icon: <BarChart3 size={19} /> },
          ].map((stat) => (
            <div key={stat.label} style={{ ...cardStyle, padding: 20 }}>
              <div style={{ color: 'var(--primary)', marginBottom: 10 }}>
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
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Background */}
        <div style={{ ...cardStyle, marginBottom: 20 }}>
          {sectionHeader(
            <GraduationCap size={20} />,
            'My Career Background',
            'Your current education or career stage',
            'background'
          )}

          {editing === 'background' && draft ? (
            <div style={{ display: 'grid', gap: 16 }}>
              <label>
                <strong>Preferred name</strong>
                <input
                  style={{ ...inputStyle, marginTop: 8 }}
                  value={draft.name}
                  onChange={(e) => updateDraft({ name: e.target.value })}
                />
              </label>

              <label>
                <strong>Career stage</strong>
                <select
                  style={{ ...inputStyle, marginTop: 8 }}
                  value={draft.careerStage}
                  onChange={(e) =>
                    updateDraft({ careerStage: e.target.value })
                  }
                >
                  <option value="High school student">High school student</option>
                  <option value="College / University">College / University</option>
                  <option value="Recent graduate">Recent graduate</option>
                  <option value="Career switcher">Career switcher</option>
                </select>
              </label>

              {draft.careerStage === 'College / University' && (
                <>
                  <label>
                    <strong>Major or program</strong>
                    <input
                      style={{ ...inputStyle, marginTop: 8 }}
                      value={draft.major ?? ''}
                      onChange={(e) => updateDraft({ major: e.target.value })}
                    />
                  </label>
                  <label>
                    <strong>Minor (optional)</strong>
                    <input
                      style={{ ...inputStyle, marginTop: 8 }}
                      value={draft.minor ?? ''}
                      onChange={(e) => updateDraft({ minor: e.target.value })}
                    />
                  </label>
                </>
              )}

              {draft.careerStage === 'Recent graduate' && (
                <label>
                  <strong>Completed degree or diploma</strong>
                  <input
                    style={{ ...inputStyle, marginTop: 8 }}
                    value={draft.completedDegree ?? ''}
                    onChange={(e) =>
                      updateDraft({ completedDegree: e.target.value })
                    }
                  />
                </label>
              )}

              {draft.careerStage === 'Career switcher' && (
                <label>
                  <strong>Current or most recent career</strong>
                  <input
                    style={{ ...inputStyle, marginTop: 8 }}
                    value={draft.currentCareer ?? ''}
                    onChange={(e) =>
                      updateDraft({ currentCareer: e.target.value })
                    }
                  />
                </label>
              )}

              {editorActions()}
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)', lineHeight: 1.8 }}>
              <p><strong>Career Stage:</strong> {userProfile.careerStage || 'Not selected'}</p>
              {userProfile.major && (
                <p><strong>Major / Program:</strong> {userProfile.major}</p>
              )}
              {userProfile.minor && (
                <p><strong>Minor:</strong> {userProfile.minor}</p>
              )}
              {userProfile.completedDegree && (
                <p><strong>Completed Degree:</strong> {userProfile.completedDegree}</p>
              )}
              {userProfile.currentCareer && (
                <p><strong>Current Career:</strong> {userProfile.currentCareer}</p>
              )}
            </div>
          )}
        </div>

        {/* Interests, Skills, Preferences, Goals */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(min(100%, 420px), 1fr))',
            gap: 20,
          }}
        >
          <div style={cardStyle}>
            {sectionHeader(
              <Heart size={20} />,
              'My Interests',
              'Career areas that spark your curiosity',
              'interests'
            )}

            {editing === 'interests' && draft ? (
              <>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>
                  Select at least three interests. {draft.interests.length} selected.
                </p>

                <div style={{ display: 'grid', gap: 8 }}>
                  {ALL_INTERESTS.map((interest) => {
                    const selected = draft.interests.includes(interest.label);
                    return (
                      <button
                        key={interest.id}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => toggleInterest(interest.label)}
                        style={{
                          padding: 12,
                          textAlign: 'left',
                          borderRadius: 10,
                          border: selected
                            ? '2px solid var(--primary)'
                            : '1px solid #e5e7eb',
                          background: selected ? 'var(--primary-subtle)' : 'white',
                          cursor: 'pointer',
                        }}
                      >
                        <strong>{selected ? '✓ ' : ''}{interest.label}</strong>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                          {interest.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
                {editorActions()}
              </>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {interests.length
                  ? interests.map((interest) => (
                      <span key={interest} style={chipStyle}>{interest}</span>
                    ))
                  : <p>No interests selected yet.</p>}
              </div>
            )}
          </div>

          <div style={cardStyle}>
            {sectionHeader(
              <Lightbulb size={20} />,
              'My Skills & Strengths',
              'Skills you bring to career exploration',
              'skills'
            )}

            {editing === 'skills' && draft ? (
              <>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>
                  Rate each skill from 1 (developing) to 5 (superpower).
                </p>

                <div style={{ display: 'grid', gap: 18 }}>
                  {ALL_SKILLS.map((skill) => {
                    const rating = draft.skills[skill.label] || 3;
                    return (
                      <div key={skill.id}>
                        <strong style={{ fontSize: 14 }}>{skill.label}</strong>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                          {skill.desc}
                        </p>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {[1, 2, 3, 4, 5].map((number) => (
                            <button
                              key={number}
                              type="button"
                              aria-label={`Rate ${skill.label} ${number} out of 5`}
                              aria-pressed={rating === number}
                              onClick={() => rateSkill(skill.label, number)}
                              style={{
                                flex: 1,
                                padding: '10px 0',
                                borderRadius: 8,
                                border: rating === number
                                  ? '2px solid var(--primary)'
                                  : '1px solid #e5e7eb',
                                background: rating === number
                                  ? 'var(--primary-subtle)'
                                  : 'white',
                                color: rating === number
                                  ? 'var(--primary)'
                                  : 'var(--dark-slate)',
                                cursor: 'pointer',
                                fontWeight: 700,
                              }}
                            >
                              {number}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {editorActions()}
              </>
            ) : skills.length ? (
              <div style={{ display: 'grid', gap: 12 }}>
                {skills.map(([skill, level]) => (
                  <div key={skill}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: 13,
                        marginBottom: 6,
                      }}
                    >
                      <strong>{skill}</strong>
                      <span>{level}/5</span>
                    </div>
                    <div
                      style={{
                        height: 7,
                        background: '#e5e7eb',
                        borderRadius: 20,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${Math.min(100, (level / 5) * 100)}%`,
                          height: '100%',
                          background: 'var(--primary)',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No skills rated yet.</p>
            )}
          </div>

          <div style={cardStyle}>
            {sectionHeader(
              <Sliders size={20} />,
              'My Work Preferences',
              'How you prefer to work and collaborate',
              'preferences'
            )}

            {editing === 'preferences' && draft ? (
              <>
                <div style={{ display: 'grid', gap: 24 }}>
                  {PREFERENCE_OPTIONS.map((option) => {
                    const value = draft.preferences[option.key] ?? 50;
                    return (
                      <div key={option.key}>
                        <strong style={{ fontSize: 14 }}>{option.label}</strong>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: 12,
                            margin: '10px 0',
                            fontSize: 12,
                          }}
                        >
                          <span>{option.left}</span>
                          <span style={{ textAlign: 'right' }}>{option.right}</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          step={1}
                          value={value}
                          className="custom-range-slider"
                          aria-label={option.label}
                          onChange={(e) =>
                            changePreference(option.key, Number(e.target.value))
                          }
                          style={{ width: '100%' }}
                        />
                        <p
                          style={{
                            fontSize: 12,
                            textAlign: 'center',
                            color: 'var(--text-muted)',
                            marginTop: 8,
                          }}
                        >
                          {preferenceDescription(option.descriptions, value)}
                        </p>
                      </div>
                    );
                  })}
                </div>
                {editorActions()}
              </>
            ) : (
              <div style={{ display: 'grid', gap: 12 }}>
                {PREFERENCE_OPTIONS.map((option) => (
                  <div
                    key={option.key}
                    style={{
                      padding: 12,
                      borderRadius: 10,
                      background: '#f8fafc',
                    }}
                  >
                    <strong style={{ fontSize: 13 }}>{option.label}</strong>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 5 }}>
                      {preferenceDescription(
                        option.descriptions,
                        userProfile.preferences[option.key] ?? 50
                      )}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={cardStyle}>
            {sectionHeader(
              <Target size={20} />,
              'My Career Goals',
              'What matters most in your future career',
              'goals'
            )}

            {editing === 'goals' && draft ? (
              <>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>
                  Choose up to four goals in priority order.
                  {' '}{draft.goals.length} selected.
                </p>
                <div style={{ display: 'grid', gap: 8 }}>
                  {ALL_GOALS.map((goal) => {
                    const rank = draft.goals.indexOf(goal.label);
                    const selected = rank !== -1;
                    return (
                      <button
                        key={goal.id}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => toggleGoal(goal.label)}
                        style={{
                          padding: 12,
                          textAlign: 'left',
                          borderRadius: 10,
                          border: selected
                            ? '2px solid var(--primary)'
                            : '1px solid #e5e7eb',
                          background: selected
                            ? 'var(--primary-subtle)'
                            : 'white',
                          cursor: 'pointer',
                        }}
                      >
                        <strong>
                          {selected ? `#${rank + 1} ` : '+ '}
                          {goal.label}
                        </strong>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                          {goal.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
                {editorActions()}
              </>
            ) : goals.length ? (
              <div style={{ display: 'grid', gap: 10 }}>
                {goals.map((goal, index) => (
                  <div key={goal} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: '50%',
                        background: 'var(--primary)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      {index + 1}
                    </span>
                    <strong style={{ fontSize: 14 }}>{goal}</strong>
                  </div>
                ))}
              </div>
            ) : (
              <p>No career goals selected yet.</p>
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
          <h2 style={{ fontSize: 19, fontWeight: 800, marginBottom: 8 }}>
            Ready to Explore What's Next?
          </h2>

          <p
            style={{
              fontSize: 14,
              color: 'var(--text-muted)',
              marginBottom: 20,
            }}
          >
            Your saved profile helps MyriMaven generate
            personalized O*NET career recommendations.
            Update it whenever your interests or priorities change.
          </p>

          <button
            className="btn-primary"
            disabled={editing !== null || saving}
            onClick={() => setActiveView('recommendations')}
          >
            <Compass size={17} />
            Explore My Career Matches
            <ArrowRight size={16} />
          </button>

          {editing && (
            <p
              style={{
                marginTop: 12,
                fontSize: 13,
                color: 'var(--text-muted)',
              }}
            >
              Save or cancel your current edits before exploring careers.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
