'use client';

import React, { useEffect, useState } from 'react';
import { useCareer, type OnetCareer } from '../context/CareerContext';
import { CAREERS } from '../data/careersData';
import { loadCareerNotes, saveCareerNote, deleteCareerNote } from '../lib/careerNotes';
import {
  Bookmark,
  BarChart3,
  Trash2,
  ArrowRight,
  Compass,
  NotebookPen,
  Save,
} from 'lucide-react';

const isOnetId = (id: string) =>
  /^\d{2}-\d{4}\.\d{2}$/.test(id);

export default function SavedView() {
  const {
    savedCareerIds,
    authUser,
    toggleSaveCareer,
    setSelectedCareerId,
    setActiveView,
    compareCareerIds,
    toggleCompareCareer,
    isComparing,
  } = useCareer();

  const [onetCareers, setOnetCareers] = useState<
    Record<string, OnetCareer>
  >({});

  const [loading, setLoading] = useState(false);
  const [loadErrors, setLoadErrors] = useState<string[]>([]);

  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [savedNotes, setSavedNotes] = useState<Record<string, string>>({});
  const [notesLoading, setNotesLoading] = useState(true);
  const [notesError, setNotesError] = useState('');
  const [busyNoteId, setBusyNoteId] = useState<string | null>(null);
  const [noteFeedback, setNoteFeedback] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    setNoteDrafts({});
    setSavedNotes({});
    setNoteFeedback({});
    setNotesError('');

    if (!authUser) {
      setNotesLoading(false);
      return;
    }

    setNotesLoading(true);
    loadCareerNotes(authUser)
      .then((notes) => {
        if (cancelled) return;
        const loaded = Object.fromEntries(notes.map((item) => [item.career_id, item.note]));
        setSavedNotes(loaded);
        setNoteDrafts(loaded);
      })
      .catch((error: unknown) => {
        if (!cancelled) setNotesError(error instanceof Error ? error.message : 'Unable to load notes.');
      })
      .finally(() => {
        if (!cancelled) setNotesLoading(false);
      });

    return () => { cancelled = true; };
  }, [authUser?.id]);

  const handleSaveNote = async (careerId: string) => {
    if (!authUser || busyNoteId || notesLoading) return;
    const note = noteDrafts[careerId] ?? '';
    setBusyNoteId(careerId);
    setNoteFeedback((prev) => ({ ...prev, [careerId]: '' }));
    try {
      await saveCareerNote(authUser, careerId, note);
      setSavedNotes((prev) => ({ ...prev, [careerId]: note }));
      setNoteFeedback((prev) => ({ ...prev, [careerId]: 'Note saved!' }));
    } catch (error) {
      setNoteFeedback((prev) => ({ ...prev, [careerId]: error instanceof Error ? error.message : 'Could not save note.' }));
    } finally {
      setBusyNoteId(null);
    }
  };

  const handleDeleteNote = async (careerId: string) => {
    if (!authUser || busyNoteId || notesLoading) return;
    setBusyNoteId(careerId);
    setNoteFeedback((prev) => ({ ...prev, [careerId]: '' }));
    try {
      await deleteCareerNote(authUser, careerId);
      setSavedNotes((prev) => {
        const updated = { ...prev };
        delete updated[careerId];
        return updated;
      });
      setNoteDrafts((prev) => ({ ...prev, [careerId]: '' }));
      setNoteFeedback((prev) => ({ ...prev, [careerId]: 'Note deleted.' }));
    } catch (error) {
      setNoteFeedback((prev) => ({ ...prev, [careerId]: error instanceof Error ? error.message : 'Could not delete note.' }));
    } finally {
      setBusyNoteId(null);
    }
  };

  const onetIds = savedCareerIds.filter(isOnetId);
  const onetKey = onetIds.join('|');

  useEffect(() => {
    let cancelled = false;

    async function loadCareers() {
      if (onetIds.length === 0) {
        setOnetCareers({});
        setLoadErrors([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setLoadErrors([]);

      const results = await Promise.allSettled(
        onetIds.map(async (id) => {
          const response = await fetch(
            `/api/onet/occupation?code=${encodeURIComponent(id)}`
          );

          if (!response.ok) {
            throw new Error(`Could not load occupation ${id}`);
          }

          const career = (await response.json()) as OnetCareer;

          return { id, career };
        })
      );

      if (cancelled) return;

      const loaded: Record<string, OnetCareer> = {};
      const errors: string[] = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          loaded[result.value.id] = result.value.career;
        } else {
          errors.push(onetIds[index]);
        }
      });

      setOnetCareers(loaded);
      setLoadErrors(errors);
      setLoading(false);
    }

    loadCareers();

    return () => {
      cancelled = true;
    };
  }, [onetKey]);

  const savedCareers = savedCareerIds.map((id) => {
    const prototype = CAREERS.find((career) => career.id === id);

    if (prototype) {
      return {
        id,
        title: prototype.title,
        description: prototype.description,
        category: prototype.category,
        match: prototype.baseMatch,
        isOnet: false,
        unavailable: false,
      };
    }

    const onet = onetCareers[id];

    return {
      id,
      title: onet?.title ?? `O*NET Occupation ${id}`,
      description:
        onet?.description ??
        'Occupation information is being loaded or is temporarily unavailable.',
      category: 'O*NET Occupation',
      match: null as number | null,
      isOnet: true,
      unavailable: loadErrors.includes(id),
    };
  });

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '20px',
            marginBottom: '36px',
          }}
        >
          <div>
            <h1
              style={{
                fontSize: '2.4rem',
                fontWeight: 800,
                color: 'var(--dark-slate)',
                marginBottom: '8px',
              }}
            >
              Saved Careers ({savedCareers.length})
            </h1>

            <p
              style={{
                color: 'var(--text-muted)',
                fontSize: '1.05rem',
                maxWidth: '680px',
              }}
            >
              Your shortlisted careers. Compare them side-by-side,
              ask Maya specific questions, or adjust priorities
              in the Sandbox.
            </p>
          </div>

          {savedCareers.length > 0 && (
            <button
              onClick={() => setActiveView('compare')}
              className="btn-primary"
            >
              <BarChart3 size={18} />
              <span>
                Compare Selected ({compareCareerIds.length})
              </span>
              <ArrowRight size={16} />
            </button>
          )}
        </div>

        {/* Empty State */}
        {savedCareers.length === 0 ? (
          <div
            className="card"
            style={{
              padding: '60px 24px',
              textAlign: 'center',
            }}
          >
            <Bookmark
              size={48}
              style={{
                color: 'var(--text-subtle)',
                margin: '0 auto 16px',
              }}
            />

            <h2
              style={{
                fontSize: '1.4rem',
                fontWeight: 700,
                color: 'var(--dark-slate)',
                marginBottom: '8px',
              }}
            >
              No saved careers yet
            </h2>

            <p
              style={{
                color: 'var(--text-muted)',
                fontSize: '0.95rem',
                maxWidth: '460px',
                margin: '0 auto 24px',
              }}
            >
              When exploring matches or browsing the directory,
              save careers here to compare your options.
            </p>

            <button
              onClick={() => setActiveView('recommendations')}
              className="btn-primary"
            >
              <Compass size={16} />
              <span>Explore Recommendations</span>
            </button>
          </div>
        ) : (
          <>
            {notesError && <p role="alert" style={{ color: '#b91c1c', marginBottom: 16 }}>Could not load personal notes: {notesError}</p>}
            {loading && (
              <p
                style={{
                  color: 'var(--text-muted)',
                  marginBottom: '20px',
                }}
              >
                Loading your saved O*NET careers...
              </p>
            )}

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              {savedCareers.map((career) => {
                const inCompare = isComparing(career.id);

                return (
                  <div
                    key={career.id}
                    className="card card-hover"
                    style={{ padding: '24px' }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '16px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '16px',
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={inCompare}
                          onChange={() =>
                            toggleCompareCareer(career.id)
                          }
                          style={{
                            width: '20px',
                            height: '20px',
                            accentColor: 'var(--primary)',
                            cursor: 'pointer',
                            flexShrink: 0,
                          }}
                          title="Include in Comparison"
                        />

                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              flexWrap: 'wrap',
                              gap: '10px',
                              marginBottom: '6px',
                            }}
                          >
                            <span className="career-category">
                              {career.category}
                            </span>

                            {career.match !== null && (
                              <span
                                className={`match-badge ${
                                  career.match >= 90
                                    ? 'match-high'
                                    : 'match-med'
                                }`}
                              >
                                {career.match}% Match
                              </span>
                            )}

                            {career.isOnet && (
                              <span
                                style={{
                                  fontSize: '0.75rem',
                                  color: 'var(--text-muted)',
                                }}
                              >
                                {career.id}
                              </span>
                            )}
                          </div>

                          <h2
                            style={{
                              fontSize: '1.3rem',
                              fontWeight: 700,
                              color: 'var(--dark-slate)',
                              marginTop: '2px',
                            }}
                          >
                            {career.title}
                          </h2>

                          <p
                            style={{
                              fontSize: '0.88rem',
                              color: 'var(--text-muted)',
                              marginTop: '4px',
                              maxWidth: '650px',
                              lineHeight: 1.6,
                            }}
                          >
                            {career.description}
                          </p>

                          {career.unavailable && (
                            <p
                              style={{
                                color: '#b45309',
                                fontSize: '0.82rem',
                                marginTop: '8px',
                              }}
                            >
                              This occupation's details could not
                              be loaded right now.
                            </p>
                          )}
                        </div>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '12px',
                        }}
                      >
                        <button
                          onClick={() =>
                            toggleCompareCareer(career.id)
                          }
                          className={`btn-secondary btn-sm ${
                            inCompare ? 'tag-active' : ''
                          }`}
                        >
                          <BarChart3 size={14} />
                          <span>
                            {inCompare
                              ? 'Comparing'
                              : 'Add to Compare'}
                          </span>
                        </button>

                        <button
                          onClick={() => {
                            setSelectedCareerId(career.id);
                            setActiveView('detail');
                          }}
                          className="btn-primary btn-sm"
                        >
                          <span>View Details</span>
                        </button>

                        <button
                          onClick={() =>
                            toggleSaveCareer(career.id)
                          }
                          className="btn-ghost"
                          style={{
                            color: '#E11D48',
                            padding: '6px',
                          }}
                          title="Remove from saved"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Personal notes are private to the signed-in student. */}
                    <div style={{ borderTop: '1px solid #e5e7eb', marginTop: 20, paddingTop: 18 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                        <NotebookPen size={18} style={{ color: 'var(--primary)' }} />
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--dark-slate)' }}>
                          My Personal Notes
                        </h3>
                      </div>
                      <textarea
                        aria-label={`Personal notes for ${career.title}`}
                        placeholder="What interests you about this career? What would you like to research?"
                        value={noteDrafts[career.id] ?? ''}
                        onChange={(event) => {
                          const value = event.target.value;
                          setNoteDrafts((prev) => ({ ...prev, [career.id]: value }));
                          setNoteFeedback((prev) => ({ ...prev, [career.id]: '' }));
                        }}
                        disabled={!authUser || notesLoading || busyNoteId === career.id}
                        rows={3}
                        style={{ width: '100%', resize: 'vertical', padding: 12, border: '1px solid #d1d5db', borderRadius: 10, fontFamily: 'inherit', fontSize: 14, lineHeight: 1.6, boxSizing: 'border-box' }}
                      />
                      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginTop: 10 }}>
                        <button
                          type="button"
                          className="btn-primary btn-sm"
                          disabled={!authUser || notesLoading || busyNoteId !== null || (noteDrafts[career.id] ?? '') === (savedNotes[career.id] ?? '')}
                          onClick={() => handleSaveNote(career.id)}
                        >
                          <Save size={15} />
                          {busyNoteId === career.id ? 'Saving...' : 'Save Note'}
                        </button>
                        <button
                          type="button"
                          className="btn-secondary btn-sm"
                          disabled={!authUser || notesLoading || busyNoteId !== null || !(savedNotes[career.id] ?? '')}
                          onClick={() => handleDeleteNote(career.id)}
                        >
                          <Trash2 size={15} /> Delete Note
                        </button>
                        <span role="status" style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                          {noteFeedback[career.id] || ((noteDrafts[career.id] ?? '') !== (savedNotes[career.id] ?? '') ? 'Unsaved changes' : '')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
