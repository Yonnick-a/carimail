"use client";
import { useEffect, useState } from "react";

const MOCK_EMAILS = [
  {
    id: 1, from: "Sarah K.", email: "sarah@agency.co", avatar: "S",
    color: "from-[#7C3AED] to-[#6D28D9]",
    subject: "Q3 Report — final draft ready",
    snippet: "Hi team, the analysis is ready for your review. Revenue is up 24% compared to Q2...",
    time: "10:45 AM", unread: true, starred: true,
  },
  {
    id: 2, from: "GitHub", email: "noreply@github.com", avatar: "G",
    color: "from-[#1F2937] to-[#374151]",
    subject: "PR #47 merged · Add dark mode support",
    snippet: "yonnick merged pull request #47 into main. 14 files changed, 320 insertions.",
    time: "9:32 AM", unread: true, starred: false,
  },
  {
    id: 3, from: "Stripe", email: "support@stripe.com", avatar: "St",
    color: "from-[#6772E5] to-[#4F46E5]",
    subject: "Payout of $2,340 processed",
    snippet: "Your payout has been deposited to your bank account ending in 4242. View details...",
    time: "Yesterday", unread: false, starred: false,
  },
  {
    id: 4, from: "Jordan D.", email: "jordan@company.com", avatar: "J",
    color: "from-[#F97316] to-[#EA580C]",
    subject: "Re: Team standup — Thursday",
    snippet: "Sounds good! I'll have the slides ready tonight. Should I share them in Slack first?",
    time: "Mon", unread: false, starred: false,
  },
  {
    id: 5, from: "Hostcari", email: "hello@hostcari.com", avatar: "H",
    color: "from-[#F97316] to-[#C2410C]",
    subject: "Your hosting plan renews in 7 days",
    snippet: "Your Pro hosting plan (hostcari.com) renews on June 5th. We'll charge your card on file.",
    time: "Sun", unread: false, starred: false,
  },
];

const READER_EMAIL = MOCK_EMAILS[0];

const PHASES = ["loading", "inbox", "open", "focus"] as const;
type Phase = typeof PHASES[number];

const PHASE_DURATION: Record<Phase, number> = {
  loading: 1200,
  inbox:   2000,
  open:    2800,
  focus:   3000,
};

function Dot({ color }: { color: string }) {
  return <div className="h-3 w-3 rounded-full" style={{ background: color }} />;
}

