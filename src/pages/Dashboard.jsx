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
  Percent,
  Scale,
  LineChart as ChartIcon 
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useLanguage } from '../context/LanguageContext';

const MetricCard = ({ label, value, icon: Icon, trendValue, trendType }) => {
  let pillBg = 'rgba(26, 59, 110, 0.05)';
  let pillColor = 'var(--navy)';
  
  if (trendType === 'win' || trendType === 'up') {
    pillBg = 'var(--mint-light)';
    pillColor = 'var(--success)';
  } else if (trendType === 'loss' || trendType === 'down') {
    pillBg = 'var(--danger-bg)';
    pillColor = 'var(--danger)';
  } else if (trendType === 'warning') {
    pillBg = 'var(--warning-bg)';
    pillColor = 'var(--warning)';
  }

  return (
    <div style={{
      background: 'var(--frost)',
      borderRadius: '12px',
      padding: '16px 18px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      border: 'none',
      boxShadow: 'none',
      minHeight: '85px',
      position: 'relative'
    }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Icon size={14} color="var(--slate-mid)" style={{ opacity: 0.8 }} />
        <span style={{ fontSize: '11px', color: 'var(--slate-mid)', fontWeight: '500', fontFamily: 'var(--font-sans)', letterSpacing: '0.01em', textTransform: 'none' }}>
          {label}
        </span>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 'auto' }}>
        <div style={{ fontSize: '22px', color: 'var(--navy)', fontWeight: '700', fontFamily: 'var(--font-sans)' }}>
          {value}
        </div>
        
        {trendValue && (
          <div style={{
            background: pillBg,
            color: pillColor,
            padding: '3px 6px',
            borderRadius: '6px',
            fontSize: '10px',
            fontWeight: '700',
            fontFamily: 'var(--font-sans)',
            display: 'flex',
            alignItems: 'center',
            gap: '2px'
          }}>
            {trendValue}
          </div>
        )}
      </div>
    </div>
  );
};

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

  const calculateWinRate = () => {
    if (activeTrades.length === 0) return 0;
    const wins = activeTrades.filter(t => t.status === 'Win').length;
    return Math.round((wins / activeTrades.length) * 100);
  };
  const winRate = calculateWinRate();

  const calculateProfitFactor = () => {
    let grossProfit = 0;
    let grossLoss = 0;
    activeTrades.forEach(t => {
      const isPips = t.riskUnit === 'Pips';
      const riskPercent = parseFloat(t.riskPercent) || 1;
      let val = 0;
      if (t.status === 'Win') {
        val = isPips ? (parseFloat(t.rr || 0) * riskPercent) : parseFloat(t.reward || 0);
        grossProfit += val;
      } else if (t.status === 'Loss') {
        val = isPips ? riskPercent : parseFloat(t.reward || 0);
        grossLoss += Math.abs(val);
      }
    });
    if (grossLoss === 0) return grossProfit > 0 ? 'N/A' : '0.00';
    return (grossProfit / grossLoss).toFixed(2);
  };
  const profitFactor = calculateProfitFactor();

  // Prop Firm Objectives Calculations
  const getObjectives = () => {
    const dates = activeTrades.map(t => new Date(t.timestamp).toDateString());
    const uniqueDays = new Set(dates).size;
    const daysTarget = 5;
    const daysStatus = uniqueDays >= daysTarget ? 'pass' : 'progress';

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

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      if (data.name === 'Start') return null;
      const isWin = data.result === 'Win';
      return (
        <div style={{ 
          padding: '12px 16px', 
          border: '1px solid var(--border)', 
          background: 'var(--navy-deepest)', 
          borderRadius: '12px',
          boxShadow: 'var(--shadow-md)' 
        }}>
          <p style={{ fontSize: '11px', color: 'var(--slate-light)', marginBottom: '5px', fontWeight: '700', textTransform: 'uppercase' }}>
            Trade {data.name.replace('T', '')}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--white)' }}>{data.symbol}</span>
            <span style={{ 
              fontSize: '11px', 
              fontWeight: '800', 
              padding: '2px 6px', 
              borderRadius: '4px',
              background: isWin ? 'var(--mint-light)' : 'var(--danger-bg)',
              color: isWin ? 'var(--success)' : 'var(--danger)'
            }}>
              {data.result ? data.result.toUpperCase() : 'N/A'}
            </span>
          </div>
          <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--white)' }}>
            Cumulative P&L: <span style={{ color: data.pl >= 0 ? 'var(--mint)' : '#E74C3C' }}>{data.pl >= 0 ? '+' : ''}{data.pl}%</span>
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
          <h2 className="text-gradient" style={{ fontSize: '22px', fontWeight: '600', fontFamily: 'var(--font-sans)' }}>
            {language === 'so' ? 'Qaybta Falanqaynta' : 'Trading Dashboard'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '11px', fontFamily: 'var(--font-sans)', marginTop: '2px' }}>
            {language === 'so' ? 'Kormeer oo falanqee natiijooyinka akoonnadaada.' : 'Track and analyze your professional trading account performance.'}
          </p>
        </div>
        <div className="glass" style={{ padding: '5px 12px', display: 'flex', alignItems: 'center', gap: '10px', borderRadius: '12px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', paddingLeft: '4px' }}>
            {language === 'so' ? 'Akoonka:' : 'Account:'}
          </span>
          <select 
            value={selectedChartAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', fontSize: '13px', fontWeight: '700', outline: 'none', padding: '5px' }}
          >
            <option value="All Accounts">{language === 'so' ? 'Dhammaan Akoonnada' : 'All Accounts Combined'}</option>
            {accounts.map(acc => <option key={acc._id || acc.id} value={acc.name}>{acc.name}</option>)}
          </select>
        </div>
      </div>

      {/* Metric Cards Section wrapped in a clean, elevated white card container */}
      <section className="glass-card" style={{ padding: '24px', border: '1px solid var(--border)', background: 'var(--white)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          
          <MetricCard 
            label={language === 'so' ? 'Faa\'iido/Khasaaraha P&L' : 'Portfolio P&L'} 
            value={`${currentPL >= 0 ? '+' : ''}${currentPL.toFixed(2)}%`}
            icon={currentPL >= 0 ? TrendingUp : TrendingDown}
            trendValue={`${currentPL >= 0 ? '↑' : '↓'} ${Math.abs(currentPL).toFixed(1)}%`}
            trendType={currentPL >= 0 ? 'win' : 'loss'}
          />

          <MetricCard 
            label={language === 'so' ? 'Boqolleyda Guusha' : 'Win rate'} 
            value={`${winRate}%`}
            icon={Percent}
            trendValue={winRate > 50 ? '↑ Normal' : '↓ Low'}
            trendType={winRate > 50 ? 'win' : 'loss'}
          />

          <MetricCard 
            label={language === 'so' ? 'Akoonnada Firfircoon' : 'Active accounts'} 
            value={accounts.length}
            icon={Layers}
            trendValue="Live"
            trendType="neutral"
          />

          <MetricCard 
            label={language === 'so' ? 'Dhibcaha Anshaxa' : 'Discipline score'} 
            value={`${disciplineScore}%`}
            icon={Award}
            trendValue={disciplineScore > 70 ? '↑ Perfect' : '→ Stable'}
            trendType={disciplineScore > 70 ? 'win' : 'warning'}
          />

          <MetricCard 
            label={language === 'so' ? 'Factor-ka Faa\'iidada' : 'Profit factor'} 
            value={profitFactor}
            icon={Scale}
            trendValue={parseFloat(profitFactor) > 1.5 ? '↑ High' : '→ Stable'}
            trendType={parseFloat(profitFactor) > 1.5 ? 'win' : 'neutral'}
          />

          <MetricCard 
            label={language === 'so' ? 'Pips-ka Guud' : 'Total pips'} 
            value={`${totalPips > 0 ? '+' : ''}${totalPips}`}
            icon={Target}
            trendValue={`${totalPips >= 0 ? '↑' : '↓'} ${Math.abs(totalPips)}`}
            trendType={totalPips >= 0 ? 'win' : 'loss'}
          />

          <MetricCard 
            label={language === 'so' ? 'Ganacsiyada Guud' : 'Total trades'} 
            value={activeTrades.length}
            icon={Activity}
            trendValue="Closed"
            trendType="neutral"
          />

        </div>
      </section>

      {/* Main Equity Curve & Objectives Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '30px', alignItems: 'start' }}>
        
        {/* Equity Curve Chart */}
        <section className="glass-card" style={{ padding: '25px', border: 'none', background: 'var(--white)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h4 style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '600', fontFamily: 'var(--font-sans)', color: 'var(--navy)' }}>
                <ChartIcon size={16} color="var(--navy)" />
                {language === 'so' ? 'Koraalka Equity-ga' : 'Equity Growth Curve'}
              </h4>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-sans)', marginTop: '2px' }}>
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
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(26, 59, 110, 0.05)" vertical={false} />
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
        <section className="glass-card" style={{ padding: '25px', border: 'none', background: 'var(--white)', boxShadow: 'var(--shadow-sm)', height: '100%' }}>
          <h4 style={{ fontSize: '14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '600', fontFamily: 'var(--font-sans)', color: 'var(--navy)' }}>
            <Activity size={16} color="var(--navy)" />
            {language === 'so' ? 'Habka Hubinta Shuruudaha (Prop Objectives)' : 'Prop Firm Objectives Tracker'}
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
            <div className="objectives-grid objectives-header" style={{ fontSize: '11px', fontWeight: '600', background: 'var(--frost)' }}>
              <div>{language === 'so' ? 'QODOBKA' : 'TRADING OBJECTIVE'}</div>
              <div>{language === 'so' ? 'BARTILMAAMEED' : 'TARGET'}</div>
              <div>{language === 'so' ? 'HADDA' : 'CURRENT'}</div>
              <div style={{ textAlign: 'right' }}>{language === 'so' ? 'XAALADDA' : 'STATUS'}</div>
            </div>
            
            {objectives.map((obj, i) => {
              const isPass = obj.status === 'pass';
              const isFail = obj.status === 'fail';
              return (
                <div className="objectives-grid" key={i} style={{ borderBottom: i === objectives.length - 1 ? 'none' : '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {isPass && <CheckCircle2 size={16} color="var(--success)" />}
                    {isFail && <XCircle size={16} color="var(--danger)" />}
                    {obj.status === 'progress' && <Calendar size={16} color="var(--warning)" />}
                    <span style={{ fontWeight: '500', fontSize: '13px', color: 'var(--text-main)' }}>
                      {language === 'so' ? obj.nameSo : obj.name}
                    </span>
                  </div>
                  <div style={{ fontWeight: '500', fontSize: '13px', color: 'var(--text-muted)' }}>
                    {obj.target}
                  </div>
                  <div style={{ 
                    fontWeight: '700', 
                    fontSize: '13px', 
                    color: isFail ? 'var(--danger)' : isPass ? 'var(--success)' : 'var(--warning)' 
                  }}>
                    {obj.current}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className={`objective-status-badge ${obj.status}`} style={{ fontSize: '11px', fontWeight: '700' }}>
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
        <h3 style={{ fontSize: '16px', marginBottom: '15px', fontWeight: '600', color: 'var(--text-main)', fontFamily: 'var(--font-sans)' }}>
          {language === 'so' ? 'Xaaladda Akoonnada' : 'Account Details & Status'}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {accountStats.map((acc, i) => (
            <motion.div
              key={acc._id || acc.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{ 
                padding: '20px', 
                cursor: 'pointer',
                background: 'var(--white)',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)'
              }}
              onClick={() => setSelectedAccount(acc.name)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--navy)', marginBottom: '2px', fontFamily: 'var(--font-sans)' }}>{acc.name}</h4>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'var(--font-sans)' }}>{acc.type}</span>
                </div>
                {acc.isBlown ? (
                  <ShieldAlert size={18} color="var(--danger)" />
                ) : acc.isPassed ? (
                  <CheckCircle2 size={18} color="var(--success)" />
                ) : (
                  <Activity size={18} color="var(--navy)" className="pulse-dot-active" />
                )}
              </div>

              <div style={{ fontSize: '22px', fontWeight: '600', color: parseFloat(acc.currentPL) >= 0 ? 'var(--success)' : 'var(--danger)', fontFamily: 'var(--font-sans)' }}>
                {parseFloat(acc.currentPL) > 0 ? '+' : ''}{acc.currentPL}%
              </div>

              {acc.target > 0 && (
                <div style={{ marginTop: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px', fontFamily: 'var(--font-sans)', color: 'var(--slate-mid)' }}>
                    <span>Target: {acc.target}%</span>
                    <span>{Math.min(100, Math.max(0, (parseFloat(acc.currentPL) / acc.target) * 100)).toFixed(0)}%</span>
                  </div>
                  <div style={{ height: '5px', background: 'rgba(26, 59, 110, 0.08)', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{ 
                      height: '100%', 
                      width: `${Math.min(100, Math.max(0, (parseFloat(acc.currentPL) / acc.target) * 100))}%`, 
                      background: 'var(--navy)',
                      borderRadius: '10px'
                    }}></div>
                  </div>
                </div>
              )}
              
              <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-sans)' }}>
                 <span>{acc.tradeCount} Trades</span>
                 <span style={{ 
                   color: acc.isBlown ? 'var(--danger)' : acc.isPassed ? 'var(--success)' : 'var(--navy)',
                   fontWeight: '700',
                   fontSize: '11px',
                   background: acc.isPassed && ['Funded', 'Personal'].includes(acc.type) ? 'var(--mint-light)' : 'rgba(26, 59, 110, 0.06)',
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
