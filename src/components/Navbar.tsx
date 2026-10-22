'use client';

import React, { useState } from 'react';
import { useCareer } from '../context/CareerContext';
import { Compass, Sparkles, User, Bookmark, BarChart3, Sliders, LayoutDashboard } from 'lucide-react';
import { getSupabaseClient } from '../lib/supabase';

export default function Navbar() {
  const {
  activeView,
  setActiveView,
  savedCareerIds,
  setIsMayaOpen,
  userProfile,
  authUser,
  authLoading,
} = useCareer();
const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

async function handleLogout() {
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    alert('Could not log out: ' + error.message);
    return;
  }

  setIsProfileMenuOpen(false);
  setActiveView('landing');
}
  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* MyriMaven Logo */}
        <button
          onClick={() => setActiveView('landing')}
          className="brand-logo"
          title="Return to MyriMaven Home"
        >
          <div className="brand-icon">
            <Compass size={20} />
          </div>
          <span>MyriMaven</span>
        </button>

        {/* Only show full navigation when signed in */}
        {!authLoading && authUser && (
          <div className="nav-links">
            <button onClick={() => setActiveView('explore')} className="nav-link-btn">
              Explore
            </button>
            <button onClick={() => setActiveView('recommendations')} className="nav-link-btn">
              Recommendations
            </button>
            <button onClick={() => setActiveView('what-if')} className="nav-link-btn">
              <Sliders size={14} /> What-If Sandbox
            </button>
            <button onClick={() => setActiveView('saved')} className="nav-link-btn">
              <Bookmark size={14} /> Saved ({savedCareerIds.length})
            </button>
            <button onClick={() => setActiveView('compare')} className="nav-link-btn">
              <BarChart3 size={14} /> Compare
            </button>
            <button onClick={() => setActiveView('dashboard')} className="nav-link-btn">
              <LayoutDashboard size={14} /> Dashboard
            </button>
          </div>
        )}

        {/* Right-side buttons */}
        <div className="nav-actions">
          {!authLoading && !authUser && (
            <button
              onClick={() => setActiveView('auth')}
              className="nav-link-btn"
              title="Sign Up or Log In"
            >
              Sign Up / Log In
            </button>
          )}

          {!authLoading && authUser && (
            <>
              <button
                onClick={() => setIsMayaOpen(true)}
                className="maya-nav-btn"
                title="Ask Maya AI Guide"
              >
                <Sparkles size={16} className="sparkle-icon" />
                <span>Ask Maya</span>
              
<div style={{ position: 'relative' }}>
  <button
    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
    className="user-badge"
    title="Open Account Menu"
    aria-expanded={isProfileMenuOpen}
  >
    <div className="avatar-circle">
      {(authUser.email?.charAt(0) || 'U').toUpperCase()}
    </div>
    <span>{authUser.email?.split('@')[0] || 'My Account'}</span>
    <span>⌄</span>
  </button>

  {isProfileMenuOpen && (
    <div
      style={{
        position: 'absolute',
        top: '100%',
        right: 0,
        marginTop: 8,
        background: 'white',
        border: '1px solid #ddd',
        borderRadius: 12,
        padding: 8,
        minWidth: 180,
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        zIndex: 1000,
      }}
    >
      <button
        onClick={() => {
          setActiveView('profile');
          setIsProfileMenuOpen(false);
        }}
        style={{ display: 'block', width: '100%', padding: 12, textAlign: 'left' }}
      >
        My Profile
      </button>

      <button
        onClick={handleLogout}
        style={{ display: 'block', width: '100%', padding: 12, textAlign: 'left' }}
      >
        Log Out
      </button>
    </div>
  )}
</div>

                <div className="avatar-circle">
                  {(authUser.email?.charAt(0) || 'U').toUpperCase()}
                </div>
                <span>{authUser.email?.split('@')[0] || 'My Account'}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
