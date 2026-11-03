
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  ExternalLink,
  MapPin,
  Search,
  CheckCircle2,
} from 'lucide-react';
import occupations from '../data/canadian-wages-2025.json';

type Wage = {
  low?: number;
  median?: number;
  high?: number;
  annual: boolean;
  period?: string;
};

type Occupation = {
  code: string;
  title: string;
  wages: Record<string, Wage>;
};

const records = occupations as Occupation[];

// Curated suggestions for occupations with different
// American and Canadian titles.
// These are candidate matches, not verified equivalencies.
const suggestedNocCodes: Record<string, string> = {
  'Business Teachers, Postsecondary': '41200',
  'Computer Science Teachers, Postsecondary': '41200',
  'Economics Teachers, Postsecondary': '41200',
  'Accounting Teachers, Postsecondary': '41200',
  'Software Developers': '21232',
  'Software Quality Assurance Analysts and Testers': '21222',
  'Registered Nurses': '31301',
  'Accountants and Auditors': '11100',
  'Financial Analysts': '11101',
  'Human Resources Specialists': '11200',
  'Marketing Managers': '10022',
  'Market Research Analysts and Marketing Specialists': '41402',
};

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\b(and|the|of|other)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function wageText(
  amount: number | undefined,
  annual: boolean
) {
  if (amount === undefined) return 'Not available';

  return (
    new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      maximumFractionDigits: annual ? 0 : 2,
    }).format(amount) +
    (annual ? '/year' : '/hour')
  );
}

function getSuggestions(title: string) {
  const exact = records.find(
    (record) =>
      normalize(record.title) === normalize(title)
  );

  const mappedCode = Object.entries(suggestedNocCodes).find(
    ([name]) => normalize(name) === normalize(title)
  )?.[1];

  const mapped = mappedCode
    ? records.find((record) => record.code === mappedCode)
    : undefined;

  if (mapped) return [mapped];
  if (exact) return [exact];

  const query = normalize(title);
  const terms = query
    .split(' ')
    .filter((term) => term.length > 3);

  return records
    .map((record) => {
      const candidate = normalize(record.title);
      const candidateWords = candidate.split(' ');

      let score = candidate.includes(query) ? 20 : 0;

      for (const term of terms) {
        if (
          candidateWords.some(
            (word) =>
              word === term ||
              word.startsWith(term) ||
              term.startsWith(word)
          )
        ) {
          score += 5;
        }
      }

      return { record, score };
    })
    .filter((item) => item.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.record.title.localeCompare(b.record.title)
    )
    .slice(0, 3)
    .map((item) => item.record);
}

