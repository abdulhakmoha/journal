import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Activity, ShieldCheck, DollarSign } from 'lucide-react';

const Login = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', regCode: '' });
  const [error, setError] = useState('');
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = isLogin 
      ? await login(formData.email, formData.password)
      : await register(formData.name, formData.email, formData.password, formData.regCode);
    
    if (!res.success) setError(res.message);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at top right, rgba(56, 189, 248, 0.1), transparent), radial-gradient(circle at bottom left, rgba(129, 140, 248, 0.1), transparent)' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
        style={{ width: '100%', maxWidth: '450px', padding: '40px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', padding: '15px', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '20px', marginBottom: '20px' }}>
            <Activity size={32} color="var(--primary)" />
          </div>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem' }}>SomTrader</h1>
          <p style={{ color: 'var(--text-muted)' }}>{isLogin ? 'Access your professional trading journal.' : 'Start your performance tracking journey.'}</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <AnimatePresence mode="wait">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
              >
                <div className="input-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '0.85rem' }}>
                    <User size={16} /> Full Name
                  </label>
                  <input 
                    type="text" 
                    placeholder="E.g. Ahmed Ali" 
                    required 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="input-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '0.85rem' }}>
              <Mail size={16} /> Email Address
            </label>
            <input 
              type="email" 
              placeholder="name@email.com" 
              required 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="input-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '0.85rem' }}>
              <Lock size={16} /> Password
            </label>
            <input 
              type="password" 
              placeholder="••••••••" 
              required 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          {error && <p style={{ color: 'var(--danger)', fontSize: '0.85rem', textAlign: 'center' }}>{error}</p>}

          <button className="btn-primary" style={{ padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '10px' }}>
            {isLogin ? 'Sign In' : 'Create Account'}
            <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ marginTop: '30px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: 'bold', marginLeft: '8px', cursor: 'pointer' }}
          >
            {isLogin ? 'Register Now' : 'Sign In'}
          </button>
        </div>

        <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center', gap: '20px', opacity: 0.5 }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.7rem' }}>
             <ShieldCheck size={12} /> Secure Authentication
           </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
