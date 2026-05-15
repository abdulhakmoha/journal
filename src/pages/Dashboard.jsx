import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Award, Zap, Brain, Target, ArrowUpRight, ArrowDownRight, Activity, ShieldAlert, CheckCircle, LineChart as ChartIcon } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const Dashboard = ({ trades, accounts }) => {
  const [selectedChartAccount, setSelectedChartAccount] = useState('All Accounts');

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
        totalPL -= isPips ? riskPercent : parseFloat(t.risk || 0);
      }
    });
    
    const isBlown = totalPL <= -10; 
    const isPassed = acc.target > 0 && totalPL >= acc.target;

    return {
      ...acc,
      currentPL: totalPL.toFixed(1),
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
        cumulativePL -= isPips ? riskPercent : parseFloat(t.risk || 0);
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
  const totalPips = trades.reduce((acc, t) => acc + (parseFloat(t.pips) || 0), 0);

  const calculateDisciplineScore = () => {
    if (trades.length === 0) return 0;
    const highGrades = trades.filter(t => ['A+', 'A'].includes(t.grade)).length;
    return Math.round((highGrades / trades.length) * 100);
  };

  const disciplineScore = calculateDisciplineScore();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Top Header with Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid var(--primary)' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Portfolio P&L</p>
          <h2 style={{ fontSize: '1.8rem', color: currentPL >= 0 ? 'var(--success)' : 'var(--danger)' }}>
            {currentPL >= 0 ? '+' : ''}{currentPL}%
          </h2>
        </div>
        <div className="glass-card" style={{ padding: '20px' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Active Accounts</p>
          <h2 style={{ fontSize: '1.8rem' }}>{accounts.length}</h2>
        </div>
        <div className="glass-card" style={{ padding: '20px' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Discipline Score</p>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--warning)' }}>{disciplineScore}%</h2>
        </div>
        <div className="glass-card" style={{ padding: '20px' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Pips Gained</p>
          <h2 style={{ fontSize: '1.8rem', color: totalPips >= 0 ? 'var(--success)' : 'var(--danger)' }}>
            {totalPips > 0 ? '+' : ''}{totalPips}
          </h2>
        </div>
        <div className="glass-card" style={{ padding: '20px' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Trades</p>
          <h2 style={{ fontSize: '1.8rem' }}>{trades.length}</h2>
        </div>
      </div>

      {/* Main Equity Curve Chart */}
      <section className="glass-card" style={{ padding: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h4 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ChartIcon size={20} color="var(--primary)" />
              Equity Growth Curve
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Visualizing your capital journey over time.</p>
          </div>
          <div className="glass" style={{ padding: '5px', borderRadius: '10px' }}>
            <select 
              value={selectedChartAccount}
              onChange={(e) => setSelectedChartAccount(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', fontSize: '0.85rem', outline: 'none', padding: '5px 10px' }}
            >
              <option value="All Accounts">All Accounts Combined</option>
              {accounts.map(acc => <option key={acc.id} value={acc.name}>{acc.name}</option>)}
            </select>
          </div>
        </div>

        <div style={{ height: '350px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={equityData}>
              <defs>
                <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={currentPL >= 0 ? 'var(--success)' : 'var(--danger)'} stopOpacity={0.2}/>
                  <stop offset="95%" stopColor={currentPL >= 0 ? 'var(--success)' : 'var(--danger)'} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
              <Tooltip 
                contentStyle={{ background: 'var(--bg-dark)', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                formatter={(value) => [`${value}%`, 'Equity']}
                labelStyle={{ color: 'var(--text-muted)', marginBottom: '5px' }}
              />
              <Area 
                type="monotone" 
                dataKey="pl" 
                stroke={currentPL >= 0 ? 'var(--success)' : 'var(--danger)'} 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#equityGradient)" 
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Account Health Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {accountStats.map((acc, i) => (
          <motion.div
            key={acc.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card"
            style={{ 
              padding: '20px', 
              borderLeft: `4px solid ${acc.isBlown ? 'var(--danger)' : acc.isPassed ? 'var(--success)' : 'var(--primary)'}`,
              cursor: 'pointer'
            }}
            onClick={() => setSelectedChartAccount(acc.name)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
              <div>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{acc.name}</h4>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{acc.type}</span>
              </div>
              {acc.isBlown ? <ShieldAlert size={20} color="var(--danger)" /> : acc.isPassed ? <CheckCircle size={20} color="var(--success)" /> : <Activity size={20} color="var(--primary)" />}
            </div>

            <h2 style={{ fontSize: '1.8rem', color: parseFloat(acc.currentPL) >= 0 ? 'var(--success)' : 'var(--danger)' }}>
              {parseFloat(acc.currentPL) > 0 ? '+' : ''}{acc.currentPL}%
            </h2>

            {acc.target > 0 && (
              <div style={{ marginTop: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '5px' }}>
                  <span>Goal: {acc.target}%</span>
                  <span>{Math.min(100, Math.max(0, (parseFloat(acc.currentPL) / acc.target) * 100)).toFixed(0)}%</span>
                </div>
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${Math.min(100, Math.max(0, (parseFloat(acc.currentPL) / acc.target) * 100))}%`, 
                    background: 'var(--primary)',
                    borderRadius: '10px'
                  }}></div>
                </div>
              </div>
            )}
            
            <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
               <span>{acc.tradeCount} Trades</span>
               <span style={{ 
                 color: acc.isBlown ? 'var(--danger)' : acc.isPassed ? 'var(--success)' : 'var(--text-main)',
                 fontWeight: 'bold',
                 fontSize: acc.isPassed && ['Funded', 'Personal'].includes(acc.type) ? '0.85rem' : '0.8rem',
                 background: acc.isPassed && ['Funded', 'Personal'].includes(acc.type) ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                 padding: acc.isPassed && ['Funded', 'Personal'].includes(acc.type) ? '4px 8px' : '0',
                 borderRadius: '6px'
               }}>
                 {acc.isBlown ? 'BLOWN' : acc.isPassed ? (['Funded', 'Personal'].includes(acc.type) ? '💰 WITHDRAW NOW' : 'PASSED') : 'ACTIVE'}
               </span>
            </div>
          </motion.div>
        ))}
      </div>

    </div>
  );
};

export default Dashboard;
