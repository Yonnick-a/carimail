// app/(auth)/layout.tsx
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mesh-bg flex min-h-screen flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <Link href="/" className="mb-8 flex items-center gap-3 group">
        <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-white/60 bg-white shadow-[0_4px_16px_rgba(15,23,42,0.10)] transition group-hover:shadow-[0_8px_24px_rgba(15,23,42,0.14)]">
          <Image src="/logo.png" alt="Carimail" width={30} height={30} className="object-contain" priority />
        </div>
        <div>
          <div className="text-xl font-bold tracking-tight text-[#0F172A]">Carimail</div>
          <div className="text-xs text-[#64748B]">by Hostcari</div>
        </div>
      </Link>

      {/* Card */}
      <div className="w-full max-w-[420px]">
        <div className="overflow-hidden rounded-[28px] border border-white/70 bg-white/92 shadow-[0_24px_70px_rgba(15,23,42,0.11)] backdrop-blur-xl">
          <div className="h-1.5 bg-gradient-to-r from-[#FF914D] via-[#FFB37D] to-[#0044BC]" />
          <div className="p-8">{children}</div>
        </div>
      </div>

      {/* Footer */}
      <p className="mt-8 text-xs text-[#94A3B8]">
        &copy; {new Date().getFullYear()} Hostcari &mdash; Carimail
      </p>
    </div>
  );
}
