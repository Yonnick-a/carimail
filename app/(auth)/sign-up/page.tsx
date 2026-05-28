"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Eye, EyeOff, Loader2, Sparkles } from "lucide-react";

const inputBase =
  "w-full rounded-2xl border bg-transparent py-3.5 text-[14px] outline-none transition-all duration-150";

function InputField({
  type = "text", value, onChange, placeholder, autoComplete, autoFocus, required,
  icon, right, minLength,
}: {
  type?: string; value: string; onChange: (v: string) => void; placeholder: string;
  autoComplete?: string; autoFocus?: boolean; required?: boolean;
  icon?: React.ReactNode; right?: React.ReactNode; minLength?: number;
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
        type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} autoComplete={autoComplete} autoFocus={autoFocus}
        required={required} minLength={minLength}
        className={`${inputBase} ${icon ? "pl-10" : "pl-4"} ${right ? "pr-11" : "pr-4"}`}
        style={{
          borderColor: focused ? "var(--cm-accent)" : "var(--cm-border2)",
          background: focused ? "var(--cm-surface)" : "var(--cm-surface2)",
          color: "var(--cm-text)",
          boxShadow: focused ? "0 0 0 3px var(--cm-accent-dim)" : "none",
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {right && <span className="absolute right-3.5 top-1/2 -translate-y-1/2">{right}</span>}
    </div>
  );
}

const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"];
const strengthColor = ["", "#EF4444", "#F59E0B", "#0044BC", "#10B981"];
const strengthWidth = ["0%","25%","50%","75%","100%"];

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const strength =
    password.length === 0 ? 0 :
    password.length < 8   ? 1 :
    password.length < 12  ? 2 :
    /[A-Z]/.test(password) && /[0-9]/.test(password) ? 4 : 3;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST", headers: { "Content-Type": "application/json" },
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

  const MailIcon = () => <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>;
  const LockIcon  = () => <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>;
  const UserIcon  = () => <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>;

  return (
    <div className="animate-fade-up">
      <h1 className="text-[26px] font-[900] tracking-tight" style={{ color: "var(--cm-text)" }}>
        Create account
        <span className="ml-2 animate-spark inline-block select-none" role="img" aria-label="sparkles">✨</span>
      </h1>
      <p className="mt-1.5 text-[13.5px]" style={{ color: "var(--cm-text3)" }}>
        Get started with Carimail for free
      </p>

      {/* Hostcari callout */}
      <div className="mt-6 flex items-start gap-3 rounded-2xl border px-4 py-3.5"
        style={{ borderColor: "var(--cm-accent-b)", background: "var(--cm-accent-dim)" }}>
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--cm-accent)" }} />
        <div>
          <p className="text-[12.5px] font-[800]" style={{ color: "var(--cm-accent)" }}>Hostcari client?</p>
          <p className="mt-0.5 text-[12px] leading-relaxed" style={{ color: "var(--cm-text2)" }}>
            Sign up with your Hostcari email to unlock your client badge and priority features.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
        {error && (
          <div className="flex items-center gap-2.5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700 animate-fade-in">
            <AlertCircle className="h-4 w-4 shrink-0" />{error}
          </div>
        )}

        <div className="space-y-1">
          <label className="block text-[12px] font-[700]" style={{ color: "var(--cm-text2)" }}>Full name</label>
          <InputField type="text" value={name} onChange={setName} placeholder="Alex Johnson"
            autoComplete="name" autoFocus required icon={<UserIcon />} />
        </div>

        <div className="space-y-1">
          <label className="block text-[12px] font-[700]" style={{ color: "var(--cm-text2)" }}>Email address</label>
          <InputField type="email" value={email} onChange={setEmail} placeholder="you@example.com"
            autoComplete="email" required icon={<MailIcon />} />
        </div>

        <div className="space-y-1">
          <label className="block text-[12px] font-[700]" style={{ color: "var(--cm-text2)" }}>Password</label>
          <InputField
            type={showPass ? "text" : "password"} value={password} onChange={setPassword}
            placeholder="8+ characters" autoComplete="new-password" required minLength={8}
            icon={<LockIcon />}
            right={
              <button type="button" onClick={() => setShowPass(v => !v)} style={{ color: "var(--cm-text3)" }}>
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />
          {/* Strength bar */}
          {password && (
            <div className="mt-2 space-y-1">
              <div className="h-1 w-full overflow-hidden rounded-full" style={{ background: "var(--cm-border2)" }}>
                <div className="h-full rounded-full transition-all duration-400"
                  style={{ width: strengthWidth[strength], background: strengthColor[strength] }} />
              </div>
              <p className="text-[11.5px] font-[700]" style={{ color: strengthColor[strength] }}>
                {strengthLabel[strength]}
              </p>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="group relative mt-2 inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl py-4 text-[14px] font-[800] text-white transition-all duration-200 active:scale-[0.99] disabled:opacity-60 hover:-translate-y-0.5"
          style={{
            background: "linear-gradient(135deg, var(--cm-accent), var(--cm-accent2))",
            boxShadow: "0 8px 28px var(--cm-accent-b)",
          }}
        >
          <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-5 text-center text-[11px]" style={{ color: "var(--cm-text3)" }}>
        By signing up you agree to our{" "}
        <Link href="/terms" className="hover:underline" style={{ color: "var(--cm-text2)" }}>Terms</Link>
        {" "}&amp;{" "}
        <Link href="/privacy" className="hover:underline" style={{ color: "var(--cm-text2)" }}>Privacy Policy</Link>.
      </p>

      {/* Feature pills */}
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {["Any IMAP provider", "Encrypted storage", "Free to start"].map(f => (
          <span key={f} className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-[600]"
            style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface2)", color: "var(--cm-text3)" }}>
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--cm-blue)" }} />{f}
          </span>
        ))}
      </div>

      <p className="mt-5 text-center text-[13px]" style={{ color: "var(--cm-text2)" }}>
        Already have an account?{" "}
        <Link href="/sign-in" className="font-[800] hover:underline" style={{ color: "var(--cm-blue)" }}>Sign in</Link>
      </p>
    </div>
  );
}
