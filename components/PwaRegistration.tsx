"use client";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

export function PwaRegistration() {
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .catch(() => {});

    // Capture the browser install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      const dismissed = sessionStorage.getItem("cm-install-dismissed");
      if (!dismissed) setShowBanner(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function install() {
    if (!installPrompt) return;
    const event = installPrompt as any;
    await event.prompt?.();
    setShowBanner(false);
    setInstallPrompt(null);
  }

  function dismiss() {
    setShowBanner(false);
    sessionStorage.setItem("cm-install-dismissed", "1");
  }

  if (!showBanner) return null;

  return (
    <div
      className="fixed bottom-4 left-1/2 z-[100] w-[min(360px,calc(100vw-2rem))] -translate-x-1/2 animate-slide-up overflow-hidden rounded-2xl border shadow-xl"
      style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)" }}
    >
      <div className="flex items-center gap-3 px-4 py-3.5">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          style={{ background: "var(--cm-accent-dim)", color: "var(--cm-accent)" }}
        >
          <span className="text-lg">📬</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-[700]" style={{ color: "var(--cm-text)" }}>
            Add Carimail to home screen
          </p>
          <p className="text-[11.5px]" style={{ color: "var(--cm-text3)" }}>
            Works offline · No app store needed
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={install}
            className="rounded-xl px-3 py-1.5 text-[12px] font-[800] text-white transition"
            style={{ background: "var(--cm-accent)" }}
          >
            Install
          </button>
          <button
            type="button"
            onClick={dismiss}
            className="flex h-7 w-7 items-center justify-center rounded-lg transition"
            style={{ color: "var(--cm-text3)" }}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
