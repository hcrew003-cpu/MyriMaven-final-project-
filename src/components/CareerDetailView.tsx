'use client';

import React from 'react';
import { useCareer } from '../context/CareerContext';
import { CAREERS } from '../data/careersData';
import {
  ArrowLeft,
  Bookmark,
  BarChart3,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  MessageSquare,
  Briefcase,
  Users,
  Crown,
  Palette,
  Puzzle,
  TrendingUp,
  ClipboardCheck,
  CheckSquare,
  Globe,
  Scale,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

const iconLookup: Record<string, React.ReactNode> = {
  MessageSquare: <MessageSquare size={20} />,
  Briefcase: <Briefcase size={20} />,
  Users: <Users size={20} />,
  Crown: <Crown size={20} />,
  Palette: <Palette size={20} />,
  Puzzle: <Puzzle size={20} />,
  TrendingUp: <TrendingUp size={20} />,
  ClipboardCheck: <ClipboardCheck size={20} />,
  CheckSquare: <CheckSquare size={20} />,
  Globe: <Globe size={20} />,
  Scale: <Scale size={20} />,
  ShieldCheck: <ShieldCheck size={20} />,
};

export default function CareerDetailView() {
  const {
    selectedCareer,
    setSelectedCareerId,
    setActiveView,
    toggleSaveCareer,
    isSaved,
    toggleCompareCareer,
    isComparing,
    openMayaWithPrompt,
  } = useCareer();

  const saved = isSaved(selectedCareer.id);
  const comparing = isComparing(selectedCareer.id);

  const relatedCareers = CAREERS.filter((c) =>
    selectedCareer.relatedCareerIds.includes(c.id)
  );

  return (
    <div style={{ padding: '36px 0 80px' }}>
      <div className="container">
        {/* Back navigation */}
        <button
          onClick={() => setActiveView('recommendations')}
          className="btn-ghost"
          style={{ marginBottom: '24px', fontSize: '0.92rem' }}
        >
          <ArrowLeft size={16} />
          <span>Back to Recommendations</span>
        </button>

        {/* Hero Card */}
        <div className="card" style={{ padding: '36px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <span className="career-category" style={{ fontSize: '0.85rem' }}>
                {selectedCareer.category}
              </span>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--dark-slate)', marginTop: '4px', marginBottom: '8px' }}>
                {selectedCareer.title}
              </h1>
              <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', maxWidth: '780px', lineHeight: 1.6 }}>
                {selectedCareer.description}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
              <div className={`match-badge ${selectedCareer.baseMatch >= 90 ? 'match-high' : 'match-med'}`} style={{ fontSize: '1.05rem', padding: '8px 16px' }}>
                {selectedCareer.baseMatch}% Match for You
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => toggleSaveCareer(selectedCareer.id)}
                  className={`btn-secondary btn-sm ${saved ? 'tag-active' : ''}`}
                >
                  <Bookmark size={14} style={{ fill: saved ? 'var(--primary)' : 'none' }} />
                  <span>{saved ? 'Saved' : 'Save'}</span>
                </button>

                <button
                  onClick={() => toggleCompareCareer(selectedCareer.id)}
                  className={`btn-secondary btn-sm ${comparing ? 'tag-active' : ''}`}
                >
                  <BarChart3 size={14} />
                  <span>{comparing ? 'In Compare' : 'Compare'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid: Left Details & Right Sidebars */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '32px' }}>
          {/* Left Column: Reasons & Tradeoffs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Why This May Fit You */}
            <div className="card">
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--dark-slate)', marginBottom: '16px' }}>
                Why this may fit you
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {selectedCareer.matchReasons.map((reason, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '14px',
                      padding: '16px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--primary-subtle)',
                      border: '1px solid var(--primary-border)'
                    }}
                  >
                    <div style={{
                      color: 'var(--primary)',
                      marginTop: '2px'
                    }}>
                      {iconLookup[reason.icon] || <CheckCircle2 size={20} />}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--dark-slate)' }}>
                        {reason.title}
                      </h3>
                      <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {reason.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Honest Trade-offs */}
            <div className="card" style={{ borderLeft: '4px solid var(--accent-gold)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <AlertTriangle size={22} style={{ color: 'var(--accent-gold)' }} />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#78350F' }}>
                  What to watch out for (honest trade-offs)
                </h2>
              </div>
              <p style={{ fontSize: '0.98rem', color: '#78350F', lineHeight: 1.6, backgroundColor: '#FFFDF8', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                {selectedCareer.watchOut}
              </p>
            </div>
          </div>

          {/* Right Column: Skills Breakdown & Maya Prompts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Skills & Environment */}
            <div className="card">
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--dark-slate)', marginBottom: '18px' }}>
                Day-to-day breakdown
              </h2>

              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>
                  Key skills you'll use
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {selectedCareer.skillsUsed.map((skill, idx) => (
                    <div key={idx}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: 700, marginBottom: '4px' }}>
                        <span>{skill.name}</span>
                        <span style={{ color: 'var(--primary)' }}>{skill.level}%</span>
                      </div>
                      <div className="progress-track" style={{ height: '8px' }}>
                        <div className="progress-fill" style={{ width: `${skill.level}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Skills to develop
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {selectedCareer.skillsToDevelop.map((s, idx) => (
                    <span key={idx} className="badge-tag" style={{ backgroundColor: 'var(--accent-gold-bg)', color: 'var(--accent-gold-text)' }}>
                      + {s}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Work environment
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {selectedCareer.workEnvironment.map((w, idx) => (
                    <span key={idx} className="badge-tag">
                      {w}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Maya Prompt Card */}
            <div className="card" style={{ background: 'linear-gradient(135deg, #F8FAF9 0%, #EFF8F5 100%)', borderColor: 'var(--primary-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div className="avatar-circle">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)' }}>
                    Ask Maya about {selectedCareer.title}
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Get candid, nuanced answers without sugar-coating
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '14px' }}>
                {[
                  `What's an average Tuesday look like for a ${selectedCareer.title}?`,
                  `How stressful is this role compared to Product Design?`,
                  `What does the first 1-2 years look like?`,
                ].map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => openMayaWithPrompt(prompt)}
                    className="maya-prompt-chip"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                  >
                    <span>{prompt}</span>
                    <Sparkles size={14} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Related Careers */}
        <div style={{ marginTop: '48px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--dark-slate)', marginBottom: '16px' }}>
            Related Careers to Explore
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {relatedCareers.map((rc) => (
              <div
                key={rc.id}
                onClick={() => {
                  setSelectedCareerId(rc.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="card card-hover"
                style={{ cursor: 'pointer', padding: '20px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span className="career-category">{rc.category}</span>
                  <span className="match-badge match-high">{rc.baseMatch}%</span>
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--dark-slate)', marginBottom: '6px' }}>
                  {rc.title}
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  {rc.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
