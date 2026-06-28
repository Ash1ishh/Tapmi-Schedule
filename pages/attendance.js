import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { COURSES, COURSE_COLORS, RAW_SCHEDULE, getSessionNumbersForCourse, getTotalSessionsLoaded } from '../lib/timetable';



function AttendanceBar({ pct }) {
  const color = pct >= 85 ? '#10b981' : pct >= 80 ? '#f59e0b' : '#ef4444';
  return (
    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  );
}

export default function Attendance() {
  const [attendance, setAttendance] = useState({});
  const [expandedCourse, setExpandedCourse] = useState(null);
  const totalSessions = getTotalSessionsLoaded();

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('tapmi_attendance') || '{}');
      setAttendance(stored);
    } catch {}
  }, []);

  // Compute per-course stats
  const courseStats = Object.entries(COURSES)
    .filter(([key]) => key !== 'INB5902' && totalSessions[key])
    .map(([key, course]) => {
      const total = totalSessions[key] || 0;
      const attended = Object.entries(attendance)
        .filter(([k, v]) => k.startsWith(key + '-') && v === true).length;
      const marked = Object.keys(attendance).filter(k => k.startsWith(key + '-')).length;
      const pct = marked > 0 ? Math.round((attended / marked) * 100) : null;
      const projected = total > 0 ? Math.round((attended / total) * 100) : null;
      return { key, course, total, attended, marked, pct, projected };
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
      {/* Overall */}
      {overallPct !== null && (
        <div className="card p-4 mb-5 flex items-center gap-4">
          <div className="relative w-16 h-16 flex-shrink-0">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="26" fill="none" stroke="#1e293b" strokeWidth="6"/>
              <circle cx="32" cy="32" r="26" fill="none"
                stroke={overallPct >= 80 ? '#10b981' : '#ef4444'} strokeWidth="6"
                strokeDasharray={`${2 * Math.PI * 26 * overallPct / 100} ${2 * Math.PI * 26}`}
                strokeLinecap="round"/>
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-slate-100">{overallPct}%</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-100">Overall Attendance</p>
            <p className="text-xs text-slate-500">{overallAttended} of {overallMarked} marked sessions</p>
            {overallPct < 80 && <p className="text-xs text-red-400 mt-1">⚠️ Below 80% threshold</p>}
          </div>
        </div>
      )}

      {/* Per course */}
      <div className="space-y-2">
        {courseStats.map(({ key, course, total, attended, marked, pct, projected }) => {
          const color = COURSE_COLORS[key] || '#4F86C6';
          const isOpen = expandedCourse === key;

          const uniqueSessions = getSessionNumbersForCourse(key);

          return (
            <div key={key} className="card overflow-hidden">
              <button className="w-full p-3 flex items-center gap-3 text-left"
                onClick={() => setExpandedCourse(isOpen ? null : key)}>
                <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-100 truncate">{course.name}</p>
                  <div className="mt-1.5">
                    <AttendanceBar pct={pct ?? 0} />
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="text-sm font-semibold" style={{ color: pct === null ? '#64748b' : pct >= 80 ? '#10b981' : '#ef4444' }}>
                    {pct !== null ? `${pct}%` : '—'}
                  </p>
                  <p className="text-[10px] text-slate-600">{attended}/{marked}</p>
                </div>
                <svg className={`flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} width="14" height="14" fill="none" viewBox="0 0 24 24">
                  <path d="M6 9l6 6 6-6" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </button>

              {isOpen && (
                <div className="px-3 pb-3 border-t border-slate-800">
                  <p className="text-[10px] text-slate-600 mt-2 mb-2">Tap to mark each session</p>
                  <div className="flex flex-wrap gap-1.5">
                    {uniqueSessions.map(sn => {
                      const k = `${key}-${sn}`;
                      const val = attendance[k];
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
                          className={`w-8 h-8 rounded-lg text-xs font-mono font-medium border transition-colors ${
                            val === true ? 'bg-emerald-900 border-emerald-700 text-emerald-300' :
                            val === false ? 'bg-red-900 border-red-700 text-red-300' :
                            'bg-slate-800 border-slate-700 text-slate-400'
                          }`}>
                          {sn}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-slate-600 mt-2">Green = present · Red = absent · Grey = unmarked</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Layout>
  );
}
