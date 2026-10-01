'use client';

import React from 'react';
import { useCareer } from '../context/CareerContext';
import { CAREERS } from '../data/careersData';
import { ArrowLeft, X, Sparkles, Sliders, ChevronRight } from 'lucide-react';

export default function CompareView() {
  const {
    compareCareerIds,
    toggleCompareCareer,
    setSelectedCareerId,
    setActiveView,
    openMayaWithPrompt,
  } = useCareer();

  const comparingCareers = CAREERS.filter((c) =>
    compareCareerIds.includes(c.id)
  );

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
          <div>
            <button
              onClick={() => setActiveView('saved')}
              className="btn-ghost"
              style={{ marginBottom: '12px', fontSize: '0.88rem' }}
            >
              <ArrowLeft size={16} />
              <span>Back to Saved Careers</span>
            </button>
            <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--dark-slate)', marginBottom: '6px' }}>
              Side-by-Side Comparison
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
              Comparing {comparingCareers.length} roles against your strengths, work preferences, and career goals.
            </p>
          </div>

          <button
            onClick={() => setActiveView('what-if')}
            className="btn-secondary"
          >
            <Sliders size={16} />
            <span>Test Priorities in Sandbox</span>
          </button>
        </div>

        {comparingCareers.length === 0 ? (
          <div className="card" style={{ padding: '60px 24px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--dark-slate)', marginBottom: '8px' }}>
              No careers selected for comparison
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
              Select 2 to 3 careers from Recommendations or Saved Careers to view their detailed matrix.
            </p>
            <button onClick={() => setActiveView('recommendations')} className="btn-primary">
              View Recommendations
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '780px', textAlign: 'left' }}>
              {/* Table Header: Career Titles */}
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)', backgroundColor: '#F8FAF9' }}>
                  <th style={{ padding: '20px 24px', width: '220px', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Criteria
                  </th>
                  {comparingCareers.map((c) => (
                    <th key={c.id} style={{ padding: '20px 24px', verticalAlign: 'top' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <span className="career-category" style={{ fontSize: '0.75rem' }}>{c.category}</span>
                          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--dark-slate)', marginTop: '2px' }}>
                            {c.title}
                          </div>
                        </div>
                        <button
                          onClick={() => toggleCompareCareer(c.id)}
                          style={{ color: 'var(--text-subtle)', padding: '4px' }}
                          title="Remove from comparison"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {/* Match Score */}
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px 24px', fontWeight: 700, color: 'var(--dark-slate)', fontSize: '0.92rem' }}>
                    Profile Match Score
                  </td>
                  {comparingCareers.map((c) => (
                    <td key={c.id} style={{ padding: '16px 24px' }}>
                      <span className={`match-badge ${c.baseMatch >= 90 ? 'match-high' : 'match-med'}`} style={{ fontSize: '1rem', padding: '6px 14px' }}>
                        {c.baseMatch}% Match
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Core Strengths */}
                <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: '#FAF9F6' }}>
                  <td style={{ padding: '16px 24px', fontWeight: 700, color: 'var(--dark-slate)', fontSize: '0.92rem' }}>
                    Core Strengths Leveraged
                  </td>
                  {comparingCareers.map((c) => (
                    <td key={c.id} style={{ padding: '16px 24px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {c.skillsUsed.map((s, idx) => (
                          <span key={idx} className="badge-tag" style={{ backgroundColor: 'white', border: '1px solid var(--border)' }}>
                            {s.name} ({s.level}%)
                          </span>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Why This Fits */}
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px 24px', fontWeight: 700, color: 'var(--dark-slate)', fontSize: '0.92rem' }}>
                    Why It Fits You
                  </td>
                  {comparingCareers.map((c) => (
                    <td key={c.id} style={{ padding: '16px 24px', fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                      <div className="fit-box" style={{ margin: 0 }}>
                        {c.mayFitBecause}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Watch Outs */}
                <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: '#FAF9F6' }}>
                  <td style={{ padding: '16px 24px', fontWeight: 700, color: 'var(--dark-slate)', fontSize: '0.92rem' }}>
                    Trade-offs & Watch Outs
                  </td>
                  {comparingCareers.map((c) => (
                    <td key={c.id} style={{ padding: '16px 24px', fontSize: '0.88rem', color: '#78350F', lineHeight: 1.5 }}>
                      <div className="watchout-box" style={{ margin: 0 }}>
                        {c.watchOut}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Work Environment */}
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px 24px', fontWeight: 700, color: 'var(--dark-slate)', fontSize: '0.92rem' }}>
                    Work Environment
                  </td>
                  {comparingCareers.map((c) => (
                    <td key={c.id} style={{ padding: '16px 24px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {c.workEnvironment.map((w, idx) => (
                          <span key={idx} className="badge-tag">
                            {w}
                          </span>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Education Path */}
                <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: '#FAF9F6' }}>
                  <td style={{ padding: '16px 24px', fontWeight: 700, color: 'var(--dark-slate)', fontSize: '0.92rem' }}>
                    Education Level
                  </td>
                  {comparingCareers.map((c) => (
                    <td key={c.id} style={{ padding: '16px 24px', fontSize: '0.92rem', fontWeight: 600, color: 'var(--dark-slate)' }}>
                      {c.educationLevel} Degree
                    </td>
                  ))}
                </tr>

                {/* Actions Row */}
                <tr>
                  <td style={{ padding: '20px 24px', fontWeight: 700, color: 'var(--dark-slate)', fontSize: '0.92rem' }}>
                    Actions
                  </td>
                  {comparingCareers.map((c) => (
                    <td key={c.id} style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <button
                          onClick={() => {
                            setSelectedCareerId(c.id);
                            setActiveView('detail');
                          }}
                          className="btn-primary btn-sm"
                          style={{ width: '100%', justifyContent: 'center' }}
                        >
                          <span>Full Profile</span>
                          <ChevronRight size={14} />
                        </button>

                        <button
                          onClick={() => openMayaWithPrompt(`How does ${c.title} compare to other roles in my list?`)}
                          className="btn-secondary btn-sm"
                          style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem' }}
                        >
                          <Sparkles size={14} />
                          <span>Ask Maya</span>
                        </button>
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
