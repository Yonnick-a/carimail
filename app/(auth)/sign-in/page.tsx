"use client";
// app/(auth)/sign-in/page.tsx
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, Lock, Mail } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Sign in failed.");
      router.push("/inbox");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
      setLoading(false);
    }
  }

  const inputCls = "w-full rounded-2xl border border-[#0F172A]/10 bg-[#F8FAFC] px-4 py-3 text-sm text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#FF914D] focus:bg-white focus:ring-4 focus:ring-[#FF914D]/15";

  return (
    <div className="animate-fade-up">
      <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">Welcome back</h1>
      <p className="mt-1.5 text-sm text-[#64748B]">Sign in to your Carimail account</p>

      <form onSubmit={handleSubmit} className="mt-7 space-y-4">
        {error && (
          <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />{error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[#334155]">Email</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com" required autoComplete="email"
              className={`${inputCls} pl-10`}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-[#334155]">Password</label>
            <Link href="/forgot-password" className="text-xs font-medium text-[#0044BC] hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" required autoComplete="current-password"
              className={`${inputCls} pl-10`}
            />
          </div>
        </div>

        <button
          type="submit" disabled={loading}
          className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0F172A] py-3.5 text-sm font-semibold text-white transition hover:bg-[#1E293B] disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-[#64748B]">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="font-semibold text-[#0044BC] hover:underline">
          Create one
        </Link>
      </div>
    </div>
  );
}
