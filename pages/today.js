import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { useAuth, requestNotificationPermission, subscribeToPush } from "./_app";
import { COURSES, COURSE_COLORS, getSessionsForDate, TIME_SLOTS } from "../lib/timetable";

function toDateStr(d) { return d.toISOString().split("T")[0]; }

function SessionCard({ session, attendance, onAttend }) {
  const course = COURSES[session.courseKey];
  const color = COURSE_COLORS[session.courseKey] || "#B8960C";
  const att = attendance[`${session.courseKey}-${session.session}`];
  return (
    <div className="card" style={{ padding:"0.75rem", display:"flex", gap:"0.75rem", alignItems:"flex-start" }}>
      <div style={{ width:3, alignSelf:"stretch", borderRadius:4, flexShrink:0, background:color }} />
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:"0.5rem" }}>
          <div style={{ minWidth:0 }}>
            <p style={{ fontSize:"0.875rem", fontWeight:600, color:"var(--text)", lineHeight:1.3 }}>{course?.name || session.courseKey}</p>
            <p style={{ fontSize:"0.7rem", color:"var(--text2)", marginTop:2 }}>{course?.faculty}</p>
          </div>
          <span style={{ fontSize:"0.65rem", fontFamily:"monospace", color:"var(--text3)", flexShrink:0, marginTop:2 }}>S{session.session}</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:"0.5rem" }}>
          <span style={{ fontSize:"0.7rem", color:"var(--text2)" }}>{session.slot.label} · FF 33</span>
          {att === undefined ? (
            <div style={{ display:"flex", gap:6 }}>
              <button onClick={() => onAttend(session, true)}
                style={{ fontSize:"0.65rem", padding:"4px 10px", borderRadius:8, background:"rgba(26,107,60,0.2)", color:"var(--greenlt)", border:"1px solid rgba(39,174,96,0.3)", fontWeight:600, cursor:"pointer" }}>
                Present
              </button>
              <button onClick={() => onAttend(session, false)}
                style={{ fontSize:"0.65rem", padding:"4px 10px", borderRadius:8, background:"rgba(155,27,27,0.2)", color:"var(--redlt)", border:"1px solid rgba(192,57,43,0.3)", fontWeight:600, cursor:"pointer" }}>
                Absent
              </button>
            </div>
          ) : (
            <span style={{ fontSize:"0.65rem", padding:"4px 10px", borderRadius:8, fontWeight:600,
              background: att ? "rgba(26,107,60,0.2)" : "rgba(155,27,27,0.2)",
              color: att ? "var(--greenlt)" : "var(--redlt)" }}>
              {att ? "✓ Present" : "✗ Absent"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function PrepDrawer({ sessions, onClose }) {
  const [notes, setNotes] = useState({});
  useEffect(() => {
    try { const s = JSON.parse(localStorage.getItem("tapmi_reminders") || "{}"); setNotes(s); } catch {}
  }, []);
  const save = (key, value) => {
    const u = { ...notes, [key]: value };
    setNotes(u);
    localStorage.setItem("tapmi_reminders", JSON.stringify(u));
  };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1rem" }}>
          <h2 style={{ fontWeight:700, color:"var(--text)" }}>Tomorrow's Prep</h2>
          <button onClick={onClose} style={{ color:"var(--text3)", fontSize:"1.5rem", lineHeight:1, background:"none", border:"none", cursor:"pointer" }}>×</button>
        </div>
        {sessions.length === 0
          ? <p style={{ fontSize:"0.875rem", color:"var(--text2)", padding:"2rem 0", textAlign:"center" }}>No classes tomorrow 🎉</p>
          : <div style={{ display:"flex", flexDirection:"column", gap:"0.75rem" }}>
              {sessions.map(s => {
                const course = COURSES[s.courseKey];
                const key = `${s.courseKey}-${s.session}`;
                return (
                  <div key={key} className="card-inner" style={{ padding:"0.75rem" }}>
                    <p style={{ fontSize:"0.875rem", fontWeight:600, color:"var(--text)" }}>{course?.name}</p>
                    <p style={{ fontSize:"0.7rem", color:"var(--text2)", marginBottom:"0.5rem" }}>{s.slot.label} · S{s.session}</p>
                    <textarea value={notes[key] || ""} onChange={e => save(key, e.target.value)}
                      placeholder="What to bring / prepare…" rows={2}
                      style={{ width:"100%", background:"var(--bg)", border:"1px solid var(--border2)", borderRadius:8, padding:"0.5rem 0.75rem", fontSize:"0.75rem", color:"var(--text)", resize:"none", outline:"none", boxSizing:"border-box" }}
                    />
                  </div>
                );
              })}
            </div>
        }
      </div>
    </div>
  );
}

function NotifPanel({ onClose }) {
  const [status, setStatus] = useState("idle");
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
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1rem" }}>
          <h2 style={{ fontWeight:700, color:"var(--text)" }}>Class Reminders</h2>
          <button onClick={onClose} style={{ color:"var(--text3)", fontSize:"1.5rem", lineHeight:1, background:"none", border:"none", cursor:"pointer" }}>×</button>
        </div>
        <p style={{ fontSize:"0.8rem", color:"var(--text2)", marginBottom:"1rem" }}>Get notified before each class — even when the app is closed.</p>
        <div style={{ marginBottom:"1rem" }}>
          <p style={{ fontSize:"0.65rem", color:"var(--text3)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"0.5rem" }}>Remind me before class</p>
          <div style={{ display:"flex", gap:8 }}>
            {[15,30,60].map(m => (
              <button key={m} onClick={() => { setTiming(m); localStorage.setItem("tapmi_notif_pref", JSON.stringify(m)); }}
                style={{ flex:1, padding:"0.6rem", borderRadius:10, fontSize:"0.8rem", fontWeight:600, cursor:"pointer",
                  background: timing===m ? "var(--red)" : "var(--bg3)",
                  color: timing===m ? "#fff" : "var(--text2)",
                  border: `1px solid ${timing===m ? "var(--red)" : "var(--border2)"}` }}>
                {m} min
              </button>
            ))}
          </div>
        </div>
        {status === "idle" && <button onClick={enable} className="btn-primary" style={{ width:"100%" }}>Enable Reminders</button>}
        {status === "requesting" && <p style={{ textAlign:"center", color:"var(--text2)", fontSize:"0.875rem" }}>Waiting for permission…</p>}
        {status === "granted" && <div style={{ background:"rgba(26,107,60,0.2)", border:"1px solid rgba(39,174,96,0.3)", borderRadius:10, padding:"0.75rem", textAlign:"center" }}><p style={{ color:"var(--greenlt)", fontWeight:600 }}>✓ Reminders enabled!</p></div>}
        {status === "denied" && <div style={{ background:"rgba(155,27,27,0.15)", border:"1px solid rgba(192,57,43,0.3)", borderRadius:10, padding:"0.75rem" }}><p style={{ color:"var(--redlt)", fontWeight:600, marginBottom:"0.25rem" }}>Permission denied</p><p style={{ fontSize:"0.7rem", color:"var(--text2)" }}>Go to browser Settings → Notifications → Allow for this site</p></div>}
        {status === "unsupported" && <div style={{ background:"var(--bg3)", borderRadius:10, padding:"0.75rem" }}><p style={{ color:"var(--text2)", fontWeight:600, marginBottom:"0.25rem" }}>Not supported</p><p style={{ fontSize:"0.7rem", color:"var(--text3)" }}>Try Chrome on Android, or on iPhone: add to home screen first (Safari → Share → Add to Home Screen)</p></div>}
      </div>
    </div>
  );
}

export default function Today() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState({});
  const [showPrep, setShowPrep] = useState(false);
  const [showNotif, setShowNotif] = useState(false);

  const today = new Date();
  const todayStr = toDateStr(today);
  const sessions = getSessionsForDate(todayStr);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowSessions = getSessionsForDate(toDateStr(tomorrow)).filter(s => !s.isInduction);

  useEffect(() => {
    try { const s = JSON.parse(localStorage.getItem("tapmi_attendance") || "{}"); setAttendance(s); } catch {}
  }, []);

  const handleAttend = (session, present) => {
    const key = `${session.courseKey}-${session.session}`;
    const updated = { ...attendance, [key]: present };
    setAttendance(updated);
    localStorage.setItem("tapmi_attendance", JSON.stringify(updated));
  };

  const dayLabel = today.toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long" });
  const hour = today.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const isAfterLoaded = todayStr > "2026-07-11";

  return (
    <Layout title={null}>
      {/* Welcome Header */}
      <div style={{ padding:"2.5rem 1rem 0.5rem", display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
        <div>
          <p style={{ fontSize:"0.7rem", color:"var(--gold)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"0.2rem", fontWeight:600 }}>
            {greeting}, {user?.name?.split(" ")[0]} 👋
          </p>
          <h1 style={{ fontSize:"1.2rem", fontWeight:800, color:"var(--text)" }}>{dayLabel}</h1>
          <p style={{ fontSize:"0.7rem", color:"var(--text3)", marginTop:"0.2rem" }}>Welcome to TAPMI Scheduler</p>
        </div>
        <button onClick={() => setShowNotif(true)}
          style={{ marginTop:4, width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center", borderRadius:10, background:"var(--bg3)", border:"1px solid var(--border)" }}>
          🔔
        </button>
      </div>

      {/* Gold accent line */}
      <div style={{ height:2, background:"linear-gradient(90deg, var(--gold) 0%, transparent 100%)", margin:"0.75rem 1rem 1rem" }} />

      <div style={{ padding:"0 1rem 6rem", display:"flex", flexDirection:"column", gap:"0.75rem" }}>
        {sessions.length === 0 ? (
          <div className="card" style={{ padding:"2rem", textAlign:"center" }}>
            {today.getDay() === 0 ? (
              <><p style={{ fontSize:"2rem", marginBottom:"0.5rem" }}>🛌</p><p style={{ color:"var(--text2)", fontSize:"0.875rem" }}>Weekly off — rest up!</p></>
            ) : isAfterLoaded ? (
              <><p style={{ fontSize:"2rem", marginBottom:"0.5rem" }}>📅</p><p style={{ color:"var(--text2)", fontSize:"0.875rem" }}>Schedule not loaded yet</p><p style={{ color:"var(--text3)", fontSize:"0.7rem", marginTop:"0.25rem" }}>Add remaining Term 1 schedule when TAPMI releases it</p></>
            ) : (
              <><p style={{ fontSize:"2rem", marginBottom:"0.5rem" }}>✨</p><p style={{ color:"var(--text2)", fontSize:"0.875rem" }}>No classes today</p></>
            )}
          </div>
        ) : (
          sessions.map((s, i) => {
            if (s.isInduction) return (
              <div key={i} className="card" style={{ padding:"1rem", textAlign:"center" }}>
                <p style={{ fontSize:"0.875rem", fontWeight:600, color:"var(--text)" }}>📋 Induction Activity</p>
                <p style={{ fontSize:"0.7rem", color:"var(--text2)", marginTop:"0.25rem" }}>All day · FF 33</p>
              </div>
            );
            return <SessionCard key={i} session={s} attendance={attendance} onAttend={handleAttend} />;
          })
        )}

        {/* Tomorrow prep */}
        <button onClick={() => setShowPrep(true)} className="card"
          style={{ padding:"0.75rem", display:"flex", alignItems:"center", justifyContent:"space-between", background:"none", border:"1px solid var(--border)", cursor:"pointer", borderRadius:12, width:"100%", textAlign:"left" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"0.75rem" }}>
            <div style={{ width:32, height:32, borderRadius:8, background:"var(--bg3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>🕐</div>
            <div>
              <p style={{ fontSize:"0.875rem", fontWeight:600, color:"var(--text)" }}>Tomorrow's Prep</p>
              <p style={{ fontSize:"0.7rem", color:"var(--text3)" }}>
                {tomorrowSessions.length > 0 ? `${tomorrowSessions.length} class${tomorrowSessions.length > 1 ? "es" : ""} · what to bring?` : "No classes tomorrow"}
              </p>
            </div>
          </div>
          <span style={{ color:"var(--text3)", fontSize:"1.2rem" }}>›</span>
        </button>
      </div>

      {showPrep && <PrepDrawer sessions={tomorrowSessions} onClose={() => setShowPrep(false)} />}
      {showNotif && <NotifPanel onClose={() => setShowNotif(false)} />}
    </Layout>
  );
}
