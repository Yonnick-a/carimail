"use client";
// components/mail/MailShell.tsx
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Archive, Bold, ChevronDown, Flag, Inbox,
  Italic, Link as LinkIcon, List, ListOrdered,
  Loader2, LogOut, Mail, Maximize2, Menu,
  Minimize2, Moon, Pencil, Plus, RefreshCw,
  Send, Settings, Star, Sun, Trash2, Underline, X,
} from "lucide-react";

type Account = { id: string; emailAddress: string; label: string | null; isPrimary: boolean; imapHost: string; smtpHost: string };
type SessionUser = { id: string; email: string; name: string | null; isHostcariClient?: boolean };
type Folder = { path: string; name: string; specialUse?: string; unread?: number; total?: number };

function getFolderIcon(path: string, specialUse?: string) {
  const p = path.toLowerCase(), u = (specialUse || "").toLowerCase();
  if (u.includes("sent") || p.includes("sent")) return <Send className="h-[15px] w-[15px]" />;
  if (u.includes("trash") || p.includes("trash")) return <Trash2 className="h-[15px] w-[15px]" />;
  if (u.includes("draft") || p.includes("draft")) return <Pencil className="h-[15px] w-[15px]" />;
  if (u.includes("junk") || u.includes("spam") || p.includes("spam") || p.includes("junk")) return <Flag className="h-[15px] w-[15px]" />;
  if (u.includes("archive") || p.includes("archive")) return <Archive className="h-[15px] w-[15px]" />;
  if (u.includes("starred") || u.includes("flagged")) return <Star className="h-[15px] w-[15px]" />;
  return <Inbox className="h-[15px] w-[15px]" />;
}

function initials(name: string | null, email: string) {
  const src = name || email;
  const parts = src.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return src.slice(0, 2).toUpperCase();
}

function Avatar({ name, email, size = "sm" }: { name: string | null; email: string; size?: "xs" | "sm" | "md" }) {
  const sz = { xs: "h-6 w-6 text-[9px]", sm: "h-8 w-8 text-[11px]", md: "h-9 w-9 text-[12px]" }[size];
  return (
    <div className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#F97316] to-[#0044BC] font-[700] text-white ${sz}`}>
      {initials(name, email)}
    </div>
  );
}

function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  useEffect(() => {
    const t = (document.documentElement.getAttribute("data-theme") as "light" | "dark") || "light";
    setTheme(t);
  }, []);
  const toggle = useCallback(() => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("carimail-theme", next);
  }, [theme]);
  return { theme, toggle };
}

