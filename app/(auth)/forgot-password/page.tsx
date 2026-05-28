"use client";
import { useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState("");
  const [sent, setSent]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [focused, setFocused] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
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
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl"
          style={{ background: "rgba(16,185,129,0.10)" }}>
          <CheckCircle2 className="h-8 w-8 text-emerald-500" />
        </div>
        <h1 className="text-[24px] font-[900] tracking-tight" style={{ color: "var(--cm-text)" }}>
          Check your inbox
        </h1>
        <p className="mx-auto mt-3 max-w-xs text-[13.5px] leading-relaxed" style={{ color: "var(--cm-text2)" }}>
          If an account exists for <span className="font-[700]">{email}</span>, we&apos;ve sent a reset link.
          It expires in 1 hour.
        </p>
        <p className="mt-3 text-[12px]" style={{ color: "var(--cm-text3)" }}>
          No email? Check spam or{" "}
          <a href="mailto:support@hostcari.com" className="underline" style={{ color: "var(--cm-blue)" }}>
            contact support
          </a>.
        </p>
        <Link
          href="/sign-in"
          className="mt-8 inline-flex items-center gap-2 rounded-2xl border px-5 py-2.5 text-[13.5px] font-[700] transition hover:-translate-y-0.5"
          style={{ borderColor: "var(--cm-border2)", background: "var(--cm-surface2)", color: "var(--cm-text2)" }}
        >
          <ArrowLeft className="h-4 w-4" />Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      {/* Icon */}
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-3xl"
        style={{ background: "var(--cm-blue-light)", color: "var(--cm-blue)" }}>
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
        </svg>
      </div>

      <h1 className="text-[26px] font-[900] tracking-tight" style={{ color: "var(--cm-text)" }}>
        Reset your password
      </h1>
      <p className="mt-1.5 mb-7 text-[13.5px] leading-relaxed" style={{ color: "var(--cm-text3)" }}>
        Enter your email and we&apos;ll send a link that expires in 1 hour.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2.5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700 animate-fade-in">
            <AlertCircle className="h-4 w-4 shrink-0" />{error}
          </div>
        )}

        <div className="space-y-1">
          <label className="block text-[12px] font-[700]" style={{ color: "var(--cm-text2)" }}>
            Email address
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: focused ? "var(--cm-accent)" : "var(--cm-text3)", transition: "color 0.15s" }}>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
            </span>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              required autoFocus placeholder="you@example.com" autoComplete="email"
              className="w-full rounded-2xl border py-3.5 pl-10 pr-4 text-[14px] outline-none transition-all duration-150"
              style={{
                borderColor: focused ? "var(--cm-accent)" : "var(--cm-border2)",
                background: focused ? "var(--cm-surface)" : "var(--cm-surface2)",
                color: "var(--cm-text)",
                boxShadow: focused ? "0 0 0 3px var(--cm-accent-dim)" : "none",
              }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl py-4 text-[14px] font-[800] text-white transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.99] disabled:opacity-60"
          style={{ background: "var(--cm-blue)", boxShadow: "0 8px 24px rgba(0,68,188,0.28)" }}
        >
          <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {loading ? "Sending…" : "Send reset link"}
        </button>
      </form>

      <Link
        href="/sign-in"
        className="mt-6 inline-flex items-center gap-2 text-[13px] font-[600] hover:underline"
        style={{ color: "var(--cm-text3)" }}
      >
        <ArrowLeft className="h-4 w-4" />Back to sign in
      </Link>
    </div>
  );
}
