import React, { useState, useEffect } from 'react';
import { ShieldCheck, XCircle, Clock, Search, RefreshCw, User, Mail, DollarSign, ExternalLink } from 'lucide-react';
import api from '../services/api';

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/payments/admin/all');
      setPayments(res.data);
    } catch (err) {
      console.error('Error fetching payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleApprove = async (id) => {
    if (!window.confirm('Ma hubtaa inaad lacagtan xaqiijiso oo aad account-ka user-ka u bedesho Pro/Elite?')) return;
    try {
      await api.put(`/api/payments/admin/approve/${id}`);
      alert('Subscription Activated! ✅');
      fetchPayments();
    } catch (err) {
      alert('Error approving payment');
    }
  };

  const filteredPayments = payments.filter(p => 
    p.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.transactionId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '2rem' }}>Payment Requests</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage and verify user subscription payments.</p>
        </div>
        <button onClick={fetchPayments} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid var(--primary)', color: 'var(--primary)', cursor: 'pointer', fontWeight: 'bold' }}>
          <RefreshCw size={16} className={loading ? 'spin' : ''} /> Refresh
        </button>
      </header>

      <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '15px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search by name, email or TxID..." 
              style={{ paddingLeft: '40px', width: '100%' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
            <thead style={{ background: 'rgba(255,255,255,0.02)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <tr>
                <th style={{ padding: '15px 25px', textAlign: 'left' }}>USER</th>
                <th style={{ padding: '15px 25px', textAlign: 'left' }}>PLAN / AMOUNT</th>
                <th style={{ padding: '15px 25px', textAlign: 'left' }}>METHOD</th>
                <th style={{ padding: '15px 25px', textAlign: 'left' }}>TRANSACTION ID</th>
                <th style={{ padding: '15px 25px', textAlign: 'left' }}>STATUS</th>
                <th style={{ padding: '15px 25px', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
          <tbody>
            {filteredPayments.map((p, i) => (
              <tr key={p._id} style={{ borderBottom: '1px solid var(--border)', fontSize: '0.9rem' }}>
                <td style={{ padding: '15px 25px' }}>
                  <div style={{ fontWeight: 'bold' }}>{p.user?.name || 'Unknown User'}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.user?.email || 'No Email'}</div>
                </td>
                <td style={{ padding: '15px 25px' }}>
                  <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{p.plan}</span>
                  <div style={{ fontSize: '0.8rem' }}>${p.amount}</div>
                </td>
                <td style={{ padding: '15px 25px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {p.method === 'Crypto' ? <DollarSign size={14} color="#F7931A" /> : <User size={14} color="var(--success)" />}
                    {p.method}
                  </div>
                </td>
                <td style={{ padding: '15px 25px' }}>
                  <div style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'monospace', fontSize: '0.8rem' }} title={p.transactionId}>
                    {p.transactionId}
                  </div>
                  {p.method === 'Crypto' && (
                    <a 
                      href={`https://tronscan.org/#/transaction/${p.transactionId}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ fontSize: '0.65rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '4px', textDecoration: 'none' }}
                    >
                      <ExternalLink size={10} /> View on Scan
                    </a>
                  )}
                </td>
                <td style={{ padding: '15px 25px' }}>
                  <span style={{ 
                    padding: '4px 10px', 
                    borderRadius: '12px', 
                    fontSize: '0.75rem', 
                    fontWeight: 'bold',
                    background: p.status === 'approved' ? 'rgba(16, 185, 129, 0.1)' : p.status === 'rejected' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                    color: p.status === 'approved' ? 'var(--success)' : p.status === 'rejected' ? 'var(--danger)' : 'var(--warning)'
                  }}>
                    {p.status.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '15px 25px', textAlign: 'right' }}>
                  {p.status === 'pending' && (
                    <button 
                      className="btn-primary" 
                      style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                      onClick={() => handleApprove(p._id)}
                    >
                      <ShieldCheck size={14} /> Approve
                    </button>
                  )}
                  {p.status === 'approved' && (
                    <div style={{ color: 'var(--success)', fontSize: '0.75rem', display: 'inline-block' }}>Verified ✅</div>
                  )}
                </td>
              </tr>
            ))}
            {filteredPayments.length === 0 && !loading && (
              <tr>
                <td colSpan="6" style={{ padding: '50px', textAlign: 'center', color: 'var(--text-muted)' }}>No payment requests found.</td>
              </tr>
            )}
          </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPayments;
