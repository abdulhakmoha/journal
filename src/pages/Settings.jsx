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
  FlaskRound
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Settings = ({ user, onUpdateProfile, accounts, onAddAccount, onDeleteAccount, onUpdateAccount }) => {
  const [newRule, setNewRule] = useState('');
  const [profile, setProfile] = useState({
    name: user?.name || '',
    customRules: user?.customRules || [],
    formFields: user?.formFields || [],
    backtestFields: user?.backtestFields || []
  });

  const [accForm, setAccForm] = useState({ name: '', target: 8, type: 'Challenge', initialBalance: 10000 });
  const [editingAccId, setEditingAccId] = useState(null);
  const [editAccForm, setEditAccForm] = useState(null);
  const [newOption, setNewOption] = useState('');
  const [newBTOption, setNewBTOption] = useState('');
  const [newFieldName, setNewFieldName] = useState('');
  const [newBTFieldName, setNewBTFieldName] = useState('');
  const [activeFieldIdx, setActiveFieldIdx] = useState(null);
  const [activeBTFieldIdx, setActiveBTFieldIdx] = useState(null);

  const addAccount = () => {
    if (accForm.name.trim()) {
      onAddAccount({ ...accForm });
      setAccForm({ name: '', target: 8, type: 'Challenge', initialBalance: 10000 });
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '30px', alignItems: 'start' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {/* Personal Profile */}
          <section className="glass-card" style={{ padding: '30px' }}>
            <h4 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldCheck size={18} color="var(--primary)" />
              Personal Profile
            </h4>
            <div className="input-group">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem' }}>Full Name</label>
              <input 
                type="text" 
                value={profile.name} 
                onChange={(e) => setProfile({...profile, name: e.target.value})} 
                style={{ width: '100%' }} 
              />
            </div>
          </section>

          {/* Account Management */}
          <section className="glass-card" style={{ padding: '30px' }}>
            <h4 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Activity size={18} color="var(--success)" />
              Trading Accounts
            </h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 0.8fr auto', gap: '10px', marginBottom: '25px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Name</label>
            <input 
              type="text" 
              placeholder="E.g. Prop Firm" 
              value={accForm.name} 
              onChange={(e) => setAccForm({...accForm, name: e.target.value})} 
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Type</label>
            <select 
              value={accForm.type} 
              onChange={(e) => setAccForm({...accForm, type: e.target.value})}
            >
              <option>Challenge</option>
              <option>Funded</option>
              <option>Personal</option>
              <option>Backtesting</option>
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Balance ($)</label>
            <input 
              type="number" 
              placeholder="10000" 
              value={accForm.initialBalance} 
              onChange={(e) => setAccForm({...accForm, initialBalance: e.target.value})}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Target (%)</label>
            <input 
              type="number" 
              placeholder="8" 
              value={accForm.target} 
              onChange={(e) => setAccForm({...accForm, target: e.target.value})}
            />
          </div>
          <button className="btn-primary" style={{ height: '45px', marginTop: '18px', padding: '0 15px' }} onClick={addAccount}>
            <Plus size={20} />
          </button>
        </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {accounts.map((acc) => (
              <div key={acc._id} className="glass" style={{ padding: '20px', borderRadius: '12px', border: editingAccId === acc._id ? '1px solid var(--primary)' : '1px solid transparent' }}>
                {editingAccId === acc._id ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 0.8fr auto', gap: '10px', alignItems: 'end' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <label style={{ fontSize: '0.65rem' }}>Name</label>
                      <input type="text" value={editAccForm.name} onChange={(e) => setEditAccForm({...editAccForm, name: e.target.value})} style={{ padding: '8px' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <label style={{ fontSize: '0.65rem' }}>Type</label>
                      <select value={editAccForm.type} onChange={(e) => setEditAccForm({...editAccForm, type: e.target.value})} style={{ padding: '8px' }}>
                        <option>Challenge</option>
                        <option>Funded</option>
                        <option>Personal</option>
                        <option>Backtesting</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <label style={{ fontSize: '0.65rem' }}>Balance</label>
                      <input type="number" value={editAccForm.initialBalance} onChange={(e) => setEditAccForm({...editAccForm, initialBalance: e.target.value})} style={{ padding: '8px' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <label style={{ fontSize: '0.65rem' }}>Target %</label>
                      <input type="number" value={editAccForm.target} onChange={(e) => setEditAccForm({...editAccForm, target: e.target.value})} style={{ padding: '8px' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button onClick={saveEdit} style={{ background: 'var(--success)', color: 'white', border: 'none', borderRadius: '8px', padding: '10px', cursor: 'pointer' }}>Save</button>
                      <button onClick={() => setEditingAccId(null)} style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none', cursor: 'pointer', fontSize: '0.7rem' }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ marginBottom: '4px' }}>{acc.name} <span style={{ color: 'var(--success)', fontSize: '0.8rem', marginLeft: '10px' }}>(${acc.initialBalance?.toLocaleString()})</span></h4>
                      <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--primary)', textTransform: 'uppercase' }}>{acc.type}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target: {acc.target}%</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                      <button onClick={() => startEditing(acc)} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', opacity: 0.7, cursor: 'pointer' }}>
                        <Save size={16} />
                      </button>
                      <button onClick={() => onDeleteAccount(acc._id)} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', opacity: 0.5, cursor: 'pointer' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
              ))}
            </div>
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
                  <span style={{ fontSize: '0.9rem' }}>{rule}</span>
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
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '25px' }}>Customize categories for "Prepare for Battle".</p>

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
                    <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{field.label}</span>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <button onClick={(e) => { e.stopPropagation(); removeField('formFields', fIdx); }} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', opacity: 0.4 }}><Trash2 size={14} /></button>
                      {activeFieldIdx === fIdx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>
                  {activeFieldIdx === fIdx && (
                    <div style={{ padding: '15px', borderTop: '1px solid var(--border)', background: 'rgba(255,255,255,0.01)' }}>
                      <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                        <input type="text" placeholder="Add option..." value={newOption} onChange={(e) => setNewOption(e.target.value)} style={{ flex: 1, fontSize: '0.8rem' }} />
                        <button className="btn-primary" onClick={() => addOption('formFields', fIdx)} style={{ padding: '5px 12px' }}><Plus size={14} /></button>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {field.options.map((opt, oIdx) => (
                          <div key={oIdx} className="glass" style={{ padding: '4px 10px', borderRadius: '15px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
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
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '5px' }}>Customize categories for Strategy Lab trades.</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--primary)', marginBottom: '25px', opacity: 0.8 }}>Note: Trading Accounts are managed globally in the left panel.</p>

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
                    <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{field.label}</span>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <button onClick={(e) => { e.stopPropagation(); removeField('backtestFields', fIdx); }} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', opacity: 0.4 }}><Trash2 size={14} /></button>
                      {activeBTFieldIdx === fIdx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>
                  {activeBTFieldIdx === fIdx && (
                    <div style={{ padding: '15px', borderTop: '1px solid var(--border)', background: 'rgba(255,255,255,0.01)' }}>
                      <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                        <input type="text" placeholder="Add option..." value={newBTOption} onChange={(e) => setNewBTOption(e.target.value)} style={{ flex: 1, fontSize: '0.8rem' }} />
                        <button className="btn-primary" onClick={() => addOption('backtestFields', fIdx)} style={{ padding: '5px 12px', backgroundColor: 'var(--accent)' }}><Plus size={14} /></button>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {field.options.map((opt, oIdx) => (
                          <div key={oIdx} className="glass" style={{ padding: '4px 10px', borderRadius: '15px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
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
