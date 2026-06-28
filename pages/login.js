import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "./_app";

const CORRECT_CODE = process.env.NEXT_PUBLIC_BATCH_CODE || "MBAIB26";

export default function Login() {
  const { login, user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState("code");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  if (user) { router.push("/today"); return null; }

  const verifyCode = () => {
    if (code.trim().toUpperCase() === CORRECT_CODE.toUpperCase()) {
      setStep("name"); setError("");
    } else {
      setError("Wrong passcode. Ask your batchmate.");
    }
  };
  const complete = () => {
    if (!name.trim()) { setError("Enter your name."); return; }
    login({ name: name.trim() });
    router.push("/today");
  };

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"0 1.5rem" }}>
      {/* Logo area */}
      <div style={{ marginBottom:"2.5rem", textAlign:"center" }}>
        {/* Hourglass + pulse logo in gold/red */}
        <div style={{ marginBottom:"1rem", display:"flex", justifyContent:"center" }}>
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            {/* Hourglass */}
            <rect x="14" y="6" width="36" height="4" rx="2" fill="var(--gold)"/>
            <rect x="14" y="54" width="36" height="4" rx="2" fill="var(--gold)"/>
            <path d="M18 10 L32 30 L46 10 Z" fill="var(--gold)" opacity="0.8"/>
            <path d="M18 54 L32 34 L46 54 Z" fill="var(--gold)" opacity="0.6"/>
            {/* Pulse line */}
            <path d="M8 32 L16 32 L20 24 L24 38 L28 28 L32 34 L36 32 L56 32" stroke="var(--red)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
        </div>
        <h1 style={{ fontSize:"1.6rem", fontWeight:800, color:"var(--gold)", letterSpacing:"-0.02em", marginBottom:"0.25rem" }}>T-MINUS</h1>
        <p style={{ fontSize:"0.8rem", fontWeight:600, color:"var(--text2)", letterSpacing:"0.12em" }}>TAPMI STUDENT SCHEDULER</p>
        <p style={{ fontSize:"0.7rem", color:"var(--text3)", marginTop:"0.5rem" }}>MBA-IB · Batch 2026–28 · Term 1</p>
        <p style={{ fontSize:"0.65rem", color:"var(--text3)", marginTop:"0.2rem", opacity:0.6 }}>Not an official TAPMI app</p>
      </div>

      <div style={{ width:"100%", maxWidth:340 }}>
        {step === "code" && (
          <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
            <div>
              <label style={{ fontSize:"0.65rem", color:"var(--text3)", textTransform:"uppercase", letterSpacing:"0.1em", display:"block", marginBottom:"0.5rem" }}>Batch Passcode</label>
              <input className="input" type="text" value={code}
                onChange={e => { setCode(e.target.value); setError(""); }}
                placeholder="Enter passcode"
                autoCapitalize="characters"
                style={{ textAlign:"center", letterSpacing:"0.2em", textTransform:"uppercase", fontFamily:"monospace", fontSize:"1rem" }}
                onKeyDown={e => e.key === "Enter" && verifyCode()}
              />
            </div>
            {error && <p style={{ fontSize:"0.75rem", color:"var(--redlt)", textAlign:"center" }}>{error}</p>}
            <button className="btn-primary" onClick={verifyCode} disabled={!code.trim()} style={{ width:"100%" }}>
              Continue →
            </button>
            <p style={{ fontSize:"0.7rem", color:"var(--text3)", textAlign:"center" }}>Shared with your batch on WhatsApp</p>
          </div>
        )}

        {step === "name" && (
          <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
            <div style={{ textAlign:"center", marginBottom:"0.5rem" }}>
              <span style={{ fontSize:"0.7rem", background:"rgba(26,107,60,0.2)", color:"var(--greenlt)", border:"1px solid rgba(39,174,96,0.3)", padding:"0.25rem 0.75rem", borderRadius:999 }}>✓ Batch verified</span>
            </div>
            <div>
              <label style={{ fontSize:"0.65rem", color:"var(--text3)", textTransform:"uppercase", letterSpacing:"0.1em", display:"block", marginBottom:"0.5rem" }}>Your Name</label>
              <input className="input" type="text" value={name}
                onChange={e => { setName(e.target.value); setError(""); }}
                placeholder="e.g. Rohan Shetty"
                autoFocus
                onKeyDown={e => e.key === "Enter" && complete()}
              />
            </div>
            {error && <p style={{ fontSize:"0.75rem", color:"var(--redlt)", textAlign:"center" }}>{error}</p>}
            <button className="btn-primary" onClick={complete} disabled={!name.trim()} style={{ width:"100%" }}>
              Open Scheduler →
            </button>
          </div>
        )}
      </div>

      <p style={{ marginTop:"3rem", fontSize:"0.65rem", color:"var(--text3)", textAlign:"center", maxWidth:280, lineHeight:1.6 }}>
        💡 Add to home screen for offline access — tap Share → "Add to Home Screen"
      </p>
    </div>
  );
}
