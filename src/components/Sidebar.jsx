import React from 'react';
import { LayoutDashboard, BookOpen, Target, Settings, Brain, PlusCircle, BarChart2, Zap, PlusSquare, LayoutList, FlaskConical, Calculator, LogOut, Globe, Shield, Award, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const Sidebar = ({ activeTab, setActiveTab, disciplineScore, tradesCount, accounts = [], selectedAccount, setSelectedAccount, onOpenNewTrade }) => {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const tradingItems = [
    { id: 'journal',     label: 'Trade Journal',     icon: LayoutList },
    { id: 'review',      label: 'Weekly Review',     icon: Target },
    { id: 'backtest',    label: 'Backtesting',       icon: FlaskConical },
  ];

  const analyticsItems = [
    { id: 'dashboard',   label: 'Dashboard',         icon: Zap },
    { id: 'performance', label: 'Analytics',         icon: BarChart2 },
    { id: 'mindset',     label: 'Mindset Journal',   icon: Brain },
    { id: 'calculator',  label: 'Risk Calculator',   icon: Calculator },
    { id: 'news',        label: 'Economic Calendar', icon: Globe },
  ];

  const systemItems = [
    { id: 'settings',   label: 'Settings',          icon: Settings },
    { id: 'pricing',    label: 'Pricing & Plans',   icon: Award },
  ];

  const adminItems = [
    { id: 'admin-payments', label: 'Admin: Payments', icon: Shield },
  ];

  const translationKeys = {
    'dashboard': 'dashboard', 'new-trade': 'newTrade', 'journal': 'tradeJournal',
    'review': 'weeklyReview', 'performance': 'analytics', 'mindset': 'mindsetJournal',
    'backtest': 'backtesting', 'calculator': 'riskCalculator', 'news': 'economicCalendar',
    'settings': 'settings', 'pricing': 'pricingPlans', 'admin-payments': 'adminPayments'
  };

  const NavItem = ({ item, accentOverride }) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;
    const accent = accentOverride || '#00C896';
    return (
      <button
        key={item.id}
        onClick={() => setActiveTab(item.id)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '11px',
          padding: '9px 14px',
          borderRadius: '10px',
          border: 'none',
          background: isActive ? 'rgba(0,200,150,0.12)' : 'transparent',
          color: isActive ? '#ffffff' : 'rgba(255,255,255,0.5)',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          textAlign: 'left',
          width: '100%',
          fontWeight: isActive ? '600' : '400',
          fontSize: '0.85rem',
          letterSpacing: '0.01em',
          position: 'relative',
        }}
        onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; }}
        onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}}
      >
        {/* Active indicator — Meridian Mint */}
        {isActive && (
          <div style={{
            position: 'absolute', left: 0, top: '20%', height: '60%',
            width: '3px', borderRadius: '0 3px 3px 0',
            background: 'linear-gradient(180deg, #00C896, #00A87E)'
          }} />
        )}
        <div style={{
          width: '30px', height: '30px', borderRadius: '8px', flexShrink: 0,
          background: isActive ? 'rgba(0,200,150,0.2)' : 'rgba(255,255,255,0.05)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.15s ease'
        }}>
          <Icon size={15} color={isActive ? '#00C896' : 'rgba(255,255,255,0.45)'} />
        </div>
        <span>{t(translationKeys[item.id] || item.id)}</span>
      </button>
    );
  };

  const SectionLabel = ({ label }) => (
    <div style={{
      fontSize: '0.58rem', fontWeight: '700', letterSpacing: '0.1em',
      color: 'rgba(255,255,255,0.25)', margin: '16px 0 5px 14px',
      textTransform: 'uppercase'
    }}>{label}</div>
  );

  return (
    <div
      className="sidebar"
      style={{
        width: '240px',
        minHeight: '100vh',
        background: '#0D1F45',
        display: 'flex',
        flexDirection: 'column',
        padding: '0',
        position: 'sticky',
        top: 0,
        overflowY: 'auto',
        flexShrink: 0,
        borderRight: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {/* Logo */}
      <div style={{ padding: '24px 18px 16px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '10px',
            background: '#00C896',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(0,200,150,0.35)'
          }}>
            <TrendingUp size={18} color="#0D1F45" />
          </div>
          <div>
            <div style={{ fontWeight: '800', fontSize: '1rem', color: '#ffffff', letterSpacing: '-0.02em' }}>
              SomTrader
            </div>
            <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.35)', marginTop: '-1px' }}>Pro Analytics</div>
          </div>
        </div>

        {/* Lang toggle */}
        <div style={{ display: 'flex', gap: '5px', marginTop: '14px', background: 'rgba(255,255,255,0.06)', padding: '3px', borderRadius: '8px' }}>
          {['EN', 'SO'].map(lang => (
            <button
              key={lang}
              onClick={() => setLanguage(lang.toLowerCase())}
              style={{
                flex: 1, padding: '4px 0', fontSize: '0.68rem', borderRadius: '6px',
                border: 'none', fontWeight: '700', cursor: 'pointer', transition: 'all 0.15s ease',
                background: language === lang.toLowerCase() ? '#1A3B6E' : 'transparent',
                color: language === lang.toLowerCase() ? 'white' : 'rgba(255,255,255,0.4)',
              }}
            >{lang}</button>
          ))}
        </div>
      </div>

      {/* New Trade CTA */}
      <div style={{ padding: '0 12px 12px 12px' }}>
        <button
          onClick={onOpenNewTrade}
          style={{
            width: '100%', padding: '10px', borderRadius: '10px', border: 'none',
            background: '#00C896',
            color: '#0D1F45', fontWeight: '700', fontSize: '0.82rem',
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '8px', transition: 'all 0.2s ease',
            boxShadow: '0 4px 14px rgba(0,200,150,0.35)',
            letterSpacing: '0.01em'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#00A87E'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#00C896'; }}
        >
          <PlusCircle size={16} /> {t('newTrade')}
        </button>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0 12px 4px 12px' }} />

      {/* Nav */}
      <nav style={{ flex: 1, padding: '4px 10px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <SectionLabel label={language === 'so' ? 'Ganacsiga' : 'Trading'} />
        {tradingItems.map(item => <NavItem key={item.id} item={item} />)}

        <SectionLabel label={language === 'so' ? 'Falanqaynta' : 'Analytics'} />
        {analyticsItems.map(item => <NavItem key={item.id} item={item} />)}

        <SectionLabel label={language === 'so' ? 'Akoonnada' : 'Portfolios'} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingLeft: '4px', paddingRight: '4px', marginBottom: '8px' }}>
          {accounts.map(acc => {
            const isActive = selectedAccount === acc.name;
            const icon = acc.type === 'Challenge' ? '⚔️' : acc.type === 'Funded' ? '💰' : acc.type === 'Personal' ? '👤' : '🔬';
            return (
              <button
                key={acc._id || acc.id}
                onClick={() => {
                  setSelectedAccount(acc.name);
                  if (activeTab !== 'dashboard' && activeTab !== 'journal') {
                    setActiveTab('dashboard');
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '7px 10px',
                  borderRadius: '8px',
                  border: 'none',
                  background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                  color: isActive ? '#ffffff' : 'rgba(255,255,255,0.5)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  width: '100%',
                  fontSize: '0.8rem',
                  textAlign: 'left'
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                  <span style={{ fontSize: '0.85rem' }}>{icon}</span>
                  <span style={{ 
                    whiteSpace: 'nowrap', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis',
                    fontWeight: isActive ? '600' : '400'
                  }}>{acc.name}</span>
                </div>
                <span style={{
                  fontSize: '0.58rem',
                  fontWeight: '700',
                  background: isActive ? '#00C896' : 'rgba(255,255,255,0.05)',
                  color: isActive ? '#0D1F45' : 'rgba(255,255,255,0.3)',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  textTransform: 'uppercase'
                }}>{acc.type}</span>
              </button>
            );
          })}
          <button
            onClick={() => {
              setSelectedAccount('All Accounts');
              if (activeTab !== 'dashboard' && activeTab !== 'journal') {
                setActiveTab('dashboard');
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '7px 10px',
              borderRadius: '8px',
              border: 'none',
              background: selectedAccount === 'All Accounts' ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: selectedAccount === 'All Accounts' ? '#ffffff' : 'rgba(255,255,255,0.5)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              width: '100%',
              fontSize: '0.8rem',
              textAlign: 'left',
              gap: '8px'
            }}
            onMouseEnter={e => { if (selectedAccount !== 'All Accounts') e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
            onMouseLeave={e => { if (selectedAccount !== 'All Accounts') e.currentTarget.style.background = 'transparent'; }}
          >
            <span style={{ fontSize: '0.85rem' }}>📂</span>
            <span style={{ fontWeight: selectedAccount === 'All Accounts' ? '600' : '400' }}>
              {language === 'so' ? 'Dhammaan' : 'All Accounts'}
            </span>
          </button>
        </div>

        <SectionLabel label={language === 'so' ? 'Nidaamka' : 'System'} />
        {systemItems.map(item => <NavItem key={item.id} item={item} />)}

        {user?.isAdmin && (
          <>
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '8px 4px' }} />
            <SectionLabel label="Admin" />
            {adminItems.map(item => <NavItem key={item.id} item={item} accentOverride="#f59e0b" />)}
          </>
        )}
      </nav>

      {/* Bottom Section */}
      <div style={{ padding: '12px 10px 16px 10px' }}>
        {/* Discipline Score */}
        <div style={{
          background: 'rgba(255,255,255,0.05)', borderRadius: '12px',
          padding: '14px', marginBottom: '8px',
          border: '1px solid rgba(255,255,255,0.07)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>
              {t('disciplineScore')}
            </span>
            <span style={{
              fontSize: '0.78rem', fontWeight: '800',
              color: disciplineScore > 70 ? '#00C896' : disciplineScore > 40 ? '#F0A500' : '#C0392B'
            }}>{disciplineScore}%</span>
          </div>
          <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{
              width: `${disciplineScore}%`, height: '100%',
              background: disciplineScore > 70
                ? 'linear-gradient(90deg, #00A87E, #00C896)'
                : disciplineScore > 40
                  ? 'linear-gradient(90deg, #c77c00, #F0A500)'
                  : 'linear-gradient(90deg, #A33030, #C0392B)',
              transition: 'width 1s ease',
              borderRadius: '10px'
            }} />
          </div>
        </div>

        {/* Trial badge */}
        {user?.subscription?.plan !== 'Premium' && !user?.isAdmin && (() => {
          const end = new Date(user?.subscription?.endDate);
          const days = Math.max(0, Math.ceil((end - new Date()) / 86400000));
          const expired = user?.subscription?.status === 'expired' || days <= 0;
          return (
            <div
              onClick={() => setActiveTab('pricing')}
              style={{
                background: expired ? 'rgba(220,38,38,0.1)' : 'rgba(245,158,11,0.08)',
                border: `1px solid ${expired ? 'rgba(220,38,38,0.2)' : 'rgba(245,158,11,0.2)'}`,
                borderRadius: '10px', padding: '10px 12px', cursor: 'pointer',
                marginBottom: '8px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>
                  {language === 'so' ? 'Maalmo Tijaabo' : 'Trial Days'}
                </span>
                <span style={{ fontSize: '0.72rem', fontWeight: '800', color: expired ? '#f87171' : '#fbbf24' }}>
                  {days}/30
                </span>
              </div>
              <div style={{ height: '3px', background: 'rgba(255,255,255,0.08)', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{
                  width: `${(days / 30) * 100}%`, height: '100%',
                  background: expired ? '#ef4444' : '#f59e0b', borderRadius: '10px', transition: 'width 1s ease'
                }} />
              </div>
            </div>
          );
        })()}

        {/* Logout */}
        <button
          onClick={() => { if (window.confirm(t('confirmLogout'))) logout(); }}
          style={{
            width: '100%', padding: '9px 12px', borderRadius: '10px',
            background: 'rgba(192,57,43,0.07)', border: '1px solid rgba(192,57,43,0.15)',
            color: '#E74C3C', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '8px', cursor: 'pointer',
            fontSize: '0.8rem', fontWeight: '600', transition: 'all 0.15s ease'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(192,57,43,0.14)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(192,57,43,0.07)'; }}
        >
          <LogOut size={15} /> {t('signOut')}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
