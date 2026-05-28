"use client";
export default function OfflinePage() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-5 px-5 text-center"
      style={{ background: "var(--cm-bg)" }}
    >
      <div
        className="flex h-20 w-20 items-center justify-center rounded-3xl border text-4xl"
        style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)", boxShadow: "var(--cm-shadow-lg)" }}
      >
        📡
      </div>
      <div>
        <h1 className="text-[22px] font-[900] tracking-tight" style={{ color: "var(--cm-text)" }}>
          You&apos;re offline
        </h1>
        <p className="mt-2 max-w-sm text-[14px] leading-relaxed" style={{ color: "var(--cm-text2)" }}>
          No internet connection. Check your network and try again — previously loaded
          pages and assets are still available.
        </p>
      </div>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="rounded-2xl px-6 py-3 text-[14px] font-[800] text-white transition hover:-translate-y-0.5"
        style={{ background: "var(--cm-accent)", boxShadow: "0 6px 20px var(--cm-accent-b)" }}
      >
        Try again
      </button>
    </div>
  );
}
