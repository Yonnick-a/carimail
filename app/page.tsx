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
import { ScrollFeatures } from "@/components/landing/ScrollFeatures";
import { HeroEmailDemo } from "@/components/landing/HeroEmailDemo";
import { FeatureCard } from "@/components/landing/FeatureCard";
import {
  EncryptAnimation,
  ThemeAnimation,
  SearchAnimation,
  AttachmentAnimation,
  KeyboardAnimation,
  AiAnimation,
  TeamAnimation,
  TotpAnimation,
  ProviderAnimation,
} from "@/components/landing/FeatureCardAnimations";

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

        <div className="relative mx-auto max-w-6xl px-4 pb-4 pt-20 text-center sm:px-8 sm:pt-32">
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
            {/* Animated email demo */}
            <HeroEmailDemo />
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
      <section id="features">
        {/* Section header */}
        <div className="mx-auto max-w-6xl px-4 pb-12 pt-20 sm:px-8 sm:pb-16 sm:pt-28">
          <AnimateIn className="text-center">
            <h2 className="text-[36px] font-[900] tracking-[-0.025em] sm:text-[48px]" style={{ color: "var(--cm-text)" }}>
              Everything you need.
              <br />
              <span style={{ color: "var(--cm-text3)", fontWeight: 400 }}>Nothing you don&apos;t.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-[17px] leading-relaxed" style={{ color: "var(--cm-text2)" }}>
              We studied the email clients you love — and cut everything that slows you down.
            </p>
          </AnimateIn>
        </div>

        {/* Sticky scroll spotlight features */}
        <ScrollFeatures />

        {/* Feature grid */}
        <div className="mx-auto max-w-6xl px-4 pb-24 pt-20 sm:px-8 sm:pb-28 sm:pt-24">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: "🔒", title: "AES-256 encrypted",      desc: "Your credentials are encrypted before storage. Never logged, never exposed.",             visual: <EncryptAnimation /> },
              { icon: "🌙", title: "Dark & light mode",       desc: "Carefully tuned themes for any hour. Respects your system preference automatically.",      visual: <ThemeAnimation /> },
              { icon: "⚡", title: "Live search",             desc: "Real-time search across all your mail as you type. Instant results, no waiting.",          visual: <SearchAnimation /> },
              { icon: "📎", title: "Inline attachment viewer",desc: "Preview PDFs, images, and documents inline — without leaving the app.",                    visual: <AttachmentAnimation /> },
              { icon: "⌨", title: "Keyboard-first design",   desc: "Every action has a shortcut. Press ? to see the full list. Stay in the flow.",              visual: <KeyboardAnimation /> },
              { icon: "🤖", title: "AI categorisation",       desc: "Emails are automatically sorted into Primary, Updates, Finance, Security, and more.",       visual: <AiAnimation /> },
              { icon: "👥", title: "Team collaboration",      desc: "Share mailboxes with your team. Invite members, assign roles, manage access.",              visual: <TeamAnimation /> },
              { icon: "🔐", title: "Two-factor auth",         desc: "Add an extra layer of protection with TOTP two-factor authentication and backup codes.",    visual: <TotpAnimation /> },
              { icon: "🔓", title: "No lock-in",              desc: "Works with any IMAP/SMTP server. Your data stays with your email provider.",                visual: <ProviderAnimation /> },
            ].map((f, i) => (
              <AnimateIn key={f.title} direction="up" delay={i * 0.06}>
                <FeatureCard icon={f.icon} title={f.title} desc={f.desc} visual={f.visual} />
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
                  {["Up to 2 email accounts","All core inbox features","Threaded conversations","Snooze & reminders","Schedule send","Live search","AI email categorisation","Two-factor authentication","AES-256 encrypted storage","Team collaboration","Dark & light mode","Keyboard shortcuts"].map(f => (
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
                    {["Everything in Free","Unlimited email accounts","Unlimited team members","HC badge & verified identity","Priority support","Early access to new features","Advanced rule automation","Exclusive Hostcari integrations"].map((f, i) => (
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

      {/* ──────────────────────── SUPPORT / DONATE ──────────────────────── */}
      <section className="py-20" style={{ background: "var(--cm-surface)" }}>
        <div className="mx-auto max-w-2xl px-5 sm:px-8">
          <AnimateIn direction="scale">
            <div className="relative overflow-hidden rounded-[28px] border px-8 py-10 text-center sm:px-12"
              style={{ borderColor: "var(--cm-border)", background: "var(--cm-bg)", boxShadow: "var(--cm-shadow-lg)" }}>
              {/* Background glow */}
              <div className="pointer-events-none absolute -left-12 -top-12 h-40 w-40 rounded-full blur-3xl" style={{ background: "rgba(249,115,22,0.08)" }} />
              <div className="pointer-events-none absolute -bottom-12 -right-12 h-40 w-40 rounded-full blur-3xl" style={{ background: "rgba(0,68,188,0.07)" }} />
              <div className="relative">
                <span className="text-3xl">☕</span>
                <h2 className="mt-4 text-[22px] font-[900] tracking-tight sm:text-[26px]" style={{ color: "var(--cm-text)" }}>
                  Carimail is free — and always will be.
                </h2>
                <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed" style={{ color: "var(--cm-text2)" }}>
                  We don&apos;t charge for any features and we don&apos;t sell your data. If Carimail saves you time every day, a small contribution keeps the lights on.
                </p>
                <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                  <a
                    href="https://ko-fi.com/carimail"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative inline-flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl px-7 py-3.5 text-[14px] font-[800] text-white transition hover:-translate-y-0.5 sm:w-auto"
                    style={{ background: "linear-gradient(135deg, #F97316, #EA580C)", boxShadow: "0 8px 28px rgba(249,115,22,0.30)" }}
                  >
                    <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                    <span>☕</span> Buy us a coffee
                  </a>
                  <a
                    href="https://github.com/hostcari/carimail"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border px-7 py-3.5 text-[14px] font-[700] transition hover:-translate-y-0.5 sm:w-auto"
                    style={{ borderColor: "var(--cm-border2)", color: "var(--cm-text2)", background: "var(--cm-surface)" }}
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                    Star on GitHub
                  </a>
                </div>
                <p className="mt-5 text-[11.5px]" style={{ color: "var(--cm-text3)" }}>
                  100% of contributions go toward hosting and development. No subscriptions, no upsells.
                </p>
              </div>
            </div>
          </AnimateIn>
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
