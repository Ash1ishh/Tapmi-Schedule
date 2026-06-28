import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from './_app';

function applyTheme(t) {
  const html = document.documentElement;
  html.classList.remove('light','dark','system');
  html.classList.add(t);
}

export default function Settings() {
  const { user, logout } = useAuth();
  const [theme, setThemeState] = useState('dark');
  const [showCalInfo, setShowCalInfo] = useState(false);
  const [sheetUrl, setSheetUrl] = useState('');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('tapmi_theme') || 'dark';
    setThemeState(saved);
    const su = localStorage.getItem('tapmi_sheet_url') || '';
    setSheetUrl(su);
  }, []);

  const setTheme = (t) => {
    setThemeState(t);
    localStorage.setItem('tapmi_theme', t);
    applyTheme(t);
  };

  const saveSheetUrl = () => {
    localStorage.setItem('tapmi_sheet_url', sheetUrl);
    alert('Sheet URL saved! Open the URL to verify it loads your schedule.');
  };

  // The iCal URL is this app's own API route
  const icalUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/calendar.ics`
    : 'https://your-app.vercel.app/api/calendar.ics';

  const copyIcal = () => {
    navigator.clipboard?.writeText(icalUrl).then(() => alert('Copied! Now paste this in Google Calendar → Other Calendars → From URL'));
  };

  return (
    <Layout title="Settings">
      {/* ── Theme ── */}
      <section style={{ marginBottom:'1.5rem' }}>
        <p style={{ fontSize:'0.65rem', color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'0.5rem' }}>Appearance</p>
        <div className="card" style={{ padding:'0.75rem' }}>
          <p style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--text)', marginBottom:'0.75rem' }}>Theme</p>
          <div style={{ display:'flex', gap:8 }}>
            {[
              { key:'dark',   label:'🌙 Dark' },
              { key:'light',  label:'☀️ Light' },
              { key:'system', label:'⚙️ System' },
            ].map(({ key, label }) => (
              <button key={key} onClick={() => setTheme(key)}
                style={{ flex:1, padding:'0.6rem 0.25rem', borderRadius:10, fontSize:'0.75rem', fontWeight:700, cursor:'pointer', border:'none',
                  background: theme===key ? 'var(--red)' : 'var(--bg3)',
                  color: theme===key ? '#fff' : 'var(--text2)',
                  outline: theme===key ? '2px solid var(--gold)' : '1px solid var(--border)' }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Calendar Feed ── */}
      <section style={{ marginBottom:'1.5rem' }}>
        <p style={{ fontSize:'0.65rem', color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'0.5rem' }}>Calendar Sync</p>
        <div className="card" style={{ padding:'0.75rem' }}>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'0.75rem' }}>
            <div>
              <p style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--text)' }}>📅 iCal Feed</p>
              <p style={{ fontSize:'0.7rem', color:'var(--text2)', marginTop:2 }}>Subscribe to copy your full schedule to Google Calendar or Apple Calendar</p>
            </div>
            <button onClick={() => setShowCalInfo(!showCalInfo)}
              style={{ fontSize:'0.65rem', color:'var(--gold)', background:'rgba(184,150,12,0.12)', border:'1px solid rgba(184,150,12,0.3)', borderRadius:6, padding:'3px 8px', cursor:'pointer', fontWeight:700, flexShrink:0, marginLeft:8 }}>
              {showCalInfo ? 'Hide' : 'How to set up?'}
            </button>
          </div>

          {/* iCal URL box */}
          <div style={{ background:'var(--bg3)', border:'1px solid var(--border2)', borderRadius:8, padding:'0.6rem 0.75rem', display:'flex', alignItems:'center', gap:8, marginBottom:'0.75rem' }}>
            <p style={{ flex:1, fontSize:'0.65rem', color:'var(--text2)', fontFamily:'monospace', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{icalUrl}</p>
            <button onClick={copyIcal}
              style={{ fontSize:'0.65rem', color:'var(--gold)', background:'rgba(184,150,12,0.12)', border:'1px solid rgba(184,150,12,0.3)', borderRadius:6, padding:'3px 8px', cursor:'pointer', fontWeight:700, flexShrink:0 }}>
              Copy
            </button>
          </div>

          {showCalInfo && (
            <div style={{ background:'rgba(184,150,12,0.08)', border:'1px solid rgba(184,150,12,0.2)', borderRadius:10, padding:'0.75rem' }}>
              <p style={{ fontSize:'0.75rem', fontWeight:700, color:'var(--goldlt)', marginBottom:'0.5rem' }}>How to set up (Free, no paid service needed)</p>
              <div style={{ display:'flex', flexDirection:'column', gap:'0.4rem' }}>
                {[
                  '1. Copy the iCal URL above',
                  '2. Open Google Calendar on desktop',
                  '3. Click "+" next to "Other calendars" in left sidebar',
                  '4. Choose "From URL"',
                  '5. Paste the URL and click "Add Calendar"',
                  '6. Done! Your TAPMI schedule appears in Google Calendar',
                  '',
                  'Apple Calendar: File → New Calendar Subscription → paste URL',
                  '',
                  '⚠️ Note: The feed only includes schedule data loaded in the app. Update the app when new weeks are added.',
                ].map((s, i) => s ? (
                  <p key={i} style={{ fontSize:'0.7rem', color: s.startsWith('⚠️') ? 'var(--goldlt)' : 'var(--text2)' }}>{s}</p>
                ) : <div key={i} style={{ height:4 }} />)}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Sheet Upload ── */}
      <section style={{ marginBottom:'1.5rem' }}>
        <p style={{ fontSize:'0.65rem', color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'0.5rem' }}>Schedule Import</p>
        <div className="card" style={{ padding:'0.75rem' }}>
          <p style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--text)', marginBottom:'0.25rem' }}>📊 Import from Sheet / Excel</p>
          <p style={{ fontSize:'0.7rem', color:'var(--text2)', marginBottom:'0.75rem', lineHeight:1.5 }}>
            Students from other disciplines or batches can import their own timetable by linking a Google Sheet.
            The sheet should have columns: Date, Time Slot, Course Name, Faculty.
          </p>
          <div style={{ background:'rgba(155,27,27,0.1)', border:'1px solid rgba(192,57,43,0.3)', borderRadius:8, padding:'0.6rem 0.75rem', marginBottom:'0.75rem' }}>
            <p style={{ fontSize:'0.7rem', color:'var(--redlt)' }}>
              ⚠️ This feature is in development. For now, share the Google Sheet URL below — the app will open it in a browser window as a reference.
            </p>
          </div>
          <input className="input" value={sheetUrl} onChange={e => setSheetUrl(e.target.value)}
            placeholder="Paste Google Sheet URL here…" style={{ marginBottom:8 }} />
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={saveSheetUrl} className="btn-primary" style={{ flex:1 }}>Save Link</button>
            {sheetUrl && (
              <button onClick={() => window.open(sheetUrl, '_blank')}
                style={{ flex:1, padding:'0.875rem', borderRadius:12, background:'var(--bg3)', border:'1px solid var(--border2)', color:'var(--text2)', fontSize:'0.875rem', fontWeight:600, cursor:'pointer' }}>
                Open Sheet ↗
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── About ── */}
      <section style={{ marginBottom:'1.5rem' }}>
        <p style={{ fontSize:'0.65rem', color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'0.5rem' }}>About</p>
        <div className="card" style={{ padding:'0.75rem' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.75rem' }}>
            <svg width="36" height="36" viewBox="0 0 64 64" fill="none">
              <rect x="14" y="6" width="36" height="4" rx="2" fill="var(--gold)"/>
              <rect x="14" y="54" width="36" height="4" rx="2" fill="var(--gold)"/>
              <path d="M18 10 L32 30 L46 10 Z" fill="var(--gold)" opacity="0.8"/>
              <path d="M18 54 L32 34 L46 54 Z" fill="var(--gold)" opacity="0.6"/>
              <path d="M8 32 L16 32 L20 24 L24 38 L28 28 L32 34 L36 32 L56 32" stroke="var(--red)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
            <div>
              <p style={{ fontSize:'0.875rem', fontWeight:800, color:'var(--gold)' }}>T-MINUS</p>
              <p style={{ fontSize:'0.65rem', color:'var(--text3)' }}>TAPMI Student Scheduler · v3.0</p>
            </div>
          </div>
          <p style={{ fontSize:'0.7rem', color:'var(--text3)', lineHeight:1.5 }}>
            Built for MBA-IB Batch 2026–28 · Not an official TAPMI product.
          </p>
          <p style={{ fontSize:'0.7rem', color:'var(--text3)', marginTop:'0.25rem' }}>
            Signed in as <span style={{ color:'var(--text)', fontWeight:600 }}>{user?.name}</span>
          </p>
        </div>
      </section>

      {/* ── VAPID / Notifications info ── */}
      <section style={{ marginBottom:'1.5rem' }}>
        <p style={{ fontSize:'0.65rem', color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'0.5rem' }}>Notifications Setup (Developer)</p>
        <div className="card" style={{ padding:'0.75rem' }}>
          <p style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--text)', marginBottom:'0.5rem' }}>🔔 VAPID Keys — What & How</p>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.4rem' }}>
            {[
              { label:'What is VAPID?', text:'VAPID = Voluntary Application Server Identification. It\'s a free web standard for push notifications. Not paid, not a third-party service — it\'s built into Chrome/Android.' },
              { label:'Step 1', text:'Run in terminal: npx web-push generate-vapid-keys' },
              { label:'Step 2', text:'Copy the 2 keys it gives you (public + private)' },
              { label:'Step 3', text:'In Vercel → Project → Settings → Environment Variables, add: NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_EMAIL (your email)' },
              { label:'Step 4', text:'Redeploy. Notifications will now work on Android Chrome. On iPhone, user must add to home screen first (iOS limitation).' },
            ].map(({ label, text }) => (
              <div key={label} style={{ background:'var(--bg3)', borderRadius:8, padding:'0.6rem 0.75rem' }}>
                <p style={{ fontSize:'0.65rem', fontWeight:700, color:'var(--gold)', marginBottom:2, textTransform:'uppercase', letterSpacing:'0.06em' }}>{label}</p>
                <p style={{ fontSize:'0.7rem', color:'var(--text2)', lineHeight:1.5 }}>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </Layout>
  );
}
