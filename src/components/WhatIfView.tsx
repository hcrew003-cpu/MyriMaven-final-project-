'use client';

import React from 'react';
import { useCareer } from '../context/CareerContext';
import { WhatIfState } from '../types/career';
import { Sparkles, Sliders, TrendingUp, TrendingDown, ArrowRight, RefreshCw, Bookmark, ChevronRight } from 'lucide-react';

export default function WhatIfView() {
  const {
    whatIfToggles,
    toggleWhatIf,
    getWhatIfRankedCareers,
    setSelectedCareerId,
    setActiveView,
    toggleSaveCareer,
    isSaved,
    openMayaWithPrompt,
  } = useCareer();

  const rankedCareers = getWhatIfRankedCareers();

  const toggleList: { key: keyof WhatIfState; label: string }[] = [
    { key: 'workLifeBalance', label: 'Work-Life Balance' },
    { key: 'helpingOthers', label: 'Helping Others' },
    { key: 'stability', label: 'Job Stability' },
    { key: 'growth', label: 'Growth & Advancement' },
    { key: 'leadership', label: 'Leadership' },
    { key: 'income', label: 'High Income Potential' },
    { key: 'creativity', label: 'Creative Expression' },
  ];

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'var(--primary-subtle)',
            color: 'var(--primary)',
            padding: '4px 12px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '10px'
          }}>
            <Sliders size={14} /> Dynamic Simulation Engine
          </div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--dark-slate)' }}>
            What-If Exploration Sandbox
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginTop: '4px', maxWidth: '780px' }}>
            Change your priorities and see how your career landscape reshapes in real time — without resetting your base profile.
          </p>
        </div>

        {/* Priority Modifier Toggles */}
        <div className="card" style={{ padding: '24px', marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--dark-slate)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Toggle Career Priorities:
            </span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Click chips to simulate different life seasons
            </span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {toggleList.map((item) => {
              const active = whatIfToggles[item.key];
              return (
                <button
                  key={item.key}
                  onClick={() => toggleWhatIf(item.key)}
                  className={`toggle-chip ${active ? 'active' : ''}`}
                >
                  <span style={{ fontSize: '1rem' }}>{active ? '✓' : '+'}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Maya Simulation Insight Box */}
        <div className="card" style={{
          backgroundColor: '#F7FAF9',
          border: '1px solid var(--primary-border)',
          padding: '20px 24px',
          marginBottom: '36px',
          display: 'flex',
          gap: '16px',
          alignItems: 'flex-start'
        }}>
          <div className="avatar-circle" style={{ flexShrink: 0, marginTop: '2px' }}>
            <Sparkles size={16} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <strong style={{ color: 'var(--primary)', fontSize: '0.95rem' }}>Maya's Sandbox Insight</strong>
              <span style={{ fontSize: '0.78rem', backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>
                Live Simulation
              </span>
            </div>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
              {whatIfToggles.workLifeBalance || whatIfToggles.helpingOthers
                ? "With Work-Life Balance and Helping Others prioritized, high-empathy and community-rooted careers like Counsellor (93%) and Teacher (90%) jump into your top matches! Collaborative corporate roles like Marketing Manager experience a slight pace tradeoff, but remain viable options."
                : "Standard baseline scenario active. Toggle priorities like Work-Life Balance, High Income, or Creative Expression above to see real-time delta shifts!"}
            </p>
          </div>
        </div>

        {/* Dynamic Ranked Careers */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--dark-slate)' }}>
            Reshuffled Career Landscape ({rankedCareers.length} roles)
          </h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Sorted by simulated fit score
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '24px'
        }}>
          {rankedCareers.map((c, index) => {
            const saved = isSaved(c.id);

            return (
              <div key={c.id} className="career-card" style={{ borderTop: index === 0 ? '4px solid var(--primary)' : undefined }}>
                <div>
                  <div className="career-card-header">
                    <div>
                      <span className="career-category">{c.category}</span>
                      {index === 0 && (
                        <span style={{ marginLeft: '8px', fontSize: '0.72rem', backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>
                          #1 TOP SIMULATED FIT
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {/* Delta Indicator */}
                      {c.delta === 'NEW' ? (
                        <span style={{
                          backgroundColor: '#EEF2FF',
                          color: '#4338CA',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-full)'
                        }}>
                          NEW MATCH
                        </span>
                      ) : typeof c.delta === 'number' && c.delta > 0 ? (
                        <span style={{
                          backgroundColor: 'var(--accent-green-bg)',
                          color: 'var(--accent-green-text)',
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-full)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2px'
                        }}>
                          <TrendingUp size={12} /> +{c.delta}%
                        </span>
                      ) : typeof c.delta === 'number' && c.delta < 0 ? (
                        <span style={{
                          backgroundColor: '#FEE2E2',
                          color: '#991B1B',
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-full)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2px'
                        }}>
                          <TrendingDown size={12} /> {c.delta}%
                        </span>
                      ) : null}

                      <span className={`match-badge ${c.dynamicScore >= 90 ? 'match-high' : 'match-med'}`}>
                        {c.dynamicScore}% Match
                      </span>
                    </div>
                  </div>

                  <h3 className="career-title">{c.title}</h3>
                  <p className="career-desc">{c.description}</p>

                  {c.scenarioNote && (
                    <div style={{
                      backgroundColor: '#F0F9FF',
                      borderLeft: '3px solid #0284C7',
                      padding: '8px 12px',
                      borderRadius: '0 8px 8px 0',
                      fontSize: '0.84rem',
                      color: '#0369A1',
                      fontWeight: 600,
                      marginBottom: '12px'
                    }}>
                      Scenario Impact: {c.scenarioNote}
                    </div>
                  )}

                  <div className="fit-box">
                    <strong>Why it fits:</strong> {c.mayFitBecause}
                  </div>

                  <div className="tags-row">
                    {c.tags.map((t, idx) => (
                      <span key={idx} className="badge-tag">{t}</span>
                    ))}
                  </div>
                </div>

                <div className="card-actions">
                  <button
                    onClick={() => toggleSaveCareer(c.id)}
                    className={`btn-secondary btn-sm ${saved ? 'tag-active' : ''}`}
                  >
                    <Bookmark size={14} style={{ fill: saved ? 'var(--primary)' : 'none' }} />
                    <span>{saved ? 'Saved' : 'Save'}</span>
                  </button>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => openMayaWithPrompt(`Why did ${c.title} rank at ${c.dynamicScore}% in this sandbox scenario?`)}
                      className="btn-secondary btn-sm"
                      style={{ fontSize: '0.8rem' }}
                    >
                      <Sparkles size={14} />
                      <span>Ask Maya</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedCareerId(c.id);
                        setActiveView('detail');
                      }}
                      className="btn-primary btn-sm"
                    >
                      <span>View Profile</span>
                      <ChevronRight size={14} />
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
