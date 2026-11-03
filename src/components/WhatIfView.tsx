
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useCareer } from '../context/CareerContext';
import type { OnetCareer } from '../context/CareerContext';
import type { WhatIfState, UserProfile } from '../types/career';
import { calculateOnetMatch } from '../lib/onetMatching';
import {
  Sparkles,
  Sliders,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Bookmark,
  BookmarkCheck,
  ChevronRight,
  BarChart3,
} from 'lucide-react';

type PreferenceKey = keyof UserProfile['preferences'];

type CatalogCareer = {
  id: string;
  title: string;
};

type ScenarioCareer = {
  career: OnetCareer;
  baseline: number;
  score: number;
  delta: number;
  reasons: string[];
  considerations: string[];
  confidence: string;
};

const DETAIL_LIMIT = 36;

const priorities: {
  key: keyof WhatIfState;
  label: string;
}[] = [
  { key: 'workLifeBalance', label: 'Work-Life Balance' },
  { key: 'helpingOthers', label: 'Helping Others' },
  { key: 'stability', label: 'Job Stability' },
  { key: 'growth', label: 'Growth & Advancement' },
  { key: 'leadership', label: 'Leadership' },
  { key: 'income', label: 'High Income Potential' },
  { key: 'creativity', label: 'Creative Expression' },
];

const preferences: {
  key: PreferenceKey;
  label: string;
  left: string;
  right: string;
}[] = [
  {
    key: 'soloVsTeam',
    label: 'Collaboration',
    left: 'Independent',
    right: 'Team-oriented',
  },
  {
    key: 'structuredVsFlexible',
    label: 'Work structure',
    left: 'Structured',
    right: 'Flexible',
  },
  {
    key: 'officeVsRemote',
    label: 'Work location',
    left: 'In-office',
    right: 'Remote',
  },
  {
    key: 'peopleVsTask',
    label: 'Daily focus',
    left: 'People',
    right: 'Tasks & systems',
  },
  {
    key: 'creativeVsAnalytical',
    label: 'Thinking style',
    left: 'Creative',
    right: 'Analytical',
  },
  {
    key: 'fastVsPredictable',
    label: 'Work pace',
    left: 'Fast-paced',
    right: 'Predictable',
  },
];

const INTEREST_TERMS: Record<string, string[]> = {
  technology: [
    'software', 'computer', 'network',
    'information', 'cyber', 'web',
  ],
  business: [
    'business', 'manager', 'marketing',
    'finance', 'account', 'sales', 'operations',
  ],
  'helping people': [
    'social', 'counsel', 'health',
    'teacher', 'therap', 'advisor',
  ],
  creativity: [
    'design', 'artist', 'writer',
    'media', 'creative', 'architect',
  ],
  environment: [
    'environment', 'conservation',
    'agricultur', 'forestry', 'wildlife',
  ],
  'problem solving': [
    'analyst', 'engineer', 'scientist',
    'research', 'investigator',
  ],
  leadership: [
    'manager', 'director', 'executive',
    'supervisor', 'administrator',
  ],
  'working with data': [
    'data', 'statistic', 'analyst',
    'research', 'financial',
  ],
  communication: [
    'writer', 'marketing', 'teacher',
    'communications', 'reporter',
  ],
  healthcare: [
    'medical', 'nurs', 'health',
    'patient', 'therap', 'clinical',
  ],
  entrepreneurship: [
    'business', 'manager', 'marketing',
    'sales', 'product', 'executive',
  ],
};

function toFivePointScale(value: number): number {
  return Math.max(
    1,
    Math.min(5, Math.round(value / 25) + 1)
  );
}

function toHundredPointScale(rating: number): number {
  return (rating - 1) * 25;
}

