import React, { useState, useEffect } from 'react';
import { Brain, Heart, Target, Zap, MessageSquare, Save, CheckCircle, Trash2, BookOpen, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MindsetMirror = () => {
  const [reflection, setReflection] = useState('');
  const [mood, setMood] = useState('Neutral');
  const [showSuccess, setShowSuccess] = useState(false);
  const [history, setHistory] = useState([]);

  // Load history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('zentrader_mindset_history');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const handleSave = () => {
    if (!reflection.trim()) return;

    const newEntry = {
      id: Date.now(),
      reflection: reflection.trim(),
      mood,
      timestamp: new Date().toISOString()
    };

    const updatedHistory = [newEntry, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('zentrader_mindset_history', JSON.stringify(updatedHistory));

    // Clear the textarea after saving
    setReflection('');
    setMood('Neutral');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleDelete = (id) => {
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    localStorage.setItem('zentrader_mindset_history', JSON.stringify(updated));
  };

  const mindsetChecklist = [
    "I am not trading with money I can't afford to lose.",
    "I am not looking for revenge after a loss.",
    "I am detached from the outcome of a single trade.",
    "I am following my rules, not my emotions.",
  ];

  const moods = [
    { label: 'Confident', icon: Target, color: 'var(--success)' },
    { label: 'Fearful', icon: Brain, color: 'var(--warning)' },
    { label: 'Aggressive', icon: Zap, color: 'var(--danger)' },
    { label: 'Calm', icon: Heart, color: 'var(--primary)' },
  ];

  const moodColor = (m) => {
    const found = moods.find(x => x.label === m);
    return found ? found.color : 'var(--text-muted)';
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <header>
        <h2 className="text-gradient">Mindset Journal</h2>
        <p style={{ color: 'var(--text-muted)' }}>Write your daily reflection. Align your mental state before entering the market.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '30px', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>

          {/* Mood Selection */}
          <section className="glass-card" style={{ padding: '25px' }}>
            <h4 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <MessageSquare size={18} color="var(--primary)" />
              How are you feeling right now?
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
              {moods.map((m) => (
                <button
                  key={m.label}
                  onClick={() => setMood(m.label)}
                  style={{
                    padding: '20px 10px',
                    borderRadius: '12px',
                    border: '1px solid',
                    borderColor: mood === m.label ? m.color : 'var(--border)',
                    background: mood === m.label ? `${m.color}18` : 'transparent',
                    color: mood === m.label ? m.color : 'var(--text-muted)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <m.icon size={24} />
                  <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>{m.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Daily Reflection Input */}
          <section className="glass-card" style={{ padding: '25px' }}>
            <h4 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <BookOpen size={18} color="var(--primary)" />
              Daily Reflection
            </h4>
            <textarea
              placeholder="What is your main focus today? How will you handle a loss? What did you learn from yesterday?"
              style={{
                width: '100%',
                minHeight: '180px',
                fontSize: '0.95rem',
                lineHeight: '1.7',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                color: 'var(--text-main)',
                padding: '15px',
                outline: 'none',
                resize: 'vertical'
              }}
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '15px' }}>
              <button
                className="btn-primary"
                onClick={handleSave}
                disabled={!reflection.trim()}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 30px', opacity: reflection.trim() ? 1 : 0.4 }}
              >
                <Save size={18} />
                Save Reflection
              </button>

              <AnimatePresence>
                {showSuccess && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    style={{ color: 'var(--success)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <CheckCircle size={16} />
                    Saved! Textarea cleared.
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>

          {/* Past Reflections History */}
          {history.length > 0 && (
            <section className="glass-card" style={{ padding: '25px' }}>
              <h4 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Calendar size={18} color="var(--accent)" />
                Past Reflections
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '10px', marginLeft: '5px' }}>
                  {history.length} entries
                </span>
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {history.map((entry, i) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    style={{
                      padding: '18px 20px',
                      background: 'rgba(255,255,255,0.02)',
                      borderRadius: '12px',
                      border: '1px solid var(--border)',
                      borderLeft: `3px solid ${moodColor(entry.mood)}`,
                      position: 'relative'
                    }}
                  >
                    {/* Header row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          📅 {new Date(entry.timestamp).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                          🕐 {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span style={{
                          fontSize: '0.65rem',
                          fontWeight: 'bold',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          background: `${moodColor(entry.mood)}18`,
                          color: moodColor(entry.mood)
                        }}>
                          {entry.mood}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--danger)', opacity: 0.4, cursor: 'pointer', padding: '4px' }}
                        title="Delete entry"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    {/* Content */}
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                      {entry.reflection}
                    </p>
                  </motion.div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          {/* Mindset Pillars */}
          <section className="glass" style={{ padding: '25px' }}>
            <h4 style={{ marginBottom: '20px', color: 'var(--primary)' }}>Mindset Pillars</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {mindsetChecklist.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', fontSize: '0.9rem' }}>
                  <div style={{ minWidth: '22px', height: '22px', borderRadius: '50%', border: '2px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', flexShrink: 0, marginTop: '1px' }}>{i + 1}</div>
                  <p style={{ color: 'var(--text-main)', lineHeight: '1.5' }}>{item}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Motivation Quote */}
          <section className="glass-card" style={{ padding: '25px', background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.08) 0%, rgba(129, 140, 248, 0.08) 100%)' }}>
            <p style={{ fontStyle: 'italic', color: 'var(--text-main)', marginBottom: '10px', lineHeight: '1.6' }}>
              "The goal of a successful trader is to make the best trades. Money is secondary."
            </p>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>— Alexander Elder</span>
          </section>

          {/* Stats */}
          {history.length > 0 && (
            <section className="glass-card" style={{ padding: '25px' }}>
              <h4 style={{ marginBottom: '15px', fontSize: '0.9rem' }}>Journal Stats</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Total entries</span>
                  <span style={{ fontWeight: 'bold' }}>{history.length}</span>
                </div>
                {moods.map(m => {
                  const count = history.filter(h => h.mood === m.label).length;
                  if (count === 0) return null;
                  return (
                    <div key={m.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ color: m.color }}>{m.label}</span>
                      <span style={{ fontWeight: 'bold' }}>{count}x</span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default MindsetMirror;
