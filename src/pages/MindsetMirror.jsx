import React, { useState, useEffect } from 'react';
import { Brain, Heart, Target, Zap, MessageSquare, Save, CheckCircle, Trash2, BookOpen, Calendar, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import api from '../services/api';

const MindsetMirror = () => {
  const [reflection, setReflection] = useState('');
  const [mood, setMood] = useState('Neutral');
  const [showSuccess, setShowSuccess] = useState(false);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/api/mindset');
      setHistory(res.data);
    } catch (err) {
      console.error('Error fetching mindset history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleSave = async () => {
    if (!reflection.trim()) return;

    try {
      await api.post('/api/mindset', { reflection, mood });
      setReflection('');
      setMood('Neutral');
      setShowSuccess(true);
      fetchHistory();
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      alert('Error saving reflection');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Ma hubtaa inaad tirtirto reflection-kan?')) return;
    try {
      await api.delete(`/api/mindset/${id}`);
      fetchHistory();
    } catch (err) {
      alert('Error deleting reflection');
    }
  };

  const moods = [
    { label: 'Confident', icon: Target, color: '#10b981' },
    { label: 'Fearful', icon: Brain, color: '#f59e0b' },
    { label: 'Aggressive', icon: Zap, color: '#ef4444' },
    { label: 'Calm', icon: Heart, color: '#3b82f6' },
  ];

  const moodColor = (m) => {
    const found = moods.find(x => x.label === m);
    return found ? found.color : 'var(--text-muted)';
  };

  // Prepare chart data
  const moodCounts = history.reduce((acc, curr) => {
    acc[curr.mood] = (acc[curr.mood] || 0) + 1;
    return acc;
  }, {});

  const chartData = moods.map(m => ({
    name: m.label,
    value: moodCounts[m.label] || 0,
    color: m.color
  })).filter(d => d.value > 0);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <header>
        <h2 className="text-gradient">Mindset Mirror</h2>
        <p style={{ color: 'var(--text-muted)' }}>Analyze your psychology. Your mental state is 80% of your trading success.</p>
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
              placeholder="What is your main focus today? How will you handle a loss?"
              style={{
                width: '100%',
                minHeight: '120px',
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
                    Insight Saved!
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>

          {/* Past Reflections History */}
          <section className="glass-card" style={{ padding: '25px' }}>
            <h4 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Calendar size={18} color="var(--accent)" />
              Psychology History
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {history.map((entry, i) => (
                <div
                  key={entry._id}
                  style={{
                    padding: '18px 20px',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: '12px',
                    border: '1px solid var(--border)',
                    borderLeft: `4px solid ${moodColor(entry.mood)}`,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {new Date(entry.timestamp).toLocaleDateString()}
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
                      onClick={() => handleDelete(entry._id)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--danger)', opacity: 0.4, cursor: 'pointer' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.6' }}>
                    {entry.reflection}
                  </p>
                </div>
              ))}
              {history.length === 0 && !loading && (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>No reflections yet. Start journaling!</p>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar Analytics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          <section className="glass-card" style={{ padding: '25px' }}>
            <h4 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <TrendingUp size={18} color="var(--success)" />
              Mood Distribution
            </h4>
            <div style={{ height: '200px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
               {chartData.map(d => (
                 <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: d.color }}></div>
                    <span style={{ color: 'var(--text-muted)' }}>{d.name}:</span>
                    <span style={{ fontWeight: 'bold' }}>{d.value}</span>
                 </div>
               ))}
            </div>
          </section>

          <section className="glass" style={{ padding: '25px' }}>
            <h4 style={{ marginBottom: '15px', color: 'var(--primary)' }}>Mindset Tip</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              "The market is a device for transferring money from the impatient to the patient."
              <br /><br />
              Observe your moods. Aggressive moods often lead to over-trading. Calm moods lead to better execution.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default MindsetMirror;
