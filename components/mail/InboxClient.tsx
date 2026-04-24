"use client";
// components/mail/InboxClient.tsx
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle, Archive, Check, ChevronLeft, ChevronRight,
  Copy, Download, Eye, EyeOff, Forward, Inbox,
  Loader2, Mail, MailOpen, MailX, Paperclip,
  Printer, RefreshCw, Reply, ReplyAll, Send,
  Star, StarOff, Tag, Trash2, X, ZoomIn, ZoomOut,
} from "lucide-react";
import Link from "next/link";

type Message = {
  uid: number; seq: number; subject: string;
  from: string; fromName: string; to: string;
  date: string; seen: boolean; flagged: boolean;
  hasAttachment: boolean; size?: number; messageId?: string;
};
type MessageFull = Message & {
  cc: string; replyTo: string;
  bodyHtml: string | null; bodyText: string | null;
  attachments: { filename: string; size: number; contentType: string }[];
};

const PAGE_SIZE = 30;

function formatDate(iso: string) {
  const d = new Date(iso), now = new Date();
  if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  if (now.getTime() - d.getTime() < 7 * 86400000) return d.toLocaleDateString("en-US", { weekday: "short" });
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
function formatDateFull(iso: string) { return new Date(iso).toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" }); }
function formatBytes(b?: number) {
  if (!b) return "";
  if (b < 1024) return `${b}B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)}KB`;
  return `${(b / 1024 / 1024).toFixed(1)}MB`;
}

const AVATAR_COLORS = ["from-[#F97316] to-[#EA580C]","from-[#0044BC] to-[#003399]","from-[#7C3AED] to-[#6D28D9]","from-[#059669] to-[#047857]","from-[#DC2626] to-[#B91C1C]","from-[#0891B2] to-[#0E7490]"];
function Avatar({ name, email, size = "md" }: { name: string; email: string; size?: "sm" | "md" | "lg" }) {
  const letter = (name || email).charAt(0).toUpperCase();
  const color = AVATAR_COLORS[letter.charCodeAt(0) % AVATAR_COLORS.length];
  const sz = { sm: "h-8 w-8 text-[11px]", md: "h-9 w-9 text-[12px]", lg: "h-11 w-11 text-[14px]" }[size];
  return <div className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${color} font-[700] text-white ${sz}`}>{letter}</div>;
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button type="button" onClick={() => { navigator.clipboard.writeText(text).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="flex h-5 w-5 items-center justify-center rounded opacity-50 hover:opacity-100 transition" style={{ color: "var(--cm-text2)" }}>
      {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
    </button>
  );
}

export default function InboxClient({ accountId, folder }: { accountId: string | null; folder: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQ = searchParams.get("q") || "";

  const [messages, setMessages] = useState<Message[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<MessageFull | null>(null);
  const [msgLoading, setMsgLoading] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyMode, setReplyMode] = useState<"reply" | "reply-all" | "forward">("reply");
  const [replyBody, setReplyBody] = useState("");
  const [replyTo, setReplyTo] = useState("");
  const [replySending, setReplySending] = useState(false);
  const [selectedUids, setSelectedUids] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [viewSource, setViewSource] = useState(false);
  const [showImages, setShowImages] = useState(true);
  const [fontSize, setFontSize] = useState(14);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);
  const replyRef = useRef<HTMLTextAreaElement>(null);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  function notify(msg: string, type: "ok" | "err" = "ok") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  const load = useCallback(async (p = page) => {
    if (!accountId) return;
    setLoading(true); setError("");
    try {
      const url = searchQ
        ? `/api/mail/messages?accountId=${accountId}&action=search&folder=${encodeURIComponent(folder)}&q=${encodeURIComponent(searchQ)}`
        : `/api/mail/messages?accountId=${accountId}&folder=${encodeURIComponent(folder)}&page=${p}&pageSize=${PAGE_SIZE}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Failed to load.");
      setMessages(data.messages || []);
      setTotal(data.total || data.messages?.length || 0);
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to load messages."); }
    finally { setLoading(false); }
  }, [accountId, folder, page, searchQ]);

  useEffect(() => { setSelected(null); setPage(1); setSelectedUids(new Set()); load(1); }, [accountId, folder, searchQ]);

  // Keyboard shortcuts in reader
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (!selected) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.contentEditable === "true") return;
      if (e.key === "r") openReply("reply");
      if (e.key === "a") openReply("reply-all");
      if (e.key === "f") openReply("forward");
      if (e.key === "s") doAction(selected.flagged ? "unflag" : "flag", selected.uid);
      if (e.key === "Delete" || e.key === "Backspace") doAction("trash", selected.uid);
      if (e.key === "Escape") setSelected(null);
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [selected]);

  async function openMessage(msg: Message) {
    if (!accountId) return;
    setMsgLoading(true); setSelected(null); setReplyOpen(false);
    try {
      const res = await fetch(`/api/mail/messages?accountId=${accountId}&action=message&folder=${encodeURIComponent(folder)}&uid=${msg.uid}`);
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Failed.");
      setSelected(data.message);
      setMessages(prev => prev.map(m => m.uid === msg.uid ? { ...m, seen: true } : m));
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to open message."); }
    finally { setMsgLoading(false); }
  }

  async function doAction(action: string, uid: number, extra?: object) {
    if (!accountId) return;
    setActionBusy(true);
    try {
      const res = await fetch("/api/mail/action", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ accountId, action, folder, uid, ...extra }) });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      const labels: Record<string, string> = { trash: "Moved to trash", archive: "Archived", read: "Marked as read", unread: "Marked as unread", flag: "Starred", unflag: "Unstarred" };
      notify(labels[action] || "Done");
      if (["trash", "delete", "move", "archive"].includes(action)) {
        setSelected(null); setMessages(prev => prev.filter(m => m.uid !== uid)); setTotal(t => t - 1);
      } else if (action === "flag" || action === "unflag") {
        const flagged = action === "flag";
        setMessages(prev => prev.map(m => m.uid === uid ? { ...m, flagged } : m));
        if (selected?.uid === uid) setSelected(s => s ? { ...s, flagged } : s);
      } else if (action === "read" || action === "unread") {
        const seen = action === "read";
        setMessages(prev => prev.map(m => m.uid === uid ? { ...m, seen } : m));
        if (selected?.uid === uid) setSelected(s => s ? { ...s, seen } : s);
      }
    } catch (err) { notify(err instanceof Error ? err.message : "Action failed", "err"); }
    finally { setActionBusy(false); }
  }

  async function bulkAction(action: string) {
    if (!accountId || selectedUids.size === 0) return;
    setActionBusy(true);
    let count = 0;
    for (const uid of selectedUids) {
      try { await fetch("/api/mail/action", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ accountId, action, folder, uid }) }); count++; } catch {}
    }
    if (action === "trash") {
      setMessages(prev => prev.filter(m => !selectedUids.has(m.uid)));
      setTotal(t => t - count);
      if (selected && selectedUids.has(selected.uid)) setSelected(null);
    }
    setSelectedUids(new Set()); setSelectAll(false);
    notify(`${count} message${count !== 1 ? "s" : ""} ${action === "trash" ? "deleted" : action}`);
    setActionBusy(false);
  }

  function openReply(mode: "reply" | "reply-all" | "forward") {
    if (!selected) return;
    setReplyMode(mode); setReplyOpen(true);
    setReplyTo(mode === "forward" ? "" : (selected.replyTo || selected.from));
    setTimeout(() => replyRef.current?.focus(), 80);
  }

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || !accountId) return;
    setReplySending(true);
    try {
      const subject = replyMode === "forward" ? `Fwd: ${selected.subject.replace(/^Fwd:\s*/i, "")}` : `Re: ${selected.subject.replace(/^Re:\s*/i, "")}`;
      const res = await fetch("/api/mail/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ accountId, to: replyTo, subject, body: replyBody, inReplyTo: selected.messageId }) });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      setReplyOpen(false); setReplyBody(""); setReplyTo(""); notify("Message sent!");
    } catch (err) { setError(err instanceof Error ? err.message : "Send failed."); }
    finally { setReplySending(false); }
  }

  function toggleSelectAll() {
    if (selectAll) { setSelectedUids(new Set()); setSelectAll(false); }
    else { setSelectedUids(new Set(messages.map(m => m.uid))); setSelectAll(true); }
  }

  if (!accountId) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-5 p-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: "var(--cm-blue-light)", color: "var(--cm-blue)" }}><Mail className="h-8 w-8" /></div>
        <div>
          <h2 className="text-[15px] font-[700]" style={{ color: "var(--cm-text)" }}>No email account connected</h2>
          <p className="mt-1.5 max-w-sm text-[13px]" style={{ color: "var(--cm-text2)" }}>Connect your IMAP/SMTP account to start reading and sending mail.</p>
        </div>
        <Link href="/settings/accounts" className="inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-[13px] font-[700] text-white transition hover:-translate-y-0.5"
          style={{ background: "var(--cm-blue)", boxShadow: "0 4px 14px rgba(0,68,188,0.28)" }}>Connect account</Link>
      </div>
    );
  }

  const unread = messages.filter(m => !m.seen).length;
  const toolBtnBase = "inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[11.5px] font-[600] transition";

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 animate-slide-up">
          <div className={`flex items-center gap-2.5 rounded-2xl border px-4 py-2.5 text-[13px] font-[600] shadow-lg ${toast.type === "err" ? "border-red-200 bg-red-50 text-red-700" : "text-white"}`}
            style={toast.type === "ok" ? { background: "var(--cm-text)", borderColor: "var(--cm-border)" } : {}}>
            {toast.type === "ok" ? <Check className="h-4 w-4 text-emerald-400" /> : <AlertCircle className="h-4 w-4" />}
            {toast.msg}
          </div>
        </div>
      )}

      {/* Message list */}
      <div className={`flex flex-col border-r ${selected || msgLoading ? "hidden md:flex md:w-[300px] lg:w-[340px] xl:w-[380px]" : "flex flex-1 md:flex-none md:w-[300px] lg:w-[340px] xl:w-[380px]"}`}
        style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)" }}>

        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b px-4 py-3" style={{ borderColor: "var(--cm-border)" }}>
          <div>
            <h2 className="text-[13px] font-[700]" style={{ color: "var(--cm-text)" }}>
              {searchQ ? `"${searchQ}"` : folder === "INBOX" ? "Inbox" : folder.split(".").pop()}
            </h2>
            {!searchQ && (
              <p className="text-[10.5px]" style={{ color: "var(--cm-text3)" }}>
                {loading ? "Loading…" : `${total} message${total !== 1 ? "s" : ""}${unread > 0 ? ` · ${unread} unread` : ""}`}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1">
            {selectedUids.size > 0 && (
              <>
                <button type="button" onClick={() => bulkAction("read")} disabled={actionBusy} title="Mark as read"
                  className="rounded-lg p-1.5 transition" style={{ color: "var(--cm-text3)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--cm-hover-bg)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}><MailOpen className="h-3.5 w-3.5" /></button>
                <button type="button" onClick={() => bulkAction("trash")} disabled={actionBusy} title="Delete selected"
                  className="rounded-lg p-1.5 transition text-red-500"
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,0.08)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}><Trash2 className="h-3.5 w-3.5" /></button>
                <span className="text-[10px] font-[600] px-1" style={{ color: "var(--cm-text3)" }}>{selectedUids.size}</span>
              </>
            )}
            <button type="button" onClick={() => load()} disabled={loading}
              className="rounded-lg p-1.5 transition" style={{ color: "var(--cm-text3)" }}
              onMouseEnter={e => { e.currentTarget.style.background = "var(--cm-hover-bg)"; e.currentTarget.style.color = "var(--cm-blue)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--cm-text3)"; }}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Select all row */}
        {messages.length > 0 && (
          <div className="flex shrink-0 items-center gap-2 border-b px-4 py-1.5" style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface2)" }}>
            <input type="checkbox" checked={selectAll} onChange={toggleSelectAll} className="rounded border cursor-pointer" style={{ accentColor: "var(--cm-blue)", borderColor: "var(--cm-border2)" }} />
            <span className="text-[10.5px]" style={{ color: "var(--cm-text3)" }}>{selectAll ? "Deselect all" : "Select all"}</span>
          </div>
        )}

        {error && (
          <div className="mx-4 mt-3 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />{error}
          </div>
        )}

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading && messages.length === 0 ? (
            <div className="flex items-center justify-center gap-2.5 py-20 text-[13px]" style={{ color: "var(--cm-text3)" }}>
              <Loader2 className="h-5 w-5 animate-spin" />Loading…
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-center px-6">
              <Inbox className="h-10 w-10" style={{ color: "var(--cm-border2)" }} />
              <p className="text-[13px]" style={{ color: "var(--cm-text3)" }}>{searchQ ? "No results found." : "Nothing here yet."}</p>
            </div>
          ) : (
            messages.map(msg => {
              const isActive = selected?.uid === msg.uid;
              const isChecked = selectedUids.has(msg.uid);
              return (
                <div key={msg.uid} className={`msg-item group relative border-b ${isActive ? "active" : ""}`}
                  style={{ borderColor: "var(--cm-divider)" }} onClick={() => isActive ? setSelected(null) : openMessage(msg)}>
                  {!msg.seen && <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r-full" style={{ background: "var(--cm-unread-dot)" }} />}
                  <div className="flex items-start gap-2.5 px-4 py-3">
                    <div className="flex shrink-0 items-center pt-0.5" onClick={e => { e.stopPropagation(); setSelectedUids(prev => { const next = new Set(prev); if (next.has(msg.uid)) next.delete(msg.uid); else next.add(msg.uid); return next; }); }}>
                      <input type="checkbox" checked={isChecked} onChange={() => {}} className="rounded border cursor-pointer"
                        style={{ accentColor: "var(--cm-blue)", borderColor: "var(--cm-border2)", opacity: isChecked ? 1 : 0 }}
                        onMouseEnter={e => { (e.target as HTMLElement).style.opacity = "1"; }}
                        onMouseLeave={e => { if (!isChecked) (e.target as HTMLElement).style.opacity = "0"; }} />
                    </div>
                    <Avatar name={msg.fromName} email={msg.from} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className={`truncate text-[12.5px] ${msg.seen ? "" : "font-[700]"}`} style={{ color: msg.seen ? "var(--cm-text2)" : "var(--cm-text)" }}>
                          {msg.fromName || msg.from}
                        </span>
                        <span className="shrink-0 text-[10px]" style={{ color: "var(--cm-text3)" }}>{formatDate(msg.date)}</span>
                      </div>
                      <div className={`mt-0.5 truncate text-[11.5px] ${msg.seen ? "" : "font-[600]"}`} style={{ color: msg.seen ? "var(--cm-text3)" : "var(--cm-text2)" }}>
                        {msg.subject}
                      </div>
                      <div className="mt-1 flex items-center gap-1.5">
                        {!msg.seen && <div className="unread-dot" />}
                        {msg.flagged && <Star className="h-3 w-3" style={{ color: "var(--cm-starred)" }} />}
                        {msg.hasAttachment && <Paperclip className="h-3 w-3" style={{ color: "var(--cm-text3)" }} />}
                        {msg.size && <span className="text-[10px]" style={{ color: "var(--cm-text3)" }}>{formatBytes(msg.size)}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {!searchQ && totalPages > 1 && (
          <div className="flex shrink-0 items-center justify-between border-t px-4 py-2.5" style={{ borderColor: "var(--cm-border)" }}>
            <span className="text-[10.5px]" style={{ color: "var(--cm-text3)" }}>Page {page} / {totalPages} · {total} total</span>
            <div className="flex gap-1">
              <button type="button" onClick={() => { const p = Math.max(1, page - 1); setPage(p); load(p); }} disabled={page === 1}
                className="flex h-7 w-7 items-center justify-center rounded-lg border transition disabled:opacity-30"
                style={{ borderColor: "var(--cm-border)", color: "var(--cm-text2)" }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--cm-hover-bg)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => { const p = Math.min(totalPages, page + 1); setPage(p); load(p); }} disabled={page === totalPages}
                className="flex h-7 w-7 items-center justify-center rounded-lg border transition disabled:opacity-30"
                style={{ borderColor: "var(--cm-border)", color: "var(--cm-text2)" }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--cm-hover-bg)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Message reader */}
      <div className={`flex min-w-0 flex-1 flex-col ${!selected && !msgLoading ? "hidden md:flex" : "flex"}`}
        style={{ background: "var(--cm-bg)" }}>

        {msgLoading ? (
          <div className="flex flex-1 items-center justify-center gap-3 text-[13px]" style={{ color: "var(--cm-text3)" }}>
            <Loader2 className="h-5 w-5 animate-spin" />Loading message…
          </div>
        ) : !selected ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center px-8">
            <MailOpen className="h-12 w-12" style={{ color: "var(--cm-border2)" }} />
            <div>
              <p className="text-[14px] font-[500]" style={{ color: "var(--cm-text3)" }}>Select a message to read</p>
              <p className="mt-1 text-[11.5px]" style={{ color: "var(--cm-text3)" }}>
                <kbd className="rounded border px-1 py-0.5 text-[10px]" style={{ borderColor: "var(--cm-border)" }}>R</kbd> reply ·{" "}
                <kbd className="rounded border px-1 py-0.5 text-[10px]" style={{ borderColor: "var(--cm-border)" }}>S</kbd> star ·{" "}
                <kbd className="rounded border px-1 py-0.5 text-[10px]" style={{ borderColor: "var(--cm-border)" }}>Del</kbd> delete
              </p>
            </div>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            {/* Toolbar */}
            <div className="flex shrink-0 flex-wrap items-center gap-1.5 border-b px-4 py-2.5"
              style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)" }}>
              <button type="button" onClick={() => setSelected(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border transition md:hidden"
                style={{ borderColor: "var(--cm-border)", color: "var(--cm-text2)" }}>
                <ChevronLeft className="h-4 w-4" />
              </button>

              {/* Reply group */}
              <div className="flex items-center gap-1">
                {(["reply", "reply-all", "forward"] as const).map(mode => {
                  const active = replyOpen && replyMode === mode;
                  const Icon = mode === "reply" ? Reply : mode === "reply-all" ? ReplyAll : Forward;
                  const label = mode === "reply" ? "Reply" : mode === "reply-all" ? "Reply All" : "Forward";
                  return (
                    <button key={mode} type="button" onClick={() => openReply(mode)}
                      className={toolBtnBase}
                      style={{
                        borderColor: active ? "var(--cm-accent-b)" : "var(--cm-border)",
                        background: active ? "var(--cm-accent-dim)" : "var(--cm-surface)",
                        color: active ? "var(--cm-accent)" : "var(--cm-text2)",
                      }}>
                      <Icon className="h-3.5 w-3.5" />
                      <span className={mode === "reply" ? "" : "hidden sm:inline"}>{label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="h-5 w-px" style={{ background: "var(--cm-border)" }} />

              <button type="button" onClick={() => doAction(selected.flagged ? "unflag" : "flag", selected.uid)} disabled={actionBusy}
                className={toolBtnBase}
                style={{ borderColor: selected.flagged ? "rgba(245,158,11,0.3)" : "var(--cm-border)", background: selected.flagged ? "rgba(245,158,11,0.08)" : "var(--cm-surface)", color: selected.flagged ? "var(--cm-starred)" : "var(--cm-text2)" }}>
                {selected.flagged ? <StarOff className="h-3.5 w-3.5" /> : <Star className="h-3.5 w-3.5" />}
                <span className="hidden sm:inline">{selected.flagged ? "Unstar" : "Star"}</span>
              </button>

              <button type="button" onClick={() => doAction(selected.seen ? "unread" : "read", selected.uid)} disabled={actionBusy}
                className={toolBtnBase} style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)", color: "var(--cm-text2)" }}>
                {selected.seen ? <MailX className="h-3.5 w-3.5" /> : <MailOpen className="h-3.5 w-3.5" />}
                <span className="hidden sm:inline">{selected.seen ? "Unread" : "Read"}</span>
              </button>

              <button type="button" onClick={() => doAction("archive", selected.uid)} disabled={actionBusy}
                className={toolBtnBase} style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)", color: "var(--cm-text2)" }}>
                <Archive className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">Archive</span>
              </button>

              <button type="button" onClick={() => doAction("trash", selected.uid)} disabled={actionBusy}
                className={toolBtnBase} style={{ borderColor: "rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.05)", color: "#dc2626" }}>
                <Trash2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Delete</span>
              </button>

              <div className="ml-auto flex items-center gap-1">
                <button type="button" onClick={() => setFontSize(s => Math.max(11, s - 1))} title="Smaller" className="flex h-7 w-7 items-center justify-center rounded-lg transition" style={{ color: "var(--cm-text3)" }} onMouseEnter={e => (e.currentTarget.style.background = "var(--cm-hover-bg)")} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}><ZoomOut className="h-3.5 w-3.5" /></button>
                <button type="button" onClick={() => setFontSize(s => Math.min(22, s + 1))} title="Larger" className="flex h-7 w-7 items-center justify-center rounded-lg transition" style={{ color: "var(--cm-text3)" }} onMouseEnter={e => (e.currentTarget.style.background = "var(--cm-hover-bg)")} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}><ZoomIn className="h-3.5 w-3.5" /></button>
                <button type="button" onClick={() => setShowImages(v => !v)} title={showImages ? "Hide images" : "Show images"} className="flex h-7 w-7 items-center justify-center rounded-lg transition" style={{ color: "var(--cm-text3)" }} onMouseEnter={e => (e.currentTarget.style.background = "var(--cm-hover-bg)")} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>{showImages ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}</button>
                <button type="button" onClick={() => window.print()} title="Print" className="flex h-7 w-7 items-center justify-center rounded-lg transition" style={{ color: "var(--cm-text3)" }} onMouseEnter={e => (e.currentTarget.style.background = "var(--cm-hover-bg)")} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}><Printer className="h-3.5 w-3.5" /></button>
                <button type="button" onClick={() => setViewSource(v => !v)} title="View source" className="flex h-7 w-7 items-center justify-center rounded-lg transition" style={{ color: viewSource ? "var(--cm-accent)" : "var(--cm-text3)" }} onMouseEnter={e => (e.currentTarget.style.background = "var(--cm-hover-bg)")} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}><Tag className="h-3.5 w-3.5" /></button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
              <div className="mx-auto max-w-3xl px-5 py-6 sm:px-8 sm:py-7">
                <h1 className="text-[20px] font-[800] leading-tight tracking-tight" style={{ color: "var(--cm-text)" }}>{selected.subject}</h1>

                <div className="mt-5 flex items-start gap-3.5">
                  <Avatar name={selected.fromName} email={selected.from} size="lg" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span className="text-[14px] font-[700]" style={{ color: "var(--cm-text)" }}>{selected.fromName || selected.from}</span>
                      {selected.fromName && (
                        <span className="flex items-center gap-1 text-[11.5px]" style={{ color: "var(--cm-text3)" }}>
                          &lt;{selected.from}&gt;<CopyBtn text={selected.from} />
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11.5px]" style={{ color: "var(--cm-text3)" }}>
                      <span>To: {selected.to}</span>
                      {selected.cc && <span>Cc: {selected.cc}</span>}
                      <span>{formatDateFull(selected.date)}</span>
                    </div>
                  </div>
                  {selected.flagged && <Star className="h-4 w-4 shrink-0 mt-1" style={{ color: "var(--cm-starred)" }} />}
                </div>

                <div className="my-5 h-px" style={{ background: "var(--cm-border)" }} />

                {viewSource ? (
                  <pre className="overflow-x-auto rounded-xl border p-4 text-[12px] leading-relaxed font-mono"
                    style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface2)", color: "var(--cm-text2)" }}>
                    {selected.bodyHtml || selected.bodyText || "(empty)"}
                  </pre>
                ) : selected.bodyHtml ? (
                  <div className="email-body" style={{ fontSize: `${fontSize}px`, lineHeight: 1.7 }}
                    dangerouslySetInnerHTML={{
                      __html: (() => {
                        let html = selected.bodyHtml.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "").replace(/javascript:/gi, "");
                        if (!showImages) html = html.replace(/<img\b[^>]*>/gi, `<div style="display:inline-flex;align-items:center;gap:4px;background:var(--cm-surface2);border:1px solid var(--cm-border);border-radius:6px;padding:4px 8px;font-size:11px;color:var(--cm-text3)">[image hidden]</div>`);
                        return html;
                      })(),
                    }} />
                ) : (
                  <pre className="whitespace-pre-wrap font-sans leading-relaxed" style={{ fontSize: `${fontSize}px`, color: "var(--cm-text2)" }}>{selected.bodyText || "(empty message)"}</pre>
                )}

                {selected.attachments.length > 0 && (
                  <div className="mt-7 pt-5 border-t" style={{ borderColor: "var(--cm-border)" }}>
                    <p className="mb-3 text-[11.5px] font-[700] uppercase tracking-[0.12em]" style={{ color: "var(--cm-text3)" }}>
                      {selected.attachments.length} Attachment{selected.attachments.length !== 1 ? "s" : ""}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selected.attachments.map((att, i) => (
                        <div key={i} className="flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 transition" style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)" }}>
                          <Paperclip className="h-4 w-4 shrink-0" style={{ color: "var(--cm-text3)" }} />
                          <div>
                            <div className="text-[12px] font-[600]" style={{ color: "var(--cm-text)" }}>{att.filename}</div>
                            <div className="text-[10px]" style={{ color: "var(--cm-text3)" }}>{att.contentType} · {formatBytes(att.size)}</div>
                          </div>
                          <button type="button" title="Download" className="ml-1 transition hover:opacity-70" style={{ color: "var(--cm-text3)" }}><Download className="h-3.5 w-3.5" /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Reply panel */}
            {replyOpen && (
              <div className="shrink-0 border-t" style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface2)" }}>
                <form onSubmit={handleReply} className="px-5 py-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11.5px] font-[700]" style={{ color: "var(--cm-text)" }}>
                        {replyMode === "reply" ? "Reply" : replyMode === "reply-all" ? "Reply All" : "Forward"}
                      </span>
                      {replyMode === "forward" ? (
                        <input value={replyTo} onChange={e => setReplyTo(e.target.value)} required
                          className="rounded-xl border px-3 py-1 text-[12px] outline-none w-56"
                          style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)", color: "var(--cm-text)" }}
                          placeholder="To: recipient@…"
                          onFocus={e => { e.target.style.borderColor = "var(--cm-accent)"; e.target.style.boxShadow = "0 0 0 3px var(--cm-accent-dim)"; }}
                          onBlur={e => { e.target.style.borderColor = "var(--cm-border)"; e.target.style.boxShadow = "none"; }} />
                      ) : (
                        <span className="text-[11.5px]" style={{ color: "var(--cm-text3)" }}>→ {replyTo}</span>
                      )}
                    </div>
                    <button type="button" onClick={() => setReplyOpen(false)} style={{ color: "var(--cm-text3)" }}><X className="h-4 w-4" /></button>
                  </div>
                  <textarea ref={replyRef} value={replyBody} onChange={e => setReplyBody(e.target.value)} required rows={4}
                    className="w-full resize-none rounded-2xl border px-4 py-3 text-[13px] outline-none transition"
                    style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)", color: "var(--cm-text)" }}
                    placeholder="Write your reply…"
                    onFocus={e => { e.target.style.borderColor = "var(--cm-accent)"; e.target.style.boxShadow = "0 0 0 3px var(--cm-accent-dim)"; }}
                    onBlur={e => { e.target.style.borderColor = "var(--cm-border)"; e.target.style.boxShadow = "none"; }} />
                  <div className="flex items-center gap-2">
                    <button type="submit" disabled={replySending}
                      className="inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-[13px] font-[700] text-white transition active:scale-[0.97] disabled:opacity-60"
                      style={{ background: "linear-gradient(135deg, var(--cm-accent), var(--cm-accent2))", boxShadow: "0 4px 12px var(--cm-accent-b)" }}>
                      {replySending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      {replySending ? "Sending…" : "Send"}
                    </button>
                    <button type="button" onClick={() => setReplyOpen(false)}
                      className="rounded-2xl border px-4 py-2.5 text-[13px] font-[500] transition"
                      style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)", color: "var(--cm-text2)" }}>Cancel</button>
                    <span className="text-[10px]" style={{ color: "var(--cm-text3)" }}>⌘↵ to send</span>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}