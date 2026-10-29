'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Career, UserProfile, WhatIfState, ViewType } from '../types/career';
import { CAREERS, INITIAL_USER_PROFILE } from '../data/careersData';
import type { User } from '@supabase/supabase-js';
import { getSupabaseClient } from '../lib/supabase';
import { loadUserProfile, saveUserProfile } from '../lib/profile';
import { loadSavedCareers, addSavedCareer, removeSavedCareer } from '../lib/savedCareers';
import { loadComparedCareers, addComparedCareer, removeComparedCareer } from '../lib/comparedCareers';

type PreferenceKey = keyof UserProfile['preferences'];
type RankedCareer = Career & { dynamicScore: number; delta: number; scenarioNote: string };

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
  saveProfile: () => Promise<void>;
  whatIfToggles: WhatIfState;
  toggleWhatIf: (key: keyof WhatIfState) => void;
  whatIfPreferences: UserProfile['preferences'];
  updateWhatIfPreference: (key: PreferenceKey, value: number) => void;
  resetWhatIf: () => void;
  isMayaOpen: boolean;
  setIsMayaOpen: (open: boolean) => void;
  mayaPrompt: string;
  openMayaWithPrompt: (prompt: string) => void;
  onboardingStep: number;
  setOnboardingStep: (step: number) => void;
  getWhatIfRankedCareers: () => RankedCareer[];
}

const CareerContext = createContext<CareerContextType | undefined>(undefined);

const EMPTY_PRIORITIES: WhatIfState = {
  growth: false, leadership: false, workLifeBalance: false,
  stability: false, helpingOthers: false, income: false, creativity: false,
};

const PRIORITY_TERMS: Record<keyof WhatIfState, string[]> = {
  growth: ['growth', 'advance', 'development', 'career progression', 'learning'],
  leadership: ['leader', 'manage', 'direct', 'supervis', 'executive', 'strategy'],
  workLifeBalance: ['balance', 'flexib', 'remote', 'hybrid', 'predictable', 'independent'],
  stability: ['stable', 'stability', 'secure', 'predictable', 'consistent', 'structured'],
  helpingOthers: ['help', 'support', 'community', 'care', 'teach', 'counsel', 'health', 'social'],
  income: ['finance', 'financial', 'software', 'engineer', 'technology', 'analyst', 'business'],
  creativity: ['creativ', 'design', 'content', 'art', 'marketing', 'innov', 'brand'],
};

