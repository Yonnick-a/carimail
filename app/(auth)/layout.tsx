"use client";
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
    <button type="button" onClick={toggle} aria-label="Toggle theme"
      className="relative flex h-7 w-[52px] shrink-0 items-center rounded-full border transition-all duration-200"
      style={{ background: "var(--cm-surface2)", borderColor: "var(--cm-border2)" }}>
      <span className="absolute left-[7px] text-[10px] leading-none transition-opacity" style={{ opacity: theme === "dark" ? 1 : 0.4 }}>🌙</span>
      <span className="absolute right-[7px] text-[10px] leading-none transition-opacity" style={{ opacity: theme === "light" ? 1 : 0.5 }}>☀️</span>
      <span className="absolute top-[3px] h-[18px] w-[18px] rounded-full transition-all duration-300"
        style={{
          left: theme === "dark" ? "3px" : "calc(100% - 21px)",
          background: theme === "dark" ? "var(--cm-accent)" : "#0F172A",
          boxShadow: theme === "dark" ? "0 0 8px rgba(249,115,22,0.5)" : "0 1px 4px rgba(0,0,0,0.25)",
        }} />
    </button>
  );
}

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-14"
      style={{ background: "var(--cm-bg)" }}
    >
      {/* Subtle gradient orbs — toned down, premium feel */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full blur-[120px] opacity-50"
          style={{ background: "rgba(249,115,22,0.10)", animation: "orbFloat1 18s ease-in-out infinite" }} />
        <div className="absolute -bottom-32 -right-32 h-[500px] w-[500px] rounded-full blur-[120px] opacity-40"
          style={{ background: "rgba(0,68,188,0.09)", animation: "orbFloat2 22s ease-in-out infinite" }} />
        {/* Dot grid */}
        <div className="dot-grid absolute inset-0 opacity-[0.22]" />
      </div>

      {/* Top bar */}
      <div className="relative z-10 mb-10 flex w-full max-w-[480px] items-center justify-between">
        <Link href="/" className="group flex items-center gap-2.5">
          <div
            className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border transition duration-200 group-hover:scale-105"
            style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)", boxShadow: "var(--cm-shadow)" }}
          >
            <Image src="/logo.webp" alt="Carimail" width={26} height={26} className="object-contain" priority />
          </div>
          <div>
            <div className="text-[15px] font-[800] tracking-tight" style={{ color: "var(--cm-text)" }}>Carimail</div>
            <div className="text-[9.5px] leading-none" style={{ color: "var(--cm-text3)" }}>by Hostcari</div>
          </div>
        </Link>
        <ThemeToggle />
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-[480px]">
        <div
          className="overflow-hidden rounded-[32px]"
          style={{
            background: "var(--cm-surface)",
            border: "1px solid var(--cm-border)",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.04), 0 20px 60px rgba(15,23,42,0.10), 0 0 0 1px rgba(255,255,255,0.6)",
          }}
        >
          {/* Top accent line */}
          <div className="h-[3px] bg-gradient-to-r from-[#F97316] via-[#FB923C] to-[#0044BC]" />
          <div className="px-8 py-9 sm:px-10">{children}</div>
        </div>
      </div>

      <p className="relative z-10 mt-8 text-[11.5px]" style={{ color: "var(--cm-text3)" }}>
        &copy; {new Date().getFullYear()} Hostcari — Carimail
      </p>

      <style>{`
        @keyframes orbFloat1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(40px,30px) scale(1.04)} 66%{transform:translate(-20px,50px) scale(0.97)} }
        @keyframes orbFloat2 { 0%,100%{transform:translate(0,0) scale(1)} 40%{transform:translate(-50px,-35px) scale(1.05)} 70%{transform:translate(30px,-20px) scale(0.95)} }
      `}</style>
    </div>
  );
}
