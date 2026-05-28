"use client";
import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    q: "Is Carimail really free?",
    a: "Yes — the core app is free for everyone. Connect up to 2 email accounts, read and send mail, use threaded conversations, snooze, reminders, and dark mode at no cost. There's no trial period.",
  },
  {
    q: "Which email providers does it work with?",
    a: "Any provider that supports IMAP/SMTP — which is almost all of them. Gmail, Outlook, Yahoo Mail, Apple iCloud, Fastmail, Proton Mail (via Bridge), Hostcari, and any custom domain mailbox on cPanel, Plesk, or DirectAdmin.",
  },
  {
    q: "How are my email passwords stored?",
    a: "Your IMAP/SMTP credentials are encrypted with AES-256 before they touch the database. They are never logged, never returned in API responses, and are only decrypted in memory when needed to open a connection. Your plain-text password is not stored anywhere.",
  },
  {
    q: "Can I use Carimail on my phone?",
    a: "Yes. Carimail is a fully responsive web app that works in any mobile browser. A dedicated iOS and Android app is on the roadmap. For now, adding it to your home screen in Safari or Chrome gives you an app-like experience.",
  },
  {
    q: "What is a Hostcari client badge?",
    a: "If you sign up with an email address hosted by Hostcari (@hostcari.com or any domain on Hostcari's servers), your account is automatically verified as a Hostcari client and you receive the HC badge. This unlocks priority support and early access to upcoming Pro features.",
  },
  {
    q: "Will you add team / shared inbox features?",
    a: "Yes, shared inboxes and team collaboration are on the roadmap. If you have a use case or need it soon, reach out — priority customers influence what gets built next.",
  },
];

export function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {faqs.map((item, i) => {
        const isOpen = open === i;
        return (
          <div
            key={i}
            className="overflow-hidden rounded-2xl border transition"
            style={{
              borderColor: isOpen ? "var(--cm-accent-b)" : "var(--cm-border)",
              background: "var(--cm-surface)",
            }}
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition"
              style={{
                background: isOpen ? "var(--cm-accent-dim)" : "transparent",
              }}
            >
              <span
                className="text-[14.5px] font-[700] leading-snug"
                style={{ color: "var(--cm-text)" }}
              >
                {item.q}
              </span>
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition"
                style={{
                  background: isOpen ? "var(--cm-accent)" : "var(--cm-surface2)",
                  color: isOpen ? "#fff" : "var(--cm-text3)",
                  border: `1px solid ${isOpen ? "transparent" : "var(--cm-border)"}`,
                }}
              >
                {isOpen ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
              </span>
            </button>
            <div
              className="overflow-hidden transition-all duration-300"
              style={{ maxHeight: isOpen ? "320px" : "0" }}
            >
              <p
                className="px-6 pb-5 text-[13.5px] leading-relaxed"
                style={{ color: "var(--cm-text2)" }}
              >
                {item.a}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
