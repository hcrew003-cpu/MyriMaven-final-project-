export interface Career {
  id: string;
  title: string;
  category: string;
  baseMatch: number;
  description: string;
  mayFitBecause: string;
  watchOut: string;
  tags: string[];
  skillsUsed: { name: string; level: number }[];
  skillsToDevelop: string[];
  workEnvironment: string[];
  relatedCareerIds: string[];
  educationLevel: string;
  matchReasons: {
    title: string;
    description: string;
    icon: string;
  }[];
  balanceScenario?: {
    score: number;
    delta: number | 'NEW';
    note?: string;
  };
}

export interface UserProfile {
  name: string;
  interests: string[];
  skills: { [skillName: string]: number };
  preferences: {
    soloVsTeam: number;
    structuredVsFlexible: number;
    officeVsRemote: number;
    peopleVsTask: number;
    creativeVsAnalytical: number;
    fastVsPredictable: number;
  };
  goals: string[];
}

export interface WhatIfState {
  growth: boolean;
  leadership: boolean;
  workLifeBalance: boolean;
  stability: boolean;
  helpingOthers: boolean;
  income: boolean;
  creativity: boolean;
}

export type ViewType =
  | 'landing'
  | 'onboarding'
  | 'recommendations'
  | 'detail'
  | 'explore'
  | 'saved'
  | 'compare'
  | 'dashboard'
  | 'what-if';
