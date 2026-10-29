'use client';

import React from 'react';
import { useCareer } from '../context/CareerContext';
import { WhatIfState, UserProfile } from '../types/career';
import { Sparkles, Sliders, TrendingUp, TrendingDown, RefreshCw, Bookmark, ChevronRight } from 'lucide-react';

type PreferenceKey = keyof UserProfile['preferences'];

const priorities: { key: keyof WhatIfState; label: string }[] = [
  { key: 'workLifeBalance', label: 'Work-Life Balance' },
  { key: 'helpingOthers', label: 'Helping Others' },
  { key: 'stability', label: 'Job Stability' },
  { key: 'growth', label: 'Growth & Advancement' },
  { key: 'leadership', label: 'Leadership' },
  { key: 'income', label: 'High Income Potential' },
  { key: 'creativity', label: 'Creative Expression' },
];

const preferences: { key: PreferenceKey; label: string; left: string; right: string }[] = [
  { key: 'soloVsTeam', label: 'Collaboration', left: 'Independent', right: 'Team-oriented' },
  { key: 'structuredVsFlexible', label: 'Work structure', left: 'Structured', right: 'Flexible' },
  { key: 'officeVsRemote', label: 'Work location', left: 'In-office', right: 'Remote' },
  { key: 'peopleVsTask', label: 'Daily focus', left: 'Tasks', right: 'People' },
  { key: 'creativeVsAnalytical', label: 'Thinking style', left: 'Creative', right: 'Analytical' },
  { key: 'fastVsPredictable', label: 'Work pace', left: 'Fast-paced', right: 'Predictable' },
];

