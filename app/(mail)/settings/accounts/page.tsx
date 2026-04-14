"use client";
// app/(mail)/settings/accounts/page.tsx
import { useEffect, useState } from "react";
import {
  AlertCircle, CheckCircle2, Loader2, Mail, Plus,
  Star, Trash2, X, ChevronDown, ChevronUp, Eye, EyeOff,
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

const inputCls = "w-full rounded-xl border border-[#0F172A]/10 bg-[#F8FAFC] px-3.5 py-2.5 text-sm text-[#0F172A] outline-none transition focus:border-[#FF914D] focus:bg-white focus:ring-4 focus:ring-[#FF914D]/15 placeholder:text-[#94A3B8]";

const PRESETS = [
  { label: "Hostcari / cPanel", imapHost: "mail.hostcari.com", imapPort: 993, smtpHost: "mail.hostcari.com", smtpPort: 465 },
  { label: "Gmail", imapHost: "imap.gmail.com", imapPort: 993, smtpHost: "smtp.gmail.com", smtpPort: 465 },
  { label: "Outlook / Hotmail", imapHost: "outlook.office365.com", imapPort: 993, smtpHost: "smtp.office365.com", smtpPort: 587 },
  { label: "Yahoo Mail", imapHost: "imap.mail.yahoo.com", imapPort: 993, smtpHost: "smtp.mail.yahoo.com", smtpPort: 465 },
  { label: "Custom", imapHost: "", imapPort: 993, smtpHost: "", smtpPort: 465 },
];

export default function AccountsSettingsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form state
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
    } catch {}
    finally { setLoading(false); }
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
        body: JSON.stringify({ emailAddress, password, label: label || undefined, imapHost, imapPort, imapSecure: true, smtpHost, smtpPort, smtpSecure: smtpPort !== 587 }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Failed.");
      notify("success", `${emailAddress} connected successfully.`);
      setShowForm(false);
      setEmailAddress(""); setPassword(""); setLabel("");
      await loadAccounts();
    } catch (err) {
      notify("error", err instanceof Error ? err.message : "Failed to connect.");
    } finally { setBusy(false); }
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

  return (
    <div className="min-h-full bg-[#F4F7FB] p-6">
      <div className="mx-auto max-w-2xl space-y-5">
        <div>
          <h1 className="text-xl font-bold text-[#0F172A]">Email Accounts</h1>
          <p className="mt-1 text-sm text-[#64748B]">Connect your IMAP/SMTP email accounts to use in Carimail.</p>
        </div>

        {(error || success) && (
          <div className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm ${error ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
            {error ? <AlertCircle className="h-4 w-4 shrink-0" /> : <CheckCircle2 className="h-4 w-4 shrink-0" />}
            {error || success}
          </div>
        )}

        {/* Existing accounts */}
        <div className="overflow-hidden rounded-[24px] border border-white/70 bg-white/90 shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
          <div className="border-b border-[#0F172A]/6 px-5 py-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0044BC]">Connected accounts</div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2.5 py-12 text-sm text-[#64748B]">
              <Loader2 className="h-5 w-5 animate-spin" />Loading…
            </div>
          ) : accounts.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <Mail className="h-10 w-10 text-slate-200" />
              <p className="text-sm text-[#64748B]">No accounts connected yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#0F172A]/6">
              {accounts.map((acc) => (
                <div key={acc.id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FF914D] to-[#0044BC] text-sm font-bold text-white">
                      {acc.emailAddress.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-semibold text-[#0F172A]">{acc.emailAddress}</span>
                        {acc.isPrimary && (
                          <span className="shrink-0 rounded-full bg-[#EEF4FF] px-2 py-0.5 text-[10px] font-bold text-[#0044BC]">Primary</span>
                        )}
                      </div>
                      <div className="text-xs text-[#94A3B8]">{acc.label || acc.imapHost}</div>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {!acc.isPrimary && (
                      <button type="button" onClick={() => handleSetPrimary(acc.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#0F172A]/8 text-[#94A3B8] hover:bg-[#EEF4FF] hover:text-[#0044BC]"
                        title="Set as primary">
                        <Star className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button type="button" onClick={() => handleDelete(acc.id, acc.emailAddress)}
                      className="flex h-8 w-8 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-500 hover:bg-red-100">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-[#0F172A]/6 px-5 py-4">
            <button type="button" onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#0044BC] hover:underline">
              <Plus className="h-4 w-4" />{showForm ? "Cancel" : "Connect new account"}
            </button>
          </div>
        </div>

        {/* Add account form */}
        {showForm && (
          <div className="overflow-hidden rounded-[24px] border border-white/70 bg-white/90 shadow-[0_12px_32px_rgba(15,23,42,0.06)] animate-fade-up">
            <div className="border-b border-[#0F172A]/6 px-5 py-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0044BC]">New account</div>
              <h3 className="mt-0.5 text-base font-semibold text-[#0F172A]">Connect email account</h3>
            </div>

            <form onSubmit={handleAdd} className="space-y-5 p-5">
              {/* Provider preset */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-[#334155]">Email provider</label>
                <div className="flex flex-wrap gap-2">
                  {PRESETS.map((p, i) => (
                    <button key={p.label} type="button" onClick={() => applyPreset(i)}
                      className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${preset === i ? "border-[#FF914D]/30 bg-[#FF914D]/10 text-[#FF914D]" : "border-[#0F172A]/8 bg-[#F8FAFC] text-[#64748B] hover:bg-white"}`}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold text-[#334155]">Email address <span className="text-red-400">*</span></label>
                  <input type="email" value={emailAddress} onChange={(e) => setEmailAddress(e.target.value)} required placeholder="you@example.com" className={inputCls} />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold text-[#334155]">Password <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Your email/app password" className={`${inputCls} pr-10`} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B]">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="mt-1 text-[11px] text-[#94A3B8]">For Gmail/Yahoo, use an App Password. Your password is encrypted and never stored in plain text.</p>
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold text-[#334155]">Label (optional)</label>
                  <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Work, Personal…" className={inputCls} />
                </div>
              </div>

              {/* Advanced IMAP/SMTP settings */}
              <div>
                <button type="button" onClick={() => setAdvanced(!advanced)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#0F172A]">
                  {advanced ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  Advanced settings (IMAP / SMTP)
                </button>

                {advanced && (
                  <div className="mt-3 grid gap-3 rounded-2xl border border-[#0F172A]/6 bg-[#F8FAFC] p-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold text-[#334155]">IMAP Host</label>
                      <input value={imapHost} onChange={(e) => setImapHost(e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold text-[#334155]">IMAP Port</label>
                      <input type="number" value={imapPort} onChange={(e) => setImapPort(Number(e.target.value))} className={inputCls} />
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold text-[#334155]">SMTP Host</label>
                      <input value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold text-[#334155]">SMTP Port</label>
                      <input type="number" value={smtpPort} onChange={(e) => setSmtpPort(Number(e.target.value))} className={inputCls} />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button type="submit" disabled={busy}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#0044BC] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#003399] disabled:opacity-60">
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                  {busy ? "Connecting…" : "Connect account"}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-[#64748B] hover:bg-slate-50">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
