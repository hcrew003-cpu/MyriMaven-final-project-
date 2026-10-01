'use client';

import React from 'react';
import { CareerProvider, useCareer } from '../context/CareerContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MayaDrawer from '../components/MayaDrawer';
import PrototypeNav from '../components/PrototypeNav';

import LandingView from '../components/LandingView';
import OnboardingView from '../components/OnboardingView';
import RecommendationsView from '../components/RecommendationsView';
import CareerDetailView from '../components/CareerDetailView';
import ExploreView from '../components/ExploreView';
import SavedView from '../components/SavedView';
import CompareView from '../components/CompareView';
import DashboardView from '../components/DashboardView';
import WhatIfView from '../components/WhatIfView';

function AppContent() {
  const { activeView } = useCareer();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main className="main-content" style={{ flex: 1 }}>
        {activeView === 'landing' && <LandingView />}
        {activeView === 'onboarding' && <OnboardingView />}
        {activeView === 'recommendations' && <RecommendationsView />}
        {activeView === 'detail' && <CareerDetailView />}
        {activeView === 'explore' && <ExploreView />}
        {activeView === 'saved' && <SavedView />}
        {activeView === 'compare' && <CompareView />}
        {activeView === 'dashboard' && <DashboardView />}
        {activeView === 'what-if' && <WhatIfView />}
      </main>

      <Footer />
      <MayaDrawer />
      <PrototypeNav />
    </div>
  );
}

export default function Home() {
  return (
    <CareerProvider>
      <AppContent />
    </CareerProvider>
  );
}
