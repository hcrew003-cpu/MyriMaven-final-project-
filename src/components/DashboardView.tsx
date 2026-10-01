'use client';

import React from 'react';
import { useCareer } from '../context/CareerContext';
import { CAREERS } from '../data/careersData';
import {
  Sparkles,
  Sliders,
  Bookmark,
  BarChart3,
  Compass,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Clock,
  ChevronRight
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

  const savedCareers = CAREERS.filter((c) => savedCareerIds.includes(c.id));
  const topMatches = CAREERS.slice(0, 3);

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        {/* Welcome Header */}
        <div style={{ marginBottom: '32px' }}>
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
            <Sparkles size={14} /> Student Explorer Dashboard
          </div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--dark-slate)' }}>
            Welcome back, {userProfile.name}!
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginTop: '4px' }}>
            Here is your current career exploration landscape and tailored next steps.
          </p>
        </div>

        {/* 4 Metric Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          marginBottom: '36px'
        }}>
          {/* Metric 1 */}
          <div
            onClick={() => setActiveView('recommendations')}
            className="card card-hover"
            style={{ cursor: 'pointer', padding: '22px' }}
          >
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Recommended Roles
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary)', margin: '4px 0' }}>
              {CAREERS.length}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>6 High Matches (80%+)</span>
              <ChevronRight size={14} />
            </div>
          </div>

          {/* Metric 2 */}
          <div
            onClick={() => setActiveView('saved')}
            className="card card-hover"
            style={{ cursor: 'pointer', padding: '22px' }}
          >
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Saved for Later
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent-gold)', margin: '4px 0' }}>
              {savedCareerIds.length}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>Shortlisted roles</span>
              <ChevronRight size={14} />
            </div>
          </div>

          {/* Metric 3 */}
          <div
            onClick={() => setActiveView('what-if')}
            className="card card-hover"
            style={{ cursor: 'pointer', padding: '22px' }}
          >
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              What-If Sandbox
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#2563EB', margin: '4px 0' }}>
              Active
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>Test priorities</span>
              <ChevronRight size={14} />
            </div>
          </div>

          {/* Metric 4 */}
          <div
            onClick={() => {
              setOnboardingStep(6);
              setActiveView('onboarding');
            }}
            className="card card-hover"
            style={{ cursor: 'pointer', padding: '22px' }}
          >
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Exploration Score
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#166534', margin: '4px 0' }}>
              85%
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>Profile calibrated</span>
              <ChevronRight size={14} />
            </div>
          </div>
        </div>

        {/* Recommended Next Actions */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--dark-slate)', marginBottom: '16px' }}>
            Recommended Next Actions
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {/* Action 1 */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px' }}>
              <div>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--primary-subtle)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '14px'
                }}>
                  <Sliders size={20} />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px' }}>
                  Explore What-If Scenarios
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '20px' }}>
                  See how prioritizing work-life balance or helping others propels roles like Counsellor and Teacher to the top.
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

            {/* Action 2 */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px' }}>
              <div>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--accent-gold-bg)',
                  color: 'var(--accent-gold)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '14px'
                }}>
                  <Sparkles size={20} />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px' }}>
                  Ask Maya for Honest Trade-offs
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '20px' }}>
                  Dig beyond salary tables to learn what daily stress and routine tasks look like in your top matches.
                </p>
              </div>
              <button
                onClick={() => openMayaWithPrompt("What are the most surprising daily tradeoffs for my top career matches?")}
                className="btn-secondary btn-sm"
                style={{ alignSelf: 'flex-start' }}
              >
                <span>Talk with Maya</span>
                <Sparkles size={14} />
              </button>
            </div>

            {/* Action 3 */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px' }}>
              <div>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: '#EFF6FF',
                  color: '#2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '14px'
                }}>
                  <BarChart3 size={20} />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px' }}>
                  Compare Your Saved Careers
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '20px' }}>
                  Review your shortlisted roles side-by-side across work environments, core skills, and trade-offs.
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

        {/* Top Matches Preview */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--dark-slate)' }}>
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {topMatches.map((c) => (
              <div
                key={c.id}
                onClick={() => {
                  setSelectedCareerId(c.id);
                  setActiveView('detail');
                }}
                className="card card-hover"
                style={{ cursor: 'pointer', padding: '22px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span className="career-category">{c.category}</span>
                  <span className="match-badge match-high">{c.baseMatch}%</span>
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--dark-slate)', marginBottom: '6px' }}>
                  {c.title}
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: '12px' }}>
                  {c.description}
                </p>
                <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>
                  View full career breakdown →
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
