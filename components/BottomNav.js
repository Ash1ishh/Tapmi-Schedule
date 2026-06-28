import Link from "next/link";
import { useRouter } from "next/router";

const tabs = [
  {
    href: "/today",
    label: "Today",
    icon: (active) => (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="17" rx="2" stroke={active ? "#60a5fa" : "#64748b"} strokeWidth="1.8"/>
        <path d="M3 9h18M8 2v4M16 2v4" stroke={active ? "#60a5fa" : "#64748b"} strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: "/schedule",
    label: "Schedule",
    icon: (active) => (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke={active ? "#60a5fa" : "#64748b"} strokeWidth="1.8"/>
        <rect x="9" y="3" width="6" height="4" rx="1" stroke={active ? "#60a5fa" : "#64748b"} strokeWidth="1.8"/>
        <path d="M9 12h6M9 16h4" stroke={active ? "#60a5fa" : "#64748b"} strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: "/attendance",
    label: "Attendance",
    icon: (active) => (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" stroke={active ? "#60a5fa" : "#64748b"} strokeWidth="1.8"/>
        <path d="M8 12l3 3 5-5" stroke={active ? "#60a5fa" : "#64748b"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    href: "/courses",
    label: "Courses",
    icon: (active) => (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
        <path d="M12 3L2 8l10 5 10-5-10-5z" stroke={active ? "#60a5fa" : "#64748b"} strokeWidth="1.8" strokeLinejoin="round"/>
        <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke={active ? "#60a5fa" : "#64748b"} strokeWidth="1.8" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

export default function BottomNav() {
  const router = useRouter();
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-950/95 backdrop-blur border-t border-slate-800 pb-safe z-50">
      <div className="flex max-w-lg mx-auto">
        {tabs.map((tab) => {
          const active = router.pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors ${
                active ? "text-blue-400" : "text-slate-500"
              }`}
            >
              {tab.icon(active)}
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
