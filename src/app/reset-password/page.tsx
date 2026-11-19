'use client';

import { useEffect, useState, type FormEvent, type CSSProperties } from 'react';
import { Eye, EyeOff, Check } from 'lucide-react';
import { getSupabaseClient } from '../../lib/supabase';

export default function ResetPasswordPage() {
  const [status, setStatus] = useState<'checking' | 'ready' | 'invalid' | 'success'>('checking');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const supabase = getSupabaseClient();
    let active = true;
    let verified = false;
    const query = new URLSearchParams(window.location.search);
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const linkError = query.get('error') || hash.get('error') || query.get('error_code') || hash.get('error_code');
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === 'PASSWORD_RECOVERY' && session && !linkError) {
        verified = true;
        setStatus('ready');
      }
      if (event === 'SIGNED_OUT') {
        verified = false;
        setStatus(previous => previous === 'success' ? previous : 'invalid');
      }
    });
    if (linkError) setStatus('invalid');
    const timeout = window.setTimeout(() => {
      if (active && !verified) setStatus(previous => previous === 'checking' ? 'invalid' : previous);
    }, 12000);
    return () => { active = false; subscription.unsubscribe(); window.clearTimeout(timeout); };
  }, []);

  const requirements = [
    { label: 'At least 6 characters', met: password.length >= 6 },
    { label: 'One uppercase letter (A–Z)', met: /[A-Z]/.test(password) },
    { label: 'One lowercase letter (a–z)', met: /[a-z]/.test(password) },
    { label: 'One number (0–9)', met: /[0-9]/.test(password) },
  ];
  const valid = requirements.every(item => item.met) && password === confirm;

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!valid || status !== 'ready' || loading) return;
    setLoading(true);
    setMessage('');
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setPassword(''); setConfirm(''); setStatus('success');
      window.history.replaceState(null, '', window.location.pathname);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Unable to update your password. Please try again.');
    } finally { setLoading(false); }
  }

  const input: CSSProperties = { width: '100%', boxSizing: 'border-box', padding: '13px 48px 13px 15px', marginTop: 8, border: '1px solid #d5dce5', borderRadius: 10, fontSize: 15, background: '#fff', color: '#17263b' };
  const eye: CSSProperties = { position: 'absolute', right: 10, top: 8, bottom: 0, border: 0, background: 'transparent', color: '#66758a', cursor: 'pointer' };
  const button: CSSProperties = { width: '100%', minHeight: 48, borderRadius: 10, border: 0, background: '#0c6957', color: '#fff', fontWeight: 700, fontSize: 15 };
  return (
    <main style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 16px', background: '#f7f9fc' }}>
      <section style={{ width: '100%', maxWidth: 440, padding: 'clamp(24px, 5vw, 40px)', background: '#fff', border: '1px solid #e7ebf0', borderRadius: 20, boxShadow: '0 18px 55px rgba(20,39,66,.08)', color: '#17263b' }}>
        <div style={{ textAlign: 'center', marginBottom: 26 }}>
          <span style={{ display: 'inline-block', background: '#e5f4e3', color: '#0c6957', borderRadius: 999, padding: '7px 13px', fontWeight: 800, fontSize: 13 }}>Career Sandbox</span>
          <h1 style={{ fontSize: 28, margin: '16px 0 10px' }}>{status === 'success' ? 'Password updated!' : 'Create a new password'}</h1>
          <p role="status" style={{ color: '#66758a', lineHeight: 1.6 }}>{status === 'checking' ? 'Verifying your recovery link…' : status === 'invalid' ? 'This recovery link could not be verified. Return to login and request a new link.' : status === 'success' ? 'Your new password is ready to use.' : 'Choose a new password for your Career Sandbox account.'}</p>
        </div>
        {status === 'ready' && <form onSubmit={submit}>
          <label htmlFor="new-password" style={{ fontWeight: 700, fontSize: 14 }}>New password</label>
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <input id="new-password" required autoComplete="new-password" type={show ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} style={input} />
            <button type="button" style={eye} aria-label={show ? 'Hide password' : 'Show password'} onClick={() => setShow(!show)}>{show ? <EyeOff size={19}/> : <Eye size={19}/>}</button>
          </div>
          <div style={{ background: '#f5f8fa', borderRadius: 10, padding: 14, marginBottom: 20, fontSize: 13 }}>
            {requirements.map(item => <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 9, margin: '6px 0', color: item.met ? '#0f766e' : '#64748b' }}>{item.met ? <Check size={15}/> : <span style={{ width: 15 }}>○</span>}{item.label}</div>)}
          </div>
          <label htmlFor="confirm-new-password" style={{ fontWeight: 700, fontSize: 14 }}>Confirm new password</label>
          <div style={{ position: 'relative', marginBottom: 8 }}>
            <input id="confirm-new-password" required autoComplete="new-password" type={showConfirm ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)} style={input}/>
            <button type="button" style={eye} aria-label={showConfirm ? 'Hide confirmation password' : 'Show confirmation password'} onClick={() => setShowConfirm(!showConfirm)}>{showConfirm ? <EyeOff size={19}/> : <Eye size={19}/>}</button>
          </div>
          {confirm && <p style={{ fontSize: 13, color: password === confirm ? '#0f766e' : '#b45309' }}>{password === confirm ? 'Passwords match' : 'Passwords do not match yet'}</p>}
          <button disabled={!valid || loading} type="submit" style={{ ...button, marginTop: 16, opacity: !valid || loading ? .6 : 1, cursor: !valid || loading ? 'not-allowed' : 'pointer' }}>{loading ? 'Updating…' : 'Update password'}</button>
          {message && <p role="alert" style={{ fontSize: 14, overflowWrap: 'anywhere' }}>{message}</p>}
        </form>}
        {(status === 'invalid' || status === 'success') && <a href="/" style={{ ...button, display: 'flex', justifyContent: 'center', alignItems: 'center', textDecoration: 'none' }}>{status === 'success' ? 'Continue to Career Sandbox' : 'Return to Career Sandbox'}</a>}
      </section>
    </main>
  );
}
