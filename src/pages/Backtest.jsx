import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Plus, 
  Trash2, 
  ChevronRight, 
  TrendingUp, 
  TrendingDown, 
  BarChart2, 
  Clock, 
  Save,
  ArrowLeft,
  Search,
  FlaskConical,
  Upload,
  Image as ImageIcon,
  Maximize2,
  Briefcase,
  Target,
  AlertOctagon,
  Award,
  X,
  Zap,
  Activity,
  ShieldAlert,
  Edit3,
  FileText,
  Download,
  Printer
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const BACKEND_URL = 'https://journal-production-6346.up.railway.app';

const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://localhost:5000')) {
    return url.replace('http://localhost:5000', BACKEND_URL);
  }
  if (url.startsWith('http')) return url;
  return `${BACKEND_URL}${url}`;
};

const Backtest = ({ backtestFields, accounts }) => {
  const { token, user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);
  const [newSessionForm, setNewSessionForm] = useState({ name: '', strategy: '', pair: '', account: accounts[0]?.name || '' });
  
  const [tradeForm, setTradeForm] = useState({
    symbol: '',
    type: 'Long',
    status: 'Win',
    rr: 1,
    notes: '',
    isMistake: false,
    tradeDate: new Date().toISOString().slice(0, 10),
    tradeTime: '12:00',
    beforeChart: '',
    afterChart: '',
    customData: {}
  });

  const [uploading, setUploading] = useState({ before: false, after: false });
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (accounts.length > 0 && !newSessionForm.account) {
      setNewSessionForm(prev => ({ ...prev, account: accounts[0].name }));
    }
  }, [accounts]);

  useEffect(() => {
    if (activeSession) {
      const initialCustomData = {};
      backtestFields.forEach(field => {
        initialCustomData[field.label] = field.options[0] || '';
      });
      setTradeForm(prev => ({ 
        ...prev, 
        symbol: activeSession.pair || '',
        customData: initialCustomData 
      }));
    }
  }, [backtestFields, activeSession]);

  const fetchSessions = async () => {
    try {
      const res = await api.get('/api/backtest');
      setSessions(res.data);
    } catch (err) {
      console.error('Error fetching backtest sessions');
    }
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('image', file);
    
    setUploading({ ...uploading, [type]: true });
    try {
      const res = await api.post('/api/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setTradeForm(prev => ({ ...prev, [type === 'before' ? 'beforeChart' : 'afterChart']: res.data.url }));
    } catch (err) {
      alert('Upload failed');
    } finally {
      setUploading({ ...uploading, [type]: false });
    }
  };

  const createSession = async () => {
    try {
      const res = await api.post('/api/backtest', newSessionForm);
      setSessions([res.data, ...sessions]);
      setShowNewSessionModal(false);
      setNewSessionForm({ name: '', strategy: '', pair: '', account: accounts[0]?.name || '' });
    } catch (err) {
      alert('Error creating session');
    }
  };

  const logTrade = async () => {
    if (!tradeForm.rr || isNaN(tradeForm.rr)) return alert('Fadlan geli R:R sax ah');
    
    try {
      const res = await api.post(`/api/backtest/${activeSession._id}/trades`, tradeForm);
      setActiveSession(res.data);
      
      const resetCustomData = {};
      backtestFields.forEach(field => {
        resetCustomData[field.label] = field.options[0] || '';
      });

      setTradeForm({ 
        symbol: activeSession.pair || '', 
        type: 'Long', 
        status: 'Win', 
        rr: 1, 
        notes: '',
        isMistake: false,
        tradeDate: new Date().toISOString().slice(0, 10),
        tradeTime: '12:00',
        beforeChart: '',
        afterChart: '',
        customData: resetCustomData
      });
      fetchSessions(); 
    } catch (err) {
      alert('Error logging trade');
    }
  };

  const deleteTrade = async (tradeId) => {
    if (!window.confirm('Ma hubtaa inaad tirtirto trade-kan?')) return;
    try {
      const res = await api.delete(`/api/backtest/${activeSession._id}/trades/${tradeId}`);
      setActiveSession(res.data);
      fetchSessions();
    } catch (err) {
      alert('Error deleting trade');
    }
  };

  const deleteSession = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Ma hubtaa inaad tirtirto session-kan?')) {
      try {
        await api.delete(`/api/backtest/${id}`);
        setSessions(sessions.filter(s => s._id !== id));
        if (activeSession?._id === id) setActiveSession(null);
      } catch (err) {
        alert('Error deleting session');
      }
    }
  };

  const calculateStats = (trades) => {
    if (!trades || trades.length === 0) return { 
      winRate: 0, 
      totalRR: 0, 
      count: 0, 
      equity: [0], 
      status: 'Active',
      profitFactor: 0,
      expectancy: 0,
      maxDrawdown: 0,
      mistakeRate: 0,
      bestDay: { name: 'N/A', rate: 0 },
      bestSession: { name: 'N/A', rate: 0 },
      bestSetup: { name: 'N/A', rate: 0 },
      bestHour: { name: 'N/A', rate: 0 },
      maxWinStreak: 0,
      maxLossStreak: 0,
      recoveryFactor: 0
    };
    
    const wins = trades.filter(t => t.status === 'Win');
    const losses = trades.filter(t => t.status === 'Loss');
    const mistakes = trades.filter(t => t.isMistake).length;

    let equityPoints = [0];
    let currentEquity = 0;
    let maxPeak = 0;
    let maxDD = 0;
    const riskPerTrade = 1; 

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const daysStats = {};
    const sessionStats = {};
    const setupStats = {};
    const hourStats = {};

    let currentWinStreak = 0, maxWinStreak = 0;
    let currentLossStreak = 0, maxLossStreak = 0;

    trades.forEach(t => {
      if (t.status === 'Win') {
        currentEquity += (riskPerTrade * parseFloat(t.rr));
        currentWinStreak++;
        currentLossStreak = 0;
        if (currentWinStreak > maxWinStreak) maxWinStreak = currentWinStreak;
      } else if (t.status === 'Loss') {
        currentEquity -= riskPerTrade;
        currentLossStreak++;
        currentWinStreak = 0;
        if (currentLossStreak > maxLossStreak) maxLossStreak = currentLossStreak;
      } else {
        currentWinStreak = 0;
        currentLossStreak = 0;
      }
      
      equityPoints.push(currentEquity);
      
      if (currentEquity > maxPeak) maxPeak = currentEquity;
      const dd = maxPeak - currentEquity;
      if (dd > maxDD) maxDD = dd;

      const d = t.tradeDate ? new Date(t.tradeDate) : new Date(t.timestamp);
      const dayName = t.tradeDate ? dayNames[d.getUTCDay()] : dayNames[d.getDay()];
      if (!daysStats[dayName]) daysStats[dayName] = { wins: 0, total: 0 };
      daysStats[dayName].total++;
      if (t.status === 'Win') daysStats[dayName].wins++;

      const sess = t.customData?.Session || 'Unknown';
      if (!sessionStats[sess]) sessionStats[sess] = { wins: 0, total: 0 };
      sessionStats[sess].total++;
      if (t.status === 'Win') sessionStats[sess].wins++;

      const setup = t.customData?.Strategy || 'Unknown';
      if (!setupStats[setup]) setupStats[setup] = { wins: 0, total: 0 };
      setupStats[setup].total++;
      if (t.status === 'Win') setupStats[setup].wins++;

      if (t.tradeTime) {
        const hour = t.tradeTime.split(':')[0] + ':00';
        if (!hourStats[hour]) hourStats[hour] = { wins: 0, total: 0 };
        hourStats[hour].total++;
        if (t.status === 'Win') hourStats[hour].wins++;
      }
    });

    const totalRR = currentEquity.toFixed(2);
    const recoveryFactor = maxDD > 0 ? (currentEquity / maxDD).toFixed(2) : currentEquity > 0 ? '∞' : 0;
    
    const grossProfit = wins.reduce((acc, t) => acc + (riskPerTrade * parseFloat(t.rr)), 0);
    const grossLoss = losses.length * riskPerTrade;
    const profitFactor = grossLoss === 0 ? grossProfit : (grossProfit / grossLoss).toFixed(2);

    const winRate = wins.length / trades.length;
    const avgWin = wins.length === 0 ? 0 : grossProfit / wins.length;
    const expectancy = ((winRate * avgWin) - ((1 - winRate) * riskPerTrade)).toFixed(2);

    let status = 'Active';
    if (currentEquity >= 8) status = 'Passed';
    if (currentEquity <= -10) status = 'Blown';

    let bestDay = { name: 'N/A', rate: 0 };
    Object.keys(daysStats).forEach(day => {
      const wr = Math.round((daysStats[day].wins / daysStats[day].total) * 100);
      if (wr > bestDay.rate && daysStats[day].total >= 1) bestDay = { name: day, rate: wr };
    });

    let bestSession = { name: 'N/A', rate: 0 };
    Object.keys(sessionStats).forEach(sess => {
      if(sess === 'Unknown' || sess === '') return;
      const wr = Math.round((sessionStats[sess].wins / sessionStats[sess].total) * 100);
      if (wr >= bestSession.rate && sessionStats[sess].total >= 1) bestSession = { name: sess, rate: wr };
    });

    let bestSetup = { name: 'N/A', rate: 0 };
    Object.keys(setupStats).forEach(s => {
      if(s === 'Unknown' || s === '') return;
      const wr = Math.round((setupStats[s].wins / setupStats[s].total) * 100);
      if (wr >= bestSetup.rate && setupStats[s].total >= 1) bestSetup = { name: s, rate: wr };
    });

    let bestHour = { name: 'N/A', rate: 0 };
    Object.keys(hourStats).forEach(h => {
      const wr = Math.round((hourStats[h].wins / hourStats[h].total) * 100);
      if (wr >= bestHour.rate && hourStats[h].total >= 1) bestHour = { name: h, rate: wr };
    });

    return {
      winRate: Math.round(winRate * 100),
      totalRR,
      count: trades.length,
      equity: equityPoints,
      status,
      profitFactor,
      expectancy,
      maxDrawdown: maxDD.toFixed(2),
      mistakeRate: Math.round((mistakes / trades.length) * 100),
      bestDay,
      bestSession,
      bestSetup,
      bestHour,
      maxWinStreak,
      maxLossStreak,
      recoveryFactor
    };
  };

  const handlePrint = () => {
    window.print();
  };

  const EquityChart = ({ data, mini = false }) => {
    const width = 500;
    const height = 200;
    const paddingLeft = 50;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 30;

    const chartW = width - paddingLeft - paddingRight;
    const chartH = height - paddingTop - paddingBottom;

    const min = Math.min(...data, -3);
    const max = Math.max(...data, 3);
    const range = max - min || 1;

    const tickCount = 5;
    const ticks = Array.from({ length: tickCount }, (_, i) => {
      const val = min + (range / (tickCount - 1)) * i;
      return Math.round(val * 10) / 10;
    });

    const getX = (i) => paddingLeft + (i / (data.length - 1 || 1)) * chartW;
    const getY = (v) => paddingTop + chartH - ((v - min) / range) * chartH;

    const linePoints = data.map((d, i) => `${getX(i)},${getY(d)}`).join(' ');

    const areaPath = [
      `M ${getX(0)},${getY(0)}`,
      ...data.map((d, i) => `L ${getX(i)},${getY(d)}`),
      `L ${getX(data.length - 1)},${getY(0)}`,
      'Z'
    ].join(' ');

    const zeroY = getY(0);
    const lastVal = data[data.length - 1] || 0;
    const fillColor = lastVal >= 0 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)';
    const lineColor = lastVal >= 0 ? '#10b981' : '#ef4444';

    if (mini) {
      const mW = 300, mH = 60, mP = 6;
      const mMin = Math.min(...data, -1);
      const mMax = Math.max(...data, 1);
      const mRange = mMax - mMin || 1;
      const mX = (i) => mP + (i / (data.length - 1 || 1)) * (mW - mP * 2);
      const mY = (v) => mP + (mH - mP * 2) - ((v - mMin) / mRange) * (mH - mP * 2);
      const mPoints = data.map((d, i) => `${mX(i)},${mY(d)}`).join(' ');
      const mArea = [
        `M ${mX(0)},${mY(0)}`,
        ...data.map((d, i) => `L ${mX(i)},${mY(d)}`),
        `L ${mX(data.length - 1)},${mY(0)}`, 'Z'
      ].join(' ');
      return (
        <svg width="100%" height={mH} viewBox={`0 0 ${mW} ${mH}`} style={{ overflow: 'hidden' }}>
          <path d={mArea} fill={lastVal >= 0 ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)'} />
          <polyline fill="none" stroke={lineColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={mPoints} />
        </svg>
      );
    }

    return (
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        {ticks.map((tick, i) => {
          const y = getY(tick);
          return (
            <g key={i}>
              <line
                x1={paddingLeft} y1={y}
                x2={width - paddingRight} y2={y}
                stroke="rgba(255,255,255,0.06)"
                strokeDasharray={tick === 0 ? '4' : '0'}
                strokeWidth={tick === 0 ? 1.5 : 1}
              />
              <text
                x={paddingLeft - 6} y={y + 4}
                fill={tick === 0 ? 'rgba(255,255,255,0.5)' : tick > 0 ? '#10b981' : '#ef4444'}
                fontSize="10"
                textAnchor="end"
              >
                {tick > 0 ? `+${tick}%` : `${tick}%`}
              </text>
            </g>
          );
        })}

        <path d={areaPath} fill={fillColor} />

        <polyline
          fill="none"
          stroke={lineColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={linePoints}
        />

        {data.map((d, i) => (
          <circle
            key={i}
            cx={getX(i)} cy={getY(d)}
            r="3.5"
            fill={lineColor}
            stroke="#0f172a"
            strokeWidth="1.5"
          />
        ))}

        {data.map((_, i) => (
          i % Math.max(1, Math.floor(data.length / 6)) === 0 && (
            <text
              key={i}
              x={getX(i)} y={height - 6}
              fill="rgba(255,255,255,0.3)"
              fontSize="9"
              textAnchor="middle"
            >
              {i === 0 ? 'Start' : `T${i}`}
            </text>
          )
        ))}
      </svg>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }} className="backtest-container">
      {!activeSession ? (
        <>
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 className="text-gradient">Strategy Verification</h2>
              <p style={{ color: 'var(--text-muted)' }}>Validate your edge using historical market data.</p>
            </div>
            <button className="btn-primary" onClick={() => setShowNewSessionModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Plus size={20} /> New Session
            </button>
          </header>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {sessions.map(session => {
              const stats = calculateStats(session.trades);
              return (
                <motion.div 
                  key={session._id}
                  whileHover={{ y: -5 }}
                  className="glass-card" 
                  style={{ padding: '25px', cursor: 'pointer', position: 'relative' }}
                  onClick={() => setActiveSession(session)}
                >
                  <button 
                    onClick={(e) => deleteSession(session._id, e)}
                    style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: 'var(--danger)', opacity: 0.4 }}
                  >
                    <Trash2 size={16} />
                  </button>
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h3 style={{ fontSize: '1.2rem', marginBottom: '5px' }}>{session.name}</h3>
                      {stats.status === 'Passed' && <Award size={20} color="var(--success)" />}
                      {stats.status === 'Blown' && <AlertOctagon size={20} color="var(--danger)" />}
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                       <span style={{ fontSize: '0.7rem', color: 'var(--primary)', background: 'rgba(56, 189, 248, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>{session.strategy || 'No Strategy'}</span>
                       <span style={{ fontSize: '0.7rem', color: 'var(--success)', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>{session.account || 'Default'}</span>
                    </div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                    <div>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Status</p>
                      <p style={{ 
                        fontSize: '1rem', 
                        fontWeight: 'bold', 
                        color: stats.status === 'Passed' 
                          ? 'var(--success)' 
                          : stats.status === 'Blown' 
                            ? 'var(--danger)' 
                            : parseFloat(stats.totalRR) < 0 
                              ? 'var(--danger)' 
                              : parseFloat(stats.totalRR) > 0 
                                ? 'var(--success)' 
                                : 'var(--text-muted)'
                      }}>
                        {stats.status === 'Passed' 
                          ? 'PASSED ✅' 
                          : stats.status === 'Blown' 
                            ? 'BLOWN 💀' 
                            : `${stats.totalRR}R ${parseFloat(stats.totalRR) >= 0 ? 'Profit' : 'Loss'}`
                        }
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Win Rate</p>
                      <p style={{ fontSize: '1rem', fontWeight: 'bold' }}>{stats.winRate}%</p>
                    </div>
                  </div>
                  
                  <div style={{ height: '60px', opacity: 0.7, overflow: 'hidden' }}>
                    <EquityChart data={stats.equity} mini={true} />
                  </div>

                  <div style={{ marginTop: '20px', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{stats.count} Trades</span>
                    <span style={{ color: stats.mistakeRate > 10 ? 'var(--danger)' : 'inherit' }}>{stats.mistakeRate}% Mistakes</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }} className="printable-report">
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <button className="icon-btn no-print" onClick={() => setActiveSession(null)}><ArrowLeft size={20} /></button>
              <div>
                <h2 className="text-gradient">{activeSession.name}</h2>
                <p style={{ color: 'var(--text-muted)' }}>Strategy Verification Report - <span style={{ color: 'var(--primary)' }}>{activeSession.strategy}</span></p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '15px' }}>
              <button className="btn-outline no-print" onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Printer size={18} /> Export PDF Report
              </button>
              <div className="glass" style={{ padding: '10px 25px', borderRadius: '15px', display: 'flex', gap: '40px', alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Current P/L</p>
                  <p style={{ fontSize: '1.2rem', fontWeight: '900', color: parseFloat(calculateStats(activeSession.trades).totalRR) >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                    {calculateStats(activeSession.trades).totalRR}%
                  </p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Status</p>
                  <span style={{ 
                    fontSize: '0.7rem', 
                    fontWeight: 'bold', 
                    padding: '2px 10px', 
                    borderRadius: '10px',
                    background: calculateStats(activeSession.trades).status === 'Passed' ? 'rgba(16, 185, 129, 0.2)' : calculateStats(activeSession.trades).status === 'Blown' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                    color: calculateStats(activeSession.trades).status === 'Passed' ? 'var(--success)' : calculateStats(activeSession.trades).status === 'Blown' ? 'var(--danger)' : 'var(--primary)'
                  }}>
                    {calculateStats(activeSession.trades).status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </header>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
             <div className="glass-card" style={{ padding: '20px' }}>
                <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Win : Loss Ratio</p>
                <p style={{ fontSize: '1.6rem', fontWeight: 'bold', color: parseFloat(calculateStats(activeSession.trades).profitFactor) >= 1.5 ? 'var(--success)' : 'var(--danger)', marginBottom: '6px' }}>
                  {calculateStats(activeSession.trades).profitFactor}
                </p>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  Gross wins ÷ Gross losses. <span style={{ color: 'var(--primary)' }}>Above 1.5 = Good edge</span>
                </p>
             </div>

             <div className="glass-card" style={{ padding: '20px' }}>
                <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Avg Gain / Trade</p>
                <p style={{ fontSize: '1.6rem', fontWeight: 'bold', color: parseFloat(calculateStats(activeSession.trades).expectancy) >= 0 ? 'var(--success)' : 'var(--danger)', marginBottom: '6px' }}>
                  {calculateStats(activeSession.trades).expectancy}R
                </p>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  Avg return per trade. <span style={{ color: 'var(--primary)' }}>Positive = Profitable strategy</span>
                </p>
             </div>

             <div className="glass-card" style={{ padding: '20px' }}>
                <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Max Drawdown</p>
                <p style={{ fontSize: '1.6rem', fontWeight: 'bold', color: 'var(--danger)', marginBottom: '6px' }}>
                  -{calculateStats(activeSession.trades).maxDrawdown}R
                </p>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  Biggest losing streak. <span style={{ color: 'var(--primary)' }}>Lower = Safer strategy</span>
                </p>
             </div>

             <div className="glass-card" style={{ padding: '20px' }}>
                <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Win Rate</p>
                <p style={{ fontSize: '1.6rem', fontWeight: 'bold', color: calculateStats(activeSession.trades).winRate >= 50 ? 'var(--success)' : 'var(--warning)', marginBottom: '6px' }}>
                  {calculateStats(activeSession.trades).winRate}%
                </p>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  Winning trades out of total. <span style={{ color: 'var(--primary)' }}>50%+ with good R:R = edge</span>
                </p>
             </div>

             <div className="glass-card" style={{ padding: '20px' }}>
                <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Best Session</p>
                <p style={{ fontSize: '1.6rem', fontWeight: 'bold', color: calculateStats(activeSession.trades).bestSession.rate >= 50 ? 'var(--primary)' : 'var(--text-muted)', marginBottom: '6px' }}>
                  {calculateStats(activeSession.trades).bestSession.name}
                </p>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  Highest Win Rate: <span style={{ color: 'var(--primary)' }}>{calculateStats(activeSession.trades).bestSession.rate}%</span>
                </p>
             </div>

             <div className="glass-card" style={{ padding: '20px' }}>
                <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Best Day</p>
                <p style={{ fontSize: '1.6rem', fontWeight: 'bold', color: calculateStats(activeSession.trades).bestDay.rate >= 50 ? 'var(--primary)' : 'var(--text-muted)', marginBottom: '6px' }}>
                  {calculateStats(activeSession.trades).bestDay.name}
                </p>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  Highest Win Rate: <span style={{ color: 'var(--primary)' }}>{calculateStats(activeSession.trades).bestDay.rate}%</span>
                </p>
             </div>

             <div className="glass-card" style={{ padding: '20px' }}>
                <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Best Setup</p>
                <p style={{ fontSize: '1.6rem', fontWeight: 'bold', color: calculateStats(activeSession.trades).bestSetup.rate >= 50 ? 'var(--primary)' : 'var(--text-muted)', marginBottom: '6px' }}>
                  {calculateStats(activeSession.trades).bestSetup.name}
                </p>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  Highest Win Rate: <span style={{ color: 'var(--primary)' }}>{calculateStats(activeSession.trades).bestSetup.rate}%</span>
                </p>
             </div>

             <div className="glass-card" style={{ padding: '20px' }}>
                <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Best Hour</p>
                <p style={{ fontSize: '1.6rem', fontWeight: 'bold', color: calculateStats(activeSession.trades).bestHour.rate >= 50 ? 'var(--primary)' : 'var(--text-muted)', marginBottom: '6px' }}>
                  {calculateStats(activeSession.trades).bestHour.name}
                </p>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  Highest Win Rate: <span style={{ color: 'var(--primary)' }}>{calculateStats(activeSession.trades).bestHour.rate}%</span>
                </p>
             </div>

             <div className="glass-card" style={{ padding: '20px' }}>
                <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Max Streaks</p>
                <p style={{ fontSize: '1.6rem', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '6px', display: 'flex', gap: '15px' }}>
                  <span style={{ color: 'var(--success)' }}>{calculateStats(activeSession.trades).maxWinStreak}W</span>
                  <span style={{ color: 'var(--danger)' }}>{calculateStats(activeSession.trades).maxLossStreak}L</span>
                </p>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  Longest consecutive <span style={{ color: 'var(--success)' }}>Wins</span> & <span style={{ color: 'var(--danger)' }}>Losses</span>
                </p>
             </div>

             <div className="glass-card" style={{ padding: '20px' }}>
                <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Recovery Factor</p>
                <p style={{ fontSize: '1.6rem', fontWeight: 'bold', color: parseFloat(calculateStats(activeSession.trades).recoveryFactor) >= 2 ? 'var(--success)' : 'var(--warning)', marginBottom: '6px' }}>
                  {calculateStats(activeSession.trades).recoveryFactor}
                </p>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  Net Profit ÷ Max DD. <span style={{ color: 'var(--primary)' }}>Above 2.0 = Excellent</span>
                </p>
             </div>
          </div>

          {/* Equity Chart & Session Conclusion Row Removed From Here */}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '30px', alignItems: 'start' }}>
            <section className="glass-card no-print" style={{ padding: '30px' }}>
              <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Plus size={18} color="var(--primary)" /> Log New Trade
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                   <div>
                     <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>Pair</label>
                     <input type="text" value={tradeForm.symbol} onChange={(e) => setTradeForm({...tradeForm, symbol: e.target.value})} placeholder="e.g. GBPUSD" />
                   </div>
                   <div>
                     <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>Type</label>
                     <select value={tradeForm.type} onChange={(e) => setTradeForm({...tradeForm, type: e.target.value})}>
                       <option>Long</option>
                       <option>Short</option>
                     </select>
                   </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                   {backtestFields
                     .filter(field => !['pair', 'type', 'status', 'r:r', 'rr'].includes(field.label.toLowerCase()))
                     .map((field, idx) => (
                     <div key={idx}>
                       <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>{field.label}</label>
                       <select 
                         value={tradeForm.customData[field.label] || ''} 
                         onChange={(e) => setTradeForm({
                           ...tradeForm, 
                           customData: { ...tradeForm.customData, [field.label]: e.target.value }
                         })}
                       >
                         {field.options.map((opt, oIdx) => <option key={oIdx} value={opt}>{opt}</option>)}
                       </select>
                     </div>
                   ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                   <div>
                     <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>Status</label>
                     <select value={tradeForm.status} onChange={(e) => setTradeForm({...tradeForm, status: e.target.value})}>
                       <option value="Win">Win ✅</option>
                       <option value="Loss">Loss ❌</option>
                       <option value="BE">BE ➖</option>
                     </select>
                   </div>
                   <div>
                     <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>R:R</label>
                     <input type="number" step="0.1" value={tradeForm.rr} onChange={(e) => setTradeForm({...tradeForm, rr: e.target.value})} />
                   </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                   <div>
                     <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>📅 Trade Date</label>
                     <input 
                       type="date" 
                       value={tradeForm.tradeDate} 
                       onChange={(e) => setTradeForm({...tradeForm, tradeDate: e.target.value})} 
                       style={{ width: '100%' }}
                     />
                   </div>
                   <div>
                     <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>⏰ Trade Time</label>
                     <input 
                       type="time" 
                       value={tradeForm.tradeTime} 
                       onChange={(e) => setTradeForm({...tradeForm, tradeTime: e.target.value})} 
                       style={{ width: '100%' }}
                     />
                   </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input type="checkbox" checked={tradeForm.isMistake} onChange={(e) => setTradeForm({...tradeForm, isMistake: e.target.checked})} />
                  <label style={{ fontSize: '0.8rem', color: tradeForm.isMistake ? 'var(--danger)' : 'var(--text-muted)' }}>Execution Mistake?</label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  {/* BEFORE Chart */}
                  <div style={{ border: '1px dashed var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
                    {tradeForm.beforeChart ? (
                      <div style={{ position: 'relative' }}>
                        <img 
                          src={getImageUrl(tradeForm.beforeChart)} 
                          alt="Before" 
                          style={{ width: '100%', display: 'block', borderRadius: '8px', cursor: 'pointer' }}
                          onClick={() => setLightbox(tradeForm.beforeChart)}
                        />
                        <button 
                          onClick={() => setTradeForm({...tradeForm, beforeChart: ''})}
                          style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(0,0,0,0.7)', border: 'none', color: 'white', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >×</button>
                      </div>
                    ) : (
                      <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', cursor: 'pointer', gap: '8px' }}>
                        <Upload size={22} color="var(--primary)" />
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0 }}>BEFORE</p>
                        <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', margin: 0 }}>{uploading.before ? 'Uploading...' : 'Click to upload'}</p>
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, 'before')} />
                      </label>
                    )}
                  </div>

                  {/* AFTER Chart */}
                  <div style={{ border: '1px dashed var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
                    {tradeForm.afterChart ? (
                      <div style={{ position: 'relative' }}>
                        <img 
                          src={getImageUrl(tradeForm.afterChart)} 
                          alt="After" 
                          style={{ width: '100%', display: 'block', borderRadius: '8px', cursor: 'pointer' }}
                          onClick={() => setLightbox(tradeForm.afterChart)}
                        />
                        <button 
                          onClick={() => setTradeForm({...tradeForm, afterChart: ''})}
                          style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(0,0,0,0.7)', border: 'none', color: 'white', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >×</button>
                      </div>
                    ) : (
                      <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', cursor: 'pointer', gap: '8px' }}>
                        <Upload size={22} color="var(--success)" />
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0 }}>AFTER</p>
                        <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', margin: 0 }}>{uploading.after ? 'Uploading...' : 'Click to upload'}</p>
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, 'after')} />
                      </label>
                    )}
                  </div>
                </div>

                <div style={{ padding: '15px', background: 'rgba(56, 189, 248, 0.03)', borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.1)' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <Edit3 size={16} /> 📝 Notes / Observation (Per Trade)
                  </label>
                  <textarea 
                    placeholder="Why did you take this trade? What did you see? (This clears after logging)" 
                    value={tradeForm.notes} 
                    onChange={(e) => setTradeForm({...tradeForm, notes: e.target.value})}
                    style={{ width: '100%', minHeight: '120px', background: 'rgba(0,0,0,0.2)', color: 'var(--text-main)', fontSize: '0.9rem', padding: '12px', border: '1px solid var(--border)', borderRadius: '8px' }}
                  />
                </div>

                <button className="btn-primary" onClick={logTrade}>Log Result</button>
              </div>
            </section>

            <section className="glass-card" style={{ padding: '0', overflow: 'hidden', gridColumn: 'span 2' }}>
               <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
                 <h3 style={{ fontSize: '1rem' }}>Strategy Log ({activeSession.trades.length} Executions)</h3>
               </div>
               <div style={{ overflowX: 'auto', width: '100%' }}>
               <table style={{ width: '100%', minWidth: '900px', borderCollapse: 'collapse' }}>
                  <thead style={{ background: 'rgba(255,255,255,0.02)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <tr>
                      <th style={{ padding: '15px 15px', textAlign: 'left' }}>#</th>
                      <th style={{ padding: '15px 15px', textAlign: 'left' }}>DATE</th>
                      <th style={{ padding: '15px 15px', textAlign: 'left' }}>PAIR</th>
                      <th style={{ padding: '15px 15px', textAlign: 'left' }}>TYPE</th>
                      <th style={{ padding: '15px 15px', textAlign: 'left' }}>STATUS</th>
                      <th style={{ padding: '15px 15px', textAlign: 'left' }}>R:R</th>
                      <th style={{ padding: '15px 15px', textAlign: 'left' }}>MISTAKE</th>
                      <th style={{ padding: '15px 15px', textAlign: 'left' }}>NOTES</th>
                      <th style={{ padding: '15px 15px', textAlign: 'left' }}>CHARTS</th>
                      <th style={{ padding: '15px 15px', textAlign: 'center' }} className="no-print">ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeSession.trades.slice().reverse().map((trade, idx) => (
                      <tr key={trade._id || idx} style={{ borderBottom: '1px solid var(--border)', fontSize: '0.9rem' }}>
                        <td style={{ padding: '20px 25px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '2px' }}>
                            <span style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.65rem', textTransform: 'uppercase' }}>
                              {trade.tradeDate ? ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date(trade.tradeDate).getUTCDay()] : ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date(trade.timestamp).getDay()]}
                            </span>
                            {trade.tradeTime && <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>{trade.tradeTime}</span>}
                          </div>
                          {trade.tradeDate ? new Date(trade.tradeDate).toLocaleDateString('en-GB', { timeZone: 'UTC' }) : new Date(trade.timestamp).toLocaleDateString('en-GB')}
                        </td>
                        <td style={{ padding: '15px 15px', fontWeight: 'bold' }}>{trade.symbol}</td>
                        <td style={{ padding: '15px 15px', color: trade.type === 'Long' ? 'var(--success)' : 'var(--danger)' }}>{trade.type}</td>
                        <td style={{ padding: '15px 15px' }}>
                          <span style={{
                            padding: '6px 12px',
                            borderRadius: '12px',
                            fontSize: '0.8rem',
                            fontWeight: 'bold',
                            background: trade.status === 'Win' ? 'rgba(16, 185, 129, 0.15)' : trade.status === 'Loss' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                            color: trade.status === 'Win' ? 'var(--success)' : trade.status === 'Loss' ? 'var(--danger)' : 'var(--primary)'
                          }}>
                            {trade.status}
                          </span>
                        </td>
                        <td style={{ padding: '15px 15px', color: parseFloat(trade.rr) > 0 ? 'var(--success)' : parseFloat(trade.rr) < 0 ? 'var(--danger)' : 'var(--text-muted)' }}>
                          {parseFloat(trade.rr) > 0 ? '+' : ''}{trade.rr}R
                        </td>
                        <td style={{ padding: '15px 15px' }}>{trade.isMistake ? '🔴 Yes' : '🟢 No'}</td>
                        <td style={{ padding: '15px 15px' }}>
                          <div style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.75rem', color: 'var(--text-muted)' }} title={trade.notes}>
                            {trade.notes || '—'}
                          </div>
                        </td>
                        <td style={{ padding: '15px 15px' }}>
                          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                            {trade.beforeChart ? (
                              <div
                                onClick={() => setLightbox(trade.beforeChart)}
                                style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
                                title="View Before Chart"
                              >
                                <img
                                  src={getImageUrl(trade.beforeChart)}
                                  alt="Before"
                                  style={{ width: '50px', height: '35px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--primary)', transition: 'transform 0.2s' }}
                                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                />
                                <span style={{ fontSize: '0.6rem', fontWeight: 'bold', color: 'var(--primary)' }}>BEFORE</span>
                              </div>
                            ) : (
                              <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.15)' }}>—</span>
                            )}
                            {trade.afterChart ? (
                              <div
                                onClick={() => setLightbox(trade.afterChart)}
                                style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
                                title="View After Chart"
                              >
                                <img
                                  src={getImageUrl(trade.afterChart)}
                                  alt="After"
                                  style={{ width: '50px', height: '35px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--success)', transition: 'transform 0.2s' }}
                                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                />
                                <span style={{ fontSize: '0.6rem', fontWeight: 'bold', color: 'var(--success)' }}>AFTER</span>
                              </div>
                            ) : (
                              <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.15)' }}>—</span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '15px 15px', textAlign: 'center' }} className="no-print">
                           <button onClick={() => deleteTrade(trade._id)} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', opacity: 0.5, cursor: 'pointer' }}><Trash2 size={14} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
            </section>
          </div>

          <div className="glass-card" style={{ padding: '25px', marginTop: '40px' }}>
             <h4 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
               <TrendingUp size={18} color="var(--primary)" /> Session Equity Curve
             </h4>
             <EquityChart data={calculateStats(activeSession.trades).equity} />
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightbox && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.9)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => setLightbox(null)}
          >
            <motion.img 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              src={getImageUrl(lightbox)} 
              style={{ maxWidth: '90%', maxHeight: '85%', borderRadius: '8px', boxShadow: '0 20px 60px rgba(0,0,0,0.8)' }} 
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showNewSessionModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card" style={{ width: '400px', padding: '30px' }}>
                <h3 style={{ marginBottom: '20px' }}>Create Backtest Session</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                   <input type="text" placeholder="Session Name" value={newSessionForm.name} onChange={(e) => setNewSessionForm({...newSessionForm, name: e.target.value})} />
                   {accounts.length > 0 ? (
                     <select value={newSessionForm.account} onChange={(e) => setNewSessionForm({...newSessionForm, account: e.target.value})}>
                       {accounts.map((acc, i) => <option key={i} value={acc.name}>{acc.name}</option>)}
                     </select>
                   ) : (
                     <div style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', fontSize: '0.8rem', borderRadius: '8px' }}>
                       No "Backtesting" accounts found. Create one in Settings first.
                     </div>
                   )}
                   <input type="text" placeholder="Strategy" value={newSessionForm.strategy} onChange={(e) => setNewSessionForm({...newSessionForm, strategy: e.target.value})} />
                   <input type="text" placeholder="Pair" value={newSessionForm.pair} onChange={(e) => setNewSessionForm({...newSessionForm, pair: e.target.value})} />
                   <button className="btn-primary" onClick={createSession}>Create Session</button>
                   <button className="btn-outline" onClick={() => setShowNewSessionModal(false)}>Cancel</button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Backtest;
