"use client";
// app/(mail)/settings/accounts/page.tsx
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle, CheckCircle2, ChevronDown, ChevronUp,
  Eye, EyeOff, Loader2, Mail, Plus, Server,
  ShieldCheck, Star, Trash2, Wifi, X, Zap,
} from "lucide-react";

type Account = { id: string; emailAddress: string; label: string | null; isPrimary: boolean; imapHost: string; smtpHost: string; createdAt: string };

const PRESETS = [
  { label: "Hostcari", imapHost: "mail.hostcari.com", imapPort: 993, smtpHost: "mail.hostcari.com", smtpPort: 465, featured: true },
  { label: "Gmail",    imapHost: "imap.gmail.com",          imapPort: 993, smtpHost: "smtp.gmail.com",          smtpPort: 465, featured: false },
  { label: "Outlook",  imapHost: "outlook.office365.com",   imapPort: 993, smtpHost: "smtp.office365.com",      smtpPort: 587, featured: false },
  { label: "Yahoo",    imapHost: "imap.mail.yahoo.com",     imapPort: 993, smtpHost: "smtp.mail.yahoo.com",     smtpPort: 465, featured: false },
  { label: "Custom",   imapHost: "",                        imapPort: 993, smtpHost: "",                        smtpPort: 465, featured: false },
];

