
'use client';

import React, { useState } from 'react';
import { useCareer } from '../context/CareerContext';
import {
  Compass,
  Sparkles,
  Bookmark,
  BarChart3,
  Sliders,
  LayoutDashboard,
} from 'lucide-react';
import { getSupabaseClient } from '../lib/supabase';

export default function Navbar() {
  const {
    setActiveView,
    savedCareerIds,
    setIsMayaOpen,
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

        {/* Navigation for logged-in users */}
        {!authLoading && authUser && (
          <div className="nav-links">
            <button
              onClick={() => setActiveView('explore')}
              className="nav-link-btn"
            >
              Explore
            </button>

            <button
              onClick={() => setActiveView('recommendations')}
              className="nav-link-btn"
            >
              Recommendations
            </button>

            <button
              onClick={() => setActiveView('what-if')}
              className="nav-link-btn"
            >
              <Sliders size={14} /> What-If Sandbox
            </button>

            <button
              onClick={() => setActiveView('saved')}
              className="nav-link-btn"
            >
              <Bookmark size={14} /> Saved ({savedCareerIds.length})
            </button>

            <button
              onClick={() => setActiveView('compare')}
              className="nav-link-btn"
            >
              <BarChart3 size={14} /> Compare
            </button>

            <button
              onClick={() => setActiveView('dashboard')}
              className="nav-link-btn"
            >
              <LayoutDashboard size={14} /> Dashboard
            </button>
          </div>
        )}

        {/* Right-side account controls */}
        <div className="nav-actions">

          {/* Signed-out users */}
          {!authLoading && !authUser && (
            <button
              onClick={() => setActiveView('auth')}
              className="nav-link-btn"
            >
              Sign Up / Log In
            </button>
          )}

          {/* Signed-in users */}
          {!authLoading && authUser && (
            <>
              {/* Maya has its own separate button */}
              <button
                onClick={() => setIsMayaOpen(true)}
                className="maya-nav-btn"
                title="Ask Maya AI Guide"
              >
                <Sparkles size={16} className="sparkle-icon" />
                <span>Ask Maya</span>
              </button>

              {/* User profile button */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => {
                    setActiveView('profile');
                    setIsProfileMenuOpen(false);
                  }}
                  className="user-badge"
                  title="Go to My Profile"
                >
                  <div className="avatar-circle">
                    {(authUser.email?.charAt(0) || 'U').toUpperCase()}
                  </div>
                  <span>
                    {authUser.email?.split('@')[0] || 'My Account'}
                  </span>
                </button>

                {/* Account menu available on profile page */}
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="nav-link-btn"
                  aria-label="Open account menu"
                  aria-expanded={isProfileMenuOpen}
                >
                  ▾
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
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: 12,
                        textAlign: 'left',
                      }}
                    >
                      My Profile
                    </button>

                    <button
                      onClick={handleLogout}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: 12,
                        textAlign: 'left',
                      }}
                    >
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
