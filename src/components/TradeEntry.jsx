import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Info, Save, Brain, Upload, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const BACKEND_URL = 'https://journal-production-6346.up.railway.app';

const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://localhost:5000')) {
    return url.replace('http://localhost:5000', BACKEND_URL);
  }
  if (url.startsWith('http')) return url;
  return `${BACKEND_URL}${url}`;
};

const TradeEntry = ({ onSave, customRules, formFields, initialData, accounts }) => {
  const getInitialState = () => {
    // 1. Priority: If editing an existing trade, use that data
    if (initialData) {
      return {
        ...initialData,
        date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        rules: initialData.rules || customRules.reduce((acc, rule) => ({ ...acc, [rule]: false }), {})
      };
    }

    // 2. Priority: Try to load saved draft from localStorage for new trades
    let baseData = {};
    const savedDraft = localStorage.getItem('somtrader_form_draft');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (parsed) baseData = parsed;
      } catch (e) {
        console.error('Failed to parse draft');
      }
    }
    
    // Initialize dynamic fields from formFields and merge with baseData
    const dynamicData = {};
    formFields.forEach(field => {
      dynamicData[field.label] = baseData[field.label] || field.options[0] || '';
    });

    return {
      account: baseData.account || accounts[0]?.name || 'Personal Account',
      type: baseData.type || 'Long',
      risk: baseData.risk || '',
      reward: baseData.reward || '',
      riskPercent: baseData.riskPercent || 1,
      rr: baseData.rr || 0,
      beforeChart: baseData.beforeChart || '',
      afterChart: baseData.afterChart || '',
      preMindset: baseData.preMindset || '',
      postMindset: baseData.postMindset || '',
      status: baseData.status || 'Active',
      isMistake: baseData.isMistake || false,
      isCompleted: baseData.isCompleted || false,
      pips: baseData.pips || '',
      date: baseData.date || new Date().toISOString().split('T')[0],
      rules: baseData.rules || customRules.reduce((acc, rule) => ({ ...acc, [rule]: false }), {}),
      ...baseData,
      ...dynamicData
    };
  };

  const [formData, setFormData] = useState(getInitialState);

  // Sync with initialData OR customRules/formFields changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        rules: initialData.rules || customRules.reduce((acc, rule) => ({ ...acc, [rule]: false }), {})
      });
    } else {
      // Ensure all current formFields and rules are present in the state
      setFormData(prev => {
        const updated = { ...prev };
        let changed = false;

        // Sync Dynamic Fields
        formFields.forEach(field => {
          if (updated[field.label] === undefined) {
            updated[field.label] = field.options[0] || '';
            changed = true;
          }
        });

        // Sync Rules
        const currentRuleKeys = Object.keys(updated.rules || {}).sort().join(',');
        const settingsRuleKeys = [...customRules].sort().join(',');
        if (currentRuleKeys !== settingsRuleKeys) {
          updated.rules = customRules.reduce((acc, rule) => ({ ...acc, [rule]: updated.rules?.[rule] || false }), {});
          changed = true;
        }

        return changed ? updated : prev;
      });
    }
  }, [initialData, customRules, formFields]);

  const resetForm = (showConfirm = true) => {
    if (!showConfirm || window.confirm('Ma hubtaa inaad tirtirto xogtaan?')) {
      localStorage.removeItem('somtrader_form_draft');
      // Force a fresh state without reload
      setFormData({
        account: accounts[0]?.name || 'Personal Account',
        type: 'Long',
        risk: '',
        reward: '',
        riskPercent: 1,
        rr: 0,
        beforeChart: '',
        afterChart: '',
        preMindset: '',
        postMindset: '',
        status: 'Active',
        isMistake: false,
        isCompleted: false,
        pips: '',
        date: new Date().toISOString().split('T')[0],
        rules: customRules.reduce((acc, rule) => ({ ...acc, [rule]: false }), {})
      });
    }
  };

  // 2. Save to localStorage whenever formData changes
  useEffect(() => {
    localStorage.setItem('somtrader_form_draft', JSON.stringify(formData));
  }, [formData]);

  const [uploading, setUploading] = useState({ before: false, after: false });
  const [grade, setGrade] = useState('D');

  useEffect(() => {
    const riskVal = parseFloat(formData.risk) || 0;
    const rewardVal = parseFloat(formData.reward) || 0;
    if (riskVal > 0) {
      setFormData(prev => ({ ...prev, rr: (rewardVal / riskVal).toFixed(2) }));
    }
  }, [formData.risk, formData.reward]);

  useEffect(() => {
    const rulesMet = Object.values(formData.rules).filter(v => v).length;
    const totalRules = Object.keys(formData.rules).length;
    const score = totalRules === 0 ? 0 : (rulesMet / totalRules) * 100;
    
    if (score >= 90) setGrade('A+');
    else if (score >= 75) setGrade('A');
    else if (score >= 50) setGrade('B');
    else if (score >= 25) setGrade('C');
    else setGrade('D');
  }, [formData.rules]);

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const IMGBB_KEY = 'ab0fb7feaf970b3a72b70ae049436487';
    const data = new FormData();
    data.append('image', file);
    
    setUploading({ ...uploading, [type]: true });
    try {
      // Direct upload to ImgBB
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, {
        method: 'POST',
        body: data
      });
      const result = await res.json();
      
      if (result.success) {
        setFormData({ ...formData, [type === 'before' ? 'beforeChart' : 'afterChart']: result.data.url });
      } else {
        throw new Error('Upload failed');
      }
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading({ ...uploading, [type]: false });
    }
  };

  const handleRuleToggle = (rule) => {
    setFormData(prev => ({
      ...prev,
      rules: { ...prev.rules, [rule]: !prev.rules[rule] }
    }));
  };

  const handleSubmit = (e, completed = true) => {
    e.preventDefault();

    // Validation
    const findDynamicValue = (labels) => {
      const foundLabel = Object.keys(formData).find(k => {
        const lowerK = k.toLowerCase().trim();
        return labels.some(l => lowerK === l || lowerK.includes(l));
      });
      return foundLabel ? formData[foundLabel] : null;
    };

    const symbol = findDynamicValue(['pair', 'asset', 'symbol', 'instrument']);
    
    // Strict validation ONLY for completed trades
    if (completed) {
      const missingFields = [];
      if (!formData.account) missingFields.push('Account');
      if (!symbol) missingFields.push('Pair/Symbol');
      if (formData.risk === '' || formData.risk === undefined) missingFields.push('Risk');
      if (formData.reward === '' || formData.reward === undefined) missingFields.push('Reward');

      if (missingFields.length > 0) {
        alert(`Fadlan buuxi meelaha banaan: ${missingFields.join(', ')}`);
        return;
      }
    } else {
      // Minimal validation for Drafts/Active trades
      if (!formData.account) {
        alert('Fadlan ugu yaraan dooro (Account) si aad u badbaadiso draft-ka.');
        return;
      }
    }
    
    // Map dynamic fields to specific properties for compatibility
    const finalTrade = { 
      ...formData, 
      grade, 
      isCompleted: completed,
      status: completed ? formData.status.split(' ')[0] : 'Active', // Clean emoji
      symbol: symbol || 'Unknown',
      pips: formData.pips ? parseFloat(formData.pips) : 0, // Ensure Number
      timestamp: (() => {
        const [year, month, day] = formData.date.split('-').map(Number);
        const now = new Date();
        return new Date(year, month - 1, day, now.getHours(), now.getMinutes(), now.getSeconds()).toISOString();
      })(),
      // Backward compatibility for known fields if they exist in custom form
      strategy: formData['Strategy'] || findDynamicValue(['strategy', 'setup']) || 'Standard',
      timeframe: formData['Timeframe'] || findDynamicValue(['timeframe', 'tf']) || '15m',
      session: formData['Trading Session'] || findDynamicValue(['session', 'trading session']) || 'London'
    };

    // Sanitize numeric fields to avoid empty string errors
    const sanitizedTrade = { ...finalTrade };
    if (sanitizedTrade.risk === '') delete sanitizedTrade.risk;
    if (sanitizedTrade.reward === '') delete sanitizedTrade.reward;
    if (sanitizedTrade.rr === '') delete sanitizedTrade.rr;

    // Clear draft and call save
    localStorage.removeItem('somtrader_form_draft');
    onSave(sanitizedTrade);
    
    // If it was a completed trade, clear the form for the next one
    if (completed) {
      resetForm(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card"
      style={{ padding: '40px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 className="text-gradient">Trade Execution Framework</h2>
          <p style={{ color: 'var(--text-muted)' }}>Execute your trades using a structured professional process.</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '5px' }}>Current Potential Grade</p>
          <div style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--primary)' }}>{grade}</div>
        </div>
      </div>

      <form onSubmit={(e) => e.preventDefault()}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', marginBottom: '30px' }}>
          
          {/* DYNAMIC FIELDS SECTION */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Trading Date</label>
                  <input type="date" style={{ width: '100%' }} value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Account</label>
                  <select style={{ width: '100%' }} value={formData.account} onChange={(e) => setFormData({...formData, account: e.target.value})}>
                    {accounts.map((acc, i) => <option key={i} value={acc.name}>{acc.name}</option>)}
                  </select>
                </div>
             </div>

             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {formFields
                  .filter(field => !['account', 'trading account'].includes(field.label.toLowerCase()))
                  .map((field, i) => (
                  <div key={i}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{field.label}</label>
                    <select 
                      style={{ width: '100%' }} 
                      value={formData[field.label] || ''} 
                      onChange={(e) => setFormData({...formData, [field.label]: e.target.value})}
                    >
                      {field.options.map((opt, oIdx) => <option key={oIdx} value={opt}>{opt}</option>)}
                      {field.options.length === 0 && <option value="">No options</option>}
                    </select>
                  </div>
                ))}
             </div>

             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Type</label>
                  <select style={{ width: '100%' }} value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                    <option>Long</option>
                    <option>Short</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Unit</label>
                  <select 
                    style={{ width: '100%' }} 
                    value={formData.riskUnit || '%'} 
                    onChange={(e) => setFormData({...formData, riskUnit: e.target.value})}
                  >
                    <option value="%">% (Percent)</option>
                    <option value="Pips">Pips</option>
                  </select>
                </div>
                {/* Removed Risk % Per Trade input as per user request to hide % when Pips is chosen */}
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Risk ({formData.riskUnit || '%'})
                  </label>
                  <input type="number" step="any" placeholder={formData.riskUnit === 'Pips' ? 'e.g. 10' : 'e.g. 1'} style={{ width: '100%' }} value={formData.risk} onChange={(e) => setFormData({...formData, risk: e.target.value})} required />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Reward ({formData.riskUnit || '%'})
                  </label>
                  <input type="number" step="any" placeholder={formData.riskUnit === 'Pips' ? 'e.g. 30' : 'e.g. 3'} style={{ width: '100%' }} value={formData.reward} onChange={(e) => setFormData({...formData, reward: e.target.value})} required />
                </div>
                {formData.riskUnit === 'Pips' && (
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Pips Gained/Lost
                    </label>
                    <input type="number" step="any" placeholder="e.g. +50" style={{ width: '100%', border: '1px solid var(--primary)', background: 'rgba(56, 189, 248, 0.05)' }} value={formData.pips} onChange={(e) => setFormData({...formData, pips: e.target.value})} />
                  </div>
                )}
             </div>

             <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Status</label>
                  <select style={{ width: '100%' }} value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                    <option value="Win">Win ✅</option>
                    <option value="Loss">Loss ❌</option>
                    <option value="BE">Break-even ➖</option>
                    <option value="Active">Active 🔄</option>
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '25px' }}>
                  <input type="checkbox" checked={formData.isMistake} onChange={(e) => setFormData({...formData, isMistake: e.target.checked})} />
                  <label style={{ fontSize: '0.85rem', color: formData.isMistake ? 'var(--danger)' : 'var(--text-muted)' }}>Mistake?</label>
                </div>
             </div>
          </div>

          {/* Rules Checklist */}
          <div className="glass" style={{ padding: '25px', borderRadius: '12px' }}>
            <h4 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={18} color="var(--primary)" />
              Trade Rules (Checklist)
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {Object.keys(formData.rules).map(rule => (
                <label key={rule} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '10px', borderRadius: '8px', background: formData.rules[rule] ? 'rgba(16, 185, 129, 0.1)' : 'transparent' }}>
                  <input type="checkbox" checked={formData.rules[rule]} onChange={() => handleRuleToggle(rule)} />
                  <span style={{ fontSize: '0.85rem', color: formData.rules[rule] ? 'var(--text-main)' : 'var(--text-muted)' }}>{rule}</span>
                </label>
              ))}
              {Object.keys(formData.rules).length === 0 && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>No rules defined.</p>}
            </div>
          </div>
        </div>

        {/* Chart Uploads */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
          <div className="glass" style={{ padding: '20px', textAlign: 'center', border: '1px dashed var(--border)' }}>
             <h4 style={{ fontSize: '0.8rem', marginBottom: '15px', color: 'var(--text-muted)' }}>BEFORE CHART</h4>
             {formData.beforeChart ? (
               <div style={{ position: 'relative' }}>
                 <img src={getImageUrl(formData.beforeChart)} alt="Before" style={{ width: '100%', borderRadius: '8px' }} />
                 <button onClick={() => setFormData({...formData, beforeChart: ''})} style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', borderRadius: '50%', width: '24px', height: '24px' }}>×</button>
               </div>
             ) : (
               <label style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '20px' }}>
                 <Upload size={24} color="var(--primary)" />
                 <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{uploading.before ? 'Uploading...' : 'Upload Entry Chart'}</span>
                 <input type="file" hidden onChange={(e) => handleFileUpload(e, 'before')} />
               </label>
             )}
          </div>
          <div className="glass" style={{ padding: '20px', textAlign: 'center', border: '1px dashed var(--border)' }}>
             <h4 style={{ fontSize: '0.8rem', marginBottom: '15px', color: 'var(--text-muted)' }}>AFTER CHART</h4>
             {formData.afterChart ? (
               <div style={{ position: 'relative' }}>
                 <img src={getImageUrl(formData.afterChart)} alt="After" style={{ width: '100%', borderRadius: '8px' }} />
                 <button onClick={() => setFormData({...formData, afterChart: ''})} style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', borderRadius: '50%', width: '24px', height: '24px' }}>×</button>
               </div>
             ) : (
               <label style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '20px' }}>
                 <Upload size={24} color="var(--success)" />
                 <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{uploading.after ? 'Uploading...' : 'Upload Result Chart'}</span>
                 <input type="file" hidden onChange={(e) => handleFileUpload(e, 'after')} />
               </label>
             )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
          <div className="glass" style={{ padding: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Pre-Trade Thoughts</label>
            <textarea placeholder="Psychology before entry..." style={{ width: '100%', minHeight: '80px' }} value={formData.preMindset} onChange={(e) => setFormData({...formData, preMindset: e.target.value})} />
          </div>
          <div className="glass" style={{ padding: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Post-Trade Reflection</label>
            <textarea placeholder="Lessons learned after exit..." style={{ width: '100%', minHeight: '80px' }} value={formData.postMindset} onChange={(e) => setFormData({...formData, postMindset: e.target.value})} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '15px' }}>
          {!initialData && (
            <button type="button" className="btn-outline" style={{ padding: '15px', color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.2)' }} onClick={resetForm}>
              Reset Form
            </button>
          )}
          <button type="button" className="btn-outline" style={{ flex: 1, padding: '15px' }} onClick={(e) => handleSubmit(e, false)}>Save Draft</button>
          <button type="submit" className="btn-primary" style={{ flex: 1, padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }} onClick={(e) => handleSubmit(e, true)}>
            <Save size={20} />
            {initialData ? 'Update Trade Record' : 'Complete Trade Execution'}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default TradeEntry;
