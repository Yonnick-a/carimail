import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-5 text-center"
      style={{ background: "var(--cm-bg)" }}
    >
      {/* Background orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -left-20 -top-20 h-80 w-80 rounded-full blur-[80px]"
          style={{ background: "rgba(249,115,22,0.08)" }}
        />
        <div
          className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full blur-[80px]"
          style={{ background: "rgba(0,68,188,0.07)" }}
        />
        <div className="dot-grid absolute inset-0 opacity-30" />
      </div>

      <div className="relative animate-fade-up">
        {/* Logo */}
        <Link href="/" className="mb-8 inline-flex items-center gap-2.5">
          <div
            className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border transition hover:scale-105"
            style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)", boxShadow: "var(--cm-shadow)" }}
          >
            <Image src="/logo.webp" alt="Carimail" width={26} height={26} className="object-contain" />
          </div>
          <span className="text-[15px] font-[800] tracking-tight" style={{ color: "var(--cm-text)" }}>Carimail</span>
        </Link>

        {/* 404 visual */}
        <div
          className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl border text-[40px]"
          style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)", boxShadow: "var(--cm-shadow-lg)" }}
        >
          📭
        </div>

        <div
          className="mb-2 text-[11px] font-[800] uppercase tracking-[0.24em]"
          style={{ color: "var(--cm-blue)" }}
        >
          404 — Not found
        </div>

        <h1
          className="text-[28px] font-[900] tracking-tight sm:text-[34px]"
          style={{ color: "var(--cm-text)" }}
        >
          This page doesn&apos;t exist
        </h1>
        <p
          className="mx-auto mt-3 max-w-sm text-[14px] leading-relaxed"
          style={{ color: "var(--cm-text2)" }}
        >
          The page you&apos;re looking for may have been moved, deleted, or never existed.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/inbox"
            className="rounded-2xl px-6 py-3 text-[13.5px] font-[800] text-white transition hover:-translate-y-0.5"
            style={{
              background: "linear-gradient(135deg, var(--cm-accent), var(--cm-accent2))",
              boxShadow: "0 6px 20px var(--cm-accent-b)",
            }}
          >
            Go to inbox
          </Link>
          <Link
            href="/"
            className="rounded-2xl border px-6 py-3 text-[13.5px] font-[700] transition hover:-translate-y-0.5"
            style={{
              borderColor: "var(--cm-border2)",
              background: "var(--cm-surface)",
              color: "var(--cm-text2)",
              boxShadow: "var(--cm-shadow)",
            }}
          >
            Back home
          </Link>
        </div>
      </div>
    </div>
  );
}
