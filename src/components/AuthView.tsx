
'use client';

import { useState } from 'react';
import { getSupabaseClient } from '../lib/supabase';
import { useCareer } from '../context/CareerContext';

export default function AuthView() {
  const { activeView, setActiveView } = useCareer();
  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const supabase = getSupabaseClient();

      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
          },
        });

        if (error) throw error;

        setMessage(
          data.session
            ? 'Your account has been created! You can continue exploring.'
            : 'Please check your email to confirm your account.'
        );
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

       if (error) throw error;

setActiveView(
  activeView === 'recommendations' ? 'recommendations' : 'profile'
);
      }
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setLoading(true);
    setMessage('');

    try {
      const supabase = getSupabaseClient();

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) throw error;
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : 'Google sign-in failed.'
      );
      setLoading(false);
    }
  }

  return (
    <section style={{ maxWidth: 460, margin: '60px auto', padding: 24 }}>
      <h1>{mode === 'signup' ? 'Create your MyriMaven account' : 'Welcome back'}</h1>
      <p>
        {mode === 'signup'
          ? 'Create an account to begin exploring careers.'
          : 'Log in to your account to continue.'}
      </p>

      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email address</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ display: 'block', width: '100%', padding: 10, margin: '8px 0 16px' }}
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          minLength={6}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ display: 'block', width: '100%', padding: 10, margin: '8px 0 16px' }}
        />

        <button type="submit" disabled={loading}>
          {loading
            ? 'Please wait...'
            : mode === 'signup'
              ? 'Create Account'
              : 'Log In'}
        </button>
      </form>

      <p style={{ textAlign: 'center', margin: '20px 0' }}>or</p>

      <button type="button" disabled={loading} onClick={handleGoogleSignIn}>
        Continue with Google
      </button>

      <p role="status" aria-live="polite">{message}</p>

      <p>
        {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
        <button
          type="button"
          onClick={() => {
            setMode(mode === 'signup' ? 'login' : 'signup');
            setMessage('');
          }}
        >
          {mode === 'signup' ? 'Log in' : 'Sign up'}
        </button>
      </p>
    </section>
  );
}
