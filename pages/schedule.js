import { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import { COURSES, COURSE_COLORS, getSessionsForDate, getAllScheduledDates, TIME_SLOTS, RAW_SCHEDULE } from '../lib/timetable';

function toDateStr(d) { return d.toISOString().split('T')[0]; }
const TERM_START = new Date('2026-06-22');
const TERM_END   = new Date('2026-09-23');

function allDatesInRange() {
  const dates = [];
  const cur = new Date(TERM_START);
  while (cur <= TERM_END) { dates.push(new Date(cur)); cur.setDate(cur.getDate()+1); }
  return dates;
}

// Returns Monday of the week containing `date`
function weekStart(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

// ── Week Calendar View ─────────────────────────────────────────────────────────
function WeekView({ weekDate }) {
  const monday = weekStart(weekDate);
  const days = Array.from({length:6}, (_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    return d;
  }); // Mon–Sat

  const today = new Date();
  const todayStr = toDateStr(today);

  // Build slot map: slotIndex → { [dayIndex]: sessionInfo }
  const grid = TIME_SLOTS.map((slot, si) => {
    const row = {};
    days.forEach((d, di) => {
      const ds = toDateStr(d);
      const rawRow = RAW_SCHEDULE.find(r => r[0] === ds);
      if (rawRow) {
        const cell = rawRow[si + 1];
        if (cell && cell !== 'INDUCTION') {
          const [courseKey, sn] = cell.split('-');
          row[di] = { courseKey, session: parseInt(sn), slot };
        } else if (cell === 'INDUCTION') {
          row[di] = { isInduction: true, slot };
        }
      }
    });
    return { slot, row };
  });

  const DAY_LABELS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  return (
    <div style={{ overflowX:'auto', WebkitOverflowScrolling:'touch', margin:'0 -1rem' }}>
      <div style={{ minWidth: 560, padding:'0 1rem' }}>
        {/* Day header row */}
        <div style={{ display:'grid', gridTemplateColumns:'72px repeat(6, 1fr)', gap:2, marginBottom:4 }}>
          <div />
          {days.map((d, i) => {
            const ds = toDateStr(d);
            const isToday = ds === todayStr;
            return (
              <div key={i} style={{ textAlign:'center', padding:'4px 2px' }}>
                <p style={{ fontSize:'0.6rem', fontWeight:700, color: isToday ? 'var(--gold)' : 'var(--text3)', letterSpacing:'0.06em' }}>{DAY_LABELS[i]}</p>
                <p style={{ fontSize:'0.85rem', fontWeight: isToday ? 800 : 500, color: isToday ? 'var(--gold)' : 'var(--text2)' }}>{d.getDate()}</p>
                {isToday && <div style={{ width:4, height:4, borderRadius:'50%', background:'var(--gold)', margin:'2px auto 0' }} />}
              </div>
            );
          })}
        </div>

        {/* Time slot rows */}
        {grid.map(({ slot, row }, si) => (
          <div key={si} style={{ display:'grid', gridTemplateColumns:'72px repeat(6, 1fr)', gap:2, marginBottom:3 }}>
            {/* Time label */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', paddingRight:6 }}>
              <span style={{ fontSize:'0.55rem', color:'var(--text3)', fontFamily:'monospace', lineHeight:1.2, textAlign:'right' }}>
                {slot.start}<br/>{slot.end}
              </span>
            </div>

            {/* Day cells */}
            {days.map((d, di) => {
              const ds = toDateStr(d);
              const session = row[di];
              const isToday = ds === todayStr;
              const isSunday = d.getDay() === 0;

              if (isSunday) return <div key={di} />;

              if (!session) return (
                <div key={di} style={{
                  borderRadius:6, border:'1px dashed var(--border)',
                  background: isToday ? 'rgba(184,150,12,0.04)' : 'transparent',
                  minHeight:48, display:'flex', alignItems:'center', justifyContent:'center'
                }}>
                  <span style={{ fontSize:'0.55rem', color:'var(--border2)' }}>—</span>
                </div>
              );

              if (session.isInduction) return (
                <div key={di} style={{ borderRadius:6, background:'rgba(184,150,12,0.15)', border:'1px solid rgba(184,150,12,0.3)', minHeight:48, display:'flex', alignItems:'center', justifyContent:'center', padding:'4px 3px' }}>
                  <span style={{ fontSize:'0.55rem', color:'var(--gold)', textAlign:'center', fontWeight:600 }}>INDUCTION</span>
                </div>
              );

              const course = COURSES[session.courseKey];
              const color = COURSE_COLORS[session.courseKey] || '#B8960C';
              const shortName = course?.name?.split(' ').slice(0,2).join(' ') || session.courseKey;

              return (
                <div key={di} style={{
                  borderRadius:6,
                  background: color + '22',
                  border: `1px solid ${color}55`,
                  minHeight:48, padding:'4px 5px',
                  display:'flex', flexDirection:'column', justifyContent:'space-between',
                  boxShadow: isToday ? `0 0 0 1px ${color}44` : 'none'
                }}>
                  <p style={{ fontSize:'0.58rem', fontWeight:700, color, lineHeight:1.2 }}>{shortName}</p>
                  <p style={{ fontSize:'0.5rem', color: color + 'bb', fontFamily:'monospace' }}>S{session.session}</p>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Day View ───────────────────────────────────────────────────────────────────
function DayView({ selected, setSelected, allDates, today }) {
  const sessions = getSessionsForDate(selected);
  const selectedDate = new Date(selected + 'T00:00:00');
  const todayStr = toDateStr(today);

  return (
    <>
      {/* Horizontal date strip */}
      <div style={{ overflowX:'auto', margin:'0 -1rem', padding:'0 1rem 0.75rem', WebkitOverflowScrolling:'touch' }}>
        <div style={{ display:'flex', gap:6, width:'max-content' }}>
          {allDates.map(d => {
            const ds = toDateStr(d);
            const isToday = ds === todayStr;
            const isSelected = ds === selected;
            const hasSessions = getSessionsForDate(ds).length > 0;
            const dow = d.toLocaleDateString('en-IN', { weekday:'short' }).slice(0,2).toUpperCase();
            const isWeekend = d.getDay() === 0;

            return (
              <button key={ds} id={`day-${ds}`} onClick={() => setSelected(ds)}
                style={{
                  display:'flex', flexDirection:'column', alignItems:'center',
                  borderRadius:10, padding:'6px 10px', minWidth:40, border:'none', cursor:'pointer',
                  background: isSelected ? 'var(--red)' : isToday ? 'var(--bg3)' : 'transparent',
                  outline: isToday && !isSelected ? '1px solid var(--gold)' : 'none',
                }}>
                <span style={{ fontSize:'0.55rem', fontWeight:700, color: isSelected ? '#fff' : isToday ? 'var(--gold)' : 'var(--text3)', marginBottom:2 }}>{dow}</span>
                <span style={{ fontSize:'0.9rem', fontWeight:700, color: isSelected ? '#fff' : isToday ? 'var(--gold)' : 'var(--text2)' }}>{d.getDate()}</span>
                <div style={{ width:4, height:4, borderRadius:'50%', marginTop:2,
                  background: hasSessions && !isSelected ? 'var(--gold)' : 'transparent' }} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Month label */}
      <p style={{ fontSize:'0.65rem', color:'var(--text3)', marginBottom:'0.75rem', fontFamily:'monospace', letterSpacing:'0.05em' }}>
        {selectedDate.toLocaleDateString('en-IN', { month:'long', year:'numeric' }).toUpperCase()} · {selectedDate.toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'short' })}
      </p>

      {/* Sessions */}
      {sessions.length === 0 ? (
        <div className="card" style={{ padding:'2rem', textAlign:'center' }}>
          <p style={{ color:'var(--text2)', fontSize:'0.875rem' }}>
            {selectedDate.getDay() === 0 ? '🛌 Weekly off' : 'No classes'}
          </p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {sessions.map((s, i) => {
            if (s.isInduction) return (
              <div key={i} className="card" style={{ padding:'1rem', textAlign:'center' }}>
                <p style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--text)' }}>📋 Induction Activity</p>
              </div>
            );
            const course = COURSES[s.courseKey];
            const color = COURSE_COLORS[s.courseKey] || '#B8960C';
            return (
              <div key={i} className="card" style={{ padding:'0.75rem', display:'flex', gap:'0.75rem', alignItems:'center' }}>
                <div style={{ width:3, alignSelf:'stretch', borderRadius:4, background:color, flexShrink:0 }} />
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--text)' }}>{course?.name}</p>
                  <p style={{ fontSize:'0.7rem', color:'var(--text2)' }}>{course?.faculty}</p>
                </div>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <p style={{ fontSize:'0.75rem', color:'var(--text2)' }}>{s.slot.label}</p>
                  <p style={{ fontSize:'0.6rem', color:'var(--text3)', fontFamily:'monospace' }}>S{s.session}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

export default function Schedule() {
  const today = new Date();
  const [selected, setSelected] = useState(toDateStr(today));
  const [view, setView] = useState('day'); // day | week
  const [weekDate, setWeekDate] = useState(today);
  const allDates = allDatesInRange();

  useEffect(() => {
    const el = document.getElementById(`day-${toDateStr(today)}`);
    if (el) el.scrollIntoView({ inline:'center', behavior:'smooth' });
  }, []);

  // Week navigation
  const prevWeek = () => { const d = new Date(weekDate); d.setDate(d.getDate()-7); setWeekDate(d); };
  const nextWeek = () => { const d = new Date(weekDate); d.setDate(d.getDate()+7); setWeekDate(d); };
  const ws = weekStart(weekDate);
  const we = new Date(ws); we.setDate(we.getDate()+5);

  return (
    <Layout title="Schedule">
      {/* Day / Week toggle */}
      <div style={{ display:'flex', background:'var(--bg3)', borderRadius:10, padding:3, marginBottom:'1rem', border:'1px solid var(--border)' }}>
        {['day','week'].map(v => (
          <button key={v} onClick={() => setView(v)}
            style={{ flex:1, padding:'0.5rem', borderRadius:8, fontSize:'0.8rem', fontWeight:700, cursor:'pointer', border:'none', textTransform:'capitalize',
              background: view===v ? 'var(--red)' : 'transparent',
              color: view===v ? '#fff' : 'var(--text3)' }}>
            {v === 'day' ? '📆 Day' : '🗓 Week'}
          </button>
        ))}
      </div>

      {view === 'week' && (
        <div style={{ marginBottom:'0.75rem', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <button onClick={prevWeek} style={{ padding:'0.4rem 0.75rem', borderRadius:8, background:'var(--bg3)', border:'1px solid var(--border)', color:'var(--text2)', cursor:'pointer', fontSize:'0.8rem' }}>‹ Prev</button>
          <span style={{ fontSize:'0.75rem', color:'var(--text2)', fontWeight:600 }}>
            {ws.toLocaleDateString('en-IN', {day:'numeric',month:'short'})} – {we.toLocaleDateString('en-IN', {day:'numeric',month:'short'})}
          </span>
          <button onClick={nextWeek} style={{ padding:'0.4rem 0.75rem', borderRadius:8, background:'var(--bg3)', border:'1px solid var(--border)', color:'var(--text2)', cursor:'pointer', fontSize:'0.8rem' }}>Next ›</button>
        </div>
      )}

      {view === 'day'
        ? <DayView selected={selected} setSelected={setSelected} allDates={allDates} today={today} />
        : <WeekView weekDate={weekDate} />
      }
    </Layout>
  );
}
