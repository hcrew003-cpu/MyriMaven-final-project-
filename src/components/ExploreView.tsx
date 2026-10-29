'use client';

import React, { useEffect, useState } from 'react';
import { useCareer } from '../context/CareerContext';
import { CAREERS } from '../data/careersData';
import { Search, Filter, Bookmark, BarChart3, ChevronRight } from 'lucide-react';
type OnetOccupation = {
  id: string;
  title: string;
  description: string;
  tasks: {
    task?: { id: string; title: string }[];
  } | null;
  skills: {
    element?: { id: string; name: string; description: string }[];
  } | null;
  knowledge: {
    element?: { id: string; name: string; description: string }[];
  } | null;
  education: {
    response?: {
      code: number;
      title: string;
      percentage_of_respondents: number;
    }[];
  } | null;
  relatedOccupations: {
    occupation?: { code: string; title: string }[];
  } | null;
};
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
  
  const [onetCareers, setOnetCareers] = useState<
    { id: string; title: string }[]
  >([]);
  const [onetTotal, setOnetTotal] = useState(0);
  const [onetLoading, setOnetLoading] = useState(false);
  const [onetError, setOnetError] = useState('');
  
const [selectedOnetCareer, setSelectedOnetCareer] =
  useState<OnetOccupation | null>(null);

const [onetDetailLoading, setOnetDetailLoading] =
  useState(false);

const [onetDetailError, setOnetDetailError] =
  useState('');


  useEffect(() => {
    const keyword = searchTerm.trim();

    if (keyword.length < 2) {
      setOnetCareers([]);
      setOnetTotal(0);
      setOnetError('');
      setOnetLoading(false);
      return;
    }

    const controller = new AbortController();

    setOnetLoading(true);
    setOnetError('');
    setOnetCareers([]);
    setOnetTotal(0);

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/onet?keyword=${encodeURIComponent(keyword)}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error('Unable to search O*NET careers.');
        }

        const data = await response.json();

        if (!controller.signal.aborted) {
          setOnetCareers(data.careers ?? []);
          setOnetTotal(data.total ?? 0);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setOnetError('Career search is temporarily unavailable.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setOnetLoading(false);
        }
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchTerm]);

const openOnetCareer = async (code: string) => {
  setOnetDetailLoading(true);
  setOnetDetailError('');
  setSelectedOnetCareer(null);

  try {
    const response = await fetch(
      `/api/onet/occupation?code=${encodeURIComponent(code)}`
    );

    if (!response.ok) {
      throw new Error('Unable to load career details.');
    }

    const data: OnetOccupation = await response.json();
    setSelectedOnetCareer(data);
  } catch {
    setOnetDetailError(
      'Career details are temporarily unavailable.'
    );
  } finally {
    setOnetDetailLoading(false);
  }
};


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
            Explore personalized career profiles or search a much larger directory of occupations powered by O*NET.
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
        
