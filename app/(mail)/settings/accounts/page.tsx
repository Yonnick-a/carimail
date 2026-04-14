"use client";
// app/(mail)/settings/accounts/page.tsx
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Plus,
  Server,
  ShieldCheck,
  Star,
  Trash2,
  X,
  Wifi,
} from "lucide-react";

type Account = {
  id: string;
  emailAddress: string;
  label: string | null;
  isPrimary: boolean;
  imapHost: string;
  smtpHost: string;
  createdAt: string;
};

const inputCls =
  "w-full rounded-xl border border-[#0F172A]/10 bg-[#F8FAFC] px-3.5 py-2.5 text-sm text-[#0F172A] outline-none transition focus:border-[#FF914D] focus:bg-white placeholder:text-[#94A3B8]";

const PRESETS = [
  { label: "Hostcari", imapHost: "mail.hostcari.com", imapPort: 993, smtpHost: "mail.hostcari.com", smtpPort: 465 },
  { label: "Gmail", imapHost: "imap.gmail.com", imapPort: 993, smtpHost: "smtp.gmail.com", smtpPort: 465 },
  { label: "Outlook", imapHost: "outlook.office365.com", imapPort: 993, smtpHost: "smtp.office365.com", smtpPort: 587 },
  { label: "Yahoo", imapHost: "imap.mail.yahoo.com", imapPort: 993, smtpHost: "smtp.mail.yahoo.com", smtpPort: 465 },
  { label: "Custom", imapHost: "", imapPort: 993, smtpHost: "", smtpPort: 465 },
];

