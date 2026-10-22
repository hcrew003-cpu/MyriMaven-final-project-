
'use client';

import { useCareer } from '../context/CareerContext';

export default function ProfileView() {
  const { authUser, userProfile, setActiveView } = useCareer();

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
          Your interests, strengths, skills, and career preferences
          will appear here once we connect your onboarding information
          to your account.
        </p>

        <button onClick={() => setActiveView('onboarding')}>
          Edit My Career Preferences
        </button>
      </div>
    </section>
  );
}
