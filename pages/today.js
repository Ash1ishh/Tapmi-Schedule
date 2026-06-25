import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { useAuth, requestNotificationPermission, subscribeToPush } from "./_app";
import {
  COURSES,
  COURSE_COLORS,
  getSessionsForDate,
  TIME_SLOTS,
} from "../lib/timetable";

function toDateStr(d) {
  return d.toISOString().split("T")[0];
}

// ─── Session Card ─────────────────────────────────────────────────────────────
function SessionCard({ session, attendance, onAttend }) {
  const course = COURSES[session.courseKey];
  const color = COURSE_COLORS[session.courseKey] || "#4F86C6";
  const att = attendance[`${session.courseKey}-${session.session}`];

  return (
    <div className="card p-3 flex gap-3 items-start">
      <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-100 leading-snug">{course?.name || session.courseKey}</p>
            <p className="text-xs text-slate-500 mt-0.5 truncate">{course?.faculty}</p>
          </div>
          <span className="text-[10px] font-mono text-slate-600 flex-shrink-0 mt-0.5">S{session.session}</span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-slate-500">{session.slot.label} · FF 33</span>
          {att === undefined ? (
            <div className="flex gap-1.5">
              <button
                onClick={() => onAttend(session, true)}
                className="text-[10px] px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-900 hover:bg-emerald-900 transition-colors font-medium"
              >
                Present
              </button>
              <button
                onClick={() => onAttend(session, false)}
                className="text-[10px] px-2.5 py-1 rounded-lg bg-red-950 text-red-400 border border-red-900 hover:bg-red-900 transition-colors font-medium"
              >
                Absent
              </button>
            </div>
          ) : (
            <span className={`text-[10px] px-2.5 py-1 rounded-lg font-medium ${att ? "bg-emerald-950 text-emerald-400" : "bg-red-950 text-red-400"}`}>
              {att ? "✓ Present" : "✗ Absent"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Tomorrow prep drawer ─────────────────────────────────────────────────────
function PrepDrawer({ sessions, onClose }) {
  const [notes, setNotes] = useState({});

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("tapmi_reminders") || "{}");
      setNotes(stored);
    } catch {}
  }, []);

  const save = (key, value) => {
    const updated = { ...notes, [key]: value };
    setNotes(updated);
    localStorage.setItem("tapmi_reminders", JSON.stringify(updated));
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-end" onClick={onClose}>
      <div className="bg-slate-900 rounded-t-2xl w-full max-w-lg mx-auto p-5 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-100">Tomorrow's prep</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 text-2xl leading-none w-8 h-8 flex items-center justify-center">×</button>
        </div>
        {sessions.length === 0 ? (
          <p className="text-sm text-slate-500 py-6 text-center">No classes tomorrow</p>
        ) : (
          <div className="space-y-3">
            {sessions.map((s) => {
              const course = COURSES[s.courseKey];
              const key = `${s.courseKey}-${s.session}`;
              return (
                <div key={key} className="card p-3 space-y-2">
                  <div>
                    <p className="text-sm font-medium text-slate-100">{course?.name}</p>
                    <p className="text-xs text-slate-500">{s.slot.label} · S{s.session}</p>
                  </div>
                  <textarea
                    value={notes[key] || ""}
                    onChange={(e) => save(key, e.target.value)}
                    placeholder="What to bring / prepare…"
                    rows={2}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-blue-600 resize-none"
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Notification setup panel ─────────────────────────────────────────────────
function NotifPanel({ onClose }) {
  const [status, setStatus] = useState("idle"); // idle | requesting | granted | denied | unsupported
  const [timing, setTiming] = useState(() => {
    try { return JSON.parse(localStorage.getItem("tapmi_notif_pref") || "null") || 30; } catch { return 30; }
  });

  const enable = async () => {
    setStatus("requesting");
    const perm = await requestNotificationPermission();
    if (perm === "granted") {
      await subscribeToPush();
      localStorage.setItem("tapmi_notif_pref", JSON.stringify(timing));
      setStatus("granted");
    } else if (perm === "unsupported") {
      setStatus("unsupported");
    } else {
      setStatus("denied");
    }
  };

  const saveTiming = (mins) => {
    setTiming(mins);
    localStorage.setItem("tapmi_notif_pref", JSON.stringify(mins));
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-end" onClick={onClose}>
      <div className="bg-slate-900 rounded-t-2xl w-full max-w-lg mx-auto p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-slate-100">Class reminders</h2>
          <button onClick={onClose} className="text-slate-500 text-2xl leading-none w-8 h-8 flex items-center justify-center">×</button>
        </div>

        <p className="text-sm text-slate-400 mb-4">
          Get a push notification before each class — even when the app is closed.
        </p>

        <div className="mb-5">
          <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider">Remind me before class</p>
          <div className="flex gap-2">
            {[15, 30, 60].map((m) => (
              <button
                key={m}
                onClick={() => saveTiming(m)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                  timing === m
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600"
                }`}
              >
                {m} min
              </button>
            ))}
          </div>
        </div>

        {status === "idle" && (
          <button
            onClick={enable}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3.5 rounded-xl text-sm transition-colors"
          >
            Enable reminders
          </button>
        )}

        {status === "requesting" && (
          <div className="flex items-center justify-center gap-2 py-3">
            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-slate-400">Waiting for permission…</span>
          </div>
        )}

        {status === "granted" && (
          <div className="bg-emerald-950 border border-emerald-900 rounded-xl p-3 text-center">
            <p className="text-sm text-emerald-400 font-medium">✓ Reminders enabled</p>
            <p className="text-xs text-emerald-700 mt-0.5">You'll get notified {timing} min before each class</p>
          </div>
        )}

        {status === "denied" && (
          <div className="bg-amber-950 border border-amber-900 rounded-xl p-3">
            <p className="text-sm text-amber-400 font-medium">Permission denied</p>
            <p className="text-xs text-amber-700 mt-1">Go to your browser settings → Notifications → Allow for this site</p>
          </div>
        )}

        {status === "unsupported" && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-3">
            <p className="text-sm text-slate-400 font-medium">Not supported on this browser</p>
            <p className="text-xs text-slate-600 mt-1">Try Chrome or Edge on Android. On iPhone, add to home screen first (Safari → Share → Add to Home Screen)</p>
          </div>
        )}

        <p className="text-xs text-slate-700 mt-4 text-center">
          Notifications only work after adding this app to your home screen on iPhone.
        </p>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Today() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState({});
  const [showPrep, setShowPrep] = useState(false);
  const [showNotif, setShowNotif] = useState(false);

  const today = new Date();
  const todayStr = toDateStr(today);
  const sessions = getSessionsForDate(todayStr);

  // Tomorrow sessions
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = toDateStr(tomorrow);
  const tomorrowSessions = getSessionsForDate(tomorrowStr).filter((s) => !s.isInduction);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("tapmi_attendance") || "{}");
      setAttendance(stored);
    } catch {}
  }, []);

  const handleAttend = (session, present) => {
    const key = `${session.courseKey}-${session.session}`;
    const updated = { ...attendance, [key]: present };
    setAttendance(updated);
    localStorage.setItem("tapmi_attendance", JSON.stringify(updated));
  };

  const dayLabel = today.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const isScheduleLoaded = sessions.length > 0 || todayStr <= "2026-07-11";
  const isAfterLoaded = todayStr > "2026-07-11";

  return (
    <Layout title={null}>
      {/* Header */}
      <div className="px-4 pt-12 pb-4 flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-500 mb-0.5 uppercase tracking-wider">Today</p>
          <h1 className="text-lg font-semibold text-slate-100">{dayLabel}</h1>
        </div>
        <button
          onClick={() => setShowNotif(true)}
          className="mt-1 w-9 h-9 flex items-center justify-center rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
          title="Set up reminders"
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <div className="px-4 pb-24 space-y-3">
        {/* No schedule today */}
        {sessions.length === 0 && (
          <div className="card p-8 text-center">
            {today.getDay() === 0 ? (
              <>
                <p className="text-2xl mb-2">🛌</p>
                <p className="text-sm text-slate-400">Weekly off — rest up</p>
              </>
            ) : isAfterLoaded ? (
              <>
                <p className="text-2xl mb-2">📅</p>
                <p className="text-sm text-slate-400">Schedule for this date not loaded yet</p>
                <p className="text-xs text-slate-600 mt-1">Add Term 1 schedule when TAPMI releases it</p>
              </>
            ) : (
              <>
                <p className="text-2xl mb-2">✨</p>
                <p className="text-sm text-slate-400">No classes today</p>
              </>
            )}
          </div>
        )}

        {/* Sessions */}
        {sessions.map((s, i) => {
          if (s.isInduction) return (
            <div key={i} className="card p-4 text-center">
              <p className="text-sm font-medium text-slate-300">📋 Induction Activity</p>
              <p className="text-xs text-slate-600 mt-1">All day · FF 33</p>
            </div>
          );
          return <SessionCard key={i} session={s} attendance={attendance} onAttend={handleAttend} />;
        })}

        {/* Tomorrow prep button */}
        <button
          onClick={() => setShowPrep(true)}
          className="w-full card p-3 flex items-center justify-between hover:border-slate-700 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                <path d="M12 6v6l4 2" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round"/>
                <circle cx="12" cy="12" r="9" stroke="#94a3b8" strokeWidth="1.8"/>
              </svg>
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-slate-300">Tomorrow's prep</p>
              <p className="text-xs text-slate-600">
                {tomorrowSessions.length > 0
                  ? `${tomorrowSessions.length} class${tomorrowSessions.length > 1 ? "es" : ""} · what to bring?`
                  : "No classes tomorrow"}
              </p>
            </div>
          </div>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" className="flex-shrink-0">
            <path d="M9 18l6-6-6-6" stroke="#475569" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {showPrep && <PrepDrawer sessions={tomorrowSessions} onClose={() => setShowPrep(false)} />}
      {showNotif && <NotifPanel onClose={() => setShowNotif(false)} />}
    </Layout>
  );
}
