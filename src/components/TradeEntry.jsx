import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Info, Save, Brain, Upload, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const TradeEntry = ({ onSave, customRules, formFields, initialData, accounts }) => {
  const [formData, setFormData] = useState(() => {
    if (initialData) return { ...initialData };
    
    // Initialize dynamic fields from formFields
    const dynamicData = {};
    formFields.forEach(field => {
      dynamicData[field.label] = field.options[0] || '';
    });

    return {
      account: accounts[0]?.name || 'Personal Account',
      type: 'Long',
      risk: '',
      reward: '',
      rr: 0,
      beforeChart: '',
      afterChart: '',
      preMindset: '',
      postMindset: '',
      status: 'Active',
      isMistake: false,
      isCompleted: false,
      date: new Date().toISOString().split('T')[0],
      rules: customRules.reduce((acc, rule) => ({ ...acc, [rule]: false }), {}),
      ...dynamicData // Merge custom categories
    };
  });

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

    const data = new FormData();
    data.append('image', file);
    
    setUploading({ ...uploading, [type]: true });
    try {
      const res = await api.post('/api/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData({ ...formData, [type === 'before' ? 'beforeChart' : 'afterChart']: res.data.url });
    } catch (err) {
      alert('Upload failed');
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
    const symbol = formData['Pair'] || formData['Asset'];
    if (!formData.account || !symbol || !formData.risk || !formData.reward) {
      alert('Fadlan buuxi meelaha banaan (Account, Pair, Risk, iyo Reward) ka hor inta aadan badbaadin.');
      return;
    }
    
    // Map dynamic fields to specific properties for compatibility
    const finalTrade = { 
      ...formData, 
      grade, 
      isCompleted: completed,
      status: completed ? formData.status : 'Active',
      timestamp: new Date(formData.date).toISOString(),
      // Backward compatibility for known fields if they exist in custom form
      symbol: formData['Pair'] || formData['Asset'] || 'Unknown',
      strategy: formData['Strategy'] || 'Standard',
      timeframe: formData['Timeframe'] || '15m',
      session: formData['Trading Session'] || 'London'
    };

    onSave(finalTrade);
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
          <h2 className="text-gradient">Prepare for Battle</h2>
          <p style={{ color: 'var(--text-muted)' }}>Execute with your custom-built professional framework.</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '5px' }}>Current Potential Grade</p>
          <div style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--primary)' }}>{grade}</div>
        </div>
      </div>

      <form onSubmit={(e) => e.preventDefault()}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px', marginBottom: '30px' }}>
          
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
                {formFields.map((field, i) => (
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

             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Type</label>
                  <select style={{ width: '100%' }} value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                    <option>Long</option>
                    <option>Short</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Risk (%)</label>
                  <input type="number" step="any" placeholder="e.g. 1" style={{ width: '100%' }} value={formData.risk} onChange={(e) => setFormData({...formData, risk: e.target.value})} required />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Reward (%)</label>
                  <input type="number" step="any" placeholder="e.g. 3" style={{ width: '100%' }} value={formData.reward} onChange={(e) => setFormData({...formData, reward: e.target.value})} required />
                </div>
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
                 <img src={formData.beforeChart.startsWith('http') ? formData.beforeChart : `http://localhost:5000${formData.beforeChart}`} alt="Before" style={{ width: '100%', borderRadius: '8px' }} />
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
                 <img src={formData.afterChart.startsWith('http') ? formData.afterChart : `http://localhost:5000${formData.afterChart}`} alt="After" style={{ width: '100%', borderRadius: '8px' }} />
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
          <button type="button" className="btn-outline" style={{ flex: 1, padding: '15px' }} onClick={(e) => handleSubmit(e, false)}>Save Draft</button>
          <button type="submit" className="btn-primary" style={{ flex: 1, padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }} onClick={(e) => handleSubmit(e, true)}>
            <Save size={20} />
            Complete Trade Execution
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default TradeEntry;
