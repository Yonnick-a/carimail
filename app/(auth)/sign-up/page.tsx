"use client";
// app/(auth)/sign-up/page.tsx
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, Lock, Mail, User } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Sign up failed.");
      router.push("/inbox");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed.");
      setLoading(false);
    }
  }

  const inputCls = "w-full rounded-2xl border border-[#0F172A]/10 bg-[#F8FAFC] px-4 py-3 text-sm text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#FF914D] focus:bg-white focus:ring-4 focus:ring-[#FF914D]/15";

  const strength = password.length === 0 ? 0 : password.length < 8 ? 1 : password.length < 12 ? 2 : /[A-Z]/.test(password) && /[0-9]/.test(password) ? 4 : 3;
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColor = ["", "bg-red-400", "bg-amber-400", "bg-blue-400", "bg-emerald-500"];

  return (
    <div className="animate-fade-up">
      <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">Create your account</h1>
      <p className="mt-1.5 text-sm text-[#64748B]">Get started with Carimail for free</p>

      <form onSubmit={handleSubmit} className="mt-7 space-y-4">
        {error && (
          <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />{error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[#334155]">Full name</label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Alex Johnson" required autoComplete="name"
              className={`${inputCls} pl-10`} />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[#334155]">Email</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com" required autoComplete="email"
              className={`${inputCls} pl-10`} />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[#334155]">Password</label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="8+ characters" required autoComplete="new-password"
              className={`${inputCls} pl-10`} />
          </div>
          {password && (
            <div className="space-y-1">
              <div className="flex gap-1">
                {[1,2,3,4].map((i) => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? strengthColor[strength] : "bg-[#E2E8F0]"}`} />
                ))}
              </div>
              <p className={`text-[11px] font-medium ${strength <= 1 ? "text-red-500" : strength === 2 ? "text-amber-500" : strength === 3 ? "text-blue-500" : "text-emerald-600"}`}>
                {strengthLabel[strength]}
              </p>
            </div>
          )}
        </div>

        <button type="submit" disabled={loading}
          className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF914D] to-[#FF7A2F] py-3.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(255,145,77,0.30)] transition hover:shadow-[0_12px_32px_rgba(255,145,77,0.38)] disabled:opacity-60">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-4 text-center text-[11px] text-[#94A3B8]">
        By signing up you agree to our{" "}
        <Link href="/terms" className="text-[#64748B] hover:underline">Terms</Link>{" "}
        and{" "}
        <Link href="/privacy" className="text-[#64748B] hover:underline">Privacy Policy</Link>.
      </p>

      <div className="mt-5 text-center text-sm text-[#64748B]">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-semibold text-[#0044BC] hover:underline">Sign in</Link>
      </div>
    </div>
  );
}
