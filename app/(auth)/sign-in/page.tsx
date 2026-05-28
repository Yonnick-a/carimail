"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";

const inputBase =
  "w-full rounded-2xl border bg-transparent py-3.5 text-[14px] outline-none transition-all duration-150";

function InputField({
  type = "text", value, onChange, placeholder, autoComplete, autoFocus, icon, right,
  onFocus, onBlur,
}: {
  type?: string; value: string; onChange: (v: string) => void; placeholder: string;
  autoComplete?: string; autoFocus?: boolean;
  icon?: React.ReactNode; right?: React.ReactNode;
  onFocus?: () => void; onBlur?: () => void;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="relative">
      {icon && (
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: focused ? "var(--cm-accent)" : "var(--cm-text3)", transition: "color 0.15s" }}>
          {icon}
        </span>
      )}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        className={`${inputBase} ${icon ? "pl-10" : "pl-4"} ${right ? "pr-11" : "pr-4"}`}
        style={{
          borderColor: focused ? "var(--cm-accent)" : "var(--cm-border2)",
          background: focused ? "var(--cm-surface)" : "var(--cm-surface2)",
          color: "var(--cm-text)",
          boxShadow: focused ? "0 0 0 3px var(--cm-accent-dim)" : "none",
        }}
        onFocus={() => { setFocused(true); onFocus?.(); }}
        onBlur={() => { setFocused(false); onBlur?.(); }}
      />
      {right && (
        <span className="absolute right-3.5 top-1/2 -translate-y-1/2">{right}</span>
      )}
    </div>
  );
}

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
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Sign in failed.");
      if (data.requiresTwoFactor) { router.push("/verify-2fa"); return; }
      router.push("/inbox"); router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
      setLoading(false);
    }
  }

  return (
    <div className="animate-fade-up">
      <h1 className="text-[26px] font-[900] tracking-tight" style={{ color: "var(--cm-text)" }}>
        Welcome back
        <span className="ml-2 animate-wave inline-block select-none" role="img" aria-label="wave">👋</span>
      </h1>
      <p className="mt-1.5 text-[13.5px]" style={{ color: "var(--cm-text3)" }}>
        Sign in to your Carimail inbox
      </p>

      {/* Google OAuth */}
      <a
        href="/api/auth/google"
        className="mt-7 flex w-full items-center justify-center gap-3 rounded-2xl border py-3.5 text-[14px] font-[700] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
        style={{ borderColor: "var(--cm-border2)", background: "var(--cm-surface2)", color: "var(--cm-text)" }}
      >
        {/* Google G */}
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </a>

      {/* Divider */}
      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1" style={{ background: "var(--cm-border)" }} />
        <span className="text-[12px]" style={{ color: "var(--cm-text3)" }}>or continue with email</span>
        <div className="h-px flex-1" style={{ background: "var(--cm-border)" }} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {error && (
          <div className="flex items-center gap-2.5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700 animate-fade-in">
            <AlertCircle className="h-4 w-4 shrink-0" />{error}
          </div>
        )}

        <div className="space-y-1">
          <label className="block text-[12px] font-[700]" style={{ color: "var(--cm-text2)" }}>Email address</label>
          <InputField
            type="email" value={email} onChange={setEmail}
            placeholder="you@example.com" autoComplete="email" autoFocus
            icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>}
          />
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="block text-[12px] font-[700]" style={{ color: "var(--cm-text2)" }}>Password</label>
            <Link href="/forgot-password" className="text-[12px] font-[700] hover:underline" style={{ color: "var(--cm-blue)" }}>
              Forgot password?
            </Link>
          </div>
          <InputField
            type={showPass ? "text" : "password"} value={password} onChange={setPassword}
            placeholder="••••••••" autoComplete="current-password"
            icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>}
            right={
              <button type="button" onClick={() => setShowPass(v => !v)} style={{ color: "var(--cm-text3)" }}>
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="group relative mt-2 inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl py-4 text-[14px] font-[800] text-white transition-all duration-200 active:scale-[0.99] disabled:opacity-60 hover:-translate-y-0.5"
          style={{ background: "#0F172A", boxShadow: "0 4px 20px rgba(0,0,0,0.20)" }}
        >
          <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/8 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-[13px]" style={{ color: "var(--cm-text2)" }}>
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="font-[800] hover:underline" style={{ color: "var(--cm-blue)" }}>Create one</Link>
      </p>
    </div>
  );
}
