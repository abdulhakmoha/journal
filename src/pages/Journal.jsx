import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  List as ListIcon, 
  ChevronLeft, 
  ChevronRight, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  Image as ImageIcon, 
  Maximize2, 
  X,
  LayoutList
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BACKEND_URL = 'https://journal-production-6346.up.railway.app';

const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://localhost:5000')) {
    return url.replace('http://localhost:5000', BACKEND_URL);
  }
  if (url.startsWith('http')) return url;
  return `${BACKEND_URL}${url}`;
};

const Journal = ({ trades, onEdit, onDelete, onAdd, accounts }) => {
  const [view, setView] = useState('list');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterAccount, setFilterAccount] = useState('All');
  const [expandedTrade, setExpandedTrade] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const saved = localStorage.getItem('zentrader_visible_columns');
    return saved ? JSON.parse(saved) : {
      date: true,
      symbol: true,
      type: true,
      strategy: true,
      rr: true,
      account: true,
      status: true
    };
  });
  const [showColumnPicker, setShowColumnPicker] = useState(false);

  useEffect(() => {
    localStorage.setItem('zentrader_visible_columns', JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  const filteredTrades = trades.filter(t => {
    const matchSearch = t.symbol?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.account?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.strategy?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'All' || t.status === filterStatus;
    const matchAccount = filterAccount === 'All' || t.account === filterAccount;
    return matchSearch && matchStatus && matchAccount;
  });

  const exportToCSV = () => {
    const headers = ['Date', 'Symbol', 'Type', 'Strategy', 'Status', 'Risk%', 'Reward%', 'R:R', 'Grade', 'Account', 'Notes'];
    const rows = filteredTrades.map(t => [
      new Date(t.timestamp).toLocaleDateString(),
      t.symbol, t.type, t.strategy || '', t.status,
      t.risk || '', t.reward || '', t.rr || '',
      t.grade || '', t.account || '', (t.notes || '').replace(/,/g, ';')
    ]);
    const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ZenTrader_Journal_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

  const getTradesForDay = (day) => {
    if (!day) return [];
    return trades.filter(t => {
      const d = new Date(t.timestamp);
      return d.getDate() === day && 
             d.getMonth() === currentDate.getMonth() && 
             d.getFullYear() === currentDate.getFullYear();
    });
  };

  const toggleExpand = (id) => {
    setExpandedTrade(expandedTrade === id ? null : id);
  };

  const calculateStats = (tradesList) => {
    if (!tradesList || tradesList.length === 0) return { 
      winRate: 0, 
      profitFactor: 0,
      expectancy: 0,
      maxWinStreak: 0,
      maxLossStreak: 0,
      bestDay: { name: 'N/A', rate: 0 },
      bestSetup: { name: 'N/A', rate: 0 },
      bestHour: { name: 'N/A', rate: 0 }
    };
    
    const wins = tradesList.filter(t => t.status === 'Win');
    const losses = tradesList.filter(t => t.status === 'Loss');

    let currentWinStreak = 0, maxWinStreak = 0;
    let currentLossStreak = 0, maxLossStreak = 0;
    
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const daysStats = {};
    const setupStats = {};
    const hourStats = {};

    // Sort trades oldest to newest for accurate streaks
    const chronological = [...tradesList].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    chronological.forEach(t => {
      // Streaks
      if (t.status === 'Win') {
        currentWinStreak++;
        currentLossStreak = 0;
        if (currentWinStreak > maxWinStreak) maxWinStreak = currentWinStreak;
      } else if (t.status === 'Loss') {
        currentLossStreak++;
        currentWinStreak = 0;
        if (currentLossStreak > maxLossStreak) maxLossStreak = currentLossStreak;
      } else {
        currentWinStreak = 0;
        currentLossStreak = 0;
      }

      const d = new Date(t.timestamp);
      
      // Day Stats
      const dayName = dayNames[d.getDay()];
      if (!daysStats[dayName]) daysStats[dayName] = { wins: 0, total: 0 };
      daysStats[dayName].total++;
      if (t.status === 'Win') daysStats[dayName].wins++;

      // Setup Stats
      const setup = t.strategy || 'Unknown';
      if (!setupStats[setup]) setupStats[setup] = { wins: 0, total: 0 };
      setupStats[setup].total++;
      if (t.status === 'Win') setupStats[setup].wins++;

      // Hour Stats
      const hour = d.getHours().toString().padStart(2, '0') + ':00';
      if (!hourStats[hour]) hourStats[hour] = { wins: 0, total: 0 };
      hourStats[hour].total++;
      if (t.status === 'Win') hourStats[hour].wins++;
    });
    
    const grossProfit = wins.reduce((acc, t) => acc + (parseFloat(t.rr) || 1), 0);
    const grossLoss = losses.length;
    const profitFactor = grossLoss === 0 ? grossProfit : (grossProfit / grossLoss).toFixed(2);

    const winRate = wins.length / tradesList.length;
    const totalNetR = grossProfit - grossLoss;
    const expectancy = (totalNetR / tradesList.length).toFixed(2);

    let bestDay = { name: 'N/A', rate: 0 };
    Object.keys(daysStats).forEach(day => {
      const wr = Math.round((daysStats[day].wins / daysStats[day].total) * 100);
      if (wr > bestDay.rate && daysStats[day].total >= 1) bestDay = { name: day, rate: wr };
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
      profitFactor,
      expectancy,
      bestDay,
      bestSetup,
      bestHour,
      maxWinStreak,
      maxLossStreak
    };
  };

  const currentStats = calculateStats(filteredTrades);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="text-gradient">Trading Journal</h2>
          <p style={{ color: 'var(--text-muted)' }}>Review and manage your execution history.</p>
        </div>

        <div style={{ display: 'flex', gap: '15px' }}>
          <div className="glass" style={{ display: 'flex', padding: '5px', borderRadius: '12px' }}>
            <button 
              onClick={() => setView('list')}
              style={{ padding: '8px 15px', borderRadius: '8px', border: 'none', background: view === 'list' ? 'var(--primary)' : 'transparent', color: view === 'list' ? 'white' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <ListIcon size={16} /> List
            </button>
            <button 
              onClick={() => setView('calendar')}
              style={{ padding: '8px 15px', borderRadius: '8px', border: 'none', background: view === 'calendar' ? 'var(--primary)' : 'transparent', color: view === 'calendar' ? 'white' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <CalendarIcon size={16} /> Calendar
            </button>
          </div>
          <div style={{ position: 'relative' }}>
            <button 
              className="glass" 
              style={{ padding: '10px 15px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
              onClick={() => setShowColumnPicker(!showColumnPicker)}
            >
              <LayoutList size={18} /> Columns
            </button>
            <AnimatePresence>
              {showColumnPicker && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="glass-card" 
                  style={{ position: 'absolute', top: '100%', right: 0, marginTop: '10px', padding: '15px', width: '200px', zIndex: 100, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                >
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase' }}>Show/Hide Columns</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {Object.keys(visibleColumns).map(col => (
                      <label key={col} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={visibleColumns[col]} 
                          onChange={() => setVisibleColumns({...visibleColumns, [col]: !visibleColumns[col]})}
                        />
                        {col.toUpperCase()}
                      </label>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button className="btn-primary" style={{ padding: '10px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }} onClick={onAdd}>
            <Plus size={20} />
            New Trade
          </button>
        </div>
      </header>

      {/* Advanced Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
         <div className="glass-card" style={{ padding: '15px' }}>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '5px' }}>Win Rate</p>
            <p style={{ fontSize: '1.4rem', fontWeight: 'bold', color: currentStats.winRate >= 50 ? 'var(--success)' : 'var(--warning)' }}>
              {currentStats.winRate}%
            </p>
         </div>
         <div className="glass-card" style={{ padding: '15px' }}>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '5px' }}>Avg Gain / Trade</p>
            <p style={{ fontSize: '1.4rem', fontWeight: 'bold', color: parseFloat(currentStats.expectancy) >= 0 ? 'var(--success)' : 'var(--danger)' }}>
              {currentStats.expectancy}R
            </p>
         </div>
         <div className="glass-card" style={{ padding: '15px' }}>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '5px' }}>Win : Loss Ratio</p>
            <p style={{ fontSize: '1.4rem', fontWeight: 'bold', color: parseFloat(currentStats.profitFactor) >= 1.5 ? 'var(--success)' : 'var(--danger)' }}>
              {currentStats.profitFactor}
            </p>
         </div>
         <div className="glass-card" style={{ padding: '15px' }}>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '5px' }}>Max Streaks</p>
            <p style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--text-main)', display: 'flex', gap: '10px' }}>
              <span style={{ color: 'var(--success)' }}>{currentStats.maxWinStreak}W</span>
              <span style={{ color: 'var(--danger)' }}>{currentStats.maxLossStreak}L</span>
            </p>
         </div>
         <div className="glass-card" style={{ padding: '15px' }}>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '5px' }}>Best Setup</p>
            <p style={{ fontSize: '1.4rem', fontWeight: 'bold', color: currentStats.bestSetup.rate >= 50 ? 'var(--primary)' : 'var(--text-muted)' }}>
              {currentStats.bestSetup.name}
            </p>
         </div>
         <div className="glass-card" style={{ padding: '15px' }}>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '5px' }}>Best Hour</p>
            <p style={{ fontSize: '1.4rem', fontWeight: 'bold', color: currentStats.bestHour.rate >= 50 ? 'var(--primary)' : 'var(--text-muted)' }}>
              {currentStats.bestHour.name}
            </p>
         </div>
      </div>

      {view === 'list' ? (
        <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            {/* Search */}
            <div style={{ position: 'relative', minWidth: '250px' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Search symbol, strategy, account..." 
                style={{ width: '100%', paddingLeft: '40px' }} 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Advanced Filters */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <Filter size={16} color="var(--primary)" />
              {/* Status Filter */}
              <div style={{ display: 'flex', gap: '5px' }}>
                {['All', 'Win', 'Loss', 'BE'].map(s => (
                  <button key={s} onClick={() => setFilterStatus(s)} style={{ padding: '5px 12px', borderRadius: '20px', border: 'none', fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer', background: filterStatus === s ? (s === 'Win' ? 'var(--success)' : s === 'Loss' ? 'var(--danger)' : s === 'BE' ? 'var(--warning)' : 'var(--primary)') : 'rgba(255,255,255,0.05)', color: filterStatus === s ? 'white' : 'var(--text-muted)', transition: 'all 0.2s' }}>
                    {s === 'Win' ? '✅ Win' : s === 'Loss' ? '❌ Loss' : s === 'BE' ? '➖ BE' : 'All'}
                  </button>
                ))}
              </div>

              {/* Account Filter */}
              <select value={filterAccount} onChange={(e) => setFilterAccount(e.target.value)} style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '0.78rem' }}>
                <option value="All">All Accounts</option>
                {(accounts || []).map(acc => <option key={acc._id} value={acc.name}>{acc.name}</option>)}
              </select>

              {/* Export CSV */}
              <button onClick={exportToCSV} style={{ padding: '6px 15px', borderRadius: '20px', border: '1px solid var(--primary)', background: 'rgba(56,189,248,0.1)', color: 'var(--primary)', fontSize: '0.78rem', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                ⬇ Export CSV ({filteredTrades.length})
              </button>

              {/* Reset filters */}
              {(filterStatus !== 'All' || filterAccount !== 'All' || searchTerm) && (
                <button onClick={() => { setFilterStatus('All'); setFilterAccount('All'); setSearchTerm(''); }} style={{ padding: '5px 12px', borderRadius: '20px', border: 'none', background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', fontSize: '0.78rem', cursor: 'pointer' }}>✕ Reset</button>
              )}
            </div>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                <tr>
                  <th style={{ padding: '15px 20px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>DATE / TIME</th>
                  <th style={{ padding: '15px 20px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>SYMBOL</th>
                  <th style={{ padding: '15px 20px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>TYPE</th>
                  <th style={{ padding: '15px 20px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>STRATEGY</th>
                  <th style={{ padding: '15px 20px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>P/L (%)</th>
                  <th style={{ padding: '15px 20px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>VISUALS</th>
                  <th style={{ padding: '15px 20px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>STATUS</th>
                  <th style={{ padding: '15px 20px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredTrades.map((trade, idx) => (
                  <React.Fragment key={trade._id}>
                    <tr 
                      style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.2s' }} 
                      className={expandedTrade === trade._id ? 'active-row' : 'table-row-hover'}
                      onClick={() => toggleExpand(trade._id)}
                    >
                        {visibleColumns.date && (
                          <td style={{ padding: '15px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div className="glass" style={{ padding: '5px 8px', borderRadius: '6px', textAlign: 'center', minWidth: '45px' }}>
                                <span style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 'bold', display: 'block' }}>{new Date(trade.timestamp).toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}</span>
                                <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{new Date(trade.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                              <span style={{ fontSize: '0.85rem' }}>{new Date(trade.timestamp).toLocaleDateString()}</span>
                            </div>
                          </td>
                        )}
                        {visibleColumns.symbol && <td style={{ padding: '15px', fontWeight: 'bold' }}>{trade.symbol}</td>}
                        {visibleColumns.type && (
                          <td style={{ padding: '15px' }}>
                            <span style={{ color: trade.type === 'Long' ? 'var(--success)' : 'var(--danger)', fontSize: '0.85rem' }}>{trade.type}</span>
                          </td>
                        )}
                        {visibleColumns.strategy && <td style={{ padding: '15px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{trade.strategy || 'Price Action'}</td>}
                        {visibleColumns.rr && (
                          <td style={{ padding: '15px' }}>
                            <span style={{ 
                              color: trade.status === 'Win' ? 'var(--success)' : trade.status === 'Loss' ? 'var(--danger)' : 'var(--text-muted)',
                              fontWeight: 'bold'
                            }}>
                              {trade.status === 'Win' ? '+' : trade.status === 'Loss' ? '-' : ''}
                              {trade.status === 'BE' ? '0.00%' : `${trade.reward || 0}%`}
                            </span>
                          </td>
                        )}
                        {visibleColumns.account && <td style={{ padding: '15px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{trade.account || 'Primary'}</td>}
                        
                        <td style={{ padding: '15px' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                             {trade.beforeChart && <ImageIcon size={16} color="var(--primary)" />}
                             {trade.afterChart && <ImageIcon size={16} color="var(--success)" />}
                             {!trade.beforeChart && !trade.afterChart && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>No Charts</span>}
                          </div>
                        </td>

                        {visibleColumns.status && (
                          <td style={{ padding: '15px' }}>
                            <span className={`status-badge status-${trade.status?.toLowerCase()}`}>
                              {trade.status}
                            </span>
                          </td>
                        )}
                      <td style={{ padding: '15px 20px', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                          <button onClick={() => onEdit(trade, idx)} className="icon-btn"><Edit3 size={16} /></button>
                          <button onClick={() => onDelete(trade._id)} className="icon-btn delete"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                    <AnimatePresence>
                      {expandedTrade === trade._id && (
                        <tr>
                          <td colSpan="8" style={{ padding: '0', background: 'rgba(255,255,255,0.01)' }}>
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              style={{ overflow: 'hidden' }}
                            >
                              <div style={{ padding: '30px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '30px', borderBottom: '1px solid var(--border)' }}>
                                <div className="glass" style={{ padding: '15px', borderRadius: '12px' }}>
                                   <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                                     BEFORE CHART
                                     {trade.beforeChart && <Maximize2 size={14} style={{ cursor: 'pointer' }} onClick={() => setSelectedImage(trade.beforeChart)} />}
                                   </p>
                                   {trade.beforeChart ? (
                                     <img 
                                       src={getImageUrl(trade.beforeChart)} 
                                       alt="Before" 
                                       style={{ width: '100%', borderRadius: '8px', cursor: 'zoom-in' }} 
                                       onClick={() => setSelectedImage(trade.beforeChart)}
                                     />
                                   ) : <p style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>No Before Chart uploaded.</p>}
                                </div>
                                <div className="glass" style={{ padding: '15px', borderRadius: '12px' }}>
                                   <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                                     AFTER CHART
                                     {trade.afterChart && <Maximize2 size={14} style={{ cursor: 'pointer' }} onClick={() => setSelectedImage(trade.afterChart)} />}
                                   </p>
                                   {trade.afterChart ? (
                                     <img 
                                       src={getImageUrl(trade.afterChart)} 
                                       alt="After" 
                                       style={{ width: '100%', borderRadius: '8px', cursor: 'zoom-in' }} 
                                       onClick={() => setSelectedImage(trade.afterChart)}
                                     />
                                   ) : <p style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>No After Chart uploaded.</p>}
                                </div>
                                <div style={{ gridColumn: 'span 2' }}>
                                   <h5 style={{ fontSize: '0.9rem', marginBottom: '10px', color: 'var(--primary)' }}>Trade Mindset & Rules</h5>
                                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                      <div className="glass" style={{ padding: '15px', borderRadius: '8px' }}>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '5px' }}>Pre-Trade Thoughts</p>
                                        <p style={{ fontSize: '0.85rem' }}>{trade.preMindset || 'No notes.'}</p>
                                      </div>
                                      <div className="glass" style={{ padding: '15px', borderRadius: '8px' }}>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '5px' }}>Post-Trade Reflection</p>
                                        <p style={{ fontSize: '0.85rem' }}>{trade.postMindset || 'No notes.'}</p>
                                      </div>
                                   </div>
                                </div>
                              </div>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: '25px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={prevMonth} className="icon-btn"><ChevronLeft size={20} /></button>
              <button onClick={() => setCurrentDate(new Date())} style={{ padding: '5px 15px', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Today</button>
              <button onClick={nextMonth} className="icon-btn"><ChevronRight size={20} /></button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', background: 'var(--border)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                {d}
              </div>
            ))}
            {days.map((day, idx) => {
              const dayTrades = getTradesForDay(day);
              const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();
              
              return (
                <div key={idx} style={{ 
                  background: 'var(--bg-main)', 
                  minHeight: '120px', 
                  padding: '10px',
                  opacity: day ? 1 : 0.3
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    marginBottom: '8px'
                  }}>
                    <span style={{ 
                      fontSize: '0.85rem', 
                      fontWeight: 'bold', 
                      color: isToday ? 'var(--primary)' : 'var(--text-muted)',
                      background: isToday ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      {day}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {dayTrades.map(t => (
                      <div 
                        key={t._id}
                        onClick={() => toggleExpand(t._id)}
                        style={{ 
                          fontSize: '0.7rem', 
                          padding: '4px 6px', 
                          borderRadius: '4px', 
                          background: t.status === 'Win' ? 'rgba(16, 185, 129, 0.1)' : t.status === 'Loss' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.05)',
                          color: t.status === 'Win' ? 'var(--success)' : t.status === 'Loss' ? 'var(--danger)' : 'var(--text-muted)',
                          borderLeft: `3px solid ${t.status === 'Win' ? 'var(--success)' : t.status === 'Loss' ? 'var(--danger)' : 'var(--text-muted)'}`,
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between'
                        }}
                      >
                        <span>{t.symbol}</span>
                        <span>{t.status === 'Win' ? '+' : '-'}{t.reward}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Lightbox for Images */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            style={{ 
              position: 'fixed', 
              top: 0, 
              left: 0, 
              width: '100%', 
              height: '100%', 
              background: 'rgba(0,0,0,0.9)', 
              zIndex: 1000, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              padding: '40px'
            }}
          >
            <button 
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}
              onClick={() => setSelectedImage(null)}
            >
              <X size={32} />
            </button>
            <img 
              src={getImageUrl(selectedImage)} 
              alt="Expanded Chart" 
              style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '12px', boxShadow: '0 0 50px rgba(56, 189, 248, 0.3)' }} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Journal;
