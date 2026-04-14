"use client";
// components/mail/MailShell.tsx
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Archive, ChevronDown, Flag, Inbox, LogOut, Mail,
  Menu, Pencil, Plus, Search, Send, Settings, Star,
  Trash2, User, X, Loader2, RefreshCw,
} from "lucide-react";

type Account = {
  id: string;
  emailAddress: string;
  label: string | null;
  isPrimary: boolean;
  imapHost: string;
  smtpHost: string;
};

type SessionUser = { id: string; email: string; name: string | null };

type Folder = {
  path: string;
  name: string;
  specialUse?: string;
};

function getFolderIcon(path: string, specialUse?: string) {
  const p = path.toLowerCase();
  const u = (specialUse || "").toLowerCase();
  if (u.includes("sent") || p.includes("sent")) return <Send className="h-4 w-4" />;
  if (u.includes("trash") || p.includes("trash")) return <Trash2 className="h-4 w-4" />;
  if (u.includes("draft") || p.includes("draft")) return <Pencil className="h-4 w-4" />;
  if (u.includes("junk") || u.includes("spam") || p.includes("spam") || p.includes("junk")) return <Flag className="h-4 w-4" />;
  if (u.includes("archive") || p.includes("archive")) return <Archive className="h-4 w-4" />;
  if (u.includes("starred") || u.includes("flagged")) return <Star className="h-4 w-4" />;
  return <Mail className="h-4 w-4" />;
}

function initials(name: string | null, email: string) {
  const src = name || email;
  const parts = src.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return src.slice(0, 2).toUpperCase();
}

