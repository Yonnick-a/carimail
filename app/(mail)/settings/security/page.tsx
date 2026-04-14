"use client";
// app/(mail)/settings/security/page.tsx
import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, LogOut, Monitor, Shield } from "lucide-react";
import { useRouter } from "next/navigation";

type SessionInfo = {
  id: string;
  createdAt: string;
  expiresAt: string;
};

export default function SecuritySettingsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetch("/api/auth/sessions")
      .then((r) => r.json())
      .then((d) => { if (d.ok) setSessions(d.sessions || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function notify(type: "error" | "success", msg: string) {
    setError(""); setSuccess("");
    if (type === "error") setError(msg);
    else setSuccess(msg);
    setTimeout(() => { setError(""); setSuccess(""); }, 5000);
  }

  async function revokeAll() {
    if (!confirm("Sign out all other sessions?")) return;
    setRevoking(true);
    try {
      const res = await fetch("/api/auth/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "revoke-all" }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Failed.");
      notify("success", "All other sessions signed out.");
      // Reload sessions list
      const refreshed = await fetch("/api/auth/sessions").then((r) => r.json());
      if (refreshed.ok) setSessions(refreshed.sessions || []);
    } catch (err) {
      notify("error", err instanceof Error ? err.message : "Failed.");
    } finally {
      setRevoking(false);
    }
  }

  async function signOutAll() {
    setRevoking(true);
    try {
      await fetch("/api/auth/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "revoke-all-including-current" }),
      });
      await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "signout" }),
      });
      router.push("/sign-in");
    } catch {
      setRevoking(false);
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
  }

  return (
    <div className="min-h-full bg-[#F4F7FB] p-6">
      <div className="mx-auto max-w-xl space-y-5">
        <div>
          <h1 className="text-xl font-bold text-[#0F172A]">Security</h1>
          <p className="mt-1 text-sm text-[#64748B]">Manage your active sessions.</p>
        </div>

        {(error || success) && (
          <div className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm ${error ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
            {error ? <AlertCircle className="h-4 w-4 shrink-0" /> : <CheckCircle2 className="h-4 w-4 shrink-0" />}
            {error || success}
          </div>
        )}

        {/* Active sessions */}
        <div className="overflow-hidden rounded-[24px] border border-white/70 bg-white/90 shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between border-b border-[#0F172A]/6 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <Shield className="h-4 w-4" />
              </div>
              <div className="text-sm font-semibold text-[#0F172A]">Active sessions</div>
            </div>
            {sessions.length > 1 && (
              <button type="button" onClick={revokeAll} disabled={revoking}
                className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-60">
                Sign out others
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2.5 py-10 text-sm text-[#64748B]">
              <Loader2 className="h-4 w-4 animate-spin" />Loading…
            </div>
          ) : sessions.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-[#64748B]">No active sessions found.</div>
          ) : (
            <div className="divide-y divide-[#0F172A]/6">
              {sessions.map((s, i) => (
                <div key={s.id} className="flex items-center gap-3 px-5 py-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F8FAFC] text-[#64748B]">
                    <Monitor className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-[#0F172A]">
                      Session {i === 0 ? <span className="ml-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">Current</span> : ""}
                    </div>
                    <div className="text-xs text-[#94A3B8]">
                      Started {formatDate(s.createdAt)} · Expires {formatDate(s.expiresAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sign out everywhere */}
        <div className="overflow-hidden rounded-[24px] border border-red-100 bg-white/90 shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
          <div className="px-5 py-4">
            <div className="text-sm font-semibold text-[#0F172A]">Sign out everywhere</div>
            <p className="mt-1 text-xs text-[#64748B]">
              This will sign you out of all devices, including this one.
            </p>
            <button type="button" onClick={signOutAll} disabled={revoking}
              className="mt-3 inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-60">
              {revoking ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
              Sign out all devices
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
