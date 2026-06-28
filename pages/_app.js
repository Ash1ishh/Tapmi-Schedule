import "../styles/globals.css";
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);
export function useAuth() { return useContext(AuthContext); }

// ── Theme ──────────────────────────────────────────────────────────────────────
export function useTheme() {
  const [theme, setThemeState] = useState("dark");
  useEffect(() => {
    const saved = localStorage.getItem("tapmi_theme") || "dark";
    setThemeState(saved);
    applyTheme(saved);
  }, []);
  const setTheme = (t) => {
    setThemeState(t);
    localStorage.setItem("tapmi_theme", t);
    applyTheme(t);
  };
  return { theme, setTheme };
}
function applyTheme(t) {
  const html = document.documentElement;
  html.classList.remove("light", "dark", "system");
  html.classList.add(t);
}

// ── Push helpers ───────────────────────────────────────────────────────────────
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}
export async function requestNotificationPermission() {
  if (!("Notification" in window)) return "unsupported";
  if (Notification.permission === "granted") return "granted";
  const result = await Notification.requestPermission();
  return result;
}
export async function subscribeToPush() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return null;
  const reg = await navigator.serviceWorker.ready;
  const existing = await reg.pushManager.getSubscription();
  if (existing) return existing;
  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidKey) return null;
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidKey),
  });
  return sub;
}

export default function App({ Component, pageProps }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    // Theme
    const saved = localStorage.getItem("tapmi_theme") || "dark";
    applyTheme(saved);

    // Auth — use localStorage with expiry (90 days)
    try {
      const stored = localStorage.getItem("tapmi_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        const age = Date.now() - (parsed.joinedAt || 0);
        const NINETY_DAYS = 90 * 24 * 60 * 60 * 1000;
        if (age < NINETY_DAYS) setUser(parsed);
        else localStorage.removeItem("tapmi_user");
      }
    } catch {}
    setLoading(false);

    // SW
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(console.error);
    }

    // Install prompt
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      setTimeout(() => setShowInstallBanner(true), 4000);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const login = (userData) => {
    const data = { ...userData, joinedAt: Date.now() };
    setUser(data);
    localStorage.setItem("tapmi_user", JSON.stringify(data));
  };
  const logout = () => {
    setUser(null);
    localStorage.removeItem("tapmi_user");
  };
  const triggerInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") setInstallPrompt(null);
    setShowInstallBanner(false);
  };

  if (loading) {
    return (
      <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ width:20, height:20, border:"2px solid var(--gold)", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.7s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <Component {...pageProps} />
      {showInstallBanner && user && (
        <div style={{ position:"fixed", bottom:80, left:16, right:16, maxWidth:480, margin:"0 auto", zIndex:60 }}>
          <div className="card" style={{ padding:"1rem", display:"flex", gap:"0.75rem", alignItems:"center", boxShadow:"0 8px 32px rgba(0,0,0,0.4)" }}>
            <div style={{ width:40, height:40, borderRadius:"0.5rem", background:"var(--red)", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <span style={{ fontSize:20 }}>📅</span>
            </div>
            <div style={{ flex:1 }}>
              <p style={{ fontSize:"0.875rem", fontWeight:600, color:"var(--text)" }}>Add to home screen</p>
              <p style={{ fontSize:"0.7rem", color:"var(--text2)" }}>Offline access + class reminders</p>
            </div>
            <button onClick={() => setShowInstallBanner(false)} style={{ fontSize:"0.7rem", color:"var(--text3)", padding:"0.25rem 0.5rem" }}>Later</button>
            <button onClick={triggerInstall} style={{ fontSize:"0.75rem", background:"var(--red)", color:"#fff", padding:"0.5rem 0.75rem", borderRadius:"0.5rem", fontWeight:600 }}>Install</button>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}
