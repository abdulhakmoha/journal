import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  FlaskConical, 
  Zap, 
  Crown,
  Award,
  Shield,
  Settings as SettingsIcon, 
  LogOut 
} from 'lucide-react';
import Sidebar from './components/Sidebar';
import TradeEntry from './components/TradeEntry';
import Dashboard from './pages/Dashboard';
import Journal from './pages/Journal';
import MindsetMirror from './pages/MindsetMirror';
import Review from './pages/Review';
import Performance from './pages/Performance';
import News from './pages/News';
import Pricing from './pages/Pricing';
import AdminPayments from './pages/AdminPayments';
import Settings from './pages/Settings';
import Backtest from './pages/Backtest';
import Calculator from './pages/Calculator';
import Login from './pages/Login';
import { useAuth } from './context/AuthContext';
import api from './services/api';
import './App.css';

function App() {
  const { token, loading, user, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [trades, setTrades] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [editingTrade, setEditingTrade] = useState(null);

  // Theme Initialization
  useEffect(() => {
    const savedTheme = localStorage.getItem('zentrader_theme');
    if (savedTheme) {
      try {
        const theme = JSON.parse(savedTheme);
        document.documentElement.style.setProperty('--primary', theme.color);
        document.documentElement.style.setProperty('--primary-glow', theme.glow);
      } catch (e) {
        console.error('Failed to apply theme');
      }
    }
  }, []);

  // Fetch Data from API
  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const fetchData = async () => {
    try {
      const [tradesRes, accountsRes] = await Promise.all([
        api.get('/api/trades'),
        api.get('/api/accounts')
      ]);
      setTrades(tradesRes.data);
      setAccounts(accountsRes.data);
      
      if (accountsRes.data.length === 0) {
        const defAcc = await api.post('/api/accounts', { name: 'Personal Account', type: 'Personal', target: 0 });
        setAccounts([defAcc.data]);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const handleSaveTrade = async (newTrade) => {
    try {
      if (editingTrade !== null) {
        const res = await api.put(`/api/trades/${newTrade._id}`, newTrade);
        const updatedTrades = [...trades];
        updatedTrades[editingTrade.index] = res.data;
        setTrades(updatedTrades);
        setEditingTrade(null);
      } else {
        const res = await api.post('/api/trades', newTrade);
        setTrades([res.data, ...trades]);
      }
      setActiveTab('journal');
    } catch (err) {
      alert('Error saving trade');
    }
  };

  const handleEdit = (trade, index) => {
    setEditingTrade({ ...trade, index });
    setActiveTab('new-trade');
  };

  const handleDeleteTrade = async (id) => {
    if (window.confirm('Ma hubtaa inaad tirtirto trade-kan?')) {
      try {
        await api.delete(`/api/trades/${id}`);
        setTrades(trades.filter(t => t._id !== id));
      } catch (err) {
        alert('Error deleting trade');
      }
    }
  };

  const handleAddAccount = async (acc) => {
    try {
      const res = await api.post('/api/accounts', acc);
      setAccounts([...accounts, res.data]);
    } catch (err) {
      alert('Error adding account');
    }
  };

  const handleDeleteAccount = async (id) => {
    try {
      await api.delete(`/api/accounts/${id}`);
      setAccounts(accounts.filter(a => a._id !== id));
    } catch (err) {
      alert('Error deleting account');
    }
  };

  const handleUpdateAccount = async (id, updatedAcc) => {
    try {
      const res = await api.put(`/api/accounts/${id}`, updatedAcc);
      setAccounts(accounts.map(a => a._id === id ? res.data : a));
    } catch (err) {
      alert('Error updating account');
    }
  };

  const handleUpdateProfile = async (profileData) => {
    try {
      const res = await api.put('/api/user/profile', profileData);
      setUser(res.data);
      alert('System Config Updated!');
    } catch (err) {
      console.error('Profile update error:', err);
      alert('Error updating profile: ' + (err.response?.data?.message || err.message));
    }
  };

  const disciplineScore = trades.length === 0 ? 0 : Math.round((trades.filter(t => ['A+', 'A'].includes(t.grade)).length / trades.length) * 100);

  if (loading) return <div className="loading-screen">Loading Terminal...</div>;
  if (!token) return <Login />;

  const userRules = user?.customRules || [];
  const userStrategies = user?.strategies || [];

  const renderContent = () => {
    const liveAccounts = accounts.filter(a => a.type !== 'Backtesting');
    const backtestAccounts = accounts.filter(a => a.type === 'Backtesting');

    switch (activeTab) {
      case 'dashboard': return <Dashboard trades={trades} accounts={liveAccounts} onAddTrade={() => setActiveTab('journal')} />;
      case 'journal': return <Journal trades={trades} onEdit={handleEdit} onDelete={handleDeleteTrade} accounts={liveAccounts} />;
      case 'performance': return <Performance trades={trades} accounts={liveAccounts} />;
      case 'news': return <News />;
      case 'mindset': return <MindsetMirror />;
      case 'review': return <Review trades={trades} accounts={liveAccounts} />;
      case 'backtest': return <Backtest backtestFields={user?.backtestFields || []} accounts={backtestAccounts} />;
      case 'calculator': return <Calculator accounts={liveAccounts} onAddAccount={handleAddAccount} />;
      case 'settings': return (
        <Settings 
          user={user}
          onUpdateProfile={handleUpdateProfile}
          accounts={accounts}
          trades={trades} 
          onAddAccount={handleAddAccount}
          onDeleteAccount={handleDeleteAccount}
          onUpdateAccount={handleUpdateAccount}
        />
      );
      case 'new-trade': return (
        <TradeEntry 
          onSave={handleSaveTrade} 
          customRules={userRules} 
          formFields={user?.formFields || []}
          accounts={liveAccounts} 
          initialData={editingTrade} 
        />
      );
      case 'pricing': return <Pricing />;
      case 'admin-payments': return <AdminPayments />;
      default: return <Dashboard trades={trades} accounts={liveAccounts} />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} disciplineScore={disciplineScore} />
      <main className="main-content">
        <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '2rem' }}>Welcome back, {user?.name || 'Trader'}</h1>
            <p style={{ color: 'var(--text-muted)' }}>{new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="glass-card" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '10px', height: '10px', background: 'var(--success)', borderRadius: '50%' }}></div>
            <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Server: Online</span>
          </div>
        </header>
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
