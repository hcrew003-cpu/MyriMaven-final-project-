'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useCareer } from '../context/CareerContext';
import {
  Search, Filter, Bookmark, BookmarkCheck, BarChart3,
  ChevronRight, RefreshCw,
} from 'lucide-react';

type CatalogCareer = {
  id: string;
  title: string;
  datalevel: boolean;
  jobZone: string | null;
};

const PAGE_SIZE = 30;

const FIELD_PATTERNS: Record<string, RegExp> = {
  Business: /business|manag|market|sales|financ|account|human resources|executive|administrat|econom|logistic|operations|entrepreneur/i,
  Creative: /design|artist|writer|media|advertis|creative|architect|music|film|photograph|fashion/i,
  Technology: /software|computer|information technology|data|cyber|network|web|programmer|database|systems analyst/i,
  Healthcare: /medical|nurs|health|patient|physician|therap|clinical|dent|pharmac|surgeon|veterinar/i,
  Education: /teacher|educat|school|instruction|professor|librarian|tutor|training/i,
  Science: /scientist|research|chemist|biolog|physic|geolog|environment|ecolog|laboratory|astronom/i,
};

function zoneNumber(value: string | null): number | null {
  if (!value) return null;
  const match = value.match(/(?:job\s*zone\s*)?([1-5])/i);
  return match ? Number(match[1]) : null;
}

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
  const [selectedZone, setSelectedZone] = useState('All');
  const [catalog, setCatalog] = useState<CatalogCareer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');

    fetch('/api/onet/catalog', { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error('Unable to load the O*NET career directory.');
        return response.json();
      })
      .then((data) => {
        if (controller.signal.aborted) return;
        if (!Array.isArray(data.careers)) {
          throw new Error('The O*NET directory returned an unexpected response.');
        }
        setCatalog(
          data.careers.filter(
            (career: CatalogCareer) => career.id && career.title
          )
        );
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : 'Unable to load careers.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [reloadKey]);

  const filteredCareers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return catalog.filter((career) => {
      const matchesSearch =
        !query || `${career.title} ${career.id}`.toLowerCase().includes(query);
      const matchesCategory =
        selectedCategory === 'All' ||
        FIELD_PATTERNS[selectedCategory]?.test(career.title) === true;
      const matchesZone =
        selectedZone === 'All' ||
        zoneNumber(career.jobZone) === Number(selectedZone);
      return matchesSearch && matchesCategory && matchesZone;
    });
  }, [catalog, searchTerm, selectedCategory, selectedZone]);

  const pageCount = Math.max(1, Math.ceil(filteredCareers.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visibleCareers = filteredCareers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const openCareer = (id: string) => {
    setSelectedCareerId(id);
    setActiveView('detail');
  };

  const selectStyle: React.CSSProperties = {
    padding: '8px 12px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-strong)',
    backgroundColor: 'white',
    fontSize: '0.88rem',
    fontFamily: 'inherit',
    maxWidth: '100%',
  };

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--dark-slate)', marginBottom: 8 }}>
            Explore Careers Directory
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: 720 }}>
            Discover occupations from the O*NET career directory. Search, explore career profiles,
            save your favourites, and compare possibilities.
          </p>
        </div>

        <div className="card" style={{ padding: '20px 24px', marginBottom: 24 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: '1 1 300px', minWidth: 0, backgroundColor: 'var(--bg-subtle)', padding: '10px 16px', borderRadius: 'var(--radius-full)' }}>
              <Search size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <input
                type="search"
                aria-label="Search occupations"
                placeholder="Search occupation titles or O*NET codes..."
                value={searchTerm}
                onChange={(event) => { setSearchTerm(event.target.value); setPage(1); }}
                style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.92rem', width: '100%', minWidth: 0, fontFamily: 'inherit' }}
              />
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              <Filter size={16} /> Field:
              <select value={selectedCategory} onChange={(event) => { setSelectedCategory(event.target.value); setPage(1); }} style={selectStyle}>
                <option value="All">All Fields</option>
                {Object.keys(FIELD_PATTERNS).map((field) => <option key={field} value={field}>{field}</option>)}
              </select>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Preparation:
              <select value={selectedZone} onChange={(event) => { setSelectedZone(event.target.value); setPage(1); }} style={selectStyle}>
                <option value="All">All Job Zones</option>
                <option value="1">Zone 1 — Little preparation</option>
                <option value="2">Zone 2 — Some preparation</option>
                <option value="3">Zone 3 — Medium preparation</option>
                <option value="4">Zone 4 — Considerable preparation</option>
                <option value="5">Zone 5 — Extensive preparation</option>
              </select>
            </label>
          </div>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 20 }}>
          Field filters use occupation-title keywords, and Job Zones describe typical preparation,
          not guaranteed degree requirements. O*NET is a U.S. resource; Canadian requirements may differ.
        </p>

        {loading ? (
          <p>Loading the O*NET occupation directory...</p>
        ) : error ? (
          <div className="card" style={{ padding: 24 }}>
            <p role="alert" style={{ marginBottom: 16 }}>{error}</p>
            <button className="btn-primary btn-sm" onClick={() => setReloadKey((value) => value + 1)}>
              <RefreshCw size={16} /> Retry
            </button>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 20, fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Showing {filteredCareers.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredCareers.length)} of {filteredCareers.length} matching occupations ({catalog.length} in directory)
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: 24 }}>
              {visibleCareers.map((career) => {
                const saved = isSaved(career.id);
                const comparing = isComparing(career.id);
                const zone = zoneNumber(career.jobZone);
                return (
                  <div key={career.id} className="career-card">
                    <div>
                      <div className="career-card-header">
                        <span className="career-category">O*NET Occupation</span>
                        <span className="badge-tag">{career.id}</span>
                      </div>
                      <h2 className="career-title" style={{ fontSize: '1.35rem' }}>{career.title}</h2>
                      <p className="career-desc">
                        Open the occupation profile to explore responsibilities, skills, education information, and related careers.
                      </p>
                      <div className="tags-row">
                        {zone !== null && <span className="badge-tag">Job Zone {zone}</span>}
                        <span className="badge-tag">O*NET Career</span>
                      </div>
                    </div>
                    <div className="card-actions" style={{ gap: 10 }}>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button
                          className={saved ? 'btn-primary btn-sm' : 'btn-secondary btn-sm'}
                          onClick={() => toggleSaveCareer(career.id)}
                          aria-pressed={saved}
                          style={saved ? { backgroundColor: '#0c6957', color: '#fff', borderColor: '#0c6957', fontWeight: 700 } : undefined}
                        >
                          {saved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                          {saved ? 'Saved ✓' : 'Save'}
                        </button>
                        <button
                          className={comparing ? 'btn-primary btn-sm' : 'btn-secondary btn-sm'}
                          onClick={() => toggleCompareCareer(career.id)}
                          aria-pressed={comparing}
                          style={comparing ? { backgroundColor: '#0c6957', color: '#fff', borderColor: '#0c6957' } : undefined}
                        >
                          <BarChart3 size={14} />
                          {comparing ? 'In Compare ✓' : 'Compare'}
                        </button>
                      </div>
                      <button className="btn-primary btn-sm" onClick={() => openCareer(career.id)}>
                        View Profile <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredCareers.length === 0 && (
              <div className="card" style={{ padding: 24 }}>
                No occupations match these filters. Try a different search or select All Fields and All Job Zones.
              </div>
            )}

            {pageCount > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap', marginTop: 30 }}>
                <button className="btn-secondary" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Previous</button>
                <span>Page {currentPage} of {pageCount}</span>
                <button className="btn-secondary" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)}>Next</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
