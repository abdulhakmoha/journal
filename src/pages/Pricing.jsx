import React, { useState } from 'react';
import { Check, Zap, Award, Crown, ShieldCheck, CreditCard, Bitcoin, Smartphone, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';

const Pricing = () => {
  const { showNotification } = useNotification();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [transactionId, setTransactionId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const plans = [
    {
      name: 'Premium',
      price: '7',
      icon: <Crown size={24} color="var(--warning)" />,
      features: ['Unlimited Journaling', 'Advanced Performance Data', 'Unlimited Accounts', 'Full Backtest Logic', 'Mindset Mirror Access'],
      color: 'var(--warning)',
      isPopular: true
    }
  ];

  const handlePaymentSubmit = async () => {
    if (!transactionId) return showNotification('Fadlan geli Transaction ID ama Hash ID', 'error');
    
    setIsSubmitting(true);
    try {
      await api.post('/api/payments/request', {
        plan: selectedPlan.name,
        amount: selectedPlan.price,
        method: paymentMethod,
        transactionId
      });
      setSuccess(true);
      showNotification('Codsigaaga waa la diray!', 'success');
    } catch (err) {
      showNotification('Error submitting payment request', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', gap: '20px' }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ background: 'var(--success)', padding: '20px', borderRadius: '50%' }}>
          <ShieldCheck size={50} color="white" />
        </motion.div>
        <h2>Codsigaaga waa la helay!</h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '400px' }}>Mahadsanid. Admin-ka ayaa xaqiijin doona lacag-bixintaada 12-24 saac gudahood. Marka la xaqiijiyo, account-kaaga si toos ah ayuu u noqonayaa {selectedPlan.name}.</p>
        <button className="btn-primary" onClick={() => window.location.reload()}>Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', paddingBottom: '50px' }}>
      <header style={{ textAlign: 'center' }}>
        <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Choose Your Trading Edge</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Elevate your trading with professional journaling and analytics.</p>
      </header>

      {!selectedPlan ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card"
              style={{ 
                padding: '40px', 
                position: 'relative',
                border: plan.isPopular ? '2px solid var(--primary)' : '1px solid var(--border)',
                transform: plan.isPopular ? 'scale(1.05)' : 'scale(1)',
                zIndex: plan.isPopular ? 2 : 1
              }}
            >
              {plan.isPopular && (
                <div style={{ position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)', background: 'var(--primary)', color: 'white', padding: '5px 15px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                  MOST POPULAR
                </div>
              )}
              <div style={{ marginBottom: '20px' }}>{plan.icon}</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>{plan.name}</h3>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px', marginBottom: '30px' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>${plan.price}</span>
                <span style={{ color: 'var(--text-muted)' }}>/month</span>
              </div>
              
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 40px 0', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {plan.features.map((feat, fIdx) => (
                  <li key={fIdx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
                    <Check size={16} color="var(--success)" />
                    {feat}
                  </li>
                ))}
              </ul>

              <button 
                className="btn-primary" 
                style={{ width: '100%' }}
                onClick={() => setSelectedPlan(plan)}
              >
                Get {plan.name} Now
              </button>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card" style={{ maxWidth: '600px', margin: '0 auto', padding: '40px' }}>
          <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '20px' }} onClick={() => {setSelectedPlan(null); setPaymentMethod(null);}}>← Back to plans</button>
          <h2 style={{ marginBottom: '10px' }}>Secure Checkout</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>You are upgrading to <strong>{selectedPlan.name}</strong> for <strong>${selectedPlan.price}/month</strong>.</p>
          
          <h4 style={{ marginBottom: '15px' }}>Choose Payment Method:</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px' }}>
            <div 
              onClick={() => setPaymentMethod('Crypto')}
              style={{ 
                padding: '20px', 
                borderRadius: '12px', 
                border: `2px solid ${paymentMethod === 'Crypto' ? 'var(--primary)' : 'var(--border)'}`,
                background: paymentMethod === 'Crypto' ? 'rgba(56, 189, 248, 0.05)' : 'transparent',
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              <Bitcoin size={30} color="#F7931A" style={{ marginBottom: '10px' }} />
              <p style={{ fontWeight: 'bold' }}>Crypto</p>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>USDT / BTC / ETH</span>
            </div>
            <div 
              onClick={() => setPaymentMethod('EVC Plus')}
              style={{ 
                padding: '20px', 
                borderRadius: '12px', 
                border: `2px solid ${paymentMethod === 'EVC Plus' ? 'var(--primary)' : 'var(--border)'}`,
                background: paymentMethod === 'EVC Plus' ? 'rgba(56, 189, 248, 0.05)' : 'transparent',
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              <Smartphone size={30} color="var(--success)" style={{ marginBottom: '10px' }} />
              <p style={{ fontWeight: 'bold' }}>EVC Plus</p>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Somalia Mobile Money</span>
            </div>
          </div>

          <AnimatePresence>
            {paymentMethod === 'Crypto' && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px' }}>Fadlan bixi <strong>${selectedPlan.price} USDT (TRC20)</strong> cinwaanka Binance ee hoose:</p>
                  <div style={{ background: 'var(--bg-dark)', padding: '10px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.8rem', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>TJRcbveNbnLJ1dmULU2u8KAx5VAYqsAxiK</span>
                    <button onClick={() => navigator.clipboard.writeText('TJRcbveNbnLJ1dmULU2u8KAx5VAYqsAxiK')} style={{ background: 'var(--primary)', border: 'none', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer' }}>Copy</button>
                  </div>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px' }}>Gmail-ka aad Binance-ka ku leedahay:</label>
                  <input 
                    type="email" 
                    placeholder="Tusaale: user@gmail.com" 
                    value={transactionId} 
                    onChange={(e) => setTransactionId(e.target.value)} 
                  />
                </div>
              </motion.div>
            )}

            {paymentMethod === 'EVC Plus' && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px' }}>Fadlan bixi <strong>${selectedPlan.price}</strong> nambaarka hoose:</p>
                  <div style={{ background: 'var(--bg-dark)', padding: '10px', borderRadius: '8px', fontSize: '1.2rem', fontWeight: 'bold', border: '1px solid var(--border)', textAlign: 'center', color: 'var(--primary)' }}>
                    617755701
                  </div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '10px', textAlign: 'center' }}>EVC Plus Somalia</p>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px' }}>Nambarka aad lacagta ka soo dirtay:</label>
                  <input 
                    type="text" 
                    placeholder="Tusaale: 0615XXXXXX" 
                    value={transactionId} 
                    onChange={(e) => setTransactionId(e.target.value)} 
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {paymentMethod && (
            <button 
              className="btn-primary" 
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
              onClick={handlePaymentSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : <><Send size={18} /> Submit Payment Request</>}
            </button>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default Pricing;
