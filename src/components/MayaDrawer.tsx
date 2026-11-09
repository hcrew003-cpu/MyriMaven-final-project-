
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useCareer } from '../context/CareerContext';
import { getSupabaseClient } from '../lib/supabase';
import { Sparkles, X, Send } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'maya' | 'user';
  text: string;
}

const isOnetCode = (id: string) => /^\d{2}-\d{4}\.\d{2}$/.test(id);

export default function MayaDrawer() {
  const {
    isMayaOpen,
    setIsMayaOpen,
    mayaPrompt,
    selectedCareerId,
    selectedCareer,
    selectedOnetCareer,
    onetCareerLoading,
    onetCareerError,
    activeView,
    userProfile,
    authUser,
    whatIfToggles,
    whatIfPreferences,
  } = useCareer();

  const [inputVal, setInputVal] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const pendingRef = useRef(false);
  const lastPromptRef = useRef('');
  const messagesRef = useRef<ChatMessage[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const viewingCareer = activeView === 'detail';
  const viewingOnetCareer = viewingCareer && isOnetCode(selectedCareerId);

  const onetCareerReady =
    viewingOnetCareer &&
    !onetCareerLoading &&
    selectedOnetCareer?.id === selectedCareerId;

  const currentCareerTitle = viewingCareer
    ? viewingOnetCareer
      ? onetCareerReady
        ? selectedOnetCareer.title
        : null
      : selectedCareer.id === selectedCareerId
        ? selectedCareer.title
        : null
    : null;

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        sender: 'maya',
        text: `Hi${userProfile.name ? ` ${userProfile.name}` : ''}! I'm Maya, your AI career exploration guide. What would you like to explore?`,
      },
    ]);
    lastPromptRef.current = '';
  }, [authUser?.id]);

  async function handleUserSubmit(queryText: string) {
    const question = queryText.trim();

    if (!question || pendingRef.current) return;

    if (viewingOnetCareer && !onetCareerReady) {
      if (onetCareerLoading) {
        setMessages((prev) => [
          ...prev,
          {
            id: `notice-${Date.now()}`,
            sender: 'maya',
            text: 'I am still loading this career. Please try again in a moment.',
          },
        ]);
      } else {
        setMessages((prev) => [
  ...prev,
  {
    id: `notice-${Date.now()}`,
    sender: 'maya',
    text: 'I could not load the career details right now. Please try again shortly.',
  },
]);
      }
      return;
    }

    pendingRef.current = true;
    setLoading(true);
    setInputVal('');

    const history = messagesRef.current
      .filter((message) => message.id !== 'welcome')
      .slice(-8)
      .map((message) => ({
        role: message.sender === 'maya' ? 'assistant' : 'user',
        content: message.text,
      }));

    setMessages((prev) => [
      ...prev,
      {
        id: `u-${Date.now()}`,
        sender: 'user',
        text: question,
      },
    ]);

    try {
      const {
        data: { session },
      } = await getSupabaseClient().auth.getSession();

      if (!session?.access_token) {
        throw new Error('Please sign in to chat with Maya.');
      }

      let careerContext: Record<string, unknown> | null = null;

      if (viewingOnetCareer && onetCareerReady && selectedOnetCareer) {
        careerContext = {
          id: selectedOnetCareer.id,
          source: 'O*NET',
          title: selectedOnetCareer.title,
          description: selectedOnetCareer.description,
          tasks: selectedOnetCareer.tasks?.task ?? [],
          skills: selectedOnetCareer.skills?.element ?? [],
          knowledge: selectedOnetCareer.knowledge?.element ?? [],
          education: selectedOnetCareer.education?.response ?? [],
          relatedOccupations:
            selectedOnetCareer.relatedOccupations?.occupation ?? [],
          workContext: selectedOnetCareer.workContext ?? null,
          workStyles: selectedOnetCareer.workStyles ?? null,
        };
      } else if (
        viewingCareer &&
        !viewingOnetCareer &&
        selectedCareer.id === selectedCareerId
      ) {
        careerContext = {
          id: selectedCareer.id,
          source: 'Prototype',
          title: selectedCareer.title,
          description: selectedCareer.description,
          skillsUsed: selectedCareer.skillsUsed,
          skillsToDevelop: selectedCareer.skillsToDevelop,
          workEnvironment: selectedCareer.workEnvironment,
          watchOut: selectedCareer.watchOut,
        };
      }

      const response = await fetch('/api/maya', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          question,
          history,
          context: {
            profile: {
              name: userProfile.name,
              careerStage: userProfile.careerStage,
              interests: userProfile.interests,
              skills: userProfile.skills,
              preferences: userProfile.preferences,
              goals: userProfile.goals,
            },
            selectedCareer: careerContext,
            scenario: {
              priorities: whatIfToggles,
              preferences: whatIfPreferences,
            },
          },
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Could not reach Maya.');
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          sender: 'maya',
          text: result.answer,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: `e-${Date.now()}`,
          sender: 'maya',
          text:
            error instanceof Error
              ? error.message
              : 'Something went wrong. Please try again.',
        },
      ]);
    } finally {
      pendingRef.current = false;
      setLoading(false);
    }
  }

  useEffect(() => {
    if (
      isMayaOpen &&
      mayaPrompt &&
      mayaPrompt !== lastPromptRef.current
    ) {
      if (viewingOnetCareer && !onetCareerReady) {
        return;
      }

      lastPromptRef.current = mayaPrompt;
      void handleUserSubmit(mayaPrompt);
    }
  }, [
    isMayaOpen,
    mayaPrompt,
    viewingOnetCareer,
    onetCareerReady,
  ]);

  const samplePrompts = currentCareerTitle
    ? [
        `What's an average day like for a ${currentCareerTitle}?`,
        'What are the honest downsides or stress points?',
        'How could my skills fit this career?',
        'How might changing my work preferences affect this career?',
      ]
    : [
        'What careers might match my interests and skills?',
        'How can I explore career options if I am undecided?',
        'What skills should I focus on developing?',
        'How might my work preferences affect my career options?',
      ];

  return (
    <>
      <button
        onClick={() => setIsMayaOpen(true)}
        className="maya-floating-btn"
        aria-label="Open Maya AI Guide"
      >
        <Sparkles size={20} className="sparkle-icon" />
        <span>Ask Maya</span>
      </button>

      {isMayaOpen && (
        <div
          className="maya-drawer-overlay"
          onClick={() => setIsMayaOpen(false)}
        >
          <div
            className="maya-drawer"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="maya-header">
              <div className="maya-header-info">
                <div className="maya-avatar">
                  <Sparkles size={22} />
                </div>
                <div>
                  <h3
                    style={{
                      fontSize: '1.05rem',
                      fontWeight: 700,
                      color: 'var(--dark-slate)',
                    }}
                  >
                    Maya{' '}
                    <span
                      style={{
                        fontSize: '0.8rem',
                        color: 'var(--primary)',
                        fontWeight: 600,
                      }}
                    >
                      · AI Career Guide
                    </span>
                  </h3>
                  <p
                    style={{
                      fontSize: '0.8rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    Personalized career exploration
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsMayaOpen(false)}
                className="close-btn"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="maya-messages" aria-live="polite">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`message-bubble ${
                    msg.sender === 'maya'
                      ? 'message-assistant'
                      : 'message-user'
                  }`}
                >
                  {msg.text}
                </div>
              ))}

              {loading && (
                <div className="message-bubble message-assistant">
                  Maya is thinking…
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            <div className="maya-prompts">
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                }}
              >
                SUGGESTED QUESTIONS:
              </span>

              {samplePrompts.map((prompt, index) => (
                <button
                  key={index}
                  disabled={
                    loading ||
                    (viewingOnetCareer && !onetCareerReady)
                  }
                  className="maya-prompt-chip"
                  onClick={() => void handleUserSubmit(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>

            {viewingOnetCareer && onetCareerError && (
              <p style={{ padding: '0 1rem', fontSize: '0.8rem' }}>
                {onetCareerError}
              </p>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleUserSubmit(inputVal);
              }}
              className="maya-input-bar"
            >
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Ask Maya about careers, tradeoffs..."
                className="maya-input"
                disabled={
                  loading ||
                  (viewingOnetCareer && !onetCareerReady)
                }
              />

              <button
                type="submit"
                disabled={
                  !inputVal.trim() ||
                  loading ||
                  (viewingOnetCareer && !onetCareerReady)
                }
                className="maya-send-btn"
                aria-label="Send"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
