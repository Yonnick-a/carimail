"use client";
import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { AccountsVisual, ConversationsVisual, ProductivityVisual, TeamsVisual, SecurityVisual } from "./ScrollVisuals";

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
    visual: <AccountsVisual />,
  },
  {
    tag: "Conversations",
    title: "Threads that\nactually make sense.",
    desc: "Carimail groups messages by conversation automatically. You always know who said what — no re-reading chain emails.",
    points: ["Auto-grouped threads", "Inline reply panel", "Full thread history", "Jump to any message"],
    color: "#7C3AED",
    bg: "rgba(124,58,237,0.10)",
    visual: <ConversationsVisual />,
  },
  {
    tag: "Productivity",
    title: "Snooze, remind,\nschedule — stay ahead.",
    desc: "Snooze emails to come back when you're ready. Set reminders so you never miss a follow-up. Schedule sends for the perfect moment.",
    points: ["Snooze to any time", "Follow-up reminders", "Scheduled send", "Rules & automation"],
    color: "#D97706",
    bg: "rgba(217,119,6,0.10)",
    visual: <ProductivityVisual />,
  },
  {
    tag: "Teams",
    title: "Team mailboxes,\ndone right.",
    desc: "Share inboxes across your team with role-based access. Invite teammates by email, assign roles, and manage everything from one place.",
    points: ["Shared mailboxes", "Owner / admin / member roles", "Email invites", "Team management dashboard"],
    color: "#059669",
    bg: "rgba(5,150,105,0.10)",
    visual: <TeamsVisual />,
  },
  {
    tag: "Security",
    title: "Built-in 2FA\nand encryption.",
    desc: "Every account password is AES-256 encrypted at rest. Enable two-factor authentication for an extra layer of protection against unauthorized access.",
    points: ["AES-256 encrypted credentials", "TOTP two-factor auth", "Backup recovery codes", "Session management"],
    color: "#DC2626",
    bg: "rgba(220,38,38,0.10)",
    visual: <SecurityVisual />,
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
