
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ExternalLink, MapPin, Search } from 'lucide-react';
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

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\b(and|the|of|other)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function wageText(amount: number | undefined, annual: boolean) {
  if (amount === undefined) return 'Not available';

  return (
    new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      maximumFractionDigits: annual ? 0 : 2,
    }).format(amount) + (annual ? '/year' : '/hour')
  );
}

export default function CanadianCareerOutlook({
  title,
}: {
  title: string;
}) {
  const exactMatch = useMemo(
    () =>
      records.find(
        (r) => normalize(r.title) === normalize(title)
      ),
    [title]
  );

  const [query, setQuery] = useState(title);
  const [selectedCode, setSelectedCode] = useState<string | null>(
    exactMatch?.code ?? null
  );
  const [location, setLocation] = useState('Alberta');

  useEffect(() => {
    setQuery(title);
    setSelectedCode(exactMatch?.code ?? null);
  }, [title, exactMatch]);

  const selected = records.find((r) => r.code === selectedCode);

  const suggestions = useMemo(() => {
    const q = normalize(query);
    if (!q) return [];

    const terms = q
      .split(' ')
      .filter((word) => word.length > 2);

    return records
      .map((r) => {
        const t = normalize(r.title);
        let score = t === q ? 100 : t.includes(q) ? 50 : 0;

        for (const term of terms) {
          if (
            t.split(' ').some(
              (word) => word === term || word.startsWith(term)
            )
          ) {
            score += 4;
          }
        }

        return { record: r, score };
      })
      .filter((r) => r.score > 0)
      .sort(
        (a, b) =>
          b.score - a.score ||
          a.record.title.localeCompare(b.record.title)
      )
      .slice(0, 8);
  }, [query]);

  const wage = selected?.wages[location];

  const cardStyle: React.CSSProperties = {
    padding: 16,
    background: '#F7FAF9',
    borderRadius: 12,
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
          fontSize: '1.15rem',
          fontWeight: 800,
          marginBottom: 10,
          color: 'var(--dark-slate)',
        }}
      >
        <MapPin
          size={19}
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
          lineHeight: 1.6,
          marginBottom: 14,
        }}
      >
        Explore official Canadian Job Bank wages for a
        matching Canadian occupation. O*NET and Canadian
        NOC titles differ, so confirm the occupation before
        using these figures.
      </p>

      <label
        htmlFor="canadian-noc-search"
        style={{
          display: 'block',
          fontWeight: 700,
          marginBottom: 6,
        }}
      >
        Find a Canadian occupation
      </label>

      <div
        style={{
          position: 'relative',
          marginBottom: 10,
        }}
      >
        <Search
          size={16}
          style={{
            position: 'absolute',
            left: 12,
            top: 13,
            color: 'var(--text-muted)',
          }}
        />

        <input
          id="canadian-noc-search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedCode(null);
          }}
          placeholder="Search Canadian occupations"
          style={{
            width: '100%',
            minHeight: 42,
            padding: '10px 12px 10px 36px',
            border: '1px solid #CBD5D1',
            borderRadius: 8,
            background: '#fff',
            color: 'var(--dark-slate)',
          }}
        />
      </div>

      {!selected && (
        <div style={{ marginBottom: 16 }}>
          {suggestions.length ? (
            <div style={{ display: 'grid', gap: 6 }}>
              {suggestions.map(({ record }) => (
                <button
                  key={record.code}
                  type="button"
                  onClick={() => {
                    setSelectedCode(record.code);
                    setQuery(record.title);
                  }}
                  style={{
                    textAlign: 'left',
                    border: '1px solid #DFE7E3',
                    borderRadius: 8,
                    background: '#F7FAF9',
                    padding: '10px 12px',
                    cursor: 'pointer',
                    color: 'var(--dark-slate)',
                  }}
                >
                  {record.title}{' '}
                  <span
                    style={{
                      color: 'var(--text-muted)',
                      fontSize: '.8rem',
                    }}
                  >
                    (NOC {record.code})
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>
              No matching titles found. Try a broader
              occupation name.
            </p>
          )}
        </div>
      )}

      {selected && (
        <>
          <p style={{ marginBottom: 12, lineHeight: 1.5 }}>
            <strong>Canadian occupation:</strong>{' '}
            {selected.title} (NOC {selected.code})
          </p>

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
            onChange={(e) => setLocation(e.target.value)}
            style={{
              padding: '8px 10px',
              border: '1px solid #CBD5D1',
              borderRadius: 8,
              marginBottom: 16,
              background: '#fff',
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
                'repeat(auto-fit, minmax(min(100%, 160px), 1fr))',
              gap: 12,
            }}
          >
            {(['low', 'median', 'high'] as const).map(
              (key) => (
                <div key={key} style={cardStyle}>
                  <div
                    style={{
                      color: 'var(--text-muted)',
                      fontSize: '.85rem',
                      marginBottom: 7,
                    }}
                  >
                    {key === 'low'
                      ? 'Low wage'
                      : key === 'median'
                      ? 'Median wage'
                      : 'High wage'}
                  </div>

                  <strong style={{ fontSize: '1.12rem' }}>
                    {wage
                      ? wageText(wage[key], wage.annual)
                      : 'Not available'}
                  </strong>
                </div>
              )
            )}
          </div>

          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: '.8rem',
              lineHeight: 1.6,
              marginTop: 12,
            }}
          >
            {location} · CAD ·{' '}
            {wage?.annual ? 'Annual salary' : 'Hourly wage'} ·{' '}
            {wage?.period
              ? `Reference period: ${wage.period}. `
              : ''}
            Published in the Job Bank 2025 wage dataset.
            Missing values are not estimated. These wages
            describe the selected Canadian NOC occupation,
            not necessarily an exact equivalent of the
            U.S. O*NET career.
          </p>

          <a
            href="https://www.jobbank.gc.ca/trend-analysis/search-wages"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              color: 'var(--primary)',
              fontWeight: 700,
              marginTop: 8,
            }}
          >
            Official Job Bank wage source
            <ExternalLink size={14} />
          </a>
        </>
      )}

      <p
        style={{
          color: 'var(--text-muted)',
          fontSize: '.8rem',
          marginTop: 14,
        }}
      >
        Employment outlook ratings are not included in
        this wage dataset and are not shown as verified
        figures here.
      </p>
    </section>
  );
}
