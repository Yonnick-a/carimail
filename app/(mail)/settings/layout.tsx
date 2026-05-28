"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, Shield, User } from "lucide-react";

const nav = [
  { href: "/settings/accounts", label: "Accounts", icon: Mail },
  { href: "/settings/profile", label: "Profile", icon: User },
  { href: "/settings/security", label: "Security", icon: Shield },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div data-cm-readable className="flex min-h-0 flex-1 flex-col overflow-hidden" style={{ background: "var(--cm-bg)" }}>
      {/* Mobile tab bar */}
      <nav
        className="flex shrink-0 gap-1 overflow-x-auto border-b px-3 py-2 lg:hidden"
        style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)" }}
      >
        {nav.map(item => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-[12.5px] font-[700] transition"
              style={{
                background: active ? "var(--cm-active-bg)" : "transparent",
                color: active ? "var(--cm-accent)" : "var(--cm-text2)",
              }}
            >
              <Icon className="h-3.5 w-3.5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <aside
          className="hidden w-60 shrink-0 border-r px-3 py-4 lg:block"
          style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)" }}
        >
          <div className="px-3 pb-3">
            <p className="text-[10px] font-[800] uppercase tracking-[0.22em]" style={{ color: "var(--cm-blue)" }}>Settings</p>
            <h2 className="mt-1 text-[17px] font-[900]" style={{ color: "var(--cm-text)" }}>Workspace</h2>
          </div>
          <nav className="space-y-0.5">
            {nav.map(item => {
              const Icon = item.icon;
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13.5px] font-[600] transition"
                  style={{
                    background: active ? "var(--cm-active-bg)" : "transparent",
                    color: active ? "var(--cm-active-text)" : "var(--cm-text2)",
                  }}
                  onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = "var(--cm-hover-bg)"; (e.currentTarget as HTMLElement).style.color = "var(--cm-hover-text)"; } }}
                  onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--cm-text2)"; } }}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r-full" style={{ background: "var(--cm-accent)" }} />
                  )}
                  <Icon className="h-4 w-4 shrink-0" style={{ color: active ? "var(--cm-accent)" : "inherit" }} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <section className="min-w-0 flex-1 overflow-y-auto">{children}</section>
      </div>
    </div>
  );
}
