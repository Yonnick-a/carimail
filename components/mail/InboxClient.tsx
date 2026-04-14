"use client";
// components/mail/InboxClient.tsx
import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle, ChevronLeft, ChevronRight,
  Inbox, Loader2, Mail, MailOpen, Paperclip,
  RefreshCw, Reply, Search, Send, Star, StarOff,
  Trash2, X,
} from "lucide-react";
import Link from "next/link";

type Message = {
  uid: number;
  seq: number;
  subject: string;
  from: string;
  fromName: string;
  to: string;
  date: string;
  seen: boolean;
  flagged: boolean;
  hasAttachment: boolean;
  size?: number;
  messageId?: string;
};

type MessageFull = Message & {
  cc: string;
  replyTo: string;
  bodyHtml: string | null;
  bodyText: string | null;
  attachments: { filename: string; size: number; contentType: string }[];
};

const PAGE_SIZE = 30;

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  }
  if (now.getTime() - d.getTime() < 7 * 86400000) {
    return d.toLocaleDateString("en-US", { weekday: "short" });
  }
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDateFull(iso: string) {
  return new Date(iso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

function formatBytes(b?: number) {
  if (!b) return "";
  if (b < 1024) return `${b}B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)}KB`;
  return `${(b / 1024 / 1024).toFixed(1)}MB`;
}

function Avatar({ name, email }: { name: string; email: string }) {
  const src = name || email;
  const letter = src.charAt(0).toUpperCase();
  const colors = [
    "from-[#FF914D] to-[#FF7A2F]",
    "from-[#0044BC] to-[#003399]",
    "from-[#7C3AED] to-[#6D28D9]",
    "from-[#059669] to-[#047857]",
    "from-[#DC2626] to-[#B91C1C]",
  ];
  const color = colors[letter.charCodeAt(0) % colors.length];
  return (
    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${color} text-sm font-bold text-white`}>
      {letter}
    </div>
  );
}

export default function InboxClient({
  accountId,
  folder,
}: {
  accountId: string | null;
  folder: string;
}) {
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
  const [replyBody, setReplyBody] = useState("");
  const [replySending, setReplySending] = useState(false);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  // ── Load messages ───────────────────────────────────────────────────
  const load = useCallback(async (p = page) => {
    if (!accountId) return;
    setLoading(true);
    setError("");
    try {
      let url: string;
      if (searchQ) {
        url = `/api/mail/messages?accountId=${accountId}&action=search&folder=${encodeURIComponent(folder)}&q=${encodeURIComponent(searchQ)}`;
      } else {
        url = `/api/mail/messages?accountId=${accountId}&folder=${encodeURIComponent(folder)}&page=${p}&pageSize=${PAGE_SIZE}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Failed to load.");
      setMessages(data.messages || []);
      setTotal(data.total || data.messages?.length || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load messages.");
    } finally {
      setLoading(false);
    }
  }, [accountId, folder, page, searchQ]);

  useEffect(() => {
    setSelected(null);
    setPage(1);
    load(1);
  }, [accountId, folder, searchQ]);

  // ── Open message ────────────────────────────────────────────────────
  async function openMessage(msg: Message) {
    if (!accountId) return;
    setMsgLoading(true);
    setSelected(null);
    setReplyOpen(false);
    try {
      const res = await fetch(`/api/mail/messages?accountId=${accountId}&action=message&folder=${encodeURIComponent(folder)}&uid=${msg.uid}`);
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Failed.");
      setSelected(data.message);
      // Mark as read locally
      setMessages((prev) => prev.map((m) => m.uid === msg.uid ? { ...m, seen: true } : m));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to open message.");
    } finally {
      setMsgLoading(false);
    }
  }

  // ── Action ──────────────────────────────────────────────────────────
  async function doAction(action: string, uid: number, extra?: object) {
    if (!accountId) return;
    setActionBusy(true);
    try {
      await fetch("/api/mail/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId, action, folder, uid, ...extra }),
      });
      if (["trash", "delete", "move"].includes(action)) {
        setSelected(null);
        setMessages((prev) => prev.filter((m) => m.uid !== uid));
      } else if (action === "flag" || action === "unflag") {
        const flagged = action === "flag";
        setMessages((prev) => prev.map((m) => m.uid === uid ? { ...m, flagged } : m));
        if (selected?.uid === uid) setSelected((s) => s ? { ...s, flagged } : s);
      }
    } catch {}
    finally { setActionBusy(false); }
  }

  // ── Reply ───────────────────────────────────────────────────────────
  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || !accountId) return;
    setReplySending(true);
    try {
      const res = await fetch("/api/mail/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId,
          to: selected.replyTo || selected.from,
          subject: `Re: ${selected.subject.replace(/^Re:\s*/i, "")}`,
          body: replyBody,
          inReplyTo: selected.messageId,
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      setReplyOpen(false);
      setReplyBody("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Send failed.");
    } finally {
      setReplySending(false);
    }
  }

  // ── No account state ────────────────────────────────────────────────
  if (!accountId) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EEF4FF] text-[#0044BC]">
          <Mail className="h-8 w-8" />
        </div>
        <h2 className="text-lg font-semibold text-[#0F172A]">No email account connected</h2>
        <p className="max-w-sm text-sm text-[#64748B]">
          Connect your email account to start reading and sending mail.
        </p>
        <Link href="/settings/accounts"
          className="inline-flex items-center gap-2 rounded-2xl bg-[#0044BC] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#003399]">
          Connect account
        </Link>
      </div>
    );
  }

  const unread = messages.filter((m) => !m.seen).length;

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">

      {/* ── Message list panel ── */}
      <div className={`flex flex-col border-r border-slate-200/80 bg-white ${selected ? "hidden md:flex md:w-80 lg:w-96 xl:w-[420px]" : "flex flex-1 md:flex-none md:w-80 lg:w-96 xl:w-[420px]"}`}>

        {/* List header */}
        <div className="flex items-center justify-between border-b border-slate-200/70 px-5 py-3.5">
          <div>
            <h2 className="text-sm font-bold text-[#0F172A]">
              {searchQ ? `Search: "${searchQ}"` : folder === "INBOX" ? "Inbox" : folder.split(".").pop()}
            </h2>
            {!searchQ && (
              <p className="text-[11px] text-[#94A3B8]">
                {loading ? "Loading…" : `${total} message${total !== 1 ? "s" : ""}${unread > 0 ? ` · ${unread} unread` : ""}`}
              </p>
            )}
          </div>
          <button type="button" onClick={() => load()} disabled={loading}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-[#64748B] hover:bg-[#EEF4FF] hover:text-[#0044BC] disabled:opacity-50">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {error && (
          <div className="mx-4 mt-3 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />{error}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {loading && messages.length === 0 ? (
            <div className="flex items-center justify-center gap-2.5 py-20 text-sm text-[#64748B]">
              <Loader2 className="h-5 w-5 animate-spin" />Loading…
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
              <Inbox className="h-10 w-10 text-slate-200" />
              <p className="text-sm text-[#64748B]">
                {searchQ ? "No results found." : "Nothing here yet."}
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isActive = selected?.uid === msg.uid;
              return (
                <button
                  key={msg.uid}
                  type="button"
                  onClick={() => isActive ? setSelected(null) : openMessage(msg)}
                  className={`w-full px-4 py-3.5 text-left transition ${isActive ? "bg-[#EEF4FF]" : msg.seen ? "hover:bg-slate-50" : "bg-white hover:bg-slate-50"}`}
                >
                  <div className="flex items-start gap-3">
                    <Avatar name={msg.fromName} email={msg.from} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className={`truncate text-sm ${msg.seen ? "font-medium text-[#64748B]" : "font-bold text-[#0F172A]"}`}>
                          {msg.fromName || msg.from}
                        </span>
                        <span className="shrink-0 text-[10px] text-[#94A3B8]">{formatDate(msg.date)}</span>
                      </div>
                      <div className={`mt-0.5 truncate text-xs ${msg.seen ? "text-[#94A3B8]" : "font-semibold text-[#334155]"}`}>
                        {msg.subject}
                      </div>
                      <div className="mt-1 flex items-center gap-1.5">
                        {!msg.seen && <div className="h-1.5 w-1.5 rounded-full bg-[#0044BC]" />}
                        {msg.flagged && <Star className="h-3 w-3 text-amber-400" />}
                        {msg.hasAttachment && <Paperclip className="h-3 w-3 text-[#94A3B8]" />}
                        {msg.size && <span className="text-[10px] text-[#94A3B8]">{formatBytes(msg.size)}</span>}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {!searchQ && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200/70 px-4 py-3">
            <span className="text-[11px] text-[#94A3B8]">{page} / {totalPages}</span>
            <div className="flex gap-1">
              <button type="button" onClick={() => { const p = Math.max(1, page-1); setPage(p); load(p); }} disabled={page === 1}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-[#64748B] disabled:opacity-40 hover:bg-slate-50">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => { const p = Math.min(totalPages, page+1); setPage(p); load(p); }} disabled={page === totalPages}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-[#64748B] disabled:opacity-40 hover:bg-slate-50">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Message reader panel ── */}
      <div className={`flex min-w-0 flex-1 flex-col bg-white ${!selected && !msgLoading ? "hidden md:flex" : "flex"}`}>

        {msgLoading ? (
          <div className="flex flex-1 items-center justify-center gap-3 text-sm text-[#64748B]">
            <Loader2 className="h-5 w-5 animate-spin" />Loading message…
          </div>
        ) : !selected ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <MailOpen className="h-12 w-12 text-slate-200" />
            <p className="text-sm text-[#94A3B8]">Select a message to read</p>
          </div>
        ) : (
          <>
            {/* Message toolbar */}
            <div className="flex shrink-0 items-center gap-2 border-b border-slate-200/70 px-5 py-3">
              <button type="button" onClick={() => setSelected(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-[#64748B] transition hover:bg-slate-50 md:hidden">
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div className="flex flex-1 flex-wrap gap-2">
                <button type="button" onClick={() => setReplyOpen(!replyOpen)}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${replyOpen ? "border-[#FF914D]/20 bg-[#FFF6EE] text-[#FF914D]" : "border-slate-200 bg-white text-[#64748B] hover:bg-slate-50"}`}>
                  <Reply className="h-3.5 w-3.5" />Reply
                </button>

                <button type="button"
                  onClick={() => doAction(selected.flagged ? "unflag" : "flag", selected.uid)}
                  disabled={actionBusy}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${selected.flagged ? "border-amber-200 bg-amber-50 text-amber-700" : "border-slate-200 bg-white text-[#64748B] hover:bg-slate-50"}`}>
                  {selected.flagged ? <StarOff className="h-3.5 w-3.5" /> : <Star className="h-3.5 w-3.5" />}
                  {selected.flagged ? "Unstar" : "Star"}
                </button>

                <button type="button" onClick={() => doAction("trash", selected.uid)} disabled={actionBusy}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-60">
                  <Trash2 className="h-3.5 w-3.5" />Delete
                </button>
              </div>
            </div>

            {/* Message content */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <h1 className="text-xl font-bold text-[#0F172A]">{selected.subject}</h1>

              {/* Sender row */}
              <div className="mt-4 flex items-start gap-3">
                <Avatar name={selected.fromName} email={selected.from} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <span className="font-semibold text-[#0F172A]">{selected.fromName || selected.from}</span>
                    {selected.fromName && <span className="text-xs text-[#94A3B8]">&lt;{selected.from}&gt;</span>}
                  </div>
                  <div className="mt-0.5 text-xs text-[#94A3B8]">
                    To: {selected.to}
                    {selected.cc && <> · Cc: {selected.cc}</>}
                    <> · {formatDateFull(selected.date)}</>
                  </div>
                </div>
              </div>

              <div className="my-5 h-px bg-slate-100" />

              {/* Body */}
              {selected.bodyHtml ? (
                <div
                  className="email-body prose prose-sm max-w-none text-[#334155]"
                  dangerouslySetInnerHTML={{
                    __html: selected.bodyHtml
                      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
                      .replace(/javascript:/gi, ""),
                  }}
                />
              ) : (
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-[#334155]">
                  {selected.bodyText || "(empty message)"}
                </pre>
              )}

              {/* Attachments */}
              {selected.attachments.length > 0 && (
                <div className="mt-6">
                  <div className="mb-2 text-xs font-semibold text-[#64748B]">
                    {selected.attachments.length} attachment{selected.attachments.length !== 1 ? "s" : ""}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selected.attachments.map((att, i) => (
                      <div key={i} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                        <Paperclip className="h-3.5 w-3.5 text-[#94A3B8]" />
                        <span className="text-xs font-medium text-[#0F172A]">{att.filename}</span>
                        <span className="text-[10px] text-[#94A3B8]">{formatBytes(att.size)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Reply panel */}
            {replyOpen && (
              <div className="shrink-0 border-t border-slate-200/70 bg-[#F8FAFC]">
                <form onSubmit={handleReply} className="p-4 space-y-3">
                  <div className="text-xs font-semibold text-[#64748B]">
                    Replying to {selected.replyTo || selected.from}
                  </div>
                  <textarea
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    required
                    rows={4}
                    className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#0F172A] outline-none transition focus:border-[#FF914D]"
                    placeholder="Write your reply…"
                  />
                  <div className="flex items-center gap-2">
                    <button type="submit" disabled={replySending}
                      className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF914D] to-[#FF7A2F] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(255,145,77,0.28)] disabled:opacity-60">
                      {replySending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      {replySending ? "Sending…" : "Send reply"}
                    </button>
                    <button type="button" onClick={() => setReplyOpen(false)}
                      className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-[#64748B] hover:bg-white">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}