function selectCandidates(
  catalog: CatalogCareer[],
  profile: UserProfile
): CatalogCareer[] {
  const labels = [
    ...profile.interests,
    ...profile.goals,
  ];

  const terms = labels.flatMap((label) => {
    const normalized = label.toLowerCase().trim();

    return [
      ...(INTEREST_TERMS[normalized] ?? []),
      ...normalized
        .split(/[^a-z0-9]+/)
        .filter((word) => word.length > 3),
    ];
  });

  const ranked = catalog
    .map((career) => ({
      career,
      hits: terms.filter((term) =>
        career.title.toLowerCase().includes(term)
      ).length,
    }))
    .sort(
      (a, b) =>
        b.hits - a.hits ||
        a.career.title.localeCompare(b.career.title)
    );

  const relevant = ranked
    .filter((item) => item.hits > 0)
    .map((item) => item.career);

  const others = ranked
    .filter((item) => item.hits === 0)
    .map((item) => item.career);

  const selected: CatalogCareer[] = [];
  let index = 0;

  while (
    selected.length < DETAIL_LIMIT &&
    (index * 3 < relevant.length ||
      index < others.length)
  ) {
    for (let j = 0; j < 3; j++) {
      const career = relevant[index * 3 + j];

      if (
        career &&
        selected.length < DETAIL_LIMIT
      ) {
        selected.push(career);
      }
    }

    if (
      others[index] &&
      selected.length < DETAIL_LIMIT
    ) {
      selected.push(others[index]);
    }

    index++;
  }

  return selected;
}

