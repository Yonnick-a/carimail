"use client";
// components/mail/InboxClient.tsx
import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  AlertCircle, Archive, Calendar, Check, ChevronLeft, ChevronRight,
  Bell, Clock, Copy, Download, ExternalLink, Eye, EyeOff, Forward, Inbox,
  Loader2, Mail, MailOpen, MailX, Maximize2, MoveRight, Paperclip,
  Printer, RefreshCw, Reply, ReplyAll, Send,
  Star, StarOff, Tag, Trash2, Video, X, ZoomIn, ZoomOut,
} from "lucide-react";
import { extractMeetingLinksFromHtml, type MeetingLink } from "@/lib/mail/calendar";
import { CATEGORY_LABELS, type Category } from "@/lib/mail/categorize";
import Link from "next/link";
import { useMailFocus } from "./MailFocusContext";

type Message = {
  uid: number; seq: number; subject: string;
  from: string; fromName: string; to: string;
  date: string; seen: boolean; flagged: boolean;
  hasAttachment: boolean; size?: number; messageId?: string;
  conversationId?: string; threadCount?: number; snippet?: string;
};
type MessageFull = Message & {
  cc: string; replyTo: string;
  inReplyTo?: string; references?: string;
  bodyHtml: string | null; bodyText: string | null;
  attachments: { id: number; filename: string; size: number; contentType: string }[];
  threadMessages?: Message[];
};
type WorkspaceMode = "split" | "focus" | "compact";
type MailFilter = "all" | "unread" | "starred" | "attachments" | "billing" | "security" | "support";
type FolderOption = { path: string; name: string };

