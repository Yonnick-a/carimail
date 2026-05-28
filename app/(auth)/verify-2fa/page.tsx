"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, Shield } from "lucide-react";

export default function VerifyTwoFactorPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [useBackup, setUseBackup] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/auth/2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "challenge", code: code.trim() }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Verification failed.");
      router.push("/inbox"); router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed.");
      setLoading(false);
      setCode("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }

  // Auto-submit when 6 digits entered (TOTP mode)
  function handleCodeChange(value: string) {
    const clean = value.replace(/\D/g, "").slice(0, 6);
    setCode(clean);
    if (!useBackup && clean.length === 6) {
      setTimeout(() => {
        const form = inputRef.current?.closest("form");
        if (form) form.requestSubmit();
      }, 80);
    }
  }

  const fieldStyle = {
    borderColor: "var(--cm-input-border)",
    background: "var(--cm-input-bg)",
    color: "var(--cm-text)",
  };

  return (
    <div className="animate-fade-up">
      {/* Icon */}
      <div className="mb-5 flex justify-center">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{ background: "var(--cm-blue-light)", color: "var(--cm-blue)" }}
        >
          <Shield className="h-7 w-7" />
        </div>
      </div>

      <h1 className="text-center text-[22px] font-[900] tracking-tight" style={{ color: "var(--cm-text)" }}>
        Two-factor verification
      </h1>
      <p className="mt-2 text-center text-[13px]" style={{ color: "var(--cm-text2)" }}>
        {useBackup
          ? "Enter one of your 8-character backup codes."
          : "Enter the 6-digit code from your authenticator app."}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error && (
          <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[12.5px] text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />{error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="block text-[11.5px] font-[600]" style={{ color: "var(--cm-text2)" }}>
            {useBackup ? "Backup code" : "Authenticator code"}
          </label>
          {useBackup ? (
            <input
              ref={inputRef}
              type="text"
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="XXXX-XXXX"
              autoComplete="one-time-code"
              autoFocus
              required
              className="w-full rounded-xl border py-3.5 text-center text-[20px] font-mono font-[700] tracking-widest outline-none transition"
              style={fieldStyle}
              onFocus={e => { e.target.style.borderColor = "var(--cm-accent)"; e.target.style.boxShadow = "0 0 0 3px var(--cm-accent-dim)"; }}
              onBlur={e => { e.target.style.borderColor = "var(--cm-input-border)"; e.target.style.boxShadow = "none"; }}
            />
          ) : (
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              pattern="\d{6}"
              value={code}
              onChange={e => handleCodeChange(e.target.value)}
              placeholder="000 000"
              autoComplete="one-time-code"
              autoFocus
              required
              maxLength={6}
              className="w-full rounded-xl border py-3.5 text-center text-[28px] font-mono font-[700] tracking-[0.3em] outline-none transition"
              style={fieldStyle}
              onFocus={e => { e.target.style.borderColor = "var(--cm-accent)"; e.target.style.boxShadow = "0 0 0 3px var(--cm-accent-dim)"; }}
              onBlur={e => { e.target.style.borderColor = "var(--cm-input-border)"; e.target.style.boxShadow = "none"; }}
            />
          )}
        </div>

        <button
          type="submit"
          disabled={loading || (!useBackup && code.length < 6) || (useBackup && code.length < 8)}
          className="group relative mt-1 inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl py-3.5 text-[13.5px] font-[700] text-white transition active:scale-[0.99] disabled:opacity-50"
          style={{ background: "var(--cm-blue)", boxShadow: "0 4px 14px rgba(0,68,188,0.22)" }}
        >
          <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
          {loading ? "Verifying…" : "Verify"}
        </button>
      </form>

      <div className="mt-5 space-y-2 text-center">
        <button
          type="button"
          onClick={() => { setUseBackup(v => !v); setCode(""); setError(""); setTimeout(() => inputRef.current?.focus(), 50); }}
          className="text-[12.5px] font-[600] hover:underline"
          style={{ color: "var(--cm-blue)" }}
        >
          {useBackup ? "Use authenticator app instead" : "Use a backup code instead"}
        </button>
        <div />
        <Link
          href="/sign-in"
          className="text-[12px] hover:underline"
          style={{ color: "var(--cm-text3)" }}
        >
          ← Back to sign in
        </Link>
      </div>
    </div>
  );
}