function AccountAvatar({ email }: { email: string }) {
  const letter = email.charAt(0).toUpperCase();
  const colors = ["from-[#F97316] to-[#EA580C]","from-[#0044BC] to-[#003399]","from-[#7C3AED] to-[#6D28D9]","from-[#059669] to-[#047857]","from-[#0891B2] to-[#0E7490]"];
  const g = colors[letter.charCodeAt(0) % colors.length];
  return (
    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${g} text-[13px] font-[700] text-white`}>{letter}</div>
  );
}

function Notice({ type, message, onDismiss }: { type: "error" | "success"; message: string; onDismiss: () => void }) {
  return (
    <div className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-[12.5px] ${type === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
      <span className="mt-0.5 shrink-0">{type === "error" ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}</span>
      <span className="flex-1">{message}</span>
      <button type="button" onClick={onDismiss} className="shrink-0 opacity-50 hover:opacity-100"><X className="h-4 w-4" /></button>
    </div>
  );
}

export default function AccountsSettingsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [preset, setPreset] = useState(0);
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [label, setLabel] = useState("");
  const [imapHost, setImapHost] = useState(PRESETS[0].imapHost);
  const [imapPort, setImapPort] = useState(PRESETS[0].imapPort);
  const [smtpHost, setSmtpHost] = useState(PRESETS[0].smtpHost);
  const [smtpPort, setSmtpPort] = useState(PRESETS[0].smtpPort);
  const [advanced, setAdvanced] = useState(false);

  function applyPreset(i: number) {
    setPreset(i); setImapHost(PRESETS[i].imapHost); setImapPort(PRESETS[i].imapPort);
    setSmtpHost(PRESETS[i].smtpHost); setSmtpPort(PRESETS[i].smtpPort);
  }

  async function loadAccounts() {
    setLoading(true);
    try { const res = await fetch("/api/mail/accounts"); const data = await res.json(); if (data.ok) setAccounts(data.accounts || []); }
    catch { setAccounts([]); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadAccounts(); }, []);

  function notify(type: "error" | "success", msg: string) {
    setError(""); setSuccess("");
    if (type === "error") setError(msg); else setSuccess(msg);
    setTimeout(() => { setError(""); setSuccess(""); }, 5000);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault(); setBusy(true);
    try {
      const res = await fetch("/api/mail/accounts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ emailAddress, password, label: label || undefined, imapHost, imapPort, imapSecure: true, smtpHost, smtpPort, smtpSecure: smtpPort !== 587 }) });
      const data = await res.json();
      if (!data.ok) throw new Error([data.error, data.hint].filter(Boolean).join(" ") || "Failed.");
      notify("success", `${emailAddress} connected successfully.`);
      setShowForm(false); setEmailAddress(""); setPassword(""); setLabel(""); setAdvanced(false); setShowPassword(false); applyPreset(0);
      await loadAccounts();
    } catch (err) { notify("error", err instanceof Error ? err.message : "Failed to connect."); }
    finally { setBusy(false); }
  }

  async function handleDelete(id: string, email: string) {
    if (!confirm(`Remove ${email}?`)) return;
    await fetch("/api/mail/accounts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "delete", id }) });
    await loadAccounts();
  }

  async function handleSetPrimary(id: string) {
    await fetch("/api/mail/accounts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "set-primary", id }) });
    await loadAccounts();
  }

  const primaryAccount = useMemo(() => accounts.find(a => a.isPrimary) ?? null, [accounts]);

  const inputCls = "w-full rounded-xl border py-2.5 px-3.5 text-[13px] outline-none transition";
  const inputStyle = { borderColor: "var(--cm-border)", background: "var(--cm-input-bg)", color: "var(--cm-text)" };
  function onFocus(e: React.FocusEvent<HTMLInputElement>) { e.target.style.borderColor = "var(--cm-accent)"; e.target.style.boxShadow = "0 0 0 3px var(--cm-accent-dim)"; }
  function onBlur(e: React.FocusEvent<HTMLInputElement>) { e.target.style.borderColor = "var(--cm-border)"; e.target.style.boxShadow = "none"; }

  return (
    <div className="min-h-full" style={{ background: "var(--cm-bg)" }}>
      {/* Header */}
      <div className="border-b px-4 py-5 sm:px-6 lg:px-8" style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)" }}>
        <div className="mx-auto max-w-5xl flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-[700] uppercase tracking-[0.24em]" style={{ color: "var(--cm-blue)" }}>Mail settings</p>
            <h1 className="mt-1 text-[20px] font-[800] tracking-tight" style={{ color: "var(--cm-text)" }}>Email Accounts</h1>
            <p className="mt-1 text-[13px]" style={{ color: "var(--cm-text2)" }}>Connect IMAP/SMTP accounts to read and send mail.</p>
          </div>
          <button type="button" onClick={() => setShowForm(v => !v)}
            className="inline-flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2.5 text-[13px] font-[700] text-white transition"
            style={{ background: "linear-gradient(135deg, var(--cm-accent), var(--cm-accent2))", boxShadow: "0 4px 14px var(--cm-accent-b)" }}>
            <Plus className="h-4 w-4" />{showForm ? "Cancel" : "Connect account"}
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 space-y-5">
        {(error || success) && <Notice type={error ? "error" : "success"} message={error || success} onDismiss={() => { setError(""); setSuccess(""); }} />}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[
            { label: "Connected", value: loading ? "—" : String(accounts.length), icon: <Mail className="h-4 w-4" />, style: { background: "var(--cm-blue-light)", color: "var(--cm-blue)" } },
            { label: "Primary", value: primaryAccount ? primaryAccount.emailAddress.split("@")[0] : "None", icon: <Star className="h-4 w-4" />, style: { background: "var(--cm-accent-dim)", color: "var(--cm-accent)" } },
            { label: "Any IMAP", value: "Supported", icon: <Wifi className="h-4 w-4" />, style: { background: "rgba(16,185,129,0.10)", color: "#10B981" }, hide: true },
          ].map((stat, i) => (
            <div key={stat.label} className={`rounded-[20px] border px-4 py-4 ${(stat as any).hide ? "hidden sm:block" : ""}`}
              style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)" }}>
              <div className="mb-2.5 inline-flex h-8 w-8 items-center justify-center rounded-xl" style={stat.style}>{stat.icon}</div>
              <div className="truncate text-[15px] font-[800]" style={{ color: "var(--cm-text)" }}>{stat.value}</div>
              <div className="text-[11px] font-[500]" style={{ color: "var(--cm-text3)" }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Add account form */}
        {showForm && (
          <div className="overflow-hidden rounded-[22px] border" style={{ borderColor: "var(--cm-accent-b)", background: "var(--cm-surface)" }}>
            <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface2)" }}>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl text-white" style={{ background: "linear-gradient(135deg, var(--cm-accent), var(--cm-accent2))" }}>
                  <Plus className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[13.5px] font-[700]" style={{ color: "var(--cm-text)" }}>Connect email account</div>
                  <div className="text-[11.5px]" style={{ color: "var(--cm-text2)" }}>Works with Gmail, Outlook, Yahoo, Hostcari, and more</div>
                </div>
              </div>
              <button type="button" onClick={() => setShowForm(false)} className="flex h-8 w-8 items-center justify-center rounded-xl transition" style={{ color: "var(--cm-text3)" }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--cm-surface3)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="p-5">
              <div className="grid gap-5 lg:grid-cols-2">
                <div className="space-y-4">
                  {/* Provider picker */}
                  <div>
                    <label className="mb-2 block text-[11.5px] font-[600]" style={{ color: "var(--cm-text2)" }}>Provider</label>
                    <div className="flex flex-wrap gap-2">
                      {PRESETS.map((p, i) => (
                        <button key={p.label} type="button" onClick={() => applyPreset(i)}
                          className="relative inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[12px] font-[600] transition"
                          style={{
                            borderColor: preset === i ? "var(--cm-accent-b)" : "var(--cm-border)",
                            background: preset === i ? "var(--cm-accent-dim)" : "var(--cm-surface2)",
                            color: preset === i ? "var(--cm-accent)" : "var(--cm-text2)",
                          }}>
                          {p.featured && <Zap className="h-3 w-3" />}
                          {p.label}
                          {p.featured && (
                            <span className="absolute -right-1.5 -top-1.5 h-2 w-2 rounded-full" style={{ background: "var(--cm-accent)" }} />
                          )}
                        </button>
                      ))}
                    </div>
                    {PRESETS[preset].featured && (
                      <p className="mt-2 text-[11px]" style={{ color: "var(--cm-accent)" }}>
                        ✦ Hostcari clients — use your @hostcari.com mailbox for your client badge
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[11.5px] font-[600]" style={{ color: "var(--cm-text2)" }}>Email address <span className="text-red-400">*</span></label>
                    <input type="email" value={emailAddress} onChange={e => setEmailAddress(e.target.value)} required placeholder="you@example.com" className={inputCls} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[11.5px] font-[600]" style={{ color: "var(--cm-text2)" }}>Password <span className="text-red-400">*</span></label>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required placeholder="Email or app password" className={`${inputCls} pr-10`} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--cm-text3)" }}>
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="mt-1.5 text-[11px]" style={{ color: "var(--cm-text3)" }}>Gmail and Yahoo require an app-specific password.</p>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[11.5px] font-[600]" style={{ color: "var(--cm-text2)" }}>Label <span className="font-normal" style={{ color: "var(--cm-text3)" }}>(optional)</span></label>
                    <input value={label} onChange={e => setLabel(e.target.value)} placeholder="Work, Personal, Business…" className={inputCls} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Security note */}
                  <div className="rounded-2xl border border-emerald-200/60 p-4" style={{ background: "rgba(16,185,129,0.06)" }}>
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl" style={{ background: "rgba(16,185,129,0.12)", color: "#10B981" }}>
                        <ShieldCheck className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[12px] font-[700]" style={{ color: "#065F46" }}>Secure by default</p>
                        <p className="mt-1 text-[11.5px] leading-relaxed" style={{ color: "#047857" }}>
                          Passwords are AES-256 encrypted before storage. Your credentials are never logged or exposed in plain text.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Advanced IMAP/SMTP */}
                  <div className="overflow-hidden rounded-2xl border" style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface2)" }}>
                    <button type="button" onClick={() => setAdvanced(!advanced)} className="flex w-full items-center justify-between px-4 py-3 text-left">
                      <div>
                        <div className="text-[12.5px] font-[600]" style={{ color: "var(--cm-text)" }}>Advanced — IMAP / SMTP</div>
                        <div className="text-[11px]" style={{ color: "var(--cm-text3)" }}>{imapHost ? `${imapHost}:${imapPort}` : "Configure manually"}</div>
                      </div>
                      <div className="flex h-6 w-6 items-center justify-center rounded-lg transition"
                        style={{ background: advanced ? "var(--cm-blue)" : "var(--cm-surface)", border: `1px solid var(--cm-border)`, color: advanced ? "#fff" : "var(--cm-text2)" }}>
                        {advanced ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </div>
                    </button>
                    {advanced && (
                      <div className="grid gap-3 border-t p-4" style={{ borderColor: "var(--cm-border)" }}>
                        {[
                          { label: "IMAP Host", value: imapHost, onChange: setImapHost },
                          { label: "IMAP Port", value: imapPort, onChange: (v: string) => setImapPort(Number(v)), type: "number" },
                          { label: "SMTP Host", value: smtpHost, onChange: setSmtpHost },
                          { label: "SMTP Port", value: smtpPort, onChange: (v: string) => setSmtpPort(Number(v)), type: "number" },
                        ].map(f => (
                          <div key={f.label}>
                            <label className="mb-1 block text-[10px] font-[700] uppercase tracking-[0.12em]" style={{ color: "var(--cm-text3)" }}>{f.label}</label>
                            <input type={(f as any).type || "text"} value={f.value} onChange={e => f.onChange(e.target.value)} className={inputCls} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button type="submit" disabled={busy}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-[13.5px] font-[700] text-white transition disabled:opacity-60"
                    style={{ background: "var(--cm-blue)", boxShadow: "0 4px 14px rgba(0,68,188,0.25)" }}>
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                    {busy ? "Connecting…" : "Connect account"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Accounts list */}
        <div className="overflow-hidden rounded-[22px] border" style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)" }}>
          <div className="border-b px-5 py-4" style={{ borderColor: "var(--cm-border)" }}>
            <p className="text-[10px] font-[700] uppercase tracking-[0.22em]" style={{ color: "var(--cm-blue)" }}>Connected accounts</p>
            <p className="mt-0.5 text-[12.5px]" style={{ color: "var(--cm-text2)" }}>
              {loading ? "Loading…" : accounts.length === 0 ? "No accounts connected yet." : `${accounts.length} account${accounts.length !== 1 ? "s" : ""}${primaryAccount ? ` · ${primaryAccount.emailAddress} is primary` : ""}`}
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-3 py-16" style={{ color: "var(--cm-text3)" }}>
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : accounts.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: "var(--cm-blue-light)", color: "var(--cm-blue)" }}>
                <Mail className="h-8 w-8" />
              </div>
              <div>
                <p className="text-[13.5px] font-[700]" style={{ color: "var(--cm-text)" }}>No accounts connected yet</p>
                <p className="mt-1 text-[12.5px]" style={{ color: "var(--cm-text2)" }}>Click &quot;Connect account&quot; to add your first mailbox.</p>
              </div>
              <button type="button" onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-[13px] font-[700] text-white transition"
                style={{ background: "var(--cm-blue)" }}>
                <Plus className="h-4 w-4" />Connect account
              </button>
            </div>
          ) : (
            <div>
              {accounts.map((acc, i) => (
                <div key={acc.id} className="flex flex-col gap-3 px-5 py-4 transition sm:flex-row sm:items-center sm:justify-between"
                  style={{ borderBottom: i < accounts.length - 1 ? `1px solid var(--cm-border)` : "none" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--cm-surface2)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <div className="flex min-w-0 items-center gap-3.5">
                    <AccountAvatar email={acc.emailAddress} />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-[13.5px] font-[700]" style={{ color: "var(--cm-text)" }}>{acc.emailAddress}</span>
                        {acc.isPrimary && (
                          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9.5px] font-[700]"
                            style={{ background: "var(--cm-blue-light)", color: "var(--cm-blue)" }}>
                            <Star className="h-2.5 w-2.5" />Primary
                          </span>
                        )}
                        {acc.label && (
                          <span className="rounded-full border px-2 py-0.5 text-[10px] font-[500]"
                            style={{ borderColor: "var(--cm-border)", color: "var(--cm-text3)" }}>{acc.label}</span>
                        )}
                        {acc.imapHost === "mail.hostcari.com" && (
                          <span className="hostcari-badge">HC</span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-1.5 text-[11px]" style={{ color: "var(--cm-text3)" }}>
                        <Server className="h-3 w-3 shrink-0" />
                        <span className="truncate">{acc.imapHost}</span>
                        <span style={{ color: "var(--cm-border2)" }}>·</span>
                        <span className="truncate">{acc.smtpHost}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 pl-[54px] sm:pl-0">
                    {!acc.isPrimary && (
                      <button type="button" onClick={() => handleSetPrimary(acc.id)}
                        className="inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[11.5px] font-[600] transition"
                        style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface2)", color: "var(--cm-text2)" }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--cm-blue)"; e.currentTarget.style.color = "var(--cm-blue)"; e.currentTarget.style.background = "var(--cm-blue-light)"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--cm-border)"; e.currentTarget.style.color = "var(--cm-text2)"; e.currentTarget.style.background = "var(--cm-surface2)"; }}>
                        <Star className="h-3.5 w-3.5" />Set primary
                      </button>
                    )}
                    <button type="button" onClick={() => handleDelete(acc.id, acc.emailAddress)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-red-100 bg-red-50 px-3 py-1.5 text-[11.5px] font-[600] text-red-600 transition hover:bg-red-100">
                      <Trash2 className="h-3.5 w-3.5" />Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && accounts.length > 0 && (
            <div className="border-t px-5 py-3" style={{ borderColor: "var(--cm-border)" }}>
              <button type="button" onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 text-[12.5px] font-[700] hover:underline transition"
                style={{ color: "var(--cm-blue)" }}>
                <Plus className="h-4 w-4" />Add another account
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}