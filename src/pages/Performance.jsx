import React, { useState, useEffect } from 'react';
import { 
  BarChart2, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Calendar, 
  Target, 
  Activity, 
  PieChart, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter,
  Globe,
  Briefcase
} from 'lucide-react';
import { motion } from 'framer-motion';

const Performance = ({ trades, accounts }) => {
  const [selectedAccount, setSelectedAccount] = useState('All Accounts');
  
  // Filter trades by selected account
  const filteredTrades = selectedAccount === 'All Accounts' 
    ? trades 
    : trades.filter(t => t.account === selectedAccount);

  // Core Calculations
  const calculateMetrics = () => {
    if (!filteredTrades.length) return { profit: 0, winRate: 0, profitFactor: 0, expectancy: 0, totalTrades: 0 };
    
    const wins = filteredTrades.filter(t => t.status === 'Win');
    const losses = filteredTrades.filter(t => t.status === 'Loss');
    
    const grossProfit = wins.reduce((acc, t) => acc + (parseFloat(t.reward) || 0), 0);
    const grossLoss = Math.abs(losses.reduce((acc, t) => acc + (parseFloat(t.risk) || 0), 0));
    
    const winRate = (wins.length / filteredTrades.length) * 100;
    const profitFactor = grossLoss === 0 ? grossProfit.toFixed(2) : (grossProfit / grossLoss).toFixed(2);
    
    // Expectancy = (WinRate * AvgWin) - (LossRate * AvgLoss)
    const avgWin = wins.length ? grossProfit / wins.length : 0;
    const avgLoss = losses.length ? grossLoss / losses.length : 0;
    const expectancy = ((wins.length / filteredTrades.length) * avgWin - (losses.length / filteredTrades.length) * avgLoss).toFixed(2);

    return { 
      profit: (grossProfit - grossLoss).toFixed(1), 
      winRate: Math.round(winRate), 
      profitFactor, 
      expectancy,
      totalTrades: filteredTrades.length
    };
  };

  const metrics = calculateMetrics();

  // Breakdown by Day of Week
  const getDayData = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const data = days.map(day => {
      const dayTrades = filteredTrades.filter(t => new Date(t.timestamp).getDay() === days.indexOf(day));
      const pnl = dayTrades.reduce((acc, t) => {
        if (t.status === 'Win') return acc + (parseFloat(t.reward) || 0);
        if (t.status === 'Loss') return acc - (parseFloat(t.risk) || 0);
        return acc;
      }, 0);
      return { day, pnl };
    });
    return data.filter(d => d.day !== 'Saturday' && d.day !== 'Sunday'); // Crypto not included for now
  };

  // Breakdown by Session
  const getSessionData = () => {
    const sessions = ['London', 'New York', 'Asia'];
    return sessions.map(session => {
      const sessionTrades = filteredTrades.filter(t => t.session === session);
      const pnl = sessionTrades.reduce((acc, t) => {
        if (t.status === 'Win') return acc + (parseFloat(t.reward) || 0);
        if (t.status === 'Loss') return acc - (parseFloat(t.risk) || 0);
        return acc;
      }, 0);
      return { session, pnl, count: sessionTrades.length };
    });
  };

  // Breakdown by Pair
  const getPairData = () => {
    const pairs = [...new Set(filteredTrades.map(t => t.symbol))];
    return pairs.map(pair => {
      const pairTrades = filteredTrades.filter(t => t.symbol === pair);
      const wins = pairTrades.filter(t => t.status === 'Win').length;
      const pnl = pairTrades.reduce((acc, t) => {
        if (t.status === 'Win') return acc + (parseFloat(t.reward) || 0);
        if (t.status === 'Loss') return acc - (parseFloat(t.risk) || 0);
        return acc;
      }, 0);
      return { pair, pnl, winRate: Math.round((wins / pairTrades.length) * 100), count: pairTrades.length };
    }).sort((a, b) => b.pnl - a.pnl);
  };

  const dayData = getDayData();
  const sessionData = getSessionData();
  const pairData = getPairData();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="text-gradient">Performance Analytics</h2>
          <p style={{ color: 'var(--text-muted)' }}>Deep dive into your trading edge and edge statistics.</p>
        </div>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <Filter size={18} color="var(--primary)" />
          <select 
            value={selectedAccount} 
            onChange={(e) => setSelectedAccount(e.target.value)}
            style={{ padding: '8px 15px', borderRadius: '10px' }}
          >
            <option>All Accounts</option>
            {accounts.map(acc => <option key={acc._id} value={acc.name}>{acc.name}</option>)}
          </select>
        </div>
      </header>

      {/* Main Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        
        {/* Net Profit */}
        <div className="glass-card" style={{ padding: '25px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <TrendingUp size={18} color="var(--success)" />
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Net Profit / Loss</p>
          </div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: '900', color: metrics.profit >= 0 ? 'var(--success)' : 'var(--danger)', marginBottom: '8px' }}>
            {metrics.profit >= 0 ? '+' : ''}{metrics.profit.toLocaleString()}%
          </h3>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Total percentage growth/loss. <span style={{ color: 'var(--primary)' }}>Positive = profitable</span>
          </p>
        </div>

        {/* Win Rate */}
        <div className="glass-card" style={{ padding: '25px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Activity size={18} color="var(--primary)" />
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Win Rate</p>
          </div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: '900', color: metrics.winRate >= 50 ? 'var(--success)' : 'var(--warning)', marginBottom: '8px' }}>
            {metrics.winRate}%
          </h3>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Out of {metrics.totalTrades} trades, <span style={{ color: 'var(--primary)' }}>{Math.round(metrics.totalTrades * metrics.winRate / 100)} were winners</span>
          </p>
        </div>

        {/* Profit Factor */}
        <div className="glass-card" style={{ padding: '25px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Target size={18} color="var(--warning)" />
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Win : Loss Ratio</p>
          </div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: '900', color: parseFloat(metrics.profitFactor) >= 1.5 ? 'var(--success)' : 'var(--danger)', marginBottom: '8px' }}>
            {metrics.profitFactor}
          </h3>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            For every 1% lost, you made <span style={{ color: 'var(--primary)' }}>{metrics.profitFactor}%</span>. Above 1.5 = good.
          </p>
        </div>

        {/* Expectancy */}
        <div className="glass-card" style={{ padding: '25px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <PieChart size={18} color="var(--accent)" />
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Avg Gain / Trade</p>
          </div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: '900', color: parseFloat(metrics.expectancy) >= 0 ? 'var(--success)' : 'var(--danger)', marginBottom: '8px' }}>
            {metrics.expectancy}%
          </h3>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Expected profit per trade on average. <span style={{ color: 'var(--primary)' }}>Must be positive</span>
          </p>
        </div>

      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        {/* Day of Week Analysis */}
        <section className="glass-card" style={{ padding: '30px' }}>
          <h4 style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Calendar size={18} color="var(--primary)" /> Your Best & Worst Trading Days
          </h4>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '20px' }}>Which day of the week do you perform best?</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '200px', gap: '15px' }}>
            {dayData.map((d, i) => {
              const maxPnl = Math.max(...dayData.map(x => Math.abs(x.pnl)), 100);
              const height = (Math.abs(d.pnl) / maxPnl) * 150;
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: d.pnl >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                    {d.pnl !== 0 ? `${d.pnl > 0 ? '+' : ''}${Math.round(d.pnl)}` : ''}
                  </div>
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${height}px` }}
                    style={{ 
                      width: '100%', 
                      background: d.pnl >= 0 ? 'var(--success)' : 'var(--danger)',
                      borderRadius: '6px 6px 0 0',
                      opacity: 0.8
                    }}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{d.day.substring(0, 3)}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Session Analysis */}
        <section className="glass-card" style={{ padding: '30px' }}>
          <h4 style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Clock size={18} color="var(--accent)" /> Which Session Makes You Money?
          </h4>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '20px' }}>London, New York, Asia — where is your real edge?</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {sessionData.map((s, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                  <span style={{ fontWeight: 'bold' }}>{s.session}</span>
                  <span style={{ color: s.pnl >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                    {s.pnl.toLocaleString()}% ({s.count} trades)
                  </span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ 
                    width: `${Math.min(100, (Math.abs(s.pnl) / Math.max(...sessionData.map(x => Math.abs(x.pnl)), 1)) * 100)}%`, 
                    height: '100%', 
                    background: s.pnl >= 0 ? 'var(--success)' : 'var(--danger)' 
                  }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Pair Performance Table */}
      <section className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '25px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Globe size={18} color="var(--primary)" /> Which Pairs Are Most Profitable?
          </h4>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: 'rgba(255,255,255,0.02)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <tr>
              <th style={{ padding: '15px 25px', textAlign: 'left' }}>PAIR</th>
              <th style={{ padding: '15px 25px', textAlign: 'left' }}>TRADES</th>
              <th style={{ padding: '15px 25px', textAlign: 'left' }}>WIN RATE</th>
              <th style={{ padding: '15px 25px', textAlign: 'right' }}>NET PROFIT</th>
            </tr>
          </thead>
          <tbody>
            {pairData.map((p, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border)', fontSize: '0.9rem' }}>
                <td style={{ padding: '15px 25px', fontWeight: 'bold' }}>{p.pair}</td>
                <td style={{ padding: '15px 25px' }}>{p.count}</td>
                <td style={{ padding: '15px 25px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '60px', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                      <div style={{ width: `${p.winRate}%`, height: '100%', background: p.winRate >= 50 ? 'var(--success)' : 'var(--warning)' }} />
                    </div>
                    {p.winRate}%
                  </div>
                </td>
                <td style={{ padding: '15px 25px', textAlign: 'right', fontWeight: 'bold', color: p.pnl >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                  {p.pnl >= 0 ? '+' : ''}{p.pnl.toLocaleString()}%
                </td>
              </tr>
            ))}
            {pairData.length === 0 && (
              <tr>
                <td colSpan="4" style={{ padding: '50px', textAlign: 'center', color: 'var(--text-muted)' }}>No trade data available.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default Performance;
