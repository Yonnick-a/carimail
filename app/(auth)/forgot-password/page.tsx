"use client";
// app/(auth)/forgot-password/page.tsx  — REPLACE existing page in CARIMAIL
// Now actually calls the reset-password API instead of faking it

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Loader2, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "request", email }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Failed.");
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="animate-fade-up text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h1 className="text-[20px] font-[800] tracking-tight" style={{ color: "var(--cm-text)" }}>Check your inbox</h1>
        <p className="mt-3 text-[13px] leading-relaxed" style={{ color: "var(--cm-text2)" }}>
          If an account exists for <strong>{email}</strong>, we&apos;ve sent a reset link. It expires in 1 hour.
        </p>
        <p className="mt-3 text-[11.5px]" style={{ color: "var(--cm-text3)" }}>
          No email? Check your spam folder or contact{" "}
          <a href="mailto:support@hostcari.com" className="underline" style={{ color: "var(--cm-blue)" }}>support@hostcari.com</a>.
        </p>
        <Link href="/sign-in" className="mt-6 inline-flex items-center gap-2 text-[13px] font-[700] hover:underline" style={{ color: "var(--cm-blue)" }}>
          <ArrowLeft className="h-4 w-4" />Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl"
        style={{ background: "var(--cm-blue-light)", color: "var(--cm-blue)" }}>
        <Mail className="h-6 w-6" />
      </div>
      <h1 className="text-[22px] font-[800] tracking-tight" style={{ color: "var(--cm-text)" }}>Reset your password</h1>
      <p className="mt-2 text-[13px] leading-relaxed mb-6" style={{ color: "var(--cm-text2)" }}>
        Enter your email and we&apos;ll send a reset link that expires in 1 hour.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[12.5px] text-red-700">
            {error}
          </div>
        )}
        <div className="space-y-1.5">
          <label className="block text-[11.5px] font-[600]" style={{ color: "var(--cm-text2)" }}>Email address</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--cm-text3)" }} />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              required autoFocus placeholder="you@example.com"
              className="w-full rounded-xl border py-3 pl-10 pr-4 text-[13px] outline-none transition"
              style={{ borderColor: "var(--cm-input-border)", background: "var(--cm-input-bg)", color: "var(--cm-text)" }}
              onFocus={e => { e.target.style.borderColor = "var(--cm-accent)"; e.target.style.boxShadow = "0 0 0 3px var(--cm-accent-dim)"; }}
              onBlur={e => { e.target.style.borderColor = "var(--cm-input-border)"; e.target.style.boxShadow = "none"; }}
            />
          </div>
        </div>
        <button type="submit" disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-[13.5px] font-[700] text-white transition disabled:opacity-60"
          style={{ background: "var(--cm-blue)", boxShadow: "0 4px 14px rgba(0,68,188,0.28)" }}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {loading ? "Sending…" : "Send reset link"}
        </button>
      </form>

      <Link href="/sign-in" className="mt-5 inline-flex items-center gap-2 text-[13px] font-[600] hover:underline" style={{ color: "var(--cm-blue)" }}>
        <ArrowLeft className="h-4 w-4" />Back to sign in
      </Link>
    </div>
  );
}