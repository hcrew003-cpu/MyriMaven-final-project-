
'use client';

import React, { useEffect, useState } from 'react';
import { TrendingUp, ExternalLink, MapPin } from 'lucide-react';

type OutlookResponse = {
  outlook?: { category?: string; description?: string } | null;
  brightOutlook?: { code?: string; title?: string }[];
  salary?: {
    soc_code?: string;
    annual_median?: number;
    annual_median_over?: number;
    hourly_median?: number;
    hourly_median_over?: number;
  } | null;
  error?: string;
};

const money = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);

const jobBankLinks = {
  occupations:
    'https://www.jobbank.gc.ca/trend-analysis/search-occupations',
  wages:
    'https://www.jobbank.gc.ca/trend-analysis/search-wages',
  outlook:
    'https://www.jobbank.gc.ca/trend-analysis/search-job-outlooks',
};

export default function CareerMarketOutlook({
  code,
}: {
  code: string;
}) {
  const [data, setData] = useState<OutlookResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    setData(null);
    setError('');
    setLoading(true);

    fetch(
      `/api/onet/job-outlook?code=${encodeURIComponent(code)}`,
      { signal: controller.signal }
    )
      .then(async (response) => {
        const payload = (await response.json()) as OutlookResponse;

        if (!response.ok) {
          throw new Error(
            payload.error ?? 'Outlook data unavailable.'
          );
        }

        return payload;
      })
      .then((payload) => {
        if (!controller.signal.aborted) setData(payload);
      })
      .catch((err: unknown) => {
        if (!controller.signal.aborted) {
          setError(
            err instanceof Error
              ? err.message
              : 'Outlook data unavailable.'
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [code]);

  const salary = data?.salary;
  const wage =
    salary?.annual_median_over ?? salary?.annual_median;
  const hourly =
    salary?.hourly_median_over ?? salary?.hourly_median;

  const isOver = salary?.annual_median_over !== undefined;
  const isHourlyOver = salary?.hourly_median_over !== undefined;

  const infoCardStyle: React.CSSProperties = {
    padding: 18,
    background: '#F7FAF9',
    borderRadius: 12,
  };

  const externalLinkStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    color: 'var(--primary)',
    fontWeight: 700,
    textDecoration: 'none',
  };

  return (
    <section
      className="card"
      style={{ padding: 24, marginBottom: 28 }}
    >
      <h2
        style={{
          fontSize: '1.25rem',
          fontWeight: 800,
          color: 'var(--dark-slate)',
          marginBottom: 12,
        }}
      >
        <TrendingUp
          size={20}
          style={{
            display: 'inline',
            marginRight: 8,
            color: 'var(--primary)',
          }}
        />
        Career Market Outlook
      </h2>

      <p
        style={{
          color: 'var(--text-muted)',
          marginBottom: 18,
          lineHeight: 1.6,
        }}
      >
        United States labour market data. Employment outlook
        uses 2025–2035 projections; wages are 2025 U.S.
        estimates, not Canadian salaries.
      </p>

      {loading ? (
        <p>Loading labour market information...</p>
      ) : error ? (
        <p style={{ color: 'var(--text-muted)' }}>
          {error} You can still review this occupation on O*NET.
        </p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
            gap: 16,
          }}
        >
          <div
            style={{
              ...infoCardStyle,
              background: 'var(--primary-subtle)',
            }}
          >
            <div
              style={{
                color: 'var(--text-muted)',
                fontSize: '.85rem',
                marginBottom: 8,
              }}
            >
              Employment outlook
            </div>

            <strong style={{ fontSize: '1.2rem' }}>
              {data?.outlook?.category ?? 'Not available'}
            </strong>

            <p
              style={{
                fontSize: '.86rem',
                marginTop: 8,
                lineHeight: 1.5,
              }}
            >
              {data?.outlook?.description ??
                'No outlook classification is available for this occupation.'}
            </p>
          </div>

          <div style={infoCardStyle}>
            <div
              style={{
                color: 'var(--text-muted)',
                fontSize: '.85rem',
                marginBottom: 8,
              }}
            >
              Median annual wage (USD)
            </div>

            <strong style={{ fontSize: '1.2rem' }}>
              {wage !== undefined
                ? `${isOver ? 'Over ' : ''}${money(wage)}`
                : 'Not available'}
            </strong>

            {wage === undefined && hourly !== undefined && (
              <p style={{ marginTop: 8 }}>
                Median hourly wage:{' '}
                {isHourlyOver ? 'over ' : ''}
                {money(hourly)}/hour
              </p>
            )}

            {salary?.soc_code && (
              <p
                style={{
                  color: 'var(--text-muted)',
                  fontSize: '.8rem',
                  marginTop: 8,
                }}
              >
                BLS wage category: {salary.soc_code}
              </p>
            )}
          </div>

          <div style={infoCardStyle}>
            <div
              style={{
                color: 'var(--text-muted)',
                fontSize: '.85rem',
                marginBottom: 8,
              }}
            >
              Outlook indicators
            </div>

            {data?.brightOutlook?.length ? (
              <ul
                style={{
                  paddingLeft: 18,
                  lineHeight: 1.7,
                }}
              >
                {data.brightOutlook.map((item, index) => (
                  <li
                    key={`${item.code ?? 'indicator'}-${index}`}
                  >
                    {item.title ??
                      'Bright outlook indicator'}
                  </li>
                ))}
              </ul>
            ) : (
              <p>
                No additional Bright Outlook indicators reported.
              </p>
            )}
          </div>
        </div>
      )}

      <p
        style={{
          fontSize: '.8rem',
          color: 'var(--text-muted)',
          marginTop: 18,
          lineHeight: 1.6,
        }}
      >
        Source: O*NET Web Services (My Next Move),
        using U.S. Bureau of Labor Statistics projections
        and wage estimates. Outlook categories are not
        exact growth percentages, and wages may describe
        a broader SOC occupation group.
      </p>

      <a
        href={`https://www.onetonline.org/link/summary/${encodeURIComponent(code)}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          ...externalLinkStyle,
          marginTop: 12,
        }}
      >
        View O*NET source
        <ExternalLink size={14} />
      </a>

      {/* CANADIAN CAREER OUTLOOK */}

      <div
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
            color: 'var(--dark-slate)',
            marginBottom: 10,
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
          Canadian Career Outlook
        </h3>

        <p
          style={{
            color: 'var(--text-muted)',
            lineHeight: 1.6,
            marginBottom: 18,
          }}
        >
          Exploring careers in Canada? Use official Government
          of Canada Job Bank information to research wages,
          employment prospects, and career requirements.
          Start with Alberta or select another province.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
            gap: 16,
          }}
        >
          <div style={infoCardStyle}>
            <div
              style={{
                fontSize: '.85rem',
                color: 'var(--text-muted)',
                marginBottom: 8,
              }}
            >
              Canadian wages
            </div>

            <strong
              style={{
                fontSize: '1.05rem',
                display: 'block',
                marginBottom: 8,
              }}
            >
              Compare wages in CAD
            </strong>

            <p
              style={{
                fontSize: '.86rem',
                lineHeight: 1.5,
                marginBottom: 14,
              }}
            >
              Find typical hourly wages for occupations
              in Alberta and across Canada.
            </p>

            <a
              href={jobBankLinks.wages}
              target="_blank"
              rel="noopener noreferrer"
              style={externalLinkStyle}
            >
              Explore wages
              <ExternalLink size={14} />
            </a>
          </div>

          <div style={infoCardStyle}>
            <div
              style={{
                fontSize: '.85rem',
                color: 'var(--text-muted)',
                marginBottom: 8,
              }}
            >
              Canadian job prospects
            </div>

            <strong
              style={{
                fontSize: '1.05rem',
                display: 'block',
                marginBottom: 8,
              }}
            >
              Provincial employment outlook
            </strong>

            <p
              style={{
                fontSize: '.86rem',
                lineHeight: 1.5,
                marginBottom: 14,
              }}
            >
              Research employment prospects for
              occupations in Alberta or other provinces.
            </p>

            <a
              href={jobBankLinks.outlook}
              target="_blank"
              rel="noopener noreferrer"
              style={externalLinkStyle}
            >
              Explore job prospects
              <ExternalLink size={14} />
            </a>
          </div>

          <div style={infoCardStyle}>
            <div
              style={{
                fontSize: '.85rem',
                color: 'var(--text-muted)',
                marginBottom: 8,
              }}
            >
              Canadian career profiles
            </div>

            <strong
              style={{
                fontSize: '1.05rem',
                display: 'block',
                marginBottom: 8,
              }}
            >
              Career requirements
            </strong>

            <p
              style={{
                fontSize: '.86rem',
                lineHeight: 1.5,
                marginBottom: 14,
              }}
            >
              Compare Canadian job titles, skills,
              education requirements, and related careers.
            </p>

            <a
              href={jobBankLinks.occupations}
              target="_blank"
              rel="noopener noreferrer"
              style={externalLinkStyle}
            >
              Explore occupations
              <ExternalLink size={14} />
            </a>
          </div>
        </div>

        <p
          style={{
            fontSize: '.8rem',
            color: 'var(--text-muted)',
            lineHeight: 1.6,
            marginTop: 16,
          }}
        >
          Source: Government of Canada Job Bank. Search
          for the closest Canadian occupation title and
          select your preferred location. O*NET and
          Canadian NOC classifications may differ, so
          occupation matches should be verified.
          Canadian figures are not automatically retrieved
          in this version.
        </p>
      </div>
    </section>
  );
}
