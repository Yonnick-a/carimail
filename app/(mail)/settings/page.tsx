"use client";
// app/(mail)/settings/page.tsx

import Link from "next/link";
import { Mail, User, Shield, ChevronRight, ExternalLink, Download, Upload } from "lucide-react";
import { useEffect, useState } from "react";

const sections = [
  {
    href: "/settings/accounts",
    icon: <Mail className="h-5 w-5" />,
    iconStyle: { background: "var(--cm-blue-light)", color: "var(--cm-blue)" },
    label: "Email Accounts",
    desc: "Connect and manage your IMAP/SMTP email accounts.",
    badge: null,
  },
  {
    href: "/settings/profile",
    icon: <User className="h-5 w-5" />,
    iconStyle: { background: "var(--cm-accent-dim)", color: "var(--cm-accent)" },
    label: "Profile",
    desc: "Update your display name and account password.",
    badge: null,
  },
  {
    href: "/settings/security",
    icon: <Shield className="h-5 w-5" />,
    iconStyle: { background: "rgba(16,185,129,0.10)", color: "#10B981" },
    label: "Security",
    desc: "Manage your active sessions and account access.",
    badge: null,
  },
];

export default function SettingsPage() {
  const [accounts, setAccounts] = useState<{ id: string; emailAddress: string }[]>([]);
  const [accountId, setAccountId] = useState("");
  const [features, setFeatures] = useState<any>({});
  const [sigName, setSigName] = useState("Default");
  const [sigHtml, setSigHtml] = useState("");
  const [ruleName, setRuleName] = useState("");
  const [ruleField, setRuleField] = useState("from");
  const [ruleValue, setRuleValue] = useState("");
  const [ruleAction, setRuleAction] = useState("tag");
  const [ruleDestination, setRuleDestination] = useState("");

  useEffect(() => {
    fetch("/api/mail/accounts").then(r => r.json()).then(d => {
      const list = d.accounts || [];
      setAccounts(list);
      setAccountId(list[0]?.id || "");
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!accountId) return;
    refreshFeatures().catch(() => {});
  }, [accountId]);

  async function refreshFeatures() {
    if (!accountId) return;
    const refreshed = await fetch(`/api/mail/features?accountId=${accountId}`, { cache: "no-store" }).then(r => r.json());
    setFeatures(refreshed);
  }

  async function saveSignature() {
    if (!accountId) return;
    await fetch("/api/mail/features", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "signature", accountId, name: sigName, html: sigHtml, isDefault: true }),
    });
    await refreshFeatures();
    setSigHtml("");
  }

  async function saveRule() {
    if (!accountId || !ruleValue.trim()) return;
    await fetch("/api/mail/features", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "rule",
        accountId,
        name: ruleName || `${ruleField} contains ${ruleValue}`,
        field: ruleField,
        operator: "contains",
        value: ruleValue,
        ruleAction,
        destination: ruleDestination || null,
      }),
    });
    setRuleName("");
    setRuleValue("");
    setRuleDestination("");
    await refreshFeatures();
  }

  async function deleteFeature(feature: string, id: string) {
    if (!accountId) return;
    await fetch("/api/mail/features", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete-feature", accountId, feature, id }),
    });
    await refreshFeatures();
  }
  async function exportSettings() {
    const res = await fetch("/api/mail/features?type=export", { cache: "no-store" });
    const data = await res.json();
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "carimail-settings.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function importSettings(file: File | null) {
    if (!file) return;
    const data = JSON.parse(await file.text());
    await fetch("/api/mail/features", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "import", rules: data.rules || [] }),
    });
    alert("Settings import finished.");
  }

  return (
    <div className="min-h-full" style={{ background: "var(--cm-bg)" }}>
      {/* Header */}
      <div className="border-b px-4 py-5 sm:px-6 lg:px-8" style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)" }}>
        <div className="mx-auto max-w-[1500px]">
          <p className="text-[10px] font-[700] uppercase tracking-[0.24em]" style={{ color: "var(--cm-blue)" }}>Carimail</p>
          <h1 className="mt-1 text-[20px] font-[800] tracking-tight" style={{ color: "var(--cm-text)" }}>Settings</h1>
          <p className="mt-1 text-[13px]" style={{ color: "var(--cm-text2)" }}>
            Manage your account, mailboxes, and security preferences.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8">
        {/* Nav cards */}
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <div className="overflow-hidden rounded-2xl border" style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)" }}>
          {sections.map((s, i) => (
            <Link key={s.href} href={s.href}
              className="group flex items-center gap-4 px-5 py-4 transition"
              style={{ borderBottom: i < sections.length - 1 ? `1px solid var(--cm-border)` : "none" }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--cm-surface2)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition duration-200 group-hover:scale-[1.05]"
                style={s.iconStyle}>
                {s.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[13.5px] font-[700]" style={{ color: "var(--cm-text)" }}>{s.label}</div>
                <p className="mt-0.5 text-[11.5px]" style={{ color: "var(--cm-text2)" }}>{s.desc}</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 transition group-hover:translate-x-0.5"
                style={{ color: "var(--cm-text3)" }} />
            </Link>
          ))}
        </div>

        {/* About card */}
        <div className="relative overflow-hidden rounded-2xl border px-5 py-5"
          style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)" }}>
          {/* Ambient */}
          <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl"
            style={{ background: "var(--cm-accent-dim)" }} />
          <div className="pointer-events-none absolute -bottom-6 right-12 h-20 w-20 rounded-full blur-2xl"
            style={{ background: "var(--cm-blue-dim)" }} />

          <div className="relative flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white shadow"
              style={{ background: "linear-gradient(135deg, var(--cm-accent), var(--cm-blue))" }}>
              <span className="text-sm">✉️</span>
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-[700] uppercase tracking-[0.20em]" style={{ color: "var(--cm-blue)" }}>
                Carimail by Hostcari
              </div>
              <p className="mt-1 text-[11.5px] leading-relaxed" style={{ color: "var(--cm-text2)" }}>
                Version 1.0 — Connect any IMAP/SMTP provider and manage all your mail in one polished place.
                Built for Hostcari clients and anyone who wants a better inbox.
              </p>
              <Link href="https://hostcari.com" target="_blank" rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-[11.5px] font-[700] hover:underline"
                style={{ color: "var(--cm-blue)" }}>
                Visit hostcari.com <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
        </div>

        <div className="mt-4 rounded-2xl border px-5 py-4" style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)" }}>
          <p className="text-[13.5px] font-[800]" style={{ color: "var(--cm-text)" }}>Import / Export</p>
          <p className="mt-1 text-[12px]" style={{ color: "var(--cm-text2)" }}>Export account metadata and rules, or import rules from another Carimail workspace.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={exportSettings} className="inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-[12px] font-[800]" style={{ borderColor: "var(--cm-border)", color: "var(--cm-text2)" }}>
              <Download className="h-4 w-4" />Export
            </button>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border px-3.5 py-2 text-[12px] font-[800]" style={{ borderColor: "var(--cm-border)", color: "var(--cm-text2)" }}>
              <Upload className="h-4 w-4" />Import
              <input type="file" accept="application/json" className="hidden" onChange={e => importSettings(e.target.files?.[0] || null)} />
            </label>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border px-5 py-5" style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)" }}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[13.5px] font-[800]" style={{ color: "var(--cm-text)" }}>Mail Automation</p>
              <p className="mt-1 text-[12px]" style={{ color: "var(--cm-text2)" }}>Manage scheduled mail, snoozes, reminders, rules, and signatures.</p>
            </div>
            <select value={accountId} onChange={e => setAccountId(e.target.value)} className="rounded-xl border px-3 py-2 text-[12px] outline-none" style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface2)", color: "var(--cm-text)" }}>
              {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.emailAddress}</option>)}
            </select>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-4">
            {[
              ["Scheduled", features.scheduled?.length || 0],
              ["Snoozed", features.snoozes?.length || 0],
              ["Reminders", features.reminders?.length || 0],
              ["Rules", features.rules?.length || 0],
            ].map(([label, count]) => (
              <div key={label} className="rounded-2xl border px-4 py-3" style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface2)" }}>
                <p className="text-[20px] font-[900]" style={{ color: "var(--cm-text)" }}>{count}</p>
                <p className="text-[11px] font-[700]" style={{ color: "var(--cm-text3)" }}>{label}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border p-4" style={{ borderColor: "var(--cm-border)" }}>
              <p className="text-[12.5px] font-[800]" style={{ color: "var(--cm-text)" }}>Rules</p>
              <div className="mt-3 grid gap-2">
                <input value={ruleName} onChange={e => setRuleName(e.target.value)} placeholder="Rule name" className="rounded-xl border px-3 py-2 text-[12px] outline-none" style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface2)", color: "var(--cm-text)" }} />
                <div className="grid gap-2 sm:grid-cols-3">
                  <select value={ruleField} onChange={e => setRuleField(e.target.value)} className="rounded-xl border px-3 py-2 text-[12px] outline-none" style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface2)", color: "var(--cm-text)" }}>
                    <option value="from">From</option>
                    <option value="subject">Subject</option>
                    <option value="to">To</option>
                  </select>
                  <input value={ruleValue} onChange={e => setRuleValue(e.target.value)} placeholder="Contains" className="rounded-xl border px-3 py-2 text-[12px] outline-none" style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface2)", color: "var(--cm-text)" }} />
                  <select value={ruleAction} onChange={e => setRuleAction(e.target.value)} className="rounded-xl border px-3 py-2 text-[12px] outline-none" style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface2)", color: "var(--cm-text)" }}>
                    <option value="tag">Tag</option>
                    <option value="move">Move</option>
                    <option value="archive">Archive</option>
                    <option value="read">Mark read</option>
                  </select>
                </div>
                {ruleAction === "move" && (
                  <input value={ruleDestination} onChange={e => setRuleDestination(e.target.value)} placeholder="Destination folder path" className="rounded-xl border px-3 py-2 text-[12px] outline-none" style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface2)", color: "var(--cm-text)" }} />
                )}
                <button type="button" onClick={saveRule} className="w-fit rounded-xl px-3 py-2 text-[12px] font-[800] text-white" style={{ background: "var(--cm-blue)" }}>Create rule</button>
              </div>
              <div className="mt-4 space-y-2">
                {(features.rules || []).map((rule: any) => (
                  <FeatureRow key={rule.id} title={rule.name} meta={`${rule.field} contains "${rule.value}" -> ${rule.action}${rule.destination ? ` ${rule.destination}` : ""}`} onDelete={() => deleteFeature("rule", rule.id)} />
                ))}
              </div>
            </div>

            <div className="rounded-2xl border p-4" style={{ borderColor: "var(--cm-border)" }}>
              <p className="text-[12.5px] font-[800]" style={{ color: "var(--cm-text)" }}>Scheduled, snoozed, and reminders</p>
              <div className="mt-3 space-y-2">
                {(features.scheduled || []).map((item: any) => (
                  <FeatureRow key={item.id} title={item.payload?.subject || "Scheduled email"} meta={`Sends ${new Date(item.scheduledAt).toLocaleString()}`} onDelete={() => deleteFeature("scheduled", item.id)} />
                ))}
                {(features.snoozes || []).map((item: any) => (
                  <FeatureRow key={item.id} title={`Snoozed message #${item.uid}`} meta={`Returns ${new Date(item.until).toLocaleString()}`} onDelete={() => deleteFeature("snooze", item.id)} />
                ))}
                {(features.reminders || []).map((item: any) => (
                  <FeatureRow key={item.id} title={item.note || `Reminder #${item.uid}`} meta={`Remind ${new Date(item.remindAt).toLocaleString()}`} onDelete={() => deleteFeature("reminder", item.id)} />
                ))}
                {!features.scheduled?.length && !features.snoozes?.length && !features.reminders?.length && (
                  <p className="text-[11.5px]" style={{ color: "var(--cm-text3)" }}>No scheduled sends, snoozes, or reminders for this account.</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border p-4" style={{ borderColor: "var(--cm-border)" }}>
              <p className="text-[12.5px] font-[800]" style={{ color: "var(--cm-text)" }}>HTML signature</p>
              <input value={sigName} onChange={e => setSigName(e.target.value)} className="mt-3 w-full rounded-xl border px-3 py-2 text-[12px] outline-none" style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface2)", color: "var(--cm-text)" }} />
              <textarea value={sigHtml} onChange={e => setSigHtml(e.target.value)} rows={5} placeholder="<strong>Your Name</strong><br>Company"
                className="mt-2 w-full rounded-xl border px-3 py-2 text-[12px] font-mono outline-none" style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface2)", color: "var(--cm-text)" }} />
              <button type="button" onClick={saveSignature} className="mt-2 rounded-xl px-3 py-2 text-[12px] font-[800] text-white" style={{ background: "var(--cm-blue)" }}>Save signature</button>
            </div>
            <div className="rounded-2xl border p-4" style={{ borderColor: "var(--cm-border)" }}>
              <p className="text-[12.5px] font-[800]" style={{ color: "var(--cm-text)" }}>Current signatures</p>
              <div className="mt-3 space-y-2">
                {(features.signatures || []).map((sig: any) => (
                  <div key={sig.id} className="rounded-xl border px-3 py-2" style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface2)" }}>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[12px] font-[800]" style={{ color: "var(--cm-text)" }}>{sig.name}{sig.isDefault ? " · Default" : ""}</p>
                      <button type="button" onClick={() => deleteFeature("signature", sig.id)} className="text-[10px] font-[800]" style={{ color: "#dc2626" }}>Delete</button>
                    </div>
                    <div className="mt-1 overflow-hidden rounded-lg" style={{ maxHeight: 60 }}>
                      <iframe
                        sandbox="allow-same-origin"
                        srcDoc={`<!DOCTYPE html><html><head><style>body{margin:0;font-size:11px;font-family:system-ui,sans-serif;color:#475569;overflow:hidden}*{max-width:100%}</style></head><body>${sig.html}</body></html>`}
                        title={`Signature: ${sig.name}`}
                        style={{ width: "100%", height: 60, border: "none", display: "block" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureRow({ title, meta, onDelete }: { title: string; meta: string; onDelete: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border px-3 py-2" style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface2)" }}>
      <div className="min-w-0">
        <p className="truncate text-[12px] font-[800]" style={{ color: "var(--cm-text)" }}>{title}</p>
        <p className="truncate text-[10.5px]" style={{ color: "var(--cm-text3)" }}>{meta}</p>
      </div>
      <button type="button" onClick={onDelete} className="shrink-0 text-[10px] font-[800]" style={{ color: "#dc2626" }}>Delete</button>
    </div>
  );
}
