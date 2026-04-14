// app/(mail)/settings/page.tsx
import Link from "next/link";
import { Mail, User, Shield, Bell, ChevronRight } from "lucide-react";

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
    desc: "Manage your sessions and account security.",
  },
];

export default function SettingsPage() {
  return (
    <div className="min-h-full bg-[#F4F7FB] p-6">
      <div className="mx-auto max-w-xl space-y-5">
        <div>
          <h1 className="text-xl font-bold text-[#0F172A]">Settings</h1>
          <p className="mt-1 text-sm text-[#64748B]">Manage your Carimail account and preferences.</p>
        </div>

        <div className="overflow-hidden rounded-[24px] border border-white/70 bg-white/90 shadow-[0_12px_32px_rgba(15,23,42,0.06)] divide-y divide-[#0F172A]/6">
          {sections.map((s) => (
            <Link key={s.href} href={s.href}
              className="flex items-center gap-4 px-5 py-4 transition hover:bg-[#F8FAFC] group">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${s.bg}`}>
                {s.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-[#0F172A]">{s.label}</div>
                <div className="text-xs text-[#64748B]">{s.desc}</div>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-[#94A3B8] transition group-hover:translate-x-0.5 group-hover:text-[#0044BC]" />
            </Link>
          ))}
        </div>

        <div className="rounded-[24px] border border-[#0044BC]/10 bg-[#EEF4FF] px-5 py-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0044BC]">Carimail by Hostcari</div>
          <p className="mt-1 text-xs text-[#64748B]">Version 0.1.0 — Built with care for your inbox.</p>
          <Link href="https://hostcari.com" target="_blank" className="mt-1.5 block text-xs font-semibold text-[#0044BC] hover:underline">
            hostcari.com →
          </Link>
        </div>
      </div>
    </div>
  );
}
