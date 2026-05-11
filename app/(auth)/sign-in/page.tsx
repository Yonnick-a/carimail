"use client";
// app/(auth)/sign-in/page.tsx
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Sign in failed.");
      router.push("/inbox"); router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
      setLoading(false);
    }
  }

  return (
    <div className="animate-fade-up">
      <div className="flex items-center gap-2.5 mb-1">
        <h1 className="text-[22px] font-[800] tracking-tight" style={{ color: "var(--cm-text)" }}>Welcome back</h1>
        <span className="text-[22px] select-none" style={{ animation: "wave 2.4s ease-in-out infinite" }} role="img" aria-label="wave">👋</span>
      </div>
      <p className="text-[13px] mb-7" style={{ color: "var(--cm-text2)" }}>Sign in to your Carimail inbox</p>

      <a href="/api/auth/google"
        className="mb-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-[13.5px] font-[800] transition hover:-translate-y-0.5"
        style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)", color: "var(--cm-text)" }}>
        <span className="flex h-5 w-5 items-center justify-center rounded-full border text-[11px] font-[900]" style={{ borderColor: "var(--cm-border)", color: "var(--cm-blue)" }}>G</span>
        Continue with Google
      </a>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[12.5px] text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />{error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="block text-[11.5px] font-[600]" style={{ color: "var(--cm-text2)" }}>Email address</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--cm-text3)" }} />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" required autoComplete="email" autoFocus
              className="w-full rounded-xl border py-3 pl-10 pr-4 text-[13px] outline-none transition"
              style={{
                borderColor: "var(--cm-input-border)", background: "var(--cm-input-bg)", color: "var(--cm-text)",
              }}
              onFocus={e => { e.target.style.borderColor = "var(--cm-accent)"; e.target.style.background = "var(--cm-surface)"; e.target.style.boxShadow = "0 0 0 3px var(--cm-accent-dim)"; }}
              onBlur={e => { e.target.style.borderColor = "var(--cm-input-border)"; e.target.style.background = "var(--cm-input-bg)"; e.target.style.boxShadow = "none"; }}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-[11.5px] font-[600]" style={{ color: "var(--cm-text2)" }}>Password</label>
            <Link href="/forgot-password" className="text-[11.5px] font-[600] hover:underline" style={{ color: "var(--cm-blue)" }}>
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--cm-text3)" }} />
            <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" required autoComplete="current-password"
              className="w-full rounded-xl border py-3 pl-10 pr-11 text-[13px] outline-none transition"
              style={{ borderColor: "var(--cm-input-border)", background: "var(--cm-input-bg)", color: "var(--cm-text)" }}
              onFocus={e => { e.target.style.borderColor = "var(--cm-accent)"; e.target.style.background = "var(--cm-surface)"; e.target.style.boxShadow = "0 0 0 3px var(--cm-accent-dim)"; }}
              onBlur={e => { e.target.style.borderColor = "var(--cm-input-border)"; e.target.style.background = "var(--cm-input-bg)"; e.target.style.boxShadow = "none"; }}
            />
            <button type="button" onClick={() => setShowPass(v => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 transition"
              style={{ color: "var(--cm-text3)" }}>
              {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="group relative mt-2 inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl py-3.5 text-[13.5px] font-[700] text-white transition active:scale-[0.99] disabled:opacity-60"
          style={{ background: "var(--cm-text)", boxShadow: "0 4px 14px rgba(0,0,0,0.18)" }}>
          <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/8 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      {/* Divider */}
      <div className="my-6 flex items-center gap-3">
        <div className="flex-1 h-px" style={{ background: "var(--cm-border)" }} />
        <span className="text-[11px]" style={{ color: "var(--cm-text3)" }}>or</span>
        <div className="flex-1 h-px" style={{ background: "var(--cm-border)" }} />
      </div>

      {/* Feature pills */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {["Any IMAP provider", "End-to-end encrypted storage", "Free to start"].map(feat => (
          <span key={feat} className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10.5px] font-[600]"
            style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface2)", color: "var(--cm-text3)" }}>
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--cm-accent)" }} />{feat}
          </span>
        ))}
      </div>

      <p className="text-center text-[12.5px]" style={{ color: "var(--cm-text2)" }}>
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="font-[700] hover:underline" style={{ color: "var(--cm-blue)" }}>Create one</Link>
      </p>

      <style>{`
        @keyframes wave {
          0%,100%{ transform: rotate(0deg) } 10%{ transform: rotate(14deg) }
          20%{ transform: rotate(-8deg) } 30%{ transform: rotate(14deg) }
          40%{ transform: rotate(-4deg) } 50%{ transform: rotate(10deg) }
          60%{ transform: rotate(0deg) }
        }
      `}</style>
    </div>
  );
}
