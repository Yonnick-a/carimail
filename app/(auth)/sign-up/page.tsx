"use client";
// app/(auth)/sign-up/page.tsx
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Eye, EyeOff, Loader2, Lock, Mail, Sparkles, User } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Sign up failed.");
      router.push("/inbox"); router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed.");
      setLoading(false);
    }
  }

  const strength = password.length === 0 ? 0
    : password.length < 8 ? 1
    : password.length < 12 ? 2
    : /[A-Z]/.test(password) && /[0-9]/.test(password) ? 4 : 3;
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColor = ["", "#EF4444", "#F59E0B", "#0044BC", "#10B981"];

  const fieldStyle = {
    borderColor: "var(--cm-input-border)",
    background: "var(--cm-input-bg)",
    color: "var(--cm-text)",
  };
  function onFocus(e: React.FocusEvent<HTMLInputElement>) {
    e.target.style.borderColor = "var(--cm-accent)";
    e.target.style.background = "var(--cm-surface)";
    e.target.style.boxShadow = "0 0 0 3px var(--cm-accent-dim)";
  }
  function onBlur(e: React.FocusEvent<HTMLInputElement>) {
    e.target.style.borderColor = "var(--cm-input-border)";
    e.target.style.background = "var(--cm-input-bg)";
    e.target.style.boxShadow = "none";
  }

  return (
    <div className="animate-fade-up">
      <div className="flex items-center gap-2.5 mb-1">
        <h1 className="text-[22px] font-[800] tracking-tight" style={{ color: "var(--cm-text)" }}>Create account</h1>
        <span className="animate-spark text-[20px] select-none" role="img" aria-label="sparkles">✨</span>
      </div>
      <p className="text-[13px] mb-5" style={{ color: "var(--cm-text2)" }}>Get started with Carimail for free</p>

      {/* Feature pills */}
      <div className="flex flex-wrap gap-1.5 mb-6">
        {["Any IMAP provider", "Encrypted storage", "Free to start"].map(feat => (
          <span key={feat} className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10.5px] font-[600]"
            style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface2)", color: "var(--cm-text3)" }}>
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--cm-blue)" }} />{feat}
          </span>
        ))}
      </div>

      {/* Hostcari client callout */}
      <div className="mb-5 flex items-start gap-3 rounded-xl border px-3.5 py-3"
        style={{ borderColor: "var(--cm-accent-b)", background: "var(--cm-accent-dim)" }}>
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--cm-accent)" }} />
        <div>
          <p className="text-[11.5px] font-[700]" style={{ color: "var(--cm-accent)" }}>Hostcari client?</p>
          <p className="text-[11px] leading-relaxed mt-0.5" style={{ color: "var(--cm-text2)" }}>
            Sign up with your Hostcari mailbox address to unlock your client badge and priority features.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[12.5px] text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />{error}
          </div>
        )}

        {/* Name */}
        <div className="space-y-1.5">
          <label className="block text-[11.5px] font-[600]" style={{ color: "var(--cm-text2)" }}>Full name</label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--cm-text3)" }} />
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="Alex Johnson" required autoComplete="name" autoFocus
              className="w-full rounded-xl border py-3 pl-10 pr-4 text-[13px] outline-none transition"
              style={fieldStyle} onFocus={onFocus} onBlur={onBlur} />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="block text-[11.5px] font-[600]" style={{ color: "var(--cm-text2)" }}>Email address</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--cm-text3)" }} />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" required autoComplete="email"
              className="w-full rounded-xl border py-3 pl-10 pr-4 text-[13px] outline-none transition"
              style={fieldStyle} onFocus={onFocus} onBlur={onBlur} />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="block text-[11.5px] font-[600]" style={{ color: "var(--cm-text2)" }}>Password</label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--cm-text3)" }} />
            <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
              placeholder="8+ characters" required autoComplete="new-password" minLength={8}
              className="w-full rounded-xl border py-3 pl-10 pr-11 text-[13px] outline-none transition"
              style={fieldStyle} onFocus={onFocus} onBlur={onBlur} />
            <button type="button" onClick={() => setShowPass(v => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 transition" style={{ color: "var(--cm-text3)" }}>
              {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {password && (
            <div className="space-y-1.5">
              <div className="flex gap-1">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
                    style={{ background: i <= strength ? strengthColor[strength] : "var(--cm-border2)" }} />
                ))}
              </div>
              <p className="text-[11px] font-[600]" style={{ color: strengthColor[strength] }}>
                {strengthLabel[strength]}
              </p>
            </div>
          )}
        </div>

        <button type="submit" disabled={loading}
          className="group relative mt-2 inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl py-3.5 text-[13.5px] font-[700] text-white transition active:scale-[0.99] disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, var(--cm-accent), var(--cm-accent2))", boxShadow: "0 8px 24px var(--cm-accent-b)" }}>
          <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-4 text-center text-[10.5px]" style={{ color: "var(--cm-text3)" }}>
        By signing up you agree to our{" "}
        <Link href="/terms" className="hover:underline" style={{ color: "var(--cm-text2)" }}>Terms</Link>
        {" "}&{" "}
        <Link href="/privacy" className="hover:underline" style={{ color: "var(--cm-text2)" }}>Privacy Policy</Link>.
      </p>

      <p className="mt-5 text-center text-[12.5px]" style={{ color: "var(--cm-text2)" }}>
        Already have an account?{" "}
        <Link href="/sign-in" className="font-[700] hover:underline" style={{ color: "var(--cm-blue)" }}>Sign in</Link>
      </p>

    </div>
  );
}