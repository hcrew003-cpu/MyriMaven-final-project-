'use client';

import React from 'react';
import { useCareer } from '../context/CareerContext';
import { CAREERS } from '../data/careersData';
import { Bookmark, BarChart3, Trash2, ArrowRight, Compass } from 'lucide-react';

export default function SavedView() {
  const {
    savedCareerIds,
    toggleSaveCareer,
    setSelectedCareerId,
    setActiveView,
    compareCareerIds,
    toggleCompareCareer,
    isComparing,
  } = useCareer();

  const savedCareers = CAREERS.filter((c) => savedCareerIds.includes(c.id));

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '36px' }}>
          <div>
            <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--dark-slate)', marginBottom: '8px' }}>
              Saved Careers ({savedCareers.length})
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '680px' }}>
              Your shortlisted careers. Compare them side-by-side, ask Maya specific questions, or adjust priorities in the Sandbox.
            </p>
          </div>

          {savedCareers.length > 0 && (
            <button
              onClick={() => setActiveView('compare')}
              className="btn-primary"
            >
              <BarChart3 size={18} />
              <span>Compare Selected ({compareCareerIds.length})</span>
              <ArrowRight size={16} />
            </button>
          )}
        </div>

        {savedCareers.length === 0 ? (
          <div className="card" style={{ padding: '60px 24px', textAlign: 'center' }}>
            <Bookmark size={48} style={{ color: 'var(--text-subtle)', margin: '0 auto 16px' }} />
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--dark-slate)', marginBottom: '8px' }}>
              No saved careers yet
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '24px', maxWidth: '460px', margin: '0 auto 24px' }}>
              When exploring matches or browsing the directory, tap the bookmark icon to save roles here for quick side-by-side comparison.
            </p>
            <button onClick={() => setActiveView('explore')} className="btn-primary">
              <Compass size={16} />
              <span>Explore Careers Now</span>
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {savedCareers.map((c) => {
              const inCompare = isComparing(c.id);

              return (
                <div key={c.id} className="card card-hover" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: '280px' }}>
                      <input
                        type="checkbox"
                        checked={inCompare}
                        onChange={() => toggleCompareCareer(c.id)}
                        style={{ width: '20px', height: '20px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                        title="Include in Comparison"
                      />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span className="career-category">{c.category}</span>
                          <span className={`match-badge ${c.baseMatch >= 90 ? 'match-high' : 'match-med'}`}>
                            {c.baseMatch}% Match
                          </span>
                        </div>
                        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--dark-slate)', marginTop: '2px' }}>
                          {c.title}
                        </h2>
                        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px', maxWidth: '600px' }}>
                          {c.description}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <button
                        onClick={() => toggleCompareCareer(c.id)}
                        className={`btn-secondary btn-sm ${inCompare ? 'tag-active' : ''}`}
                      >
                        <BarChart3 size={14} />
                        <span>{inCompare ? 'Comparing' : 'Add to Compare'}</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedCareerId(c.id);
                          setActiveView('detail');
                        }}
                        className="btn-primary btn-sm"
                      >
                        <span>View Details</span>
                      </button>

                      <button
                        onClick={() => toggleSaveCareer(c.id)}
                        className="btn-ghost"
                        style={{ color: '#E11D48', padding: '6px' }}
                        title="Remove from saved"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
