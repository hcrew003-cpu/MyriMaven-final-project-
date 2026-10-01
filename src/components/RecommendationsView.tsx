'use client';

import React, { useState } from 'react';
import { useCareer } from '../context/CareerContext';
import { CAREERS } from '../data/careersData';
import { Sliders, BarChart3, Bookmark, ChevronRight, Check, ArrowRight } from 'lucide-react';

export default function RecommendationsView() {
  const {
    userProfile,
    setActiveView,
    setSelectedCareerId,
    savedCareerIds,
    toggleSaveCareer,
    isSaved,
    compareCareerIds,
    toggleCompareCareer,
    isComparing,
  } = useCareer();

  const [activeFilter, setActiveFilter] = useState<'all' | 'high' | 'creative' | 'business' | 'tech'>('all');

  const filteredCareers = CAREERS.filter((c) => {
    if (activeFilter === 'high') return c.baseMatch >= 90;
    if (activeFilter === 'creative') return c.category.toLowerCase().includes('creative');
    if (activeFilter === 'business') return c.category.toLowerCase().includes('business');
    if (activeFilter === 'tech') return c.category.toLowerCase().includes('tech');
    return true;
  });

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Your Personalized Match Report
              </span>
              <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--dark-slate)', marginTop: '4px' }}>
                Careers Matched to You
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginTop: '6px', maxWidth: '780px' }}>
                Based on your {userProfile.interests.length} interests, top skills in Communication & Organization, and preference for collaborative, flexible work.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setActiveView('what-if')}
                className="btn-secondary"
                style={{ fontSize: '0.9rem' }}
              >
                <Sliders size={16} />
                <span>Test in What-If Sandbox</span>
              </button>

              <button
                onClick={() => setActiveView('compare')}
                className="btn-primary"
                style={{ fontSize: '0.9rem' }}
              >
                <BarChart3 size={16} />
                <span>Compare Selected ({compareCareerIds.length})</span>
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '24px', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: `All Matches (${CAREERS.length})` },
              { id: 'high', label: 'Top Matches (90%+)' },
              { id: 'creative', label: 'Creative & Design' },
              { id: 'business', label: 'Business & Leadership' },
              { id: 'tech', label: 'Technology' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as any)}
                className={`tag-chip ${activeFilter === tab.id ? 'active' : ''}`}
                style={{
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  backgroundColor: activeFilter === tab.id ? 'var(--primary)' : 'white',
                  color: activeFilter === tab.id ? 'white' : 'var(--dark-slate)',
                  border: '1px solid ' + (activeFilter === tab.id ? 'var(--primary)' : 'var(--border-strong)'),
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Career Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '24px'
        }}>
          {filteredCareers.map((c) => {
            const saved = isSaved(c.id);
            const comparing = isComparing(c.id);

            return (
              <div key={c.id} className="career-card">
                <div>
                  <div className="career-card-header">
                    <span className="career-category">{c.category}</span>
                    <span className={`match-badge ${c.baseMatch >= 90 ? 'match-high' : 'match-med'}`}>
                      {c.baseMatch}% Match
                    </span>
                  </div>

                  <h2 className="career-title" style={{ fontSize: '1.35rem' }}>{c.title}</h2>
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
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => toggleSaveCareer(c.id)}
                      className={`btn-secondary btn-sm ${saved ? 'tag-active' : ''}`}
                      title={saved ? 'Remove from saved' : 'Save career'}
                    >
                      <Bookmark size={14} style={{ fill: saved ? 'var(--primary)' : 'none' }} />
                      <span>{saved ? 'Saved' : 'Save'}</span>
                    </button>

                    <button
                      onClick={() => toggleCompareCareer(c.id)}
                      className={`btn-secondary btn-sm ${comparing ? 'tag-active' : ''}`}
                      title={comparing ? 'Remove from compare' : 'Add to compare'}
                    >
                      <BarChart3 size={14} />
                      <span>{comparing ? 'In Compare' : 'Compare'}</span>
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedCareerId(c.id);
                      setActiveView('detail');
                    }}
                    className="btn-primary btn-sm"
                  >
                    <span>Full Profile</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