function SidebarIcon({ icon, label, active, unread }: { icon: React.ReactNode; label: string; active?: boolean; unread?: number }) {
  return (
    <div className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[10px] font-[500] ${active ? "font-[700]" : ""}`}
      style={{ background: active ? "var(--cm-active-bg)" : "transparent", color: active ? "var(--cm-text)" : "var(--cm-text3)" }}>
      <span className="w-3.5">{icon}</span>
      <span className="flex-1 truncate">{label}</span>
      {unread ? <span className="rounded-full px-1 py-0.5 text-[8px] font-[800] text-white" style={{ background: "var(--cm-unread-dot)" }}>{unread}</span> : null}
    </div>
  );
}

export function HeroEmailDemo() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [visibleRows, setVisibleRows] = useState(0);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;

    const advance = (current: Phase) => {
      const next: Phase =
        current === "loading" ? "inbox"
        : current === "inbox" ? "open"
        : current === "open" ? "focus"
        : "loading";
      t = setTimeout(() => { setPhase(next); advance(next); }, PHASE_DURATION[next]);
    };

    // Start: load rows progressively
    setVisibleRows(0);
    let rowTimer = 0;
    MOCK_EMAILS.forEach((_, i) => {
      rowTimer += 180;
      setTimeout(() => setVisibleRows(r => Math.max(r, i + 1)), rowTimer);
    });

    t = setTimeout(() => {
      setPhase("inbox");
      advance("inbox");
    }, PHASE_DURATION["loading"]);

    return () => clearTimeout(t);
  }, []);

  // On loop-back to loading, reset rows
  useEffect(() => {
    if (phase === "loading") {
      setVisibleRows(0);
      let rt = 0;
      MOCK_EMAILS.forEach((_, i) => {
        rt += 160;
        setTimeout(() => setVisibleRows(r => Math.max(r, i + 1)), rt);
      });
    }
  }, [phase]);

  const isFocus = phase === "focus";
  const isOpen  = phase === "open" || phase === "focus";

  return (
    <div className="flex overflow-hidden" style={{ minHeight: 420, background: "var(--cm-surface)" }}>

      {/* ── Sidebar ─────────────────────────── */}
      <div
        className="shrink-0 border-r overflow-hidden transition-[width] duration-700 ease-in-out"
        style={{
          width: isFocus ? 0 : 52,
          borderColor: "var(--cm-border)",
          background: "var(--cm-sidebar-bg)",
        }}
      >
        <div className="flex h-full w-[52px] flex-col px-1.5 py-3 gap-1">
          <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-lg border mx-auto mb-2"
            style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)" }}>
            <div className="h-4 w-4 rounded-sm bg-gradient-to-br from-[#F97316] to-[#0044BC]" />
          </div>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg mx-auto" style={{ background: "var(--cm-active-bg)" }}>
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: "var(--cm-accent)" }}><path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
          </div>
          {[
            <svg key="send" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>,
            <svg key="star" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>,
            <svg key="trash" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>,
          ].map((icon, i) => (
            <div key={i} className="flex h-7 w-7 items-center justify-center rounded-lg mx-auto transition-colors" style={{ color: "var(--cm-text3)" }}>{icon}</div>
          ))}
        </div>
      </div>

      {/* ── Message list ─────────────────────── */}
      <div
        className="shrink-0 border-r overflow-hidden transition-[width] duration-700 ease-in-out"
        style={{
          width: isFocus ? 0 : isOpen ? 220 : "min(42%, 240px)",
          borderColor: "var(--cm-border)",
          background: "var(--cm-surface)",
        }}
      >
        <div className="flex w-[240px] flex-col h-full">
          {/* List header */}
          <div className="flex shrink-0 items-center justify-between border-b px-3 py-2.5" style={{ borderColor: "var(--cm-border)" }}>
            <span className="text-[11px] font-[700]" style={{ color: "var(--cm-text)" }}>Inbox</span>
            <span className="rounded-full px-1.5 py-0.5 text-[9px] font-[800] text-white" style={{ background: "var(--cm-unread-dot)" }}>2</span>
          </div>
          {/* Email rows */}
          <div className="flex-1 overflow-hidden">
            {MOCK_EMAILS.map((msg, i) => {
              const visible = i < visibleRows;
              const active = isOpen && msg.id === READER_EMAIL.id;
              return (
                <div
                  key={msg.id}
                  className="flex items-start gap-2 border-b px-3 py-2.5 transition-all duration-200"
                  style={{
                    borderColor: "var(--cm-divider)",
                    background: active ? "var(--cm-blue-light)" : "transparent",
                    opacity: visible ? 1 : 0,
                    transform: visible ? "none" : "translateY(6px)",
                    transition: `opacity 0.3s ease ${i * 0.08}s, transform 0.3s ease ${i * 0.08}s, background 0.2s`,
                  }}
                >
                  {msg.unread && <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-r-full" style={{ background: "var(--cm-unread-dot)" }} />}
                  <div className={`relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${msg.color} text-[9px] font-[800] text-white`}>
                    {msg.avatar}
                    {msg.unread && <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full border-2" style={{ background: "var(--cm-unread-dot)", borderColor: "var(--cm-surface)" }} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-1">
                      <span className={`truncate text-[10.5px] ${msg.unread ? "font-[700]" : "font-[500]"}`} style={{ color: msg.unread ? "var(--cm-text)" : "var(--cm-text2)" }}>
                        {msg.from}
                      </span>
                      <span className="shrink-0 text-[9px]" style={{ color: "var(--cm-text3)" }}>{msg.time}</span>
                    </div>
                    <div className={`mt-0.5 truncate text-[10px] ${msg.unread ? "font-[600]" : ""}`} style={{ color: msg.unread ? "var(--cm-text2)" : "var(--cm-text3)" }}>
                      {msg.subject}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Reader / empty state ─────────────── */}
      <div className="flex min-w-0 flex-1 flex-col" style={{ background: "var(--cm-bg)" }}>
        {!isOpen ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 opacity-40">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: "var(--cm-border2)" }}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
            <p className="text-[11px]" style={{ color: "var(--cm-text3)" }}>Select a message</p>
          </div>
        ) : (
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Focus HUD */}
            {isFocus && (
              <div className="flex shrink-0 items-center gap-2 border-b px-4 py-2 transition-all"
                style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)", animation: "fcSlideIn 0.3s both" }}>
                <div className="flex items-center gap-1.5 text-[11px] font-[600]" style={{ color: "var(--cm-text2)" }}>
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
                  List
                </div>
                <div className="h-3 w-px mx-1" style={{ background: "var(--cm-border)" }} />
                <span className="text-[10.5px] tabular-nums" style={{ color: "var(--cm-text3)" }}>1 / 5</span>
                <div className="ml-auto flex items-center gap-2">
                  <span className="rounded-lg border px-2 py-1 text-[9.5px] font-[700]"
                    style={{ borderColor: "var(--cm-accent-b)", background: "var(--cm-accent-dim)", color: "var(--cm-accent)" }}>
                    Focus mode
                  </span>
                </div>
              </div>
            )}

            {/* Email content */}
            <div className={`flex flex-1 flex-col overflow-hidden p-5 sm:p-7 transition-all duration-500 ${isFocus ? "items-center" : ""}`}>
              <div className={`w-full ${isFocus ? "max-w-2xl" : ""}`}>
                <h2 className="text-[14px] font-[800] leading-snug sm:text-[16px]" style={{ color: "var(--cm-text)" }}>
                  {READER_EMAIL.subject}
                </h2>
                <div className="mt-3 flex items-center gap-2.5">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${READER_EMAIL.color} text-[10px] font-[800] text-white`}>
                    {READER_EMAIL.avatar}
                  </div>
                  <div>
                    <p className="text-[11.5px] font-[700]" style={{ color: "var(--cm-text)" }}>{READER_EMAIL.from}</p>
                    <p className="text-[10px]" style={{ color: "var(--cm-text3)" }}>{READER_EMAIL.email} → you@company.com</p>
                  </div>
                </div>
                <div className="my-4 h-px" style={{ background: "var(--cm-border)" }} />
                {/* Skeleton email body */}
                <div className="space-y-2.5">
                  {[92, 78, 85, 40].map((w, i) => (
                    <div key={i} className="h-2.5 rounded-full" style={{ width: `${w}%`, background: "var(--cm-border2)", opacity: 0.8 }} />
                  ))}
                  <div className="mt-4 space-y-2">
                    {[65, 88, 72, 30].map((w, i) => (
                      <div key={i} className="h-2.5 rounded-full" style={{ width: `${w}%`, background: "var(--cm-border2)", opacity: 0.6 }} />
                    ))}
                  </div>
                </div>
                {isFocus && (
                  <div className="mt-6 space-y-2" style={{ animation: "fcSlideIn 0.4s 0.15s both" }}>
                    {[55, 82, 48].map((w, i) => (
                      <div key={i} className="h-2.5 rounded-full" style={{ width: `${w}%`, background: "var(--cm-border2)", opacity: 0.5 }} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
