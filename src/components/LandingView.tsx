'use client';

import React from 'react';
import { useCareer } from '../context/CareerContext';
import { Sparkles, ArrowRight, Brain, Sliders, ShieldCheck, HeartHandshake, ChevronRight, CheckCircle2 } from 'lucide-react';
import { CAREERS } from '../data/careersData';

export default function LandingView() {
  const { setActiveView, setOnboardingStep, setSelectedCareerId, isSaved, toggleSaveCareer } = useCareer();

  const previewCareers = CAREERS.slice(0, 3);

  const startOnboarding = () => {
    setOnboardingStep(1);
    setActiveView('onboarding');
  };

  return (
    <div className="landing-page" style={{ paddingBottom: '60px' }}>
      {/* Hero Section */}
      <section style={{
        padding: '70px 0 60px',
        textAlign: 'center',
        background: 'linear-gradient(180deg, #FBF9F4 0%, #F5EFE3 100%)',
        borderBottom: '1px solid var(--border)'
      }}>
        <div className="container-narrow">
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--primary-subtle)',
            border: '1px solid var(--primary-border)',
            color: 'var(--primary)',
            padding: '6px 16px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '24px'
          }}>
            <Sparkles size={16} />
            <span>Introducing MyriMaven AI Career Sandbox</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.4rem, 5vw, 3.6rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            color: 'var(--dark-slate)',
            marginBottom: '20px'
          }}>
            Explore careers. Find your path.<br />
            <span style={{ color: 'var(--primary)', fontStyle: 'italic' }}>With an AI guide that explains why.</span>
          </h1>

          <p style={{
            fontSize: '1.2rem',
            color: 'var(--text-muted)',
            lineHeight: 1.6,
            maxWidth: '720px',
            margin: '0 auto 36px'
          }}>
            MyriMaven is a career exploration sandbox that matches your strengths and interests to real-world roles — without forcing you into a box.
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={startOnboarding} className="btn-primary" style={{ padding: '14px 32px', fontSize: '1.05rem' }}>
              <span>Start Free Exploration</span>
              <ArrowRight size={18} />
            </button>
            <button onClick={() => setActiveView('what-if')} className="btn-secondary" style={{ padding: '14px 28px', fontSize: '1.05rem' }}>
              <span>Try What-If Sandbox</span>
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '28px', marginTop: '36px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} style={{ color: 'var(--primary)' }} /> 3–5 min setup
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} style={{ color: 'var(--primary)' }} /> No resume needed
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} style={{ color: 'var(--primary)' }} /> 100% Free & student-first
            </span>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section style={{ padding: '70px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--dark-slate)', marginBottom: '12px' }}>
              Career exploration built for clarity, not confusion
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
              Stop guessing. Test how real-world job dynamics fit your authentic preferences.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '24px'
          }}>
            {/* Card 1 */}
            <div className="card card-hover">
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: 'var(--primary-subtle)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '18px'
              }}>
                <Brain size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '10px' }}>
                AI Career Matching
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.93rem', lineHeight: 1.5 }}>
                Analyzes your strengths, values, and work style to suggest roles you'll genuinely thrive in.
              </p>
            </div>

            {/* Card 2 */}
            <div className="card card-hover">
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: 'var(--accent-gold-bg)',
                color: 'var(--accent-gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '18px'
              }}>
                <ShieldCheck size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '10px' }}>
                Transparent Match Scores
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.93rem', lineHeight: 1.5 }}>
                See exactly why roles fit — and what to watch out for. No mysterious black-box algorithms.
              </p>
            </div>

            {/* Card 3 */}
            <div className="card card-hover">
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: '#EFF6FF',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '18px'
              }}>
                <Sliders size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '10px' }}>
                What-If Sandbox
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.93rem', lineHeight: 1.5 }}>
                Test different priorities like work-life balance or income, and see your recommendations shift in real time.
              </p>
            </div>

            {/* Card 4 */}
            <div className="card card-hover">
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: '#FCE7F3',
                color: '#BE185D',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '18px'
              }}>
                <Sparkles size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '10px' }}>
                Maya, Your AI Guide
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.93rem', lineHeight: 1.5 }}>
                Ask questions, dig into day-to-day realities, and get honest advice tailored directly to your profile.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Preview Recommendations Section */}
      <section style={{
        padding: '60px 0',
        backgroundColor: '#F5EFE3',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)'
      }}>
        <div className="container">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '36px',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Sample Preview
              </span>
              <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--dark-slate)', marginTop: '4px' }}>
                See what matches look like
              </h2>
            </div>
            <button
              onClick={() => setActiveView('recommendations')}
              className="btn-ghost"
              style={{ fontSize: '1rem', fontWeight: 700 }}
            >
              <span>View All 12 Career Matches</span>
              <ChevronRight size={18} />
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px'
          }}>
            {previewCareers.map((c) => (
              <div key={c.id} className="career-card">
                <div>
                  <div className="career-card-header">
                    <span className="career-category">{c.category}</span>
                    <span className="match-badge match-high">
                      {c.baseMatch}% Match
                    </span>
                  </div>

                  <h3 className="career-title">{c.title}</h3>
                  <p className="career-desc">{c.description}</p>

                  <div className="fit-box">
                    <strong>Why this fits:</strong> {c.mayFitBecause}
                  </div>

                  <div className="watchout-box">
                    <strong>Watch out:</strong> {c.watchOut}
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
                    className="btn-secondary btn-sm"
                  >
                    {isSaved(c.id) ? 'Saved ★' : 'Save'}
                  </button>

                  <button
                    onClick={() => {
                      setSelectedCareerId(c.id);
                      setActiveView('detail');
                    }}
                    className="btn-primary btn-sm"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section style={{ padding: '80px 0', textAlign: 'center' }}>
        <div className="container-narrow">
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--dark-slate)', marginBottom: '16px' }}>
            Ready to find your career sweet spot?
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '32px' }}>
            Take 3-5 minutes to share what energizes you, and let Maya guide your journey.
          </p>
          <button onClick={startOnboarding} className="btn-primary" style={{ padding: '16px 36px', fontSize: '1.1rem' }}>
            <span>Start Your Exploration</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </section>
    </div>
  );
}
