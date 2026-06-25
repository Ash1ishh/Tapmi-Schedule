import BottomNav from "./BottomNav";
import { useAuth } from "../pages/_app";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Layout({ children, title }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    if (!user && router.pathname !== "/login") {
      router.push("/login");
    }
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-950 max-w-lg mx-auto relative">
      {title !== null && (
        <header className="px-4 pt-12 pb-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-slate-100">{title}</h1>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 font-mono">MBA-IB · T1</span>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-800 transition-colors"
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="5" r="1.5" fill="#64748b"/>
                <circle cx="12" cy="12" r="1.5" fill="#64748b"/>
                <circle cx="12" cy="19" r="1.5" fill="#64748b"/>
              </svg>
            </button>
          </div>
        </header>
      )}

      {/* Dropdown menu */}
      {showMenu && (
        <div className="absolute top-16 right-4 z-50 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden min-w-[160px]">
          <div className="px-4 py-3 border-b border-slate-700">
            <p className="text-xs text-slate-400">Signed in as</p>
            <p className="text-sm font-medium text-slate-100 truncate">{user.name}</p>
          </div>
          <button
            onClick={() => { setShowMenu(false); logout(); router.push("/login"); }}
            className="w-full px-4 py-3 text-sm text-red-400 hover:bg-slate-700 transition-colors text-left"
          >
            Sign out
          </button>
        </div>
      )}
      {showMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
      )}

      <main className="pb-24 px-4">{children}</main>
      <BottomNav />
    </div>
  );
}
