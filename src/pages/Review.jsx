import React, { useState, useMemo } from 'react';
import { BarChart2, TrendingUp, AlertTriangle, Award, Calendar, Filter, Brain, Zap, ThumbsUp, ThumbsDown, Activity, Target } from 'lucide-react';
import { motion } from 'framer-motion';

// Auto-generate smart insight text based on actual data
const generateInsights = (trades, winRate, mistakes, wins, losses) => {
  const insights = [];

  if (trades.length === 0) {
    return [{ type: 'neutral', text: 'No trades recorded for this period. Start logging to get personalized insights.' }];
  }

  // Win Rate Insight
  if (winRate >= 65) {
    insights.push({ type: 'success', text: `💪 Exceptional! Your win rate is ${winRate}%. You are operating at an elite level. Maintain discipline during winning streaks.` });
  } else if (winRate >= 50) {
    insights.push({ type: 'primary', text: `✅ Solid performance at ${winRate}% win rate. Focus on improving your R:R to maximize profitability.` });
  } else {
    insights.push({ type: 'danger', text: `⚠️ Win rate of ${winRate}% needs improvement. Are you entering too early? Review Grade A setups only.` });
  }

  // Mistake Insight
  const mistakeRate = trades.length > 0 ? Math.round((mistakes / trades.length) * 100) : 0;
  if (mistakeRate === 0) {
    insights.push({ type: 'success', text: `🧘 Perfect execution discipline — 0 mistakes logged. Your mental game is sharp.` });
  } else if (mistakeRate <= 15) {
    insights.push({ type: 'primary', text: `🔍 Mistake rate is ${mistakeRate}%. Minor leaks in execution. Review entry checklist before every trade.` });
  } else {
    insights.push({ type: 'danger', text: `🚨 High mistake rate: ${mistakeRate}%. You are breaking your rules frequently. Take a 1-day break and review your trading plan.` });
  }

  // Volume Insight
  if (trades.length > 20) {
    insights.push({ type: 'warning', text: `📊 High volume detected: ${trades.length} trades. Are you overtrading? Quality > Quantity always.` });
  } else if (trades.length >= 5) {
    insights.push({ type: 'neutral', text: `📈 Good sample size with ${trades.length} trades. Your stats are becoming statistically meaningful.` });
  }

  // Consecutive losses
  const recentTrades = [...trades].reverse().slice(0, 5);
  const recentLosses = recentTrades.filter(t => t.status === 'Loss').length;
  if (recentLosses >= 3) {
    insights.push({ type: 'danger', text: `🔴 3+ recent losses detected. Consider stepping back. Protect your capital first.` });
  }

  return insights;
};

