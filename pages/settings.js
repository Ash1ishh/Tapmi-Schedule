import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from './_app';

function applyTheme(t) {
  const html = document.documentElement;
  html.classList.remove('light','dark','system');
  html.classList.add(t);
}

export default function Settings() {
  const { user } = useAuth();
  const [theme, setThemeState] = useState('dark');

  useEffect(() => {
    const saved = localStorage.getItem('tapmi_theme') || 'dark';
    setThemeState(saved);
  }, []);

  const setTheme = (t) => {
    setThemeState(t);
    localStorage.setItem('tapmi_theme', t);
    applyTheme(t);
  };

  return (
    <Layout title="Settings">

      {/* ── Theme ── */}
      <section style={{ marginBottom:'1.5rem' }}>
        <p style={{ fontSize:'0.65rem', color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'0.5rem' }}>Appearance</p>
        <div className="card" style={{ padding:'1rem' }}>
          <p style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--text)', marginBottom:'0.75rem' }}>Theme</p>
          <div style={{ display:'flex', gap:8 }}>
            {[
              { key:'dark',   label:'🌙 Dark'   },
              { key:'light',  label:'☀️ Light'  },
              { key:'system', label:'⚙️ System' },
            ].map(({ key, label }) => (
              <button key={key} onClick={() => setTheme(key)}
                style={{
                  flex:1, padding:'0.65rem 0.25rem', borderRadius:10,
                  fontSize:'0.75rem', fontWeight:700, cursor:'pointer',
                  border: theme===key ? '2px solid var(--gold)' : '1px solid var(--border)',
                  background: theme===key ? 'var(--red)' : 'var(--bg3)',
                  color: theme===key ? '#fff' : 'var(--text2)',
                }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Notifications ── */}
      <section style={{ marginBottom:'1.5rem' }}>
        <p style={{ fontSize:'0.65rem', color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'0.5rem' }}>Notifications</p>
        <div className="card" style={{ padding:'1rem' }}>
          <p style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--text)', marginBottom:'0.5rem' }}>🔔 Class Reminders</p>
          <p style={{ fontSize:'0.75rem', color:'var(--text2)', lineHeight:1.6, marginBottom:'0.75rem' }}>
            To enable class reminders, go to the <strong style={{ color:'var(--text)' }}>Today</strong> tab and tap the 🔔 bell icon in the top right corner.
          </p>
          <div style={{ background:'var(--bg3)', border:'1px solid var(--border2)', borderRadius:8, padding:'0.75rem' }}>
            <p style={{ fontSize:'0.7rem', color:'var(--text2)', lineHeight:1.6 }}>
              📱 <strong style={{ color:'var(--text)' }}>Android:</strong> Works in Chrome after tapping Enable Reminders.<br/>
              🍎 <strong style={{ color:'var(--text)' }}>iPhone:</strong> First add this app to your home screen (Safari → Share → Add to Home Screen), then enable reminders.
            </p>
          </div>
        </div>
      </section>

      {/* ── Add to Home Screen ── */}
      <section style={{ marginBottom:'1.5rem' }}>
        <p style={{ fontSize:'0.65rem', color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'0.5rem' }}>Install App</p>
        <div className="card" style={{ padding:'1rem' }}>
          <p style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--text)', marginBottom:'0.5rem' }}>📲 Add to Home Screen</p>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            <div style={{ background:'var(--bg3)', border:'1px solid var(--border2)', borderRadius:8, padding:'0.75rem' }}>
              <p style={{ fontSize:'0.7rem', fontWeight:700, color:'var(--gold)', marginBottom:4 }}>Android (Chrome)</p>
              <p style={{ fontSize:'0.7rem', color:'var(--text2)', lineHeight:1.6 }}>Tap the three-dot menu (⋮) → "Add to Home screen" → Add</p>
            </div>
            <div style={{ background:'var(--bg3)', border:'1px solid var(--border2)', borderRadius:8, padding:'0.75rem' }}>
              <p style={{ fontSize:'0.7rem', fontWeight:700, color:'var(--gold)', marginBottom:4 }}>iPhone (Safari)</p>
              <p style={{ fontSize:'0.7rem', color:'var(--text2)', lineHeight:1.6 }}>Tap the Share button (□↑) → "Add to Home Screen" → Add</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── About ── */}
      <section style={{ marginBottom:'1.5rem' }}>
        <p style={{ fontSize:'0.65rem', color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'0.5rem' }}>About</p>
        <div className="card" style={{ padding:'1rem' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.75rem' }}>
            <svg width="40" height="40" viewBox="0 0 64 64" fill="none">
              <rect x="14" y="6" width="36" height="4" rx="2" fill="var(--gold)"/>
              <rect x="14" y="54" width="36" height="4" rx="2" fill="var(--gold)"/>
              <path d="M18 10 L32 30 L46 10 Z" fill="var(--gold)" opacity="0.8"/>
              <path d="M18 54 L32 34 L46 54 Z" fill="var(--gold)" opacity="0.6"/>
              <path d="M8 32 L16 32 L20 24 L24 38 L28 28 L32 34 L36 32 L56 32" stroke="var(--red)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
            <div>
              <p style={{ fontSize:'1rem', fontWeight:800, color:'var(--gold)', letterSpacing:'-0.01em' }}>T-MINUS</p>
              <p style={{ fontSize:'0.65rem', color:'var(--text3)' }}>TAPMI Student Scheduler · v3.0</p>
            </div>
          </div>
          <p style={{ fontSize:'0.75rem', color:'var(--text2)', lineHeight:1.6 }}>
            Built for MBA-IB Batch 2026–28.<br/>
            Not an official TAPMI product.
          </p>
          <div style={{ marginTop:'0.75rem', paddingTop:'0.75rem', borderTop:'1px solid var(--border)' }}>
            <p style={{ fontSize:'0.7rem', color:'var(--text3)' }}>
              Signed in as <span style={{ color:'var(--gold)', fontWeight:700 }}>{user?.name}</span>
            </p>
          </div>
        </div>
      </section>

    </Layout>
  );
}
