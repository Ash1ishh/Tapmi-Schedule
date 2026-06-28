import Link from "next/link";
import { useRouter } from "next/router";

const tabs = [
  { href: "/today",      label: "Today",      emoji: "🏠" },
  { href: "/schedule",   label: "Schedule",   emoji: "📅" },
  { href: "/attendance", label: "Attendance", emoji: "✅" },
  { href: "/courses",    label: "Courses",    emoji: "📚" },
  { href: "/settings",   label: "Settings",   emoji: "⚙️" },
];

export default function BottomNav() {
  const router = useRouter();
  return (
    <nav style={{
      position:"fixed", bottom:0, left:0, right:0,
      background:"var(--bg2)", borderTop:"1px solid var(--border)",
      paddingBottom:"env(safe-area-inset-bottom, 12px)", zIndex:50
    }}>
      <div style={{ display:"flex", maxWidth:480, margin:"0 auto" }}>
        {tabs.map((tab) => {
          const active = router.pathname === tab.href;
          return (
            <Link key={tab.href} href={tab.href}
              style={{
                flex:1, display:"flex", flexDirection:"column", alignItems:"center",
                gap:2, padding:"10px 0 6px",
                fontSize:"0.6rem", fontWeight: active ? 700 : 500,
                color: active ? "var(--gold)" : "var(--text3)",
                textDecoration:"none", transition:"color 0.15s",
                borderTop: active ? "2px solid var(--gold)" : "2px solid transparent",
              }}>
              <span style={{ fontSize:18 }}>{tab.emoji}</span>
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
