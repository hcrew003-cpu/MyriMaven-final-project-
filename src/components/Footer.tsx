'use client';

import React from 'react';
import { Compass, Heart } from 'lucide-react';
import { useCareer } from '../context/CareerContext';

export default function Footer() {
  const { setActiveView } = useCareer();

  return (
    <footer style={{
      backgroundColor: '#FFFFFF',
      borderTop: '1px solid var(--border)',
      padding: '40px 0 80px 0',
      color: 'var(--text-muted)',
      fontSize: '0.9rem',
    }}>
      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="brand-icon" style={{ width: '28px', height: '28px' }}>
              <Compass size={16} />
            </div>
            <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.1rem' }}>MyriMaven</span>
            <span style={{ color: 'var(--text-subtle)' }}>· Career Exploration Sandbox</span>
          </div>

          <div style={{ display: 'flex', gap: '20px', fontSize: '0.88rem' }}>
            <button onClick={() => setActiveView('landing')} style={{ color: 'var(--text-muted)' }}>Home</button>
            <button onClick={() => setActiveView('explore')} style={{ color: 'var(--text-muted)' }}>Explore</button>
            <button onClick={() => setActiveView('recommendations')} style={{ color: 'var(--text-muted)' }}>Matches</button>
            <button onClick={() => setActiveView('what-if')} style={{ color: 'var(--text-muted)' }}>What-If Sandbox</button>
            <button onClick={() => setActiveView('dashboard')} style={{ color: 'var(--text-muted)' }}>Dashboard</button>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.82rem',
          color: 'var(--text-subtle)'
        }}>
          <div>
            Built with intention for students and career seekers navigating their authentic path.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>Powered by thoughtful AI guidance</span>
            <Heart size={14} style={{ color: '#E11D48', marginLeft: '4px' }} />
          </div>
        </div>
      </div>
    </footer>
  );
}
