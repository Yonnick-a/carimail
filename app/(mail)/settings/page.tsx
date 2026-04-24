// app/(mail)/settings/page.tsx
"use client"

import Link from "next/link";
import { Mail, User, Shield, ChevronRight, ExternalLink } from "lucide-react";

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
  return (
    <div className="min-h-full" style={{ background: "var(--cm-bg)" }}>
      {/* Header */}
      <div className="border-b px-4 py-5 sm:px-6 lg:px-8" style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)" }}>
        <div className="mx-auto max-w-xl">
          <p className="text-[10px] font-[700] uppercase tracking-[0.24em]" style={{ color: "var(--cm-blue)" }}>Carimail</p>
          <h1 className="mt-1 text-[20px] font-[800] tracking-tight" style={{ color: "var(--cm-text)" }}>Settings</h1>
          <p className="mt-1 text-[13px]" style={{ color: "var(--cm-text2)" }}>
            Manage your account, mailboxes, and security preferences.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-xl px-4 py-6 sm:px-6 lg:px-8 space-y-4">
        {/* Nav cards */}
        <div className="overflow-hidden rounded-[22px] border" style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)" }}>
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
        <div className="relative overflow-hidden rounded-[22px] border px-5 py-5"
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
    </div>
  );
}