export default function WhatIfView() {
  const {
    authUser,
    userProfile,
    whatIfToggles,
    toggleWhatIf,
    whatIfPreferences,
    updateWhatIfPreference,
    resetWhatIf,
    setSelectedCareerId,
    setActiveView,
    toggleSaveCareer,
    isSaved,
    toggleCompareCareer,
    isComparing,
    openMayaWithPrompt,
  } = useCareer();

  const [catalog, setCatalog] = useState<CatalogCareer[]>([]);
  const [onetCareers, setOnetCareers] = useState<OnetCareer[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const hasProfile = Boolean(
    userProfile.interests.length ||
    Object.keys(userProfile.skills).length ||
    userProfile.goals.length
  );

  const activePriorities = priorities.filter(
    ({ key }) => whatIfToggles[key]
  );

  const changedPreferences = preferences.filter(
    ({ key }) =>
      whatIfPreferences[key] !==
      userProfile.preferences[key]
  );

  const isBaseline =
    activePriorities.length === 0 &&
    changedPreferences.length === 0;

  // Load the same complete O*NET catalog used by Recommendations.
  useEffect(() => {
    const controller = new AbortController();

    setLoadingCatalog(true);
    setError('');
    setCatalog([]);
    setOnetCareers([]);

    fetch('/api/onet/catalog', {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Could not load O*NET careers.');
        }

        return response.json();
      })
      .then((data) => {
        if (!controller.signal.aborted) {
          setCatalog(
            Array.isArray(data.careers)
              ? data.careers
              : []
          );
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load careers.'
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoadingCatalog(false);
        }
      });

    return () => controller.abort();
  }, [reloadKey]);

  // Use the saved profile to choose candidates.
  // Temporary What-If changes do not alter this candidate pool.
  const candidates = useMemo(
    () => selectCandidates(catalog, userProfile),
    [catalog, userProfile]
  );

  const candidateKey = candidates
    .map((career) => career.id)
    .join(',');

  // Fetch detailed occupation information in small batches.
  useEffect(() => {
    if (!candidateKey) {
      setOnetCareers([]);
      setLoadingDetails(false);
      return;
    }

    const controller = new AbortController();
    const ids = candidateKey.split(',');

    setOnetCareers([]);
    setLoadingDetails(true);

    async function loadDetails() {
      const loaded: OnetCareer[] = [];

      try {
        for (
          let index = 0;
          index < ids.length &&
          !controller.signal.aborted;
          index += 4
        ) {
          const batch = await Promise.allSettled(
            ids.slice(index, index + 4).map(
              async (id) => {
                const response = await fetch(
                  `/api/onet/occupation?code=${encodeURIComponent(id)}`,
                  { signal: controller.signal }
                );

                if (!response.ok) {
                  throw new Error(
                    'Occupation details unavailable'
                  );
                }

                return (
                  await response.json()
                ) as OnetCareer;
              }
            )
          );

          if (controller.signal.aborted) return;

          const successful = batch
            .filter(
              (
                result
              ): result is PromiseFulfilledResult<OnetCareer> =>
                result.status === 'fulfilled'
            )
            .map((result) => result.value)
            .filter(
              (career) =>
                Boolean(career.id && career.title)
            );

          loaded.push(...successful);
          setOnetCareers([...loaded]);
        }

        if (
          loaded.length === 0 &&
          !controller.signal.aborted
        ) {
          setError(
            'Occupation details could not be loaded. Please try again.'
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingDetails(false);
        }
      }
    }

    void loadDetails();

    return () => controller.abort();
  }, [candidateKey]);

  // Calculate saved-profile and What-If estimates
  // with the same O*NET matching function.
  const rankedCareers = useMemo<ScenarioCareer[]>(() => {
    return onetCareers
      .map((career) => {
        const baseline = calculateOnetMatch(
          career,
          userProfile
        );

       
const scenario = calculateOnetMatch(
  career,
  userProfile,
  whatIfToggles,
  whatIfPreferences
);


        return {
          career,
          baseline: baseline.score,
          score: scenario.score,
          delta: scenario.score - baseline.score,
          reasons: scenario.reasons,
          considerations: scenario.considerations,
          confidence: scenario.confidence,
        };
      })
      .sort((a, b) => b.score - a.score);
 
}, [
  onetCareers,
  userProfile,
  whatIfToggles,
  whatIfPreferences,
]);


  const top = rankedCareers[0];

  const improved = rankedCareers.filter(
    (item) => item.delta > 0
  ).length;

  const decreased = rankedCareers.filter(
    (item) => item.delta < 0
  ).length;

  const openCareer = (id: string) => {
    setSelectedCareerId(id);
    setActiveView('detail');
  };

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              backgroundColor: 'var(--primary-subtle)',
              color: 'var(--primary)',
              padding: '5px 12px',
              borderRadius: 30,
              fontSize: '0.85rem',
              fontWeight: 700,
              marginBottom: 12,
            }}
          >
            <Sliders size={15} />
            Interactive O*NET Career Scenario
          </div>

          <h1
            style={{
              fontSize: '2.4rem',
              fontWeight: 800,
              color: 'var(--dark-slate)',
            }}
          >
            What-If Exploration Sandbox
          </h1>

          <p
            style={{
              color: 'var(--text-muted)',
              marginTop: 8,
              maxWidth: 800,
            }}
          >
            Experiment with career priorities and explore
            how your O*NET career estimates respond.
            Your saved profile stays unchanged.
          </p>
        </div>

        {!authUser || !hasProfile ? (
          <div
            className="card"
            style={{
              padding: 24,
              marginBottom: 24,
            }}
          >
            <strong>Start with your career profile</strong>

            <p style={{ margin: '10px 0' }}>
              Sign in and complete onboarding to get
              personalized career estimates.
            </p>

            <button
              className="btn-primary btn-sm"
              onClick={() =>
                setActiveView(
                  authUser ? 'onboarding' : 'auth'
                )
              }
            >
              {authUser
                ? 'Complete Onboarding'
                : 'Sign In'}
            </button>
          </div>
        ) : null}

        <div
          className="card"
          style={{
            padding: 24,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
              marginBottom: 16,
            }}
          >
            <strong>
              Try different career priorities
            </strong>

            <button
              className="btn-secondary btn-sm"
              onClick={resetWhatIf}
            >
              <RefreshCw size={14} />
              Reset scenario
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 10,
            }}
          >
            {priorities.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => toggleWhatIf(key)}
                className={`toggle-chip ${
                  whatIfToggles[key] ? 'active' : ''
                }`}
                aria-pressed={whatIfToggles[key]}
              >
                <span>
                  {whatIfToggles[key] ? '✓' : '+'}
                </span>{' '}
                {label}
              </button>
            ))}
          </div>

          <p
            style={{
              fontSize: '0.84rem',
              color: 'var(--text-muted)',
              marginTop: 14,
            }}
          >
            Scenario priorities are tested against
            available occupation evidence. Some
            priorities, such as salary and work-life
            balance, need additional O*NET data
            before they can be reliably scored.
          </p>
        </div>

        <div
          className="card"
          style={{
            padding: 24,
            marginBottom: 28,
          }}
        >
          <h2
            style={{
              fontSize: '1.15rem',
              fontWeight: 800,
              marginBottom: 8,
            }}
          >
            Experiment with work preferences
          </h2>

          <p
            style={{
              color: 'var(--text-muted)',
              marginBottom: 20,
            }}
          >
            Move the sliders to explore alternative
