import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Check, ExternalLink } from "lucide-react";
import { getSession } from "@/lib/auth";
import { MarketingNavbar } from "@/components/landing/Navbar";
import { FaqAccordion } from "@/components/landing/FaqAccordion";
import { LogoCarousel } from "@/components/landing/LogoCarousel";
import { AnimateIn } from "@/components/landing/AnimateIn";
import { TiltCard } from "@/components/landing/TiltCard";

export default async function RootPage() {
  const user = await getSession();
  if (user) redirect("/inbox");

  return (
    <div style={{ background: "var(--cm-bg)" }}>
      <MarketingNavbar />

      {/* ─────────────────────────── HERO ─────────────────────────── */}
      <section className="relative overflow-hidden pt-[66px]">
        {/* Background mesh */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-60 -top-60 h-[800px] w-[800px] rounded-full blur-[140px] opacity-60"
            style={{ background: "radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%)", animation: "orbFloat1 20s ease-in-out infinite" }} />
          <div className="absolute -right-40 top-0 h-[700px] w-[700px] rounded-full blur-[140px] opacity-50"
            style={{ background: "radial-gradient(circle, rgba(0,68,188,0.10) 0%, transparent 70%)", animation: "orbFloat2 25s ease-in-out infinite" }} />
        </div>

        <div className="relative mx-auto max-w-6xl px-5 pb-4 pt-24 text-center sm:px-8 sm:pt-32">
          {/* Headline — staggered word reveal */}
          <div className="animate-fade-up overflow-hidden">
            <h1
              className="mx-auto max-w-4xl text-[48px] font-[900] leading-[1.06] tracking-[-0.03em] sm:text-[64px] lg:text-[80px]"
              style={{ color: "var(--cm-text)" }}
            >
              The inbox that{" "}
              <br className="hidden sm:block" />
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(135deg, #F97316 0%, #EA580C 35%, #0044BC 100%)" }}
              >
                gets out of your way.
              </span>
            </h1>
          </div>

          <p
            className="animate-fade-up mx-auto mt-7 max-w-2xl text-[18px] leading-[1.7] sm:text-[20px]"
            style={{ color: "var(--cm-text2)", animationDelay: "0.1s" }}
          >
            Connect any email provider. Read everything in one place.
            Built for Hostcari clients — and anyone who deserves a better inbox.
          </p>

          {/* CTAs */}
          <div
            className="animate-fade-up mt-10 flex flex-wrap items-center justify-center gap-4"
            style={{ animationDelay: "0.2s" }}
          >
            <Link
              href="/sign-up"
              className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-2xl px-8 py-4 text-[15px] font-[800] text-white transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, #F97316, #EA580C)", boxShadow: "0 12px 36px rgba(249,115,22,0.35)" }}
            >
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              Start for free
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-2 rounded-2xl border px-8 py-4 text-[15px] font-[700] transition-all duration-200 hover:-translate-y-0.5"
              style={{ borderColor: "var(--cm-border2)", background: "var(--cm-surface)", color: "var(--cm-text2)", boxShadow: "0 2px 12px rgba(15,23,42,0.06)" }}
            >
              Sign in to inbox
            </Link>
          </div>

          {/* Micro trust badges */}
          <div
            className="animate-fade-up mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12.5px] font-[500]"
            style={{ color: "var(--cm-text3)", animationDelay: "0.3s" }}
          >
            {["No credit card required", "AES-256 encrypted", "Works with any IMAP provider"].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <Check className="h-3 w-3" style={{ color: "var(--cm-accent)" }} strokeWidth={3} />
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* ── App preview with 3D tilt ── */}
        <div
          className="animate-fade-up mx-auto mt-16 max-w-[1100px] px-4 pb-0 sm:px-6"
          style={{ animationDelay: "0.35s" }}
        >
          <TiltCard className="overflow-hidden rounded-t-[28px] border-x border-t"
            style={{
              borderColor: "var(--cm-border)",
              boxShadow: "0 -4px 60px rgba(15,23,42,0.10), 0 0 0 1px rgba(15,23,42,0.06)",
            } as React.CSSProperties}>
            {/* Accent bar */}
            <div className="h-[3px] bg-gradient-to-r from-[#F97316] via-[#FB923C] to-[#0044BC]" />
            {/* Browser chrome */}
            <div className="flex items-center gap-3 border-b px-5 py-3.5"
              style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface2)" }}>
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-[#FF5F57]" />
                <div className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
                <div className="h-3 w-3 rounded-full bg-[#28C840]" />
              </div>
              <div className="mx-auto flex items-center gap-1.5 rounded-lg border px-4 py-1 text-[11px]"
                style={{ background: "var(--cm-surface)", color: "var(--cm-text3)", borderColor: "var(--cm-border)" }}>
                <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>
                app.carimail.com/inbox
              </div>
            </div>
            {/* App layout mock */}
            <div className="flex" style={{ minHeight: 420, background: "var(--cm-surface)" }}>
              {/* Sidebar */}
              <div className="hidden w-52 shrink-0 border-r p-3 sm:block xl:w-56"
                style={{ borderColor: "var(--cm-border)", background: "var(--cm-sidebar-bg)" }}>
                <div className="mb-4 flex items-center gap-2 px-2">
                  <div className="h-7 w-7 rounded-xl bg-gradient-to-br from-[#F97316] to-[#0044BC]" />
                  <div className="h-3 w-16 rounded-full" style={{ background: "var(--cm-border2)" }} />
                </div>
                <div className="mb-4 w-full rounded-2xl px-3 py-2.5 text-center text-[11px] font-[700] text-white"
                  style={{ background: "linear-gradient(135deg, #F97316, #EA580C)" }}>✏ Compose</div>
                {["Inbox","Drafts","Sent","Starred","Spam","Trash"].map((f, i) => (
                  <div key={f} className="mb-0.5 flex items-center justify-between rounded-xl px-3 py-2"
                    style={{ background: i === 0 ? "var(--cm-active-bg)" : "transparent" }}>
                    <div className="h-2 rounded-full" style={{ width: `${f.length * 8}px`, background: i === 0 ? "var(--cm-text)" : "var(--cm-border2)" }} />
                    {i === 0 && <span className="rounded-full px-1.5 py-0.5 text-[8px] font-[700] text-white" style={{ background: "var(--cm-unread-dot)" }}>12</span>}
                  </div>
                ))}
              </div>
              {/* Message list */}
              <div className="w-60 shrink-0 border-r lg:w-72" style={{ borderColor: "var(--cm-border)" }}>
                <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: "var(--cm-border)" }}>
                  <div className="h-3 w-10 rounded-full" style={{ background: "var(--cm-text)", opacity: 0.15 }} />
                  <div className="h-3 w-3 rounded" style={{ background: "var(--cm-border2)" }} />
                </div>
                {[
                  { read: false, avatar: "from-[#F97316] to-[#EA580C]", w1: 65, w2: 80 },
                  { read: false, avatar: "from-[#0044BC] to-[#003399]", w1: 78, w2: 60 },
                  { read: true,  avatar: "from-[#7C3AED] to-[#6D28D9]", w1: 52, w2: 72 },
                  { read: true,  avatar: "from-[#059669] to-[#047857]", w1: 85, w2: 55 },
                  { read: true,  avatar: "from-[#0891B2] to-[#0E7490]", w1: 60, w2: 78 },
                  { read: true,  avatar: "from-[#DC2626] to-[#B91C1C]", w1: 73, w2: 62 },
                ].map((m, i) => (
                  <div key={i} className="relative flex gap-2.5 border-b px-3 py-3"
                    style={{ borderColor: "var(--cm-divider)", background: i === 0 ? "var(--cm-blue-light)" : "transparent" }}>
                    {!m.read && <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full" style={{ background: "var(--cm-unread-dot)" }} />}
                    <div className={`h-8 w-8 shrink-0 rounded-full bg-gradient-to-br ${m.avatar}`} />
                    <div className="flex-1 min-w-0">
                      <div className="mb-1.5 flex items-center gap-2">
                        <div className="h-2 rounded-full" style={{ background: m.read ? "var(--cm-border2)" : "var(--cm-text2)", opacity: m.read ? 1 : 0.8, flex: 1, maxWidth: `${m.w1}%` }} />
                        <div className="h-1.5 w-6 shrink-0 rounded-full" style={{ background: "var(--cm-border2)" }} />
                      </div>
                      <div className="h-1.5 rounded-full" style={{ width: `${m.w2}%`, background: "var(--cm-border2)" }} />
                      <div className="mt-1.5 h-1.5 rounded-full opacity-50" style={{ width: "48%", background: "var(--cm-surface3)" }} />
                    </div>
                  </div>
                ))}
              </div>
              {/* Reader */}
              <div className="min-w-0 flex-1 p-7 lg:p-9">
                <div className="mb-5 h-6 rounded-full opacity-10" style={{ width: "65%", background: "var(--cm-text)" }} />
                <div className="mb-7 flex items-center gap-3">
                  <div className="h-11 w-11 shrink-0 rounded-full bg-gradient-to-br from-[#F97316] to-[#EA580C]" />
                  <div className="flex-1">
                    <div className="mb-1.5 h-3 w-32 rounded-full opacity-20" style={{ background: "var(--cm-text)" }} />
                    <div className="h-2.5 w-48 rounded-full" style={{ background: "var(--cm-border2)" }} />
                  </div>
                </div>
                <div className="mb-5 h-px" style={{ background: "var(--cm-border)" }} />
                <div className="space-y-3">
                  {[92, 84, 96, 72, 88, 60, 78, 44].map((w, i) => (
                    <div key={i} className="h-2.5 rounded-full" style={{ width: `${w}%`, background: "var(--cm-border2)" }} />
                  ))}
                </div>
                <div className="mt-8 flex gap-2">
                  {["Reply","Forward","Archive"].map(l => (
                    <div key={l} className="rounded-xl border px-3 py-1.5 text-[10px] font-[700]"
                      style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface2)", color: "var(--cm-text3)" }}>{l}</div>
                  ))}
                </div>
              </div>
            </div>
          </TiltCard>
        </div>
      </section>

      {/* ─────────────── LOGO CAROUSEL ─────────────── */}
      <section className="border-b border-t py-10" style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)" }}>
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <p className="mb-7 text-center text-[11.5px] font-[700] uppercase tracking-[0.28em]" style={{ color: "var(--cm-text3)" }}>
            Works with your existing email
          </p>
          <LogoCarousel />
        </div>
      </section>

      {/* ─────────────────────── FEATURES ─────────────────────── */}
      <section id="features" className="py-28">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <AnimateIn className="mb-20 text-center">
            <h2 className="text-[36px] font-[900] tracking-[-0.025em] sm:text-[48px]" style={{ color: "var(--cm-text)" }}>
              Everything you need.
              <br />
              <span style={{ color: "var(--cm-text3)", fontWeight: 400 }}>Nothing you don&apos;t.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-[17px] leading-relaxed" style={{ color: "var(--cm-text2)" }}>
              We studied the email clients you love — and cut everything that slows you down.
            </p>
          </AnimateIn>

          {/* Spotlight features */}
          {[
            {
              title: "All your accounts, one view.",
              desc: "Connect Gmail, Outlook, Hostcari, or any IMAP mailbox. Switch accounts instantly, or view everything in a unified stream. No more tab juggling.",
              side: "left" as const,
              visual: (
                <div className="flex h-[280px] items-center justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full blur-3xl" style={{ background: "rgba(0,68,188,0.12)" }} />
                    <div className="relative flex flex-col gap-2.5">
                      {["you@gmail.com","work@outlook.com","you@hostcari.com"].map((e, i) => (
                        <div key={e} className="flex items-center gap-3 rounded-2xl border px-4 py-3"
                          style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)", boxShadow: "var(--cm-shadow)",
                            transform: `translateX(${i === 1 ? "12px" : i === 2 ? "24px" : "0"})`, opacity: 1 - i * 0.12 }}>
                          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[#F97316] to-[#0044BC] text-[9px] font-[700] text-white flex items-center justify-center">
                            {e.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-[12.5px] font-[600]" style={{ color: "var(--cm-text)" }}>{e}</span>
                          {i === 0 && <span className="ml-auto rounded-full px-2 py-0.5 text-[9px] font-[700]" style={{ background: "var(--cm-blue-light)", color: "var(--cm-blue)" }}>Primary</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ),
              points: ["Multiple account support","Account switcher in sidebar","Primary account routing","Per-account labels"],
              color: "var(--cm-blue)",
              bg: "var(--cm-blue-light)",
            },
            {
              title: "Threads that actually make sense.",
              desc: "Carimail groups messages by conversation automatically. You always know who said what — no re-reading chain emails.",
              side: "right" as const,
              visual: (
                <div className="flex h-[280px] items-center justify-center">
                  <div className="relative w-full max-w-xs">
                    <div className="absolute inset-0 rounded-full blur-3xl" style={{ background: "rgba(124,58,237,0.10)" }} />
                    {[
                      { name: "Sarah K.", time: "10:24 AM", active: true },
                      { name: "You", time: "10:31 AM", active: false },
                      { name: "Sarah K.", time: "10:45 AM", active: false },
                    ].map((m, i) => (
                      <div key={i} className={`relative mb-2 flex gap-2.5 rounded-2xl border px-3.5 py-3 ${m.active ? "" : ""}`}
                        style={{ borderColor: m.active ? "rgba(124,58,237,0.3)" : "var(--cm-border)", background: m.active ? "rgba(124,58,237,0.06)" : "var(--cm-surface)", boxShadow: "var(--cm-shadow)", marginLeft: m.name === "You" ? "auto" : "0", maxWidth: "90%" }}>
                        <div className="h-7 w-7 shrink-0 rounded-full" style={{ background: m.name === "You" ? "linear-gradient(135deg,#F97316,#EA580C)" : "linear-gradient(135deg,#7C3AED,#6D28D9)" }} />
                        <div className="flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <span className="text-[11.5px] font-[700]" style={{ color: "var(--cm-text)" }}>{m.name}</span>
                            <span className="text-[10px]" style={{ color: "var(--cm-text3)" }}>{m.time}</span>
                          </div>
                          <div className="h-2 rounded-full" style={{ width: "85%", background: "var(--cm-border2)" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ),
              points: ["Auto-grouped threads","Inline reply panel","Full thread history","Jump to any message"],
              color: "#7C3AED",
              bg: "rgba(124,58,237,0.10)",
            },
            {
              title: "Snooze, remind, schedule — stay ahead.",
              desc: "Snooze emails to bring them back when you're ready. Set reminders so you never forget to follow up. Schedule sends for the perfect moment.",
              side: "left" as const,
              visual: (
                <div className="flex h-[280px] items-center justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full blur-3xl" style={{ background: "rgba(217,119,6,0.12)" }} />
                    <div className="relative space-y-3">
                      {[
                        { icon: "⏰", label: "Snooze", sub: "Return tomorrow at 9am", color: "#D97706" },
                        { icon: "🔔", label: "Remind me", sub: "Follow up in 3 days", color: "#7C3AED" },
                        { icon: "📅", label: "Schedule send", sub: "Send Monday morning", color: "var(--cm-blue)" },
                      ].map(a => (
                        <div key={a.label} className="flex items-center gap-4 rounded-2xl border px-4 py-3.5"
                          style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)", boxShadow: "var(--cm-shadow)", minWidth: 240 }}>
                          <span className="text-xl">{a.icon}</span>
                          <div>
                            <div className="text-[13px] font-[700]" style={{ color: a.color }}>{a.label}</div>
                            <div className="text-[11px]" style={{ color: "var(--cm-text3)" }}>{a.sub}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ),
              points: ["Snooze to any time","Follow-up reminders","Scheduled send","Rules & automation"],
              color: "#D97706",
              bg: "rgba(217,119,6,0.10)",
            },
          ].map((f, idx) => (
            <AnimateIn key={f.title} direction={f.side === "left" ? "left" : "right"} delay={0.05}>
              <div className={`mb-24 flex flex-col items-center gap-12 lg:flex-row ${f.side === "right" ? "lg:flex-row-reverse" : ""}`}>
                {/* Visual */}
                <div className="w-full lg:w-[52%]">
                  <div className="overflow-hidden rounded-[32px] border"
                    style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)", boxShadow: "0 8px 40px rgba(15,23,42,0.08)" }}>
                    {f.visual}
                  </div>
                </div>
                {/* Copy */}
                <div className="w-full lg:w-[48%]">
                  <h3 className="text-[28px] font-[900] leading-tight tracking-tight sm:text-[34px]"
                    style={{ color: "var(--cm-text)" }}>{f.title}</h3>
                  <p className="mt-4 text-[16px] leading-[1.75]" style={{ color: "var(--cm-text2)" }}>{f.desc}</p>
                  <ul className="mt-6 space-y-3">
                    {f.points.map(p => (
                      <li key={p} className="flex items-center gap-3 text-[14px] font-[600]" style={{ color: "var(--cm-text2)" }}>
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                          style={{ background: f.bg, color: f.color }}>
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </AnimateIn>
          ))}

          {/* Feature grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: "🔒", title: "AES-256 encrypted", desc: "Your credentials are encrypted before storage. Never logged, never exposed." },
              { icon: "🌙", title: "Dark & light mode", desc: "Carefully tuned themes for any hour. Respects your system preference automatically." },
              { icon: "⚡", title: "Lightning fast search", desc: "Full-text search across all your mail. Results appear instantly from local cache." },
              { icon: "📎", title: "Inline attachment viewer", desc: "Preview PDFs, images, and documents inline — without leaving the app." },
              { icon: "⌨", title: "Keyboard-first design", desc: "Every action has a shortcut. Press ? to see the full list. Stay in the flow." },
              { icon: "🔓", title: "No lock-in", desc: "Works with any IMAP/SMTP server. Your data stays with your email provider." },
            ].map((f, i) => (
              <AnimateIn key={f.title} direction="up" delay={i * 0.07}>
                <div className="group h-full rounded-[24px] border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)", boxShadow: "var(--cm-shadow)" }}>
                  <div className="mb-4 text-3xl">{f.icon}</div>
                  <h4 className="text-[15px] font-[800]" style={{ color: "var(--cm-text)" }}>{f.title}</h4>
                  <p className="mt-2 text-[13.5px] leading-relaxed" style={{ color: "var(--cm-text2)" }}>{f.desc}</p>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────── HOW IT WORKS ────────────────────── */}
      <section className="py-24" style={{ background: "var(--cm-surface)" }}>
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <AnimateIn className="mb-16 text-center">
            <h2 className="text-[36px] font-[900] tracking-tight sm:text-[44px]" style={{ color: "var(--cm-text)" }}>
              Up and running in 60 seconds
            </h2>
            <p className="mx-auto mt-4 max-w-md text-[16px]" style={{ color: "var(--cm-text2)" }}>No setup wizard. No migration. Just connect and read.</p>
          </AnimateIn>
          <div className="relative grid gap-8 md:grid-cols-3">
            {[
              { step: "01", icon: "✉️", title: "Create your account", desc: "Sign up in seconds with your name and email. No payment info, no commitments." },
              { step: "02", icon: "🔌", title: "Connect a mailbox", desc: "Enter your email and password (or OAuth for Gmail). We test the connection instantly." },
              { step: "03", icon: "📭", title: "Start reading", desc: "Your inbox loads automatically. Read, reply, star, snooze — all from one clean interface." },
            ].map((s, i) => (
              <AnimateIn key={s.step} direction="up" delay={i * 0.12}>
                <div className="relative flex flex-col items-center text-center">
                  <div className="relative z-10 mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border text-[32px]"
                    style={{ borderColor: "var(--cm-border)", background: "var(--cm-bg)", boxShadow: "0 4px 24px rgba(15,23,42,0.09)" }}>
                    {s.icon}
                    <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-[900] text-white"
                      style={{ background: "var(--cm-accent)" }}>{s.step}</span>
                  </div>
                  <h3 className="text-[17px] font-[800]" style={{ color: "var(--cm-text)" }}>{s.title}</h3>
                  <p className="mt-2 max-w-xs text-[14px] leading-relaxed" style={{ color: "var(--cm-text2)" }}>{s.desc}</p>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────── PRICING ─────────────────────────── */}
      <section id="pricing" className="py-28">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <AnimateIn className="mb-16 text-center">
            <h2 className="text-[36px] font-[900] tracking-tight sm:text-[44px]" style={{ color: "var(--cm-text)" }}>
              Simple, honest pricing.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-[16px]" style={{ color: "var(--cm-text2)" }}>
              Core features are free for everyone. Hostcari clients get everything automatically.
            </p>
          </AnimateIn>
          <div className="grid gap-6 md:grid-cols-2">
            <AnimateIn direction="left">
              <div className="h-full rounded-[28px] border p-8"
                style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)", boxShadow: "var(--cm-shadow)" }}>
                <p className="text-[11px] font-[800] uppercase tracking-[0.22em]" style={{ color: "var(--cm-text3)" }}>Free</p>
                <div className="mt-3 flex items-end gap-2">
                  <span className="text-[52px] font-[900] leading-none" style={{ color: "var(--cm-text)" }}>$0</span>
                  <span className="mb-1.5 text-[14px]" style={{ color: "var(--cm-text3)" }}>forever</span>
                </div>
                <p className="mt-2 text-[14px]" style={{ color: "var(--cm-text2)" }}>For anyone who wants a better inbox.</p>
                <Link href="/sign-up"
                  className="mt-7 flex w-full items-center justify-center rounded-2xl border py-3.5 text-[14px] font-[800] transition hover:-translate-y-0.5"
                  style={{ borderColor: "var(--cm-border2)", color: "var(--cm-text)", background: "var(--cm-surface2)" }}>
                  Get started free
                </Link>
                <ul className="mt-8 space-y-3.5">
                  {["Up to 2 email accounts","All core inbox features","Threaded conversations","Snooze & reminders","Schedule send","Full-text search","AES-256 encrypted storage","Dark & light mode","Keyboard shortcuts"].map(f => (
                    <li key={f} className="flex items-center gap-3 text-[14px]" style={{ color: "var(--cm-text2)" }}>
                      <Check className="h-4 w-4 shrink-0 text-emerald-500" strokeWidth={3} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </AnimateIn>
            <AnimateIn direction="right">
              <div className="relative h-full overflow-hidden rounded-[28px] border-2 p-8"
                style={{ borderColor: "var(--cm-accent-b)", background: "var(--cm-surface)", boxShadow: "0 16px 60px var(--cm-accent-b)" }}>
                <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full blur-3xl" style={{ background: "var(--cm-accent-dim)" }} />
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-[800] uppercase tracking-[0.22em]" style={{ color: "var(--cm-accent)" }}>Hostcari Client</p>
                    <span className="hostcari-badge">HC</span>
                  </div>
                  <div className="mt-3 flex items-end gap-2">
                    <span className="text-[52px] font-[900] leading-none" style={{ color: "var(--cm-text)" }}>Free</span>
                  </div>
                  <p className="mt-2 text-[14px]" style={{ color: "var(--cm-text2)" }}>Included with your Hostcari hosting.</p>
                  <Link href="/sign-up"
                    className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[14px] font-[800] text-white transition hover:-translate-y-0.5"
                    style={{ background: "linear-gradient(135deg, var(--cm-accent), var(--cm-accent2))", boxShadow: "0 8px 24px var(--cm-accent-b)" }}>
                    Claim your account
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
                  </Link>
                  <ul className="mt-8 space-y-3.5">
                    {["Everything in Free","Unlimited email accounts","HC badge & verified identity","Priority support","Early access to new features","Advanced rule automation","Exclusive Hostcari integrations"].map((f, i) => (
                      <li key={f} className="flex items-center gap-3 text-[14px]" style={{ color: "var(--cm-text2)" }}>
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full"
                          style={{ background: i === 0 ? "rgba(16,185,129,0.15)" : "var(--cm-accent-dim)", color: i === 0 ? "#10B981" : "var(--cm-accent)" }}>
                          <Check className="h-2.5 w-2.5" strokeWidth={3} />
                        </span>
                        <span style={{ fontWeight: i === 0 ? 400 : 600 }}>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </AnimateIn>
          </div>
        </div>
      </section>

      {/* ─────────────────────── TESTIMONIALS ─────────────────────── */}
      <section className="py-24" style={{ background: "var(--cm-surface)" }}>
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <AnimateIn className="mb-14 text-center">
            <h2 className="text-[36px] font-[900] tracking-tight sm:text-[44px]" style={{ color: "var(--cm-text)" }}>
              Loved by power users
            </h2>
          </AnimateIn>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              { quote: "Finally an email client that doesn't feel like 2010. The keyboard shortcuts and thread view alone are worth switching.", name: "Alex K.", role: "Software Engineer", avatar: "from-[#F97316] to-[#EA580C]" },
              { quote: "As a Hostcari client I get everything for free. The HC badge and the clean interface make it feel like a premium product.", name: "Maria R.", role: "Freelancer & HC Client", avatar: "from-[#0044BC] to-[#003399]", hc: true },
              { quote: "Snooze and reminders changed how I manage my inbox. I no longer keep tabs open just to remember to reply.", name: "Thomas W.", role: "Business Owner", avatar: "from-[#7C3AED] to-[#6D28D9]" },
            ].map((t, i) => (
              <AnimateIn key={t.name} direction="up" delay={i * 0.1}>
                <div className="rounded-[24px] border p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  style={{ borderColor: "var(--cm-border)", background: "var(--cm-bg)", boxShadow: "var(--cm-shadow)" }}>
                  <div className="mb-4 flex gap-1">
                    {[...Array(5)].map((_, j) => (
                      <svg key={j} className="h-4 w-4" viewBox="0 0 24 24" fill="#F59E0B">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    ))}
                  </div>
                  <p className="text-[14.5px] leading-[1.7]" style={{ color: "var(--cm-text)" }}>&ldquo;{t.quote}&rdquo;</p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-full bg-gradient-to-br ${t.avatar} flex items-center justify-center text-[12px] font-[700] text-white`}>
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[13.5px] font-[700]" style={{ color: "var(--cm-text)" }}>{t.name}</span>
                        {(t as any).hc && <span className="hostcari-badge">HC</span>}
                      </div>
                      <span className="text-[12px]" style={{ color: "var(--cm-text3)" }}>{t.role}</span>
                    </div>
                  </div>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────── FAQ ─────────────────────────── */}
      <section id="faq" className="py-28">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <AnimateIn className="mb-14 text-center">
            <h2 className="text-[36px] font-[900] tracking-tight sm:text-[44px]" style={{ color: "var(--cm-text)" }}>
              Questions &amp; answers
            </h2>
          </AnimateIn>
          <AnimateIn delay={0.1}>
            <FaqAccordion />
          </AnimateIn>
        </div>
      </section>

      {/* ────────────────────── FINAL CTA ────────────────────── */}
      <section className="pb-28">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <AnimateIn direction="scale">
            <div className="relative overflow-hidden rounded-[36px] px-10 py-20 text-center sm:px-16"
              style={{ background: "linear-gradient(135deg, #0F172A 0%, #1e293b 100%)" }}>
              <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full blur-3xl opacity-60" style={{ background: "rgba(249,115,22,0.20)" }} />
              <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full blur-3xl opacity-50" style={{ background: "rgba(0,68,188,0.18)" }} />
              <div className="relative">
                <h2 className="mx-auto max-w-xl text-[34px] font-[900] leading-tight tracking-tight text-white sm:text-[44px]">
                  Start reading email<br />the right way.
                </h2>
                <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed" style={{ color: "rgba(241,245,249,0.65)" }}>
                  Join Carimail and connect your first mailbox in under a minute.
                </p>
                <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
                  <Link href="/sign-up"
                    className="group relative inline-flex items-center gap-2 overflow-hidden rounded-2xl px-8 py-4 text-[15px] font-[800] text-white transition hover:-translate-y-0.5"
                    style={{ background: "linear-gradient(135deg, var(--cm-accent), var(--cm-accent2))", boxShadow: "0 12px 36px rgba(249,115,22,0.40)" }}>
                    <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                    Create free account →
                  </Link>
                  <Link href="https://hostcari.com" target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-2xl px-8 py-4 text-[15px] font-[700] transition hover:-translate-y-0.5"
                    style={{ background: "rgba(255,255,255,0.08)", color: "rgba(241,245,249,0.85)", border: "1px solid rgba(255,255,255,0.14)" }}>
                    Hostcari hosting <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* ─────────────────────────── FOOTER ─────────────────────────── */}
      <footer className="border-t" style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)" }}>
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
          <div className="mb-12 grid gap-8 sm:grid-cols-2 md:grid-cols-4">
            <div className="sm:col-span-2 md:col-span-1">
              <Link href="/" className="group mb-4 flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border transition group-hover:scale-105"
                  style={{ borderColor: "var(--cm-border)", background: "var(--cm-bg)", boxShadow: "var(--cm-shadow)" }}>
                  <Image src="/logo.webp" alt="Carimail" width={22} height={22} className="object-contain" />
                </div>
                <div>
                  <div className="text-[14px] font-[800]" style={{ color: "var(--cm-text)" }}>Carimail</div>
                  <div className="text-[9.5px]" style={{ color: "var(--cm-text3)" }}>by Hostcari</div>
                </div>
              </Link>
              <p className="max-w-xs text-[13px] leading-relaxed" style={{ color: "var(--cm-text3)" }}>
                A polished email client for any IMAP provider. Built for people who value their inbox.
              </p>
            </div>
            <div>
              <p className="mb-4 text-[10.5px] font-[800] uppercase tracking-[0.22em]" style={{ color: "var(--cm-text3)" }}>Product</p>
              <ul className="space-y-3">
                {[{label:"Features",href:"#features"},{label:"Pricing",href:"#pricing"},{label:"FAQ",href:"#faq"},{label:"Sign in",href:"/sign-in"},{label:"Get started",href:"/sign-up"}].map(l => (
                  <li key={l.label}><a href={l.href} className="text-[13.5px] font-[500] hover:underline" style={{ color: "var(--cm-text2)" }}>{l.label}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-4 text-[10.5px] font-[800] uppercase tracking-[0.22em]" style={{ color: "var(--cm-text3)" }}>Legal</p>
              <ul className="space-y-3">
                {[{label:"Terms of Service",href:"/terms"},{label:"Privacy Policy",href:"/privacy"}].map(l => (
                  <li key={l.label}><Link href={l.href} className="text-[13.5px] font-[500] hover:underline" style={{ color: "var(--cm-text2)" }}>{l.label}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-4 text-[10.5px] font-[800] uppercase tracking-[0.22em]" style={{ color: "var(--cm-text3)" }}>Hostcari</p>
              <ul className="space-y-3">
                {[{label:"hostcari.com",href:"https://hostcari.com"},{label:"Support",href:"mailto:support@hostcari.com"}].map(l => (
                  <li key={l.label}>
                    <a href={l.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[13.5px] font-[500] hover:underline" style={{ color: "var(--cm-text2)" }}>
                      {l.label}<ExternalLink className="h-3 w-3 opacity-40" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="flex flex-col items-center justify-between gap-3 border-t pt-8 sm:flex-row" style={{ borderColor: "var(--cm-border)" }}>
            <p className="text-[12.5px]" style={{ color: "var(--cm-text3)" }}>© {new Date().getFullYear()} Hostcari. All rights reserved.</p>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: "#10B981" }} />
              <span className="text-[12.5px]" style={{ color: "var(--cm-text3)" }}>All systems operational</span>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes orbFloat1 { 0%,100%{transform:translate(0,0)} 33%{transform:translate(50px,35px)} 66%{transform:translate(-25px,55px)} }
        @keyframes orbFloat2 { 0%,100%{transform:translate(0,0)} 40%{transform:translate(-55px,-40px)} 70%{transform:translate(35px,-22px)} }
      `}</style>
    </div>
  );
}