{(onetDetailLoading || onetDetailError || selectedOnetCareer) && (
  <section
    className="card"
    style={{ padding: '28px', marginTop: '32px' }}
  >
    {onetDetailLoading && <p>Loading career profile...</p>}

    {onetDetailError && (
      <p role="alert">{onetDetailError}</p>
    )}

    {selectedOnetCareer && (
      <div>
        <button
          onClick={() => setSelectedOnetCareer(null)}
          className="btn-secondary btn-sm"
          style={{ marginBottom: '20px' }}
        >
          Close Profile
        </button>

        <h2 style={{ fontSize: '1.8rem', marginBottom: '12px' }}>
          {selectedOnetCareer.title}
        </h2>

        <p style={{ lineHeight: 1.7, marginBottom: '24px' }}>
          {selectedOnetCareer.description}
        </p>

        <h3 style={{ marginBottom: '12px' }}>
          Typical Responsibilities
        </h3>
        <ul style={{ paddingLeft: '24px', marginBottom: '24px' }}>
          {(selectedOnetCareer.tasks?.task ?? []).map((task) => (
            <li key={task.id} style={{ marginBottom: '8px' }}>
              {task.title}
            </li>
          ))}
        </ul>

        <h3 style={{ marginBottom: '12px' }}>
          Key Skills
        </h3>
        <ul style={{ paddingLeft: '24px', marginBottom: '24px' }}>
          {(selectedOnetCareer.skills?.element ?? []).map((skill) => (
            <li key={skill.id} style={{ marginBottom: '8px' }}>
              <strong>{skill.name}:</strong> {skill.description}
            </li>
          ))}
        </ul>

        <h3 style={{ marginBottom: '12px' }}>
          Education Backgrounds
        </h3>
        <ul style={{ paddingLeft: '24px', marginBottom: '24px' }}>
          {(selectedOnetCareer.education?.response ?? []).map(
            (education) => (
              <li key={education.code} style={{ marginBottom: '8px' }}>
                {education.title} — {education.percentage_of_respondents}%
                of respondents
              </li>
            )
          )}
        </ul>

        <h3 style={{ marginTop: '24px', marginBottom: '12px' }}>
          Related Careers
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {(selectedOnetCareer.relatedOccupations?.occupation ?? []).map(
            (related) => (
              <button
                key={related.code}
                onClick={() => openOnetCareer(related.code)}
                className="btn-secondary btn-sm"
              >
                {related.title}
              </button>
            )
          )}
        </div>

        <p
          style={{
            marginTop: '24px',
            fontSize: '0.8rem',
            color: 'var(--text-muted)'
          }}
        >
          Source: O*NET Web Services. U.S. occupational information
          may differ from Canadian requirements.
        </p>
      </div>
    )}
  </section>
)}

        {/* O*NET Career Discovery */}
        <section style={{ marginTop: '48px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h2
              style={{
                fontSize: '1.8rem',
                fontWeight: 800,
                color: 'var(--dark-slate)',
                marginBottom: '8px'
              }}
            >
              Discover More Careers
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>
              Search occupations beyond our featured career profiles.
              Results are provided by O*NET, a U.S. occupational
              information resource.
            </p>
          </div>

          {searchTerm.trim().length < 2 ? (
            <div className="card" style={{ padding: '28px' }}>
              <p style={{ color: 'var(--text-muted)' }}>
                Type at least two characters in the search bar above
                to discover additional careers.
              </p>
            </div>
          ) : onetLoading ? (
            <div className="card" style={{ padding: '28px' }}>
              Searching the career directory...
            </div>
          ) : onetError ? (
            <div className="card" style={{ padding: '28px' }}>
              <p role="alert">{onetError}</p>
            </div>
          ) : (
            <>
              <p
                style={{
                  marginBottom: '20px',
                  color: 'var(--text-muted)'
                }}
              >
                {onetTotal} matching occupations found.
                Showing {onetCareers.length} results.
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
                  gap: '20px'
                }}
              >
                {onetCareers.map((career) => (
                  <div
                    key={career.id}
                    className="career-card"
                    style={{ padding: '24px' }}
                  >
                    <div>
                      <span className="career-category">
                        O*NET Occupation
                      </span>

                      <h3
                        className="career-title"
                        style={{ marginTop: '16px' }}
                      >
                        {career.title}
                      </h3>

                      <p
                        style={{
                          color: 'var(--text-muted)',
                          fontSize: '0.85rem'
                        }}
                      >
                        Occupation code: {career.id}
                      </p>
                    </div>

                   
<button
  onClick={() => {
  setSelectedCareerId(career.id);
  setActiveView('detail');
}}
  className="btn-primary btn-sm"
  style={{ marginTop: '20px' }}
>
  <span>View Profile</span>
  <ChevronRight size={14} />
</button>

                  </div>
                ))}
              </div>

              {onetCareers.length === 0 && (
                <div className="card" style={{ padding: '28px' }}>
                  No matching occupations found. Try another keyword.
                </div>
              )}
            </>
          )}

          <p
            style={{
              marginTop: '24px',
              fontSize: '0.8rem',
              color: 'var(--text-muted)'
            }}
          >
            Occupational information from O*NET Web Services,
            U.S. Department of Labor/Employment and Training
            Administration. U.S. occupation information may differ
            from Canadian requirements.
          </p>
        </section>

      </div>
    </div>
  );
}
