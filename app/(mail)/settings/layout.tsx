import Link from "next/link";
import { Mail, Shield, User } from "lucide-react";

const nav = [
  { href: "/settings/accounts", label: "Accounts", icon: Mail },
  { href: "/settings/profile", label: "Profile", icon: User },
  { href: "/settings/security", label: "Security", icon: Shield },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-0 flex-1 overflow-hidden" style={{ background: "var(--cm-bg)" }}>
      <aside className="hidden w-60 shrink-0 border-r px-3 py-4 lg:block" style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)" }}>
        <div className="px-3 pb-3">
          <p className="text-[10px] font-[800] uppercase tracking-[0.22em]" style={{ color: "var(--cm-blue)" }}>Settings</p>
          <h2 className="mt-1 text-[17px] font-[900]" style={{ color: "var(--cm-text)" }}>Workspace</h2>
        </div>
        <nav className="space-y-1">
          {nav.map(item => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-[700] transition hover:opacity-80" style={{ color: "var(--cm-text2)" }}>
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <section className="min-w-0 flex-1 overflow-y-auto">{children}</section>
    </div>
  );
}
