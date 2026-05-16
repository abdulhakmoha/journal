import React, { useEffect } from 'react';
import { Globe, AlertTriangle, Info, Clock, Calendar as CalendarIcon } from 'lucide-react';

const News = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', height: '100%' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="text-gradient">Economic Calendar</h2>
          <p style={{ color: 'var(--text-muted)' }}>High-Impact (Red Folder) Market Events.</p>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
           <div className="glass" style={{ padding: '8px 15px', borderRadius: '10px', borderLeft: '4px solid #ef4444' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>HIGH IMPACT</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#ef4444' }}>RED FOLDERS</span>
           </div>
        </div>
      </header>

      {/* Main Calendar View */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '25px', minHeight: '800px' }}>
        <section className="glass-card" style={{ padding: '0', position: 'relative', overflow: 'hidden', height: '800px' }}>
          <div style={{ 
            width: '100%', 
            height: '100%', 
            filter: 'invert(0.9) hue-rotate(180deg)',
            padding: '10px'
          }}>
            <iframe 
              src="https://sslecal2.investing.com?columns=exc_flags,exc_currency,exc_importance,exc_actual,exc_forecast,exc_previous&importance=3&features=datepicker,timezone&countries=25,32,6,37,7,5,22,11,35,43,12,4,41,42,10,36,26,9,1&calType=week&timeZone=15&lang=1" 
              width="100%" 
              height="100%" 
              frameBorder="0" 
              allowTransparency="true" 
              marginWidth="0" 
              marginHeight="0"
            ></iframe>
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
