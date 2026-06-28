import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "./_app";

const CORRECT_CODE = process.env.NEXT_PUBLIC_BATCH_CODE || "MBAIB26";

export default function Login() {
  const { login, user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState("code"); // code | name
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  if (user) {
    router.push("/today");
    return null;
  }

  const verifyCode = () => {
    if (code.trim().toUpperCase() === CORRECT_CODE.toUpperCase()) {
      setStep("name");
      setError("");
    } else {
      setError("Wrong code. Ask your batchmate.");
    }
  };

  const complete = () => {
    if (!name.trim()) { setError("Enter your name."); return; }
    login({ name: name.trim(), joinedAt: Date.now() });
    router.push("/today");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-6">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2.5 mb-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="17" rx="2" stroke="white" strokeWidth="2"/>
              <path d="M3 9h18M8 2v4M16 2v4" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-xl font-semibold text-slate-100 tracking-tight">TAPMI Schedule</span>
        </div>
        <p className="text-sm text-slate-500">MBA-IB · Batch 2026–28 · Term 1</p>
        <p className="text-xs text-slate-700 mt-1">Not an official TAPMI app</p>
      </div>

      <div className="w-full max-w-sm">
        {step === "code" && (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 mb-2 block uppercase tracking-wider">Batch passcode</label>
              <input
                type="text"
                value={code}
                onChange={(e) => { setCode(e.target.value); setError(""); }}
                placeholder="Enter passcode"
                autoCapitalize="characters"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors font-mono tracking-widest text-center text-base uppercase"
                onKeyDown={(e) => e.key === "Enter" && verifyCode()}
              />
            </div>
            {error && <p className="text-xs text-red-400 text-center">{error}</p>}
            <button
              onClick={verifyCode}
              disabled={!code.trim()}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-medium py-3.5 rounded-xl text-sm transition-colors"
            >
              Continue →
            </button>
            <p className="text-xs text-slate-600 text-center">Shared with your batch on WhatsApp</p>
          </div>
        )}

        {step === "name" && (
          <div className="space-y-4">
            <div className="text-center mb-2">
              <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-900 px-3 py-1 rounded-full">✓ Batch verified</span>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-2 block uppercase tracking-wider">Your name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(""); }}
                placeholder="e.g. Rohan Shetty"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                onKeyDown={(e) => e.key === "Enter" && complete()}
                autoFocus
              />
            </div>
            {error && <p className="text-xs text-red-400 text-center">{error}</p>}
            <button
              onClick={complete}
              disabled={!name.trim()}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-medium py-3.5 rounded-xl text-sm transition-colors"
            >
              Open schedule →
            </button>
          </div>
        )}
      </div>

      {/* Install prompt hint */}
      <p className="mt-12 text-[11px] text-slate-700 text-center max-w-xs leading-relaxed">
        Tip: Add to home screen for the best experience — tap your browser's share icon → "Add to Home Screen"
      </p>
    </div>
  );
}
