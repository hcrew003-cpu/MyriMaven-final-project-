'use client';

import { useState, type FormEvent, type CSSProperties } from 'react';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { getSupabaseClient } from '../lib/supabase';
import { useCareer } from '../context/CareerContext';

export default function AuthView() {
  const { setActiveView } = useCareer();
  const [mode, setMode] = useState<'signup' | 'login'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // These match the Supabase requirements shown in your screenshot.
  // If your Supabase password policy changes, update this list too.
  const requirements = [
    { label: 'At least 6 characters', met: password.length >= 6 },
    { label: 'One uppercase letter (A–Z)', met: /[A-Z]/.test(password) },
    { label: 'One lowercase letter (a–z)', met: /[a-z]/.test(password) },
    { label: 'One number (0–9)', met: /[0-9]/.test(password) },
  ];
  const passwordValid = requirements.every((item) => item.met);
  const passwordsMatch = confirmPassword.length > 0 && confirmPassword === password;
  const signupValid = passwordValid && passwordsMatch;

  function friendlyError(err: unknown) {
    const raw = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
    if (/password should contain|password.*character|password.*weak/i.test(raw)) {
      return 'Please use a password with at least 6 characters, including uppercase and lowercase letters and a number.';
    }
    if (/password.*short/i.test(raw)) return 'Your password is too short. Please use at least 6 characters.';
    if (/invalid login credentials/i.test(raw)) return 'Incorrect email or password. Please try again.';
    return raw;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage('');
    if (mode === 'signup' && !signupValid) {
      setMessage('Please meet the password requirements and make sure both passwords match.');
      return;
    }
    setLoading(true);
    try {
      const supabase = getSupabaseClient();
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        if (data.session) {
          setActiveView('dashboard');
        } else {
          setMessage('Account created! Please check your email to confirm your account, then log in.');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        setActiveView('dashboard');
      }
    } catch (err) {
      setMessage(friendlyError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setLoading(true);
    setMessage('');
    try {
      const supabase = getSupabaseClient();
      sessionStorage.setItem('careerSandboxGoogleRedirect', 'dashboard');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      });
      if (error) throw error;
    } catch (err) {
      sessionStorage.removeItem('careerSandboxGoogleRedirect');
      setMessage(friendlyError(err));
      setLoading(false);
    }
  }

  const inputStyle: CSSProperties = {
    display: 'block', width: '100%', boxSizing: 'border-box',
    padding: '13px 15px', marginTop: 8,
    border: '1px solid var(--border-strong, #d5dce5)',
    borderRadius: 10, background: '#fff',
    color: 'var(--dark-slate, #17263b)', fontSize: 15,
    outlineColor: 'var(--primary, #4f46e5)',
  };
  const buttonStyle: CSSProperties = {
    width: '100%', minHeight: 48, borderRadius: 10,
    fontSize: 15, fontWeight: 700,
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.65 : 1,
  };
  const eyeButtonStyle: CSSProperties = {
    position: 'absolute', right: 10, top: 8, bottom: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 38, background: 'transparent', border: 'none',
    color: '#66758a', cursor: 'pointer',
  };

  return (
    <section style={{ minHeight: '75vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '48px 16px', background: 'var(--bg-subtle, #f7f9fc)' }}>
      <div style={{ width: '100%', maxWidth: 440, background: '#fff', border: '1px solid var(--border-subtle, #e7ebf0)', borderRadius: 20, boxShadow: '0 18px 55px rgba(20, 39, 66, 0.08)', padding: 'clamp(24px, 5vw, 40px)' }}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <div style={{ display: 'inline-flex', padding: '7px 13px', borderRadius: 999, background: 'var(--primary-subtle, #eef2ff)', color: 'var(--primary, #4f46e5)', fontWeight: 800, fontSize: 13, marginBottom: 16 }}>
            Career Sandbox
          </div>
          <h1 style={{ margin: '0 0 10px', fontSize: 'clamp(26px, 4vw, 32px)', lineHeight: 1.2, fontWeight: 800, color: 'var(--dark-slate, #17263b)' }}>
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p style={{ margin: 0, color: 'var(--text-muted, #66758a)', lineHeight: 1.6, fontSize: 15 }}>
            {mode === 'login' ? 'Log in to continue exploring your career possibilities.' : 'Save your discoveries and explore careers that fit you.'}
          </p>
        </div>

        <button type="button" disabled={loading} onClick={handleGoogleSignIn}
          style={{ ...buttonStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, background: '#fff', border: '1px solid #cbd5e1', color: '#243247' }}>
          <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6C44.4 38.03 46.98 31.87 46.98 24.55z" />
            <path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.6.27-3.14.76-4.59l-7.98-6.2A23.9 23.9 0 0 0 0 24c0 3.87.93 7.52 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.8l-7.73-6c-2.14 1.44-4.88 2.3-8.17 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.97 6.19C6.51 42.62 14.62 48 24 48z" />
          </svg>
          Continue with Google
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '25px 0', color: 'var(--text-muted, #7b8797)', fontSize: 13 }}>
          <span style={{ height: 1, flex: 1, background: '#e2e8f0' }} />
          or continue with email
          <span style={{ height: 1, flex: 1, background: '#e2e8f0' }} />
        </div>

        <form onSubmit={handleSubmit}>
          <label htmlFor="auth-email" style={{ display: 'block', fontSize: 14, fontWeight: 700, color: 'var(--dark-slate, #17263b)', marginBottom: 18 }}>
            Email address
            <input id="auth-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" style={inputStyle} />
          </label>

          <label htmlFor="auth-password" style={{ display: 'block', fontSize: 14, fontWeight: 700, color: 'var(--dark-slate, #17263b)', marginBottom: mode === 'signup' ? 12 : 24 }}>
            Password
            <div style={{ position: 'relative' }}>
              <input id="auth-password" type={showPassword ? 'text' : 'password'}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                minLength={6} required value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'signup' ? 'Create a strong password' : 'Enter your password'}
                style={{ ...inputStyle, paddingRight: 52 }} />
              <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword} onClick={() => setShowPassword((prev) => !prev)}
                style={eyeButtonStyle}>
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
          </label>

          {mode === 'signup' && (
            <>
              <div style={{ background: '#f5f8fa', borderRadius: 10, padding: '13px 15px', marginBottom: 20, fontSize: 13 }}>
                <div style={{ fontWeight: 700, color: '#243247', marginBottom: 8 }}>Your password needs:</div>
                {requirements.map((item) => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 6, color: item.met ? '#0f766e' : '#64748b' }}>
                    {item.met ? <Check size={15} /> : <span style={{ width: 15, textAlign: 'center' }}>○</span>}
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>

              <label htmlFor="auth-confirm-password" style={{ display: 'block', fontSize: 14, fontWeight: 700, color: 'var(--dark-slate, #17263b)', marginBottom: 24 }}>
                Confirm password
                <div style={{ position: 'relative' }}>
                  <input id="auth-confirm-password" type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password" required value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    style={{ ...inputStyle, paddingRight: 52 }} />
                  <button type="button" aria-label={showConfirmPassword ? 'Hide confirmation password' : 'Show confirmation password'}
                    aria-pressed={showConfirmPassword}
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    style={eyeButtonStyle}>
                    {showConfirmPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
                {confirmPassword.length > 0 && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 8, fontWeight: 500, fontSize: 13, color: passwordsMatch ? '#0f766e' : '#b45309' }}>
                    {passwordsMatch ? <Check size={14} /> : <X size={14} />}
                    {passwordsMatch ? 'Passwords match' : "Passwords don't match yet"}
                  </span>
                )}
              </label>
            </>
          )}

          <button type="submit" disabled={loading || (mode === 'signup' && !signupValid)}
            className="btn-primary"
            style={{ ...buttonStyle, border: 'none', cursor: loading || (mode === 'signup' && !signupValid) ? 'not-allowed' : 'pointer', opacity: loading || (mode === 'signup' && !signupValid) ? 0.6 : 1 }}>
            {loading ? 'Please wait...' : mode === 'signup' ? 'Create account' : 'Log in with email'}
          </button>
        </form>

        {message && (
          <p role="status" aria-live="polite" style={{ margin: '18px 0 0', padding: '12px 14px', borderRadius: 10, background: '#f1f5f9', color: '#334155', fontSize: 14, lineHeight: 1.5, overflowWrap: 'anywhere' }}>
            {message}
          </p>
        )}

        <p style={{ textAlign: 'center', margin: '26px 0 0', fontSize: 14, color: 'var(--text-muted, #66758a)' }}>
          {mode === 'signup' ? 'Already have an account?' : 'New to Career Sandbox?'}{' '}
          <button type="button" disabled={loading}
            onClick={() => {
              setMode(mode === 'signup' ? 'login' : 'signup');
              setMessage('');
              setPassword('');
              setConfirmPassword('');
              setShowPassword(false);
              setShowConfirmPassword(false);
            }}
            style={{ border: 0, background: 'transparent', color: 'var(--primary, #4f46e5)', fontWeight: 800, cursor: 'pointer', padding: '4px 2px', fontSize: 14 }}>
            {mode === 'signup' ? 'Log in' : 'Sign up'}
          </button>
        </p>
      </div>
    </section>
  );
}