const Review = ({ trades, accounts }) => {
  const [timeframe, setTimeframe] = useState('This Week');
  const [selectedAccount, setSelectedAccount] = useState('All Accounts');
  const [customMonth, setCustomMonth] = useState(new Date().toISOString().slice(0, 7));

  const getFilteredTrades = () => {
    let filtered = [...trades];
    if (selectedAccount !== 'All Accounts') {
      filtered = filtered.filter(t => t.account === selectedAccount);
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (timeframe === 'Custom Month') {
      const [year, month] = customMonth.split('-').map(Number);
      filtered = filtered.filter(t => {
        const d = new Date(t.timestamp);
        return d.getFullYear() === year && (d.getMonth() + 1) === month;
      });
      return filtered;
    }

    switch (timeframe) {
      case 'This Week':
        const startOfWeek = new Date(startOfToday);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        filtered = filtered.filter(t => new Date(t.timestamp) >= startOfWeek);
        break;
      case 'This Month':
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        filtered = filtered.filter(t => new Date(t.timestamp) >= startOfMonth);
        break;
      case 'All Time':
        break;
      default:
        if (timeframe.startsWith('Last ') && timeframe.endsWith(' Months')) {
          const months = parseInt(timeframe.split(' ')[1]);
          if (!isNaN(months)) {
            const start = new Date(now.getFullYear(), now.getMonth() - months, 1);
            filtered = filtered.filter(t => new Date(t.timestamp) >= start);
          }
        }
        break;
    }
    return filtered;
  };

  const filteredTrades = getFilteredTrades();
  const wins = filteredTrades.filter(t => t.status === 'Win');
  const losses = filteredTrades.filter(t => t.status === 'Loss');
  const mistakes = filteredTrades.filter(t => t.isMistake).length;
  const winRate = filteredTrades.length === 0 ? 0 : Math.round((wins.length / filteredTrades.length) * 100);
  const netProfit = filteredTrades.reduce((acc, t) => {
    const isPips = t.riskUnit === 'Pips';
    const riskPercent = parseFloat(t.riskPercent) || 1;
    if (t.status?.toLowerCase().includes('win')) return acc + (isPips ? (parseFloat(t.rr || 0) * riskPercent) : parseFloat(t.reward || 0));
    if (t.status?.toLowerCase().includes('loss')) return acc + (isPips ? -riskPercent : parseFloat(t.reward || 0));
    return acc;
  }, 0).toFixed(2);

  const grossProfit = wins.reduce((acc, t) => {
    const isPips = t.riskUnit === 'Pips';
    return acc + (isPips ? (parseFloat(t.rr || 0) * (parseFloat(t.riskPercent) || 1)) : parseFloat(t.reward || 0));
  }, 0);
  
  const grossLoss = Math.abs(losses.reduce((acc, t) => {
    const isPips = t.riskUnit === 'Pips';
    return acc + (isPips ? (parseFloat(t.riskPercent) || 1) : Math.abs(parseFloat(t.reward || t.risk || 0)));
  }, 0));

  const profitFactor = grossLoss === 0 ? grossProfit.toFixed(2) : (grossProfit / grossLoss).toFixed(2);

  // Grade Stats
  const gradeStats = ['A+', 'A', 'B', 'C', 'D'].map(grade => {
    const gt = filteredTrades.filter(t => t.grade === grade);
    const gw = gt.filter(t => t.status === 'Win');
    return { grade, count: gt.length, winRate: gt.length === 0 ? 0 : Math.round((gw.length / gt.length) * 100) };
  });

  // Day of Week Breakdown
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayStats = dayNames.map((day, i) => {
    const dayTrades = filteredTrades.filter(t => new Date(t.timestamp).getDay() === i);
    const dWins = dayTrades.filter(t => t.status === 'Win').length;
    return { day, count: dayTrades.length, winRate: dayTrades.length === 0 ? 0 : Math.round((dWins / dayTrades.length) * 100) };
  }).filter(d => d.day !== 'Sun' && d.day !== 'Sat');

  const insights = generateInsights(filteredTrades, winRate, mistakes, wins, losses);
  const insightColors = { success: 'var(--success)', danger: 'var(--danger)', primary: 'var(--primary)', warning: 'var(--warning)', neutral: 'var(--text-muted)' };

  const timeframes = [
    'This Week', 
    'This Month', 
    'Last 2 Months',
    'Last 3 Months',
    'Last 4 Months',
    'Last 5 Months',
    'Last 6 Months',
    'Last 7 Months',
    'Last 8 Months',
    'Last 9 Months',
    'Last 10 Months',
    'Last 11 Months',
    'Last 12 Months',
    'All Time'
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button 
            onClick={() => window.history.back()} 
            style={{ background: 'rgba(255,255,255,0.05)', border: 'none', padding: '8px 12px', borderRadius: '8px', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            ← Back
          </button>
          <div>
            <h2 className="text-gradient" style={{ margin: 0 }}>Performance Analysis Report</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '5px 0 0 0' }}>Data-driven insights based on your actual execution history.</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
          <select 
            value={selectedAccount} 
            onChange={(e) => setSelectedAccount(e.target.value)}
            style={{ padding: '8px 15px', borderRadius: '10px' }}
          >
            <option value="All Accounts">All Accounts</option>
            {accounts.map(acc => <option key={acc._id} value={acc.name}>{acc.name}</option>)}
          </select>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              style={{ padding: '8px 15px', borderRadius: '10px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 'bold' }}
            >
              <option disabled>Select Timeframe</option>
              {timeframes.map(tf => (
                <option key={tf} value={tf}>{tf}</option>
              ))}
              <option value="Custom Month">Custom Month</option>
            </select>
            
            {timeframe === 'Custom Month' && (
              <input 
                type="month" 
                value={customMonth}
                onChange={(e) => setCustomMonth(e.target.value)}
                style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem' }} 
              />
            )}
          </div>
        </div>
      </header>

      {/* Core Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px' }}>
        {[
          { label: 'Total Trades', value: filteredTrades.length, color: 'var(--primary)' },
          { label: 'Win Rate', value: `${winRate}%`, color: winRate >= 55 ? 'var(--success)' : 'var(--danger)' },
          { label: 'Net Profit', value: `${netProfit}%`, color: parseFloat(netProfit) >= 0 ? 'var(--success)' : 'var(--danger)' },
          { label: 'Profit Ratio', value: profitFactor, color: parseFloat(profitFactor) >= 1.5 ? 'var(--success)' : 'var(--warning)' },
          { label: 'Mistakes', value: mistakes, color: mistakes > 2 ? 'var(--danger)' : 'var(--success)' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="glass-card" style={{ padding: '25px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '10px', textTransform: 'uppercase' }}>{stat.label}</p>
            <h3 style={{ fontSize: '2rem', fontWeight: '900', color: stat.color }}>{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        <section className="glass-card" style={{ padding: '30px' }}>
          <h4 style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Zap size={18} color="var(--primary)" /> Smart Performance Analysis
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', background: 'rgba(56,189,248,0.1)', padding: '2px 8px', borderRadius: '10px', marginLeft: '5px' }}>ALGORITHMIC</span>
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {insights.map((insight, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ delay: i * 0.1 }}
                style={{ 
                  padding: '15px 20px', 
                  borderLeft: `3px solid ${insightColors[insight.type]}`, 
                  background: 'rgba(255,255,255,0.02)', 
                  borderRadius: '0 10px 10px 0',
                  fontSize: '0.9rem',
                  lineHeight: '1.6'
                }}
              >
                {insight.text}
              </motion.div>
            ))}
          </div>
        </section>

        {/* Day of Week Performance */}
        <section className="glass-card" style={{ padding: '30px' }}>
          <h4 style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Calendar size={18} color="var(--accent)" /> Best Trading Days
          </h4>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '180px', gap: '10px' }}>
            {dayStats.map((d, i) => {
              const maxWR = Math.max(...dayStats.map(x => x.winRate), 1);
              const height = (d.winRate / maxWR) * 140;
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: d.winRate >= 60 ? 'var(--success)' : d.winRate >= 40 ? 'var(--primary)' : 'var(--danger)' }}>
                    {d.count > 0 ? `${d.winRate}%` : ''}
                  </span>
                  <motion.div 
                    initial={{ height: 0 }} 
                    animate={{ height: `${height}px` }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                    style={{ 
                      width: '100%', 
                      background: d.winRate >= 60 ? 'var(--success)' : d.winRate >= 40 ? 'var(--primary)' : 'rgba(239,68,68,0.4)',
                      borderRadius: '6px 6px 0 0',
                      minHeight: d.count > 0 ? '5px' : '0'
                    }} 
                  />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{d.day}</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{d.count}T</span>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Grade Analysis */}
      <section className="glass-card" style={{ padding: '30px' }}>
        <h4 style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Award size={18} color="var(--primary)" /> Grade Performance — Where is your Real Edge?
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px' }}>
          {gradeStats.map(stat => (
            <div key={stat.grade} style={{ textAlign: 'center' }}>
              <div style={{ 
                width: '70px', height: '70px', borderRadius: '50%', margin: '0 auto 15px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: stat.winRate >= 60 ? 'rgba(16,185,129,0.15)' : stat.winRate >= 40 ? 'rgba(56,189,248,0.1)' : 'rgba(239,68,68,0.1)',
                border: `2px solid ${stat.winRate >= 60 ? 'var(--success)' : stat.winRate >= 40 ? 'var(--primary)' : 'var(--danger)'}`,
                fontSize: '1.4rem', fontWeight: '900'
              }}>
                {stat.grade}
              </div>
              <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: stat.winRate >= 60 ? 'var(--success)' : 'var(--text-main)' }}>{stat.winRate}%</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{stat.count} trades</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Review;
