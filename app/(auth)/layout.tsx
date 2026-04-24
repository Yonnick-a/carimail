"use client";
// app/(auth)/layout.tsx
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";

function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const t = (document.documentElement.getAttribute("data-theme") as "light" | "dark") || "light";
    setTheme(t);
  }, []);

  function toggle() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("carimail-theme", next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle theme"
      className="relative flex h-7 w-[52px] shrink-0 items-center rounded-full border transition-all duration-200"
      style={{ background: "var(--cm-surface2)", borderColor: "var(--cm-border2)" }}
    >
      <span className="absolute left-[7px] text-[10px] leading-none transition-opacity duration-200"
        style={{ opacity: theme === "dark" ? 1 : 0.5 }}>🌙</span>
      <span className="absolute right-[7px] text-[10px] leading-none transition-opacity duration-200"
        style={{ opacity: theme === "light" ? 1 : 0.65 }}>☀️</span>
      <span
        className="absolute top-[3px] h-[18px] w-[18px] rounded-full transition-all duration-300"
        style={{
          left: theme === "dark" ? "3px" : "calc(100% - 21px)",
          background: theme === "dark" ? "var(--cm-accent)" : "#0F172A",
          boxShadow: theme === "dark" ? "0 0 8px rgba(249,115,22,0.5)" : "0 1px 4px rgba(0,0,0,0.25)",
        }}
      />
    </button>
  );
}

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-12"
      style={{ background: "var(--cm-bg)" }}
    >
      {/* Animated orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full blur-[90px]"
          style={{ background: "rgba(249,115,22,0.09)", animation: "orbFloat1 14s ease-in-out infinite" }} />
        <div className="absolute -bottom-24 -right-24 h-[450px] w-[450px] rounded-full blur-[90px]"
          style={{ background: "rgba(0,68,188,0.09)", animation: "orbFloat2 17s ease-in-out infinite" }} />
        <div className="absolute left-1/2 top-1/3 h-[220px] w-[220px] -translate-x-1/2 rounded-full blur-[70px]"
          style={{ background: "rgba(249,115,22,0.06)", animation: "orbFloat3 10s ease-in-out infinite" }} />
        {/* Dot grid */}
        <div className="dot-grid absolute inset-0 opacity-[0.35]" />
        {/* Floating envelopes */}
        {[
          { top: "6%",  left: "3%",   size: 160, delay: "0s",   dur: "9s",  op: 0.05 },
          { top: "55%", left: "1%",   size: 80,  delay: "2s",   dur: "11s", op: 0.06 },
          { top: "78%", left: "20%",  size: 45,  delay: "4s",   dur: "8s",  op: 0.08 },
          { top: "8%",  right: "2%",  size: 110, delay: "1s",   dur: "13s", op: 0.05 },
          { top: "45%", right: "4%",  size: 65,  delay: "3.5s", dur: "10s", op: 0.07 },
          { top: "72%", right: "15%", size: 35,  delay: "1.8s", dur: "7.5s",op: 0.09 },
        ].map((item, i) => (
          <div key={i} className="absolute select-none" style={{
            top: item.top,
            left: (item as any).left,
            right: (item as any).right,
            opacity: item.op,
            animation: `floatUp ${item.dur} ease-in-out ${item.delay} infinite`,
          }}>
            <svg width={item.size} height={item.size} viewBox="0 0 24 24" fill="none" stroke="var(--cm-blue)" strokeWidth="1.4">
              <rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/>
            </svg>
          </div>
        ))}
        {/* Floating @ symbols */}
        {[
          { top: "15%", right: "8%",  size: 150, delay: "0.5s", dur: "11s", op: 0.05, color: "var(--cm-accent)" },
          { top: "60%", left: "8%",   size: 75,  delay: "2.5s", dur: "9s",  op: 0.06, color: "var(--cm-accent)" },
          { top: "35%", right: "22%", size: 42,  delay: "4.5s", dur: "8s",  op: 0.07, color: "var(--cm-blue)" },
          { top: "84%", right: "6%",  size: 100, delay: "1.2s", dur: "13s", op: 0.04, color: "var(--cm-blue)" },
        ].map((item, i) => (
          <div key={`at-${i}`} className="absolute select-none font-mono font-bold"
            style={{
              top: item.top,
              left: (item as any).left,
              right: (item as any).right,
              fontSize: item.size,
              lineHeight: 1,
              color: item.color,
              opacity: item.op,
              animation: `floatUp ${item.dur} ease-in-out ${item.delay} infinite`,
            }}>@</div>
        ))}
      </div>

      {/* Top bar: logo + theme toggle */}
      <div className="relative z-10 mb-8 flex w-full max-w-[420px] items-center justify-between">
        <Link href="/" className="group flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border transition duration-200 group-hover:scale-105"
            style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)", boxShadow: "var(--cm-shadow)" }}
          >
            <Image src="/logo.webp" alt="Carimail" width={28} height={28} className="object-contain" priority />
          </div>
          <div>
            <div className="text-[15px] font-[800] tracking-tight" style={{ color: "var(--cm-text)" }}>Carimail</div>
            <div className="text-[10px]" style={{ color: "var(--cm-text3)" }}>by Hostcari</div>
          </div>
        </Link>
        <ThemeToggle />
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-[420px]">
        <div
          className="overflow-hidden rounded-[28px] border backdrop-blur-xl"
          style={{
            background: "var(--cm-surface)",
            borderColor: "var(--cm-border)",
            boxShadow: "var(--cm-shadow-xl)",
          }}
        >
          {/* Accent stripe */}
          <div className="h-1 bg-gradient-to-r from-[#F97316] via-[#FB923C] to-[#0044BC]" />
          <div className="p-7 sm:p-8">{children}</div>
        </div>
      </div>

      <p className="relative z-10 mt-7 text-[11px]" style={{ color: "var(--cm-text3)" }}>
        &copy; {new Date().getFullYear()} Hostcari — Carimail
      </p>

      <style>{`
        @keyframes orbFloat1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(40px,30px) scale(1.05)} 66%{transform:translate(-20px,50px) scale(0.97)} }
        @keyframes orbFloat2 { 0%,100%{transform:translate(0,0) scale(1)} 40%{transform:translate(-50px,-35px) scale(1.06)} 70%{transform:translate(30px,-20px) scale(0.95)} }
        @keyframes orbFloat3 { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(-28px)} }
        @keyframes floatUp { 0%,100%{transform:translateY(0px) rotate(0deg)} 25%{transform:translateY(-12px) rotate(3deg)} 75%{transform:translateY(-6px) rotate(-2deg)} }
      `}</style>
    </div>
  );
}