"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, ArrowLeft, CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";

const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"];
const strengthColor = ["", "#EF4444", "#F59E0B", "#0044BC", "#10B981"];
const strengthWidth = ["0%", "25%", "50%", "75%", "100%"];

function PasswordInput({
  value, onChange, placeholder, autoComplete, required, minLength, show, toggleShow,
}: {
  value: string; onChange: (v: string) => void; placeholder: string;
  autoComplete?: string; required?: boolean; minLength?: number;
  show: boolean; toggleShow: () => void;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: focused ? "var(--cm-accent)" : "var(--cm-text3)", transition: "color 0.15s" }}>
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
      </span>
      <input
        type={show ? "text" : "password"} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} autoComplete={autoComplete} required={required} minLength={minLength}
        className="w-full rounded-2xl border py-3.5 pl-10 pr-11 text-[14px] outline-none transition-all duration-150"
        style={{
          borderColor: focused ? "var(--cm-accent)" : "var(--cm-border2)",
          background: focused ? "var(--cm-surface)" : "var(--cm-surface2)",
          color: "var(--cm-text)",
          boxShadow: focused ? "0 0 0 3px var(--cm-accent-dim)" : "none",
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      <button type="button" onClick={toggleShow}
        className="absolute right-3.5 top-1/2 -translate-y-1/2 transition"
        style={{ color: "var(--cm-text3)" }}>
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

export default function ResetPasswordClient() {
  const router      = useRouter();
  const params      = useSearchParams();
  const token       = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [done,     setDone]     = useState(false);

  const strength =
    password.length === 0 ? 0 :
    password.length < 8   ? 1 :
    password.length < 12  ? 2 :
    /[A-Z]/.test(password) && /[0-9]/.test(password) ? 4 : 3;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset", token, newPassword: password }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Reset failed.");
      setDone(true);
      setTimeout(() => router.push("/sign-in"), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed.");
    } finally {
      setLoading(false);
    }
  }

  /* ── No token ── */
  if (!token) {
    return (
      <div className="animate-fade-up text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl"
          style={{ background: "rgba(239,68,68,0.10)" }}>
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <h1 className="text-[24px] font-[900] tracking-tight" style={{ color: "var(--cm-text)" }}>Invalid link</h1>
        <p className="mt-2 text-[13.5px]" style={{ color: "var(--cm-text2)" }}>This reset link is missing or malformed.</p>
        <Link href="/forgot-password"
          className="mt-7 inline-flex items-center gap-2 rounded-2xl border px-5 py-2.5 text-[13.5px] font-[700] transition hover:-translate-y-0.5"
          style={{ borderColor: "var(--cm-border2)", background: "var(--cm-surface2)", color: "var(--cm-blue)" }}>
          Request a new link →
        </Link>
      </div>
    );
  }

  /* ── Success ── */
  if (done) {
    return (
      <div className="animate-fade-up text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl"
          style={{ background: "rgba(16,185,129,0.10)" }}>
          <CheckCircle2 className="h-8 w-8 text-emerald-500" />
        </div>
        <h1 className="text-[24px] font-[900] tracking-tight" style={{ color: "var(--cm-text)" }}>Password reset!</h1>
        <p className="mt-2 text-[13.5px]" style={{ color: "var(--cm-text2)" }}>Redirecting you to sign in…</p>
        <div className="mx-auto mt-5 h-1 w-48 overflow-hidden rounded-full" style={{ background: "var(--cm-border2)" }}>
          <div className="h-full rounded-full bg-emerald-500" style={{ animation: "progress 2.4s linear forwards" }} />
        </div>
        <style>{`@keyframes progress { from{width:0} to{width:100%} }`}</style>
      </div>
    );
  }

  /* ── Form ── */
  return (
    <div className="animate-fade-up">
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-3xl"
        style={{ background: "var(--cm-accent-dim)", color: "var(--cm-accent)" }}>
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
      </div>

      <h1 className="text-[26px] font-[900] tracking-tight" style={{ color: "var(--cm-text)" }}>
        Set new password
      </h1>
      <p className="mt-1.5 mb-7 text-[13.5px]" style={{ color: "var(--cm-text3)" }}>
        Choose a strong password for your Carimail account.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2.5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700 animate-fade-in">
            <AlertCircle className="h-4 w-4 shrink-0" />{error}
          </div>
        )}

        <div className="space-y-1">
          <label className="block text-[12px] font-[700]" style={{ color: "var(--cm-text2)" }}>New password</label>
          <PasswordInput value={password} onChange={setPassword} placeholder="8+ characters"
            autoComplete="new-password" required minLength={8}
            show={showPass} toggleShow={() => setShowPass(v => !v)} />
          {password && (
            <div className="mt-2 space-y-1">
              <div className="h-1 w-full overflow-hidden rounded-full" style={{ background: "var(--cm-border2)" }}>
                <div className="h-full rounded-full transition-all duration-400"
                  style={{ width: strengthWidth[strength], background: strengthColor[strength] }} />
              </div>
              <p className="text-[11.5px] font-[700]" style={{ color: strengthColor[strength] }}>{strengthLabel[strength]}</p>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <label className="block text-[12px] font-[700]" style={{ color: "var(--cm-text2)" }}>Confirm password</label>
          <PasswordInput value={confirm} onChange={setConfirm} placeholder="Repeat password"
            autoComplete="new-password" required
            show={showPass} toggleShow={() => setShowPass(v => !v)} />
          {confirm && password !== confirm && (
            <p className="mt-1 text-[12px] text-red-500">Passwords don&apos;t match.</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || password !== confirm || password.length < 8}
          className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl py-4 text-[14px] font-[800] text-white transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.99] disabled:opacity-55"
          style={{
            background: "linear-gradient(135deg, var(--cm-accent), var(--cm-accent2))",
            boxShadow: "0 8px 24px var(--cm-accent-b)",
          }}
        >
          <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {loading ? "Resetting…" : "Reset password"}
        </button>
      </form>

      <Link href="/sign-in"
        className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-[600] hover:underline"
        style={{ color: "var(--cm-text3)" }}>
        <ArrowLeft className="h-4 w-4" />Back to sign in
      </Link>
    </div>
  );
}
