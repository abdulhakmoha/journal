import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle size={20} color="#10b981" />,
    error: <AlertCircle size={20} color="#ef4444" />,
    info: <Info size={20} color="#38bdf8" />
  };

  const colors = {
    success: 'rgba(16, 185, 129, 0.1)',
    error: 'rgba(239, 68, 68, 0.1)',
    info: 'rgba(56, 189, 248, 0.1)'
  };

  const borderColors = {
    success: '#10b981',
    error: '#ef4444',
    info: '#38bdf8'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, x: '-50%' }}
      animate={{ opacity: 1, y: 20, x: '-50%' }}
      exit={{ opacity: 0, y: -50, x: '-50%' }}
      style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        zIndex: 9999,
        minWidth: '320px',
        padding: '16px 20px',
        borderRadius: '12px',
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(10px)',
        border: `1px solid ${borderColors[type]}`,
        boxShadow: `0 10px 30px rgba(0,0,0,0.5), 0 0 15px ${borderColors[type]}33`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '15px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {icons[type]}
        <span style={{ color: 'white', fontSize: '0.9rem', fontWeight: '500' }}>{message}</span>
      </div>
      <button 
        onClick={onClose}
        style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
      >
        <X size={16} />
      </button>
    </motion.div>
  );
};

export default Toast;
