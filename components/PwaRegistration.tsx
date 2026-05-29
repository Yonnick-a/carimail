"use client";
import { useEffect, useState } from "react";
import { Share, X } from "lucide-react";

type BannerKind = "android" | "ios" | null;

export function PwaRegistration() {
  const [kind, setKind] = useState<BannerKind>(null);
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as { standalone?: boolean }).standalone === true;

    if (isStandalone) return; // already installed

    const ua = navigator.userAgent.toLowerCase();
    const isIos = /iphone|ipad|ipod/.test(ua) && !/crios/.test(ua); // iOS Safari only
    const isMobile = window.innerWidth < 768;

    if (isIos && isMobile) {
      setKind("ios");
      return;
    }

    // Android / Chrome desktop
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      setKind("android");
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function install() {
    if (!installPrompt) return;
    await (installPrompt as { prompt?: () => Promise<void> }).prompt?.();
    setKind(null);
    setInstallPrompt(null);
  }

  if (!kind) return null;

  return (
    <div
      className="fixed bottom-4 left-2 right-2 z-[100] animate-slide-up overflow-hidden rounded-2xl border shadow-2xl sm:left-1/2 sm:right-auto sm:w-[380px] sm:-translate-x-1/2"
      style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)" }}
    >
      {kind === "ios" ? (
        <div className="px-4 py-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg"
                style={{ background: "var(--cm-accent-dim)" }}>📬</div>
              <div>
                <p className="text-[13px] font-[800]" style={{ color: "var(--cm-text)" }}>Add to Home Screen</p>
                <p className="text-[11.5px]" style={{ color: "var(--cm-text3)" }}>Works offline · No app store</p>
              </div>
            </div>
            <button type="button" onClick={() => setKind(null)}
              className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ color: "var(--cm-text3)" }}>
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="rounded-xl border px-3 py-2.5 text-[12px] leading-relaxed"
            style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface2)", color: "var(--cm-text2)" }}>
            Tap{" "}
            <span className="inline-flex items-center gap-1 font-[700]" style={{ color: "var(--cm-accent)" }}>
              <Share className="h-3.5 w-3.5" /> Share
            </span>
            {" "}then{" "}
            <span className="font-[700]" style={{ color: "var(--cm-accent)" }}>Add to Home Screen</span>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 px-4 py-3.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg"
            style={{ background: "var(--cm-accent-dim)" }}>📬</div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-[700]" style={{ color: "var(--cm-text)" }}>Add Carimail to home screen</p>
            <p className="text-[11.5px]" style={{ color: "var(--cm-text3)" }}>Works offline · No app store needed</p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <button type="button" onClick={install}
              className="rounded-xl px-3 py-1.5 text-[12px] font-[800] text-white transition"
              style={{ background: "var(--cm-accent)" }}>
              Install
            </button>
            <button type="button" onClick={() => setKind(null)}
              className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ color: "var(--cm-text3)" }}>
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
