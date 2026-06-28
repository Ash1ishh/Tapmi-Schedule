import BottomNav from "./BottomNav";
import { useAuth } from "../pages/_app";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Layout({ children, title, noPad }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    if (!user && router.pathname !== "/login") router.push("/login");
  }, [user, router]);

  if (!user) return null;

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", maxWidth:480, margin:"0 auto", position:"relative" }}>
      {title !== null && (
        <header style={{ padding:"3rem 1rem 1rem", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <h1 style={{ fontSize:"1.1rem", fontWeight:700, color:"var(--text)" }}>{title}</h1>
          <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
            <span style={{ fontSize:"0.65rem", color:"var(--text3)", fontFamily:"monospace" }}>MBA-IB · T1</span>
            <button onClick={() => setShowMenu(!showMenu)}
              style={{ width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center", borderRadius:8, background:"var(--bg3)", border:"1px solid var(--border)" }}>
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="5" r="1.5" fill="var(--text3)"/>
                <circle cx="12" cy="12" r="1.5" fill="var(--text3)"/>
                <circle cx="12" cy="19" r="1.5" fill="var(--text3)"/>
              </svg>
            </button>
          </div>
        </header>
      )}

      {showMenu && (
        <>
          <div onClick={() => setShowMenu(false)} style={{ position:"fixed", inset:0, zIndex:40 }} />
          <div style={{ position:"absolute", top:60, right:16, zIndex:50, background:"var(--bg3)", border:"1px solid var(--border2)", borderRadius:12, overflow:"hidden", minWidth:170, boxShadow:"0 8px 24px rgba(0,0,0,0.4)" }}>
            <div style={{ padding:"0.75rem 1rem", borderBottom:"1px solid var(--border)" }}>
              <p style={{ fontSize:"0.65rem", color:"var(--text3)" }}>Signed in as</p>
              <p style={{ fontSize:"0.875rem", fontWeight:600, color:"var(--text)" }}>{user.name}</p>
            </div>
            <button onClick={() => { router.push("/settings"); setShowMenu(false); }}
              style={{ width:"100%", padding:"0.75rem 1rem", textAlign:"left", fontSize:"0.875rem", color:"var(--text2)", background:"none", border:"none", cursor:"pointer" }}>
              ⚙️ Settings
            </button>
            <button onClick={() => { setShowMenu(false); logout(); router.push("/login"); }}
              style={{ width:"100%", padding:"0.75rem 1rem", textAlign:"left", fontSize:"0.875rem", color:"var(--redlt)", background:"none", border:"none", cursor:"pointer" }}>
              Sign out
            </button>
          </div>
        </>
      )}

      <main style={{ paddingBottom:96, paddingLeft: noPad ? 0 : 16, paddingRight: noPad ? 0 : 16 }}>{children}</main>
      <BottomNav />
    </div>
  );
}
