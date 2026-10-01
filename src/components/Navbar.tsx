'use client';

import React from 'react';
import { useCareer } from '../context/CareerContext';
import { Compass, Sparkles, User, Bookmark, BarChart3, Sliders, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const {
    activeView,
    setActiveView,
    savedCareerIds,
    setIsMayaOpen,
    userProfile,
  } = useCareer();

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Brand */}
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

        {/* Center Nav Links */}
        <div className="nav-links">
          <button
            onClick={() => setActiveView('explore')}
            className={`nav-link-btn ${activeView === 'explore' ? 'active' : ''}`}
          >
            Explore
          </button>
          <button
            onClick={() => setActiveView('recommendations')}
            className={`nav-link-btn ${activeView === 'recommendations' ? 'active' : ''}`}
          >
            Recommendations
          </button>
          <button
            onClick={() => setActiveView('what-if')}
            className={`nav-link-btn ${activeView === 'what-if' ? 'active' : ''}`}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Sliders size={14} /> What-If Sandbox
            </span>
          </button>
          <button
            onClick={() => setActiveView('saved')}
            className={`nav-link-btn ${activeView === 'saved' ? 'active' : ''}`}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Bookmark size={14} /> Saved ({savedCareerIds.length})
            </span>
          </button>
          <button
            onClick={() => setActiveView('compare')}
            className={`nav-link-btn ${activeView === 'compare' ? 'active' : ''}`}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <BarChart3 size={14} /> Compare
            </span>
          </button>
          <button
            onClick={() => setActiveView('dashboard')}
            className={`nav-link-btn ${activeView === 'dashboard' ? 'active' : ''}`}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <LayoutDashboard size={14} /> Dashboard
            </span>
          </button>
        </div>

        {/* Right Actions */}
        <div className="nav-actions">
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
              {userProfile.name.charAt(0) || 'P'}
            </div>
            <span>{userProfile.name}</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
