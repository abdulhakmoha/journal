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
      "importanceFilter": "-1",
      "currencyFilter": "USD,EUR,GBP,JPY,AUD,CAD,CHF,NZD"
    });
    
    const container = document.getElementById('tv-calendar-container');
    if (container) {
      container.innerHTML = '';
      container.appendChild(script);
    }
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', height: '100%' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="text-gradient">Market Intelligence</h2>
          <p style={{ color: 'var(--text-muted)' }}>High-Impact (Red Folder) Economic Events Only.</p>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
           <div className="glass" style={{ padding: '8px 15px', borderRadius: '10px', borderLeft: '4px solid #ef4444' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>HIGH IMPACT</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#ef4444' }}>RED FOLDERS</span>
           </div>
           <div className="glass" style={{ padding: '8px 15px', borderRadius: '10px', borderLeft: '4px solid #f59e0b' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>MEDIUM</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#f59e0b' }}>ORANGE</span>
           </div>
        </div>
      </header>

      {/* Main Calendar View */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '25px', minHeight: '700px' }}>
        <section className="glass-card" style={{ padding: '20px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #ef4444, #f59e0b, #38bdf8)' }}></div>
          <div id="tv-calendar-container" style={{ height: '100%', minHeight: '650px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-muted)' }}>
               <Clock className="animate-spin" style={{ marginRight: '10px' }} /> Synchronizing Market Data...
            </div>
          </div>
        </section>

        {/* Pro Trading Tips */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          <div className="glass-card" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '1rem', marginBottom: '15px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Info size={18} />
              News Protocol
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
               {[
                 { t: 'Pre-News', d: 'Close active trades 15m before Red Folders.', c: '#ef4444' },
                 { t: 'Execution', d: 'Avoid market orders during high volatility.', c: '#f59e0b' },
                 { t: 'Analysis', d: 'Focus on Actual vs Forecast deviation.', c: '#38bdf8' }
               ].map((tip, i) => (
                 <div key={i} style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', borderLeft: `3px solid ${tip.c}` }}>
                    <p style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '4px' }}>{tip.t}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tip.d}</p>
                 </div>
               ))}
            </div>
          </div>

          <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
            <Globe size={40} color="var(--primary)" style={{ opacity: 0.2, marginBottom: '15px' }} />
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              "The market is a device for transferring money from the impatient to the patient."
            </p>
            <p style={{ fontSize: '0.7rem', color: 'var(--primary)', marginTop: '10px' }}>— Warren Buffett</p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default News;
