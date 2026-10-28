'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Career, UserProfile, WhatIfState, ViewType } from '../types/career';
import { CAREERS, INITIAL_USER_PROFILE } from '../data/careersData';
import type { User } from '@supabase/supabase-js';
import { getSupabaseClient } from '../lib/supabase';
import { loadUserProfile, saveUserProfile } from '../lib/profile';
interface CareerContextType {
  activeView: ViewType;
  authUser: User | null;
  authLoading: boolean;
  setActiveView: (view: ViewType) => void;
  selectedCareerId: string;
  setSelectedCareerId: (id: string) => void;
  selectedCareer: Career;
  savedCareerIds: string[];
  toggleSaveCareer: (id: string) => void;
  isSaved: (id: string) => boolean;
  compareCareerIds: string[];
  toggleCompareCareer: (id: string) => void;
  isComparing: (id: string) => boolean;
  userProfile: UserProfile;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  whatIfToggles: WhatIfState;
  toggleWhatIf: (key: keyof WhatIfState) => void;
  isMayaOpen: boolean;
  setIsMayaOpen: (open: boolean) => void;
  mayaPrompt: string;
  openMayaWithPrompt: (prompt: string) => void;
  onboardingStep: number;
  setOnboardingStep: (step: number) => void;
  getWhatIfRankedCareers: () => (Career & { dynamicScore: number; delta: number | 'NEW'; scenarioNote?: string })[];
}

const CareerContext = createContext<CareerContextType | undefined>(undefined);

export function CareerProvider({ children }: { children: React.ReactNode }) {
  const [activeView, setActiveViewState] = useState<ViewType>('landing');

  const validViews: ViewType[] = [
    'landing', 'onboarding', 'recommendations', 'detail', 'explore',
    'saved', 'compare', 'dashboard', 'what-if', 'auth', 'profile',
  ];

  const setActiveView = useCallback((view: ViewType) => {
    setActiveViewState(view);
    const url = new URL(window.location.href);
    url.hash = view === 'landing' ? '' : view;
    window.history.pushState({ view }, '', url.toString());
  }, []);

  useEffect(() => {
    const getViewFromUrl = (): ViewType => {
      const view = window.location.hash.replace('#', '') as ViewType;
      return validViews.includes(view) ? view : 'landing';
    };
    setActiveViewState(getViewFromUrl());
    const handlePopState = () => setActiveViewState(getViewFromUrl());
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseClient();

    // Only redirect after Google OAuth, not whenever an existing session refreshes.
    const finishGoogleRedirect = (user: User | null) => {
      if (!user || sessionStorage.getItem('careerSandboxGoogleRedirect') !== 'dashboard') return;
      sessionStorage.removeItem('careerSandboxGoogleRedirect');
      setActiveView('dashboard');
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const user = session?.user ?? null;
        setAuthUser(user);
        setAuthLoading(false);
        // Supabase may emit SIGNED_IN or INITIAL_SESSION on the return from OAuth.
        // Schedule navigation outside the auth callback to avoid re-entrant auth work.
        if (user && sessionStorage.getItem('careerSandboxGoogleRedirect') === 'dashboard') {
          setTimeout(() => finishGoogleRedirect(user), 0);
        }
      }
    );

    supabase.auth.getUser().then(({ data }) => {
      setAuthUser(data.user);
      setAuthLoading(false);
      finishGoogleRedirect(data.user);
    }).catch(() => {
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [setActiveView]);

  const [selectedCareerId, setSelectedCareerId] = useState<string>('marketing-manager');
  const [savedCareerIds, setSavedCareerIds] = useState<string[]>([
    'marketing-manager', 'product-designer', 'project-manager',
  ]);
  const [compareCareerIds, setCompareCareerIds] = useState<string[]>([
    'marketing-manager', 'product-designer', 'project-manager',
  ]);
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [profileLoading, setProfileLoading] = useState(false);

useEffect(() => {
  let cancelled = false;

  if (!authUser) {
    setUserProfile(INITIAL_USER_PROFILE);
    setProfileLoading(false);
    return;
  }

  setProfileLoading(true);

  // Clear the previous account's information before loading this one.
  setUserProfile(INITIAL_USER_PROFILE);

  loadUserProfile(authUser)
    .then((profile) => {
      if (!cancelled && profile) {
        setUserProfile(profile);
      }
    })
    .catch((error) => {
      if (!cancelled) {
        console.error('Failed to load user profile:', error);
      }
    })
    .finally(() => {
      if (!cancelled) {
        setProfileLoading(false);
      }
    });

  return () => {
    cancelled = true;
  };
}, [authUser?.id]);
  const [whatIfToggles, setWhatIfToggles] = useState<WhatIfState>({
    growth: true,
    leadership: true,
    workLifeBalance: true,
    stability: true,
    helpingOthers: true,
    income: false,
    creativity: false,
  });
  const [isMayaOpen, setIsMayaOpen] = useState<boolean>(false);
  const [mayaPrompt, setMayaPrompt] = useState<string>('');
  const [onboardingStep, setOnboardingStep] = useState<number>(1);

  const selectedCareer =
    CAREERS.find((c) => c.id === selectedCareerId) || CAREERS[0];

  const toggleSaveCareer = (id: string) => {
    setSavedCareerIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };
  const isSaved = (id: string) => savedCareerIds.includes(id);

  const toggleCompareCareer = (id: string) => {
    setCompareCareerIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        if (prev.length >= 3) {
          return [prev[0], prev[1], id];
        }
        return [...prev, id];
      }
    });
  };
  const isComparing = (id: string) => compareCareerIds.includes(id);

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...updates }));
  };
  const toggleWhatIf = (key: keyof WhatIfState) => {
    setWhatIfToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };
  const openMayaWithPrompt = (prompt: string) => {
    setMayaPrompt(prompt);
    setIsMayaOpen(true);
  };

  const getWhatIfRankedCareers = () => {
    return CAREERS.map((c) => {
      let score = c.baseMatch;
      let delta: number | 'NEW' = 0;
      let scenarioNote = '';

      if (c.balanceScenario && (whatIfToggles.workLifeBalance || whatIfToggles.helpingOthers)) {
        score = c.balanceScenario.score;
        delta = c.balanceScenario.delta;
        scenarioNote = c.balanceScenario.note || '';
      } else {
        if (whatIfToggles.income && ['financial-analyst', 'software-developer', 'marketing-manager'].includes(c.id)) {
          score += 4;
          delta = 4;
        }
        if (whatIfToggles.creativity && ['product-designer', 'content-strategist', 'ux-designer'].includes(c.id)) {
          score += 5;
          delta = 5;
        }
      }
      return {
        ...c,
        dynamicScore: Math.min(99, Math.max(50, score)),
        delta,
        scenarioNote,
      };
    }).sort((a, b) => b.dynamicScore - a.dynamicScore);
  };

  return (
    <CareerContext.Provider
      value={{
        authUser, authLoading,
        activeView, setActiveView,
        selectedCareerId, setSelectedCareerId, selectedCareer,
        savedCareerIds, toggleSaveCareer, isSaved,
        compareCareerIds, toggleCompareCareer, isComparing,
        userProfile, updateUserProfile,
        whatIfToggles, toggleWhatIf,
        isMayaOpen, setIsMayaOpen, mayaPrompt, openMayaWithPrompt,
        onboardingStep, setOnboardingStep, getWhatIfRankedCareers,
      }}
    >
      {children}
    </CareerContext.Provider>
  );
}

export function useCareer() {
  const context = useContext(CareerContext);
  if (!context) {
    throw new Error('useCareer must be used within a CareerProvider');
  }
  return context;
}
