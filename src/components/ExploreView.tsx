'use client';

import React, { useState } from 'react';
import { useCareer } from '../context/CareerContext';
import { CAREERS } from '../data/careersData';
import { Search, Filter, Bookmark, BarChart3, ChevronRight } from 'lucide-react';

export default function ExploreView() {
  const {
    setSelectedCareerId,
    setActiveView,
    toggleSaveCareer,
    isSaved,
    toggleCompareCareer,
    isComparing,
  } = useCareer();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedEducation, setSelectedEducation] = useState('All');

  const filteredCareers = CAREERS.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase())) ||
      c.skillsUsed.some((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'All' || c.category.toLowerCase().includes(selectedCategory.toLowerCase());

    const matchesEducation =
      selectedEducation === 'All' || c.educationLevel === selectedEducation;

    return matchesSearch && matchesCategory && matchesEducation;
  });

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--dark-slate)', marginBottom: '8px' }}>
            Explore Careers Directory
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '720px' }}>
            Browse and search all career profiles in the sandbox. Filter by industry, work style, or education level.
          </p>
        </div>

        {/* Search & Filters Bar */}
        <div className="card" style={{ padding: '20px 24px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Search Input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '280px', backgroundColor: 'var(--bg-subtle)', padding: '10px 16px', borderRadius: 'var(--radius-full)' }}>
              <Search size={18} style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search careers, skills, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: '0.92rem',
                  width: '100%',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            {/* Category Dropdown / Selectors */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                <Filter size={16} />
                <span>Industry:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-strong)',
                    backgroundColor: 'white',
                    fontSize: '0.88rem',
                    fontFamily: 'inherit',
                    outline: 'none'
                  }}
                >
                  <option value="All">All Industries</option>
                  <option value="Business">Business</option>
                  <option value="Creative">Creative</option>
                  <option value="Technology">Technology</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Education">Education</option>
                  <option value="Science">Science</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                <span>Education:</span>
                <select
                  value={selectedEducation}
                  onChange={(e) => setSelectedEducation(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-strong)',
                    backgroundColor: 'white',
                    fontSize: '0.88rem',
                    fontFamily: 'inherit',
                    outline: 'none'
                  }}
                >
                  <option value="All">All Levels</option>
                  <option value="Bachelor's">Bachelor's Degree</option>
                  <option value="Advanced">Advanced / Clinical</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <div style={{ marginBottom: '20px', fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          Showing {filteredCareers.length} career {filteredCareers.length === 1 ? 'profile' : 'profiles'}
        </div>

        {/* Careers Grid */}
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

                  <h3 className="career-title">{c.title}</h3>
                  <p className="career-desc">{c.description}</p>

                  <div className="fit-box">
                    <strong>Why it fits:</strong> {c.mayFitBecause}
                  </div>

                  <div className="tags-row">
                    {c.tags.map((t, idx) => (
                      <span key={idx} className="badge-tag">{t}</span>
                    ))}
                    <span className="badge-tag" style={{ backgroundColor: 'var(--bg-canvas)' }}>
                      🎓 {c.educationLevel}
                    </span>
                  </div>
                </div>

                <div className="card-actions">
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => toggleSaveCareer(c.id)}
                      className={`btn-secondary btn-sm ${saved ? 'tag-active' : ''}`}
                    >
                      <Bookmark size={14} style={{ fill: saved ? 'var(--primary)' : 'none' }} />
                      <span>{saved ? 'Saved' : 'Save'}</span>
                    </button>

                    <button
                      onClick={() => toggleCompareCareer(c.id)}
                      className={`btn-secondary btn-sm ${comparing ? 'tag-active' : ''}`}
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
                    <span>View Profile</span>
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