export default function MailShell({ user, accounts, children }: { user: SessionUser; accounts: Account[]; children: React.ReactNode }) {
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
  const [searchFocused, setSearchFocused] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const { theme, toggle: toggleTheme } = useTheme();
  const currentAccount = accounts.find(a => a.id === currentAccountId) || accounts[0];

  const loadFolders = useCallback((silent = false) => {
    if (!currentAccountId) return;
    if (!silent) setLoadingFolders(true);
    fetch(`/api/mail/messages?accountId=${currentAccountId}&action=folders`, { cache: "no-store" })
      .then(r => r.json()).then(d => { if (d.ok) setFolders(d.folders || []); })
      .catch(() => {}).finally(() => { if (!silent) setLoadingFolders(false); });
  }, [currentAccountId]);

  useEffect(() => {
    loadFolders();
  }, [loadFolders]);

  useEffect(() => {
    if (!currentAccountId) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") loadFolders(true);
    }, 20000);
    const onMailboxChanged = () => loadFolders(true);
    window.addEventListener("carimail:mailbox-changed", onMailboxChanged);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("carimail:mailbox-changed", onMailboxChanged);
    };
  }, [currentAccountId, loadFolders]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) setAccountMenuOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.contentEditable === "true") return;
      if (e.key === "c" && !e.metaKey && !e.ctrlKey) setComposing(true);
      if (e.key === "/" && !e.metaKey) { e.preventDefault(); searchRef.current?.focus(); }
      if (e.key === "Escape") { setMobileSidebarOpen(false); setAccountMenuOpen(false); }
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  function navigateTo(folder: string) {
    const p = new URLSearchParams();
    if (currentAccountId) p.set("accountId", currentAccountId);
    p.set("folder", folder);
    router.push(`/inbox?${p}`);
    setMobileSidebarOpen(false);
  }

  function switchAccount(id: string) {
    const p = new URLSearchParams();
    p.set("accountId", id); p.set("folder", "INBOX");
    router.push(`/inbox?${p}`);
    setAccountMenuOpen(false); setMobileSidebarOpen(false);
  }

  async function handleSignOut() {
    await fetch("/api/auth/signin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "signout" }) });
    router.push("/sign-in"); router.refresh();
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const p = new URLSearchParams();
    if (currentAccountId) p.set("accountId", currentAccountId);
    p.set("folder", currentFolder); p.set("q", searchQuery.trim());
    router.push(`/inbox?${p}`);
  }

  const priorityOrder = ["INBOX", "Drafts", "Sent", "Spam", "Trash", "Archive"];
  const sortedFolders = [...folders].sort((a, b) => {
    const ai = priorityOrder.findIndex(p => a.path.toLowerCase().includes(p.toLowerCase()));
    const bi = priorityOrder.findIndex(p => b.path.toLowerCase().includes(p.toLowerCase()));
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1; if (bi !== -1) return 1;
    return a.name.localeCompare(b.name);
  });

  const navItemStyle = (active: boolean) => ({
    background: active ? "var(--cm-active-bg)" : "transparent",
    color: active ? "var(--cm-active-text)" : "var(--cm-text2)",
    fontWeight: active ? 600 : 400,
  } as React.CSSProperties);

  const SidebarContent = () => (
    <div className="flex h-full flex-col" style={{ background: "var(--cm-sidebar-bg)" }}>
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-[14px]">
        <Link href="/inbox" className="group flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-xl border transition duration-200 group-hover:scale-105"
            style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)", boxShadow: "0 2px 8px rgba(15,23,42,0.08)" }}>
            <Image src="/logo.webp" alt="Carimail" width={22} height={22} className="object-contain" />
          </div>
          {sidebarOpen && (
            <div>
              <div className="text-[14px] font-[800] tracking-tight" style={{ color: "var(--cm-text)" }}>Carimail</div>
              <div className="text-[9.5px] leading-none" style={{ color: "var(--cm-text3)" }}>by Hostcari</div>
            </div>
          )}
        </Link>
        <button type="button" onClick={() => setSidebarOpen(v => !v)}
          className="hidden lg:flex h-7 w-7 items-center justify-center rounded-lg transition hover:opacity-70"
          style={{ color: "var(--cm-text3)" }}>
          <Menu className="h-[15px] w-[15px]" />
        </button>
      </div>

      {/* Compose */}
      <div className={`px-3 pb-3 ${!sidebarOpen ? "flex justify-center" : ""}`}>
        <button type="button" onClick={() => { setComposing(true); setMobileSidebarOpen(false); }}
          title={!sidebarOpen ? "Compose (C)" : undefined}
          className={`flex items-center gap-2 rounded-2xl text-[13px] font-[700] text-white transition-all active:scale-[0.97] ${sidebarOpen ? "w-full justify-start px-4 py-2.5" : "h-10 w-10 justify-center"}`}
          style={{ background: "linear-gradient(135deg, var(--cm-accent), var(--cm-accent2))", boxShadow: "0 4px 14px var(--cm-accent-b)" }}>
          <Pencil className="h-[14px] w-[14px] shrink-0" />
          {sidebarOpen && "Compose"}
        </button>
      </div>

      {/* Account switcher */}
      {accounts.length > 0 && sidebarOpen && (
        <div className="mx-3 mb-3" ref={accountMenuRef}>
          <button type="button" onClick={() => setAccountMenuOpen(v => !v)}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 transition"
            style={{ background: "var(--cm-surface2)", border: `1px solid var(--cm-border)` }}>
            <Avatar name={user.name} email={currentAccount?.emailAddress || user.email} size="xs" />
            <div className="min-w-0 flex-1 text-left">
              <div className="truncate text-[11.5px] font-[600]" style={{ color: "var(--cm-text)" }}>
                {currentAccount?.emailAddress || user.email}
              </div>
              {currentAccount?.label && <div className="text-[9.5px]" style={{ color: "var(--cm-text3)" }}>{currentAccount.label}</div>}
            </div>
            {user.isHostcariClient && <span className="hostcari-badge shrink-0">HC</span>}
            <ChevronDown className={`h-3 w-3 shrink-0 transition-transform duration-200 ${accountMenuOpen ? "rotate-180" : ""}`} style={{ color: "var(--cm-text3)" }} />
          </button>
          {accountMenuOpen && (
            <div className="absolute z-50 mt-1.5 w-64 overflow-hidden rounded-2xl border shadow-xl animate-scale-in"
              style={{ background: "var(--cm-surface)", borderColor: "var(--cm-border)" }}>
              <div className="px-3 py-2 text-[9.5px] font-[700] uppercase tracking-[0.18em]" style={{ color: "var(--cm-text3)" }}>Switch account</div>
              {accounts.map(acc => (
                <button key={acc.id} type="button" onClick={() => switchAccount(acc.id)}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition"
                  style={{ background: acc.id === currentAccountId ? "var(--cm-active-bg)" : "transparent" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--cm-hover-bg)")}
                  onMouseLeave={e => (e.currentTarget.style.background = acc.id === currentAccountId ? "var(--cm-active-bg)" : "transparent")}>
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#F97316] to-[#0044BC] text-[9px] font-[700] text-white">
                    {initials(null, acc.emailAddress)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[11.5px] font-[600]" style={{ color: "var(--cm-text)" }}>{acc.emailAddress}</div>
                    {acc.label && <div className="text-[10px]" style={{ color: "var(--cm-text3)" }}>{acc.label}</div>}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {acc.isPrimary && <span className="rounded-full px-1.5 py-0.5 text-[9px] font-[700]" style={{ background: "var(--cm-blue-light)", color: "var(--cm-blue)" }}>Primary</span>}
                    {acc.id === currentAccountId && <div className="h-2 w-2 rounded-full bg-emerald-400" />}
                  </div>
                </button>
              ))}
              <div className="border-t p-2" style={{ borderColor: "var(--cm-border)" }}>
                <Link href="/settings/accounts" className="flex items-center gap-2 rounded-xl px-3 py-2 text-[11.5px] font-[600] transition" style={{ color: "var(--cm-blue)" }}
                  onClick={() => setAccountMenuOpen(false)}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "var(--cm-blue-light)")}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "transparent")}>
                  <Plus className="h-3.5 w-3.5" />Add account
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {accounts.length === 0 && sidebarOpen && (
        <div className="mx-3 mb-3 rounded-xl border border-dashed px-3 py-3 text-center" style={{ borderColor: "var(--cm-blue)", background: "var(--cm-blue-dim)" }}>
          <p className="text-[11px]" style={{ color: "var(--cm-text2)" }}>No accounts yet.</p>
          <Link href="/settings/accounts" className="mt-1 block text-[11px] font-[600] hover:underline" style={{ color: "var(--cm-blue)" }}>Connect one →</Link>
        </div>
      )}

      {/* Folders */}
      <div className="flex-1 overflow-y-auto px-2 pb-3">
        {sidebarOpen && <p className="mb-1 px-3 pt-2 text-[9.5px] font-[700] uppercase tracking-[0.18em]" style={{ color: "var(--cm-text3)" }}>Folders</p>}
        {loadingFolders ? (
          <div className={`flex items-center gap-2 px-3 py-3 text-[11px] ${!sidebarOpen ? "justify-center" : ""}`} style={{ color: "var(--cm-text3)" }}>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />{sidebarOpen && "Loading…"}
          </div>
        ) : (
          <nav className="space-y-0.5">
            {sortedFolders.map(folder => {
              const active = currentFolder === folder.path;
              const count = folder.unread && folder.unread > 0 ? folder.unread : folder.total || 0;
              const countIsUnread = !!folder.unread && folder.unread > 0;
              return (
                <button key={folder.path} type="button" onClick={() => navigateTo(folder.path)}
                  title={!sidebarOpen ? folder.name : undefined}
                  className={`group relative flex w-full items-center rounded-xl px-3 py-2 text-[12.5px] transition ${!sidebarOpen ? "justify-center" : "gap-2.5"}`}
                  style={navItemStyle(active)}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "var(--cm-hover-bg)"; e.currentTarget.style.color = "var(--cm-hover-text)"; } }}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--cm-text2)"; } }}>
                  {active && <span className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r-full" style={{ background: "var(--cm-accent)" }} />}
                  <span className="shrink-0" style={{ color: active ? "var(--cm-accent)" : "inherit" }}>{getFolderIcon(folder.path, folder.specialUse)}</span>
                  {!sidebarOpen && countIsUnread && (
                    <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full" style={{ background: "var(--cm-unread-dot)" }} />
                  )}
                  {sidebarOpen && (
                    <>
                      <span className="flex-1 truncate text-left">{folder.name}</span>
                      {count > 0 ? (
                        <span
                          className="shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-[700]"
                          style={countIsUnread
                            ? { background: "var(--cm-unread-dot)", color: "white" }
                            : { background: "var(--cm-surface3)", color: "var(--cm-text3)" }}
                        >
                          {count > 99 ? "99+" : count}
                        </span>
                      ) : null}
                    </>
                  )}
                </button>
              );
            })}
          </nav>
        )}
      </div>

      {/* Bottom: theme + settings + user */}
      <div className="border-t px-2 py-3 space-y-0.5" style={{ borderColor: "var(--cm-border)" }}>
        <button type="button" onClick={toggleTheme}
          className={`flex w-full items-center rounded-xl px-3 py-2 text-[12.5px] transition ${sidebarOpen ? "gap-2.5" : "justify-center"}`}
          style={{ color: "var(--cm-text2)" }}
          onMouseEnter={e => (e.currentTarget.style.background = "var(--cm-hover-bg)")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
          {theme === "dark" ? <Sun className="h-[15px] w-[15px] shrink-0" /> : <Moon className="h-[15px] w-[15px] shrink-0" />}
          {sidebarOpen && (theme === "dark" ? "Light mode" : "Dark mode")}
        </button>
        <Link href="/settings"
          className={`flex w-full items-center rounded-xl px-3 py-2 text-[12.5px] transition ${sidebarOpen ? "gap-2.5" : "justify-center"}`}
          style={{ color: "var(--cm-text2)" }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--cm-hover-bg)"; (e.currentTarget as HTMLElement).style.color = "var(--cm-hover-text)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--cm-text2)"; }}>
          <Settings className="h-[15px] w-[15px] shrink-0" />
          {sidebarOpen && "Settings"}
        </Link>
        {sidebarOpen ? (
          <div className="flex items-center gap-2 rounded-xl px-3 py-2">
            <Avatar name={user.name} email={user.email} size="xs" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[11.5px] font-[600]" style={{ color: "var(--cm-text)" }}>{user.name || user.email}</div>
              <div className="flex items-center gap-1.5">
                <div className="truncate text-[9.5px]" style={{ color: "var(--cm-text3)" }}>{user.email}</div>
                {user.isHostcariClient && <span className="hostcari-badge">HC</span>}
              </div>
            </div>
            <button type="button" onClick={handleSignOut} title="Sign out"
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg transition hover:bg-red-100 hover:text-red-500"
              style={{ color: "var(--cm-text3)" }}>
              <LogOut className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <button type="button" onClick={handleSignOut}
            className="flex w-full justify-center rounded-xl px-3 py-2 transition hover:bg-red-50 hover:text-red-500"
            style={{ color: "var(--cm-text3)" }} title="Sign out">
            <LogOut className="h-[15px] w-[15px]" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--cm-bg)" }}>
      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex flex-col border-r shrink-0 transition-[width] duration-250 ease-out overflow-hidden ${sidebarOpen ? "w-[232px]" : "w-[60px]"}`}
        style={{ borderColor: "var(--cm-sidebar-border)", background: "var(--cm-sidebar-bg)" }}>
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 backdrop-blur-sm" style={{ background: "rgba(0,0,0,0.45)" }} onClick={() => setMobileSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-[240px] border-r animate-slide-up"
            style={{ borderColor: "var(--cm-sidebar-border)", background: "var(--cm-sidebar-bg)" }}>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-[52px] shrink-0 items-center gap-3 border-b px-4"
          style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)" }}>
          <button type="button" onClick={() => setMobileSidebarOpen(true)}
            className="flex lg:hidden h-8 w-8 items-center justify-center rounded-lg transition"
            style={{ color: "var(--cm-text2)" }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--cm-hover-bg)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
            <Menu className="h-5 w-5" />
          </button>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex flex-1 items-center">
            <div className="relative w-full max-w-xl">
              <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--cm-text3)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={searchRef}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Search mail… ( / )"
                className="w-full rounded-xl border py-2 pl-9 pr-4 text-[13px] outline-none transition"
                style={{
                  background: searchFocused ? "var(--cm-surface)" : "var(--cm-surface2)",
                  borderColor: searchFocused ? "var(--cm-accent)" : "var(--cm-border)",
                  color: "var(--cm-text)",
                  boxShadow: searchFocused ? "0 0 0 3px var(--cm-accent-dim)" : "none",
                }}
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--cm-text3)" }}>
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </form>

          <div className="flex items-center gap-1">
            <button type="button" onClick={() => router.refresh()} title="Refresh"
              className="flex h-8 w-8 items-center justify-center rounded-lg transition"
              style={{ color: "var(--cm-text2)" }}
              onMouseEnter={e => { e.currentTarget.style.background = "var(--cm-hover-bg)"; e.currentTarget.style.color = "var(--cm-hover-text)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--cm-text2)"; }}>
              <RefreshCw className="h-4 w-4" />
            </button>
            <div className="hidden items-center gap-1 rounded-lg border px-2 py-1 text-[10px] lg:flex"
              style={{ borderColor: "var(--cm-border)", color: "var(--cm-text3)", background: "var(--cm-surface2)" }}>
              <kbd>C</kbd> compose <span className="mx-0.5 opacity-40">·</span> <kbd>/</kbd> search
            </div>
            <div className="hidden items-center gap-2 rounded-xl border px-2.5 py-1.5 sm:flex"
              style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface2)" }}>
              <Avatar name={user.name} email={user.email} size="xs" />
              <span className="max-w-[100px] truncate text-[11.5px] font-[600]" style={{ color: "var(--cm-text)" }}>
                {user.name || user.email.split("@")[0]}
              </span>
              {user.isHostcariClient && <span className="hostcari-badge">HC</span>}
            </div>
          </div>
        </header>

        <main className="flex min-h-0 flex-1 overflow-hidden">{children}</main>
      </div>

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

// ── Rich toolbar ──────────────────────────────────────────────────────────────
function RichToolbar({ editorRef }: { editorRef: React.RefObject<HTMLDivElement | null> }) {
  const [showLink, setShowLink] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [fontSize, setFontSize] = useState("14px");

  function exec(cmd: string) { editorRef.current?.focus(); document.execCommand(cmd, false); }

  function applyFontSize(size: string) {
    setFontSize(size);
    editorRef.current?.focus();
    document.execCommand("fontSize", false, "7");
    editorRef.current?.querySelectorAll("font[size='7']").forEach(node => {
      const span = document.createElement("span");
      span.style.fontSize = size;
      span.innerHTML = (node as HTMLElement).innerHTML;
      node.replaceWith(span);
    });
  }

  function insertLink() {
    if (!linkUrl) return;
    editorRef.current?.focus();
    document.execCommand("createLink", false, linkUrl.startsWith("http") ? linkUrl : `https://${linkUrl}`);
    setLinkUrl(""); setShowLink(false);
  }

  const btn = "flex h-7 w-7 items-center justify-center rounded-lg transition hover:scale-105";

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-0.5 border-b px-2 py-1.5"
      style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface2)" }}>
      <select value={fontSize} onChange={e => applyFontSize(e.target.value)}
        className="mr-1.5 rounded-lg border px-2 py-1 text-[11px] outline-none"
        style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)", color: "var(--cm-text2)" }}>
        {["12px","13px","14px","16px","18px","20px","24px"].map(s => <option key={s} value={s}>{s.replace("px","")}</option>)}
      </select>
      <div className="h-4 w-px mr-0.5" style={{ background: "var(--cm-border2)" }} />
      <button type="button" onClick={() => exec("bold")} className={btn} style={{ color: "var(--cm-text2)" }} title="Bold"><Bold className="h-3.5 w-3.5" /></button>
      <button type="button" onClick={() => exec("italic")} className={btn} style={{ color: "var(--cm-text2)" }} title="Italic"><Italic className="h-3.5 w-3.5" /></button>
      <button type="button" onClick={() => exec("underline")} className={btn} style={{ color: "var(--cm-text2)" }} title="Underline"><Underline className="h-3.5 w-3.5" /></button>
      <div className="mx-0.5 h-4 w-px" style={{ background: "var(--cm-border2)" }} />
      <button type="button" onClick={() => exec("insertUnorderedList")} className={btn} style={{ color: "var(--cm-text2)" }} title="Bullet list"><List className="h-3.5 w-3.5" /></button>
      <button type="button" onClick={() => exec("insertOrderedList")} className={btn} style={{ color: "var(--cm-text2)" }} title="Numbered list"><ListOrdered className="h-3.5 w-3.5" /></button>
      <div className="mx-0.5 h-4 w-px" style={{ background: "var(--cm-border2)" }} />
      {showLink ? (
        <div className="flex items-center gap-1">
          <input value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="https://…"
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); insertLink(); } }}
            className="h-7 w-36 rounded-lg border px-2 text-[11.5px] outline-none"
            style={{ borderColor: "var(--cm-border2)", background: "var(--cm-surface)", color: "var(--cm-text)" }} />
          <button type="button" onClick={insertLink} className="rounded-lg px-2 py-1 text-[10px] font-[700] text-white" style={{ background: "var(--cm-blue)" }}>Add</button>
          <button type="button" onClick={() => setShowLink(false)} style={{ color: "var(--cm-text3)" }}><X className="h-3.5 w-3.5" /></button>
        </div>
      ) : (
        <button type="button" onClick={() => setShowLink(true)} className={btn} style={{ color: "var(--cm-text2)" }} title="Insert link"><LinkIcon className="h-3.5 w-3.5" /></button>
      )}
    </div>
  );
}

