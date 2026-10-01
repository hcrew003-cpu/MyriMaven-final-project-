'use client';

import React from 'react';
import { useCareer } from '../context/CareerContext';
import { Layers } from 'lucide-react';

export default function PrototypeNav() {
  const {
    activeView,
    setActiveView,
    onboardingStep,
    setOnboardingStep,
  } = useCareer();

  const screens = [
    { id: '01', name: '01 Landing', view: 'landing' as const, step: 1 },
    { id: '02', name: '02 Welcome', view: 'onboarding' as const, step: 1 },
    { id: '03', name: '03 Interests', view: 'onboarding' as const, step: 2 },
    { id: '04', name: '04 Skills', view: 'onboarding' as const, step: 3 },
    { id: '05', name: '05 Preferences', view: 'onboarding' as const, step: 4 },
    { id: '06', name: '06 Goals', view: 'onboarding' as const, step: 5 },
    { id: '07', name: '07 Summary', view: 'onboarding' as const, step: 6 },
    { id: '08', name: '08 Recommendations', view: 'recommendations' as const, step: 1 },
    { id: '09', name: '09 Profile Detail', view: 'detail' as const, step: 1 },
    { id: '10', name: '10 Explore', view: 'explore' as const, step: 1 },
    { id: '11', name: '11 Saved', view: 'saved' as const, step: 1 },
    { id: '12', name: '12 Compare', view: 'compare' as const, step: 1 },
    { id: '13', name: '13 Dashboard', view: 'dashboard' as const, step: 1 },
    { id: '14', name: '14 What-If', view: 'what-if' as const, step: 1 },
  ];

  const isCurrent = (item: typeof screens[0]) => {
    if (item.view === 'onboarding') {
      return activeView === 'onboarding' && onboardingStep === item.step;
    }
    return activeView === item.view;
  };

  return (
    <div className="proto-bar">
      <div className="proto-label">
        <Layers size={14} />
        <span>14 Prototype Screens:</span>
      </div>
      <div className="proto-btn-group">
        {screens.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveView(item.view);
              if (item.view === 'onboarding') {
                setOnboardingStep(item.step);
              }
            }}
            className={`proto-btn ${isCurrent(item) ? 'active' : ''}`}
            title={`Jump directly to Screen ${item.name}`}
          >
            {item.name}
          </button>
        ))}
      </div>
    </div>
  );
}
