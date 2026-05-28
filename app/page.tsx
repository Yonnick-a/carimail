import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Check, ExternalLink } from "lucide-react";
import { getSession } from "@/lib/auth";
import { MarketingNavbar } from "@/components/landing/Navbar";
import { FaqAccordion } from "@/components/landing/FaqAccordion";

export default async function RootPage() {
  const user = await getSession();
  if (user) redirect("/inbox");

  return (
    <div style={{ background: "var(--cm-bg)" }}>
      <MarketingNavbar />

      {/* ─────────────────────────── HERO ─────────────────────────── */}
      <section className="relative overflow-hidden pt-[66px]">
        {/* Background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-40 -top-40 h-[700px] w-[700px] rounded-full blur-[120px]"
            style={{ background: "rgba(249,115,22,0.07)", animation: "orbFloat1 18s ease-in-out infinite" }} />
          <div className="absolute -right-32 top-20 h-[600px] w-[600px] rounded-full blur-[120px]"
            style={{ background: "rgba(0,68,188,0.06)", animation: "orbFloat2 22s ease-in-out infinite" }} />
          <div className="dot-grid absolute inset-0 opacity-25" />
        </div>

        <div className="relative mx-auto max-w-6xl px-5 pb-8 pt-20 text-center sm:px-8 sm:pt-24">
          {/* Eyebrow badge */}
          <div className="animate-fade-up mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[12px] font-[700]"
            style={{ borderColor: "var(--cm-accent-b)", background: "var(--cm-accent-dim)", color: "var(--cm-accent)" }}>
            <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: "var(--cm-accent)" }} />
            Now available · Free to start
            <span className="ml-1 opacity-60">→</span>
          </div>

          {/* Headline */}
          <h1 className="animate-fade-up mx-auto mt-2 max-w-4xl text-[44px] font-[900] leading-[1.1] tracking-[-0.03em] sm:text-[60px] lg:text-[72px]"
            style={{ color: "var(--cm-text)", animationDelay: "0.06s" }}>
            The inbox that{" "}
            <br className="hidden sm:block" />
            <span className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(135deg, var(--cm-accent) 0%, #e05f0c 40%, var(--cm-blue) 100%)" }}>
              gets out of your way.
            </span>
          </h1>

          <p className="animate-fade-up mx-auto mt-6 max-w-2xl text-[17px] leading-relaxed sm:text-[19px]"
            style={{ color: "var(--cm-text2)", animationDelay: "0.12s" }}>
            Carimail connects to any email provider and gives you a fast, beautiful,
            distraction-free space to read, reply, and stay on top of everything.
          </p>

          {/* CTAs */}
          <div className="animate-fade-up mt-9 flex flex-wrap items-center justify-center gap-3"
            style={{ animationDelay: "0.18s" }}>
            <Link href="/sign-up"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-2xl px-8 py-4 text-[15px] font-[800] text-white transition hover:-translate-y-0.5 active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, var(--cm-accent), var(--cm-accent2))", boxShadow: "0 10px 32px var(--cm-accent-b)" }}>
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              Start for free
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link href="/sign-in"
              className="inline-flex items-center gap-2 rounded-2xl border px-8 py-4 text-[15px] font-[700] transition hover:-translate-y-0.5"
              style={{ borderColor: "var(--cm-border2)", background: "var(--cm-surface)", color: "var(--cm-text2)", boxShadow: "var(--cm-shadow)" }}>
              Sign in to inbox
            </Link>
          </div>

          {/* Trust row */}
          <div className="animate-fade-up mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[12px] font-[600]"
            style={{ color: "var(--cm-text3)", animationDelay: "0.24s" }}>
            {["No credit card required", "AES-256 encrypted", "Works with Gmail & Outlook", "Hostcari client perks"].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <Check className="h-3 w-3" style={{ color: "var(--cm-accent)" }} />
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* ── App preview ── */}
        <div className="animate-fade-up mx-auto mt-12 max-w-6xl px-4 pb-0 sm:px-6"
          style={{ animationDelay: "0.3s" }}>
          <div className="overflow-hidden rounded-t-[28px] border-x border-t shadow-[0_-8px_60px_rgba(15,23,42,0.14)]"
            style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)" }}>
            {/* Accent bar */}
            <div className="h-1 bg-gradient-to-r from-[#F97316] via-[#FB923C] to-[#0044BC]" />
            {/* Browser chrome */}
            <div className="flex items-center gap-3 border-b px-5 py-3.5"
              style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface2)" }}>
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full" style={{ background: "#FF5F57" }} />
                <div className="h-3 w-3 rounded-full" style={{ background: "#FEBC2E" }} />
                <div className="h-3 w-3 rounded-full" style={{ background: "#28C840" }} />
              </div>
              <div className="flex flex-1 items-center justify-center">
                <div className="flex items-center gap-2 rounded-lg border px-4 py-1 text-[11px]"
                  style={{ background: "var(--cm-surface)", color: "var(--cm-text3)", borderColor: "var(--cm-border)" }}>
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15a3 3 0 100-6 3 3 0 000 6z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  app.carimail.com/inbox
                </div>
              </div>
              <div className="flex gap-1">
                <div className="h-5 w-5 rounded" style={{ background: "var(--cm-surface3)" }} />
                <div className="h-5 w-5 rounded" style={{ background: "var(--cm-surface3)" }} />
              </div>
            </div>
            {/* App layout */}
            <div className="flex" style={{ minHeight: 400 }}>
              {/* Sidebar */}
              <div className="hidden w-48 shrink-0 border-r p-3 sm:block xl:w-56"
                style={{ borderColor: "var(--cm-border)", background: "var(--cm-sidebar-bg)" }}>
                <div className="mb-3 flex items-center gap-2 px-2">
                  <div className="h-6 w-6 shrink-0 rounded-lg bg-gradient-to-br from-[#F97316] to-[#0044BC]" />
                  <div className="h-2.5 w-16 rounded-full" style={{ background: "var(--cm-border2)" }} />
                </div>
                <div className="mb-3 w-full rounded-2xl px-3 py-2 text-center text-[11px] font-[700] text-white"
                  style={{ background: "linear-gradient(135deg, #F97316, #EA580C)" }}>
                  ✏ Compose
                </div>
                <div className="mb-1 px-2 pb-1 text-[9px] font-[700] uppercase tracking-wider" style={{ color: "var(--cm-text3)" }}>Folders</div>
                {[
                  { label: "Inbox", count: "12", active: true },
                  { label: "Drafts", count: "2", active: false },
                  { label: "Sent", count: "", active: false },
                  { label: "Starred", count: "5", active: false },
                  { label: "Spam", count: "", active: false },
                  { label: "Trash", count: "", active: false },
                ].map(f => (
                  <div key={f.label} className="mb-0.5 flex items-center justify-between rounded-xl px-3 py-2"
                    style={{ background: f.active ? "var(--cm-active-bg)" : "transparent" }}>
                    <div className="h-2 rounded-full" style={{ width: `${f.label.length * 7}px`, background: f.active ? "var(--cm-text)" : "var(--cm-border2)" }} />
                    {f.count && (
                      <span className="rounded-full px-1.5 py-0.5 text-[8px] font-[700]"
                        style={{ background: f.active ? "var(--cm-unread-dot)" : "var(--cm-surface3)", color: f.active ? "#fff" : "var(--cm-text3)" }}>
                        {f.count}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Message list */}
              <div className="w-60 shrink-0 border-r lg:w-72"
                style={{ borderColor: "var(--cm-border)" }}>
                <div className="flex items-center justify-between border-b px-4 py-3"
                  style={{ borderColor: "var(--cm-border)" }}>
                  <div className="h-3 w-12 rounded-full" style={{ background: "var(--cm-text)", opacity: 0.15 }} />
                  <div className="h-3 w-3 rounded" style={{ background: "var(--cm-border2)" }} />
                </div>
                {[
                  { read: false, avatar: "from-[#F97316] to-[#EA580C]", w1: 68, w2: 80 },
                  { read: false, avatar: "from-[#0044BC] to-[#003399]", w1: 75, w2: 65 },
                  { read: true,  avatar: "from-[#7C3AED] to-[#6D28D9]", w1: 55, w2: 72 },
                  { read: true,  avatar: "from-[#059669] to-[#047857]", w1: 82, w2: 60 },
                  { read: true,  avatar: "from-[#0891B2] to-[#0E7490]", w1: 60, w2: 78 },
                  { read: true,  avatar: "from-[#DC2626] to-[#B91C1C]", w1: 70, w2: 55 },
                ].map((m, i) => (
                  <div key={i} className="relative flex gap-2.5 border-b px-3 py-3 transition"
                    style={{ borderColor: "var(--cm-divider)", background: i === 0 ? "var(--cm-blue-light)" : "transparent" }}>
                    {!m.read && <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full" style={{ background: "var(--cm-unread-dot)" }} />}
                    <div className={`h-8 w-8 shrink-0 rounded-full bg-gradient-to-br ${m.avatar}`} />
                    <div className="flex-1 min-w-0">
                      <div className="mb-1.5 flex items-center gap-2">
                        <div className="h-2 flex-1 rounded-full" style={{ background: m.read ? "var(--cm-border2)" : "var(--cm-text2)", opacity: m.read ? 1 : 0.7, width: `${m.w1}%`, maxWidth: `${m.w1}%` }} />
                        <div className="h-1.5 w-7 shrink-0 rounded-full" style={{ background: "var(--cm-border2)" }} />
                      </div>
                      <div className="h-1.5 rounded-full" style={{ width: `${m.w2}%`, background: "var(--cm-border2)" }} />
                      <div className="mt-1.5 h-1.5 rounded-full" style={{ width: "50%", background: "var(--cm-surface3)" }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Message reader */}
              <div className="min-w-0 flex-1 p-6 lg:p-8">
                {/* Subject */}
                <div className="mb-5 h-6 rounded-full" style={{ width: "70%", background: "var(--cm-text)", opacity: 0.10 }} />
                {/* Sender row */}
                <div className="mb-6 flex items-center gap-3">
                  <div className="h-11 w-11 shrink-0 rounded-full bg-gradient-to-br from-[#F97316] to-[#EA580C]" />
                  <div className="flex-1">
                    <div className="mb-1.5 h-3 w-32 rounded-full" style={{ background: "var(--cm-border2)" }} />
                    <div className="h-2.5 w-48 rounded-full" style={{ background: "var(--cm-surface3)" }} />
                  </div>
                </div>
                <div className="mb-2 h-px" style={{ background: "var(--cm-border)" }} />
                {/* Body lines */}
                <div className="mt-5 space-y-2.5">
                  {[90, 82, 96, 74, 88, 60, 78, 40].map((w, i) => (
                    <div key={i} className="h-2.5 rounded-full" style={{ width: `${w}%`, background: "var(--cm-border2)" }} />
                  ))}
                </div>
                {/* Action bar */}
                <div className="mt-8 flex gap-2">
                  {["Reply", "Forward", "Archive"].map(label => (
                    <div key={label} className="rounded-xl border px-3 py-1.5 text-[10px] font-[700]"
                      style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)", color: "var(--cm-text3)" }}>
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────── PROVIDER LOGOS ─────────────────── */}
      <section className="border-b border-t py-8" style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)" }}>
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <p className="mb-5 text-center text-[11px] font-[700] uppercase tracking-[0.22em]" style={{ color: "var(--cm-text3)" }}>
            Works with your existing email
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {["Gmail", "Outlook", "Yahoo", "Apple Mail", "Fastmail", "Hostcari", "ProtonMail", "Any IMAP"].map((name, i) => (
              <span key={name}
                className="rounded-xl border px-4 py-2 text-[12.5px] font-[700] transition hover:-translate-y-0.5"
                style={{
                  borderColor: i === 5 ? "var(--cm-accent-b)" : "var(--cm-border)",
                  background: i === 5 ? "var(--cm-accent-dim)" : "var(--cm-surface2)",
                  color: i === 5 ? "var(--cm-accent)" : "var(--cm-text2)",
                  boxShadow: "var(--cm-shadow)",
                }}>
                {i === 5 && <span className="mr-1.5">✦</span>}
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────── FEATURES ─────────────────────── */}
      <section id="features" className="py-24">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="mb-16 text-center">
            <p className="text-[11px] font-[800] uppercase tracking-[0.24em]" style={{ color: "var(--cm-blue)" }}>Features</p>
            <h2 className="mt-2 text-[32px] font-[900] tracking-tight sm:text-[42px]" style={{ color: "var(--cm-text)" }}>
              Everything you need.<br />Nothing you don&apos;t.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[16px] leading-relaxed" style={{ color: "var(--cm-text2)" }}>
              We studied the email clients you love — and cut everything that slows you down.
            </p>
          </div>

          {/* Alternating feature spotlights */}
          {[
            {
              label: "Unified inbox",
              title: "All your accounts, one view.",
              desc: "Connect Gmail, Outlook, Hostcari, or any IMAP mailbox. Switch accounts with one click, or view everything in a single unified stream. No more tab juggling.",
              side: "left",
              icon: "📬",
              color: "var(--cm-blue)",
              bg: "var(--cm-blue-light)",
              points: ["Multiple account support", "Account switcher in sidebar", "Primary account routing", "Per-account labels"],
            },
            {
              label: "Smart conversations",
              title: "Threads that actually make sense.",
              desc: "Carimail groups messages by conversation automatically, showing the full exchange inline. You always know who said what and when — no re-reading chain emails.",
              side: "right",
              icon: "💬",
              color: "#7C3AED",
              bg: "rgba(124,58,237,0.10)",
              points: ["Auto-grouped threads", "Inline reply panel", "Full thread history", "Jump to any message"],
            },
            {
              label: "Focus tools",
              title: "Snooze, remind, schedule — stay ahead.",
              desc: "Snooze emails to bring them back when you're ready. Set reminders so you never forget to follow up. Schedule sends for when recipients are most likely to read.",
              side: "left",
              icon: "⏰",
              color: "#D97706",
              bg: "rgba(217,119,6,0.10)",
              points: ["Snooze to any time", "Follow-up reminders", "Scheduled send", "Rules & automation"],
            },
          ].map(f => (
            <div key={f.title} className={`mb-20 flex flex-col items-center gap-10 lg:flex-row ${f.side === "right" ? "lg:flex-row-reverse" : ""}`}>
              {/* Visual card */}
              <div className="w-full lg:w-[52%]">
                <div className="overflow-hidden rounded-[28px] border p-6 sm:p-8"
                  style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)", boxShadow: "var(--cm-shadow-lg)" }}>
                  <div className="flex h-[240px] items-center justify-center">
                    <div className="relative flex items-center justify-center">
                      <div className="absolute h-48 w-48 rounded-full blur-3xl" style={{ background: f.bg }} />
                      <span className="relative text-[80px]">{f.icon}</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Copy */}
              <div className="w-full lg:w-[48%]">
                <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-[800] uppercase tracking-wider"
                  style={{ background: f.bg, color: f.color }}>
                  {f.label}
                </span>
                <h3 className="mt-4 text-[26px] font-[900] leading-tight tracking-tight sm:text-[32px]"
                  style={{ color: "var(--cm-text)" }}>{f.title}</h3>
                <p className="mt-4 text-[15px] leading-relaxed" style={{ color: "var(--cm-text2)" }}>{f.desc}</p>
                <ul className="mt-5 space-y-2.5">
                  {f.points.map(p => (
                    <li key={p} className="flex items-center gap-3 text-[13.5px] font-[600]" style={{ color: "var(--cm-text2)" }}>
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
          ))}

          {/* Feature grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: "🔒", label: "Security", title: "AES-256 encrypted", desc: "Your credentials are encrypted before storage. Never logged, never exposed." },
              { icon: "🌙", label: "Theme", title: "Dark & light mode", desc: "Carefully tuned themes that look great at any hour. Respects your system preference." },
              { icon: "🔍", label: "Search", title: "Fast search", desc: "Full-text search across all your mail. Results appear instantly from local cache." },
              { icon: "📎", label: "Attachments", title: "Attachment viewer", desc: "Preview PDFs, images, and documents inline without leaving the app." },
              { icon: "⌨️", label: "Keyboard", title: "Keyboard-first", desc: "Every action has a shortcut. Press ? to see the full list. Stay in the flow." },
              { icon: "🤝", label: "Open", title: "No lock-in", desc: "Works with any IMAP/SMTP server. Your data stays with your email provider." },
            ].map(f => (
              <div key={f.title}
                className="group rounded-[22px] border p-6 transition hover:-translate-y-0.5"
                style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)", boxShadow: "var(--cm-shadow)" }}>
                <div className="mb-4 text-3xl">{f.icon}</div>
                <p className="text-[10px] font-[800] uppercase tracking-[0.18em] mb-1" style={{ color: "var(--cm-text3)" }}>{f.label}</p>
                <h4 className="text-[15px] font-[800]" style={{ color: "var(--cm-text)" }}>{f.title}</h4>
                <p className="mt-2 text-[13px] leading-relaxed" style={{ color: "var(--cm-text2)" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────── HOW IT WORKS ────────────────────── */}
      <section className="py-20" style={{ background: "var(--cm-surface)" }}>
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="mb-14 text-center">
            <p className="text-[11px] font-[800] uppercase tracking-[0.24em]" style={{ color: "var(--cm-accent)" }}>How it works</p>
            <h2 className="mt-2 text-[32px] font-[900] tracking-tight sm:text-[38px]" style={{ color: "var(--cm-text)" }}>
              Up and running in 60 seconds
            </h2>
          </div>
          <div className="relative grid gap-6 md:grid-cols-3">
            {/* Connector line */}
            <div className="absolute left-1/6 right-1/6 top-10 hidden h-px md:block"
              style={{ background: "linear-gradient(90deg, transparent, var(--cm-border), var(--cm-accent-b), var(--cm-border), transparent)" }} />
            {[
              { step: "01", icon: "✉️", title: "Create your account", desc: "Sign up in seconds with your name and email. No payment info needed." },
              { step: "02", icon: "🔌", title: "Connect a mailbox", desc: "Enter your email address and password (or use OAuth for Gmail). We test the connection instantly." },
              { step: "03", icon: "📭", title: "Start reading", desc: "Your inbox loads automatically. Read, reply, star, snooze — all from one clean interface." },
            ].map(s => (
              <div key={s.step} className="relative flex flex-col items-center text-center">
                <div className="relative z-10 mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border text-3xl"
                  style={{ borderColor: "var(--cm-border)", background: "var(--cm-bg)", boxShadow: "var(--cm-shadow-lg)" }}>
                  {s.icon}
                  <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-[900] text-white"
                    style={{ background: "var(--cm-accent)" }}>{s.step}</span>
                </div>
                <h3 className="text-[16px] font-[800]" style={{ color: "var(--cm-text)" }}>{s.title}</h3>
                <p className="mt-2 max-w-xs text-[13.5px] leading-relaxed" style={{ color: "var(--cm-text2)" }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────── PRICING ─────────────────────────── */}
      <section id="pricing" className="py-24">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <div className="mb-14 text-center">
            <p className="text-[11px] font-[800] uppercase tracking-[0.24em]" style={{ color: "var(--cm-blue)" }}>Pricing</p>
            <h2 className="mt-2 text-[32px] font-[900] tracking-tight sm:text-[40px]" style={{ color: "var(--cm-text)" }}>
              Simple, honest pricing.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-[16px]" style={{ color: "var(--cm-text2)" }}>
              Core features are free for everyone. Hostcari clients get everything unlocked automatically.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Free */}
            <div className="relative overflow-hidden rounded-[28px] border p-8"
              style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)", boxShadow: "var(--cm-shadow)" }}>
              <p className="text-[10.5px] font-[800] uppercase tracking-[0.20em]" style={{ color: "var(--cm-text3)" }}>Free</p>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-[44px] font-[900] leading-none" style={{ color: "var(--cm-text)" }}>$0</span>
                <span className="mb-1 text-[14px]" style={{ color: "var(--cm-text3)" }}>forever</span>
              </div>
              <p className="mt-2 text-[13.5px]" style={{ color: "var(--cm-text2)" }}>For anyone who wants a better inbox.</p>
              <Link href="/sign-up"
                className="mt-6 flex w-full items-center justify-center rounded-2xl border py-3.5 text-[14px] font-[800] transition hover:-translate-y-0.5"
                style={{ borderColor: "var(--cm-border2)", color: "var(--cm-text)", background: "var(--cm-surface2)" }}>
                Get started free
              </Link>
              <ul className="mt-7 space-y-3">
                {[
                  "Up to 2 email accounts",
                  "All core inbox features",
                  "Threaded conversations",
                  "Snooze & reminders",
                  "Schedule send",
                  "Full-text search",
                  "AES-256 encrypted storage",
                  "Dark & light mode",
                  "Keyboard shortcuts",
                ].map(f => (
                  <li key={f} className="flex items-center gap-3 text-[13.5px]" style={{ color: "var(--cm-text2)" }}>
                    <Check className="h-4 w-4 shrink-0" style={{ color: "#10B981" }} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Hostcari Pro */}
            <div className="relative overflow-hidden rounded-[28px] border-2 p-8"
              style={{ borderColor: "var(--cm-accent-b)", background: "var(--cm-surface)", boxShadow: "0 12px 48px var(--cm-accent-b)" }}>
              <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full blur-3xl" style={{ background: "var(--cm-accent-dim)" }} />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <p className="text-[10.5px] font-[800] uppercase tracking-[0.20em]" style={{ color: "var(--cm-accent)" }}>Hostcari Client</p>
                  <span className="hostcari-badge">HC</span>
                </div>
                <div className="mt-2 flex items-end gap-2">
                  <span className="text-[44px] font-[900] leading-none" style={{ color: "var(--cm-text)" }}>Free</span>
                </div>
                <p className="mt-2 text-[13.5px]" style={{ color: "var(--cm-text2)" }}>Included with your Hostcari hosting.</p>
                <Link href="/sign-up"
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[14px] font-[800] text-white transition hover:-translate-y-0.5"
                  style={{ background: "linear-gradient(135deg, var(--cm-accent), var(--cm-accent2))", boxShadow: "0 6px 20px var(--cm-accent-b)" }}>
                  Claim your account
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </Link>
                <ul className="mt-7 space-y-3">
                  {[
                    "Everything in Free",
                    "Unlimited email accounts",
                    "HC badge & verified identity",
                    "Priority support",
                    "Early access to new features",
                    "Advanced rule automation",
                    "Exclusive Hostcari integrations",
                  ].map((f, i) => (
                    <li key={f} className="flex items-center gap-3 text-[13.5px]" style={{ color: "var(--cm-text2)" }}>
                      <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${i === 0 ? "" : ""}`}
                        style={{ background: i === 0 ? "rgba(16,185,129,0.15)" : "var(--cm-accent-dim)", color: i === 0 ? "#10B981" : "var(--cm-accent)" }}>
                        <Check className="h-2.5 w-2.5" strokeWidth={3} />
                      </span>
                      <span style={{ fontWeight: i === 0 ? 400 : 600 }}>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────── TESTIMONIALS ─────────────────────── */}
      <section className="py-20" style={{ background: "var(--cm-surface)" }}>
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="mb-12 text-center">
            <p className="text-[11px] font-[800] uppercase tracking-[0.24em]" style={{ color: "var(--cm-accent)" }}>Testimonials</p>
            <h2 className="mt-2 text-[32px] font-[900] tracking-tight" style={{ color: "var(--cm-text)" }}>Loved by power users</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              {
                quote: "Finally an email client that doesn't feel like it's from 2010. The keyboard shortcuts and thread view alone are worth switching.",
                name: "Alex K.",
                role: "Software Engineer",
                avatar: "from-[#F97316] to-[#EA580C]",
              },
              {
                quote: "As a Hostcari client I get everything for free. The HC badge and the clean interface make it feel like a premium product.",
                name: "Maria R.",
                role: "Freelancer & HC Client",
                avatar: "from-[#0044BC] to-[#003399]",
                hc: true,
              },
              {
                quote: "Snooze and reminders changed how I manage my inbox. I no longer keep dozens of tabs open just to remember to reply.",
                name: "Thomas W.",
                role: "Business Owner",
                avatar: "from-[#7C3AED] to-[#6D28D9]",
              },
            ].map(t => (
              <div key={t.name}
                className="relative overflow-hidden rounded-[24px] border p-6"
                style={{ borderColor: "var(--cm-border)", background: "var(--cm-bg)", boxShadow: "var(--cm-shadow)" }}>
                <div className="mb-4 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="h-4 w-4" viewBox="0 0 24 24" fill="#F59E0B">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <p className="text-[14px] leading-relaxed" style={{ color: "var(--cm-text)" }}>&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-5 flex items-center gap-3">
                  <div className={`h-9 w-9 rounded-full bg-gradient-to-br ${t.avatar} flex items-center justify-center text-[12px] font-[700] text-white`}>
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-[700]" style={{ color: "var(--cm-text)" }}>{t.name}</span>
                      {t.hc && <span className="hostcari-badge">HC</span>}
                    </div>
                    <span className="text-[11.5px]" style={{ color: "var(--cm-text3)" }}>{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────── FAQ ─────────────────────────── */}
      <section id="faq" className="py-24">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <div className="mb-12 text-center">
            <p className="text-[11px] font-[800] uppercase tracking-[0.24em]" style={{ color: "var(--cm-blue)" }}>FAQ</p>
            <h2 className="mt-2 text-[32px] font-[900] tracking-tight sm:text-[38px]" style={{ color: "var(--cm-text)" }}>
              Questions & answers
            </h2>
          </div>
          <FaqAccordion />
        </div>
      </section>

      {/* ────────────────────── FINAL CTA ────────────────────── */}
      <section className="pb-24">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <div className="relative overflow-hidden rounded-[32px] px-8 py-16 text-center sm:px-14"
            style={{ background: "linear-gradient(135deg, var(--cm-text) 0%, #1e293b 100%)" }}>
            {/* Ambient blobs */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full blur-3xl" style={{ background: "rgba(249,115,22,0.15)" }} />
            <div className="pointer-events-none absolute -bottom-12 -left-12 h-56 w-56 rounded-full blur-3xl" style={{ background: "rgba(0,68,188,0.15)" }} />

            <div className="relative">
              <span className="mb-5 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11.5px] font-[700]"
                style={{ background: "rgba(249,115,22,0.20)", color: "#FB923C", border: "1px solid rgba(249,115,22,0.30)" }}>
                <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                Free to start · No card required
              </span>
              <h2 className="mx-auto mt-4 max-w-xl text-[32px] font-[900] leading-tight tracking-tight text-white sm:text-[42px]">
                Start reading email<br />the right way.
              </h2>
              <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed" style={{ color: "rgba(241,245,249,0.70)" }}>
                Join Carimail today and connect your first mailbox in under a minute.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link href="/sign-up"
                  className="group relative inline-flex items-center gap-2 overflow-hidden rounded-2xl px-8 py-4 text-[15px] font-[800] text-white transition hover:-translate-y-0.5"
                  style={{ background: "linear-gradient(135deg, var(--cm-accent), var(--cm-accent2))", boxShadow: "0 10px 32px rgba(249,115,22,0.35)" }}>
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
        </div>
      </section>

      {/* ─────────────────────────── FOOTER ─────────────────────────── */}
      <footer className="border-t" style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)" }}>
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
          <div className="mb-10 grid gap-8 sm:grid-cols-2 md:grid-cols-4">
            {/* Brand */}
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
              <p className="max-w-xs text-[12.5px] leading-relaxed" style={{ color: "var(--cm-text3)" }}>
                A polished email client that works with any IMAP provider.
                Built for Hostcari clients and everyone who deserves a better inbox.
              </p>
            </div>
            {/* Product */}
            <div>
              <p className="mb-3 text-[10px] font-[800] uppercase tracking-[0.20em]" style={{ color: "var(--cm-text3)" }}>Product</p>
              <ul className="space-y-2.5">
                {[
                  { label: "Features", href: "#features" },
                  { label: "Pricing", href: "#pricing" },
                  { label: "FAQ", href: "#faq" },
                  { label: "Sign in", href: "/sign-in" },
                  { label: "Get started", href: "/sign-up" },
                ].map(l => (
                  <li key={l.label}><a href={l.href} className="text-[13px] font-[500] hover:underline" style={{ color: "var(--cm-text2)" }}>{l.label}</a></li>
                ))}
              </ul>
            </div>
            {/* Legal */}
            <div>
              <p className="mb-3 text-[10px] font-[800] uppercase tracking-[0.20em]" style={{ color: "var(--cm-text3)" }}>Legal</p>
              <ul className="space-y-2.5">
                {[
                  { label: "Terms of Service", href: "/terms" },
                  { label: "Privacy Policy", href: "/privacy" },
                ].map(l => (
                  <li key={l.label}><Link href={l.href} className="text-[13px] font-[500] hover:underline" style={{ color: "var(--cm-text2)" }}>{l.label}</Link></li>
                ))}
              </ul>
            </div>
            {/* Hostcari */}
            <div>
              <p className="mb-3 text-[10px] font-[800] uppercase tracking-[0.20em]" style={{ color: "var(--cm-text3)" }}>Hostcari</p>
              <ul className="space-y-2.5">
                {[
                  { label: "hostcari.com", href: "https://hostcari.com", external: true },
                  { label: "Support", href: "mailto:support@hostcari.com", external: true },
                ].map(l => (
                  <li key={l.label}>
                    <a href={l.href} target={l.external ? "_blank" : undefined} rel={l.external ? "noopener noreferrer" : undefined}
                      className="inline-flex items-center gap-1.5 text-[13px] font-[500] hover:underline" style={{ color: "var(--cm-text2)" }}>
                      {l.label}
                      {l.external && <ExternalLink className="h-2.5 w-2.5 opacity-50" />}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-3 border-t pt-6 sm:flex-row"
            style={{ borderColor: "var(--cm-border)" }}>
            <p className="text-[12px]" style={{ color: "var(--cm-text3)" }}>
              © {new Date().getFullYear()} Hostcari. All rights reserved.
            </p>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: "#10B981" }} />
              <span className="text-[12px]" style={{ color: "var(--cm-text3)" }}>All systems operational</span>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes orbFloat1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(40px,30px) scale(1.05)} 66%{transform:translate(-20px,50px) scale(0.97)} }
        @keyframes orbFloat2 { 0%,100%{transform:translate(0,0) scale(1)} 40%{transform:translate(-50px,-35px) scale(1.06)} 70%{transform:translate(30px,-20px) scale(0.95)} }
      `}</style>
    </div>
  );
}