// ── Compose modal ─────────────────────────────────────────────────────────────
function ComposeModal({ accountId, fromAddress, onClose, replyTo }: {
  accountId: string; fromAddress: string; onClose: () => void;
  replyTo?: { to: string; subject: string; messageId?: string };
}) {
  const [to, setTo] = useState(replyTo?.to || "");
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [subject, setSubject] = useState(replyTo ? `Re: ${replyTo.subject.replace(/^Re:\s*/i, "")}` : "");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [minimized, setMinimized] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [sent, setSent] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const editorRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLInputElement>(null);
  const draftKey = `carimail-compose-draft:${accountId}`;

  useEffect(() => {
    const raw = localStorage.getItem(draftKey);
    if (raw && !replyTo) {
      try {
        const draft = JSON.parse(raw) as { to?: string; cc?: string; bcc?: string; subject?: string; html?: string };
        setTo(draft.to || "");
        setCc(draft.cc || "");
        setBcc(draft.bcc || "");
        setSubject(draft.subject || "");
        if (draft.cc) setShowCc(true);
        if (draft.bcc) setShowBcc(true);
        if (editorRef.current) {
          editorRef.current.innerHTML = draft.html || "";
          setCharCount(editorRef.current.innerText.length || 0);
        }
      } catch {}
    }
    toRef.current?.focus();
  }, [draftKey, replyTo]);

  useEffect(() => {
    if (sent || replyTo) return;
    const id = window.setInterval(() => {
      const html = editorRef.current?.innerHTML || "";
      const text = editorRef.current?.innerText || "";
      if (!to && !cc && !bcc && !subject && !text.trim()) {
        localStorage.removeItem(draftKey);
        return;
      }
      localStorage.setItem(draftKey, JSON.stringify({ to, cc, bcc, subject, html }));
    }, 1200);
    return () => window.clearInterval(id);
  }, [bcc, cc, draftKey, replyTo, sent, subject, to]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); doSend(); }
    if (e.key === "Escape" && !fullscreen) onClose();
  }

  async function doSend() {
    const html = editorRef.current?.innerHTML || "";
    const text = editorRef.current?.innerText || "";
    if (!to || !subject || !text.trim()) return;
    setSending(true); setError("");
    try {
      const res = await fetch("/api/mail/send", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId, to, cc: cc || undefined, bcc: bcc || undefined, subject, body: html, isHtml: true, inReplyTo: replyTo?.messageId }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Send failed.");
      localStorage.removeItem(draftKey);
      window.dispatchEvent(new Event("carimail:mailbox-changed"));
      setSent(true); setTimeout(onClose, 1400);
    } catch (err) { setError(err instanceof Error ? err.message : "Send failed."); setSending(false); }
  }

  if (minimized) {
    return (
      <div className="fixed bottom-0 right-4 z-50 w-72 overflow-hidden rounded-t-2xl border shadow-2xl"
        style={{ background: "var(--cm-text)", borderColor: "var(--cm-border)" }}>
        <button type="button" onClick={() => setMinimized(false)}
          className="flex w-full items-center justify-between px-4 py-3 text-sm font-[600] text-white transition hover:bg-white/10">
          <span className="truncate">{subject || "New message"}</span>
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
        </button>
      </div>
    );
  }

  const containerCls = fullscreen
    ? "fixed inset-2 sm:inset-4 z-50 flex flex-col overflow-hidden rounded-2xl border shadow-[0_24px_80px_rgba(0,0,0,0.30)]"
    : "fixed bottom-0 right-0 sm:right-4 z-50 flex w-full sm:w-[min(580px,calc(100vw-2rem))] flex-col overflow-hidden rounded-t-2xl border shadow-[0_-8px_40px_rgba(0,0,0,0.15)]";

  const fieldCls = "flex items-center border-b px-4 py-2";

  return (
    <div className={containerCls} style={{ background: "var(--cm-surface)", borderColor: "var(--cm-border)" }} onKeyDown={handleKeyDown}>
      <div className="flex shrink-0 items-center justify-between px-4 py-2.5" style={{ background: "var(--cm-text)" }}>
        <span className="truncate text-sm font-[600] text-white">{subject || "New message"}</span>
        <div className="flex items-center gap-0.5">
          <button type="button" onClick={() => setMinimized(true)} className="flex h-7 w-7 items-center justify-center rounded-lg text-white/50 hover:bg-white/10 hover:text-white transition" title="Minimise"><Minimize2 className="h-3.5 w-3.5" /></button>
          <button type="button" onClick={() => setFullscreen(v => !v)} className="flex h-7 w-7 items-center justify-center rounded-lg text-white/50 hover:bg-white/10 hover:text-white transition" title={fullscreen ? "Exit fullscreen" : "Fullscreen"}>{fullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}</button>
          <button type="button" onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg text-white/50 hover:bg-white/10 hover:text-white transition" title="Discard"><X className="h-4 w-4" /></button>
        </div>
      </div>

      {sent ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-500"><Send className="h-6 w-6" /></div>
          <p className="text-sm font-[600]" style={{ color: "var(--cm-text)" }}>Message sent!</p>
        </div>
      ) : (
        <form onSubmit={e => { e.preventDefault(); doSend(); }} className="flex min-h-0 flex-1 flex-col">
          {error && (
            <div className="flex shrink-0 items-center gap-2 border-b px-4 py-2 text-[12px] text-red-600 bg-red-50" style={{ borderColor: "var(--cm-border)" }}>
              <X className="h-3.5 w-3.5 shrink-0" />{error}
            </div>
          )}
          <div className={fieldCls} style={{ borderColor: "var(--cm-border)" }}>
            <span className="w-12 shrink-0 text-[11px] font-[600]" style={{ color: "var(--cm-text3)" }}>From</span>
            <span className="text-[13px]" style={{ color: "var(--cm-text2)" }}>{fromAddress}</span>
          </div>
          <div className={fieldCls} style={{ borderColor: "var(--cm-border)" }}>
            <span className="w-12 shrink-0 text-[11px] font-[600]" style={{ color: "var(--cm-text3)" }}>To</span>
            <input ref={toRef} value={to} onChange={e => setTo(e.target.value)} required className="flex-1 bg-transparent text-[13px] outline-none placeholder:opacity-40" style={{ color: "var(--cm-text)" }} placeholder="recipient@example.com" />
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => setShowCc(!showCc)} className="rounded px-1.5 py-0.5 text-[10px] font-[600] transition" style={{ color: showCc ? "var(--cm-blue)" : "var(--cm-text3)", background: showCc ? "var(--cm-blue-light)" : "transparent" }}>Cc</button>
              <button type="button" onClick={() => setShowBcc(!showBcc)} className="rounded px-1.5 py-0.5 text-[10px] font-[600] transition" style={{ color: showBcc ? "var(--cm-blue)" : "var(--cm-text3)", background: showBcc ? "var(--cm-blue-light)" : "transparent" }}>Bcc</button>
            </div>
          </div>
          {showCc && (
            <div className={fieldCls} style={{ borderColor: "var(--cm-border)" }}>
              <span className="w-12 shrink-0 text-[11px] font-[600]" style={{ color: "var(--cm-text3)" }}>Cc</span>
              <input value={cc} onChange={e => setCc(e.target.value)} className="flex-1 bg-transparent text-[13px] outline-none placeholder:opacity-40" style={{ color: "var(--cm-text)" }} placeholder="cc@example.com" />
            </div>
          )}
          {showBcc && (
            <div className={fieldCls} style={{ borderColor: "var(--cm-border)" }}>
              <span className="w-12 shrink-0 text-[11px] font-[600]" style={{ color: "var(--cm-text3)" }}>Bcc</span>
              <input value={bcc} onChange={e => setBcc(e.target.value)} className="flex-1 bg-transparent text-[13px] outline-none placeholder:opacity-40" style={{ color: "var(--cm-text)" }} placeholder="bcc@example.com" />
            </div>
          )}
          <div className={fieldCls} style={{ borderColor: "var(--cm-border)" }}>
            <span className="w-12 shrink-0 text-[11px] font-[600]" style={{ color: "var(--cm-text3)" }}>Subject</span>
            <input value={subject} onChange={e => setSubject(e.target.value)} required className="flex-1 bg-transparent text-[13px] font-[500] outline-none placeholder:opacity-40" style={{ color: "var(--cm-text)" }} placeholder="Subject" />
          </div>
          <RichToolbar editorRef={editorRef} />
          <div ref={editorRef} contentEditable suppressContentEditableWarning data-placeholder="Write your message…"
            onInput={() => setCharCount(editorRef.current?.innerText.length || 0)}
            className={`min-h-0 flex-1 overflow-y-auto px-4 py-3 text-[13.5px] leading-relaxed outline-none ${fullscreen ? "min-h-[240px]" : "min-h-[160px]"}`}
            style={{ color: "var(--cm-text)" }} />
          <div className="flex shrink-0 items-center justify-between border-t px-4 py-3" style={{ borderColor: "var(--cm-border)" }}>
            <div className="flex items-center gap-3">
              <button type="submit" disabled={sending}
                className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-[700] text-white transition active:scale-[0.97] disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, var(--cm-accent), var(--cm-accent2))", boxShadow: "0 4px 12px var(--cm-accent-b)" }}>
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {sending ? "Sending…" : "Send"}
              </button>
              <span className="hidden text-[10px] sm:block" style={{ color: "var(--cm-text3)" }}>⌘↵</span>
            </div>
            <div className="flex items-center gap-3">
              {charCount > 0 && <span className="text-[10px]" style={{ color: "var(--cm-text3)" }}>{charCount} chars</span>}
              <button type="button" onClick={onClose} className="text-[11.5px] transition hover:text-red-500" style={{ color: "var(--cm-text3)" }}>Discard</button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
