import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { COURSES, COURSE_COLORS, getSessionNumbersForCourse, getTotalSessionsLoaded } from '../lib/timetable';

function AttendanceBar({ pct }) {
  const color = pct >= 85 ? 'var(--greenlt)' : pct >= 80 ? 'var(--gold)' : 'var(--redlt)';
  return (
    <div style={{ height:5, background:'var(--bg3)', borderRadius:4, overflow:'hidden', marginTop:4 }}>
      <div style={{ height:'100%', borderRadius:4, transition:'width 0.4s', width:`${pct}%`, background:color }} />
    </div>
  );
}

function SessionManagerModal({ courseKey, course, onClose, customSessions, onUpdate }) {
  const baseSessions = getSessionNumbersForCourse(courseKey);
  const [extra, setExtra] = useState(() => (customSessions[courseKey]?.extra || 0));
  const totalBase = baseSessions.length;
  const totalCustom = totalBase + extra;

  const save = () => { onUpdate(courseKey, extra); onClose(); };

  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.8)',
      zIndex:200, display:'flex', flexDirection:'column', justifyContent:'flex-end'
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background:'var(--bg2)', borderRadius:'20px 20px 0 0',
        width:'100%', maxWidth:480, margin:'0 auto',
        padding:'20px 20px 40px', overflowY:'auto',
        maxHeight:'80vh', boxSizing:'border-box'
      }}>
        {/* Handle bar */}
        <div style={{ width:40, height:4, background:'var(--border2)', borderRadius:2, margin:'0 auto 16px' }} />

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          <h2 style={{ fontWeight:700, color:'var(--text)', fontSize:'1rem', margin:0 }}>Manage Sessions</h2>
          <button onClick={onClose} style={{ background:'var(--bg3)', border:'1px solid var(--border2)', borderRadius:8, width:32, height:32, cursor:'pointer', color:'var(--text2)', fontSize:'1.1rem', display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
        </div>

        <p style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--text)', marginBottom:2 }}>{course.name}</p>
        <p style={{ fontSize:'0.7rem', color:'var(--text2)', marginBottom:12 }}>{course.faculty}</p>

        <div style={{ background:'rgba(184,150,12,0.12)', border:'1px solid rgba(184,150,12,0.4)', borderRadius:8, padding:'10px 12px', marginBottom:16 }}>
          <p style={{ fontSize:'0.72rem', color:'var(--goldlt)', lineHeight:1.5, margin:0 }}>
            ⚠️ Attendance depends on sessions — check carefully. You can add or subtract extra sessions.
          </p>
        </div>

        {/* Two cards side by side */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:16 }}>
          <div style={{ background:'var(--bg3)', border:'1px solid var(--border2)', borderRadius:10, padding:'12px' }}>
            <p style={{ fontSize:'0.6rem', color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>In Schedule</p>
            <p style={{ fontSize:'2.2rem', fontWeight:800, color:'var(--text)', fontFamily:'monospace', lineHeight:1, margin:0 }}>{totalBase}</p>
            <p style={{ fontSize:'0.6rem', color:'var(--text3)', marginTop:4 }}>auto-detected</p>
          </div>

          <div style={{ background:'var(--bg3)', border:'1px solid var(--border2)', borderRadius:10, padding:'12px' }}>
            <p style={{ fontSize:'0.6rem', color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>Extra (Future)</p>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:4 }}>
              <button onClick={() => setExtra(Math.max(0, extra - 1))}
                style={{ width:36, height:36, borderRadius:8, fontSize:'1.2rem', fontWeight:900, cursor:'pointer', background:'var(--red)', color:'#fff', border:'none', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                −
              </button>
              <span style={{ fontSize:'2rem', fontWeight:800, fontFamily:'monospace', color:'var(--text)', minWidth:28, textAlign:'center', lineHeight:1 }}>{extra}</span>
              <button onClick={() => setExtra(extra + 1)}
                style={{ width:36, height:36, borderRadius:8, fontSize:'1.2rem', fontWeight:900, cursor:'pointer', background:'var(--green)', color:'#fff', border:'none', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                +
              </button>
            </div>
          </div>
        </div>

        {/* Total */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'var(--bg3)', border:'1px solid var(--border2)', borderRadius:10, padding:'12px 16px', marginBottom:16 }}>
          <span style={{ fontSize:'0.875rem', color:'var(--text2)', fontWeight:600 }}>Total Sessions</span>
          <span style={{ fontSize:'1.4rem', fontWeight:900, color:'var(--gold)', fontFamily:'monospace' }}>{totalCustom}</span>
        </div>

        {/* Save button — always visible */}
        <button onClick={save}
          style={{ width:'100%', padding:'14px', borderRadius:12, background:'var(--red)', color:'#fff', fontSize:'0.9rem', fontWeight:700, border:'none', cursor:'pointer', letterSpacing:'0.02em' }}>
          Save Sessions
        </button>
      </div>
    </div>
  );
}

export default function Attendance() {
  const [attendance, setAttendance] = useState({});
  const [customSessions, setCustomSessions] = useState({});
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [managingCourse, setManagingCourse] = useState(null);
  const baseTotals = getTotalSessionsLoaded();

  useEffect(() => {
    try {
      const att = JSON.parse(localStorage.getItem('tapmi_attendance') || '{}');
      const cs  = JSON.parse(localStorage.getItem('tapmi_custom_sessions') || '{}');
      setAttendance(att); setCustomSessions(cs);
    } catch {}
  }, []);

  const updateCustomSessions = (courseKey, extra) => {
    const updated = { ...customSessions, [courseKey]: { extra } };
    setCustomSessions(updated);
    localStorage.setItem('tapmi_custom_sessions', JSON.stringify(updated));
  };

  const getSessionNumbers = (courseKey) => {
    const base  = getSessionNumbersForCourse(courseKey);
    const extra = customSessions[courseKey]?.extra || 0;
    const maxBase = base.length > 0 ? Math.max(...base) : 0;
    const extraNums = Array.from({ length: extra }, (_, i) => maxBase + i + 1);
    return [...base, ...extraNums];
  };

  const courseStats = Object.entries(COURSES)
    .filter(([key]) => key !== 'INB5902' && (baseTotals[key] || customSessions[key]))
    .map(([key, course]) => {
      const allNums  = getSessionNumbers(key);
      const total    = allNums.length;
      const attended = allNums.filter(sn => attendance[`${key}-${sn}`] === true).length;
      const marked   = allNums.filter(sn => attendance[`${key}-${sn}`] !== undefined).length;
      const pct      = marked > 0 ? Math.round((attended / marked) * 100) : null;
      const projPct  = total  > 0 ? Math.round((attended / total)  * 100) : null;
      return { key, course, total, attended, marked, pct, projPct, allNums };
    });

  const markSession = (courseKey, session, present) => {
    const k = `${courseKey}-${session}`;
    const updated = { ...attendance, [k]: present };
    setAttendance(updated);
    localStorage.setItem('tapmi_attendance', JSON.stringify(updated));
  };

  const overallAttended = courseStats.reduce((s, c) => s + c.attended, 0);
  const overallMarked   = courseStats.reduce((s, c) => s + c.marked,   0);
  const overallPct      = overallMarked > 0 ? Math.round((overallAttended / overallMarked) * 100) : null;

  return (
    <Layout title="Attendance">
      {overallPct !== null && (
        <div className="card" style={{ padding:'1rem', marginBottom:'1rem', display:'flex', alignItems:'center', gap:'1rem' }}>
          <div style={{ position:'relative', width:64, height:64, flexShrink:0 }}>
            <svg width="64" height="64" viewBox="0 0 64 64" style={{ transform:'rotate(-90deg)' }}>
              <circle cx="32" cy="32" r="26" fill="none" stroke="var(--bg3)" strokeWidth="6"/>
              <circle cx="32" cy="32" r="26" fill="none"
                stroke={overallPct >= 80 ? 'var(--greenlt)' : 'var(--redlt)'} strokeWidth="6"
                strokeDasharray={`${2*Math.PI*26*overallPct/100} ${2*Math.PI*26}`}
                strokeLinecap="round"/>
            </svg>
            <span style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.8rem', fontWeight:800, color:'var(--text)' }}>{overallPct}%</span>
          </div>
          <div>
            <p style={{ fontSize:'0.875rem', fontWeight:700, color:'var(--text)' }}>Overall Attendance</p>
            <p style={{ fontSize:'0.7rem', color:'var(--text2)' }}>{overallAttended} of {overallMarked} marked</p>
            {overallPct < 80 && <p style={{ fontSize:'0.7rem', color:'var(--redlt)', marginTop:2 }}>⚠️ Below 80%</p>}
          </div>
        </div>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {courseStats.map(({ key, course, total, attended, marked, pct, projPct, allNums }) => {
          const color  = COURSE_COLORS[key] || '#B8960C';
          const isOpen = expandedCourse === key;

          return (
            <div key={key} className="card" style={{ overflow:'hidden' }}>
              <button style={{ width:'100%', padding:'0.75rem', display:'flex', alignItems:'center', gap:'0.75rem', background:'none', border:'none', cursor:'pointer', textAlign:'left' }}
                onClick={() => setExpandedCourse(isOpen ? null : key)}>
                <div style={{ width:3, alignSelf:'stretch', borderRadius:4, flexShrink:0, background:color }} />
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{course.name}</p>
                  <AttendanceBar pct={pct ?? 0} />
                </div>
                <div style={{ textAlign:'right', flexShrink:0, marginLeft:8 }}>
                  <p style={{ fontSize:'0.875rem', fontWeight:700, color: pct === null ? 'var(--text3)' : pct >= 80 ? 'var(--greenlt)' : 'var(--redlt)' }}>
                    {pct !== null ? `${pct}%` : '—'}
                  </p>
                  <p style={{ fontSize:'0.6rem', color:'var(--text3)', fontFamily:'monospace' }}>{attended}/{total}</p>
                </div>
                <span style={{ color:'var(--text3)', fontSize:'1rem', transform: isOpen ? 'rotate(180deg)' : 'none', transition:'transform 0.2s' }}>⌄</span>
              </button>

              {isOpen && (
                <div style={{ padding:'0 0.75rem 0.75rem', borderTop:'1px solid var(--border)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', margin:'8px 0' }}>
                    <p style={{ fontSize:'0.65rem', color:'var(--text3)' }}>Tap: once=Present · twice=Absent · thrice=Clear</p>
                    <button onClick={() => setManagingCourse(key)}
                      style={{ fontSize:'0.65rem', padding:'4px 10px', borderRadius:6, background:'rgba(184,150,12,0.15)', color:'var(--goldlt)', border:'1px solid rgba(184,150,12,0.35)', cursor:'pointer', fontWeight:700, flexShrink:0 }}>
                      Manage Sessions
                    </button>
                  </div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                    {allNums.map(sn => {
                      const k   = `${key}-${sn}`;
                      const val = attendance[k];
                      const isExtra = !getSessionNumbersForCourse(key).includes(sn);
                      return (
                        <button key={sn}
                          onClick={() => {
                            if (val === undefined) markSession(key, sn, true);
                            else if (val === true)  markSession(key, sn, false);
                            else { const u={...attendance}; delete u[k]; setAttendance(u); localStorage.setItem('tapmi_attendance',JSON.stringify(u)); }
                          }}
                          style={{
                            width:34, height:34, borderRadius:8, fontSize:'0.7rem', fontFamily:'monospace', fontWeight:700, cursor:'pointer',
                            background: val===true ? 'rgba(26,107,60,0.25)' : val===false ? 'rgba(155,27,27,0.25)' : 'var(--bg3)',
                            border: val===true ? '1px solid rgba(39,174,96,0.5)' : val===false ? '1px solid rgba(192,57,43,0.5)' : `1px dashed ${isExtra ? 'rgba(184,150,12,0.5)' : 'var(--border2)'}`,
                            color: val===true ? 'var(--greenlt)' : val===false ? 'var(--redlt)' : isExtra ? 'var(--gold)' : 'var(--text3)',
                          }}>
                          {sn}
                        </button>
                      );
                    })}
                  </div>
                  {projPct !== null && (
                    <p style={{ fontSize:'0.65rem', color:'var(--text3)', marginTop:6 }}>
                      Projected: <span style={{ color: projPct>=75 ? 'var(--greenlt)' : 'var(--redlt)', fontWeight:700 }}>{projPct}%</span> of {total} total sessions
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {managingCourse && (
        <SessionManagerModal
          courseKey={managingCourse}
          course={COURSES[managingCourse]}
          customSessions={customSessions}
          onUpdate={updateCustomSessions}
          onClose={() => setManagingCourse(null)}
        />
      )}
    </Layout>
  );
}
