'use client';

import React from 'react';
import { CareerProvider, useCareer } from '../context/CareerContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MayaDrawer from '../components/MayaDrawer';


import LandingView from '../components/LandingView';
import OnboardingView from '../components/OnboardingView';
import RecommendationsView from '../components/RecommendationsView';
import CareerDetailView from '../components/CareerDetailView';
import ExploreView from '../components/ExploreView';
import SavedView from '../components/SavedView';
import CompareView from '../components/CompareView';
import DashboardView from '../components/DashboardView';
import WhatIfView from '../components/WhatIfView';
import AuthView from '../components/AuthView';
import ProfileView from '../components/ProfileView';
function AppContent() {
 const { activeView, authUser, authLoading } = useCareer();

const protectedViews = [
  'recommendations',
  'detail',
  'explore',
  'saved',
  'compare',
  'dashboard',
  'what-if',
  'profile',
];

const requiresLogin = protectedViews.includes(activeView);
const showLogin = !authLoading && !authUser && requiresLogin;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

     
<main className="main-content" style={{ flex: 1 }}>
  {authLoading ? (
    <p style={{ textAlign: 'center', padding: 40 }}>
      Loading...
    </p>
  ) : showLogin ? (
    <section style={{ maxWidth: 460, margin: '60px auto', padding: 24 }}>
      <h1>Sign in to see your career results</h1>
      <p>
        Your career exploration is ready! Create an account or
        log in to unlock your recommendations.
      </p>
      <AuthView />
    </section>
  ) : (
    <>
      {activeView === 'landing' && <LandingView />}
      {activeView === 'onboarding' && <OnboardingView />}
      {activeView === 'recommendations' && <RecommendationsView />}
      {activeView === 'detail' && <CareerDetailView />}
      {activeView === 'explore' && <ExploreView />}
      {activeView === 'saved' && <SavedView />}
      {activeView === 'compare' && <CompareView />}
      {activeView === 'dashboard' && <DashboardView />}
      {activeView === 'what-if' && <WhatIfView />}
      {activeView === 'auth' && <AuthView />}
      {activeView === 'profile' && <ProfileView />}
    </>
  )}
</main>


           <Footer />
      <MayaDrawer /> 
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
