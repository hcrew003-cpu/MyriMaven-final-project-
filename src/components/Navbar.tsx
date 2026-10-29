
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
  activeView,
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

        {/* Career Sandbox Logo */}
        <button
          onClick={() => setActiveView('landing')}
          className="brand-logo"
          title="Return to Career Sandbox Home"
        >
          <div className="brand-icon">
            <Compass size={20} />
          </div>
          <span>Career Sandbox</span>
        </button>

        {/* Navigation for logged-in users */}
{!authLoading && authUser && (
  <div className="nav-links">
    {([
      { view: 'explore', label: 'Explore', icon: null },
      { view: 'recommendations', label: 'Recommendations', icon: null },
      { view: 'what-if', label: 'What-If Sandbox', icon: <Sliders size={14} /> },
      { view: 'saved', label: `Saved (${savedCareerIds.length})`, icon: <Bookmark size={14} /> },
      { view: 'compare', label: 'Compare', icon: <BarChart3 size={14} /> },
      { view: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={14} /> },
    ] as const).map((item) => {
      const isActive = activeView === item.view;

      return (
        <button
          key={item.view}
          onClick={() => setActiveView(item.view)}
          className="nav-link-btn"
          aria-current={isActive ? 'page' : undefined}
          style={{
            backgroundColor: isActive ? 'rgba(12, 105, 87, 0.12)' : 'transparent',
            color: isActive ? '#0c6957' : undefined,
            fontWeight: isActive ? 700 : undefined,
            borderRadius: '10px',
            padding: '10px 14px',
            transition: 'background-color 0.2s ease',
          }}
        >
          {item.icon}
          {item.label}
        </button>
      );
    })}
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
