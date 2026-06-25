import { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import { COURSES, COURSE_COLORS, getSessionsForDate, getAllScheduledDates, TIME_SLOTS } from '../lib/timetable';

function toDateStr(d) {
  return d.toISOString().split('T')[0];
}

const TERM_START = new Date('2026-06-22');
const TERM_END = new Date('2026-09-23');

function allDatesInRange() {
  const dates = [];
  const cur = new Date(TERM_START);
  while (cur <= TERM_END) {
    dates.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

export default function Schedule() {
  const today = new Date();
  const [selected, setSelected] = useState(toDateStr(today));
  const allDates = allDatesInRange();
  const scrollRef = useRef(null);

  useEffect(() => {
    // Scroll calendar to today
    const el = document.getElementById(`day-${toDateStr(today)}`);
    if (el) el.scrollIntoView({ inline: 'center', behavior: 'smooth' });
  }, []);

  const sessions = getSessionsForDate(selected);
  const selectedDate = new Date(selected + 'T00:00:00');
  const dayLabel = selectedDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' });

  // Group dates by month for the horizontal scroller
  const months = {};
  allDates.forEach(d => {
    const mk = d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    if (!months[mk]) months[mk] = [];
    months[mk].push(d);
  });

  return (
    <Layout title="Schedule">
      {/* Horizontal date scroller */}
      <div className="overflow-x-auto -mx-4 px-4 pb-3" ref={scrollRef}>
        <div className="flex gap-2 w-max">
          {allDates.map(d => {
            const ds = toDateStr(d);
            const isToday = ds === toDateStr(today);
            const isSelected = ds === selected;
            const hasSessions = getSessionsForDate(ds).length > 0;
            const dow = d.toLocaleDateString('en-IN', { weekday: 'short' }).slice(0, 2).toUpperCase();
            const dom = d.getDate();
            const isWeekend = d.getDay() === 0;

            return (
              <button key={ds} id={`day-${ds}`}
                onClick={() => setSelected(ds)}
                className={`flex flex-col items-center rounded-xl px-3 py-2 min-w-[48px] transition-colors ${
                  isSelected ? 'bg-blue-600 text-white' :
                  isToday ? 'bg-slate-800 text-blue-400 border border-blue-800' :
                  'text-slate-500 hover:bg-slate-900'
                }`}>
                <span className="text-[9px] font-medium mb-1">{dow}</span>
                <span className={`text-sm font-semibold ${isSelected ? 'text-white' : isToday ? 'text-blue-400' : 'text-slate-300'}`}>{dom}</span>
                {hasSessions && !isSelected && (
                  <div className="w-1 h-1 rounded-full bg-blue-500 mt-1" />
                )}
                {!hasSessions && <div className="w-1 h-1 mt-1" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Month label */}
      <p className="text-xs text-slate-500 mb-3 font-mono">
        {selectedDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }).toUpperCase()} · {dayLabel}
      </p>

      {/* Sessions for selected day */}
      {sessions.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-slate-500 text-sm">
            {selectedDate.getDay() === 0 ? '🛌 Weekly off' : 'No classes'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {sessions.map((s, i) => {
            if (s.isInduction) return (
              <div key={i} className="card p-4 text-center">
                <p className="text-sm font-medium text-slate-300">📋 Induction Activity</p>
              </div>
            );
            const course = COURSES[s.courseKey];
            const color = COURSE_COLORS[s.courseKey] || '#4F86C6';
            return (
              <div key={i} className="card p-3 flex gap-3 items-center">
                <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-100 truncate">{course?.name}</p>
                  <p className="text-xs text-slate-500">{course?.faculty}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-slate-400">{s.slot.label}</p>
                  <p className="text-[10px] text-slate-600 font-mono">S{s.session}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
