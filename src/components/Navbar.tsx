
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
  Menu,
  X,
  UserRound,
  LogOut,
} from 'lucide-react';
import { getSupabaseClient } from '../lib/supabase';
import type { ViewType } from '../types/career';

export default function Navbar() {
  const {
    activeView,
    setActiveView,
    savedCareerIds,
    setIsMayaOpen,
    authUser,
    authLoading,
  } = useCareer();

  const [isProfileMenuOpen, setIsProfileMenuOpen] =
    useState(false);

  const [isMobileMenuOpen, setIsMobileMenuOpen] =
    useState(false);

  const navItems: {
    view: ViewType;
    label: string;
    icon: React.ReactNode;
  }[] = [
    {
      view: 'explore',
      label: 'Explore',
      icon: <Compass size={18} />,
    },
    {
      view: 'recommendations',
      label: 'Recommendations',
      icon: <Sparkles size={18} />,
    },
    {
      view: 'what-if',
      label: 'What-If Sandbox',
      icon: <Sliders size={18} />,
    },
    {
      view: 'saved',
      label: `Saved (${savedCareerIds.length})`,
      icon: <Bookmark size={18} />,
    },
    {
      view: 'compare',
      label: 'Compare',
      icon: <BarChart3 size={18} />,
    },
    {
      view: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard size={18} />,
    },
  ];

  function navigateTo(view: ViewType) {
    setActiveView(view);
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
  }

  async function handleLogout() {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert('Could not log out: ' + error.message);
      return;
    }

    setIsProfileMenuOpen(false);
    setIsMobileMenuOpen(false);
    setActiveView('landing');
  }

  const navButtonStyle = (
    isActive: boolean
  ): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    borderRadius: '10px',
    backgroundColor: isActive
      ? 'rgba(12, 105, 87, 0.12)'
      : 'transparent',
    color: isActive
      ? '#0c6957'
      : 'var(--dark-slate)',
    fontWeight: isActive ? 700 : 600,
    fontSize: '0.9rem',
    cursor: 'pointer',
    border: 'none',
    whiteSpace: 'nowrap',
  });

  return (
    <>
      <style>{`
        .mm-nav {
          position: relative;
          z-index: 1000;
          width: 100%;
          background: white;
          border-bottom: 1px solid var(--border);
        }

        .mm-nav-inner {
          max-width: 1600px;
          margin: 0 auto;
          padding: 12px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .mm-nav-desktop {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          flex: 1;
          min-width: 0;
        }

        .mm-nav-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .mm-nav-mobile-toggle {
          display: none;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 10px;
          border: 1px solid var(--border);
          background: white;
          color: #0c6957;
          cursor: pointer;
        }

        .mm-nav-mobile-panel {
          display: none;
        }

        .mm-nav-mobile-link {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          border: none;
          border-radius: 10px;
          background: transparent;
          text-align: left;
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--dark-slate);
          cursor: pointer;
        }

        .mm-nav-mobile-link:hover {
          background: rgba(12, 105, 87, 0.08);
        }

        .mm-nav-mobile-link.active {
          background: rgba(12, 105, 87, 0.12);
          color: #0c6957;
          font-weight: 700;
        }

        @media (max-width: 1250px) {
          .mm-nav-desktop {
            display: none;
          }

          .mm-nav-actions {
            display: none;
          }

          .mm-nav-mobile-toggle {
            display: flex;
          }

          .mm-nav-mobile-panel {
            display: flex;
            flex-direction: column;
            gap: 4px;
            padding: 12px 20px 20px;
            background: white;
            border-top: 1px solid var(--border);
            box-shadow: 0 12px 24px rgba(0,0,0,0.08);
            max-height: calc(100dvh - 90px);
            overflow-y: auto;
          }

          .mm-nav-inner {
            padding: 12px 20px;
          }
        }

        @media (max-width: 480px) {
          .mm-nav-inner {
            padding: 10px 14px;
          }

          .mm-nav .brand-logo {
            font-size: 0.95rem;
          }
        }
      `}</style>

      <nav className="mm-nav">
        <div className="mm-nav-inner">
          {/* Logo */}
          <button
            onClick={() => navigateTo('landing')}
            className="brand-logo"
            title="Return to Career Sandbox Home"
          >
            <div className="brand-icon">
              <Compass size={20} />
            </div>

            <span>Career Sandbox</span>
          </button>

          {/* Desktop Navigation */}
          {!authLoading && authUser && (
            <div className="mm-nav-desktop">
              {navItems.map((item) => {
                const isActive =
                  activeView === item.view;

                return (
                  <button
                    key={item.view}
                    onClick={() =>
                      navigateTo(item.view)
                    }
                    style={navButtonStyle(isActive)}
                    aria-current={
                      isActive ? 'page' : undefined
                    }
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Desktop Account Actions */}
          <div className="mm-nav-actions">
            {!authLoading && !authUser && (
              <button
                onClick={() => navigateTo('auth')}
                className="btn-primary"
              >
                Sign Up / Log In
              </button>
            )}

            {!authLoading && authUser && (
              <>
                <button
                  onClick={() =>
                    setIsMayaOpen(true)
                  }
                  className="maya-nav-btn"
                  title="Ask Maya AI Guide"
                >
                  <Sparkles size={16} />
                  <span>Ask Maya</span>
                </button>

                <div
                  style={{ position: 'relative' }}
                >
                  <button
                    onClick={() =>
                      setIsProfileMenuOpen(
                        !isProfileMenuOpen
                      )
                    }
                    className="user-badge"
                    aria-expanded={
                      isProfileMenuOpen
                    }
                  >
                    <div className="avatar-circle">
                      {(
                        authUser.email?.charAt(0) ||
                        'U'
                      ).toUpperCase()}
                    </div>

                    <span>
                      {authUser.email?.split('@')[0] ||
                        'My Account'}
                    </span>
                  </button>

                  {isProfileMenuOpen && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 10px)',
                        right: 0,
                        backgroundColor: 'white',
                        border:
                          '1px solid var(--border)',
                        borderRadius: '12px',
                        padding: '8px',
                        minWidth: '190px',
                        boxShadow:
                          '0 8px 24px rgba(0,0,0,0.12)',
                        zIndex: 1100,
                      }}
                    >
                      <button
                        onClick={() =>
                          navigateTo('profile')
                        }
                        className="mm-nav-mobile-link"
                      >
                        <UserRound size={17} />
                        My Profile
                      </button>

                      <button
                        onClick={handleLogout}
                        className="mm-nav-mobile-link"
                      >
                        <LogOut size={17} />
                        Log Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mobile / Split-Screen Toggle */}
          <button
            type="button"
            className="mm-nav-mobile-toggle"
            onClick={() =>
              setIsMobileMenuOpen(
                !isMobileMenuOpen
              )
            }
            aria-label={
              isMobileMenuOpen
                ? 'Close navigation menu'
                : 'Open navigation menu'
            }
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X size={24} />
            ) : (
              <Menu size={24} />
            )}
          </button>
        </div>

        {/* Mobile / Split-Screen Menu */}
        {isMobileMenuOpen && (
          <div className="mm-nav-mobile-panel">
            {!authLoading && authUser && (
              <>
                {navItems.map((item) => (
                  <button
                    key={item.view}
                    onClick={() =>
                      navigateTo(item.view)
                    }
                    className={`mm-nav-mobile-link ${
                      activeView === item.view
                        ? 'active'
                        : ''
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}

                <div
                  style={{
                    height: '1px',
                    backgroundColor:
                      'var(--border)',
                    margin: '8px 0',
                  }}
                />

                <button
                  onClick={() => {
                    setIsMayaOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="mm-nav-mobile-link"
                >
                  <Sparkles size={18} />
                  Ask Maya
                </button>

                <button
                  onClick={() =>
                    navigateTo('profile')
                  }
                  className="mm-nav-mobile-link"
                >
                  <UserRound size={18} />
                  My Profile
                </button>

                <button
                  onClick={handleLogout}
                  className="mm-nav-mobile-link"
                  style={{ color: '#b91c1c' }}
                >
                  <LogOut size={18} />
                  Log Out
                </button>
              </>
            )}

            {!authLoading && !authUser && (
              <button
                onClick={() =>
                  navigateTo('auth')
                }
                className="mm-nav-mobile-link"
              >
                <UserRound size={18} />
                Sign Up / Log In
              </button>
            )}
          </div>
        )}
      </nav>
    </>
  );
}