export default function WhatIfView() {
  const {
    authUser, userProfile, whatIfToggles, toggleWhatIf,
    whatIfPreferences, updateWhatIfPreference, resetWhatIf,
    getWhatIfRankedCareers, setSelectedCareerId, setActiveView,
    toggleSaveCareer, isSaved, openMayaWithPrompt,
  } = useCareer();

  const rankedCareers = getWhatIfRankedCareers();
  const activePriorities = priorities.filter(({ key }) => whatIfToggles[key]);
  const changedPreferences = preferences.filter(({ key }) =>
    whatIfPreferences[key] !== userProfile.preferences[key]
  );
  const isBaseline = !activePriorities.length && !changedPreferences.length;
  const hasProfile = Boolean(
    userProfile.interests.length || Object.keys(userProfile.skills).length || userProfile.goals.length
  );
  const top = rankedCareers[0];
  const improved = rankedCareers.filter((career) => career.delta > 0).length;
  const decreased = rankedCareers.filter((career) => career.delta < 0).length;

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', fontWeight: 700, marginBottom: 10 }}>
            <Sliders size={14} /> Interactive Career Scenario
          </div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--dark-slate)' }}>
            What-If Exploration Sandbox
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginTop: 4, maxWidth: 780 }}>
            Test different career priorities and work preferences. Your saved profile stays unchanged.
          </p>
        </div>

        {!authUser || !hasProfile ? (
          <div className="card" style={{ padding: 24, marginBottom: 24 }}>
            <strong>Start with your career profile</strong>
            <p style={{ marginTop: 8, color: 'var(--text-muted)' }}>
              Sign in and complete onboarding to see estimates based on your own interests, skills, and goals.
            </p>
            <button className="btn-primary btn-sm" onClick={() => setActiveView(authUser ? 'onboarding' : 'auth')}>
              {authUser ? 'Complete Onboarding' : 'Sign In'}
            </button>
          </div>
        ) : null}

        <div className="card" style={{ padding: 24, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
            <strong style={{ color: 'var(--dark-slate)' }}>Try different career priorities</strong>
            <button className="btn-secondary btn-sm" onClick={resetWhatIf}>
              <RefreshCw size={14} /> Reset scenario
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {priorities.map(({ key, label }) => (
              <button key={key} onClick={() => toggleWhatIf(key)}
                className={`toggle-chip ${whatIfToggles[key] ? 'active' : ''}`}
                aria-pressed={whatIfToggles[key]}>
                <span>{whatIfToggles[key] ? '✓' : '+'}</span> {label}
              </button>
            ))}
          </div>
          <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', marginTop: 14 }}>
            With no priorities selected, the Sandbox uses the goals saved in your profile.
          </p>
        </div>

        <div className="card" style={{ padding: 24, marginBottom: 28 }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--dark-slate)', marginBottom: 8 }}>
            Experiment with work preferences
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 20, fontSize: '0.9rem' }}>
            Move any slider to explore a different work environment. Changes are temporary.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
            {preferences.map(({ key, label, left, right }) => (
              <div key={key}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label htmlFor={`what-if-${key}`} style={{ fontWeight: 700, color: 'var(--dark-slate)' }}>{label}</label>
                  <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{whatIfPreferences[key]}/5</span>
                </div>
                <input id={`what-if-${key}`} type="range" min={1} max={5} step={1}
                  value={whatIfPreferences[key]}
                  onChange={(event) => updateWhatIfPreference(key, Number(event.target.value))}
                  style={{ width: '100%', accentColor: 'var(--primary)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                  <span>{left}</span><span>{right}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ backgroundColor: '#F7FAF9', border: '1px solid var(--primary-border)', padding: '20px 24px', marginBottom: 36, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <div className="avatar-circle" style={{ flexShrink: 0, marginTop: 2 }}><Sparkles size={16} /></div>
          <div>
            <strong style={{ color: 'var(--primary)' }}>Your Scenario Insight</strong>
            <p style={{ color: 'var(--text-main)', lineHeight: 1.6, marginTop: 6 }}>
              {!hasProfile
                ? 'Complete your profile to see how your career choices respond to different scenarios.'
                : isBaseline
                  ? `Baseline scenario: ${top?.title ?? 'No careers'} currently ranks highest using your saved profile. Change a priority or slider to compare outcomes.`
                  : `${activePriorities.length} priorities selected and ${changedPreferences.length} work preferences adjusted. ${improved} career estimates increased and ${decreased} decreased compared with your baseline. ${top?.title ?? 'No careers'} is currently your highest-ranked option.`}
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: 8 }}>
              Estimates use keyword signals in the available career descriptions, skills, and work environments. Missing data may affect results. These are exploratory scores, not verified career-fit predictions.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--dark-slate)' }}>
            Career Landscape ({rankedCareers.length} roles)
          </h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Ranked by exploratory match estimate</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: 24 }}>
          {rankedCareers.map((career, index) => {
            const saved = isSaved(career.id);
            return (
              <div key={career.id} className="career-card" style={{ borderTop: index === 0 ? '4px solid var(--primary)' : undefined }}>
                <div>
                  <div className="career-card-header">
                    <div>
                      <span className="career-category">{career.category}</span>
                      {index === 0 && <span style={{ marginLeft: 8, fontSize: '0.72rem', fontWeight: 800, color: 'var(--primary)' }}>TOP ESTIMATED FIT</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {career.delta > 0 ? (
                        <span style={{ color: 'var(--accent-green-text)', fontWeight: 700, fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center' }}>
                          <TrendingUp size={13} /> +{career.delta}
                        </span>
                      ) : career.delta < 0 ? (
                        <span style={{ color: '#991B1B', fontWeight: 700, fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center' }}>
                          <TrendingDown size={13} /> {career.delta}
                        </span>
                      ) : null}
                      <span className={`match-badge ${career.dynamicScore >= 80 ? 'match-high' : 'match-med'}`}>
                        {hasProfile ? `${career.dynamicScore}% Estimate` : 'Profile needed'}
                      </span>
                    </div>
                  </div>
                  <h3 className="career-title">{career.title}</h3>
                  <p className="career-desc">{career.description}</p>
                  <div style={{ backgroundColor: '#F0F9FF', borderLeft: '3px solid #0284C7', padding: '8px 12px', borderRadius: '0 8px 8px 0', fontSize: '0.84rem', color: '#0369A1', marginBottom: 12 }}>
                    <strong>Scenario impact:</strong> {career.scenarioNote}
                  </div>
                  <div className="fit-box"><strong>Career overview:</strong> {career.mayFitBecause}</div>
                  <div className="tags-row">
                    {career.tags.map((tag, i) => <span key={i} className="badge-tag">{tag}</span>)}
                  </div>
                </div>
                <div className="card-actions">
                  <button onClick={() => toggleSaveCareer(career.id)} className={`btn-secondary btn-sm ${saved ? 'tag-active' : ''}`}>
                    <Bookmark size={14} style={{ fill: saved ? 'var(--primary)' : 'none' }} />
                    <span>{saved ? 'Saved' : 'Save'}</span>
                  </button>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => openMayaWithPrompt(`Help me explore ${career.title}. My scenario estimate is ${career.dynamicScore} out of 100, a change of ${career.delta} points. Explain possible strengths, gaps and questions to investigate without treating the score as a validated prediction.`)} className="btn-secondary btn-sm">
                      <Sparkles size={14} /> Ask Maya
                    </button>
                    <button onClick={() => { setSelectedCareerId(career.id); setActiveView('detail'); }} className="btn-primary btn-sm">
                      View Profile <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
