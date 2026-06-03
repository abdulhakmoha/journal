import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Save, 
  Trash2, 
  Plus, 
  Target, 
  ShieldCheck, 
  Activity, 
  Brain, 
  FlaskConical, 
  Globe, 
  Clock, 
  Coffee,
  Layout,
  ChevronDown,
  ChevronUp,
  GripVertical,
  FlaskRound,
  X,
  Briefcase,
  Sparkles,
  Edit3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Smart name suggestion engine
const generateNameSuggestions = (type, balance) => {
  const balStr = balance >= 1000 ? `${Math.round(balance/1000)}K` : `${balance}`;
  const suggestions = {
    Challenge: [
      `Phase 1 — ${balStr}`,
      `FTMO ${balStr} Challenge`,
      `FundedPips ${balStr} Pro`,
      `Alpha Challenge ${balStr}`,
      `Evaluation ${balStr}`,
      `The Climb — ${balStr}`,
    ],
    Funded: [
      `Funded Live ${balStr}`,
      `Capital Deploy ${balStr}`,
      `Live Account — ${balStr}`,
      `Apex Funded ${balStr}`,
      `Elite Trader ${balStr}`,
      `Pro Funded ${balStr}`,
    ],
    Personal: [
      `Personal ${balStr}`,
      `My Capital ${balStr}`,
      `Self-Funded ${balStr}`,
      `Solo Trader ${balStr}`,
      `Private Account ${balStr}`,
      `Real Money ${balStr}`,
    ],
    Backtesting: [
      `Strategy Lab ${balStr}`,
      `Research Desk ${balStr}`,
      `Sim Account ${balStr}`,
      `Backtest Vault ${balStr}`,
      `Edge Lab ${balStr}`,
      `Paper Trading ${balStr}`,
    ],
  };
  return suggestions[type] || suggestions.Personal;
};