const PREFERENCE_TERMS: Record<PreferenceKey, [string[], string[]]> = {
  soloVsTeam: [
    ['independent', 'individual', 'solo', 'self-directed'],
    ['team', 'collaborat', 'group', 'people', 'cross-functional'],
  ],
  structuredVsFlexible: [
    ['structured', 'routine', 'process', 'consistent', 'organized'],
    ['flexib', 'adapt', 'dynamic', 'varied', 'agile'],
  ],
  officeVsRemote: [
    ['office', 'onsite', 'on-site', 'in-person'],
    ['remote', 'hybrid', 'work from home', 'distributed'],
  ],
  peopleVsTask: [
    ['task', 'technical', 'data', 'analysis', 'research', 'systems'],
    ['people', 'client', 'customer', 'community', 'patient', 'student', 'relationship'],
  ],
  creativeVsAnalytical: [
    ['creativ', 'design', 'art', 'content', 'innov', 'brand'],
    ['analyt', 'data', 'research', 'finance', 'technical', 'logic'],
  ],
  fastVsPredictable: [
    ['fast', 'dynamic', 'rapid', 'deadline', 'high-paced'],
    ['predictable', 'routine', 'stable', 'consistent', 'planned'],
  ],
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const hasTerm = (text: string, terms: string[]) => terms.some((term) => text.includes(term));
const normalized = (value: string) => value.trim().toLowerCase();

function careerText(career: Career): string {
  return [
    career.title, career.category, career.description,
    career.mayFitBecause, career.watchOut,
    ...career.tags, ...career.workEnvironment,
    ...career.skillsUsed.map((skill) => skill.name),
  ].join(' ').toLowerCase();
}

// These are explainable, illustrative matching rules—not validated career assessments.
function calculateMatch(
  career: Career,
  profile: UserProfile,
  preferences: UserProfile['preferences'],
  priorities: WhatIfState
): number {
  const text = careerText(career);
  let earned = 0;
  let possible = 0;

  // Interests: look for the user's chosen interests in the career's text and tags.
  const interests = profile.interests.filter(Boolean);
  if (interests.length) {
    possible += 25;
    const matches = interests.filter((interest) => {
      const words = normalized(interest).split(/[^a-z0-9]+/).filter((word) => word.length > 3);
      return text.includes(normalized(interest)) || words.some((word) => text.includes(word));
    }).length;
    earned += 25 * Math.min(1, matches / Math.min(2, interests.length));
  }

  // Skills: reward skills the user rates highly that the career uses.
  const skills = career.skillsUsed.filter((skill) =>
    typeof profile.skills[skill.name] === 'number'
  );
  if (skills.length) {
    possible += 25;
    const total = skills.reduce((sum, skill) => {
      const rating = clamp(profile.skills[skill.name], 1, 5);
      const required = clamp(skill.level, 1, 5);
      return sum + (1 - Math.abs(rating - required) / 4);
    }, 0);
    earned += 25 * total / skills.length;
  }

  // Preference signals use explicit words in the career description/environment.
  let preferenceEarned = 0;
  let preferencePossible = 0;
  (Object.keys(PREFERENCE_TERMS) as PreferenceKey[]).forEach((key) => {
    const [lowTerms, highTerms] = PREFERENCE_TERMS[key];
    const low = hasTerm(text, lowTerms);
    const high = hasTerm(text, highTerms);
    if (!low && !high) return; // No evidence: do not invent a workplace characteristic.
    const preference = clamp(Number(preferences[key]) || 3, 1, 5);
    const fit = low && high ? 1 : low ? (5 - preference) / 4 : (preference - 1) / 4;
    preferenceEarned += fit;
    preferencePossible += 1;
  });
  if (preferencePossible) {
    possible += 25;
    earned += 25 * preferenceEarned / preferencePossible;
  }

  // Baseline goals are based on saved onboarding goals; scenario toggles replace
  // the goal emphasis only when at least one priority is selected.
  const active = (Object.keys(priorities) as (keyof WhatIfState)[])
    .filter((key) => priorities[key]);
  const goals = active.length
    ? active.map((key) => key)
    : profile.goals.map((goal) => normalized(goal));
  if (goals.length) {
    possible += 25;
    let matched = 0;
    goals.forEach((goal) => {
      const key = (Object.keys(PRIORITY_TERMS) as (keyof WhatIfState)[])
        .find((candidate) => normalized(candidate) === normalized(goal).replace(/[^a-z]/g, ''));
      const terms = key ? PRIORITY_TERMS[key] : [goal, ...goal.split(/\W+/).filter((w) => w.length > 4)];
      if (hasTerm(text, terms)) matched += 1;
    });
    earned += 25 * matched / goals.length;
  }

  // No user evidence means no meaningful match estimate.
  if (!possible) return 0;
  return Math.round(clamp((earned / possible) * 100, 0, 100));
}

export function CareerProvider({ children }: { children: React.ReactNode }) {
  const [activeView, setActiveViewState] = useState<ViewType>('landing');
  const setActiveView = useCallback((view: ViewType) => {
    setActiveViewState(view);
    const url = new URL(window.location.href);
    url.hash = view === 'landing' ? '' : view;
    window.history.pushState({ view }, '', url.toString());
  }, []);

  useEffect(() => {
    const validViews: ViewType[] = [
      'landing', 'onboarding', 'recommendations', 'detail', 'explore',
      'saved', 'compare', 'dashboard', 'what-if', 'auth', 'profile',
    ];
    const getViewFromUrl = (): ViewType => {
      const view = window.location.hash.replace('#', '') as ViewType;
      return validViews.includes(view) ? view : 'landing';
    };
    setActiveViewState(getViewFromUrl());
    const onPopState = () => setActiveViewState(getViewFromUrl());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  useEffect(() => {
    const supabase = getSupabaseClient();
    const finishGoogleRedirect = (user: User | null) => {
      if (!user || sessionStorage.getItem('careerSandboxGoogleRedirect') !== 'dashboard') return;
      sessionStorage.removeItem('careerSandboxGoogleRedirect');
      setActiveView('dashboard');
    };
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      setAuthUser(user);
      setAuthLoading(false);
      if (user && sessionStorage.getItem('careerSandboxGoogleRedirect') === 'dashboard') {
        setTimeout(() => finishGoogleRedirect(user), 0);
      }
    });
    supabase.auth.getUser().then(({ data }) => {
      setAuthUser(data.user);
      setAuthLoading(false);
      finishGoogleRedirect(data.user);
    }).catch(() => setAuthLoading(false));
    return () => subscription.unsubscribe();
  }, [setActiveView]);

  const [selectedCareerId, setSelectedCareerId] = useState('marketing-manager');
  const [savedCareerIds, setSavedCareerIds] = useState<string[]>([]);
  const [compareCareerIds, setCompareCareerIds] = useState<string[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [profileLoading, setProfileLoading] = useState(false);
  const [whatIfToggles, setWhatIfToggles] = useState<WhatIfState>({ ...EMPTY_PRIORITIES });
  const [whatIfPreferences, setWhatIfPreferences] = useState<UserProfile['preferences']>({ ...INITIAL_USER_PROFILE.preferences });
  const [isMayaOpen, setIsMayaOpen] = useState(false);
  const [mayaPrompt, setMayaPrompt] = useState('');
  const [onboardingStep, setOnboardingStep] = useState(1);

  useEffect(() => {
    let cancelled = false;
    setSavedCareerIds([]);
    if (!authUser) return;
    loadSavedCareers(authUser)
      .then((ids) => { if (!cancelled) setSavedCareerIds(ids); })
      .catch((error) => { if (!cancelled) console.error('Failed to load saved careers:', error); });
    return () => { cancelled = true; };
  }, [authUser?.id]);

  useEffect(() => {
    let cancelled = false;
    setCompareCareerIds([]);
    if (!authUser) return;
    loadComparedCareers(authUser)
      .then((ids) => { if (!cancelled) setCompareCareerIds(ids.slice(0, 3)); })
      .catch((error) => { if (!cancelled) console.error('Failed to load compared careers:', error); });
    return () => { cancelled = true; };
  }, [authUser?.id]);

  useEffect(() => {
    let cancelled = false;
    if (!authUser) {
      setUserProfile(INITIAL_USER_PROFILE);
      setProfileLoading(false);
      return;
    }
    setProfileLoading(true);
    setUserProfile(INITIAL_USER_PROFILE);
    loadUserProfile(authUser)
      .then((profile) => { if (!cancelled && profile) setUserProfile(profile); })
      .catch((error) => { if (!cancelled) console.error('Failed to load user profile:', error); })
      .finally(() => { if (!cancelled) setProfileLoading(false); });
    return () => { cancelled = true; };
  }, [authUser?.id]);

  // Scenario sliders start with the saved profile but never write to Supabase.
  useEffect(() => {
    setWhatIfPreferences({ ...userProfile.preferences });
    setWhatIfToggles({ ...EMPTY_PRIORITIES });
  }, [userProfile.preferences]);

  const selectedCareer = CAREERS.find((c) => c.id === selectedCareerId) || CAREERS[0];
  const toggleSaveCareer = async (id: string) => {
    if (!authUser) { alert('Please sign in to save careers.'); setActiveView('auth'); return; }
    const wasSaved = savedCareerIds.includes(id);
    try {
      if (wasSaved) {
        await removeSavedCareer(authUser, id);
        setSavedCareerIds((prev) => prev.filter((careerId) => careerId !== id));
      } else {
        await addSavedCareer(authUser, id);
        setSavedCareerIds((prev) => prev.includes(id) ? prev : [...prev, id]);
      }
    } catch (error) {
      console.error('Failed to update saved career:', error);
      alert(error instanceof Error ? error.message : 'Could not update saved careers.');
    }
  };
  const isSaved = (id: string) => savedCareerIds.includes(id);
  const toggleCompareCareer = async (id: string) => {
    if (!authUser) { alert('Please sign in to compare careers.'); setActiveView('auth'); return; }
    const wasComparing = compareCareerIds.includes(id);
    try {
      if (wasComparing) {
        await removeComparedCareer(authUser, id);
        setCompareCareerIds((prev) => prev.filter((careerId) => careerId !== id));
      } else {
        if (compareCareerIds.length >= 3) { alert('You can compare up to 3 careers. Remove one first.'); return; }
        await addComparedCareer(authUser, id);
        setCompareCareerIds((prev) => prev.includes(id) ? prev : [...prev, id]);
      }
    } catch (error) {
      console.error('Failed to update compared careers:', error);
      alert(error instanceof Error ? error.message : 'Could not update comparisons.');
    }
  };
  const isComparing = (id: string) => compareCareerIds.includes(id);
  const updateUserProfile = (updates: Partial<UserProfile>) => setUserProfile((prev) => ({ ...prev, ...updates }));
  const saveProfile = async () => {
    if (!authUser) throw new Error('Please sign in to save your profile.');
    if (profileLoading) throw new Error('Please wait for your profile to finish loading.');
    await saveUserProfile(authUser, userProfile);
  };
  const toggleWhatIf = (key: keyof WhatIfState) =>
    setWhatIfToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  const updateWhatIfPreference = (key: PreferenceKey, value: number) =>
    setWhatIfPreferences((prev) => ({ ...prev, [key]: clamp(value, 1, 5) }));
  const resetWhatIf = () => {
    setWhatIfToggles({ ...EMPTY_PRIORITIES });
    setWhatIfPreferences({ ...userProfile.preferences });
  };
  const openMayaWithPrompt = (prompt: string) => { setMayaPrompt(prompt); setIsMayaOpen(true); };

  const getWhatIfRankedCareers = (): RankedCareer[] => {
    return CAREERS.map((career) => {
      const baseline = calculateMatch(career, userProfile, userProfile.preferences, EMPTY_PRIORITIES);
      const score = calculateMatch(career, userProfile, whatIfPreferences, whatIfToggles);
      const delta = score - baseline;
      const active = (Object.keys(whatIfToggles) as (keyof WhatIfState)[])
        .filter((key) => whatIfToggles[key]);
      const changedPreferences = (Object.keys(whatIfPreferences) as PreferenceKey[])
        .filter((key) => whatIfPreferences[key] !== userProfile.preferences[key]);
      const scenarioNote = active.length || changedPreferences.length
        ? `${delta > 0 ? 'Improved' : delta < 0 ? 'Decreased' : 'Unchanged'} by ${Math.abs(delta)} points compared with your saved profile. ${active.length ? `Priorities tested: ${active.join(', ')}.` : ''}${changedPreferences.length ? ` Adjusted work preferences: ${changedPreferences.length}.` : ''}`
        : 'Baseline estimate based on your saved profile.';
      return { ...career, dynamicScore: score, delta, scenarioNote };
    }).sort((a, b) => b.dynamicScore - a.dynamicScore);
  };

  return (
    <CareerContext.Provider value={{
      authUser, authLoading, activeView, setActiveView,
      selectedCareerId, setSelectedCareerId, selectedCareer,
      savedCareerIds, toggleSaveCareer, isSaved,
      compareCareerIds, toggleCompareCareer, isComparing,
      userProfile, updateUserProfile, saveProfile,
      whatIfToggles, toggleWhatIf, whatIfPreferences, updateWhatIfPreference, resetWhatIf,
      isMayaOpen, setIsMayaOpen, mayaPrompt, openMayaWithPrompt,
      onboardingStep, setOnboardingStep, getWhatIfRankedCareers,
    }}>
      {children}
    </CareerContext.Provider>
  );
}

export function useCareer() {
  const context = useContext(CareerContext);
  if (!context) throw new Error('useCareer must be used within a CareerProvider');
  return context;
}
