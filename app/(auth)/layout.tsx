// app/(auth)/layout.tsx
"use client";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#F0F5FF] px-4 py-12">

      {/* ── Animated gradient orbs ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Large slow orange orb */}
        <div className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-[#FF914D]/20 blur-[80px]"
          style={{ animation: "orbFloat1 12s ease-in-out infinite" }} />
        {/* Large slow blue orb */}
        <div className="absolute -bottom-24 -right-24 h-[450px] w-[450px] rounded-full bg-[#0044BC]/15 blur-[80px]"
          style={{ animation: "orbFloat2 15s ease-in-out infinite" }} />
        {/* Small accent orb */}
        <div className="absolute left-1/2 top-1/3 h-[200px] w-[200px] -translate-x-1/2 rounded-full bg-[#FFB37D]/20 blur-[60px]"
          style={{ animation: "orbFloat3 9s ease-in-out infinite" }} />

        {/* Subtle dot grid */}
        <div className="absolute inset-0 opacity-[0.35]"
          style={{ backgroundImage: "radial-gradient(circle, rgba(15,23,42,0.10) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

        {/* Floating envelope icons */}
        {[
          { top: "5%",  left: "3%",   size: 170, delay: "0s",   dur: "9s",  opacity: 0.055 },
          { top: "55%", left: "1%",   size: 90,  delay: "2s",   dur: "11s", opacity: 0.07  },
          { top: "78%", left: "20%",  size: 50,  delay: "4s",   dur: "8s",  opacity: 0.09  },
          { top: "8%",  right: "2%",  size: 120, delay: "1s",   dur: "13s", opacity: 0.05  },
          { top: "42%", right: "3%",  size: 70,  delay: "3.5s", dur: "10s", opacity: 0.08  },
          { top: "72%", right: "15%", size: 38,  delay: "1.8s", dur: "7.5s",opacity: 0.10  },
        ].map((item, i) => (
          <div key={i}
            className="absolute select-none"
            style={{
              top: item.top,
              left: (item as any).left,
              right: (item as any).right,
              opacity: item.opacity,
              animation: `floatUp ${item.dur} ease-in-out ${item.delay} infinite`,
            }}>
            <svg width={item.size} height={item.size} viewBox="0 0 24 24" fill="none" stroke="#0044BC" strokeWidth="1.5">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M2 7l10 7 10-7" />
            </svg>
          </div>
        ))}

        {/* Floating @ symbols */}
        {[
          { top: "15%", right: "8%",  size: 160, delay: "0.5s", dur: "11s", opacity: 0.055, color: "#FF914D" },
          { top: "60%", left: "8%",   size: 80,  delay: "2.5s", dur: "9s",  opacity: 0.07,  color: "#FF914D" },
          { top: "35%", right: "22%", size: 45,  delay: "4.5s", dur: "8s",  opacity: 0.09,  color: "#0044BC" },
          { top: "82%", right: "6%",  size: 110, delay: "1.2s", dur: "13s", opacity: 0.05,  color: "#0044BC" },
          { top: "88%", left: "40%",  size: 30,  delay: "3s",   dur: "7s",  opacity: 0.11,  color: "#FF914D" },
        ].map((item, i) => (
          <div key={`at-${i}`}
            className="absolute select-none font-mono font-bold"
            style={{
              top: item.top,
              left: (item as any).left,
              right: (item as any).right,
              fontSize: item.size,
              lineHeight: 1,
              color: item.color,
              opacity: item.opacity,
              animation: `floatUp ${item.dur} ease-in-out ${item.delay} infinite`,
            }}>
            @
          </div>
        ))}
      </div>

      {/* ── Logo ── */}
      <Link href="/" className="group relative z-10 mb-8 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-white/80 bg-white shadow-[0_4px_20px_rgba(15,23,42,0.12)] transition group-hover:shadow-[0_8px_32px_rgba(0,68,188,0.18)] group-hover:scale-[1.04] duration-200">
          <Image src="/logo.webp" alt="Carimail" width={30} height={30} className="object-contain" priority />
        </div>
        <div>
          <div className="text-xl font-bold tracking-tight text-[#0F172A]">Carimail</div>
          <div className="text-xs text-[#64748B]">by Hostcari</div>
        </div>
      </Link>

      {/* ── Card ── */}
      <div className="relative z-10 w-full max-w-[420px]">
        <div className="overflow-hidden rounded-[28px] border border-white/70 bg-white/92 shadow-[0_24px_70px_rgba(15,23,42,0.13)] backdrop-blur-xl">
          <div className="h-1.5 bg-gradient-to-r from-[#FF914D] via-[#FFB37D] to-[#0044BC]" />
          <div className="p-8">{children}</div>
        </div>
      </div>

      {/* ── Footer ── */}
      <p className="relative z-10 mt-8 text-xs text-[#94A3B8]">
        &copy; {new Date().getFullYear()} Hostcari &mdash; Carimail
      </p>

      {/* ── Keyframes ── */}
      <style>{`
        @keyframes orbFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(40px, 30px) scale(1.05); }
          66%       { transform: translate(-20px, 50px) scale(0.97); }
        }
        @keyframes orbFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          40%       { transform: translate(-50px, -35px) scale(1.06); }
          70%       { transform: translate(30px, -20px) scale(0.95); }
        }
        @keyframes orbFloat3 {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50%       { transform: translateX(-50%) translateY(-30px); }
        }
        @keyframes floatUp {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25%       { transform: translateY(-12px) rotate(3deg); }
          75%       { transform: translateY(-6px) rotate(-2deg); }
        }
      `}</style>
    </div>
  );
}