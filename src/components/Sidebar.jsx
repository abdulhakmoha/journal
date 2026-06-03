import React from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  Target, 
  Settings, 
  Brain, 
  PlusCircle, 
  BarChart2, 
  Zap, 
  PlusSquare, 
  LayoutList, 
  FlaskConical, 
  Calculator, 
  LogOut, 
  Globe, 
  Shield, 
  Award, 
  TrendingUp,
  ChevronRight 
} from 'lucide-react';
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
    return (
      <button
        key={item.id}
        onClick={() => setActiveTab(item.id)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '11px',
          padding: '10px 14px',
          borderRadius: '10px',
          border: 'none',
          background: isActive ? 'var(--white)' : 'transparent',
          color: isActive ? 'var(--navy)' : 'var(--slate-mid)',
          boxShadow: isActive ? '0 4px 12px rgba(26, 59, 110, 0.06)' : 'none',
          cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          textAlign: 'left',
          width: '100%',
          fontWeight: isActive ? '600' : '500',
          fontSize: '13px',
          letterSpacing: '0.01em',
          position: 'relative',
        }}
        onMouseEnter={e => { 
          if (!isActive) {
            e.currentTarget.style.background = 'rgba(26, 59, 110, 0.04)'; 
            e.currentTarget.style.color = 'var(--navy)';
          } 
        }}
        onMouseLeave={e => { 
          if (!isActive) { 
            e.currentTarget.style.background = 'transparent'; 
            e.currentTarget.style.color = 'var(--slate-mid)'; 
          }
        }}
      >
        {/* Active indicator bar - beautifully rounded and styled like the 2nd image */}
        {isActive && (
          <div style={{
            position: 'absolute', 
            left: '4px', 
            top: '15%', 
            height: '70%',
            width: '4px', 
            borderRadius: '4px',
            background: 'linear-gradient(180deg, var(--mint), var(--navy))'
          }} />
        )}
        <div style={{
          width: '28px', height: '28px', borderRadius: '6px', flexShrink: 0,
          background: isActive ? 'var(--frost)' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.15s ease'
        }}>
          <Icon size={15} color={isActive ? 'var(--navy)' : 'var(--slate-mid)'} />
        </div>
        <span>{t(translationKeys[item.id] || item.id)}</span>

        {isActive && (
          <ChevronRight size={14} style={{ marginLeft: 'auto', color: 'var(--slate-light)' }} />
        )}
      </button>
    );
  };

  const SectionLabel = ({ label }) => (
    <div style={{
      fontSize: '11px', 
      fontWeight: '700', 
      letterSpacing: '0.05em',
      color: 'var(--slate-light)', 
      margin: '16px 0 5px 14px',
      textTransform: 'uppercase'
    }}>{label}</div>
  );

  return (
    <div
      className="sidebar"
      style={{
        width: '240px',
        minHeight: '100vh',
        background: 'var(--frost)',
        display: 'flex',
        flexDirection: 'column',
        padding: '0',
        position: 'sticky',
        top: 0,
        overflowY: 'auto',
        flexShrink: 0,
        borderRight: '1px solid var(--frost-mid)',
      }}
    >
      {/* Logo Section */}
      <div style={{ padding: '24px 18px 16px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '10px',
            background: 'var(--mint)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--shadow-mint)'
          }}>
            <TrendingUp size={18} color="var(--navy-deepest)" />
          </div>
          <div>
            <div style={{ fontWeight: '800', fontSize: '16px', color: 'var(--navy)', letterSpacing: '-0.02em' }}>
              SomTrader
            </div>
            <div style={{ fontSize: '11px', color: 'var(--slate-mid)', marginTop: '-1px' }}>Pro Analytics</div>
          </div>
        </div>

        {/* Lang toggle */}
        <div style={{ 
          display: 'flex', 
          gap: '4px', 
          marginTop: '16px', 
          background: 'rgba(26, 59, 110, 0.05)', 
          padding: '3px', 
          borderRadius: '8px' 
        }}>
          {['EN', 'SO'].map(lang => {
            const isSelected = language === lang.toLowerCase();
            return (
              <button
                key={lang}
                onClick={() => setLanguage(lang.toLowerCase())}
                style={{
                  flex: 1, 
                  padding: '5px 0', 
                  fontSize: '11px', 
                  borderRadius: '6px',
                  border: 'none', 
                  fontWeight: '700', 
                  cursor: 'pointer', 
                  transition: 'all 0.15s ease',
                  background: isSelected ? 'var(--white)' : 'transparent',
                  color: isSelected ? 'var(--navy)' : 'var(--slate-mid)',
                  boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                }}
              >{lang}</button>
            );
          })}
        </div>
      </div>

      {/* New Trade CTA */}
      <div style={{ padding: '0 12px 12px 12px' }}>
        <button
          onClick={onOpenNewTrade}
          style={{
            width: '100%', 
            padding: '10px', 
            borderRadius: '10px', 
            border: 'none',
            background: 'var(--mint)',
            color: 'var(--navy-dark)', 
            fontWeight: '600', 
            fontSize: '13px',
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'center', 
            gap: '8px', 
            transition: 'all 0.2s ease',
            boxShadow: 'var(--shadow-mint)',
            letterSpacing: '0.01em'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--mint-dark)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--mint)'; }}
        >
          <PlusCircle size={16} /> {t('newTrade')}
        </button>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: 'var(--border)', margin: '0 12px 4px 12px' }} />

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
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: 'none',
                  background: isActive ? 'var(--white)' : 'transparent',
                  color: isActive ? 'var(--navy)' : 'var(--slate-mid)',
                  boxShadow: isActive ? '0 4px 12px rgba(26, 59, 110, 0.05)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  width: '100%',
                  fontSize: '13px',
                  textAlign: 'left',
                  position: 'relative'
                }}
                onMouseEnter={e => { 
                  if (!isActive) e.currentTarget.style.background = 'rgba(26, 59, 110, 0.04)'; 
                }}
                onMouseLeave={e => { 
                  if (!isActive) e.currentTarget.style.background = 'transparent'; 
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                  {isActive && (
                    <div style={{
                      position: 'absolute', left: '2px', top: '20%', height: '60%',
                      width: '3px', borderRadius: '3px',
                      background: 'linear-gradient(180deg, var(--mint), var(--navy))'
                    }} />
                  )}
                  <span style={{ fontSize: '13px' }}>{icon}</span>
                  <span style={{ 
                    whiteSpace: 'nowrap', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis',
                    fontWeight: isActive ? '600' : '400'
                  }}>{acc.name}</span>
                </div>
                <span style={{
                  fontSize: '10px',
                  fontWeight: '700',
                  background: isActive ? 'var(--navy)' : 'var(--frost-mid)',
                  color: isActive ? 'var(--white)' : 'var(--slate)',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  textTransform: 'uppercase',
                  transition: 'all 0.15s ease'
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
              padding: '8px 10px',
              borderRadius: '8px',
              border: 'none',
              background: selectedAccount === 'All Accounts' ? 'var(--white)' : 'transparent',
              color: selectedAccount === 'All Accounts' ? 'var(--navy)' : 'var(--slate-mid)',
              boxShadow: selectedAccount === 'All Accounts' ? '0 4px 12px rgba(26, 59, 110, 0.05)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              width: '100%',
              fontSize: '13px',
              textAlign: 'left',
              gap: '8px',
              position: 'relative'
            }}
            onMouseEnter={e => { 
              if (selectedAccount !== 'All Accounts') e.currentTarget.style.background = 'rgba(26, 59, 110, 0.04)'; 
            }}
            onMouseLeave={e => { 
              if (selectedAccount !== 'All Accounts') e.currentTarget.style.background = 'transparent'; 
            }}
          >
            {selectedAccount === 'All Accounts' && (
              <div style={{
                position: 'absolute', left: '2px', top: '20%', height: '60%',
                width: '3px', borderRadius: '3px',
                background: 'linear-gradient(180deg, var(--mint), var(--navy))'
              }} />
            )}
            <span style={{ fontSize: '13px' }}>📂</span>
            <span style={{ fontWeight: selectedAccount === 'All Accounts' ? '600' : '400' }}>
              {language === 'so' ? 'Dhammaan' : 'All Accounts'}
            </span>
          </button>
        </div>

        <SectionLabel label={language === 'so' ? 'Nidaamka' : 'System'} />
        {systemItems.map(item => <NavItem key={item.id} item={item} />)}

        {user?.isAdmin && (
          <>
            <div style={{ height: '1px', background: 'var(--border)', margin: '8px 4px' }} />
            <SectionLabel label="Admin" />
            {adminItems.map(item => <NavItem key={item.id} item={item} />)}
          </>
        )}
      </nav>

      {/* Bottom Section */}
      <div style={{ padding: '12px 10px 16px 10px' }}>
        {/* Discipline Score */}
        <div style={{
          background: 'var(--white)', 
          borderRadius: '12px',
          padding: '14px', 
          marginBottom: '8px',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', color: 'var(--slate-mid)', fontWeight: '600' }}>
              {t('disciplineScore')}
            </span>
            <span style={{
              fontSize: '13px', fontWeight: '800',
              color: disciplineScore > 70 ? 'var(--mint-dark)' : disciplineScore > 40 ? 'var(--warning)' : 'var(--danger)'
            }}>{disciplineScore}%</span>
          </div>
          <div style={{ height: '4px', background: 'var(--frost-mid)', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{
              width: `${disciplineScore}%`, height: '100%',
              background: disciplineScore > 70
                ? 'linear-gradient(90deg, var(--mint-dark), var(--mint))'
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
                background: expired ? 'var(--danger-bg)' : 'var(--warning-bg)',
                border: `1px solid ${expired ? 'rgba(192,57,43,0.15)' : 'rgba(160,92,16,0.15)'}`,
                borderRadius: '10px', 
                padding: '10px 12px', 
                cursor: 'pointer',
                marginBottom: '8px',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ fontSize: '11px', color: 'var(--slate-mid)', fontWeight: '600' }}>
                  {language === 'so' ? 'Maalmo Tijaabo' : 'Trial Days'}
                </span>
                <span style={{ fontSize: '12px', fontWeight: '800', color: expired ? 'var(--danger)' : 'var(--warning)' }}>
                  {days}/30
                </span>
              </div>
              <div style={{ height: '3px', background: 'rgba(26, 59, 110, 0.08)', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{
                  width: `${(days / 30) * 100}%`, height: '100%',
                  background: expired ? 'var(--danger)' : 'var(--warning)', borderRadius: '10px', transition: 'width 1s ease'
                }} />
              </div>
            </div>
          );
        })()}

        {/* Logout */}
        <button
          onClick={() => { if (window.confirm(t('confirmLogout'))) logout(); }}
          style={{
            width: '100%', 
            padding: '9px 12px', 
            borderRadius: '10px',
            background: 'rgba(192,57,43,0.04)', 
            border: '1px solid rgba(192,57,43,0.12)',
            color: 'var(--danger)', 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'center', 
            gap: '8px', 
            cursor: 'pointer',
            fontSize: '13px', 
            fontWeight: '600', 
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={e => { 
            e.currentTarget.style.background = 'rgba(192,57,43,0.08)'; 
          }}
          onMouseLeave={e => { 
            e.currentTarget.style.background = 'rgba(192,57,43,0.04)'; 
          }}
        >
          <LogOut size={15} /> {t('signOut')}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
