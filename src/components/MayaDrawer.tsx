'use client';

import React, { useState, useEffect } from 'react';
import { useCareer } from '../context/CareerContext';
import { Sparkles, X, Send, Bot, User } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'maya' | 'user';
  text: string;
}

export default function MayaDrawer() {
  const {
    isMayaOpen,
    setIsMayaOpen,
    mayaPrompt,
    selectedCareer,
    userProfile,
  } = useCareer();

  const [inputVal, setInputVal] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'maya',
      text: `Hi ${userProfile.name}! I'm Maya, your career exploration guide. I can help untangle day-to-day realities, compare career paths, or explain why certain roles match your profile. What are you wondering about today?`,
    },
  ]);

  // When a prompt is passed from another screen, trigger it
  useEffect(() => {
    if (mayaPrompt) {
      handleUserSubmit(mayaPrompt);
    }
  }, [mayaPrompt]);

  const handleUserSubmit = (queryText: string) => {
    if (!queryText.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: queryText,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');

    // Generate smart response from Maya
    setTimeout(() => {
      let reply = '';
      const q = queryText.toLowerCase();

      if (q.includes('average day') || q.includes('tuesday') || q.includes('day-to-day')) {
        reply = `In a typical week as a ${selectedCareer.title}, your mornings usually kick off with cross-functional standups or briefs with team leads. Mid-day is split between hands-on execution (campaign strategy, creative reviews) and unblocking teammates. The key tradeoff: urgent shifts can interrupt planned deep work, so resilience is key!`;
      } else if (q.includes('stress') || q.includes('burnout') || q.includes('watch out')) {
        reply = `Great question to look into early. For ${selectedCareer.title}, the main source of friction is ${selectedCareer.watchOut.toLowerCase()} If you set boundaries around offline hours and clarify deliverables with stakeholders, it's very manageable!`;
      } else if (q.includes('compare') || q.includes('product design')) {
        reply = `Compared to Product Design, ${selectedCareer.title} leans heavier on broad market reach, messaging, and commercial metrics, whereas Product Design is deeply focused on granular user interaction patterns and wireframing. Both share creative collaboration!`;
      } else if (q.includes('why') || q.includes('score') || q.includes('match')) {
        reply = `${selectedCareer.title} scored ${selectedCareer.baseMatch}% for you because your Communication strength is exceptional (5/5) and your Organization score (5/5) provides the backbone this role requires. It matches your desire for collaborative leadership!`;
      } else if (q.includes('what-if') || q.includes('balance')) {
        reply = `When you prioritize Work-Life Balance and Helping Others in the What-If Sandbox, careers in Education (Teacher: 90%) and Healthcare (Counsellor: 93%) jump right to the top because their structured bounds and community mission align with your values!`;
      } else {
        reply = `That's a thoughtful question about ${selectedCareer.title}. Based on your profile strengths in Communication and Organization, you'd find high leverage here. Would you like to see how this role compares to your other saved careers, or test it in the What-If Sandbox?`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'maya',
          text: reply,
        },
      ]);
    }, 600);
  };

  const samplePrompts = [
    `What's an average day like for a ${selectedCareer.title}?`,
    `What are the honest downsides or stress points?`,
    `How does this role fit my Communication strength?`,
    `Why did my match score change in the Sandbox?`,
  ];

  return (
    <>
      {/* Floating Maya Launch Button */}
      <button
        onClick={() => setIsMayaOpen(true)}
        className="maya-floating-btn"
        aria-label="Open Maya AI Guide"
      >
        <Sparkles size={20} className="sparkle-icon" />
        <span>Ask Maya</span>
      </button>

      {/* Slide-out Drawer */}
      {isMayaOpen && (
        <div className="maya-drawer-overlay" onClick={() => setIsMayaOpen(false)}>
          <div className="maya-drawer" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="maya-header">
              <div className="maya-header-info">
                <div className="maya-avatar">
                  <Sparkles size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--dark-slate)' }}>
                    Maya <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>· AI Career Guide</span>
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Objective, nuanced advice for your exploration
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

            {/* Chat Messages */}
            <div className="maya-messages">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`message-bubble ${
                    msg.sender === 'maya' ? 'message-assistant' : 'message-user'
                  }`}
                >
                  {msg.text}
                </div>
              ))}
            </div>

            {/* Quick Context Prompt Chips */}
            <div className="maya-prompts">
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                SUGGESTED QUESTIONS:
              </span>
              {samplePrompts.map((p, idx) => (
                <button
                  key={idx}
                  className="maya-prompt-chip"
                  onClick={() => handleUserSubmit(p)}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Chat Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUserSubmit(inputVal);
              }}
              className="maya-input-bar"
            >
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Ask Maya anything about careers, tradeoffs..."
                className="maya-input"
              />
              <button
                type="submit"
                disabled={!inputVal.trim()}
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
