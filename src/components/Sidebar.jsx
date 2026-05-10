import React from 'react';
import { LayoutDashboard, BookOpen, Target, Settings, Brain, PlusCircle, BarChart2, Zap, PlusSquare, LayoutList, FlaskConical, Calculator, LogOut, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ activeTab, setActiveTab, disciplineScore }) => {
  const { logout } = useAuth();
  const menuItems = [
    { id: 'dashboard',   label: 'Dashboard',         icon: Zap },
    { id: 'new-trade',   label: 'New Trade',          icon: PlusSquare },
    { id: 'journal',     label: 'Trade Journal',      icon: LayoutList },
    { id: 'performance', label: 'Analytics',          icon: BarChart2 },
    { id: 'news',        label: 'Economic Calendar',  icon: Globe },
    { id: 'review',      label: 'Weekly Review',      icon: Target },
    { id: 'backtest',    label: 'Backtesting',        icon: FlaskConical },
    { id: 'calculator',  label: 'Risk Calculator',    icon: Calculator },
    { id: 'mindset',     label: 'Mindset Journal',    icon: Brain },
    { id: 'settings',    label: 'Settings',           icon: Settings },
  ];

  return (
    <div className="sidebar glass" style={{ 
      width: '280px', 
      height: 'calc(100vh - 40px)', 
      margin: '20px', 
      padding: '30px', 
      position: 'sticky', 
      top: '20px',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div className="logo" style={{ marginBottom: '40px' }}>
        <h2 className="text-gradient" style={{ fontSize: '1.5rem' }}>ZenTrader</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Master Your Mindset</p>
      </div>

      <button 
        className="btn-primary" 
        style={{ width: '100%', marginBottom: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
        onClick={() => setActiveTab('new-trade')}
      >
        <PlusCircle size={20} />
        New Trade
      </button>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <React.Fragment key={item.id}>
              {item.id === 'settings' && <div style={{ height: '1px', background: 'var(--border)', margin: '10px 0' }}></div>}
              <button
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: 'none',
                  background: isActive ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                  color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                  width: '100%',
                  fontWeight: isActive ? '600' : '400'
                }}
              >
                <Icon size={20} />
                {item.label}
              </button>
            </React.Fragment>
          );
        })}
      </nav>

      <div style={{ marginTop: 'auto', padding: '20px 0' }}>
        <div className="glass-card" style={{ padding: '15px', fontSize: '0.85rem' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '5px' }}>Discipline Score</p>
          <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ 
              width: `${disciplineScore}%`, 
              height: '100%', 
              background: disciplineScore > 70 ? 'var(--success)' : disciplineScore > 40 ? 'var(--warning)' : 'var(--danger)',
              boxShadow: `0 0 10px ${disciplineScore > 70 ? 'rgba(16, 185, 129, 0.5)' : 'rgba(245, 158, 11, 0.5)'}`,
              transition: 'width 1s ease'
            }}></div>
          </div>
          <p style={{ textAlign: 'right', marginTop: '5px', fontWeight: 'bold' }}>{disciplineScore}%</p>
        </div>
        <button 
          onClick={() => { if(window.confirm('Ma hubtaa inaad ka baxdo?')) logout(); }}
          style={{ 
            width: '100%', 
            marginTop: '20px', 
            padding: '12px', 
            background: 'rgba(239, 68, 68, 0.05)', 
            border: '1px solid rgba(239, 68, 68, 0.2)', 
            color: 'var(--danger)', 
            borderRadius: '12px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '10px',
            cursor: 'pointer'
          }}
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
