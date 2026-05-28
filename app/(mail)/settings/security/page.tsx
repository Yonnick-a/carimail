"use client";
import { useEffect, useState } from "react";
import {
  AlertCircle, Check, CheckCircle2, ClipboardCopy, KeyRound,
  Loader2, LogOut, Monitor, Shield, ShieldCheck, ShieldOff, X,
} from "lucide-react";
import { useRouter } from "next/navigation";

type SessionInfo = { id: string; createdAt: string; expiresAt: string };

function Notice({ type, message, onDismiss }: { type: "error" | "success"; message: string; onDismiss: () => void }) {
  return (
    <div className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-[12.5px] ${type === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
      <span className="mt-0.5 shrink-0">{type === "error" ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}</span>
      <span className="flex-1">{message}</span>
      <button type="button" onClick={onDismiss} className="shrink-0 opacity-50 hover:opacity-100"><X className="h-4 w-4" /></button>
    </div>
  );
}

function formatDate(iso: string) { return new Date(iso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }); }
function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ── 2FA setup wizard ──────────────────────────────────────────────────────────
function TwoFactorSection() {
  const [loading, setLoading] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const [step, setStep] = useState<"idle" | "setup" | "done" | "disable">("idle");
  const [secret, setSecret] = useState("");
  const [uri, setUri] = useState("");
  const [code, setCode] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/auth/2fa")
      .then(r => r.json())
      .then(d => {
        setEnabled(d.enabled ?? false);
        if (!d.enabled && d.secret) { setSecret(d.secret); setUri(d.uri ?? ""); }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleEnable(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      const res = await fetch("/api/auth/2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "enable", secret, code }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      setBackupCodes(data.backupCodes ?? []);
      setEnabled(true); setStep("done"); setCode("");
    } catch (err) { setError(err instanceof Error ? err.message : "Failed."); }
    finally { setBusy(false); }
  }

  async function handleDisable(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      const res = await fetch("/api/auth/2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "disable", code: disableCode }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      setEnabled(false); setStep("idle"); setDisableCode("");
      // Fetch new secret for future setup
      const fresh = await fetch("/api/auth/2fa").then(r => r.json());
      if (fresh.secret) { setSecret(fresh.secret); setUri(fresh.uri ?? ""); }
    } catch (err) { setError(err instanceof Error ? err.message : "Failed."); }
    finally { setBusy(false); }
  }

  function copySecret() {
    navigator.clipboard.writeText(secret).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const inputCls = "w-full rounded-xl border py-2.5 px-3.5 text-[13px] outline-none transition";
  const inputStyle = { borderColor: "var(--cm-border)", background: "var(--cm-input-bg)", color: "var(--cm-text)" };

  if (loading) return (
    <div className="flex items-center gap-2 py-4 text-[13px]" style={{ color: "var(--cm-text3)" }}>
      <Loader2 className="h-4 w-4 animate-spin" />Loading…
    </div>
  );

  return (
    <div className="space-y-4">
      {error && <Notice type="error" message={error} onDismiss={() => setError("")} />}

      {/* Status bar */}
      <div className="flex items-center justify-between gap-4 rounded-2xl border p-4"
        style={{ borderColor: enabled ? "rgba(16,185,129,0.3)" : "var(--cm-border)", background: enabled ? "rgba(16,185,129,0.06)" : "var(--cm-surface2)" }}>
        <div className="flex items-center gap-3">
          {enabled
            ? <ShieldCheck className="h-5 w-5 text-emerald-600" />
            : <ShieldOff className="h-5 w-5" style={{ color: "var(--cm-text3)" }} />}
          <div>
            <p className="text-[13.5px] font-[700]" style={{ color: "var(--cm-text)" }}>
              {enabled ? "Two-factor authentication is on" : "Two-factor authentication is off"}
            </p>
            <p className="text-[11.5px]" style={{ color: "var(--cm-text2)" }}>
              {enabled ? "Your account is protected with TOTP." : "Add an extra layer of security to your account."}
            </p>
          </div>
        </div>
        {enabled ? (
          <button type="button" onClick={() => setStep("disable")}
            className="shrink-0 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-[12px] font-[700] text-red-600 transition hover:bg-red-100">
            Disable
          </button>
        ) : (
          <button type="button" onClick={() => setStep("setup")}
            className="shrink-0 rounded-xl border px-3 py-1.5 text-[12px] font-[700] transition"
            style={{ borderColor: "var(--cm-blue)", background: "var(--cm-blue-light)", color: "var(--cm-blue)" }}>
            Enable
          </button>
        )}
      </div>

      {/* Setup wizard */}
      {step === "setup" && (
        <div className="overflow-hidden rounded-2xl border" style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)" }}>
          <div className="border-b px-5 py-4" style={{ borderColor: "var(--cm-border)" }}>
            <p className="text-[13.5px] font-[800]" style={{ color: "var(--cm-text)" }}>Set up two-factor authentication</p>
            <p className="mt-0.5 text-[12px]" style={{ color: "var(--cm-text2)" }}>
              Use Google Authenticator, Authy, 1Password, or any TOTP app.
            </p>
          </div>
          <div className="space-y-5 p-5">
            {/* Step 1 — secret */}
            <div>
              <p className="mb-2 flex items-center gap-2 text-[12px] font-[800] uppercase tracking-wide" style={{ color: "var(--cm-text3)" }}>
                <span className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-[900] text-white" style={{ background: "var(--cm-blue)" }}>1</span>
                Add your account to your authenticator app
              </p>
              {/* Open in app link */}
              <a href={uri} className="mb-3 flex items-center gap-2 rounded-xl border px-4 py-3 text-[13px] font-[700] transition hover:-translate-y-0.5"
                style={{ borderColor: "var(--cm-accent-b)", background: "var(--cm-accent-dim)", color: "var(--cm-accent)" }}>
                📱 Open in authenticator app
                <span className="ml-auto text-[11px] opacity-60">click on mobile →</span>
              </a>
              <p className="mb-2 text-[11.5px]" style={{ color: "var(--cm-text2)" }}>Or enter this key manually:</p>
              <div className="flex items-center gap-2 rounded-xl border px-4 py-3" style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface2)" }}>
                <code className="flex-1 break-all font-mono text-[13px] font-[700] tracking-wider" style={{ color: "var(--cm-text)" }}>
                  {secret.match(/.{1,4}/g)?.join(" ")}
                </code>
                <button type="button" onClick={copySecret} className="shrink-0 rounded-lg p-1.5 transition" style={{ color: "var(--cm-text3)" }}>
                  {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <ClipboardCopy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Step 2 — verify */}
            <form onSubmit={handleEnable}>
              <p className="mb-2 flex items-center gap-2 text-[12px] font-[800] uppercase tracking-wide" style={{ color: "var(--cm-text3)" }}>
                <span className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-[900] text-white" style={{ background: "var(--cm-blue)" }}>2</span>
                Enter the 6-digit code to verify
              </p>
              <input
                type="text" inputMode="numeric" pattern="\d{6}" maxLength={6}
                value={code} onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000 000" required autoFocus
                className={`${inputCls} text-center text-[24px] font-mono font-[700] tracking-[0.4em]`}
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = "var(--cm-accent)"; e.target.style.boxShadow = "0 0 0 3px var(--cm-accent-dim)"; }}
                onBlur={e => { e.target.style.borderColor = "var(--cm-border)"; e.target.style.boxShadow = "none"; }}
              />
              <div className="mt-3 flex gap-2">
                <button type="submit" disabled={busy || code.length < 6}
                  className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-[700] text-white transition disabled:opacity-50"
                  style={{ background: "var(--cm-blue)" }}>
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                  {busy ? "Verifying…" : "Enable 2FA"}
                </button>
                <button type="button" onClick={() => { setStep("idle"); setCode(""); setError(""); }}
                  className="rounded-xl border px-4 py-2.5 text-[13px] font-[600]"
                  style={{ borderColor: "var(--cm-border)", color: "var(--cm-text2)" }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success — show backup codes */}
      {step === "done" && backupCodes.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-emerald-200/60" style={{ background: "rgba(16,185,129,0.04)" }}>
          <div className="flex items-center gap-3 border-b border-emerald-200/50 px-5 py-4">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="text-[13.5px] font-[800]" style={{ color: "var(--cm-text)" }}>Two-factor authentication enabled!</p>
              <p className="text-[12px]" style={{ color: "var(--cm-text2)" }}>Save these backup codes now — they won&apos;t be shown again.</p>
            </div>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-2 gap-2 rounded-xl border p-4 font-mono text-[13px] font-[700]"
              style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface2)", color: "var(--cm-text)" }}>
              {backupCodes.map(c => <div key={c}>{c}</div>)}
            </div>
            <button type="button"
              onClick={() => { navigator.clipboard.writeText(backupCodes.join("\n")).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
              className="mt-3 flex items-center gap-2 rounded-xl border px-3 py-2 text-[12px] font-[700] transition"
              style={{ borderColor: "var(--cm-border)", color: "var(--cm-text2)" }}>
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <ClipboardCopy className="h-3.5 w-3.5" />}
              {copied ? "Copied!" : "Copy all backup codes"}
            </button>
            <button type="button" onClick={() => setStep("idle")}
              className="mt-3 block text-[12px] font-[600] hover:underline" style={{ color: "var(--cm-blue)" }}>
              I&apos;ve saved my backup codes →
            </button>
          </div>
        </div>
      )}

      {/* Disable 2FA */}
      {step === "disable" && (
        <form onSubmit={handleDisable} className="overflow-hidden rounded-2xl border border-red-100" style={{ background: "var(--cm-surface)" }}>
          <div className="border-b border-red-100 bg-red-50/50 px-5 py-4">
            <p className="text-[13.5px] font-[800]" style={{ color: "var(--cm-text)" }}>Disable two-factor authentication</p>
            <p className="text-[12px]" style={{ color: "var(--cm-text2)" }}>Enter your current TOTP code to confirm.</p>
          </div>
          <div className="space-y-3 p-5">
            <input type="text" inputMode="numeric" maxLength={6}
              value={disableCode} onChange={e => setDisableCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000 000" required autoFocus
              className={`${inputCls} text-center text-[24px] font-mono font-[700] tracking-[0.4em]`}
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = "var(--cm-accent)"; e.target.style.boxShadow = "0 0 0 3px var(--cm-accent-dim)"; }}
              onBlur={e => { e.target.style.borderColor = "var(--cm-border)"; e.target.style.boxShadow = "none"; }}
            />
            <div className="flex gap-2">
              <button type="submit" disabled={busy || disableCode.length < 6}
                className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-[13px] font-[700] text-red-600 transition hover:bg-red-100 disabled:opacity-50">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldOff className="h-4 w-4" />}
                {busy ? "Disabling…" : "Disable 2FA"}
              </button>
              <button type="button" onClick={() => { setStep("idle"); setDisableCode(""); setError(""); }}
                className="rounded-xl border px-4 py-2.5 text-[13px] font-[600]"
                style={{ borderColor: "var(--cm-border)", color: "var(--cm-text2)" }}>
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function SecuritySettingsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadSessions() {
    try {
      const d = await fetch("/api/auth/sessions").then(r => r.json());
      if (d.ok) setSessions(d.sessions || []);
    } catch {}
    finally { setLoading(false); }
  }

  useEffect(() => { loadSessions(); }, []);

  function notify(type: "error" | "success", msg: string) {
    setError(""); setSuccess("");
    if (type === "error") setError(msg); else setSuccess(msg);
    setTimeout(() => { setError(""); setSuccess(""); }, 5000);
  }

  async function revokeAll() {
    if (!confirm("Sign out all other sessions?")) return;
    setRevoking(true);
    try {
      const d = await fetch("/api/auth/sessions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "revoke-all" }) }).then(r => r.json());
      if (!d.ok) throw new Error(d.error || "Failed.");
      notify("success", "All other sessions signed out.");
      await loadSessions();
    } catch (err) { notify("error", err instanceof Error ? err.message : "Failed."); }
    finally { setRevoking(false); }
  }

  async function signOutAll() {
    setRevoking(true);
    try {
      await fetch("/api/auth/sessions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "revoke-all-including-current" }) });
      await fetch("/api/auth/signin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "signout" }) });
      router.push("/sign-in");
    } catch { setRevoking(false); }
  }

  return (
    <div className="min-h-full" style={{ background: "var(--cm-bg)" }}>
      <div className="border-b px-4 py-5 sm:px-6 lg:px-8" style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)" }}>
        <div className="mx-auto max-w-5xl">
          <p className="text-[10px] font-[700] uppercase tracking-[0.24em]" style={{ color: "var(--cm-blue)" }}>Settings</p>
          <h1 className="mt-1 text-[20px] font-[800] tracking-tight" style={{ color: "var(--cm-text)" }}>Security</h1>
          <p className="mt-1 text-[13px]" style={{ color: "var(--cm-text2)" }}>Two-factor authentication, active sessions, and account access.</p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-5 px-4 py-6 sm:px-6 lg:px-8">
        {(error || success) && <Notice type={error ? "error" : "success"} message={error || success} onDismiss={() => { setError(""); setSuccess(""); }} />}

        {/* 2FA card */}
        <div className="overflow-hidden rounded-[24px] border" style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)" }}>
          <div className="flex items-center gap-3 border-b px-5 py-4" style={{ borderColor: "var(--cm-border)" }}>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: "var(--cm-blue-light)", color: "var(--cm-blue)" }}>
              <KeyRound className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[13.5px] font-[800]" style={{ color: "var(--cm-text)" }}>Two-factor authentication</div>
              <div className="text-[11.5px]" style={{ color: "var(--cm-text2)" }}>TOTP via authenticator app (Google Authenticator, Authy, 1Password…)</div>
            </div>
          </div>
          <div className="p-5">
            <TwoFactorSection />
          </div>
        </div>

        {/* Sessions card */}
        <div className="overflow-hidden rounded-[24px] border" style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)" }}>
          <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: "var(--cm-border)" }}>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <Shield className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[13.5px] font-[800]" style={{ color: "var(--cm-text)" }}>Active sessions</div>
                <div className="text-[11.5px]" style={{ color: "var(--cm-text2)" }}>
                  {loading ? "Loading…" : `${sessions.length} session${sessions.length !== 1 ? "s" : ""} active`}
                </div>
              </div>
            </div>
            {sessions.length > 1 && (
              <button type="button" onClick={revokeAll} disabled={revoking}
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-100 bg-red-50 px-3 py-1.5 text-[12px] font-[700] text-red-600 transition hover:bg-red-100 disabled:opacity-60">
                {revoking ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LogOut className="h-3.5 w-3.5" />}
                Sign out others
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12" style={{ color: "var(--cm-text3)" }}>
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <Monitor className="mx-auto h-8 w-8" style={{ color: "var(--cm-border2)" }} />
              <p className="mt-3 text-[13px]" style={{ color: "var(--cm-text2)" }}>No active sessions found.</p>
            </div>
          ) : (
            sessions.map((s, i) => (
              <div key={s.id} className="flex items-center gap-4 border-b px-5 py-4 last:border-b-0 transition"
                style={{ borderColor: "var(--cm-border)", background: i === 0 ? "rgba(16,185,129,0.04)" : "transparent" }}>
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${i === 0 ? "border-emerald-200 bg-emerald-50 text-emerald-700" : ""}`}
                  style={i !== 0 ? { borderColor: "var(--cm-border)", background: "var(--cm-surface2)", color: "var(--cm-text3)" } : {}}>
                  <Monitor className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[13px] font-[700]" style={{ color: "var(--cm-text)" }}>
                      {i === 0 ? "This device" : `Session ${i + 1}`}
                    </span>
                    {i === 0 && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-[700] text-emerald-700">Current</span>}
                  </div>
                  <p className="text-[11px]" style={{ color: "var(--cm-text3)" }}>
                    Started {timeAgo(s.createdAt)} · Expires {formatDate(s.expiresAt)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Danger zone */}
        <div className="overflow-hidden rounded-[24px] border" style={{ borderColor: "rgba(239,68,68,0.22)", background: "var(--cm-surface)" }}>
          <div className="border-b border-red-100/60 bg-red-50/30 px-5 py-3">
            <p className="text-[10px] font-[800] uppercase tracking-[0.20em] text-red-600">Danger zone</p>
          </div>
          <div className="px-5 py-4">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[13.5px] font-[700]" style={{ color: "var(--cm-text)" }}>Sign out everywhere</p>
                <p className="mt-0.5 text-[12px]" style={{ color: "var(--cm-text2)" }}>Signs you out of all devices including this one.</p>
              </div>
              <button type="button" onClick={signOutAll} disabled={revoking}
                className="mt-3 inline-flex shrink-0 items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-[13px] font-[700] text-red-600 transition hover:bg-red-100 disabled:opacity-60 sm:mt-0">
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
