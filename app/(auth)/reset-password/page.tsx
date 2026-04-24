"use client";
// app/(auth)/reset-password/page.tsx  — ADD THIS TO CARIMAIL
// The page the user lands on after clicking the email reset link

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2, Lock } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const strength = password.length === 0 ? 0
    : password.length < 8 ? 1
    : password.length < 12 ? 2
    : /[A-Z]/.test(password) && /[0-9]/.test(password) ? 4 : 3;
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColor = ["", "#EF4444", "#F59E0B", "#0044BC", "#10B981"];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

  if (!token) {
    return (
      <div className="animate-fade-up text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h1 className="text-[20px] font-[800]" style={{ color: "var(--cm-text)" }}>Invalid link</h1>
        <p className="mt-2 text-[13px]" style={{ color: "var(--cm-text2)" }}>
          This reset link is missing or malformed.
        </p>
        <Link href="/forgot-password" className="mt-5 inline-flex items-center gap-2 text-[13px] font-[700] hover:underline" style={{ color: "var(--cm-blue)" }}>
          Request a new link →
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="animate-fade-up text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h1 className="text-[20px] font-[800]" style={{ color: "var(--cm-text)" }}>Password reset!</h1>
        <p className="mt-2 text-[13px]" style={{ color: "var(--cm-text2)" }}>
          Redirecting you to sign in…
        </p>
      </div>
    );
  }

  const inputStyle = { borderColor: "var(--cm-input-border)", background: "var(--cm-input-bg)", color: "var(--cm-text)" };
  function onFocus(e: React.FocusEvent<HTMLInputElement>) { e.target.style.borderColor = "var(--cm-accent)"; e.target.style.boxShadow = "0 0 0 3px var(--cm-accent-dim)"; }
  function onBlur(e: React.FocusEvent<HTMLInputElement>) { e.target.style.borderColor = "var(--cm-input-border)"; e.target.style.boxShadow = "none"; }

  return (
    <div className="animate-fade-up">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: "var(--cm-accent-dim)", color: "var(--cm-accent)" }}>
        <Lock className="h-6 w-6" />
      </div>
      <h1 className="text-[22px] font-[800] tracking-tight" style={{ color: "var(--cm-text)" }}>Set new password</h1>
      <p className="mt-2 text-[13px] mb-6" style={{ color: "var(--cm-text2)" }}>
        Choose a strong password for your Carimail account.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[12.5px] text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />{error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="block text-[11.5px] font-[600]" style={{ color: "var(--cm-text2)" }}>New password</label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--cm-text3)" }} />
            <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
              required minLength={8} placeholder="8+ characters"
              className="w-full rounded-xl border py-3 pl-10 pr-11 text-[13px] outline-none transition"
              style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 transition" style={{ color: "var(--cm-text3)" }}>
              {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {password && (
            <div className="space-y-1.5">
              <div className="flex gap-1">
                {[1,2,3,4].map(i => <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300" style={{ background: i <= strength ? strengthColor[strength] : "var(--cm-border2)" }} />)}
              </div>
              <p className="text-[11px] font-[600]" style={{ color: strengthColor[strength] }}>{strengthLabel[strength]}</p>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="block text-[11.5px] font-[600]" style={{ color: "var(--cm-text2)" }}>Confirm password</label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--cm-text3)" }} />
            <input type={showPass ? "text" : "password"} value={confirm} onChange={e => setConfirm(e.target.value)}
              required placeholder="Repeat password"
              className="w-full rounded-xl border py-3 pl-10 pr-4 text-[13px] outline-none transition"
              style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
          </div>
          {confirm && password !== confirm && (
            <p className="text-[11px] text-red-500">Passwords don&apos;t match.</p>
          )}
        </div>

        <button type="submit" disabled={loading || password !== confirm || password.length < 8}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-[13.5px] font-[700] text-white transition disabled:opacity-55"
          style={{ background: "linear-gradient(135deg, var(--cm-accent), var(--cm-accent2))", boxShadow: "0 4px 14px var(--cm-accent-b)" }}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
          {loading ? "Resetting…" : "Reset password"}
        </button>
      </form>

      <Link href="/sign-in" className="mt-5 inline-flex items-center gap-1 text-[12.5px] font-[600] hover:underline" style={{ color: "var(--cm-blue)" }}>
        ← Back to sign in
      </Link>
    </div>
  );
}