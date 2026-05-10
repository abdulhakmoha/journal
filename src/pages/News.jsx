import React, { useEffect } from 'react';
import { Globe, AlertTriangle, Info, Clock, Calendar as CalendarIcon } from 'lucide-react';

const News = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-events.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      "colorTheme": "dark",
      "isResponsive": true,
      "width": "100%",
      "height": "100%",
      "locale": "en",
      "importanceFilter": "-1,0,1",
      "currencyFilter": "USD,EUR,GBP,JPY,AUD,CAD,CHF,NZD"
    });
    
    const container = document.getElementById('tv-calendar-container');
    if (container) {
      container.innerHTML = '';
      container.appendChild(script);
    }
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', height: 'calc(100vh - 100px)' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="text-gradient">Economic Calendar</h2>
          <p style={{ color: 'var(--text-muted)' }}>Stay ahead of the market with high-impact economic events.</p>
        </div>
        <div className="glass" style={{ padding: '8px 15px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem' }}>
          <AlertTriangle size={16} color="var(--warning)" />
          <span style={{ color: 'var(--warning)' }}>High Impact Expected Today</span>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '30px', height: '100%' }}>
        {/* Calendar Widget */}
        <section className="glass-card" style={{ padding: '20px', height: '100%', minHeight: '600px' }}>
          <div id="tv-calendar-container" style={{ height: '100%' }}>
            {/* Widget will be injected here */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-muted)' }}>
              Loading Real-time Economic Events...
            </div>
          </div>
        </section>

        {/* News & Tips Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
           <section className="glass-card" style={{ padding: '25px' }}>
              <h4 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Info size={18} color="var(--primary)" /> Trading Protocol
              </h4>
              <ul style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: '15px' }}>
                <li>Avoid trading 15 mins before/after 🔴 High Impact News.</li>
                <li>Red Folder events (CPI, NFP, FOMC) can cause slippage.</li>
                <li>Check your pairs' currency specific news daily.</li>
              </ul>
           </section>

           <section className="glass-card" style={{ padding: '25px', background: 'rgba(56, 189, 248, 0.03)' }}>
              <h4 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Clock size={18} color="var(--success)" /> Market Sessions
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.8rem' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                   <span>London Open</span>
                   <span style={{ color: 'var(--primary)' }}>08:00 AM UTC</span>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                   <span>New York Open</span>
                   <span style={{ color: 'var(--primary)' }}>01:00 PM UTC</span>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                   <span>Asian Open</span>
                   <span style={{ color: 'var(--primary)' }}>12:00 AM UTC</span>
                 </div>
              </div>
           </section>

           <div className="glass" style={{ padding: '20px', borderRadius: '15px', textAlign: 'center' }}>
              <Globe size={32} color="var(--primary)" style={{ opacity: 0.3, marginBottom: '10px' }} />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Powered by TradingView Real-time Data Feed</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default News;