export default function MailShell({
  user, accounts, children,
}: {
  user: SessionUser;
  accounts: Account[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentAccountId = searchParams.get("accountId") || accounts[0]?.id || "";
  const currentFolder = searchParams.get("folder") || "INBOX";

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [composing, setComposing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const accountMenuRef = useRef<HTMLDivElement>(null);

  const currentAccount = accounts.find((a) => a.id === currentAccountId) || accounts[0];

  // Load folders when account changes
  useEffect(() => {
    if (!currentAccountId) return;
    setLoadingFolders(true);
    fetch(`/api/mail/messages?accountId=${currentAccountId}&action=folders`)
      .then((r) => r.json())
      .then((d) => { if (d.ok) setFolders(d.folders || []); })
      .catch(() => {})
      .finally(() => setLoadingFolders(false));
  }, [currentAccountId]);

  // Close account menu on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function navigateTo(folder: string) {
    const params = new URLSearchParams();
    if (currentAccountId) params.set("accountId", currentAccountId);
    params.set("folder", folder);
    router.push(`/inbox?${params}`);
    setMobileSidebarOpen(false);
  }

  function switchAccount(id: string) {
    const params = new URLSearchParams();
    params.set("accountId", id);
    params.set("folder", "INBOX");
    router.push(`/inbox?${params}`);
    setAccountMenuOpen(false);
    setMobileSidebarOpen(false);
  }

  async function handleSignOut() {
    await fetch("/api/auth/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "signout" }),
    });
    router.push("/sign-in");
    router.refresh();
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const params = new URLSearchParams();
    if (currentAccountId) params.set("accountId", currentAccountId);
    params.set("folder", currentFolder);
    params.set("q", searchQuery.trim());
    router.push(`/inbox?${params}`);
  }

  // Smart folder list: INBOX first, then common folders, then the rest
  const priorityOrder = ["INBOX", "Drafts", "Sent", "Spam", "Trash", "Archive"];
  const sortedFolders = [...folders].sort((a, b) => {
    const ai = priorityOrder.findIndex((p) => a.path.toLowerCase().includes(p.toLowerCase()));
    const bi = priorityOrder.findIndex((p) => b.path.toLowerCase().includes(p.toLowerCase()));
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a.name.localeCompare(b.name);
  });

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo + collapse */}
      <div className="flex items-center justify-between px-4 py-4">
        <Link href="/inbox" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border border-[#0F172A]/10 bg-white shadow-sm">
            <Image src="/logo.png" alt="Carimail" width={24} height={24} className="object-contain" />
          </div>
          {sidebarOpen && (
            <div>
              <div className="text-[15px] font-bold tracking-tight text-[#0F172A]">Carimail</div>
              <div className="text-[10px] text-[#94A3B8]">by Hostcari</div>
            </div>
          )}
        </Link>
        <button
          type="button"
          onClick={() => setSidebarOpen((v) => !v)}
          className="hidden lg:flex h-8 w-8 items-center justify-center rounded-lg text-[#64748B] hover:bg-[#EEF4FF] hover:text-[#0044BC]"
        >
          <Menu className="h-4 w-4" />
        </button>
      </div>

      {/* Compose */}
      <div className={`px-3 pb-3 ${!sidebarOpen ? "flex justify-center" : ""}`}>
        <button
          type="button"
          onClick={() => { setComposing(true); setMobileSidebarOpen(false); }}
          title={!sidebarOpen ? "Compose" : undefined}
          className={`flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#FF914D] to-[#FF7A2F] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(255,145,77,0.28)] transition hover:shadow-[0_8px_24px_rgba(255,145,77,0.36)] ${sidebarOpen ? "w-full" : "h-10 w-10 justify-center px-0"}`}
        >
          <Pencil className="h-4 w-4 shrink-0" />
          {sidebarOpen && "Compose"}
        </button>
      </div>

      {/* Account switcher */}
      {accounts.length > 0 && sidebarOpen && (
        <div className="mx-3 mb-2" ref={accountMenuRef}>
          <button
            type="button"
            onClick={() => setAccountMenuOpen((v) => !v)}
            className="flex w-full items-center gap-2 rounded-xl border border-[#0F172A]/8 bg-white/80 px-3 py-2.5 transition hover:bg-white"
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FF914D] to-[#0044BC] text-[11px] font-bold text-white">
              {initials(user.name, currentAccount?.emailAddress || user.email).slice(0, 2)}
            </div>
            <div className="min-w-0 flex-1 text-left">
              <div className="truncate text-xs font-semibold text-[#0F172A]">
                {currentAccount?.emailAddress || user.email}
              </div>
              {currentAccount?.label && (
                <div className="truncate text-[10px] text-[#94A3B8]">{currentAccount.label}</div>
              )}
            </div>
            <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-[#94A3B8] transition ${accountMenuOpen ? "rotate-180" : ""}`} />
          </button>

          {accountMenuOpen && (
            <div className="absolute z-50 mt-1.5 w-64 overflow-hidden rounded-2xl border border-[#0F172A]/8 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.14)] animate-fade-in">
              <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#94A3B8]">Accounts</div>
              {accounts.map((acc) => (
                <button key={acc.id} type="button" onClick={() => switchAccount(acc.id)}
                  className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition hover:bg-[#F8FAFC] ${acc.id === currentAccountId ? "bg-[#EEF4FF]" : ""}`}>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FF914D] to-[#0044BC] text-[10px] font-bold text-white">
                    {initials(null, acc.emailAddress)}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-xs font-semibold text-[#0F172A]">{acc.emailAddress}</div>
                    {acc.label && <div className="text-[10px] text-[#94A3B8]">{acc.label}</div>}
                  </div>
                  {acc.isPrimary && <span className="ml-auto shrink-0 rounded-full bg-[#EEF4FF] px-2 py-0.5 text-[9px] font-bold text-[#0044BC]">Primary</span>}
                </button>
              ))}
              <div className="border-t border-[#0F172A]/6 p-2">
                <Link href="/settings/accounts"
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-[#64748B] hover:bg-[#F8FAFC]"
                  onClick={() => setAccountMenuOpen(false)}>
                  <Plus className="h-3.5 w-3.5" />Add account
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* No accounts state */}
      {accounts.length === 0 && sidebarOpen && (
        <div className="mx-3 mb-3 rounded-xl border border-dashed border-[#0044BC]/20 bg-[#EEF4FF] px-3 py-3 text-center">
          <p className="text-xs text-[#64748B]">No email accounts yet.</p>
          <Link href="/settings/accounts" className="mt-1 block text-xs font-semibold text-[#0044BC] hover:underline">
            Connect one →
          </Link>
        </div>
      )}

      {/* Folders */}
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {loadingFolders ? (
          <div className={`flex items-center gap-2 px-3 py-3 text-xs text-[#94A3B8] ${!sidebarOpen ? "justify-center" : ""}`}>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            {sidebarOpen && "Loading…"}
          </div>
        ) : (
          <nav className="space-y-0.5">
            {sortedFolders.map((folder) => {
              const active = currentFolder === folder.path;
              return (
                <button
                  key={folder.path}
                  type="button"
                  onClick={() => navigateTo(folder.path)}
                  title={!sidebarOpen ? folder.name : undefined}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition ${active ? "bg-[#DCEAFB] font-semibold text-[#0F172A]" : "text-[#64748B] hover:bg-[#EEF4FF] hover:text-[#0044BC]"} ${!sidebarOpen ? "justify-center" : ""}`}
                >
                  <span className={`shrink-0 ${active ? "text-[#0044BC]" : ""}`}>
                    {getFolderIcon(folder.path, folder.specialUse)}
                  </span>
                  {sidebarOpen && <span className="truncate">{folder.name}</span>}
                </button>
              );
            })}
          </nav>
        )}
      </div>

      {/* Bottom nav */}
      <div className="border-t border-slate-200/70 px-2 py-3 space-y-0.5">
        <Link href="/settings"
          className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-[#64748B] transition hover:bg-[#EEF4FF] hover:text-[#0044BC] ${!sidebarOpen ? "justify-center" : ""}`}
          title={!sidebarOpen ? "Settings" : undefined}>
          <Settings className="h-4 w-4 shrink-0" />
          {sidebarOpen && "Settings"}
        </Link>

        {sidebarOpen && (
          <div className="flex items-center gap-2 rounded-xl px-3 py-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FF914D] to-[#0044BC] text-[11px] font-bold text-white">
              {initials(user.name, user.email)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-semibold text-[#0F172A]">{user.name || user.email}</div>
              <div className="truncate text-[10px] text-[#94A3B8]">{user.email}</div>
            </div>
            <button type="button" onClick={handleSignOut}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[#94A3B8] hover:bg-red-50 hover:text-red-500">
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {!sidebarOpen && (
          <button type="button" onClick={handleSignOut}
            className="flex w-full justify-center rounded-xl px-3 py-2.5 text-[#94A3B8] hover:bg-red-50 hover:text-red-500"
            title="Sign out">
            <LogOut className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#F4F7FB]">
      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex flex-col border-r border-slate-200/80 bg-[#F8FAFC] transition-[width] duration-300 ease-out shrink-0 ${sidebarOpen ? "w-64" : "w-[72px]"}`}>
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 border-r border-slate-200/80 bg-[#F8FAFC] animate-slide-up">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-slate-200/80 bg-white/80 px-4 backdrop-blur-xl">
          <button type="button" onClick={() => setMobileSidebarOpen(true)} className="flex lg:hidden h-8 w-8 items-center justify-center rounded-lg text-[#64748B] hover:bg-[#EEF4FF]">
            <Menu className="h-5 w-5" />
          </button>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex flex-1 items-center">
            <div className="relative w-full max-w-xl">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search mail…"
                className="w-full rounded-2xl border border-[#0F172A]/8 bg-[#F8FAFC] py-2 pl-9 pr-4 text-sm text-[#0F172A] outline-none transition focus:border-[#FF914D] focus:bg-white focus:ring-4 focus:ring-[#FF914D]/15"
              />
            </div>
          </form>

          <div className="flex items-center gap-2">
            <button type="button" onClick={() => router.refresh()}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#64748B] hover:bg-[#EEF4FF]">
              <RefreshCw className="h-4 w-4" />
            </button>
            <Link href="/settings"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#64748B] hover:bg-[#EEF4FF]">
              <Settings className="h-4 w-4" />
            </Link>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#FF914D] to-[#0044BC] text-[11px] font-bold text-white">
              {initials(user.name, user.email)}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex min-h-0 flex-1 overflow-hidden">
          {children}
        </main>
      </div>

      {/* Compose modal */}
      {composing && (
        <ComposeModal
          accountId={currentAccountId}
          fromAddress={currentAccount?.emailAddress || ""}
          onClose={() => setComposing(false)}
        />
      )}
    </div>
  );
}

// ── Compose modal ─────────────────────────────────────────────────────

function ComposeModal({
  accountId, fromAddress, onClose,
  replyTo,
}: {
  accountId: string;
  fromAddress: string;
  onClose: () => void;
  replyTo?: { to: string; subject: string; messageId?: string };
}) {
  const [to, setTo] = useState(replyTo?.to || "");
  const [cc, setCc] = useState("");
  const [showCc, setShowCc] = useState(false);
  const [subject, setSubject] = useState(replyTo ? `Re: ${replyTo.subject.replace(/^Re:\s*/i, "")}` : "");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [minimized, setMinimized] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/mail/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId, to, cc: cc || undefined, subject, body, inReplyTo: replyTo?.messageId }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Send failed.");
      setSent(true);
      setTimeout(onClose, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Send failed.");
      setSending(false);
    }
  }

  if (minimized) {
    return (
      <div className="fixed bottom-0 right-6 z-50 w-72 overflow-hidden rounded-t-2xl border border-[#0F172A]/10 bg-[#0F172A] shadow-2xl">
        <button type="button" onClick={() => setMinimized(false)}
          className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-white">
          <span className="truncate">{subject || "New message"}</span>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 right-6 z-50 w-[560px] max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-t-2xl border border-[#0F172A]/10 bg-white shadow-[0_-8px_40px_rgba(15,23,42,0.15)]">
      {/* Header */}
      <div className="flex items-center justify-between bg-[#0F172A] px-4 py-3">
        <span className="truncate text-sm font-semibold text-white">{subject || "New message"}</span>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setMinimized(true)} className="flex h-7 w-7 items-center justify-center rounded-lg text-white/50 hover:text-white">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          <button type="button" onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg text-white/50 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {sent ? (
        <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
            <Send className="h-5 w-5" />
          </div>
          <p className="text-sm font-semibold text-[#0F172A]">Message sent!</p>
        </div>
      ) : (
        <form onSubmit={handleSend} className="flex flex-col">
          {error && (
            <div className="flex items-center gap-2 border-b border-red-100 bg-red-50 px-4 py-2 text-xs text-red-700">
              <X className="h-3.5 w-3.5" />{error}
            </div>
          )}

          {[
            { label: "From", value: fromAddress, readOnly: true, onChange: () => {} },
          ].map((row) => (
            <div key={row.label} className="flex items-center border-b border-[#0F172A]/6 px-4 py-2">
              <span className="w-14 shrink-0 text-xs font-medium text-[#94A3B8]">{row.label}</span>
              <span className="text-sm text-[#64748B]">{row.value}</span>
            </div>
          ))}

          <div className="flex items-center border-b border-[#0F172A]/6 px-4 py-2">
            <span className="w-14 shrink-0 text-xs font-medium text-[#94A3B8]">To</span>
            <input value={to} onChange={(e) => setTo(e.target.value)} required
              className="flex-1 bg-transparent text-sm text-[#0F172A] outline-none placeholder:text-[#94A3B8]"
              placeholder="recipient@example.com" />
            <button type="button" onClick={() => setShowCc(!showCc)} className="text-[11px] font-medium text-[#94A3B8] hover:text-[#64748B]">Cc</button>
          </div>

          {showCc && (
            <div className="flex items-center border-b border-[#0F172A]/6 px-4 py-2">
              <span className="w-14 shrink-0 text-xs font-medium text-[#94A3B8]">Cc</span>
              <input value={cc} onChange={(e) => setCc(e.target.value)}
                className="flex-1 bg-transparent text-sm text-[#0F172A] outline-none placeholder:text-[#94A3B8]"
                placeholder="cc@example.com" />
            </div>
          )}

          <div className="flex items-center border-b border-[#0F172A]/6 px-4 py-2">
            <span className="w-14 shrink-0 text-xs font-medium text-[#94A3B8]">Subject</span>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} required
              className="flex-1 bg-transparent text-sm text-[#0F172A] outline-none placeholder:text-[#94A3B8]"
              placeholder="Subject" />
          </div>

          <textarea value={body} onChange={(e) => setBody(e.target.value)} required
            className="h-40 resize-none px-4 py-3 text-sm text-[#0F172A] outline-none placeholder:text-[#94A3B8]"
            placeholder="Write your message…" />

          <div className="flex items-center justify-between border-t border-[#0F172A]/6 px-4 py-3">
            <button type="submit" disabled={sending}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF914D] to-[#FF7A2F] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(255,145,77,0.30)] transition hover:shadow-[0_8px_20px_rgba(255,145,77,0.38)] disabled:opacity-60">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {sending ? "Sending…" : "Send"}
            </button>
            <button type="button" onClick={onClose} className="text-xs text-[#94A3B8] hover:text-[#64748B]">Discard</button>
          </div>
        </form>
      )}
    </div>
  );
}