function AccountAvatar({ email, size = "md" }: { email: string; size?: "sm" | "md" | "lg" }) {
  const letter = email.charAt(0).toUpperCase();
  const gradients = [
    "from-[#FF914D] to-[#FF6B1A]",
    "from-[#0044BC] to-[#0033A0]",
    "from-[#7C3AED] to-[#6D28D9]",
    "from-[#059669] to-[#047857]",
    "from-[#DC2626] to-[#B91C1C]",
    "from-[#0891B2] to-[#0E7490]",
  ];
  const g = gradients[letter.charCodeAt(0) % gradients.length];
  const sz = { sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm", lg: "h-12 w-12 text-base" }[size];
  return (
    <div className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${g} font-bold text-white ${sz}`}>
      {letter}
    </div>
  );
}

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
    setPreset(i);
    setImapHost(PRESETS[i].imapHost);
    setImapPort(PRESETS[i].imapPort);
    setSmtpHost(PRESETS[i].smtpHost);
    setSmtpPort(PRESETS[i].smtpPort);
  }

  async function loadAccounts() {
    setLoading(true);
    try {
      const res = await fetch("/api/mail/accounts");
      const data = await res.json();
      if (data.ok) setAccounts(data.accounts || []);
    } catch {
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAccounts(); }, []);

  function notify(type: "error" | "success", msg: string) {
    setError(""); setSuccess("");
    if (type === "error") setError(msg);
    else setSuccess(msg);
    setTimeout(() => { setError(""); setSuccess(""); }, 5000);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/mail/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailAddress, password,
          label: label || undefined,
          imapHost, imapPort, imapSecure: true,
          smtpHost, smtpPort, smtpSecure: smtpPort !== 587,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        const msg = [data.error, data.hint].filter(Boolean).join(" ");
        throw new Error(msg || "Failed.");
      }
      notify("success", `${emailAddress} connected successfully.`);
      setShowForm(false);
      setEmailAddress(""); setPassword(""); setLabel("");
      setAdvanced(false); setShowPassword(false);
      applyPreset(0);
      await loadAccounts();
    } catch (err) {
      notify("error", err instanceof Error ? err.message : "Failed to connect.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: string, email: string) {
    if (!confirm(`Remove ${email}?`)) return;
    await fetch("/api/mail/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    await loadAccounts();
  }

  async function handleSetPrimary(id: string) {
    await fetch("/api/mail/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "set-primary", id }),
    });
    await loadAccounts();
  }

  const primaryAccount = useMemo(() => accounts.find((acc) => acc.isPrimary) ?? null, [accounts]);

  return (
    <div className="min-h-full bg-[#F4F7FB]">

      {/* Page header */}
      <div className="border-b border-slate-200/80 bg-white/80 backdrop-blur-xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#0044BC]">Mail settings</div>
            <h1 className="mt-1 text-xl font-bold tracking-tight text-[#0F172A]">Email Accounts</h1>
            <p className="mt-1 text-sm text-[#64748B]">Connect IMAP/SMTP accounts to read and send mail inside Carimail.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF914D] to-[#FF7A2F] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(255,145,77,0.28)] transition hover:shadow-[0_8px_24px_rgba(255,145,77,0.36)]"
          >
            <Plus className="h-4 w-4" />
            {showForm ? "Cancel" : "Connect account"}
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">

        {/* Notices */}
        {(error || success) && (
          <Notice type={error ? "error" : "success"} message={error || success} onDismiss={() => { setError(""); setSuccess(""); }} />
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[
            { label: "Connected", value: loading ? "—" : String(accounts.length), icon: <Mail className="h-4 w-4" />, color: "text-[#0044BC] bg-[#EEF4FF]" },
            { label: "Primary mailbox", value: primaryAccount ? primaryAccount.emailAddress.split("@")[0] : "None set", icon: <Star className="h-4 w-4" />, color: "text-[#FF914D] bg-[#FFF6EE]" },
            { label: "Provider support", value: "Any IMAP", icon: <Wifi className="h-4 w-4" />, color: "text-emerald-700 bg-emerald-50", hideOnMobile: true },
          ].map((stat) => (
            <div key={stat.label} className={`rounded-[20px] border border-white/70 bg-white/90 px-4 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.05)] backdrop-blur-xl ${"hideOnMobile" in stat && stat.hideOnMobile ? "hidden sm:block" : ""}`}>
              <div className={`mb-2.5 inline-flex h-8 w-8 items-center justify-center rounded-xl ${stat.color}`}>{stat.icon}</div>
              <div className="truncate text-base font-bold text-[#0F172A]">{stat.value}</div>
              <div className="text-[11px] font-medium text-[#94A3B8]">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Add account form */}
        {showForm && (
          <div className="overflow-hidden rounded-[24px] border border-[#FF914D]/20 bg-white/95 shadow-[0_12px_40px_rgba(255,145,77,0.10)] backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-[#0F172A]/6 bg-gradient-to-r from-[#FFF6EE] to-white px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF914D] to-[#FF7A2F] text-white shadow-[0_4px_12px_rgba(255,145,77,0.30)]">
                  <Plus className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[#0F172A]">Connect email account</div>
                  <div className="text-xs text-[#64748B]">Works with Gmail, Outlook, Yahoo, cPanel, and more</div>
                </div>
              </div>
              <button type="button" onClick={() => setShowForm(false)}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-[#94A3B8] hover:bg-slate-100 hover:text-[#64748B] transition">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="p-5">
              <div className="grid gap-5 lg:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-xs font-semibold text-[#334155]">Provider</label>
                    <div className="flex flex-wrap gap-2">
                      {PRESETS.map((p, i) => (
                        <button key={p.label} type="button" onClick={() => applyPreset(i)}
                          className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${preset === i ? "border-[#FF914D]/30 bg-[#FF914D]/10 text-[#FF914D]" : "border-[#0F172A]/8 bg-[#F8FAFC] text-[#64748B] hover:bg-white hover:border-[#0F172A]/15"}`}>
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-[#334155]">Email address <span className="text-red-400">*</span></label>
                    <input type="email" value={emailAddress} onChange={(e) => setEmailAddress(e.target.value)} required placeholder="you@example.com" className={inputCls} />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-[#334155]">Password <span className="text-red-400">*</span></label>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Email or app password" className={`${inputCls} pr-10`} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B] transition">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="mt-1.5 text-[11px] text-[#94A3B8]">Gmail and Yahoo require an app-specific password.</p>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-[#334155]">Label <span className="text-[#94A3B8] font-normal">(optional)</span></label>
                    <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Work, Personal, Business…" className={inputCls} />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/60 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                        <ShieldCheck className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-emerald-800">Secure by default</p>
                        <p className="mt-1 text-xs leading-relaxed text-emerald-700">Passwords are AES-256 encrypted before storage. Your credentials are never logged or exposed.</p>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-[#0F172A]/8 bg-[#F8FAFC]">
                    <button type="button" onClick={() => setAdvanced(!advanced)} className="flex w-full items-center justify-between px-4 py-3 text-left">
                      <div>
                        <div className="text-xs font-semibold text-[#334155]">Advanced — IMAP / SMTP</div>
                        <div className="mt-0.5 text-[11px] text-[#94A3B8]">{imapHost ? `${imapHost}:${imapPort}` : "Configure manually"}</div>
                      </div>
                      <div className={`flex h-6 w-6 items-center justify-center rounded-lg transition ${advanced ? "bg-[#0044BC] text-white" : "border border-[#0F172A]/10 bg-white text-[#64748B]"}`}>
                        {advanced ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </div>
                    </button>
                    {advanced && (
                      <div className="grid gap-3 border-t border-[#0F172A]/6 p-4">
                        <div>
                          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#94A3B8]">IMAP Host</label>
                          <input value={imapHost} onChange={(e) => setImapHost(e.target.value)} className={inputCls} />
                        </div>
                        <div>
                          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#94A3B8]">IMAP Port</label>
                          <input type="number" value={imapPort} onChange={(e) => setImapPort(Number(e.target.value))} className={inputCls} />
                        </div>
                        <div>
                          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#94A3B8]">SMTP Host</label>
                          <input value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} className={inputCls} />
                        </div>
                        <div>
                          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#94A3B8]">SMTP Port</label>
                          <input type="number" value={smtpPort} onChange={(e) => setSmtpPort(Number(e.target.value))} className={inputCls} />
                        </div>
                      </div>
                    )}
                  </div>

                  <button type="submit" disabled={busy}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0044BC] py-3 text-sm font-semibold text-white transition hover:bg-[#003399] disabled:opacity-60">
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                    {busy ? "Connecting…" : "Connect account"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Accounts list */}
        <div className="overflow-hidden rounded-[24px] border border-white/70 bg-white/90 shadow-[0_12px_32px_rgba(15,23,42,0.06)] backdrop-blur-xl">
          <div className="border-b border-[#0F172A]/6 px-5 py-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0044BC]">Connected accounts</div>
            <p className="mt-0.5 text-sm text-[#64748B]">
              {loading ? "Loading…" : accounts.length === 0 ? "No accounts connected yet." : `${accounts.length} account${accounts.length !== 1 ? "s" : ""}${primaryAccount ? ` · ${primaryAccount.emailAddress} is primary` : ""}`}
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-3 py-16 text-sm text-[#64748B]">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : accounts.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EEF4FF] text-[#0044BC]">
                <Mail className="h-8 w-8" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0F172A]">No accounts connected yet</p>
                <p className="mt-1 text-sm text-[#64748B]">Click "Connect account" above to add your first mailbox.</p>
              </div>
              <button type="button" onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#0044BC] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#003399]">
                <Plus className="h-4 w-4" />Connect account
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#0F172A]/5">
              {accounts.map((acc) => (
                <div key={acc.id} className="flex flex-col gap-3 px-5 py-4 transition hover:bg-slate-50/60 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3.5">
                    <AccountAvatar email={acc.emailAddress} />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-sm font-semibold text-[#0F172A]">{acc.emailAddress}</span>
                        {acc.isPrimary && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#EEF4FF] px-2 py-0.5 text-[10px] font-bold text-[#0044BC]">
                            <Star className="h-2.5 w-2.5" />Primary
                          </span>
                        )}
                        {acc.label && (
                          <span className="rounded-full border border-[#0F172A]/8 bg-[#F8FAFC] px-2 py-0.5 text-[10px] font-medium text-[#64748B]">{acc.label}</span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-1.5 text-[11px] text-[#94A3B8]">
                        <Server className="h-3 w-3 shrink-0" />
                        <span className="truncate">{acc.imapHost}</span>
                        <span className="text-[#CBD5E1]">·</span>
                        <span className="truncate">{acc.smtpHost}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2 pl-[54px] sm:pl-0">
                    {!acc.isPrimary && (
                      <button type="button" onClick={() => handleSetPrimary(acc.id)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-[#0F172A]/8 bg-white px-3 py-1.5 text-xs font-semibold text-[#64748B] transition hover:border-[#0044BC]/20 hover:bg-[#EEF4FF] hover:text-[#0044BC]">
                        <Star className="h-3.5 w-3.5" />Set primary
                      </button>
                    )}
                    <button type="button" onClick={() => handleDelete(acc.id, acc.emailAddress)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100">
                      <Trash2 className="h-3.5 w-3.5" />Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && accounts.length > 0 && (
            <div className="border-t border-[#0F172A]/6 px-5 py-3.5">
              <button type="button" onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#0044BC] transition hover:underline">
                <Plus className="h-4 w-4" />Add another account
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}