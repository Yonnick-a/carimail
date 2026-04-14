// app/(mail)/settings/page.tsx
import Link from "next/link";
import { Mail, User, Shield, ChevronRight, Sparkles } from "lucide-react";

const sections = [
  {
    href: "/settings/accounts",
    icon: <Mail className="h-5 w-5" />,
    bg: "bg-[#EEF4FF] text-[#0044BC]",
    label: "Email Accounts",
    desc: "Connect and manage your IMAP/SMTP email accounts.",
  },
  {
    href: "/settings/profile",
    icon: <User className="h-5 w-5" />,
    bg: "bg-[#FFF6EE] text-[#FF914D]",
    label: "Profile",
    desc: "Update your name, email address, and password.",
  },
  {
    href: "/settings/security",
    icon: <Shield className="h-5 w-5" />,
    bg: "bg-emerald-50 text-emerald-700",
    label: "Security",
    desc: "Manage your active sessions and account security.",
  },
];

export default function SettingsPage() {
  return (
    <div className="min-h-full bg-[#F4F7FB]">
      <div className="border-b border-slate-200/80 bg-white/80 backdrop-blur-xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl">
          <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#0044BC]">Carimail</div>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-[#0F172A]">Settings</h1>
          <p className="mt-1 text-sm text-[#64748B]">Manage your account, mailboxes, and security preferences.</p>
        </div>
      </div>

      <div className="mx-auto max-w-xl px-4 py-6 sm:px-6 lg:px-8 space-y-5">
        <div className="overflow-hidden rounded-[24px] border border-white/70 bg-white/90 shadow-[0_12px_32px_rgba(15,23,42,0.06)] backdrop-blur-xl divide-y divide-[#0F172A]/6">
          {sections.map((s) => (
            <Link key={s.href} href={s.href} className="group flex items-center gap-4 px-5 py-4 transition hover:bg-[#F8FAFC]">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition group-hover:scale-[1.05] ${s.bg}`}>
                {s.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-[#0F172A]">{s.label}</div>
                <p className="mt-0.5 text-xs text-[#64748B]">{s.desc}</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-[#CBD5E1] transition group-hover:translate-x-0.5 group-hover:text-[#0044BC]" />
            </Link>
          ))}
        </div>

        <div className="relative overflow-hidden rounded-[24px] border border-[#0044BC]/10 bg-gradient-to-br from-[#EEF4FF] to-[#F8FAFC] px-5 py-5">
          <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#FF914D]/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-6 right-12 h-20 w-20 rounded-full bg-[#0044BC]/10 blur-2xl" />
          <div className="relative flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF914D] to-[#0044BC] text-white shadow-[0_4px_12px_rgba(0,68,188,0.20)]">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold uppercase tracking-[0.20em] text-[#0044BC]">Carimail by Hostcari</div>
              <p className="mt-1 text-xs leading-relaxed text-[#64748B]">
                Version 0.1.0 — Built with care for your inbox. Connect any IMAP/SMTP provider and manage all your mail in one place.
              </p>
              <Link href="https://hostcari.com" target="_blank" rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#0044BC] hover:underline">
                Visit hostcari.com <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}