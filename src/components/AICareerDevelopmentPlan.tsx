
'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import type { OnetCareer } from '../context/CareerContext';
import type { UserProfile } from '../types/career';

type Step = {
  title: string;
  description: string;
};

export default function AICareerDevelopmentPlan({
  career,
  profile,
}: {
  career: OnetCareer;
  profile: UserProfile;
}) {
  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setSteps([]);
    setError('');
  }, [career.id]);

  async function generate() {
    if (loading) return;

    setLoading(true);
    setError('');

    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

      const key =
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!url || !key) {
        throw new Error('Sign-in is not configured.');
      }

      const supabase = createClient(url, key);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error(
          'Please sign in to generate your plan.'
        );
      }

      const response = await fetch('/api/career-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          profile,
          career: {
            code: career.id,
            title: career.title,
            description: career.description,
            tasks: (career.tasks?.task ?? [])
              .slice(0, 8)
              .map((x) => x.title),
            skills: (career.skills?.element ?? [])
              .slice(0, 10)
              .map((x) => x.name),
            knowledge: (career.knowledge?.element ?? [])
              .slice(0, 8)
              .map((x) => x.name),
          },
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(
          payload.error ?? 'Could not generate a plan.'
        );
      }

      if (
        !Array.isArray(payload.steps) ||
        payload.steps.length !== 3
      ) {
        throw new Error(
          'The plan was incomplete. Please try again.'
        );
      }

      setSteps(payload.steps);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not generate a plan.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      className="card"
      style={{
        padding: 24,
        marginBottom: 28,
      }}
    >
      <h2
        style={{
          fontSize: '1.25rem',
          fontWeight: 800,
          marginBottom: 12,
          color: 'var(--dark-slate)',
        }}
      >
        <Sparkles
          size={20}
          style={{
            display: 'inline',
            marginRight: 8,
            color: 'var(--primary)',
          }}
        />
        AI Career Development Plan
      </h2>

      <p
        style={{
          color: 'var(--text-muted)',
          lineHeight: 1.6,
          marginBottom: 16,
        }}
      >
        Generate three personalized next steps using
        your profile and this occupation&apos;s O*NET
        information. AI suggestions are exploratory,
        not guaranteed career advice.
      </p>

      <button
        className="btn-primary"
        onClick={generate}
        disabled={loading}
      >
        <Sparkles size={16} />
        {loading
          ? 'Generating your plan...'
          : steps.length
          ? 'Regenerate My Plan'
          : 'Generate My Career Development Plan'}
      </button>

      {error && (
        <p
          role="alert"
          style={{
            color: '#a33',
            marginTop: 14,
          }}
        >
          {error} Your career profile is still available.
        </p>
      )}

      {steps.length > 0 && (
        <ol
          style={{
            paddingLeft: 24,
            marginTop: 20,
            lineHeight: 1.6,
          }}
        >
          {steps.map((step, index) => (
            <li
              key={index}
              style={{
                marginBottom: 16,
              }}
            >
              <strong>{step.title}</strong>

              <p
                style={{
                  color: 'var(--text-muted)',
                  marginTop: 4,
                }}
              >
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
