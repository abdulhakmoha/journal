import React, { useState, useEffect } from 'react';
import { Calculator as CalcIcon, DollarSign, Percent, ArrowRight, Target, AlertCircle, ShieldCheck, Activity, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Calculator = ({ accounts, onAddAccount }) => {
  const [selectedAccount, setSelectedAccount] = useState(accounts[0] || { name: 'Custom', initialBalance: 10000 });
  const [customBalance, setCustomBalance] = useState(10000);
  const [isCustom, setIsCustom] = useState(accounts.length === 0);
  const [riskPercent, setRiskPercent] = useState(1);
  const [stopLossPips, setStopLossPips] = useState(10);
  const [pipValue, setPipValue] = useState(10); // Standard for 1 lot on USD pairs
  const [lotSize, setLotSize] = useState(0);
  const [riskAmount, setRiskAmount] = useState(0);
  
  // New Account Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAccountForm, setNewAccountForm] = useState({ name: '', initialBalance: '', type: 'Personal', target: 0 });

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    if (!newAccountForm.name || !newAccountForm.initialBalance) return alert('Fadlan buuxi meelaha bannaan');
    await onAddAccount(newAccountForm);
    setShowAddModal(false);
    setNewAccountForm({ name: '', initialBalance: '', type: 'Personal', target: 0 });
  };

  useEffect(() => {
    const balance = isCustom ? parseFloat(customBalance) : (selectedAccount?.initialBalance || 0);
    if (balance > 0) {
      // If riskAmount was manually set, we use it. Otherwise calculate from percent.
      // But for the initial load and balance changes, we prioritize percent.
      const risk = (balance * (riskPercent / 100));
      setRiskAmount(risk.toFixed(2));
    }
  }, [selectedAccount, isCustom, customBalance]);

  useEffect(() => {
    const balance = isCustom ? parseFloat(customBalance) : (selectedAccount?.initialBalance || 0);
    if (balance > 0 && stopLossPips > 0) {
      const calculatedLotSize = parseFloat(riskAmount) / (stopLossPips * pipValue);
      setLotSize(calculatedLotSize.toFixed(2));
    }
  }, [riskAmount, stopLossPips, pipValue, selectedAccount, isCustom, customBalance]);

  const handleRiskPercentChange = (val) => {
    setRiskPercent(val);
    const balance = isCustom ? parseFloat(customBalance) : (selectedAccount?.initialBalance || 0);
    if (balance > 0) {
      setRiskAmount((balance * (val / 100)).toFixed(2));
    }
  };

  const handleRiskAmountChange = (val) => {
    setRiskAmount(val);
    const balance = isCustom ? parseFloat(customBalance) : (selectedAccount?.initialBalance || 0);
    if (balance > 0) {
      setRiskPercent(((val / balance) * 100).toFixed(2));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <header>
        <h2 className="text-gradient">Risk Management Lab</h2>
        <p style={{ color: 'var(--text-muted)' }}>Calculate the exact lot size to protect your capital.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '30px', alignItems: 'start' }}>
        {/* Input Section */}
        <section className="glass-card" style={{ padding: '40px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
            
            <div className="input-group" style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <Activity size={16} color="var(--primary)" /> Account Source
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <select 
                    value={isCustom ? 'custom' : selectedAccount?._id} 
                    onChange={(e) => {
                      if (e.target.value === 'custom') {
                        setIsCustom(true);
                      } else {
                        setIsCustom(false);
                        setSelectedAccount(accounts.find(a => a._id === e.target.value));
                      }
                    }}
                    style={{ flex: 1, padding: '15px', fontSize: '1rem' }}
                  >
                    {accounts.map(acc => (
                      <option key={acc._id} value={acc._id}>{acc.name} (${acc.initialBalance.toLocaleString()})</option>
                    ))}
                    <option value="custom">✍️ Custom Balance (Manual Entry)</option>
                  </select>
                  <button 
                    onClick={() => setShowAddModal(true)}
                    className="btn-secondary" 
                    style={{ padding: '0 15px', borderRadius: '12px' }}
                    title="Add New Account"
                  >
                    <Plus size={20} />
                  </button>
                </div>
                
                {isCustom && (
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--success)', fontWeight: 'bold' }}>$</span>
                    <input 
                      type="number" 
                      value={customBalance} 
                      onChange={(e) => setCustomBalance(e.target.value)} 
                      placeholder="Enter Manual Balance"
                      style={{ width: '100%', padding: '15px 15px 15px 35px', fontSize: '1.2rem', fontWeight: 'bold', border: '1px solid var(--success)', background: 'rgba(16, 185, 129, 0.05)' }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="input-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <Percent size={16} color="var(--primary)" /> Risk Percentage (%)
              </label>
              <input 
                type="number" 
                value={riskPercent} 
                onChange={(e) => handleRiskPercentChange(e.target.value)} 
                step="0.1"
                style={{ width: '100%' }}
              />
            </div>

            <div className="input-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <DollarSign size={16} color="var(--success)" /> Risk Amount ($)
              </label>
              <input 
                type="number" 
                value={riskAmount} 
                onChange={(e) => handleRiskAmountChange(e.target.value)} 
                step="0.01"
                style={{ width: '100%' }}
              />
            </div>

            <div className="input-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <Target size={16} color="var(--danger)" /> Stop Loss (Pips/Points)
              </label>
              <input 
                type="number" 
                value={stopLossPips} 
                onChange={(e) => setStopLossPips(e.target.value)} 
                style={{ width: '100%' }}
              />
            </div>

            <div className="input-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <DollarSign size={16} color="var(--success)" /> Pip Value (per Lot)
              </label>
              <input 
                type="number" 
                value={pipValue} 
                onChange={(e) => setPipValue(parseFloat(e.target.value) || 0)} 
                step="0.01"
                style={{ width: '100%' }}
              />
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '8px' }}>Standard: 10 (EURUSD), 100 (Gold), 1 (Mini).</p>
            </div>

          </div>

          <div style={{ marginTop: '40px', padding: '30px', background: 'rgba(56, 189, 248, 0.05)', borderRadius: '20px', border: '1px solid rgba(56, 189, 248, 0.1)', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '10px' }}>RECOMMENDED LOT SIZE</p>
            <h1 style={{ fontSize: '4rem', fontWeight: '900', color: 'var(--primary)', letterSpacing: '-2px' }}>
              {lotSize} <span style={{ fontSize: '1.5rem', fontWeight: '400', color: 'var(--text-muted)' }}>Lots</span>
            </h1>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginTop: '20px' }}>
               <div>
                 <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>TOTAL RISK</p>
                 <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--danger)' }}>${riskAmount.toLocaleString()}</p>
               </div>
               <div style={{ width: '1px', height: '40px', background: 'var(--border)' }}></div>
               <div>
                 <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>BALANCE</p>
                 <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                   ${(isCustom ? parseFloat(customBalance) : (selectedAccount?.initialBalance || 0)).toLocaleString()}
                 </p>
               </div>
            </div>
          </div>
        </section>

        {/* Info/Rules Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
           <section className="glass-card" style={{ padding: '25px' }}>
              <h4 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldCheck size={18} color="var(--success)" /> Safety Rules
              </h4>
              <ul style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <li style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ minWidth: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)', marginTop: '6px' }}></div>
                  Never risk more than 2% per trade.
                </li>
                <li style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ minWidth: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)', marginTop: '6px' }}></div>
                  Confirm your SL is at a structural level.
                </li>
                <li style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ minWidth: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)', marginTop: '6px' }}></div>
                  Lot size is your weapon; use it wisely.
                </li>
              </ul>
           </section>

           <div className="glass" style={{ padding: '25px', borderRadius: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                <AlertCircle size={24} color="var(--warning)" />
                <h4 style={{ fontSize: '0.9rem' }}>Risk Tip</h4>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                Always round down your lot size if you are unsure. Capital preservation is the only way to stay in the game for the long run.
              </p>
           </div>
        </div>

      </div>

      {/* Add Account Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="modal-overlay">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card" 
              style={{ width: '100%', maxWidth: '400px', padding: '30px' }}
            >
              <h3 style={{ marginBottom: '20px' }}>Add New Trading Account</h3>
              <form onSubmit={handleCreateAccount} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="input-group">
                  <label>Account Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. My Funding Account" 
                    value={newAccountForm.name}
                    onChange={(e) => setNewAccountForm({...newAccountForm, name: e.target.value})}
                  />
                </div>
                <div className="input-group">
                  <label>Initial Balance ($)</label>
                  <input 
                    type="number" 
                    placeholder="10000" 
                    value={newAccountForm.initialBalance}
                    onChange={(e) => setNewAccountForm({...newAccountForm, initialBalance: e.target.value})}
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                  <button type="submit" className="btn-primary" style={{ flex: 1 }}>Create Account</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Calculator;
