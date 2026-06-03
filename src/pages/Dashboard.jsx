import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown,
  Award, 
  Zap, 
  Target, 
  Activity, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle,
  Calendar,
  Layers,
  LineChart as ChartIcon 
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useLanguage } from '../context/LanguageContext';

const Dashboard = ({ trades, accounts, selectedAccount, setSelectedAccount }) => {
  const { language } = useLanguage();
  const selectedChartAccount = selectedAccount;

  // Active trades based on selection
  const activeTrades = selectedChartAccount === 'All Accounts'
    ? trades
    : trades.filter(t => t.account === selectedChartAccount);

  // Calculate Account Health
  const accountStats = (accounts || []).map(acc => {
    const accTrades = trades.filter(t => t.account === acc.name);
    let totalPL = 0;
    accTrades.forEach(t => {
      const isPips = t.riskUnit === 'Pips';
      const riskPercent = parseFloat(t.riskPercent) || 1;
      
      if (t.status === 'Win') {
        totalPL += isPips ? (parseFloat(t.rr || 0) * riskPercent) : parseFloat(t.reward || 0);
      } else if (t.status === 'Loss') {
        totalPL += isPips ? -riskPercent : parseFloat(t.reward || 0);
      }
    });
    
    const isBlown = totalPL <= -10; 
    const isPassed = acc.target > 0 && totalPL >= acc.target;

    return {
      ...acc,
      currentPL: totalPL.toFixed(2),
      isBlown,
      isPassed,
      tradeCount: accTrades.length
    };
  });

  // Calculate Equity Curve Data
  const getEquityData = () => {
    const filteredTrades = selectedChartAccount === 'All Accounts' 
      ? [...trades].reverse() 
      : [...trades].filter(t => t.account === selectedChartAccount).reverse();

    let cumulativePL = 0;
    const data = [{ name: 'Start', pl: 0 }];
    
    filteredTrades.forEach((t, i) => {
      const isPips = t.riskUnit === 'Pips';
      const riskPercent = parseFloat(t.riskPercent) || 1;

      if (t.status === 'Win') {
        cumulativePL += isPips ? (parseFloat(t.rr || 0) * riskPercent) : parseFloat(t.reward || 0);
      } else if (t.status === 'Loss') {
        cumulativePL += isPips ? -riskPercent : parseFloat(t.reward || 0);
      }
      data.push({
        name: `T${i + 1}`,
        pl: parseFloat(cumulativePL.toFixed(2)),
        symbol: t.symbol,
        result: t.status
      });
    });

    return data;
  };

  const equityData = getEquityData();
  const currentPL = equityData[equityData.length - 1]?.pl || 0;
  const totalPips = activeTrades.reduce((acc, t) => acc + (parseFloat(t.pips) || 0), 0);

  const calculateDisciplineScore = () => {
    if (activeTrades.length === 0) return 0;
    const highGrades = activeTrades.filter(t => ['A+', 'A'].includes(t.grade)).length;
    return Math.round((highGrades / activeTrades.length) * 100);
  };

  const disciplineScore = calculateDisciplineScore();

  // Prop Firm Objectives Calculations
  const getObjectives = () => {
    // 1. Minimum Trading Days
    const dates = activeTrades.map(t => new Date(t.timestamp).toDateString());
    const uniqueDays = new Set(dates).size;
    const daysTarget = 5;
    const daysStatus = uniqueDays >= daysTarget ? 'pass' : 'progress';

    // 2. Max Daily Loss (-5%)
    const dailyPLs = {};
    activeTrades.forEach(t => {
      const dateStr = new Date(t.timestamp).toDateString();
      const isPips = t.riskUnit === 'Pips';
      const riskPercent = parseFloat(t.riskPercent) || 1;
      let tradePL = 0;
      if (t.status === 'Win') {
        tradePL = isPips ? (parseFloat(t.rr || 0) * riskPercent) : parseFloat(t.reward || 0);
      } else if (t.status === 'Loss') {
        tradePL = isPips ? -riskPercent : parseFloat(t.reward || 0);
      }
      dailyPLs[dateStr] = (dailyPLs[dateStr] || 0) + tradePL;
    });
    const dailyPLValues = Object.values(dailyPLs);
    const worstDay = dailyPLValues.length > 0 ? Math.min(...dailyPLValues) : 0;
    const maxDailyLossLimit = -5.00;
    const dailyLossStatus = worstDay <= maxDailyLossLimit ? 'fail' : (activeTrades.length > 0 ? 'pass' : 'progress');

    // 3. Max Loss (-10%)
    let worstPeak = 0;
    let runPL = 0;
    const chronTrades = [...activeTrades].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    chronTrades.forEach(t => {
      const isPips = t.riskUnit === 'Pips';
      const riskPercent = parseFloat(t.riskPercent) || 1;
      let tradePL = 0;
      if (t.status === 'Win') {
        tradePL = isPips ? (parseFloat(t.rr || 0) * riskPercent) : parseFloat(t.reward || 0);
      } else if (t.status === 'Loss') {
        tradePL = isPips ? -riskPercent : parseFloat(t.reward || 0);
      }
      runPL += tradePL;
      if (runPL < worstPeak) worstPeak = runPL;
    });
    const maxLossLimit = -10.00;
    const maxLossStatus = worstPeak <= maxLossLimit ? 'fail' : (activeTrades.length > 0 ? 'pass' : 'progress');

    // 4. Profit Target
    const activeAccount = accounts.find(a => a.name === selectedChartAccount) || { target: 8, initialBalance: 10000, type: 'Challenge' };
    const targetVal = parseFloat(activeAccount.target) || 8;
    const profitStatus = currentPL >= targetVal ? 'pass' : 'progress';

    return [
      {
        name: 'Minimum Trading Days',
        nameSo: 'Maalmaha Ugu Yar ee Ganacsiga',
        target: `${daysTarget} Days`,
        current: `${uniqueDays} Days`,
        status: daysStatus
      },
      {
        name: 'Max Daily Loss Limit',
        nameSo: 'Xadka Khasaaraha Maalintii',
        target: `${maxDailyLossLimit.toFixed(2)}%`,
        current: `${worstDay >= 0 ? '+' : ''}${worstDay.toFixed(2)}%`,
        status: dailyLossStatus
      },
      {
        name: 'Max Loss Limit',
        nameSo: 'Xadka Khasaaraha Guud',
        target: `${maxLossLimit.toFixed(2)}%`,
        current: `${worstPeak >= 0 ? '+' : ''}${worstPeak.toFixed(2)}%`,
        status: maxLossStatus
      },
      {
        name: 'Profit Target',
        nameSo: 'Bartilmaameedka Faa\'iidada',
        target: `${targetVal >= 0 ? '+' : ''}${targetVal.toFixed(2)}%`,
        current: `${currentPL >= 0 ? '+' : ''}${currentPL.toFixed(2)}%`,
        status: profitStatus
      }
    ];
  };

  const objectives = getObjectives();

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      if (data.name === 'Start') return null;
      const isWin = data.result === 'Win';
      return (
        <div className="glass-card" style={{ padding: '12px 16px', border: '1px solid var(--border)', background: 'rgba(15, 23, 42, 0.95)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '5px', fontWeight: '700', textTransform: 'uppercase' }}>
            Trade {data.name.replace('T', '')}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontWeight: 'bold', fontSize: '1rem' }}>{data.symbol}</span>
            <span style={{ 
              fontSize: '0.65rem', 
              fontWeight: '800', 
              padding: '2px 6px', 
              borderRadius: '4px',
              background: isWin ? 'rgba(0, 200, 150, 0.15)' : 'rgba(192, 57, 43, 0.15)',
              color: isWin ? 'var(--success)' : 'var(--danger)'
            }}>
              {data.result ? data.result.toUpperCase() : 'N/A'}
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', fontWeight: '600' }}>
            Cumulative P&L: <span style={{ color: data.pl >= 0 ? 'var(--success)' : 'var(--danger)' }}>{data.pl >= 0 ? '+' : ''}{data.pl}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Top Header Selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2 className="text-gradient" style={{ fontSize: '1.8rem', fontWeight: '800' }}>
            {language === 'so' ? 'Qaybta Falanqaynta' : 'Trading Dashboard'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            {language === 'so' ? 'Kormeer oo falanqee natiijooyinka akoonnadaada.' : 'Track and analyze your professional trading account performance.'}
          </p>
        </div>
        <div className="glass" style={{ padding: '5px 12px', display: 'flex', alignItems: 'center', gap: '10px', borderRadius: '12px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', paddingLeft: '4px' }}>
            {language === 'so' ? 'Akoonka:' : 'Account:'}
          </span>
          <select 
            value={selectedChartAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: '700', outline: 'none', padding: '5px' }}
          >
            <option value="All Accounts">{language === 'so' ? 'Dhammaan Akoonnada' : 'All Accounts Combined'}</option>
            {accounts.map(acc => <option key={acc._id || acc.id} value={acc.name}>{acc.name}</option>)}
          </select>
        </div>
      </div>

      {/* Top Header with Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        <div className="glass-card accent-primary" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Portfolio P&L</p>
            <h2 style={{ fontSize: '1.8rem', color: currentPL >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: '800', marginTop: '5px' }}>
              {currentPL >= 0 ? '+' : ''}{currentPL}%
            </h2>
          </div>
          <div style={{ background: currentPL >= 0 ? 'rgba(0, 200, 150, 0.12)' : 'rgba(192, 57, 43, 0.12)', padding: '10px', borderRadius: '50%', color: currentPL >= 0 ? 'var(--success)' : 'var(--danger)' }}>
            {currentPL >= 0 ? <TrendingUp size={22} /> : <TrendingDown size={22} />}
          </div>
        </div>

        <div className="glass-card accent-purple" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Accounts</p>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginTop: '5px' }}>{accounts.length}</h2>
          </div>
          <div style={{ background: 'rgba(26, 59, 110, 0.12)', padding: '10px', borderRadius: '50%', color: 'var(--primary)' }}>
            <Layers size={22} />
          </div>
        </div>

        <div className="glass-card accent-warning" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Discipline Score</p>
            <h2 style={{ fontSize: '1.8rem', color: 'var(--warning)', fontWeight: '800', marginTop: '5px' }}>{disciplineScore}%</h2>
          </div>
          <div style={{ background: 'rgba(160, 92, 16, 0.12)', padding: '10px', borderRadius: '50%', color: 'var(--warning)' }}>
            <Award size={22} />
          </div>
        </div>

        <div className="glass-card accent-primary" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Pips Gained</p>
            <h2 style={{ fontSize: '1.8rem', color: totalPips >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: '800', marginTop: '5px' }}>
              {totalPips > 0 ? '+' : ''}{totalPips}
            </h2>
          </div>
          <div style={{ background: totalPips >= 0 ? 'rgba(0, 200, 150, 0.12)' : 'rgba(192, 57, 43, 0.12)', padding: '10px', borderRadius: '50%', color: totalPips >= 0 ? 'var(--primary)' : 'var(--danger)' }}>
            <Target size={22} />
          </div>
        </div>

        <div className="glass-card accent-purple" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Trades</p>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginTop: '5px' }}>{activeTrades.length}</h2>
          </div>
          <div style={{ background: 'rgba(0, 200, 150, 0.12)', padding: '10px', borderRadius: '50%', color: 'var(--primary)' }}>
            <Zap size={22} />
          </div>
        </div>
      </div>

      {/* Main Equity Curve & Objectives Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '30px', alignItems: 'start' }}>
        
        {/* Equity Curve Chart */}
        <section className="glass-card accent-primary" style={{ padding: '25px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h4 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700' }}>
                <ChartIcon size={18} color="var(--primary)" />
                {language === 'so' ? 'Koraalka Equity-ga' : 'Equity Growth Curve'}
              </h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {language === 'so' ? 'Muuqaalka koboca raasamaalka ee waqtiga.' : 'Visualizing your capital journey over time.'}
              </p>
            </div>
          </div>

          <div style={{ height: '320px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={equityData}>
                <defs>
                  <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={currentPL >= 0 ? 'var(--success)' : 'var(--danger)'} stopOpacity={0.25}/>
                    <stop offset="95%" stopColor={currentPL >= 0 ? 'var(--success)' : 'var(--danger)'} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="pl" 
                  stroke={currentPL >= 0 ? 'var(--success)' : 'var(--danger)'} 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#equityGradient)" 
                  animationDuration={1000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Prop Firm Objectives Tracker */}
        <section className="glass-card accent-primary" style={{ padding: '25px', height: '100%' }}>
          <h4 style={{ fontSize: '1.1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700' }}>
            <Activity size={18} color="var(--primary)" />
            {language === 'so' ? 'Habka Hubinta Shuruudaha (Prop Objectives)' : 'Prop Firm Objectives Tracker'}
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
            <div className="objectives-grid objectives-header">
              <div>{language === 'so' ? 'QODOBKA' : 'TRADING OBJECTIVE'}</div>
              <div>{language === 'so' ? 'BARTILMAAMEED' : 'TARGET'}</div>
              <div>{language === 'so' ? 'HADDA' : 'CURRENT'}</div>
              <div style={{ textAlign: 'right' }}>{language === 'so' ? 'XAALADDA' : 'STATUS'}</div>
            </div>
            
            {objectives.map((obj, i) => {
              const isPass = obj.status === 'pass';
              const isFail = obj.status === 'fail';
              return (
                <div className="objectives-grid" key={i}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {isPass && <CheckCircle2 size={16} color="var(--success)" className="pulse-dot-active" />}
                    {isFail && <XCircle size={16} color="var(--danger)" />}
                    {obj.status === 'progress' && <Calendar size={16} color="var(--warning)" />}
                    <span style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                      {language === 'so' ? obj.nameSo : obj.name}
                    </span>
                  </div>
                  <div style={{ fontWeight: '500', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {obj.target}
                  </div>
                  <div style={{ 
                    fontWeight: '700', 
                    fontSize: '0.85rem', 
                    color: isFail ? 'var(--danger)' : isPass ? 'var(--success)' : 'var(--warning)' 
                  }}>
                    {obj.current}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className={`objective-status-badge ${obj.status}`}>
                      {obj.status === 'pass' && (language === 'so' ? 'Baasay' : 'Passed')}
                      {obj.status === 'fail' && (language === 'so' ? 'Fashil' : 'Failed')}
                      {obj.status === 'progress' && (language === 'so' ? 'Socda' : 'Ongoing')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Account Health Cards */}
      <div>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '15px', fontWeight: '700', color: 'var(--text-main)' }}>
          {language === 'so' ? 'Xaaladda Akoonnada' : 'Account Details & Status'}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {accountStats.map((acc, i) => (
            <motion.div
              key={acc._id || acc.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`glass-card ${acc.isBlown ? 'accent-danger' : acc.isPassed ? 'accent-success' : 'accent-primary'}`}
              style={{ 
                padding: '20px', 
                cursor: 'pointer'
              }}
              onClick={() => setSelectedAccount(acc.name)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '2px' }}>{acc.name}</h4>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{acc.type}</span>
                </div>
                {acc.isBlown ? (
                  <ShieldAlert size={18} color="var(--danger)" />
                ) : acc.isPassed ? (
                  <CheckCircle2 size={18} color="var(--success)" />
                ) : (
                  <Activity size={18} color="var(--primary)" className="pulse-dot-active" />
                )}
              </div>

              <h2 style={{ fontSize: '1.6rem', color: parseFloat(acc.currentPL) >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: '800' }}>
                {parseFloat(acc.currentPL) > 0 ? '+' : ''}{acc.currentPL}%
              </h2>

              {acc.target > 0 && (
                <div style={{ marginTop: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '4px' }}>
                    <span>Target: {acc.target}%</span>
                    <span>{Math.min(100, Math.max(0, (parseFloat(acc.currentPL) / acc.target) * 100)).toFixed(0)}%</span>
                  </div>
                  <div style={{ height: '5px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{ 
                      height: '100%', 
                      width: `${Math.min(100, Math.max(0, (parseFloat(acc.currentPL) / acc.target) * 100))}%`, 
                      background: 'var(--primary)',
                      borderRadius: '10px'
                    }}></div>
                  </div>
                </div>
              )}
              
              <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                 <span>{acc.tradeCount} Trades</span>
                 <span style={{ 
                   color: acc.isBlown ? 'var(--danger)' : acc.isPassed ? 'var(--success)' : 'var(--text-main)',
                   fontWeight: '800',
                   fontSize: '0.7rem',
                   background: acc.isPassed && ['Funded', 'Personal'].includes(acc.type) ? 'rgba(0, 200, 150, 0.12)' : 'rgba(255,255,255,0.02)',
                   padding: '3px 8px',
                   borderRadius: '6px',
                   letterSpacing: '0.5px'
                 }}>
                   {acc.isBlown ? 'BLOWN' : acc.isPassed ? (['Funded', 'Personal'].includes(acc.type) ? '💰 WITHDRAW' : 'PASSED') : 'ACTIVE'}
                 </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
