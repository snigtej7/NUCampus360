import { useState, useEffect, useRef } from 'react';

const QUICK_PROMPTS = [
  "Where's the library?",
  "Where do I go on day 1?",
  "Study spaces available?",
  "Food & dining options?",
  "How to get to campus?",
  "Co-op program info?",
  "Parking on campus?",
  "Counseling services?"
];

const INITIAL_MSG = {
  role: 'ai',
  text: "Hi! I'm Husky, your AI campus guide for Northeastern Seattle 🐾\n\nI can help you find buildings, check hours, learn about programs, and navigate campus life. What would you like to know?"
};

export default function ChatPanel({ apiBase, pendingQuestion, onPendingHandled }) {
  const [messages, setMessages] = useState([INITIAL_MSG]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [quicksVisible, setQuicksVisible] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const historyRef = useRef([]); // tracks OpenAI-format history for the API

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle question injected from map popup
  useEffect(() => {
    if (pendingQuestion) {
      sendMessage(pendingQuestion);
      onPendingHandled();
    }
  }, [pendingQuestion]);

  async function sendMessage(text) {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');
    setQuicksVisible(false);

    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    historyRef.current = [...historyRef.current, { role: 'user', content: msg }];
    setLoading(true);

    try {
      const res = await fetch(`${apiBase}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: historyRef.current.slice(-12) })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Request failed');

      const reply = data.reply;
      setMessages(prev => [...prev, { role: 'ai', text: reply }]);
      historyRef.current = [...historyRef.current, { role: 'assistant', content: reply }];
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'ai',
        text: `Sorry, I'm having trouble connecting right now. ${err.message || 'Please try again in a moment.'}`
      }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        padding: '15px 18px',
        borderBottom: '1px solid var(--panel-border)',
        background: 'var(--charcoal)',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 3 }}>
          <div style={{
            width: 32, height: 32,
            background: 'var(--red)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, flexShrink: 0
          }}>🐾</div>
          <div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 16, color: 'var(--white)' }}>
              Husky
            </div>
            <div style={{ fontSize: 11, color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{
                width: 6, height: 6, background: 'var(--green)',
                borderRadius: '50%', display: 'inline-block',
                boxShadow: '0 0 5px var(--green)', animation: 'pulse 2s infinite'
              }} />
              AI Campus Guide · Online
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto',
        padding: '14px 14px 8px',
        display: 'flex', flexDirection: 'column', gap: 10
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex',
            gap: 9,
            flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
            animation: 'fadeUp 0.25s ease'
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, marginTop: 2,
              background: msg.role === 'ai' ? 'var(--red)' : '#2a2a2a'
            }}>
              {msg.role === 'ai' ? '🐾' : '👤'}
            </div>
            <div style={{
              maxWidth: '82%',
              padding: '9px 13px',
              borderRadius: 12,
              fontSize: '13.5px',
              lineHeight: 1.55,
              whiteSpace: 'pre-wrap',
              ...(msg.role === 'ai'
                ? { background: 'var(--charcoal)', border: '1px solid var(--panel-border)', color: 'var(--text)', borderTopLeftRadius: 3 }
                : { background: 'var(--red)', color: 'white', borderTopRightRadius: 3 })
            }}>
              {msg.text}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div style={{ display: 'flex', gap: 9, animation: 'fadeUp 0.25s ease' }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'var(--red)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 13, flexShrink: 0
            }}>🐾</div>
            <div style={{
              padding: '12px 16px',
              background: 'var(--charcoal)',
              border: '1px solid var(--panel-border)',
              borderRadius: 12, borderTopLeftRadius: 3,
              display: 'flex', gap: 5, alignItems: 'center'
            }}>
              {[0, 0.2, 0.4].map((delay, i) => (
                <div key={i} style={{
                  width: 6, height: 6,
                  background: 'var(--text-dim)',
                  borderRadius: '50%',
                  animation: `typingBounce 1.2s ${delay}s infinite`
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick prompts */}
      {quicksVisible && (
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 6,
          padding: '0 14px 10px', flexShrink: 0
        }}>
          {QUICK_PROMPTS.map(p => (
            <button key={p} onClick={() => sendMessage(p)} style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 12, padding: '5px 11px',
              borderRadius: 20,
              border: '1px solid var(--panel-border)',
              background: 'none', color: 'var(--text-dim)',
              cursor: 'pointer', transition: 'all 0.2s',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={e => { e.target.style.borderColor = 'var(--red)'; e.target.style.color = 'var(--text)'; e.target.style.background = 'var(--red-glow)'; }}
            onMouseLeave={e => { e.target.style.borderColor = 'var(--panel-border)'; e.target.style.color = 'var(--text-dim)'; e.target.style.background = 'none'; }}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input row */}
      <div style={{
        padding: '10px 12px',
        borderTop: '1px solid var(--panel-border)',
        background: 'var(--charcoal)',
        display: 'flex', gap: 8, alignItems: 'flex-end',
        flexShrink: 0
      }}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => {
            setInput(e.target.value);
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
          }}
          onKeyDown={handleKey}
          placeholder="Ask about any building, program, or resource…"
          rows={1}
          style={{
            flex: 1,
            background: 'var(--panel)',
            border: '1px solid var(--panel-border)',
            borderRadius: 10,
            padding: '9px 13px',
            color: 'var(--text)',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '13.5px',
            resize: 'none',
            outline: 'none',
            maxHeight: 120,
            lineHeight: 1.45,
            transition: 'border-color 0.2s'
          }}
          onFocus={e => e.target.style.borderColor = 'var(--red)'}
          onBlur={e => e.target.style.borderColor = 'var(--panel-border)'}
        />
        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          style={{
            width: 40, height: 40, flexShrink: 0,
            background: loading || !input.trim() ? 'var(--muted)' : 'var(--red)',
            border: 'none', borderRadius: 10,
            cursor: loading || !input.trim() ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.2s'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
