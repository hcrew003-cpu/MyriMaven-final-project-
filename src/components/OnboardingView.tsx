'use client';

import React from 'react';
import { useCareer } from '../context/CareerContext';
import { ALL_INTERESTS, ALL_SKILLS, ALL_GOALS } from '../data/careersData';
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
  Edit2
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

export default function OnboardingView() {
  const {
    onboardingStep,
    setOnboardingStep,
    userProfile,
    updateUserProfile,
    setActiveView,
  } = useCareer();

  const handleInterestToggle = (label: string) => {
    const current = userProfile.interests;
    if (current.includes(label)) {
      updateUserProfile({ interests: current.filter((i) => i !== label) });
    } else {
      updateUserProfile({ interests: [...current, label] });
    }
  };

  const handleSkillRate = (skillName: string, rating: number) => {
    updateUserProfile({
      skills: {
        ...userProfile.skills,
        [skillName]: rating,
      },
    });
  };

  const handleSliderChange = (prefKey: keyof typeof userProfile.preferences, val: number) => {
    updateUserProfile({
      preferences: {
        ...userProfile.preferences,
        [prefKey]: val,
      },
    });
  };

  const handleGoalToggle = (goalLabel: string) => {
    const current = userProfile.goals;
    if (current.includes(goalLabel)) {
      updateUserProfile({ goals: current.filter((g) => g !== goalLabel) });
    } else {
      if (current.length >= 4) {
        // limit to 4
        updateUserProfile({ goals: [...current.slice(1), goalLabel] });
      } else {
        updateUserProfile({ goals: [...current, goalLabel] });
      }
    }
  };

  return (
    <div className="onboarding-container" style={{ padding: '40px 0 80px' }}>
      <div className="container-narrow">
        {/* Step Progress Header */}
        <div style={{ marginBottom: '36px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            <span>
              {onboardingStep <= 5 ? `Step ${onboardingStep} of 5` : 'Profile Summary'}
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
              style={{ width: `${(Math.min(onboardingStep, 6) / 6) * 100}%` }}
            />
          </div>
        </div>

        {/* STEP 1: Welcome & Intro */}
        {onboardingStep === 1 && (
          <div className="card" style={{ padding: '40px 36px' }}>
            <div style={{
              display: 'inline-flex',
              padding: '8px 14px',
              backgroundColor: 'var(--primary-subtle)',
              color: 'var(--primary)',
              borderRadius: 'var(--radius-full)',
              fontWeight: 700,
              fontSize: '0.85rem',
              marginBottom: '20px'
            }}>
              Welcome to MyriMaven
            </div>

            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--dark-slate)', marginBottom: '14px' }}>
              Let's build your exploration profile
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '32px' }}>
              Take 3–5 minutes to share what you enjoy, what you're good at, and what matters to you. There are no right or wrong answers — just clues toward work you'll love.
            </p>

            <div style={{ marginBottom: '28px' }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.95rem', marginBottom: '8px' }}>
                What should we call you?
              </label>
              <input
                type="text"
                value={userProfile.name}
                onChange={(e) => updateUserProfile({ name: e.target.value })}
                placeholder="Enter your first name..."
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-strong)',
                  fontSize: '1rem',
                  outline: 'none',
                  backgroundColor: 'white'
                }}
              />
            </div>

            <div style={{ marginBottom: '36px' }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.95rem', marginBottom: '10px' }}>
                Where are you in your journey right now?
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                {['High school student', 'College / University', 'Early career', 'Career switcher'].map((stage, idx) => (
                  <button
                    key={idx}
                    type="button"
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: idx === 1 ? '2px solid var(--primary)' : '1px solid var(--border-strong)',
                      backgroundColor: idx === 1 ? 'var(--primary-subtle)' : 'white',
                      fontWeight: 600,
                      color: idx === 1 ? 'var(--primary)' : 'var(--dark-slate)',
                      textAlign: 'center',
                      fontSize: '0.9rem'
                    }}
                  >
                    {stage}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setOnboardingStep(2)}
                className="btn-primary"
                style={{ padding: '14px 28px' }}
              >
                <span>Next: Your Interests</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Interests */}
        {onboardingStep === 2 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--dark-slate)', marginBottom: '8px' }}>
                What areas spark your curiosity?
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
                Pick at least 3 topics that sound interesting to you. Don't worry about specific job titles yet.
              </p>
              <div style={{ marginTop: '12px', fontSize: '0.88rem', fontWeight: 700, color: userProfile.interests.length >= 3 ? 'var(--primary)' : 'var(--accent-gold)' }}>
                {userProfile.interests.length} selected {userProfile.interests.length < 3 && `(pick ${3 - userProfile.interests.length} more)`}
              </div>
            </div>

            <div className="selection-grid" style={{ marginBottom: '40px' }}>
              {ALL_INTERESTS.map((item) => {
                const selected = userProfile.interests.includes(item.label);
                return (
                  <div
                    key={item.id}
                    onClick={() => handleInterestToggle(item.label)}
                    className={`select-card ${selected ? 'selected' : ''}`}
                  >
                    <div style={{
                      color: selected ? 'var(--primary)' : 'var(--text-muted)',
                      backgroundColor: selected ? 'white' : 'var(--bg-subtle)',
                      padding: '10px',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {iconMap[item.icon] || <Sparkles size={22} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--dark-slate)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>{item.label}</span>
                        {selected && <Check size={18} style={{ color: 'var(--primary)' }} />}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {item.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={() => setOnboardingStep(1)}
                className="btn-secondary"
              >
                <ArrowLeft size={18} />
                <span>Back</span>
              </button>
              <button
                onClick={() => setOnboardingStep(3)}
                disabled={userProfile.interests.length < 3}
                className="btn-primary"
                style={{ opacity: userProfile.interests.length < 3 ? 0.6 : 1 }}
              >
                <span>Next: Skills & Strengths</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Skills & Strengths */}
        {onboardingStep === 3 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--dark-slate)', marginBottom: '8px' }}>
                Rate your confidence in these areas
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
                Be honest — this isn't a test. High ratings aren't "better" — they just help find your sweet spot.
              </p>
              <div style={{ display: 'inline-flex', gap: '16px', marginTop: '12px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                <span>1 = Still developing</span>
                <span>3 = Confident</span>
                <span>5 = Superpower</span>
              </div>
            </div>

            <div className="card" style={{ padding: '24px 32px', marginBottom: '36px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {ALL_SKILLS.map((s) => {
                  const rating = userProfile.skills[s.label] || 3;
                  return (
                    <div
                      key={s.id}
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingBottom: '16px',
                        borderBottom: '1px solid var(--border-subtle)',
                        gap: '12px'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '1.02rem', color: 'var(--dark-slate)' }}>
                          {s.label}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {s.desc}
                        </div>
                      </div>

                      <div className="rating-pills">
                        {[1, 2, 3, 4, 5].map((num) => (
                          <button
                            key={num}
                            onClick={() => handleSkillRate(s.label, num)}
                            className={`rating-pill-btn ${rating === num ? 'active' : ''}`}
                            aria-label={`Rate ${s.label} ${num} out of 5`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={() => setOnboardingStep(2)}
                className="btn-secondary"
              >
                <ArrowLeft size={18} />
                <span>Back</span>
              </button>
              <button
                onClick={() => setOnboardingStep(4)}
                className="btn-primary"
              >
                <span>Next: Work Preferences</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Work Preferences (Sliders) */}
        {onboardingStep === 4 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--dark-slate)', marginBottom: '8px' }}>
                How do you prefer to work?
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
                Drag the sliders to reflect your ideal work environment.
              </p>
            </div>

            <div className="card" style={{ padding: '32px', marginBottom: '36px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {/* Slider 1 */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 700 }}>
                    <span style={{ color: userProfile.preferences.soloVsTeam < 45 ? 'var(--primary)' : 'var(--text-muted)' }}>
                      Solo work
                    </span>
                    <span style={{ color: userProfile.preferences.soloVsTeam > 55 ? 'var(--primary)' : 'var(--text-muted)' }}>
                      Team collaboration
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={userProfile.preferences.soloVsTeam}
                    onChange={(e) => handleSliderChange('soloVsTeam', Number(e.target.value))}
                    className="custom-range-slider"
                  />
                  <div style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-subtle)', marginTop: '4px' }}>
                    {userProfile.preferences.soloVsTeam > 60 ? 'Leans heavily toward team collaboration' : userProfile.preferences.soloVsTeam < 40 ? 'Leans toward deep solo concentration' : 'Balanced blend of both'}
                  </div>
                </div>

                {/* Slider 2 */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 700 }}>
                    <span style={{ color: userProfile.preferences.structuredVsFlexible < 45 ? 'var(--primary)' : 'var(--text-muted)' }}>
                      Structured & clear tasks
                    </span>
                    <span style={{ color: userProfile.preferences.structuredVsFlexible > 55 ? 'var(--primary)' : 'var(--text-muted)' }}>
                      Flexible & open-ended
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={userProfile.preferences.structuredVsFlexible}
                    onChange={(e) => handleSliderChange('structuredVsFlexible', Number(e.target.value))}
                    className="custom-range-slider"
                  />
                  <div style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-subtle)', marginTop: '4px' }}>
                    {userProfile.preferences.structuredVsFlexible > 60 ? 'Enjoys open-ended exploration' : userProfile.preferences.structuredVsFlexible < 40 ? 'Prefers clear roadmap & directives' : 'Adaptive balance'}
                  </div>
                </div>

                {/* Slider 3 */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 700 }}>
                    <span style={{ color: userProfile.preferences.officeVsRemote < 45 ? 'var(--primary)' : 'var(--text-muted)' }}>
                      In-office presence
                    </span>
                    <span style={{ color: userProfile.preferences.officeVsRemote > 55 ? 'var(--primary)' : 'var(--text-muted)' }}>
                      Fully remote freedom
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={userProfile.preferences.officeVsRemote}
                    onChange={(e) => handleSliderChange('officeVsRemote', Number(e.target.value))}
                    className="custom-range-slider"
                  />
                  <div style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-subtle)', marginTop: '4px' }}>
                    Hybrid friendly (2–3 days sweet spot)
                  </div>
                </div>

                {/* Slider 4 */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 700 }}>
                    <span style={{ color: userProfile.preferences.peopleVsTask < 45 ? 'var(--primary)' : 'var(--text-muted)' }}>
                      People-oriented
                    </span>
                    <span style={{ color: userProfile.preferences.peopleVsTask > 55 ? 'var(--primary)' : 'var(--text-muted)' }}>
                      Task & systems-oriented
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={userProfile.preferences.peopleVsTask}
                    onChange={(e) => handleSliderChange('peopleVsTask', Number(e.target.value))}
                    className="custom-range-slider"
                  />
                </div>

                {/* Slider 5 */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 700 }}>
                    <span style={{ color: userProfile.preferences.creativeVsAnalytical < 45 ? 'var(--primary)' : 'var(--text-muted)' }}>
                      Creative expression
                    </span>
                    <span style={{ color: userProfile.preferences.creativeVsAnalytical > 55 ? 'var(--primary)' : 'var(--text-muted)' }}>
                      Analytical precision
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={userProfile.preferences.creativeVsAnalytical}
                    onChange={(e) => handleSliderChange('creativeVsAnalytical', Number(e.target.value))}
                    className="custom-range-slider"
                  />
                </div>

                {/* Slider 6 */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 700 }}>
                    <span style={{ color: userProfile.preferences.fastVsPredictable < 45 ? 'var(--primary)' : 'var(--text-muted)' }}>
                      Fast-paced & changing
                    </span>
                    <span style={{ color: userProfile.preferences.fastVsPredictable > 55 ? 'var(--primary)' : 'var(--text-muted)' }}>
                      Predictable & steady
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={userProfile.preferences.fastVsPredictable}
                    onChange={(e) => handleSliderChange('fastVsPredictable', Number(e.target.value))}
                    className="custom-range-slider"
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={() => setOnboardingStep(3)}
                className="btn-secondary"
              >
                <ArrowLeft size={18} />
                <span>Back</span>
              </button>
              <button
                onClick={() => setOnboardingStep(5)}
                className="btn-primary"
              >
                <span>Next: Goals & Values</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: Goals & Values */}
        {onboardingStep === 5 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--dark-slate)', marginBottom: '8px' }}>
                What matters most to you in a career?
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
                Select and prioritize up to 3–4 values that matter most right now.
              </p>
              <div style={{ marginTop: '12px', fontSize: '0.88rem', fontWeight: 700, color: 'var(--primary)' }}>
                {userProfile.goals.length} prioritized
              </div>
            </div>

            <div className="selection-grid" style={{ marginBottom: '40px' }}>
              {ALL_GOALS.map((goal) => {
                const rankIdx = userProfile.goals.indexOf(goal.label);
                const isSelected = rankIdx !== -1;
                return (
                  <div
                    key={goal.id}
                    onClick={() => handleGoalToggle(goal.label)}
                    className={`select-card ${isSelected ? 'selected' : ''}`}
                  >
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: isSelected ? 'var(--primary)' : 'var(--bg-subtle)',
                      color: isSelected ? 'white' : 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.85rem'
                    }}>
                      {isSelected ? `#${rankIdx + 1}` : '+'}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--dark-slate)' }}>
                        {goal.label}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {goal.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={() => setOnboardingStep(4)}
                className="btn-secondary"
              >
                <ArrowLeft size={18} />
                <span>Back</span>
              </button>
              <button
                onClick={() => setOnboardingStep(6)}
                disabled={userProfile.goals.length === 0}
                className="btn-primary"
              >
                <span>Review Profile</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: Profile Summary (Screen 07) */}
        {onboardingStep === 6 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '36px' }}>
              <div style={{
                display: 'inline-flex',
                padding: '6px 14px',
                backgroundColor: 'var(--accent-green-bg)',
                color: 'var(--accent-green-text)',
                borderRadius: 'var(--radius-full)',
                fontWeight: 700,
                fontSize: '0.82rem',
                marginBottom: '14px'
              }}>
                Profile Complete
              </div>
              <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--dark-slate)', marginBottom: '8px' }}>
                Here's what we learned about you, {userProfile.name}
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
                Review your profile summary before generating your personalized career recommendations.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px', marginBottom: '40px' }}>
              {/* Interests Card */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--dark-slate)' }}>
                    Curiosity Areas ({userProfile.interests.length})
                  </h3>
                  <button onClick={() => setOnboardingStep(2)} className="btn-ghost" style={{ fontSize: '0.85rem' }}>
                    <Edit2 size={14} /> Edit
                  </button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {userProfile.interests.map((i, idx) => (
                    <span key={idx} className="badge-tag tag-active">{i}</span>
                  ))}
                </div>
              </div>

              {/* Strengths Card */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--dark-slate)' }}>
                    Top Strengths
                  </h3>
                  <button onClick={() => setOnboardingStep(3)} className="btn-ghost" style={{ fontSize: '0.85rem' }}>
                    <Edit2 size={14} /> Edit
                  </button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {Object.entries(userProfile.skills)
                    .filter(([_, score]) => score >= 4)
                    .map(([skill, score], idx) => (
                      <span key={idx} className="badge-tag" style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)', fontWeight: 700 }}>
                        {skill} ({score}/5)
                      </span>
                    ))}
                </div>
              </div>

              {/* Work Style Preferences Card */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--dark-slate)' }}>
                    Work Style Tendencies
                  </h3>
                  <button onClick={() => setOnboardingStep(4)} className="btn-ghost" style={{ fontSize: '0.85rem' }}>
                    <Edit2 size={14} /> Edit
                  </button>
                </div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={16} style={{ color: 'var(--primary)' }} />
                    {userProfile.preferences.soloVsTeam > 50 ? 'Strong collaborative team preference' : 'Prefers solo focus'}
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={16} style={{ color: 'var(--primary)' }} />
                    {userProfile.preferences.structuredVsFlexible > 50 ? 'Thrives in flexible & creative ambiguity' : 'Prefers structured guidelines'}
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={16} style={{ color: 'var(--primary)' }} />
                    Hybrid flexibility curious (2–3 days remote)
                  </li>
                </ul>
              </div>

              {/* Top Priorities Card */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--dark-slate)' }}>
                    Top Career Priorities
                  </h3>
                  <button onClick={() => setOnboardingStep(5)} className="btn-ghost" style={{ fontSize: '0.85rem' }}>
                    <Edit2 size={14} /> Edit
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {userProfile.goals.map((g, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.92rem' }}>
                      <span style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--primary)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 700
                      }}>
                        {idx + 1}
                      </span>
                      <strong style={{ color: 'var(--dark-slate)' }}>{g}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <button
                onClick={() => setActiveView('recommendations')}
                className="btn-primary"
                style={{ padding: '16px 40px', fontSize: '1.15rem' }}
              >
                <span>Generate My Recommendations</span>
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
