import React from 'react';
import { LayoutDashboard, BookOpen, Target, Settings, Brain, PlusCircle, BarChart2, Zap, PlusSquare, LayoutList, FlaskConical, Calculator, LogOut, Globe, Shield, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const Sidebar = ({ activeTab, setActiveTab, disciplineScore, tradesCount }) => {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  
  const tradingItems = [
    { id: 'journal',     label: 'Trade Journal',      icon: LayoutList },
    { id: 'review',      label: 'Weekly Review',      icon: Target },
    { id: 'backtest',    label: 'Backtesting',        icon: FlaskConical },
  ];

  const analyticsItems = [
    { id: 'dashboard',   label: 'Dashboard',         icon: Zap },
    { id: 'performance', label: 'Analytics',          icon: BarChart2 },
    { id: 'mindset',     label: 'Mindset Journal',    icon: Brain },
    { id: 'calculator',  label: 'Risk Calculator',    icon: Calculator },
    { id: 'news',        label: 'Economic Calendar',  icon: Globe },
  ];

  const systemItems = [
    { id: 'settings',    label: 'Settings',           icon: Settings },
    { id: 'pricing',     label: 'Pricing & Plans',    icon: Award },
  ];

  const adminItems = [
    { id: 'admin-payments', label: 'Admin: Payments', icon: Shield },
  ];

  const translationKeys = {
    'dashboard': 'dashboard',
    'new-trade': 'newTrade',
    'journal': 'tradeJournal',
    'review': 'weeklyReview',
    'performance': 'analytics',
    'mindset': 'mindsetJournal',
    'backtest': 'backtesting',
    'calculator': 'riskCalculator',
    'news': 'economicCalendar',
    'settings': 'settings',
    'pricing': 'pricingPlans',
    'admin-payments': 'adminPayments'
  };

  return (
    <div className="sidebar glass" style={{ 
      width: '280px', 
      height: 'calc(100vh - 40px)', 
      margin: '20px', 
      padding: '20px', 
      position: 'sticky', 
      top: '20px',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div className="logo" style={{ marginBottom: '15px', position: 'relative', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h2 className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.03em' }}>SomTrader</h2>
          <div style={{ position: 'relative', display: 'flex', width: '8px', height: '8px', marginTop: '2px' }}>
            <span style={{ position: 'absolute', display: 'inline-flex', height: '100%', width: '100%', borderRadius: '50%', background: 'var(--primary)', opacity: 0.75, animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite' }}></span>
            <span style={{ position: 'relative', display: 'inline-flex', borderRadius: '50%', height: '8px', width: '8px', background: 'var(--primary)' }}></span>
          </div>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '2px' }}>Professional Performance Analytics</p>
        
        {/* Language Selection Toggle */}
        <div style={{ display: 'flex', gap: '6px', marginTop: '15px' }}>
          <button 
            onClick={() => setLanguage('en')}
            style={{
              padding: '4px 12px',
              fontSize: '0.7rem',
              borderRadius: '6px',
              border: 'none',
              background: language === 'en' ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
              color: language === 'en' ? 'var(--btn-text)' : 'var(--text-muted)',
              cursor: 'pointer',
              fontWeight: '700',
              transition: 'all 0.2s ease'
            }}
          >
            EN
          </button>
          <button 
            onClick={() => setLanguage('so')}
            style={{
              padding: '4px 12px',
              fontSize: '0.7rem',
              borderRadius: '6px',
              border: 'none',
              background: language === 'so' ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
              color: language === 'so' ? 'var(--btn-text)' : 'var(--text-muted)',
              cursor: 'pointer',
              fontWeight: '700',
              transition: 'all 0.2s ease'
            }}
          >
            SO
          </button>
        </div>
      </div>

      <button 
        className="btn-primary" 
        style={{ width: '100%', marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
        onClick={() => setActiveTab('new-trade')}
      >
        <PlusCircle size={20} />
        {t('newTrade')}
      </button>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {/* TRADING SECTION */}
        <div className="sidebar-section-header">{language === 'so' ? 'Ganacsiga' : 'Trading'}</div>
        {tradingItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 16px',
                borderRadius: '12px',
                border: 'none',
                borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                background: isActive ? 'linear-gradient(90deg, var(--primary-glow) 0%, transparent 100%)' : 'transparent',
                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left',
                width: '100%',
                fontWeight: isActive ? '600' : '400',
                paddingLeft: isActive ? '13px' : '16px',
                boxShadow: isActive ? 'inset 1px 0 0 rgba(255, 255, 255, 0.02)' : 'none'
              }}
            >
              <Icon size={18} />
              <span style={{ fontSize: '0.85rem' }}>{t(translationKeys[item.id] || item.id)}</span>
            </button>
          );
        })}

        {/* ANALYTICS SECTION */}
        <div className="sidebar-section-header">{language === 'so' ? 'Falanqaynta' : 'Analytics'}</div>
        {analyticsItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 16px',
                borderRadius: '12px',
                border: 'none',
                borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                background: isActive ? 'linear-gradient(90deg, var(--primary-glow) 0%, transparent 100%)' : 'transparent',
                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left',
                width: '100%',
                fontWeight: isActive ? '600' : '400',
                paddingLeft: isActive ? '13px' : '16px',
                boxShadow: isActive ? 'inset 1px 0 0 rgba(255, 255, 255, 0.02)' : 'none'
              }}
            >
              <Icon size={18} />
              <span style={{ fontSize: '0.85rem' }}>{t(translationKeys[item.id] || item.id)}</span>
            </button>
          );
        })}

        {/* SYSTEM SECTION */}
        <div className="sidebar-section-header">{language === 'so' ? 'Nidaamka' : 'System'}</div>
        {systemItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 16px',
                borderRadius: '12px',
                border: 'none',
                borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                background: isActive ? 'linear-gradient(90deg, var(--primary-glow) 0%, transparent 100%)' : 'transparent',
                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left',
                width: '100%',
                fontWeight: isActive ? '600' : '400',
                paddingLeft: isActive ? '13px' : '16px',
                boxShadow: isActive ? 'inset 1px 0 0 rgba(255, 255, 255, 0.02)' : 'none'
              }}
            >
              <Icon size={18} />
              <span style={{ fontSize: '0.85rem' }}>{t(translationKeys[item.id] || item.id)}</span>
            </button>
          );
        }) }

        {user?.isAdmin && (
          <>
            <div style={{ height: '1px', background: 'var(--border)', margin: '10px 0' }}></div>
            <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', paddingLeft: '16px', marginBottom: '8px' }}>Admin Panel</p>
            {adminItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: 'none',
                    borderLeft: isActive ? '3px solid var(--warning)' : '3px solid transparent',
                    background: isActive ? 'linear-gradient(90deg, rgba(245, 158, 11, 0.1) 0%, transparent 100%)' : 'transparent',
                    color: isActive ? 'var(--warning)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'left',
                    width: '100%',
                    fontWeight: isActive ? '600' : '400',
                    paddingLeft: isActive ? '13px' : '16px'
                  }}
                >
                  <Icon size={20} />
                  {t(translationKeys[item.id] || item.id)}
                </button>
              );
            })}
          </>
        )}
      </nav>

      <div style={{ marginTop: 'auto', padding: '20px 0' }}>
        <div className="glass-card" style={{ padding: '15px', fontSize: '0.85rem' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '5px' }}>{t('disciplineScore')}</p>
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
        
        {user?.subscription?.plan !== 'Premium' && !user?.isAdmin && (
          <div className="glass-card" style={{ padding: '15px', fontSize: '0.85rem', marginTop: '15px', cursor: 'pointer' }} onClick={() => setActiveTab('pricing')}>
            {(() => {
              const getRemainingTrialDays = () => {
                if (!user?.subscription?.endDate) return 0;
                const end = new Date(user.subscription.endDate);
                const now = new Date();
                const diffTime = end - now;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return Math.max(0, diffDays);
              };
              const remainingDays = getRemainingTrialDays();
              const isExpired = user?.subscription?.status === 'expired' || remainingDays <= 0;
              const isSo = language === 'so';
              
              return (
                <>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '5px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{isSo ? 'Maalmo Tijaabo ah' : 'Trial Days Left'}</span>
                    <span style={{ color: isExpired ? 'var(--danger)' : 'var(--warning)' }}>
                      {remainingDays} / 30
                    </span>
                  </p>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${(remainingDays / 30) * 100}%`, 
                      height: '100%', 
                      background: isExpired ? 'var(--danger)' : 'var(--warning)',
                      boxShadow: `0 0 10px ${isExpired ? 'rgba(239, 68, 68, 0.5)' : 'rgba(245, 158, 11, 0.5)'}`,
                      transition: 'width 1s ease'
                    }}></div>
                  </div>
                  {isExpired && (
                    <p style={{ color: 'var(--danger)', fontSize: '0.7rem', marginTop: '8px', textAlign: 'center' }}>
                      {isSo ? 'Tijaabadii way dhammaatay. Fadlan iska bixi.' : 'Trial has ended. Please subscribe.'}
                    </p>
                  )}
                </>
              );
            })()}
          </div>
        )}

        <button 
          onClick={() => { if(window.confirm(t('confirmLogout'))) logout(); }}
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
          {t('signOut')}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