preferences. These changes are temporary
and can influence your O*NET career estimates
when relevant evidence is available.
Work location is estimated only when duties provide clear on-site evidence; remote availability is not verified.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
              gap: 24,
            }}
          >
            {preferences.map(
              ({ key, label, left, right }) => (
                <div key={key}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent:
                        'space-between',
                      marginBottom: 8,
                      gap: 8,
                    }}
                  >
                    <label
                      htmlFor={`what-if-${key}`}
                      style={{ fontWeight: 700 }}
                    >
                      {label}
                    </label>

                    <span
                      style={{
                        color: 'var(--primary)',
                        fontWeight: 700,
                      }}
                    >
                      {toFivePointScale(
                        whatIfPreferences[key]
                      )}/5
                    </span>
                  </div>

                  <input
                    id={`what-if-${key}`}
                    type="range"
                    min={1}
                    max={5}
                    step={1}
                    value={toFivePointScale(
                      whatIfPreferences[key]
                    )}
                    onChange={(event) =>
                      updateWhatIfPreference(
                        key,
                        toHundredPointScale(
                          Number(event.target.value)
                        )
                      )
                    }
                    style={{
                      width: '100%',
                      accentColor: 'var(--primary)',
                    }}
                  />

                  <div
                    style={{
                      display: 'flex',
                      justifyContent:
                        'space-between',
                      gap: 12,
                      color: 'var(--text-muted)',
                      fontSize: '0.78rem',
                    }}
                  >
                    <span>{left}</span>
                    <span>{right}</span>
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        <div
          className="card"
          style={{
            padding: 24,
            marginBottom: 30,
            backgroundColor: '#F7FAF9',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 10,
              color: 'var(--primary)',
            }}
          >
            <Sparkles size={20} />
            <strong>Your Scenario Insight</strong>
          </div>

          <p style={{ lineHeight: 1.7 }}>
            {loadingCatalog || loadingDetails
              ? 'Loading O*NET occupations and calculating your career estimates...'
              : !hasProfile
                ? 'Complete your profile to explore personalized career scenarios.'
                : isBaseline
                  ? `Baseline scenario: ${
                      top?.career.title ?? 'No occupation'
                    } currently ranks highest among the evaluated occupations.`
                  : `${activePriorities.length} priorities selected and ${changedPreferences.length} work preferences adjusted. Among the evaluated occupations, ${improved} estimates increased and ${decreased} decreased. ${
                      top?.career.title ?? 'No occupation'
                    } currently ranks highest.`}
          </p>

          <p
            style={{
              fontSize: '0.84rem',
              color: 'var(--text-muted)',
              marginTop: 10,
            }}
          >
            Estimates are experimental and use available O*NET
            occupation evidence. Work location only affects scores
            when explicit on-site duties are identified; remote
            availability is not verified.
          </p>
        </div>

        {error && (
          <div
            className="card"
            style={{
              padding: 24,
              marginBottom: 24,
            }}
          >
            <p>{error}</p>

            <button
              className="btn-primary btn-sm"
              onClick={() =>
                setReloadKey((value) => value + 1)
              }
            >
              Retry
            </button>
          </div>
        )}

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
            marginBottom: 20,
          }}
        >
          <h2
            style={{
              fontSize: '1.4rem',
              fontWeight: 800,
            }}
          >
            O*NET Career Landscape (
            {rankedCareers.length} roles)
          </h2>

          <span
            style={{
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
            }}
          >
            {loadingCatalog || loadingDetails
              ? 'Loading career details...'
              : `Selected from ${catalog.length} O*NET occupations`}
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
            gap: 24,
          }}
        >
          {rankedCareers.map((item, index) => {
            const { career } = item;
            const saved = isSaved(career.id);
            const comparing = isComparing(career.id);

            return (
              <div
                key={career.id}
                className="career-card"
                style={{
                  borderTop:
                    index === 0
                      ? '4px solid var(--primary)'
                      : undefined,
                }}
              >
                <div>
                  <div className="career-card-header">
                    <div>
                      <span className="career-category">
                        O*NET Occupation
                      </span>

                      {index === 0 && (
                        <span
                          style={{
                            display: 'block',
                            color: 'var(--primary)',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            marginTop: 5,
                          }}
                        >
                          TOP ESTIMATED FIT
                        </span>
                      )}
                    </div>

                    <span
                      className={`match-badge ${
                        item.score >= 80
                          ? 'match-high'
                          : 'match-med'
                      }`}
                    >
                      {item.score}% Estimate
                    </span>
                  </div>

                  <h3 className="career-title">
                    {career.title}
                  </h3>

                  <p className="career-desc">
                    {career.description}
                  </p>

                  <div
                    style={{
                      backgroundColor: '#F0F9FF',
                      borderLeft:
                        '3px solid #0284C7',
                      padding: '10px 12px',
                      borderRadius: 8,
                      marginBottom: 12,
                      fontSize: '0.85rem',
                    }}
                  >
                    <strong>Scenario impact: </strong>

                    {item.delta > 0 ? (
                      <span>
                        <TrendingUp
                          size={14}
                          style={{
                            display: 'inline',
                          }}
                        />{' '}
                        Increased by {item.delta} points.
                      </span>
                    ) : item.delta < 0 ? (
                      <span>
                        <TrendingDown
                          size={14}
                          style={{
                            display: 'inline',
                          }}
                        />{' '}
                        Decreased by{' '}
                        {Math.abs(item.delta)} points.
                      </span>
                    ) : (
                      <span>
                        No calculated score change.
                      </span>
                    )}

                    <div style={{ marginTop: 6 }}>
                      Baseline: {item.baseline}% ·
                      Scenario: {item.score}%
                    </div>
                  </div>

                  <div className="fit-box">
                    <strong>Why it may fit: </strong>
                    {item.reasons[0] ??
                      'Review the occupation details to learn more.'}
                  </div>

                  {item.considerations.length > 0 && (
                    <div className="watchout-box">
                      <strong>Consider: </strong>
                      {item.considerations[0]}
                    </div>
                  )}

                  <div className="tags-row">
                    <span className="badge-tag">
                      Evidence: {item.confidence}
                    </span>

                    <span className="badge-tag">
                      O*NET {career.id}
                    </span>
                  </div>
                </div>

               
<div
  className="card-actions"
  style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '10px',
    width: '100%',
    marginTop: 'auto',
    paddingTop: '16px',
  }}
>
  <button
    className={saved ? 'btn-primary btn-sm' : 'btn-secondary btn-sm'}
    onClick={() => toggleSaveCareer(career.id)}
    aria-pressed={saved}
    style={{
      width: '100%',
      minWidth: 0,
      minHeight: '42px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
      ...(saved
        ? {
            backgroundColor: '#0c6957',
            borderColor: '#0c6957',
            color: '#ffffff',
            fontWeight: 700,
          }
        : {}),
    }}
  >
    {saved ? (
      <BookmarkCheck size={14} />
    ) : (
      <Bookmark size={14} />
    )}
    {saved ? 'Saved ✓' : 'Save'}
  </button>

  <button
    className={comparing ? 'btn-primary btn-sm' : 'btn-secondary btn-sm'}
    onClick={() => toggleCompareCareer(career.id)}
    aria-pressed={comparing}
    style={{
      width: '100%',
      minWidth: 0,
      minHeight: '42px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
      ...(comparing
        ? {
            backgroundColor: '#0c6957',
            borderColor: '#0c6957',
            color: '#ffffff',
            fontWeight: 700,
          }
        : {}),
    }}
  >
    <BarChart3 size={14} />
    {comparing ? 'Comparing' : 'Compare'}
  </button>

  <button
    className="btn-secondary btn-sm"
    onClick={() =>
      openMayaWithPrompt(
        `Help me explore the O*NET occupation ${career.title}. My baseline match estimate is ${item.baseline}%, and my What-If scenario estimate is ${item.score}%. Explain possible strengths, gaps, and questions to investigate. Do not treat these estimates as validated career predictions.`
      )
    }
    style={{
      width: '100%',
      minWidth: 0,
      minHeight: '42px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
    }}
  >
    <Sparkles size={14} />
    Ask Maya
  </button>

  <button
    className="btn-primary btn-sm"
    onClick={() => openCareer(career.id)}
    style={{
      width: '100%',
      minWidth: 0,
      minHeight: '42px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
    }}
  >
    View Profile
    <ChevronRight size={14} />
  </button>
</div>

              </div>
            );
          })}
        </div>

        {!loadingCatalog &&
          !loadingDetails &&
          !error &&
          rankedCareers.length === 0 && (
            <div
              className="card"
              style={{ padding: 24 }}
            >
              No O*NET occupations were available
              for this scenario.
            </div>
          )}
      </div>
    </div>
  );
}
