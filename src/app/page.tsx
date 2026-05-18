"use client";

import { useState, useCallback, useEffect } from "react";
import { Copy, Check, RefreshCw, Shield, Key } from "lucide-react";

const CHARS = {
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
};

function generate(length: number, opts: Record<string, boolean>): string {
  const pool = Object.entries(CHARS)
    .filter(([k]) => opts[k])
    .map(([, v]) => v)
    .join("");
  if (!pool) return "";
  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  return Array.from(arr, (n) => pool[n % pool.length]).join("");
}

function strength(pw: string): { label: string; color: string; pct: number } {
  let s = 0;
  if (pw.length >= 12) s++;
  if (pw.length >= 20) s++;
  if (/[a-z]/.test(pw)) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^a-zA-Z0-9]/.test(pw)) s++;
  const map: Record<number, { label: string; color: string }> = {
    0: { label: "Very Weak", color: "bg-red-500" },
    1: { label: "Weak", color: "bg-orange-500" },
    2: { label: "Fair", color: "bg-yellow-500" },
    3: { label: "Good", color: "bg-lime-500" },
    4: { label: "Strong", color: "bg-emerald-500" },
    5: { label: "Very Strong", color: "bg-green-600" },
    6: { label: "Excellent", color: "bg-green-700" },
  };
  return { ...(map[Math.min(s, 6)] || map[0]), pct: (s / 6) * 100 };
}

export default function HomePage() {
  const [length, setLength] = useState(20);
  const [opts, setOpts] = useState({ lowercase: true, uppercase: true, numbers: true, symbols: true });
  const [passwords, setPasswords] = useState<string[]>([]);
  const [copied, setCopied] = useState<number | null>(null);

  const regenerate = useCallback(() => {
    setPasswords(Array.from({ length: 5 }, () => generate(length, opts)));
  }, [length, opts]);

  useEffect(() => { regenerate(); }, [regenerate]);

  const toggle = (k: string) => setOpts((o) => ({ ...o, [k]: !o[k] }));

  const activeCount = Object.values(opts).filter(Boolean).length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <header className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm mb-4">
          <Shield className="w-4 h-4" /> Cryptographically Secure
        </div>
        <h1 className="text-4xl font-bold mb-2">Password Generator</h1>
        <p className="text-zinc-500">Generate strong, random passwords. All processing in your browser.</p>
      </header>

      {/* Settings */}
      <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6 mb-8">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-sm font-medium w-20">Length</span>
          <input type="range" min={4} max={64} value={length} onChange={(e) => setLength(+e.target.value)} className="flex-1 accent-emerald-600" />
          <span className="text-sm font-bold w-8 text-right">{length}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(CHARS).map(([k]) => (
            <button key={k} onClick={() => toggle(k)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition border ${opts[k] ? "bg-emerald-50 border-emerald-300 text-emerald-800" : "bg-white border-zinc-200 text-zinc-400"}`}
            >
              {k.charAt(0).toUpperCase() + k.slice(1)}
            </button>
          ))}
        </div>
        {activeCount < 2 && <p className="text-xs text-red-500 mt-2">Select at least 2 character types for strong passwords</p>}
      </div>

      {/* Passwords */}
      <div className="space-y-3 mb-8">
        {passwords.map((pw, i) => {
          const st = strength(pw);
          return (
            <div key={i} className="border border-zinc-200 rounded-xl p-4 hover:border-emerald-200 transition group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-zinc-400" />
                  <span className="font-mono text-lg tracking-wide select-all">{pw || "Generating..."}</span>
                </div>
                <button
                  onClick={() => { navigator.clipboard.writeText(pw); setCopied(i); setTimeout(() => setCopied(null), 2000); }}
                  className="flex items-center gap-1.5 bg-zinc-900 text-white rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-zinc-800 transition opacity-0 group-hover:opacity-100"
                >
                  {copied === i ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied === i ? "Copied!" : "Copy"}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                  <div className={`h-full ${st.color} rounded-full transition-all`} style={{ width: `${st.pct}%` }} />
                </div>
                <span className="text-xs text-zinc-400">{st.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center">
        <button onClick={regenerate} className="inline-flex items-center gap-2 bg-zinc-900 text-white rounded-xl px-6 py-3 font-semibold hover:bg-zinc-800 transition">
          <RefreshCw className="w-5 h-5" /> Generate New
        </button>
      </div>

      <footer className="text-center mt-16 text-xs text-zinc-400 space-y-1">
        <p>Passwords are generated in your browser using crypto.getRandomValues(). Never transmitted anywhere.</p>
      </footer>
    </div>
  );
}