const Settings = ({ user, onUpdateProfile, accounts, onAddAccount, onDeleteAccount, onUpdateAccount }) => {
  const [newRule, setNewRule] = useState('');
  const [profile, setProfile] = useState({
    name: user?.name || '',
    customRules: user?.customRules || [],
    formFields: user?.formFields || [],
    backtestFields: user?.backtestFields || []
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [accForm, setAccForm] = useState({ name: '', target: 8, type: 'Challenge', initialBalance: 10000, website: '', profitSplit: '' });
  const [editingAccId, setEditingAccId] = useState(null);
  const [editAccForm, setEditAccForm] = useState(null);
  const [portfolioTab, setPortfolioTab] = useState('live');
  const [newOption, setNewOption] = useState('');
  const [newBTOption, setNewBTOption] = useState('');
  const [newFieldName, setNewFieldName] = useState('');
  const [newBTFieldName, setNewBTFieldName] = useState('');
  const [activeFieldIdx, setActiveFieldIdx] = useState(null);
  const [activeBTFieldIdx, setActiveBTFieldIdx] = useState(null);

  const openAddModal = (defaultType) => {
    setAccForm({ name: '', target: 8, type: defaultType, initialBalance: 10000, website: '', profitSplit: '' });
    setShowAddModal(true);
  };

  const addAccount = () => {
    if (accForm.name.trim()) {
      onAddAccount({ ...accForm });
      setAccForm({ name: '', target: 8, type: 'Challenge', initialBalance: 10000, website: '', profitSplit: '' });
      setShowAddModal(false);
    }
  };

  const startEditing = (acc) => {
    setEditingAccId(acc._id);
    setEditAccForm({ ...acc });
  };

  const saveEdit = async () => {
    try {
      await onUpdateAccount(editingAccId, editAccForm);
      setEditingAccId(null);
    } catch (err) { console.error(err); }
  };

  const addField = (target) => {
    const name = target === 'formFields' ? newFieldName : newBTFieldName;
    const setter = target === 'formFields' ? setNewFieldName : setNewBTFieldName;
    
    if (name.trim()) {
      const updatedProfile = {
        ...profile,
        [target]: [...profile[target], { label: name.trim(), type: 'dropdown', options: [] }]
      };
      setProfile(updatedProfile);
      onUpdateProfile(updatedProfile); // Auto-save
      setter('');
    }
  };

  const removeField = (target, index) => {
    if (window.confirm(`Ma hubtaa inaad tirtirto qaybta "${profile[target][index].label}"?`)) {
      const updated = profile[target].filter((_, i) => i !== index);
      const updatedProfile = { ...profile, [target]: updated };
      setProfile(updatedProfile);
      onUpdateProfile(updatedProfile); // Auto-save
    }
  };

  const addOption = (target, fieldIdx) => {
    const val = target === 'formFields' ? newOption : newBTOption;
    const setter = target === 'formFields' ? setNewOption : setNewBTOption;

    if (val.trim()) {
      const updatedFields = [...profile[target]];
      updatedFields[fieldIdx].options = [...updatedFields[fieldIdx].options, val.trim()];
      const updatedProfile = { ...profile, [target]: updatedFields };
      setProfile(updatedProfile);
      onUpdateProfile(updatedProfile); // Auto-save
      setter('');
    }
  };

  const removeOption = (target, fieldIdx, optIdx) => {
    const updatedFields = [...profile[target]];
    updatedFields[fieldIdx].options = updatedFields[fieldIdx].options.filter((_, i) => i !== optIdx);
    const updatedProfile = { ...profile, [target]: updatedFields };
    setProfile(updatedProfile);
    onUpdateProfile(updatedProfile); // Auto-save
  };

  const saveProfile = () => {
    onUpdateProfile(profile);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="text-gradient">System Configuration</h2>
          <p style={{ color: 'var(--text-muted)' }}>Customize your professional trading arena.</p>
        </div>
        <button className="btn-primary" onClick={saveProfile} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Save size={18} />
          Save All Changes
        </button>
      </header>



      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '30px', 
        alignItems: 'start' 
      }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {/* Personal Profile */}
          <section className="glass-card" style={{ padding: '30px' }}>
            <h4 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldCheck size={18} color="var(--primary)" />
              Personal Profile
            </h4>
            <div className="input-group">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px' }}>Full Name</label>
              <input 
                type="text" 
                value={profile.name} 
                onChange={(e) => setProfile({...profile, name: e.target.value})} 
                style={{ width: '100%' }} 
              />
            </div>
          </section>

          {/* Portfolio Management - Tabbed */}
          <section className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
            {/* Section Header */}
            <div style={{ padding: '24px 28px 0 28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--primary)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '3px' }}>Manage</div>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontSize: '14px' }}>
                    <Activity size={16} color="var(--success)" />
                    Trading Portfolios
                  </h4>
                </div>
                <button 
                  className="btn-primary" 
                  onClick={() => openAddModal(portfolioTab === 'live' ? 'Challenge' : 'Backtesting')} 
                  style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Plus size={15} /> New Portfolio
                </button>
              </div>

              {/* Tabs */}
              <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {[
                  { key: 'live', label: 'Live Trading', icon: '📈', color: 'var(--success)', count: accounts.filter(a => a.type !== 'Backtesting').length },
                  { key: 'backtest', label: 'Backtesting', icon: '🔬', color: 'var(--primary)', count: accounts.filter(a => a.type === 'Backtesting').length },
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setPortfolioTab(tab.key)}
                    style={{
                      padding: '11px 20px',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: portfolioTab === tab.key ? `2px solid ${tab.color}` : '2px solid transparent',
                      color: portfolioTab === tab.key ? tab.color : 'var(--text-muted)',
                      fontWeight: portfolioTab === tab.key ? '700' : '500',
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '7px',
                      transition: 'all 0.15s ease',
                      marginBottom: '-1px',
                      letterSpacing: '0.2px'
                    }}
                  >
                    <span>{tab.icon}</span>
                    {tab.label}
                    <span style={{
                      background: portfolioTab === tab.key ? `${tab.color}22` : 'rgba(255,255,255,0.05)',
                      color: portfolioTab === tab.key ? tab.color : 'var(--text-muted)',
                      fontSize: '11px', fontWeight: '800',
                      padding: '2px 7px', borderRadius: '20px'
                    }}>{tab.count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Account List */}
            <div style={{ padding: '16px 28px 28px 28px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(() => {
                const filtered = accounts.filter(a =>
                  portfolioTab === 'live' ? a.type !== 'Backtesting' : a.type === 'Backtesting'
                );
                const accentColor = portfolioTab === 'live' ? 'var(--success)' : 'var(--primary)';
                const accentBg = portfolioTab === 'live' ? 'rgba(16,185,129,0.06)' : 'rgba(13,240,166,0.06)';

                if (filtered.length === 0) return (
                  <div style={{ textAlign: 'center', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '2rem' }}>{portfolioTab === 'live' ? '📈' : '🔬'}</span>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                      {portfolioTab === 'live' ? 'No live trading portfolios yet.' : 'No backtesting portfolios yet.'}
                    </p>
                    <button
                      className="btn-primary"
                      onClick={() => openAddModal(portfolioTab === 'live' ? 'Challenge' : 'Backtesting')}
                      style={{ fontSize: '13px', padding: '8px 18px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Plus size={14} /> Create One
                    </button>
                  </div>
                );

                return filtered.map((acc) => (
                  <div
                    key={acc._id}
                    style={{
                      padding: '16px 18px',
                      borderRadius: '12px',
                      background: editingAccId === acc._id ? accentBg : 'rgba(255,255,255,0.02)',
                      border: editingAccId === acc._id ? `1px solid ${accentColor}` : '1px solid rgba(255,255,255,0.05)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {editingAccId === acc._id ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <label style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Name</label>
                            <input type="text" value={editAccForm.name} onChange={(e) => setEditAccForm({...editAccForm, name: e.target.value})} style={{ padding: '9px 12px', fontSize: '13px' }} />
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <label style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Type</label>
                            <select value={editAccForm.type} onChange={(e) => setEditAccForm({...editAccForm, type: e.target.value})} style={{ padding: '9px 12px', fontSize: '13px' }}>
                              <option>Challenge</option>
                              <option>Funded</option>
                              <option>Personal</option>
                              <option>Backtesting</option>
                            </select>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <label style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Balance</label>
                            <input type="number" value={editAccForm.initialBalance} onChange={(e) => setEditAccForm({...editAccForm, initialBalance: e.target.value})} style={{ padding: '9px 12px', fontSize: '13px' }} />
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <label style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Target %</label>
                            <input type="number" value={editAccForm.target} onChange={(e) => setEditAccForm({...editAccForm, target: e.target.value})} style={{ padding: '9px 12px', fontSize: '13px' }} />
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <label style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Website</label>
                            <input type="text" value={editAccForm.website || ''} onChange={(e) => setEditAccForm({...editAccForm, website: e.target.value})} style={{ padding: '9px 12px', fontSize: '13px' }} placeholder="ftmo.com" />
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <label style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Split %</label>
                            <input type="text" value={editAccForm.profitSplit || ''} onChange={(e) => setEditAccForm({...editAccForm, profitSplit: e.target.value})} style={{ padding: '9px 12px', fontSize: '13px' }} placeholder="80" />
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button onClick={() => setEditingAccId(null)} style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontSize: '13px' }}>Cancel</button>
                          <button onClick={saveEdit} style={{ background: accentColor === 'var(--success)' ? 'var(--success)' : 'var(--primary)', color: '#08090a', border: 'none', borderRadius: '8px', padding: '8px 20px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>Save Changes</button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          {/* Type badge / icon */}
                          <div style={{
                            width: '38px', height: '38px', borderRadius: '10px',
                            background: accentBg,
                            border: `1px solid ${accentColor}30`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.1rem', flexShrink: 0
                          }}>
                            {acc.type === 'Challenge' ? '⚔️' : acc.type === 'Funded' ? '💰' : acc.type === 'Personal' ? '👤' : '🔬'}
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                              <span style={{ fontWeight: '700', fontSize: '14px' }}>{acc.name}</span>
                              <span style={{ fontSize: '11px', fontWeight: '700', color: accentColor, background: accentBg, padding: '2px 8px', borderRadius: '20px', border: `1px solid ${accentColor}30`, textTransform: 'uppercase' }}>{acc.type}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '11px', color: 'var(--success)', fontWeight: '700' }}>${acc.initialBalance?.toLocaleString()}</span>
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Target: <span style={{ color: accentColor }}>{acc.target}%</span></span>
                              {acc.website && <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>🌐 {acc.website}</span>}
                              {acc.profitSplit && <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Split: {acc.profitSplit}%</span>}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <button onClick={() => startEditing(acc)} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', color: 'var(--text-muted)', padding: '7px 10px', cursor: 'pointer', display: 'flex' }}>
                            <Edit3 size={14} />
                          </button>
                          <button onClick={() => onDeleteAccount(acc._id)} style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '8px', color: 'var(--danger)', padding: '7px 10px', cursor: 'pointer', display: 'flex' }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ));
              })()}
            </div>

            {/* Add Portfolio Modal */}
            <AnimatePresence>
              {showAddModal && (
                <div className="modal-overlay" style={{ backdropFilter: 'blur(10px)' }}>
                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="glass-card" 
                    style={{ 
                      width: '100%', 
                      maxWidth: '520px', 
                      padding: '30px', 
                      background: 'rgba(15, 18, 20, 0.95)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
                      borderRadius: '16px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
                        <span style={{ display: 'flex', background: 'var(--primary-glow)', padding: '6px', borderRadius: '8px', color: 'var(--primary)' }}>
                          <Briefcase size={18} />
                        </span>
                        New Trading Portfolio
                      </h3>
                      <button 
                        type="button" 
                        onClick={() => setShowAddModal(false)} 
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
                      >
                        <X size={20} />
                      </button>
                    </div>

                    <form onSubmit={(e) => { e.preventDefault(); addAccount(); }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {/* Portfolio Type - FIRST so suggestions work */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                          Portfolio Type
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                          {[
                            { val: 'Challenge', emoji: '⚔️', desc: 'Prop Evaluation' },
                            { val: 'Funded', emoji: '💰', desc: 'Live Prop Capital' },
                            { val: 'Personal', emoji: '👤', desc: 'Own Capital' },
                            { val: 'Backtesting', emoji: '🔬', desc: 'Strategy Testing' },
                          ].map(({ val, emoji, desc }) => {
                            const isSelected = accForm.type === val;
                            return (
                              <button
                                key={val}
                                type="button"
                                onClick={() => setAccForm({ ...accForm, type: val, name: '' })}
                                style={{
                                  padding: '10px 12px',
                                  borderRadius: '10px',
                                  border: isSelected ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.06)',
                                  background: isSelected ? 'rgba(13,240,166,0.08)' : 'rgba(255,255,255,0.02)',
                                  color: isSelected ? 'var(--primary)' : 'var(--text-muted)',
                                  cursor: 'pointer',
                                  textAlign: 'left',
                                  transition: 'all 0.15s ease',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '2px'
                                }}
                              >
                                <span style={{ fontSize: '0.95rem' }}>{emoji} <span style={{ fontWeight: '700', fontSize: '13px' }}>{val}</span></span>
                                <span style={{ fontSize: '11px', opacity: 0.6 }}>{desc}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Portfolio Name with Smart Suggestions */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                          Portfolio Name
                        </label>
                        <input 
                          type="text" 
                          placeholder="e.g. FTMO 100K Challenge" 
                          value={accForm.name}
                          onChange={(e) => setAccForm({...accForm, name: e.target.value})}
                          style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', border: accForm.name ? '1px solid rgba(13,240,166,0.3)' : '1px solid rgba(255,255,255,0.06)' }}
                        />
                        {/* Smart name suggestions */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Sparkles size={11} color="var(--primary)" />
                            <span style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Smart Suggestions</span>
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {generateNameSuggestions(accForm.type, accForm.initialBalance).map((sug, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => setAccForm({ ...accForm, name: sug })}
                                style={{
                                  padding: '5px 10px',
                                  borderRadius: '20px',
                                  border: accForm.name === sug ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.07)',
                                  background: accForm.name === sug ? 'rgba(13,240,166,0.12)' : 'rgba(255,255,255,0.03)',
                                  color: accForm.name === sug ? 'var(--primary)' : 'var(--text-muted)',
                                  fontSize: '11px',
                                  cursor: 'pointer',
                                  fontWeight: '600',
                                  transition: 'all 0.15s ease',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {sug}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                          <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                            Website
                          </label>
                          <input 
                            type="text" 
                            placeholder="e.g. ftmo.com" 
                            value={accForm.website}
                            onChange={(e) => setAccForm({...accForm, website: e.target.value})}
                            style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
                          />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                          <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                            Profit Split (%)
                          </label>
                          <select 
                            value={accForm.profitSplit} 
                            onChange={(e) => setAccForm({...accForm, profitSplit: e.target.value})}
                            style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
                          >
                            <option value="">Select Split...</option>
                            <option value="50">50% Split</option>
                            <option value="60">60% Split</option>
                            <option value="70">70% Split</option>
                            <option value="80">80% Split</option>
                            <option value="85">85% Split</option>
                            <option value="90">90% Split</option>
                            <option value="100">100% Split</option>
                          </select>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                          Starting Balance
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                          {[5000, 10000, 20000, 50000, 100000, 200000].map(val => {
                            const isSelected = Number(accForm.initialBalance) === val;
                            return (
                              <button
                                key={val}
                                type="button"
                                onClick={() => setAccForm({...accForm, initialBalance: val})}
                                style={{
                                  padding: '12px',
                                  borderRadius: '8px',
                                  border: isSelected ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.06)',
                                  background: isSelected ? 'rgba(13, 240, 166, 0.1)' : 'rgba(255,255,255,0.02)',
                                  color: isSelected ? 'var(--primary)' : 'var(--text-muted)',
                                  fontWeight: '750',
                                  fontSize: '13px',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                ${val.toLocaleString()}
                              </button>
                            );
                          })}
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px' }}>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Or Custom Balance:</span>
                          <input 
                            type="number" 
                            placeholder="Custom Balance"
                            value={[5000, 10000, 20000, 50000, 100000, 200000].includes(Number(accForm.initialBalance)) ? '' : accForm.initialBalance}
                            onChange={(e) => setAccForm({...accForm, initialBalance: e.target.value})}
                            style={{ flex: 1, padding: '8px 12px', fontSize: '13px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '12px', marginTop: '15px' }}>
                        <button 
                          type="button" 
                          onClick={() => setShowAddModal(false)} 
                          className="btn-outline" 
                          style={{ flex: 1, padding: '12px' }}
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          className="btn-primary" 
                          style={{ flex: 1, padding: '12px' }}
                        >
                          Create Portfolio
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </section>

          {/* Rules Checklist */}
          <section className="glass-card" style={{ padding: '30px' }}>
            <h4 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Brain size={18} color="var(--warning)" />
              Discipline Rules
            </h4>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <input 
                type="text" 
                placeholder="Add new rule..." 
                value={newRule} 
                onChange={(e) => setNewRule(e.target.value)} 
                style={{ flex: 1 }} 
              />
              <button className="btn-primary" onClick={() => {
                if (newRule.trim()) {
                  const updatedProfile = { ...profile, customRules: [...profile.customRules, newRule.trim()] };
                  setProfile(updatedProfile);
                  onUpdateProfile(updatedProfile); // Auto-save
                  setNewRule('');
                }
              }}><Plus size={20} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {profile.customRules.map((rule, index) => (
                <div key={index} className="glass" style={{ padding: '10px 15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px' }}>{rule}</span>
                  <button onClick={() => {
                    const updated = profile.customRules.filter((_, i) => i !== index);
                    const updatedProfile = { ...profile, customRules: updated };
                    setProfile(updatedProfile);
                    onUpdateProfile(updatedProfile); // Auto-save
                  }} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', opacity: 0.5 }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {/* LIVE FORM BUILDER */}
          <section className="glass-card" style={{ padding: '30px' }}>
            <h4 style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Layout size={20} color="var(--primary)" />
              Live Trade Entry Form Builder
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '25px' }}>Customize categories for "Prepare for Battle".</p>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
              <input 
                type="text" 
                placeholder="New Category (e.g. Session)" 
                value={newFieldName} 
                onChange={(e) => setNewFieldName(e.target.value)} 
                style={{ flex: 1 }} 
              />
              <button className="btn-primary" onClick={() => addField('formFields')}><Plus size={18} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {profile.formFields.map((field, fIdx) => (
                <div key={fIdx} className="glass" style={{ borderRadius: '12px' }}>
                  <div 
                    style={{ padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                    onClick={() => setActiveFieldIdx(activeFieldIdx === fIdx ? null : fIdx)}
                  >
                    <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{field.label}</span>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <button onClick={(e) => { e.stopPropagation(); removeField('formFields', fIdx); }} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', opacity: 0.4 }}><Trash2 size={14} /></button>
                      {activeFieldIdx === fIdx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>
                  {activeFieldIdx === fIdx && (
                    <div style={{ padding: '15px', borderTop: '1px solid var(--border)', background: 'rgba(255,255,255,0.01)' }}>
                      <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                        <input type="text" placeholder="Add option..." value={newOption} onChange={(e) => setNewOption(e.target.value)} style={{ flex: 1, fontSize: '13px' }} />
                        <button className="btn-primary" onClick={() => addOption('formFields', fIdx)} style={{ padding: '5px 12px' }}><Plus size={14} /></button>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {field.options.map((opt, oIdx) => (
                          <div key={oIdx} className="glass" style={{ padding: '4px 10px', borderRadius: '15px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {opt}
                            <button onClick={() => removeOption('formFields', fIdx, oIdx)} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', opacity: 0.6 }}>×</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* BACKTEST FORM BUILDER (NEW) */}
          <section className="glass-card" style={{ padding: '30px' }}>
            <h4 style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FlaskRound size={20} color="var(--accent)" />
              Backtest Session Form Builder
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '5px' }}>Customize categories for Strategy Lab trades.</p>
            <p style={{ fontSize: '11px', color: 'var(--primary)', marginBottom: '25px', opacity: 0.8 }}>Note: Trading Accounts are managed globally in the left panel.</p>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
              <input 
                type="text" 
                placeholder="New Category (e.g. Setup Grade)" 
                value={newBTFieldName} 
                onChange={(e) => setNewBTFieldName(e.target.value)} 
                style={{ flex: 1 }} 
              />
              <button className="btn-primary" onClick={() => addField('backtestFields')} style={{ backgroundColor: 'var(--accent)' }}><Plus size={18} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {profile.backtestFields.map((field, fIdx) => (
                <div key={fIdx} className="glass" style={{ borderRadius: '12px' }}>
                  <div 
                    style={{ padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                    onClick={() => setActiveBTFieldIdx(activeBTFieldIdx === fIdx ? null : fIdx)}
                  >
                    <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{field.label}</span>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <button onClick={(e) => { e.stopPropagation(); removeField('backtestFields', fIdx); }} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', opacity: 0.4 }}><Trash2 size={14} /></button>
                      {activeBTFieldIdx === fIdx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>
                  {activeBTFieldIdx === fIdx && (
                    <div style={{ padding: '15px', borderTop: '1px solid var(--border)', background: 'rgba(255,255,255,0.01)' }}>
                      <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                        <input type="text" placeholder="Add option..." value={newBTOption} onChange={(e) => setNewBTOption(e.target.value)} style={{ flex: 1, fontSize: '13px' }} />
                        <button className="btn-primary" onClick={() => addOption('backtestFields', fIdx)} style={{ padding: '5px 12px', backgroundColor: 'var(--accent)' }}><Plus size={14} /></button>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {field.options.map((opt, oIdx) => (
                          <div key={oIdx} className="glass" style={{ padding: '4px 10px', borderRadius: '15px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {opt}
                            <button onClick={() => removeOption('backtestFields', fIdx, oIdx)} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', opacity: 0.6 }}>×</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>

      </div>
    </div>
  );
};

export default Settings;
