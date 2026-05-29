"use client";
import { useEffect, useRef, useState } from "react";
import { Check, Users, Crown, Shield, Clock, Mail, Send, Bell } from "lucide-react";

type Feature = {
  tag: string;
  title: string;
  desc: string;
  points: string[];
  color: string;
  bg: string;
  visual: React.ReactNode;
};

const features: Feature[] = [
  {
    tag: "Multi-account",
    title: "All your accounts,\none view.",
    desc: "Connect Gmail, Outlook, Hostcari, or any IMAP mailbox. Switch accounts instantly — no more tab juggling.",
    points: ["Multiple account support", "Account switcher in sidebar", "Primary account routing", "Per-account labels"],
    color: "#0044BC",
    bg: "rgba(0,68,188,0.10)",
    visual: (
      <div className="w-full space-y-2.5">
        {["you@gmail.com", "work@outlook.com", "you@hostcari.com"].map((e, i) => (
          <div key={e} className="flex items-center gap-3 rounded-2xl border px-4 py-3.5"
            style={{
              borderColor: "var(--cm-border)",
              background: "var(--cm-surface)",
              boxShadow: "0 2px 12px rgba(15,23,42,0.07)",
              transform: `translateX(${i * 10}px)`,
              opacity: 1 - i * 0.12,
            }}>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#F97316] to-[#0044BC] text-[10px] font-[800] text-white">
              {e.charAt(0).toUpperCase()}
            </div>
            <span className="flex-1 text-[13px] font-[600]" style={{ color: "var(--cm-text)" }}>{e}</span>
            {i === 0 && (
              <span className="rounded-full px-2 py-0.5 text-[9px] font-[800]"
                style={{ background: "rgba(0,68,188,0.10)", color: "#0044BC" }}>Primary</span>
            )}
            <span className="h-2 w-2 rounded-full" style={{ background: i === 0 ? "#10B981" : "var(--cm-border2)" }} />
          </div>
        ))}
      </div>
    ),
  },
  {
    tag: "Conversations",
    title: "Threads that\nactually make sense.",
    desc: "Carimail groups messages by conversation automatically. You always know who said what — no re-reading chain emails.",
    points: ["Auto-grouped threads", "Inline reply panel", "Full thread history", "Jump to any message"],
    color: "#7C3AED",
    bg: "rgba(124,58,237,0.10)",
    visual: (
      <div className="w-full space-y-2">
        {[
          { name: "Sarah K.", time: "10:24 AM", left: true },
          { name: "You", time: "10:31 AM", left: false },
          { name: "Sarah K.", time: "10:45 AM", left: true },
        ].map((m, i) => (
          <div key={i} className="flex gap-2.5"
            style={{ flexDirection: m.left ? "row" : "row-reverse" }}>
            <div className="h-7 w-7 shrink-0 rounded-full"
              style={{ background: m.left ? "linear-gradient(135deg,#7C3AED,#6D28D9)" : "linear-gradient(135deg,#F97316,#EA580C)" }} />
            <div className="max-w-[75%] rounded-2xl border px-3.5 py-2.5"
              style={{
                borderColor: "var(--cm-border)",
                background: m.left ? "var(--cm-surface)" : "rgba(124,58,237,0.07)",
                boxShadow: "0 1px 4px rgba(15,23,42,0.06)",
              }}>
              <div className="mb-1 flex items-center gap-2">
                <span className="text-[11px] font-[700]" style={{ color: "var(--cm-text)" }}>{m.name}</span>
                <span className="text-[10px]" style={{ color: "var(--cm-text3)" }}>{m.time}</span>
              </div>
              <div className="h-2 rounded-full" style={{ width: "85%", background: "var(--cm-border2)" }} />
              <div className="mt-1.5 h-2 rounded-full" style={{ width: "65%", background: "var(--cm-border2)", opacity: 0.6 }} />
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    tag: "Productivity",
    title: "Snooze, remind,\nschedule — stay ahead.",
    desc: "Snooze emails to come back when you're ready. Set reminders so you never miss a follow-up. Schedule sends for the perfect moment.",
    points: ["Snooze to any time", "Follow-up reminders", "Scheduled send", "Rules & automation"],
    color: "#D97706",
    bg: "rgba(217,119,6,0.10)",
    visual: (
      <div className="w-full space-y-3">
        {[
          { icon: <Clock className="h-5 w-5" />, label: "Snooze", sub: "Return tomorrow at 9am", color: "#D97706", bg: "rgba(217,119,6,0.10)" },
          { icon: <Bell className="h-5 w-5" />, label: "Remind me", sub: "Follow up in 3 days", color: "#7C3AED", bg: "rgba(124,58,237,0.10)" },
          { icon: <Send className="h-5 w-5" />, label: "Schedule send", sub: "Send Monday morning", color: "#0044BC", bg: "rgba(0,68,188,0.10)" },
        ].map(a => (
          <div key={a.label} className="flex items-center gap-4 rounded-2xl border px-4 py-3.5"
            style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)", boxShadow: "0 2px 12px rgba(15,23,42,0.07)" }}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: a.bg, color: a.color }}>
              {a.icon}
            </div>
            <div>
              <div className="text-[13px] font-[700]" style={{ color: a.color }}>{a.label}</div>
              <div className="text-[11.5px]" style={{ color: "var(--cm-text3)" }}>{a.sub}</div>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    tag: "Teams",
    title: "Team mailboxes,\ndone right.",
    desc: "Share inboxes across your team with role-based access. Invite teammates by email, assign roles, and manage everything from one place.",
    points: ["Shared mailboxes", "Owner / admin / member roles", "Email invites", "Team management dashboard"],
    color: "#059669",
    bg: "rgba(5,150,105,0.10)",
    visual: (
      <div className="w-full space-y-3">
        <div className="rounded-2xl border px-4 py-4" style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)", boxShadow: "0 2px 12px rgba(15,23,42,0.07)" }}>
          <div className="mb-3 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: "rgba(5,150,105,0.10)", color: "#059669" }}>
              <Users className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[13px] font-[800]" style={{ color: "var(--cm-text)" }}>Marketing Team</div>
              <div className="text-[10.5px]" style={{ color: "var(--cm-text3)" }}>3 members · 1 shared mailbox</div>
            </div>
          </div>
          <div className="space-y-2">
            {[
              { initials: "JD", name: "Jordan D.", role: "owner", color: "from-[#F97316] to-[#EA580C]" },
              { initials: "SL", name: "Sarah L.", role: "admin", color: "from-[#0044BC] to-[#003399]" },
              { initials: "MR", name: "Marc R.", role: "member", color: "from-[#7C3AED] to-[#6D28D9]" },
            ].map(m => (
              <div key={m.initials} className="flex items-center gap-2.5">
                <div className={`flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br ${m.color} text-[9px] font-[800] text-white`}>
                  {m.initials}
                </div>
                <span className="flex-1 text-[12px] font-[600]" style={{ color: "var(--cm-text)" }}>{m.name}</span>
                <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-[800] capitalize"
                  style={{
                    background: m.role === "owner" ? "rgba(249,115,22,0.12)" : m.role === "admin" ? "rgba(0,68,188,0.10)" : "var(--cm-surface3)",
                    color: m.role === "owner" ? "#F97316" : m.role === "admin" ? "#0044BC" : "var(--cm-text3)",
                  }}>
                  {m.role === "owner" && <Crown className="h-2.5 w-2.5" />}
                  {m.role}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-xl border px-3 py-2"
            style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface2)" }}>
            <Mail className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--cm-text3)" }} />
            <span className="text-[11.5px] font-[600]" style={{ color: "var(--cm-text2)" }}>marketing@company.com</span>
            <span className="ml-auto rounded-full px-2 py-0.5 text-[9px] font-[800]"
              style={{ background: "rgba(5,150,105,0.10)", color: "#059669" }}>Shared</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    tag: "Security",
    title: "Built-in 2FA\nand encryption.",
    desc: "Every account password is AES-256 encrypted at rest. Enable two-factor authentication for an extra layer of protection against unauthorized access.",
    points: ["AES-256 encrypted credentials", "TOTP two-factor auth", "Backup recovery codes", "Session management"],
    color: "#DC2626",
    bg: "rgba(220,38,38,0.10)",
    visual: (
      <div className="w-full space-y-3">
        <div className="rounded-2xl border px-4 py-4" style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)", boxShadow: "0 2px 12px rgba(15,23,42,0.07)" }}>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: "rgba(220,38,38,0.10)", color: "#DC2626" }}>
                <Shield className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[13px] font-[800]" style={{ color: "var(--cm-text)" }}>Two-factor auth</div>
                <div className="text-[10.5px] text-emerald-500 font-[700]">Enabled</div>
              </div>
            </div>
            <div className="h-5 w-9 rounded-full" style={{ background: "#10B981" }}>
              <div className="ml-auto mr-0.5 mt-0.5 h-4 w-4 rounded-full bg-white shadow" />
            </div>
          </div>
          <div className="rounded-xl border px-4 py-3 text-center" style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface2)" }}>
            <div className="text-[10px] font-[700] uppercase tracking-[0.18em] mb-1" style={{ color: "var(--cm-text3)" }}>Authentication code</div>
            <div className="font-mono text-[26px] font-[900] tracking-[0.2em]" style={{ color: "var(--cm-text)" }}>482 931</div>
            <div className="mt-1.5 mx-auto h-1 w-32 overflow-hidden rounded-full" style={{ background: "var(--cm-border2)" }}>
              <div className="h-full rounded-full" style={{ width: "65%", background: "#10B981" }} />
            </div>
            <div className="mt-1 text-[10px]" style={{ color: "var(--cm-text3)" }}>Expires in 19s</div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border px-3 py-2.5"
          style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)" }}>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: "rgba(220,38,38,0.10)", color: "#DC2626" }}>
            <Shield className="h-3.5 w-3.5" />
          </div>
          <span className="text-[12px] font-[600]" style={{ color: "var(--cm-text)" }}>AES-256 encrypted storage</span>
          <span className="ml-auto text-[10px] font-[700] text-emerald-500">Active</span>
        </div>
      </div>
    ),
  },
];

export function ScrollFeatures() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (isMobile) return;
    const container = containerRef.current;
    if (!container) return;

    const onScroll = () => {
      const rect = container.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      if (scrollable <= 0) return;
      const progress = Math.max(0, Math.min(1, -rect.top / scrollable));
      const idx = Math.min(features.length - 1, Math.floor(progress * features.length));
      setScrollProgress(progress);
      setActiveIdx(idx);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [isMobile]);

  // Mobile: stacked sections
  if (isMobile) {
    return (
      <div className="mx-auto max-w-xl space-y-20 px-4 sm:max-w-2xl sm:space-y-24 sm:px-8">
        {features.map(f => (
          <div key={f.tag} className="flex flex-col gap-10">
            <div>
              <h3 className="text-[30px] font-[900] leading-tight tracking-tight"
                style={{ color: "var(--cm-text)", whiteSpace: "pre-line" }}>{f.title}</h3>
              <p className="mt-4 text-[16px] leading-[1.7]" style={{ color: "var(--cm-text2)" }}>{f.desc}</p>
              <ul className="mt-6 space-y-2.5">
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
            <div className="relative overflow-hidden rounded-[24px] border p-5"
              style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)", boxShadow: "0 8px 32px rgba(15,23,42,0.08)" }}>
              <div className="absolute left-0 right-0 top-0 h-[3px] rounded-t-[24px]"
                style={{ background: `linear-gradient(90deg, ${f.color}, transparent)` }} />
              {f.visual}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const n = features.length;
  const feature = features[activeIdx];

  // Dot positions for progress track (px from top of track)
  const DOT_SPACING = 36;
  const TRACK_HEIGHT = (n - 1) * DOT_SPACING;

  return (
    <div ref={containerRef} style={{ height: `${n * 100}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden">

        {/* Per-feature ambient background wash */}
        {features.map((f, i) => (
          <div
            key={f.tag}
            className="pointer-events-none absolute inset-0"
            style={{
              background: `radial-gradient(ellipse 65% 75% at 78% 50%, ${f.color}0d, transparent 65%)`,
              opacity: i === activeIdx ? 1 : 0,
              transition: "opacity 1s cubic-bezier(0.16,1,0.3,1)",
            }}
          />
        ))}

        <div className="relative flex h-full items-center">
          <div className="mx-auto flex w-full max-w-6xl items-center gap-16 px-8">

            {/* Left: feature text */}
            <div className="relative flex-1">

              {/* Large editorial index number */}
              <div
                className="pointer-events-none absolute select-none font-[900] leading-none"
                style={{
                  fontSize: "clamp(100px, 13vw, 190px)",
                  color: feature.color,
                  opacity: 0.045,
                  transition: "color 0.7s cubic-bezier(0.16,1,0.3,1)",
                  top: "-0.12em",
                  left: "-0.06em",
                  lineHeight: 1,
                }}
              >
                {String(activeIdx + 1).padStart(2, "0")}
              </div>

              {features.map((f, i) => {
                const isActive = i === activeIdx;
                const ty = isActive ? 0 : i < activeIdx ? -36 : 36;
                return (
                  <div
                    key={f.tag}
                    className="absolute inset-0 flex items-center"
                    style={{ pointerEvents: isActive ? "auto" : "none" }}
                  >
                    <div
                      style={{
                        opacity: isActive ? 1 : 0,
                        transform: `translateY(${ty}px)`,
                        transition: "opacity 0.55s cubic-bezier(0.16,1,0.3,1), transform 0.55s cubic-bezier(0.16,1,0.3,1)",
                        willChange: "opacity, transform",
                        width: "100%",
                      }}
                    >
                      <h3
                        className="font-[900] leading-[1.08] tracking-[-0.03em]"
                        style={{
                          fontSize: "clamp(32px, 4vw, 52px)",
                          color: "var(--cm-text)",
                          whiteSpace: "pre-line",
                        }}
                      >
                        {f.title}
                      </h3>

                      <p className="mt-5 max-w-md text-[17px] leading-[1.7]" style={{ color: "var(--cm-text2)" }}>
                        {f.desc}
                      </p>

                      <ul className="mt-7 space-y-3">
                        {f.points.map((p, pi) => (
                          <li
                            key={p}
                            className="flex items-center gap-3 text-[15px] font-[600]"
                            style={{
                              color: "var(--cm-text2)",
                              opacity: isActive ? 1 : 0,
                              transform: isActive ? "none" : "translateX(-10px)",
                              transition: `opacity 0.45s cubic-bezier(0.16,1,0.3,1) ${0.18 + pi * 0.07}s, transform 0.45s cubic-bezier(0.16,1,0.3,1) ${0.18 + pi * 0.07}s`,
                            }}
                          >
                            <span
                              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                              style={{ background: f.bg, color: f.color }}
                            >
                              <Check className="h-3 w-3" strokeWidth={3} />
                            </span>
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}

              {/* Height placeholder */}
              <div aria-hidden style={{ visibility: "hidden" }}>
                <h3 className="font-[900] leading-[1.08]" style={{ fontSize: "clamp(32px,4vw,52px)", whiteSpace: "pre-line" }}>{feature.title}</h3>
                <p className="mt-5 text-[17px]">{feature.desc}</p>
                <ul className="mt-7 space-y-3">
                  {feature.points.map(p => <li key={p} className="text-[15px]">{p}</li>)}
                </ul>
              </div>
            </div>

            {/* Right: visual card */}
            <div className="relative w-[44%] shrink-0">
              {features.map((f, i) => {
                const isActive = i === activeIdx;
                const ty = isActive ? 0 : i < activeIdx ? -20 : 20;
                const scale = isActive ? 1 : 0.97;
                return (
                  <div
                    key={f.tag}
                    className="absolute inset-0 flex items-center"
                    style={{ pointerEvents: isActive ? "auto" : "none" }}
                  >
                    <div
                      className="relative w-full overflow-hidden rounded-[32px] border p-6 sm:p-8"
                      style={{
                        borderColor: isActive ? `${f.color}38` : "var(--cm-border)",
                        background: "var(--cm-surface)",
                        boxShadow: isActive
                          ? `0 32px 80px rgba(15,23,42,0.13), 0 0 0 1px ${f.color}1a, 0 0 70px ${f.color}14`
                          : "0 12px 40px rgba(15,23,42,0.06)",
                        opacity: isActive ? 1 : 0,
                        transform: `translateY(${ty}px) scale(${scale})`,
                        transition: [
                          "opacity 0.6s cubic-bezier(0.16,1,0.3,1) 0.06s",
                          "transform 0.6s cubic-bezier(0.16,1,0.3,1) 0.06s",
                          "box-shadow 0.9s cubic-bezier(0.16,1,0.3,1)",
                          "border-color 0.9s cubic-bezier(0.16,1,0.3,1)",
                        ].join(", "),
                        willChange: "opacity, transform",
                      }}
                    >
                      {/* Glowing top accent bar */}
                      <div
                        className="absolute left-0 right-0 top-0 h-[3px] rounded-t-[32px]"
                        style={{
                          background: `linear-gradient(90deg, ${f.color}, ${f.color}00)`,
                          boxShadow: `0 0 20px ${f.color}80`,
                        }}
                      />
                      {/* Corner ambient glow */}
                      <div
                        className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full blur-3xl"
                        style={{ background: f.color, opacity: 0.08 }}
                      />
                      {f.visual}
                    </div>
                  </div>
                );
              })}

              {/* Height placeholder */}
              <div aria-hidden style={{ visibility: "hidden" }}>
                <div className="overflow-hidden rounded-[32px] border p-6 sm:p-8">{feature.visual}</div>
              </div>
            </div>

            {/* Progress indicator */}
            <div className="absolute right-5 top-1/2 flex -translate-y-1/2 flex-col items-center gap-3">
              {/* Feature counter */}
              <div className="flex items-baseline gap-px tabular-nums">
                <span
                  className="text-[13px] font-[900]"
                  style={{ color: feature.color, transition: "color 0.5s cubic-bezier(0.16,1,0.3,1)" }}
                >
                  {String(activeIdx + 1).padStart(2, "0")}
                </span>
                <span className="text-[10px] font-[600]" style={{ color: "var(--cm-text3)" }}>
                  /{String(n).padStart(2, "0")}
                </span>
              </div>

              {/* Track + dots */}
              <div className="relative flex flex-col items-center" style={{ height: TRACK_HEIGHT + 6 }}>
                {/* Background track */}
                <div
                  className="absolute left-1/2 top-0 w-px -translate-x-1/2 rounded-full"
                  style={{ height: TRACK_HEIGHT, background: "var(--cm-border2)" }}
                />
                {/* Filled track */}
                <div
                  className="absolute left-1/2 top-0 w-px -translate-x-1/2 rounded-full origin-top"
                  style={{
                    height: TRACK_HEIGHT,
                    background: feature.color,
                    transform: `translateX(-50%) scaleY(${scrollProgress})`,
                    transformOrigin: "top",
                    transition: "background 0.5s cubic-bezier(0.16,1,0.3,1)",
                    boxShadow: `0 0 6px ${feature.color}60`,
                  }}
                />
                {/* Dots */}
                {features.map((f, i) => {
                  const isActive = i === activeIdx;
                  const isPast = i < activeIdx;
                  return (
                    <div
                      key={f.tag}
                      className="absolute left-1/2 -translate-x-1/2 rounded-full"
                      style={{
                        top: i * DOT_SPACING - 3,
                        width: isActive ? 8 : 5,
                        height: isActive ? 8 : 5,
                        marginTop: isActive ? -1.5 : 0,
                        background: isActive ? feature.color : isPast ? feature.color : "var(--cm-border2)",
                        boxShadow: isActive ? `0 0 10px ${feature.color}90` : "none",
                        transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
