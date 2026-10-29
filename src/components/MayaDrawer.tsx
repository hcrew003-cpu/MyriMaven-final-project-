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

export default function MayaDrawer() {
  const { isMayaOpen, setIsMayaOpen, mayaPrompt, selectedCareer, userProfile, authUser, whatIfToggles, whatIfPreferences } = useCareer();
  const [inputVal, setInputVal] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const pendingRef = useRef(false);
  const lastPromptRef = useRef('');
  const messagesRef = useRef<ChatMessage[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);
  useEffect(() => {
    setMessages([{ id: 'welcome', sender: 'maya', text: `Hi${userProfile.name ? ` ${userProfile.name}` : ''}! I'm Maya, your AI career exploration guide. What would you like to explore?` }]);
    lastPromptRef.current = '';
  }, [authUser?.id]);

  async function handleUserSubmit(queryText: string) {
    const question = queryText.trim();
    if (!question || pendingRef.current) return;
    pendingRef.current = true;
    setLoading(true);
    setInputVal('');
    const history = messagesRef.current.filter((message) => message.id !== 'welcome')
      .slice(-8).map((message) => ({ role: message.sender === 'maya' ? 'assistant' : 'user', content: message.text }));
    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, sender: 'user', text: question }]);

    try {
      const { data: { session } } = await getSupabaseClient().auth.getSession();
      if (!session?.access_token) throw new Error('Please sign in to chat with Maya.');
      const response = await fetch('/api/maya', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({
          question,
          history,
          context: {
            profile: { name: userProfile.name, careerStage: userProfile.careerStage, interests: userProfile.interests, skills: userProfile.skills, preferences: userProfile.preferences, goals: userProfile.goals },
            selectedCareer: { title: selectedCareer.title, description: selectedCareer.description, skillsUsed: selectedCareer.skillsUsed, skillsToDevelop: selectedCareer.skillsToDevelop, workEnvironment: selectedCareer.workEnvironment, watchOut: selectedCareer.watchOut },
            scenario: { priorities: whatIfToggles, preferences: whatIfPreferences },
          },
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not reach Maya.');
      setMessages((prev) => [...prev, { id: `a-${Date.now()}`, sender: 'maya', text: result.answer }]);
    } catch (error) {
      setMessages((prev) => [...prev, { id: `e-${Date.now()}`, sender: 'maya', text: error instanceof Error ? error.message : 'Something went wrong. Please try again.' }]);
    } finally {
      pendingRef.current = false;
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isMayaOpen && mayaPrompt && mayaPrompt !== lastPromptRef.current) {
      lastPromptRef.current = mayaPrompt;
      void handleUserSubmit(mayaPrompt);
    }
  }, [isMayaOpen, mayaPrompt]);

  const samplePrompts = [
    `What's an average day like for a ${selectedCareer.title}?`,
    `What are the honest downsides or stress points?`,
    `How could my skills fit this career?`,
    `How might changing my work preferences affect this career?`,
  ];

  return (
    <>
      <button onClick={() => setIsMayaOpen(true)} className="maya-floating-btn" aria-label="Open Maya AI Guide">
        <Sparkles size={20} className="sparkle-icon" /><span>Ask Maya</span>
      </button>
      {isMayaOpen && (
        <div className="maya-drawer-overlay" onClick={() => setIsMayaOpen(false)}>
          <div className="maya-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="maya-header">
              <div className="maya-header-info">
                <div className="maya-avatar"><Sparkles size={22} /></div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--dark-slate)' }}>Maya <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>· AI Career Guide</span></h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Personalized career exploration</p>
                </div>
              </div>
              <button onClick={() => setIsMayaOpen(false)} className="close-btn" aria-label="Close"><X size={20} /></button>
            </div>
            <div className="maya-messages" aria-live="polite">
              {messages.map((msg) => <div key={msg.id} className={`message-bubble ${msg.sender === 'maya' ? 'message-assistant' : 'message-user'}`}>{msg.text}</div>)}
              {loading && <div className="message-bubble message-assistant">Maya is thinking…</div>}
              <div ref={bottomRef} />
            </div>
            <div className="maya-prompts">
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>SUGGESTED QUESTIONS:</span>
              {samplePrompts.map((prompt, index) => <button key={index} disabled={loading} className="maya-prompt-chip" onClick={() => void handleUserSubmit(prompt)}>{prompt}</button>)}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); void handleUserSubmit(inputVal); }} className="maya-input-bar">
              <input type="text" value={inputVal} onChange={(e) => setInputVal(e.target.value)} placeholder="Ask Maya about careers, tradeoffs..." className="maya-input" disabled={loading} />
              <button type="submit" disabled={!inputVal.trim() || loading} className="maya-send-btn" aria-label="Send"><Send size={18} /></button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
