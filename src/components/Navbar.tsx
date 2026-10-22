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
              </button>

              <button
                onClick={() => setActiveView('dashboard')}
                className="user-badge"
                title="View User Profile"
              >
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
