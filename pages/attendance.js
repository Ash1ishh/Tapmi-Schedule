import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { COURSES, COURSE_COLORS, RAW_SCHEDULE, getSessionNumbersForCourse, getTotalSessionsLoaded } from '../lib/timetable';

function AttendanceBar({ pct }) {
  const color = pct >= 85 ? 'var(--greenlt)' : pct >= 80 ? 'var(--gold)' : 'var(--redlt)';
  return (
    <div style={{ height:5, background:'var(--bg3)', borderRadius:4, overflow:'hidden', marginTop:4 }}>
      <div style={{ height:'100%', borderRadius:4, transition:'width 0.4s', width:`${pct}%`, background:color }} />
    </div>
  );
}

// ── Session Manager Modal ──────────────────────────────────────────────────────
function SessionManagerModal({ courseKey, course, onClose, customSessions, onUpdate }) {
  const baseSessions = getSessionNumbersForCourse(courseKey);
  const [extra, setExtra] = useState(() => {
    const cs = customSessions[courseKey] || {};
    return cs.extra || 0;
  });

  const totalBase = baseSessions.length;
  const totalCustom = totalBase + extra;

  const save = () => {
    onUpdate(courseKey, extra);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
          <h2 style={{ fontWeight:700, color:'var(--text)', fontSize:'1rem' }}>Manage Sessions</h2>
          <button onClick={onClose} style={{ color:'var(--text3)', fontSize:'1.5rem', lineHeight:1, background:'none', border:'none', cursor:'pointer' }}>×</button>
        </div>

        <div className="card-inner" style={{ padding:'0.75rem', marginBottom:'0.75rem' }}>
          <p style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--text)', marginBottom:'0.25rem' }}>{course.name}</p>
          <p style={{ fontSize:'0.7rem', color:'var(--text2)' }}>{course.faculty}</p>
        </div>

        <div style={{ background:'rgba(184,150,12,0.1)', border:'1px solid rgba(184,150,12,0.3)', borderRadius:10, padding:'0.75rem', marginBottom:'1rem' }}>
          <p style={{ fontSize:'0.75rem', color:'var(--goldlt)', lineHeight:1.5 }}>
            ⚠️ Attendance depends on the sessions, so check thoroughly that it's made correctly. You can add or subtract sessions.
          </p>
        </div>

        <div style={{ marginBottom:'1rem' }}>
          <p style={{ fontSize:'0.7rem', color:'var(--text3)', marginBottom:'0.5rem', textTransform:'uppercase', letterSpacing:'0.08em' }}>Sessions in schedule (auto)</p>
          <p style={{ fontSize:'1.5rem', fontWeight:800, color:'var(--text)', fontFamily:'monospace' }}>{totalBase}</p>
        </div>

        <div style={{ marginBottom:'1rem' }}>
          <p style={{ fontSize:'0.7rem', color:'var(--text3)', marginBottom:'0.5rem', textTransform:'uppercase', letterSpacing:'0.08em' }}>Extra sessions (future / unloaded)</p>
          <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
            <button onClick={() => setExtra(Math.max(0, extra - 1))}
              style={{ width:40, height:40, borderRadius:10, background:'var(--bg3)', border:'1px solid var(--border2)', fontSize:'1.2rem', fontWeight:700, cursor:'pointer', color:'var(--text)', display:'flex', alignItems:'center', justifyContent:'center' }}>−</button>
            <span style={{ fontSize:'1.5rem', fontWeight:800, fontFamily:'monospace', color:'var(--text)', minWidth:32, textAlign:'center' }}>{extra}</span>
            <button onClick={() => setExtra(extra + 1)}
              style={{ width:40, height:40, borderRadius:10, background:'var(--bg3)', border:'1px solid var(--border2)', fontSize:'1.2rem', fontWeight:700, cursor:'pointer', color:'var(--text)', display:'flex', alignItems:'center', justifyContent:'center' }}>+</button>
          </div>
        </div>

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0.75rem', background:'var(--bg3)', borderRadius:10, marginBottom:'1rem' }}>
          <span style={{ fontSize:'0.8rem', color:'var(--text2)' }}>Total sessions</span>
          <span style={{ fontSize:'1.1rem', fontWeight:800, color:'var(--gold)', fontFamily:'monospace' }}>{totalCustom}</span>
        </div>

        <button onClick={save} className="btn-primary" style={{ width:'100%' }}>Save Sessions</button>
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
      const cs = JSON.parse(localStorage.getItem('tapmi_custom_sessions') || '{}');
      setAttendance(att);
      setCustomSessions(cs);
    } catch {}
  }, []);

  const updateCustomSessions = (courseKey, extra) => {
    const updated = { ...customSessions, [courseKey]: { extra } };
    setCustomSessions(updated);
    localStorage.setItem('tapmi_custom_sessions', JSON.stringify(updated));
  };

  const getTotalSessions = (courseKey) => {
    const base = getSessionNumbersForCourse(courseKey);
    const extra = customSessions[courseKey]?.extra || 0;
    return base.length + extra;
  };

  const getSessionNumbers = (courseKey) => {
    const base = getSessionNumbersForCourse(courseKey);
    const extra = customSessions[courseKey]?.extra || 0;
    const maxBase = base.length > 0 ? Math.max(...base) : 0;
    const extraNums = Array.from({length: extra}, (_, i) => maxBase + i + 1);
    return [...base, ...extraNums];
  };

  const courseStats = Object.entries(COURSES)
    .filter(([key]) => key !== 'INB5902' && (baseTotals[key] || customSessions[key]))
    .map(([key, course]) => {
      const allNums = getSessionNumbers(key);
      const total = allNums.length;
      const attended = allNums.filter(sn => attendance[`${key}-${sn}`] === true).length;
      const marked = allNums.filter(sn => attendance[`${key}-${sn}`] !== undefined).length;
      const pct = marked > 0 ? Math.round((attended / marked) * 100) : null;
      const projPct = total > 0 ? Math.round((attended / total) * 100) : null;
      return { key, course, total, attended, marked, pct, projPct, allNums };
    });

  const markSession = (courseKey, session, present) => {
    const k = `${courseKey}-${session}`;
    const updated = { ...attendance, [k]: present };
    setAttendance(updated);
    localStorage.setItem('tapmi_attendance', JSON.stringify(updated));
  };

  const overallAttended = courseStats.reduce((s, c) => s + c.attended, 0);
  const overallMarked = courseStats.reduce((s, c) => s + c.marked, 0);
  const overallPct = overallMarked > 0 ? Math.round((overallAttended / overallMarked) * 100) : null;

  return (
    <Layout title="Attendance">
      {/* Overall ring */}
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
            <p style={{ fontSize:'0.7rem', color:'var(--text2)' }}>{overallAttended} of {overallMarked} marked sessions</p>
            {overallPct < 80 && <p style={{ fontSize:'0.7rem', color:'var(--redlt)', marginTop:2 }}>⚠️ Below 80% threshold</p>}
          </div>
        </div>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {courseStats.map(({ key, course, total, attended, marked, pct, projPct, allNums }) => {
          const color = COURSE_COLORS[key] || '#B8960C';
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
                <span style={{ color:'var(--text3)', transform: isOpen ? 'rotate(180deg)' : 'none', transition:'transform 0.2s', fontSize:'1rem' }}>⌄</span>
              </button>

              {isOpen && (
                <div style={{ padding:'0 0.75rem 0.75rem', borderTop:'1px solid var(--border)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', margin:'0.5rem 0 0.75rem' }}>
                    <p style={{ fontSize:'0.65rem', color:'var(--text3)' }}>Tap to mark · Green=Present · Red=Absent</p>
                    <button onClick={() => setManagingCourse(key)}
                      style={{ fontSize:'0.65rem', padding:'3px 8px', borderRadius:6, background:'rgba(184,150,12,0.15)', color:'var(--goldlt)', border:'1px solid rgba(184,150,12,0.3)', cursor:'pointer', fontWeight:600 }}>
                      Manage Sessions
                    </button>
                  </div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                    {allNums.map(sn => {
                      const k = `${key}-${sn}`;
                      const val = attendance[k];
                      const isExtra = !getSessionNumbersForCourse(key).includes(sn);
                      return (
                        <button key={sn}
                          onClick={() => {
                            if (val === undefined) markSession(key, sn, true);
                            else if (val === true) markSession(key, sn, false);
                            else {
                              const u = { ...attendance };
                              delete u[k];
                              setAttendance(u);
                              localStorage.setItem('tapmi_attendance', JSON.stringify(u));
                            }
                          }}
                          style={{
                            width:34, height:34, borderRadius:8, fontSize:'0.7rem', fontFamily:'monospace', fontWeight:700, cursor:'pointer',
                            background: val === true ? 'rgba(26,107,60,0.25)' : val === false ? 'rgba(155,27,27,0.25)' : 'var(--bg3)',
                            border: val === true ? '1px solid rgba(39,174,96,0.5)' : val === false ? '1px solid rgba(192,57,43,0.5)' : `1px dashed ${isExtra ? 'rgba(184,150,12,0.4)' : 'var(--border2)'}`,
                            color: val === true ? 'var(--greenlt)' : val === false ? 'var(--redlt)' : isExtra ? 'var(--gold)' : 'var(--text3)',
                          }}>
                          {sn}
                        </button>
                      );
                    })}
                  </div>
                  {projPct !== null && (
                    <p style={{ fontSize:'0.65rem', color:'var(--text3)', marginTop:'0.5rem' }}>
                      Projected: <span style={{ color: projPct >= 75 ? 'var(--greenlt)' : 'var(--redlt)', fontWeight:700 }}>{projPct}%</span> of {total} total sessions
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
