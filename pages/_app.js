import "../styles/globals.css";
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);
export function useAuth() { return useContext(AuthContext); }

// ─── Web Push helpers (client-side only) ─────────────────────────────────────
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
  if (!vapidKey) return null; // push not configured yet

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
    // Load stored user
    try {
      const stored = localStorage.getItem("tapmi_user");
      if (stored) setUser(JSON.parse(stored));
    } catch {}
    setLoading(false);

    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(console.error);
    }

    // PWA install prompt (Android/Chrome)
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      // Show banner after 3s if not already installed
      setTimeout(() => setShowInstallBanner(true), 3000);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("tapmi_user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("tapmi_user");
    localStorage.removeItem("tapmi_attendance");
    localStorage.removeItem("tapmi_deadlines");
    localStorage.removeItem("tapmi_reminders");
    localStorage.removeItem("tapmi_notif_pref");
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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <Component {...pageProps} />

      {/* PWA Install Banner (Android Chrome only) */}
      {showInstallBanner && user && (
        <div className="fixed bottom-20 left-4 right-4 max-w-lg mx-auto z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 flex items-center gap-3 shadow-2xl">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex-shrink-0 flex items-center justify-center">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="17" rx="2" stroke="white" strokeWidth="2"/>
                <path d="M3 9h18M8 2v4M16 2v4" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-100">Add to home screen</p>
              <p className="text-xs text-slate-500">Get class reminders & offline access</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => setShowInstallBanner(false)}
                className="text-xs text-slate-500 px-2 py-1"
              >
                Later
              </button>
              <button
                onClick={triggerInstall}
                className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
              >
                Install
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}