function buildSrcDoc(html: string, fontSize: number, showImages: boolean): string {
  let body = html;
  if (!showImages) {
    body = body.replace(
      /<img\b[^>]*>/gi,
      `<span style="display:inline-flex;align-items:center;gap:4px;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:6px;padding:3px 8px;font-size:11px;color:#94a3b8">[image hidden]</span>`
    );
  }
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="referrer" content="no-referrer"><style>
    *{box-sizing:border-box;max-width:100%}
    body{margin:0;padding:0;font-family:system-ui,-apple-system,sans-serif;font-size:${fontSize}px;line-height:1.7;color:#1e293b;word-break:break-word;overflow-x:hidden}
    a{color:#0044bc;text-decoration:underline}
    img{height:auto;max-width:100%;display:inline-block}
    pre{white-space:pre-wrap;word-break:break-word;background:#f8fafc;padding:12px;border-radius:8px;font-size:13px;overflow-x:auto}
    blockquote{border-left:3px solid #cbd5e1;padding-left:12px;margin:8px 0;color:#64748b}
    table{border-collapse:collapse;max-width:100%}
    td,th{padding:4px 8px;vertical-align:top}
    hr{border:none;border-top:1px solid #e2e8f0;margin:12px 0}
  </style></head><body>${body}</body></html>`;
}

function EmailIframe({ html, fontSize, showImages }: { html: string; fontSize: number; showImages: boolean }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const srcDoc = buildSrcDoc(html, fontSize, showImages);

  function resize() {
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument) return;
    const h = iframe.contentDocument.documentElement.scrollHeight;
    iframe.style.height = `${Math.max(120, h)}px`;
  }

  return (
    <iframe
      ref={iframeRef}
      sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin"
      srcDoc={srcDoc}
      title="Email content"
      className="email-iframe"
      onLoad={resize}
    />
  );
}

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
function senderDomain(email: string) {
  return email.includes("@") ? email.split("@").pop() || "" : "";
}
function smartTags(msg: Message | MessageFull) {
  const subject = msg.subject.toLowerCase();
  const tags: string[] = [];
  if (msg.flagged) tags.push("Priority");
  if (!msg.seen) tags.push("Unread");
  if (msg.hasAttachment) tags.push("Attachment");
  if (/(invoice|receipt|payment|billing|paid|subscription)/.test(subject)) tags.push("Billing");
  if (/(security|login|password|verify|2fa|alert)/.test(subject)) tags.push("Security");
  if (/(support|ticket|case|request)/.test(subject)) tags.push("Support");
  return tags.slice(0, 3);
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

const MEETING_ICON: Record<string, typeof Video> = { zoom: Video, meet: Video, teams: Video, webex: Video };

function CalendarCard({ msg }: { msg: MessageFull }) {
  const hasIcs = msg.attachments.some(a =>
    a.contentType.includes("calendar") || a.contentType.includes("ics") ||
    a.filename.toLowerCase().endsWith(".ics")
  );
  const links = msg.bodyHtml ? extractMeetingLinksFromHtml(msg.bodyHtml) : [];

  if (!hasIcs && links.length === 0) return null;

  return (
    <div className="mb-5 overflow-hidden rounded-2xl border"
      style={{ borderColor: "rgba(59,130,246,0.25)", background: "rgba(59,130,246,0.05)" }}>
      <div className="flex items-center gap-2.5 border-b px-4 py-3"
        style={{ borderColor: "rgba(59,130,246,0.15)" }}>
        <Calendar className="h-4 w-4 shrink-0" style={{ color: "#3b82f6" }} />
        <span className="text-[13px] font-[700]" style={{ color: "var(--cm-text)" }}>
          {hasIcs ? "Calendar invite" : "Meeting link detected"}
        </span>
        {hasIcs && (
          <span className="rounded-full px-2 py-0.5 text-[10px] font-[700]"
            style={{ background: "rgba(59,130,246,0.12)", color: "#3b82f6" }}>
            .ics attached
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2 px-4 py-3">
        {links.map((link, i) => {
          const Icon = MEETING_ICON[link.type] ?? ExternalLink;
          return (
            <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[12.5px] font-[700] transition hover:-translate-y-0.5"
              style={{ borderColor: "rgba(59,130,246,0.30)", background: "var(--cm-surface)", color: "#3b82f6",
                       boxShadow: "0 2px 8px rgba(59,130,246,0.10)" }}>
              <Icon className="h-3.5 w-3.5" />
              {link.label}
            </a>
          );
        })}
        {/* Google Calendar deep-link if we have ICS */}
        {hasIcs && (
          <a href={`https://calendar.google.com`} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[12.5px] font-[700] transition hover:-translate-y-0.5"
            style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)", color: "var(--cm-text2)" }}>
            <Calendar className="h-3.5 w-3.5" />
            Open Google Calendar
          </a>
        )}
      </div>
    </div>
  );
}

export default function InboxClient({ accountId, folder }: { accountId: string | null; folder: string }) {
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
  const [listWidth, setListWidth] = useState(380);
  const [resizing, setResizing] = useState(false);
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>("split");
  const [mailFilter, setMailFilter] = useState<MailFilter>("all");
  const [folders, setFolders] = useState<FolderOption[]>([]);
  const [previewAttachment, setPreviewAttachment] = useState<{ filename: string; url: string; contentType: string } | null>(null);
  const [snoozeOpen, setSnoozeOpen] = useState(false);
  const [reminderOpen, setReminderOpen] = useState(false);
  const [categories, setCategories] = useState<Record<number, Category>>({});
  const [featureDate, setFeatureDate] = useState("");
  const [featureNote, setFeatureNote] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const replyRef = useRef<HTMLTextAreaElement>(null);
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const { focusMode, setFocusMode } = useMailFocus();

  function notify(msg: string, type: "ok" | "err" = "ok") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  useEffect(() => {
    const saved = localStorage.getItem("carimail-workspace-mode") as WorkspaceMode | null;
    if (saved === "split" || saved === "focus" || saved === "compact") setWorkspaceMode(saved);
  }, []);

  function changeWorkspaceMode(mode: WorkspaceMode) {
    setWorkspaceMode(mode);
    localStorage.setItem("carimail-workspace-mode", mode);
  }

  function indexContacts(msgs: Message[]) {
    try {
      const raw = localStorage.getItem("carimail-contacts");
      const existing: Record<string, { email: string; name: string }> = {};
      if (raw) {
        (JSON.parse(raw) as { email: string; name: string }[]).forEach(c => { existing[c.email] = c; });
      }
      msgs.forEach(m => {
        if (m.from && !existing[m.from]) existing[m.from] = { email: m.from, name: m.fromName || "" };
      });
      const list = Object.values(existing).slice(0, 500);
      localStorage.setItem("carimail-contacts", JSON.stringify(list));
    } catch {}
  }

  const load = useCallback(async (p: number, silent = false) => {
    if (!accountId) return;
    if (!silent) setLoading(true);
    setError("");
    try {
      const url = searchQ
        ? `/api/mail/messages?accountId=${accountId}&action=search&folder=${encodeURIComponent(folder)}&q=${encodeURIComponent(searchQ)}`
        : `/api/mail/messages?accountId=${accountId}&folder=${encodeURIComponent(folder)}&page=${p}&pageSize=${PAGE_SIZE}`;
      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Failed to load.");
      const msgs: Message[] = data.messages || [];
      setMessages(msgs);
      setTotal(data.total || msgs.length);
      indexContacts(msgs);
      // Kick off async categorisation (fire and forget)
      if (msgs.length > 0 && accountId) {
        fetch("/api/mail/categorize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            accountId,
            folder,
            messages: msgs.slice(0, 30).map(m => ({
              uid: m.uid, subject: m.subject, from: m.from, snippet: m.snippet ?? "",
            })),
          }),
        })
          .then(r => r.json())
          .then(d => {
            if (d.ok && d.categories) {
              setCategories(prev => {
                const next = { ...prev };
                for (const [uid, cat] of Object.entries(d.categories)) {
                  next[Number(uid)] = cat as Category;
                }
                return next;
              });
            }
          })
          .catch(() => {});
      }
      // Browser notifications for new unseen messages during silent refresh
      if (silent && "Notification" in window && Notification.permission === "granted") {
        const unseen = msgs.filter(m => !m.seen).slice(0, 3);
        unseen.forEach(m => {
          try {
            new Notification(`New mail: ${m.fromName || m.from}`, {
              body: m.subject,
              icon: "/logo.webp",
              tag: `carimail-${accountId}-${m.uid}`,
              silent: false,
            });
          } catch {}
        });
      }
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to load messages."); }
    finally { if (!silent) setLoading(false); }
  }, [accountId, folder, searchQ]);

  useEffect(() => { setSelected(null); setPage(1); setSelectedUids(new Set()); load(1); }, [accountId, folder, searchQ, load]);

  useEffect(() => {
    if (!accountId) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") load(page, true);
    }, 15000);
    return () => window.clearInterval(id);
  }, [accountId, page, load]);

  useEffect(() => {
    if (!accountId) return;
    fetch(`/api/mail/messages?accountId=${accountId}&action=folders`, { cache: "no-store" })
      .then(res => res.json())
      .then(data => { if (data.ok) setFolders(data.folders || []); })
      .catch(() => {});
  }, [accountId]);

  useEffect(() => {
    if (!resizing) return;
    function onMove(e: MouseEvent) {
      const left = rootRef.current?.getBoundingClientRect().left ?? 0;
      const max = Math.min(560, window.innerWidth - left - 420);
      setListWidth(Math.max(280, Math.min(max, e.clientX - left)));
    }
    function onUp() { setResizing(false); }
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [resizing]);

  // Keyboard shortcuts in reader
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.contentEditable === "true") return;
      if (e.key === "z" && selected) setFocusMode(!focusMode);
      if (selected) {
        if (e.key === "r") openReply("reply");
        if (e.key === "a") openReply("reply-all");
        if (e.key === "f") openReply("forward");
        if (e.key === "s") doAction(selected.flagged ? "unflag" : "flag", selected.uid);
        if (e.key === "Delete" || e.key === "Backspace") doAction("trash", selected.uid);
        if (e.key === "Escape") { if (focusMode) setFocusMode(false); else setSelected(null); }
      }
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, focusMode]);

  async function openMessage(msg: Message) {
    if (!accountId) return;
    setMsgLoading(true); setSelected(null); setReplyOpen(false);
    try {
      const res = await fetch(`/api/mail/messages?accountId=${accountId}&action=message&folder=${encodeURIComponent(folder)}&uid=${msg.uid}${msg.conversationId ? `&conversationId=${encodeURIComponent(msg.conversationId)}` : ""}`, { cache: "no-store" });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Failed.");
      setSelected(data.message);
      setMessages(prev => prev.map(m => m.uid === msg.uid ? { ...m, seen: true } : m));
      if (!msg.seen) window.dispatchEvent(new Event("carimail:mailbox-changed"));
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
      window.dispatchEvent(new Event("carimail:mailbox-changed"));
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
    window.dispatchEvent(new Event("carimail:mailbox-changed"));
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
    else { setSelectedUids(new Set(visibleMessages.map(m => m.uid))); setSelectAll(true); }
  }

  function attachmentUrl(att: MessageFull["attachments"][number]) {
    if (!accountId || !selected) return "#";
    return `/api/mail/messages?accountId=${accountId}&action=attachment&folder=${encodeURIComponent(folder)}&uid=${selected.uid}&attachmentId=${att.id}`;
  }

  async function createFeature(action: string, payload: object) {
    if (!accountId || !selected) return;
    const res = await fetch("/api/mail/features", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, accountId, folder, uid: selected.uid, ...payload }),
    });
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || "Action failed.");
  }

  function defaultDateTime(hours = 1) {
    const date = new Date(Date.now() + hours * 60 * 60 * 1000);
    date.setMinutes(Math.ceil(date.getMinutes() / 15) * 15, 0, 0);
    const pad = (value: number) => String(value).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  function openSnoozeModal() {
    setFeatureDate(defaultDateTime(4));
    setSnoozeOpen(true);
  }

  function openReminderModal() {
    setFeatureDate(defaultDateTime(24));
    setFeatureNote(selected?.subject || "");
    setReminderOpen(true);
  }

  async function snoozeSelected(value: string) {
    if (!value) return;
    try {
      await createFeature("snooze", { until: new Date(value).toISOString() });
      setSnoozeOpen(false);
      notify("Message snoozed");
      setSelected(null);
      load(page, true);
    } catch (err) { notify(err instanceof Error ? err.message : "Snooze failed", "err"); }
  }

  async function remindSelected(value: string, note: string) {
    if (!value) return;
    try {
      await createFeature("reminder", { remindAt: new Date(value).toISOString(), note: note || selected?.subject });
      setReminderOpen(false);
      notify("Reminder saved");
    } catch (err) { notify(err instanceof Error ? err.message : "Reminder failed", "err"); }
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
  // In focus mode with an email open, hide the list entirely
  const showListWithReader = focusMode && selected ? false : workspaceMode !== "focus";
  const visibleMessages = messages.filter((msg) => {
    if (mailFilter === "all") return true;
    if (mailFilter === "unread") return !msg.seen;
    if (mailFilter === "starred") return msg.flagged;
    if (mailFilter === "attachments") return msg.hasAttachment;
    return smartTags(msg).map(tag => tag.toLowerCase()).includes(mailFilter);
  });
  const listClass = selected || msgLoading
    ? showListWithReader ? "hidden md:flex" : "hidden"
    : `flex flex-1 md:flex-none ${workspaceMode === "compact" ? "md:w-[300px] lg:w-[330px]" : "md:w-[340px] lg:w-[380px]"}`;
  const listRowPadding = workspaceMode === "compact" ? "px-3 py-2.5" : "px-4 py-3";

  // Focus mode prev/next navigation
  const selectedIdx = visibleMessages.findIndex(m => m.uid === selected?.uid);
  function goToPrev() { if (selectedIdx > 0) openMessage(visibleMessages[selectedIdx - 1]); }
  function goToNext() { if (selectedIdx < visibleMessages.length - 1) openMessage(visibleMessages[selectedIdx + 1]); }

  // J / K keyboard nav (declared after visibleMessages/selectedIdx to avoid temporal dead zone)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (!selected) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.contentEditable === "true") return;
      if (e.key === "j" && selectedIdx < visibleMessages.length - 1) openMessage(visibleMessages[selectedIdx + 1]);
      if (e.key === "k" && selectedIdx > 0) openMessage(visibleMessages[selectedIdx - 1]);
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, selectedIdx, visibleMessages]);

  return (
    <div ref={rootRef} className="flex min-h-0 flex-1 overflow-hidden">

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

      {previewAttachment && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 p-3 sm:p-6">
          <div className="flex h-[86vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border shadow-2xl" style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)" }}>
            <div className="flex shrink-0 items-center justify-between gap-3 border-b px-4 py-3" style={{ borderColor: "var(--cm-border)" }}>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-[800]" style={{ color: "var(--cm-text)" }}>{previewAttachment.filename}</p>
                <p className="text-[11px]" style={{ color: "var(--cm-text3)" }}>{previewAttachment.contentType || "Attachment preview"}</p>
              </div>
              <div className="flex items-center gap-2">
                <a href={previewAttachment.url.replace("&preview=1", "")} className={toolBtnBase} style={{ borderColor: "var(--cm-border)", color: "var(--cm-text2)" }}>
                  <Download className="h-3.5 w-3.5" />Download
                </a>
                <button type="button" onClick={() => setPreviewAttachment(null)} className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ color: "var(--cm-text3)" }}>
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <iframe title={previewAttachment.filename} src={previewAttachment.url} className="min-h-0 flex-1 bg-white" />
          </div>
        </div>
      )}

      {(snoozeOpen || reminderOpen) && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border shadow-2xl" style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)" }}>
            <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: "var(--cm-border)" }}>
              <div>
                <p className="text-[15px] font-[900]" style={{ color: "var(--cm-text)" }}>{snoozeOpen ? "Snooze message" : "Set reminder"}</p>
                <p className="mt-0.5 text-[12.5px]" style={{ color: "var(--cm-text3)" }}>{selected?.subject}</p>
              </div>
              <button type="button" onClick={() => { setSnoozeOpen(false); setReminderOpen(false); }} className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ color: "var(--cm-text3)" }}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4 px-5 py-5">
              <label className="block">
                <span className="text-[12px] font-[800]" style={{ color: "var(--cm-text2)" }}>{snoozeOpen ? "Return to inbox" : "Remind me"}</span>
                <input type="datetime-local" value={featureDate} onChange={e => setFeatureDate(e.target.value)} className="mt-2 w-full rounded-xl border px-3 py-2.5 text-[14px] outline-none" style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface2)", color: "var(--cm-text)" }} />
              </label>
              {reminderOpen && (
                <label className="block">
                  <span className="text-[12px] font-[800]" style={{ color: "var(--cm-text2)" }}>Note</span>
                  <textarea value={featureNote} onChange={e => setFeatureNote(e.target.value)} rows={3} className="mt-2 w-full resize-none rounded-xl border px-3 py-2.5 text-[14px] outline-none" style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface2)", color: "var(--cm-text)" }} />
                </label>
              )}
              <div className="flex flex-wrap gap-2">
                {[
                  ["Later today", 4],
                  ["Tomorrow", 24],
                  ["Next week", 24 * 7],
                ].map(([label, hours]) => (
                  <button key={String(label)} type="button" onClick={() => setFeatureDate(defaultDateTime(Number(hours)))} className="rounded-xl border px-3 py-2 text-[12px] font-[800]" style={{ borderColor: "var(--cm-border)", color: "var(--cm-text2)" }}>{label}</button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t px-5 py-4" style={{ borderColor: "var(--cm-border)" }}>
              <button type="button" onClick={() => { setSnoozeOpen(false); setReminderOpen(false); }} className="rounded-xl border px-4 py-2 text-[13px] font-[800]" style={{ borderColor: "var(--cm-border)", color: "var(--cm-text2)" }}>Cancel</button>
              <button type="button" onClick={() => snoozeOpen ? snoozeSelected(featureDate) : remindSelected(featureDate, featureNote)} className="rounded-xl px-4 py-2 text-[13px] font-[900] text-white" style={{ background: "var(--cm-blue)" }}>
                {snoozeOpen ? "Snooze" : "Save reminder"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message list */}
      <div
        className={`flex flex-col border-r ${listClass}`}
        style={{
          borderColor: "var(--cm-border)",
          background: "var(--cm-surface)",
          width: (selected || msgLoading) && showListWithReader ? listWidth : undefined,
          minWidth: (selected || msgLoading) && showListWithReader ? 280 : undefined,
          maxWidth: (selected || msgLoading) && showListWithReader ? 560 : undefined,
        }}
      >

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
            <button type="button" onClick={() => load(page)} disabled={loading}
              className="rounded-lg p-1.5 transition" style={{ color: "var(--cm-text3)" }}
              onMouseEnter={e => { e.currentTarget.style.background = "var(--cm-hover-bg)"; e.currentTarget.style.color = "var(--cm-blue)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--cm-text3)"; }}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Select all row */}
        {messages.length > 0 && (
          <div className="flex shrink-0 items-center justify-between gap-3 border-b px-4 py-2" style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface2)" }}>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={selectAll} onChange={toggleSelectAll} className="rounded border cursor-pointer" style={{ accentColor: "var(--cm-blue)", borderColor: "var(--cm-border2)" }} />
              <span className="text-[10.5px]" style={{ color: "var(--cm-text3)" }}>{selectAll ? "Deselect all" : "Select all"}</span>
            </label>
            <div className="hidden rounded-xl border p-0.5 sm:flex" style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)" }}>
              {(["split", "focus", "compact"] as const).map(mode => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => changeWorkspaceMode(mode)}
                  className="rounded-lg px-2.5 py-1 text-[10.5px] font-[700] transition"
                  style={{
                    background: workspaceMode === mode ? "var(--cm-blue)" : "transparent",
                    color: workspaceMode === mode ? "#fff" : "var(--cm-text3)",
                  }}
                >
                  {mode === "focus" ? "Reader" : mode === "split" ? "Split" : "Compact"}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.length > 0 && (
          <div className="flex shrink-0 gap-1 overflow-x-auto border-b px-4 py-2" style={{ borderColor: "var(--cm-border)" }}>
            {([
              ["all", "All"],
              ["unread", "Unread"],
              ["starred", "Starred"],
              ["attachments", "Files"],
              ["billing", "Billing"],
              ["security", "Security"],
              ["support", "Support"],
            ] as [MailFilter, string][]).map(([filter, label]) => (
              <button
                key={filter}
                type="button"
                onClick={() => setMailFilter(filter)}
                className="shrink-0 rounded-full border px-2.5 py-1 text-[10.5px] font-[700] transition"
                style={{
                  borderColor: mailFilter === filter ? "var(--cm-blue)" : "var(--cm-border)",
                  background: mailFilter === filter ? "var(--cm-blue-light)" : "var(--cm-surface)",
                  color: mailFilter === filter ? "var(--cm-blue)" : "var(--cm-text3)",
                }}
              >
                {label}
              </button>
            ))}
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
          ) : visibleMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-center px-6">
              <Inbox className="h-10 w-10" style={{ color: "var(--cm-border2)" }} />
              <p className="text-[13px]" style={{ color: "var(--cm-text3)" }}>{searchQ ? "No results found." : mailFilter === "all" ? "Nothing here yet." : "No messages match this filter."}</p>
            </div>
          ) : (
            visibleMessages.map(msg => {
              const isActive = selected?.uid === msg.uid;
              const isChecked = selectedUids.has(msg.uid);
              return (
                <div key={msg.uid} className={`msg-item group relative border-b ${isActive ? "active" : ""}`}
                  style={{ borderColor: "var(--cm-divider)" }} onClick={() => isActive ? setSelected(null) : openMessage(msg)}>
                  {!msg.seen && <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r-full" style={{ background: "var(--cm-unread-dot)" }} />}
                  {/* Quick hover actions */}
                  <div className="absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 group-hover:flex" onClick={e => e.stopPropagation()}>
                    <button type="button" title={msg.flagged ? "Unstar" : "Star"} onClick={() => doAction(msg.flagged ? "unflag" : "flag", msg.uid)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg transition hover:scale-110 no-transition"
                      style={{ color: msg.flagged ? "var(--cm-starred)" : "var(--cm-text3)", background: "var(--cm-surface)" }}>
                      <Star className="h-3.5 w-3.5" />
                    </button>
                    <button type="button" title="Archive" onClick={() => doAction("archive", msg.uid)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg transition hover:scale-110 no-transition"
                      style={{ color: "var(--cm-text3)", background: "var(--cm-surface)" }}>
                      <Archive className="h-3.5 w-3.5" />
                    </button>
                    <button type="button" title="Delete" onClick={() => doAction("trash", msg.uid)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg transition hover:scale-110 no-transition"
                      style={{ color: "#ef4444", background: "var(--cm-surface)" }}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className={`flex items-start gap-2.5 ${listRowPadding}`}>
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
                      {msg.snippet && workspaceMode !== "compact" && (
                        <div className="mt-0.5 line-clamp-2 text-[10.5px] leading-snug" style={{ color: "var(--cm-text3)" }}>
                          {msg.snippet}
                        </div>
                      )}
                      {workspaceMode !== "compact" && (
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          {smartTags(msg).map(tag => (
                            <span key={tag} className="rounded-full px-1.5 py-0.5 text-[9px] font-[700]" style={{ background: "var(--cm-surface3)", color: "var(--cm-text3)" }}>{tag}</span>
                          ))}
                          {categories[msg.uid] && categories[msg.uid] !== "primary" && (() => {
                            const c = CATEGORY_LABELS[categories[msg.uid]];
                            return (
                              <span className="rounded-full px-1.5 py-0.5 text-[9px] font-[700]"
                                style={{ background: c.bg, color: c.color }}>{c.label}</span>
                            );
                          })()}
                        </div>
                      )}
                      <div className="mt-1 flex items-center gap-1.5">
                        {!msg.seen && <div className="unread-dot" />}
                        {msg.flagged && <Star className="h-3 w-3" style={{ color: "var(--cm-starred)" }} />}
                        {msg.hasAttachment && <Paperclip className="h-3 w-3" style={{ color: "var(--cm-text3)" }} />}
                        {msg.threadCount && msg.threadCount > 1 && <span className="rounded-full px-1.5 py-0.5 text-[9px] font-[800]" style={{ background: "var(--cm-blue-light)", color: "var(--cm-blue)" }}>{msg.threadCount}</span>}
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

      {(selected || msgLoading) && showListWithReader && (
        <button
          type="button"
          aria-label="Resize message list"
          onMouseDown={() => setResizing(true)}
          className="hidden w-1 shrink-0 cursor-col-resize transition hover:bg-orange-400/40 md:block"
          style={{ background: resizing ? "var(--cm-accent)" : "transparent" }}
        />
      )}

      {/* Message reader */}
      <div className={`relative flex min-w-0 flex-1 flex-col ${!selected && !msgLoading ? "hidden md:flex" : "flex"}`}
        style={{ background: "var(--cm-bg)" }}>

        {/* Focus mode HUD */}
        {focusMode && selected && (
          <div className="flex shrink-0 items-center gap-2 border-b px-4 py-2"
            style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)" }}>
            {/* Left: back + counter + nav */}
            <button type="button" onClick={() => setFocusMode(false)}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-[600] transition"
              style={{ color: "var(--cm-text2)" }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--cm-hover-bg)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
              <ChevronLeft className="h-3.5 w-3.5" />
              List
            </button>
            <div className="h-4 w-px" style={{ background: "var(--cm-border)" }} />
            <span className="text-[11.5px] font-[600] tabular-nums" style={{ color: "var(--cm-text3)" }}>
              {selectedIdx + 1} / {visibleMessages.length}
            </span>
            <button type="button" onClick={goToPrev} disabled={selectedIdx <= 0}
              className="flex h-7 w-7 items-center justify-center rounded-lg transition disabled:opacity-30"
              style={{ color: "var(--cm-text2)" }}
              onMouseEnter={e => { if (selectedIdx > 0) e.currentTarget.style.background = "var(--cm-hover-bg)"; }}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button type="button" onClick={goToNext} disabled={selectedIdx >= visibleMessages.length - 1}
              className="flex h-7 w-7 items-center justify-center rounded-lg transition disabled:opacity-30"
              style={{ color: "var(--cm-text2)" }}
              onMouseEnter={e => { if (selectedIdx < visibleMessages.length - 1) e.currentTarget.style.background = "var(--cm-hover-bg)"; }}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>

            {/* Right: quick actions + hint */}
            <div className="ml-auto flex items-center gap-1">
              <button type="button" onClick={() => openReply("reply")}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-[600] transition"
                style={{ color: "var(--cm-text2)" }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--cm-hover-bg)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                <Reply className="h-3.5 w-3.5" />Reply
              </button>
              <button type="button" onClick={() => doAction("archive", selected.uid)}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-[600] transition"
                style={{ color: "var(--cm-text2)" }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--cm-hover-bg)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                <Archive className="h-3.5 w-3.5" />Archive
              </button>
              <button type="button" onClick={() => doAction(selected.flagged ? "unflag" : "flag", selected.uid)}
                className="flex h-7 w-7 items-center justify-center rounded-lg transition"
                style={{ color: selected.flagged ? "var(--cm-starred)" : "var(--cm-text2)" }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--cm-hover-bg)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                {selected.flagged ? <Star className="h-3.5 w-3.5 fill-current" /> : <Star className="h-3.5 w-3.5" />}
              </button>
              <div className="mx-1 h-4 w-px" style={{ background: "var(--cm-border)" }} />
              <span className="mr-2 hidden text-[11px] lg:block" style={{ color: "var(--cm-text3)" }}>
                <kbd className="rounded border px-1 py-0.5 text-[10px]" style={{ borderColor: "var(--cm-border2)", background: "var(--cm-surface2)" }}>Z</kbd> exit ·{" "}
                <kbd className="rounded border px-1 py-0.5 text-[10px]" style={{ borderColor: "var(--cm-border2)", background: "var(--cm-surface2)" }}>J</kbd>/<kbd className="rounded border px-1 py-0.5 text-[10px]" style={{ borderColor: "var(--cm-border2)", background: "var(--cm-surface2)" }}>K</kbd> nav
              </span>
              <button type="button" onClick={() => setFocusMode(false)}
                className="flex h-7 items-center gap-1.5 rounded-lg border px-2.5 text-[11px] font-[700] transition"
                style={{ borderColor: "var(--cm-border)", color: "var(--cm-text3)", background: "var(--cm-surface2)" }}>
                Exit focus
              </button>
            </div>
          </div>
        )}

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
            {/* Toolbar — hidden in focus mode (HUD replaces it) */}
            <div className={`flex shrink-0 flex-wrap items-center gap-1.5 border-b px-4 py-2.5 ${focusMode ? "hidden" : ""}`}
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
                      <span className={mode === "reply" ? "hidden sm:inline" : "hidden sm:inline"}>{label}</span>
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

              <label className={`hidden sm:inline-flex ${toolBtnBase} max-w-[160px]`} style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)", color: "var(--cm-text2)" }}>
                <MoveRight className="h-3.5 w-3.5" />
                <select
                  value=""
                  disabled={actionBusy}
                  onChange={e => {
                    if (!e.target.value) return;
                    doAction("move", selected.uid, { destination: e.target.value });
                    e.target.value = "";
                  }}
                  className="min-w-0 bg-transparent text-[11.5px] font-[700] outline-none"
                  style={{ color: "inherit" }}
                >
                  <option value="">Move</option>
                  {folders.filter(f => f.path !== folder).map(f => (
                    <option key={f.path} value={f.path}>{f.name}</option>
                  ))}
                </select>
              </label>

              <button type="button" onClick={openSnoozeModal} disabled={actionBusy}
                className={`hidden sm:inline-flex ${toolBtnBase}`} style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)", color: "var(--cm-text2)" }}>
                <Clock className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">Snooze</span>
              </button>

              <button type="button" onClick={openReminderModal} disabled={actionBusy}
                className={`hidden sm:inline-flex ${toolBtnBase}`} style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)", color: "var(--cm-text2)" }}>
                <Bell className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">Remind</span>
              </button>

              <div className="ml-auto flex items-center gap-1">
                {/* Focus Mode — the main entry point */}
                <button
                  type="button"
                  onClick={() => setFocusMode(true)}
                  title="Focus mode (Z) — distraction-free reading"
                  className="hidden items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-[11.5px] font-[700] transition sm:flex"
                  style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface2)", color: "var(--cm-text2)" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--cm-accent-b)"; (e.currentTarget as HTMLElement).style.color = "var(--cm-accent)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--cm-border)"; (e.currentTarget as HTMLElement).style.color = "var(--cm-text2)"; }}
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                  <span className="hidden lg:inline">Focus</span>
                  <kbd className="hidden rounded border px-1 py-0.5 text-[9px] lg:inline" style={{ borderColor: "var(--cm-border2)", background: "var(--cm-surface3)" }}>Z</kbd>
                </button>
                <div className="mx-1 hidden h-4 w-px sm:block" style={{ background: "var(--cm-border)" }} />
                <button type="button" onClick={() => setFontSize(s => Math.max(11, s - 1))} title="Smaller" className="flex h-7 w-7 items-center justify-center rounded-lg transition" style={{ color: "var(--cm-text3)" }} onMouseEnter={e => (e.currentTarget.style.background = "var(--cm-hover-bg)")} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}><ZoomOut className="h-3.5 w-3.5" /></button>
                <button type="button" onClick={() => setFontSize(s => Math.min(22, s + 1))} title="Larger" className="flex h-7 w-7 items-center justify-center rounded-lg transition" style={{ color: "var(--cm-text3)" }} onMouseEnter={e => (e.currentTarget.style.background = "var(--cm-hover-bg)")} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}><ZoomIn className="h-3.5 w-3.5" /></button>
                <button type="button" onClick={() => setShowImages(v => !v)} title={showImages ? "Hide images" : "Show images"} className="flex h-7 w-7 items-center justify-center rounded-lg transition" style={{ color: "var(--cm-text3)" }} onMouseEnter={e => (e.currentTarget.style.background = "var(--cm-hover-bg)")} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>{showImages ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}</button>
                <button type="button" onClick={() => window.print()} title="Print" className="hidden h-7 w-7 items-center justify-center rounded-lg transition lg:flex" style={{ color: "var(--cm-text3)" }} onMouseEnter={e => (e.currentTarget.style.background = "var(--cm-hover-bg)")} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}><Printer className="h-3.5 w-3.5" /></button>
                <button type="button" onClick={() => setViewSource(v => !v)} title="View source" className="hidden h-7 w-7 items-center justify-center rounded-lg transition lg:flex" style={{ color: viewSource ? "var(--cm-accent)" : "var(--cm-text3)" }} onMouseEnter={e => (e.currentTarget.style.background = "var(--cm-hover-bg)")} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}><Tag className="h-3.5 w-3.5" /></button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-x-hidden overflow-y-auto">
              <div className={`mx-auto grid w-full gap-5 px-4 py-5 sm:px-8 sm:py-7 ${focusMode ? "max-w-3xl" : workspaceMode === "compact" ? "max-w-3xl" : "max-w-6xl xl:grid-cols-[minmax(0,1fr)_280px]"}`}>
                <article className="min-w-0 overflow-hidden">
                <h1 className="break-words text-[18px] font-[800] leading-tight tracking-tight sm:text-[20px]" style={{ color: "var(--cm-text)" }}>{selected.subject}</h1>

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

                <CalendarCard msg={selected} />

                {viewSource ? (
                  <pre className="overflow-x-auto rounded-xl border p-4 text-[12px] leading-relaxed font-mono"
                    style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface2)", color: "var(--cm-text2)" }}>
                    {selected.bodyHtml || selected.bodyText || "(empty)"}
                  </pre>
                ) : selected.bodyHtml ? (
                  <EmailIframe html={selected.bodyHtml} fontSize={fontSize} showImages={showImages} />
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
                          <button type="button" onClick={() => setPreviewAttachment({ filename: att.filename, contentType: att.contentType, url: `${attachmentUrl(att)}&preview=1` })} title="Preview" className="ml-1 text-[10px] font-[800] transition hover:opacity-70" style={{ color: "var(--cm-blue)" }}>Preview</button>
                          <a href={attachmentUrl(att)} title="Download" className="ml-1 transition hover:opacity-70" style={{ color: "var(--cm-text3)" }}><Download className="h-3.5 w-3.5" /></a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selected.threadMessages && selected.threadMessages.length > 1 && (
                  <div className="mt-7 border-t pt-5" style={{ borderColor: "var(--cm-border)" }}>
                    <p className="mb-3 text-[11.5px] font-[700] uppercase tracking-[0.12em]" style={{ color: "var(--cm-text3)" }}>
                      Conversation
                    </p>
                    <div className="space-y-2">
                      {selected.threadMessages.map(item => (
                        <button
                          key={`${item.uid}-${item.date}`}
                          type="button"
                          onClick={() => openMessage(item)}
                          className="flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition hover:opacity-80"
                          style={{
                            borderColor: item.uid === selected.uid ? "var(--cm-blue)" : "var(--cm-border)",
                            background: item.uid === selected.uid ? "var(--cm-blue-light)" : "var(--cm-surface)",
                          }}
                        >
                          <Avatar name={item.fromName} email={item.from} size="sm" />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-3">
                              <span className="truncate text-[12px] font-[700]" style={{ color: "var(--cm-text)" }}>{item.fromName || item.from}</span>
                              <span className="shrink-0 text-[10px]" style={{ color: "var(--cm-text3)" }}>{formatDate(item.date)}</span>
                            </div>
                            <p className="truncate text-[11px]" style={{ color: "var(--cm-text3)" }}>{item.snippet || item.subject}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                </article>

                {workspaceMode !== "compact" && (
                  <aside className="hidden space-y-3 xl:block">
                    <div className="rounded-2xl border p-4" style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)" }}>
                      <p className="text-[10px] font-[800] uppercase tracking-[0.18em]" style={{ color: "var(--cm-text3)" }}>Contact</p>
                      <div className="mt-3 flex items-center gap-3">
                        <Avatar name={selected.fromName} email={selected.from} size="md" />
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-[800]" style={{ color: "var(--cm-text)" }}>{selected.fromName || selected.from}</p>
                          <p className="truncate text-[11px]" style={{ color: "var(--cm-text3)" }}>{selected.from}</p>
                        </div>
                      </div>
                      {senderDomain(selected.from) && (
                        <div className="mt-3 rounded-xl px-3 py-2" style={{ background: "var(--cm-surface2)" }}>
                          <p className="text-[10px] font-[700]" style={{ color: "var(--cm-text3)" }}>Domain</p>
                          <p className="truncate text-[12px] font-[700]" style={{ color: "var(--cm-text2)" }}>{senderDomain(selected.from)}</p>
                        </div>
                      )}
                    </div>

                    <div className="rounded-2xl border p-4" style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)" }}>
                      <p className="text-[10px] font-[800] uppercase tracking-[0.18em]" style={{ color: "var(--cm-text3)" }}>Workspace</p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {smartTags(selected).length > 0 ? smartTags(selected).map(tag => (
                          <span key={tag} className="rounded-full px-2 py-1 text-[10px] font-[800]" style={{ background: "var(--cm-blue-light)", color: "var(--cm-blue)" }}>{tag}</span>
                        )) : (
                          <span className="text-[11.5px]" style={{ color: "var(--cm-text3)" }}>No smart labels yet</span>
                        )}
                      </div>
                      <div className="mt-4 space-y-2 text-[11.5px]" style={{ color: "var(--cm-text2)" }}>
                        <div className="flex justify-between gap-3"><span style={{ color: "var(--cm-text3)" }}>Received</span><span className="text-right">{formatDateFull(selected.date)}</span></div>
                        <div className="flex justify-between gap-3"><span style={{ color: "var(--cm-text3)" }}>Size</span><span>{formatBytes(selected.size) || "Unknown"}</span></div>
                        <div className="flex justify-between gap-3"><span style={{ color: "var(--cm-text3)" }}>Attachments</span><span>{selected.attachments.length}</span></div>
                      </div>
                    </div>

                    {selected.attachments.length > 0 && (
                      <div className="rounded-2xl border p-4" style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface)" }}>
                        <p className="text-[10px] font-[800] uppercase tracking-[0.18em]" style={{ color: "var(--cm-text3)" }}>Files</p>
                        <div className="mt-3 space-y-2">
                          {selected.attachments.slice(0, 4).map((att, i) => (
                            <button key={i} type="button" onClick={() => setPreviewAttachment({ filename: att.filename, contentType: att.contentType, url: `${attachmentUrl(att)}&preview=1` })} className="block w-full rounded-xl px-3 py-2 text-left transition hover:opacity-80" style={{ background: "var(--cm-surface2)" }}>
                              <p className="truncate text-[11.5px] font-[700]" style={{ color: "var(--cm-text)" }}>{att.filename}</p>
                              <p className="text-[10px]" style={{ color: "var(--cm-text3)" }}>{formatBytes(att.size)}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </aside>
                )}
              </div>
            </div>

            {/* Reply panel */}
            {replyOpen && (
              <div className="shrink-0 border-t" style={{ borderColor: "var(--cm-border)", background: "var(--cm-surface2)" }}>
                <form onSubmit={handleReply} className="px-5 py-4 space-y-3"
                  onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); handleReply(e as unknown as React.FormEvent); } }}>
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
                    <span className="text-[10px]" style={{ color: "var(--cm-text3)" }}>Ctrl+Enter to send</span>
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
