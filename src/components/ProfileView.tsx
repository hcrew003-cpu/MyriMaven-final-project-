
'use client';

import { useCareer } from '../context/CareerContext';

export default function ProfileView() {
  const {
    authUser,
    userProfile,
    setActiveView,
    setOnboardingStep,
  } = useCareer();

  if (!authUser) {
    return (
      <section style={{ maxWidth: 800, margin: '60px auto', padding: 24 }}>
        <h1>My Profile</h1>
        <p>Please log in to view your profile.</p>
        <button onClick={() => setActiveView('auth')}>
          Sign Up / Log In
        </button>
      </section>
    );
  }

  const handleEditProfile = () => {
    setOnboardingStep(6);
    setActiveView('onboarding');
  };

  return (
    <section style={{ maxWidth: 900, margin: '50px auto', padding: 24 }}>
      <h1>My Profile</h1>
      <p>Your personal career exploration profile.</p>

      <div
        style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: 16,
          padding: 28,
          marginTop: 24,
        }}
      >
        <h2>Account Information</h2>
        <p><strong>Email:</strong> {authUser.email}</p>
        <p>
          <strong>Username:</strong>{' '}
          {authUser.email?.split('@')[0]}
        </p>
      </div>

      <div
        style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: 16,
          padding: 28,
          marginTop: 24,
        }}
      >
        <h2>My Career Exploration</h2>

        <p>
          <strong>Career Stage:</strong>{' '}
          {userProfile.careerStage}
        </p>

        <p>
          <strong>Interests:</strong>{' '}
          {userProfile.interests.length > 0
            ? userProfile.interests.join(', ')
            : 'Not selected yet'}
        </p>

        <p>
          <strong>Skills:</strong>{' '}
          {Object.entries(userProfile.skills)
            .filter(([, level]) => level > 0)
            .map(([skill]) => skill)
            .join(', ') || 'Not selected yet'}
        </p>

        <p>
          <strong>Goals:</strong>{' '}
          {userProfile.goals.length > 0
            ? userProfile.goals.join(', ')
            : 'Not selected yet'}
        </p>

        <button
          onClick={handleEditProfile}
          style={{
            marginTop: 20,
            padding: '12px 20px',
            backgroundColor: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: 10,
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          Edit My Career Preferences
        </button>
      </div>
    </section>
  );
}
