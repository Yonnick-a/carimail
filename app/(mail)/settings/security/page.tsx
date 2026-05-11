"use client";
// app/(mail)/settings/security/page.tsx
import { useEffect, useState } from "react";
import {
  AlertCircle, CheckCircle2, Loader2,
  LogOut, Monitor, Shield, X,
} from "lucide-react";
import { useRouter } from "next/navigation";

type SessionInfo = {
  id: string;
  createdAt: string;
  expiresAt: string;
};

function Notice({ type, message, onDismiss }: { type: "error" | "success"; message: string; onDismiss: () => void }) {
  return (
    <div className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${type === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
      <span className="mt-0.5 shrink-0">
        {type === "error" ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
      </span>
      <span className="flex-1">{message}</span>
      <button type="button" onClick={onDismiss} className="shrink-0 opacity-50 hover:opacity-100 transition">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function SecuritySettingsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadSessions() {
    try {
      const res = await fetch("/api/auth/sessions");
      const d = await res.json();
      if (d.ok) setSessions(d.sessions || []);
    } catch {}
    finally { setLoading(false); }
  }

  useEffect(() => { loadSessions(); }, []);

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
      notify("success", "All other sessions have been signed out.");
      await loadSessions();
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

  return (
    <div className="min-h-full" style={{ background: "var(--cm-bg)" }}>
      {/* Header */}
      <div className="border-b px-4 py-5 sm:px-6 lg:px-8" style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)" }}>
        <div className="mx-auto max-w-5xl">
          <div className="text-[10px] font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--cm-blue)" }}>Settings</div>
          <h1 className="mt-1 text-xl font-bold tracking-tight" style={{ color: "var(--cm-text)" }}>Security</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--cm-text2)" }}>Review active sessions and manage account access.</p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 space-y-5">
        {(error || success) && (
          <Notice type={error ? "error" : "success"} message={error || success} onDismiss={() => { setError(""); setSuccess(""); }} />
        )}

        {/* Sessions card */}
        <div className="overflow-hidden rounded-[24px] border" style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)" }}>
          <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: "var(--cm-border)" }}>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <Shield className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-bold" style={{ color: "var(--cm-text)" }}>Active sessions</div>
                <div className="text-xs" style={{ color: "var(--cm-text2)" }}>
                  {loading ? "Loading…" : `${sessions.length} session${sessions.length !== 1 ? "s" : ""} active`}
                </div>
              </div>
            </div>
            {sessions.length > 1 && (
              <button type="button" onClick={revokeAll} disabled={revoking}
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-60">
                {revoking ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LogOut className="h-3.5 w-3.5" />}
                Sign out others
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-3 py-12 text-sm" style={{ color: "var(--cm-text2)" }}>
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <Monitor className="mx-auto h-8 w-8 text-slate-200" />
              <p className="mt-3 text-sm" style={{ color: "var(--cm-text2)" }}>No active sessions found.</p>
            </div>
          ) : (
            <div>
              {sessions.map((s, i) => (
                <div key={s.id} className="flex items-center gap-4 border-b px-5 py-4 last:border-b-0 transition" style={{ borderColor: "var(--cm-border)", background: i === 0 ? "rgba(16,185,129,0.06)" : "transparent" }}>
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${i === 0 ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-[#0F172A]/8 bg-[#F8FAFC] text-[#64748B]"}`}>
                    <Monitor className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold" style={{ color: "var(--cm-text)" }}>
                        {i === 0 ? "This device" : `Session ${i + 1}`}
                      </span>
                      {i === 0 && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 text-[11px]" style={{ color: "var(--cm-text3)" }}>
                      Started {timeAgo(s.createdAt)} · Expires {formatDate(s.expiresAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Danger zone */}
        <div className="overflow-hidden rounded-[24px] border" style={{ borderColor: "rgba(239,68,68,0.22)", background: "var(--cm-surface)" }}>
          <div className="border-b border-red-100/60 bg-red-50/40 px-5 py-3">
            <div className="text-[10px] font-bold uppercase tracking-[0.20em] text-red-600">Danger zone</div>
          </div>
          <div className="px-5 py-4">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="min-w-0">
                <div className="text-sm font-semibold" style={{ color: "var(--cm-text)" }}>Sign out everywhere</div>
                <p className="mt-0.5 text-xs" style={{ color: "var(--cm-text2)" }}>
                  Signs you out of all devices including this one. You will need to sign in again.
                </p>
              </div>
              <button type="button" onClick={signOutAll} disabled={revoking}
                className="mt-3 inline-flex shrink-0 items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-60 sm:mt-0">
                {revoking ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
                Sign out all devices
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