export default function CanadianCareerOutlook({
  title,
}: {
  title: string;
}) {
  const suggestions = useMemo(
    () => getSuggestions(title),
    [title]
  );

  const [query, setQuery] = useState('');
  const [selectedCode, setSelectedCode] =
    useState<string | null>(null);
  const [location, setLocation] = useState('Alberta');
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    setQuery('');
    setSelectedCode(null);
    setSearchOpen(false);
  }, [title]);

  const selected = records.find(
    (record) => record.code === selectedCode
  );

  const searchResults = useMemo(() => {
    const q = normalize(query);
    if (!q) return [];

    const terms = q.split(' ').filter(Boolean);

    return records
      .map((record) => {
        const name = normalize(record.title);
        let score =
          name === q ? 100 : name.includes(q) ? 50 : 0;

        for (const term of terms) {
          if (
            name.split(' ').some(
              (word) =>
                word === term ||
                word.startsWith(term)
            )
          ) {
            score += 4;
          }
        }

        return { record, score };
      })
      .filter((item) => item.score > 0)
      .sort(
        (a, b) =>
          b.score - a.score ||
          a.record.title.localeCompare(b.record.title)
      )
      .slice(0, 8)
      .map((item) => item.record);
  }, [query]);

  const wage = selected?.wages[location];

  const chooseOccupation = (occupation: Occupation) => {
    setSelectedCode(occupation.code);
    setQuery(occupation.title);
    setSearchOpen(false);
  };

  const cardStyle: React.CSSProperties = {
    padding: 18,
    background: '#F7FAF9',
    borderRadius: 12,
  };

  const buttonStyle: React.CSSProperties = {
    padding: '11px 14px',
    borderRadius: 9,
    cursor: 'pointer',
    fontWeight: 700,
    border: '1px solid #CBD5D1',
  };

  return (
    <section
      style={{
        marginTop: 28,
        paddingTop: 24,
        borderTop: '1px solid #E2E8E6',
      }}
    >
      <h3
        style={{
          fontSize: '1.2rem',
          fontWeight: 800,
          marginBottom: 12,
          color: 'var(--dark-slate)',
        }}
      >
        <MapPin
          size={20}
          style={{
            display: 'inline',
            marginRight: 8,
            color: 'var(--primary)',
          }}
        />
        Canadian Career Wages
      </h3>

      <p
        style={{
          color: 'var(--text-muted)',
          marginBottom: 18,
          lineHeight: 1.6,
        }}
      >
        Explore Canadian Job Bank wages for this career.
        MyriMaven suggests a Canadian occupation based on
        available information. Confirm the occupation
        before viewing its wages.
      </p>

      {!selected && !searchOpen && (
        <>
          <div
            style={{
              padding: 18,
              background: 'var(--primary-subtle)',
              borderRadius: 12,
              marginBottom: 16,
            }}
          >
            <div
              style={{
                color: 'var(--text-muted)',
                fontSize: '.85rem',
                marginBottom: 8,
              }}
            >
              O*NET career
            </div>

            <strong>{title}</strong>

            <h4
              style={{
                marginTop: 18,
                marginBottom: 10,
                fontSize: '1rem',
              }}
            >
              Suggested Canadian occupation
            </h4>

            {suggestions.length ? (
              <div
                style={{
                  display: 'grid',
                  gap: 10,
                }}
              >
                {suggestions.map((occupation) => (
                  <div
                    key={occupation.code}
                    style={{
                      padding: 14,
                      borderRadius: 10,
                      background: '#FFFFFF',
                      border: '1px solid #DFE7E3',
                    }}
                  >
                    <strong
                      style={{
                        display: 'block',
                        marginBottom: 5,
                      }}
                    >
                      {occupation.title}
                    </strong>

                    <p
                      style={{
                        fontSize: '.85rem',
                        color: 'var(--text-muted)',
                        marginBottom: 12,
                      }}
                    >
                      Canadian NOC {occupation.code}
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        chooseOccupation(occupation)
                      }
                      style={{
                        ...buttonStyle,
                        background: 'var(--primary)',
                        color: '#FFFFFF',
                        borderColor: 'var(--primary)',
                      }}
                    >
                      <CheckCircle2
                        size={15}
                        style={{
                          display: 'inline',
                          marginRight: 6,
                        }}
                      />
                      Use this occupation
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ lineHeight: 1.6 }}>
                No close Canadian occupation suggestion
                was found. Search the Canadian occupation
                list to find an appropriate match.
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            style={{
              ...buttonStyle,
              background: '#FFFFFF',
              color: 'var(--primary)',
            }}
          >
            <Search
              size={15}
              style={{
                display: 'inline',
                marginRight: 7,
              }}
            />
            Search for a different occupation
          </button>
        </>
      )}

      {searchOpen && (
        <div style={{ marginBottom: 18 }}>
          <label
            htmlFor="canadian-noc-search"
            style={{
              display: 'block',
              fontWeight: 700,
              marginBottom: 8,
            }}
          >
            Search Canadian occupations
          </label>

          <input
            id="canadian-noc-search"
            value={query}
            onChange={(event) =>
              setQuery(event.target.value)
            }
            placeholder="Enter a Canadian career title"
            style={{
              width: '100%',
              padding: 12,
              border: '1px solid #CBD5D1',
              borderRadius: 8,
              marginBottom: 10,
            }}
          />

          <div style={{ display: 'grid', gap: 7 }}>
            {searchResults.map((occupation) => (
              <button
                key={occupation.code}
                type="button"
                onClick={() =>
                  chooseOccupation(occupation)
                }
                style={{
                  ...buttonStyle,
                  background: '#F7FAF9',
                  color: 'var(--dark-slate)',
                  textAlign: 'left',
                  fontWeight: 500,
                }}
              >
                {occupation.title}{' '}
                <span
                  style={{
                    color: 'var(--text-muted)',
                    fontSize: '.8rem',
                  }}
                >
                  (NOC {occupation.code})
                </span>
              </button>
            ))}
          </div>

          {query.trim() && !searchResults.length && (
            <p style={{ color: 'var(--text-muted)' }}>
              No matching occupations found. Try a
              broader search term.
            </p>
          )}

          <button
            type="button"
            onClick={() => setSearchOpen(false)}
            style={{
              ...buttonStyle,
              marginTop: 12,
              background: '#FFFFFF',
              color: 'var(--primary)',
            }}
          >
            Back to suggestions
          </button>
        </div>
      )}

      {selected && !searchOpen && (
        <>
          <div
            style={{
              padding: 16,
              background: 'var(--primary-subtle)',
              borderRadius: 12,
              marginBottom: 18,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 8,
              }}
            >
              <CheckCircle2
                size={18}
                color="#0c6957"
              />
              <strong>
                Selected Canadian occupation
              </strong>
            </div>

            <p>
              {selected.title} (NOC {selected.code})
            </p>

            <button
              type="button"
              onClick={() => {
                setSelectedCode(null);
                setQuery('');
                setSearchOpen(true);
              }}
              style={{
                marginTop: 12,
                background: 'none',
                border: 'none',
                padding: 0,
                color: 'var(--primary)',
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              Change occupation
            </button>
          </div>

          <label
            htmlFor="canadian-wage-location"
            style={{
              fontWeight: 700,
              marginRight: 10,
            }}
          >
            Location
          </label>

          <select
            id="canadian-wage-location"
            value={location}
            onChange={(event) =>
              setLocation(event.target.value)
            }
            style={{
              padding: '9px 12px',
              border: '1px solid #CBD5D1',
              borderRadius: 8,
              marginBottom: 18,
              background: '#FFFFFF',
            }}
          >
            <option>Alberta</option>
            <option>Calgary</option>
            <option>Canada</option>
          </select>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(min(100%, 170px), 1fr))',
              gap: 14,
            }}
          >
            {(['low', 'median', 'high'] as const).map(
              (key) => (
                <div key={key} style={cardStyle}>
                  <div
                    style={{
                      fontSize: '.85rem',
                      color: 'var(--text-muted)',
                      marginBottom: 8,
                    }}
                  >
                    {key === 'low'
                      ? 'Low wage'
                      : key === 'median'
                      ? 'Median wage'
                      : 'High wage'}
                  </div>

                  <strong
                    style={{
                      fontSize: '1.2rem',
                    }}
                  >
                    {wage
                      ? wageText(
                          wage[key],
                          wage.annual
                        )
                      : 'Not available'}
                  </strong>
                </div>
              )
            )}
          </div>

          <p
            style={{
              fontSize: '.8rem',
              color: 'var(--text-muted)',
              lineHeight: 1.6,
              marginTop: 16,
            }}
          >
            {location} · CAD ·{' '}
            {wage?.annual
              ? 'Annual salary'
              : 'Hourly wage'}
            {wage?.period
              ? ` · Reference period: ${wage.period}`
              : ''}
            . Published in the Job Bank 2025 wage
            dataset. These figures describe the
            selected Canadian NOC occupation and may
            not be an exact equivalent of the O*NET
            career.
          </p>

          <a
            href="https://www.jobbank.gc.ca/trend-analysis/search-wages"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              marginTop: 10,
              color: 'var(--primary)',
              fontWeight: 700,
            }}
          >
            Official Job Bank wage source
            <ExternalLink size={14} />
          </a>
        </>
      )}

      <p
        style={{
          fontSize: '.8rem',
          color: 'var(--text-muted)',
          marginTop: 18,
          lineHeight: 1.6,
        }}
      >
        Canadian occupation suggestions are approximate.
        Confirm the occupation before relying on its
        wages. Provincial employment outlook ratings
        are not included in this dataset.
      </p>
    </section>
  );
}
