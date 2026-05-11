import "server-only";
import { db } from "@/lib/db";
import type { ImapConfig, MessageFull, MessageSummary } from "./imap";
import { getMessage, getMessages } from "./imap";
import { applyRules, extractCalendarHint } from "./features";

function normalizeSubject(subject: string) {
  return (subject || "(no subject)").replace(/^\s*((re|fw|fwd):\s*)+/i, "").trim() || "(no subject)";
}

function threadKeyFor(message: Pick<MessageFull, "messageId" | "inReplyTo" | "references" | "subject">) {
  const refs = `${message.references || ""} ${message.inReplyTo || ""}`.trim();
  const firstRef = refs.split(/\s+/).find(Boolean);
  return firstRef || message.messageId || `subject:${normalizeSubject(message.subject).toLowerCase()}`;
}

function snippetFor(message: Pick<MessageFull, "bodyText" | "bodyHtml">) {
  const source = message.bodyText || (message.bodyHtml || "").replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "").replace(/<[^>]+>/g, " ");
  return source.replace(/\s+/g, " ").trim().slice(0, 220);
}

async function upsertIndexedMessage(accountId: string, folder: string, summary: MessageSummary, full?: MessageFull) {
  const matchedRules = await applyRules(accountId, { ...summary, folder }).catch(() => []);
  const calendarHint = full ? extractCalendarHint(full) : { hasEvent: false, summary: "" };
  const enrichedSnippet = [
    calendarHint.hasEvent ? `[Calendar${calendarHint.summary ? `: ${calendarHint.summary}` : ""}]` : "",
    matchedRules.length ? `[Rules: ${matchedRules.join(", ")}]` : "",
    full ? snippetFor(full) : "",
  ].filter(Boolean).join(" ");
  const threadKey = threadKeyFor({
    messageId: full?.messageId || summary.messageId,
    inReplyTo: full?.inReplyTo,
    references: full?.references,
    subject: summary.subject,
  });
  const conversation = await (db as any).mailConversation.upsert({
    where: { accountId_threadKey: { accountId, threadKey } },
    update: {
      subject: normalizeSubject(summary.subject),
      lastMessageAt: new Date(summary.date),
      hasAttachment: summary.hasAttachment,
      snippet: enrichedSnippet || undefined,
    },
    create: {
      accountId,
      threadKey,
      subject: normalizeSubject(summary.subject),
      lastMessageAt: new Date(summary.date),
      hasAttachment: summary.hasAttachment,
      snippet: enrichedSnippet || undefined,
    },
  });

  await (db as any).mailMessage.upsert({
    where: { accountId_folder_uid: { accountId, folder, uid: summary.uid } },
    update: {
      conversationId: conversation.id,
      seq: summary.seq,
      messageId: summary.messageId,
      inReplyTo: full?.inReplyTo,
      references: full?.references,
      subject: summary.subject,
      from: summary.from,
      fromName: summary.fromName,
      to: summary.to,
      date: new Date(summary.date),
      seen: summary.seen,
      flagged: summary.flagged,
      hasAttachment: summary.hasAttachment,
      size: summary.size,
      snippet: enrichedSnippet || undefined,
      syncedAt: new Date(),
    },
    create: {
      accountId,
      conversationId: conversation.id,
      folder,
      uid: summary.uid,
      seq: summary.seq,
      messageId: summary.messageId,
      inReplyTo: full?.inReplyTo,
      references: full?.references,
      subject: summary.subject,
      from: summary.from,
      fromName: summary.fromName,
      to: summary.to,
      date: new Date(summary.date),
      seen: summary.seen,
      flagged: summary.flagged,
      hasAttachment: summary.hasAttachment,
      size: summary.size,
      snippet: enrichedSnippet || undefined,
    },
  });

  await refreshConversation(conversation.id);
}

async function refreshConversation(conversationId: string) {
  const messages = await (db as any).mailMessage.findMany({
    where: { conversationId },
    orderBy: { date: "asc" },
  });
  if (messages.length === 0) return;
  const latest = messages[messages.length - 1];
  const participants = Array.from(new Set(messages.flatMap((m: any) => [m.fromName || m.from, m.to].filter(Boolean)))).slice(0, 8).join(", ");
  await (db as any).mailConversation.update({
    where: { id: conversationId },
    data: {
      participants,
      messageCount: messages.length,
      unreadCount: messages.filter((m: any) => !m.seen).length,
      hasAttachment: messages.some((m: any) => m.hasAttachment),
      lastMessageAt: latest.date,
      snippet: latest.snippet,
      subject: normalizeSubject(latest.subject),
    },
  });
}

export async function syncFolderToDb(accountId: string, config: ImapConfig, folder: string, limit = 60) {
  const page = await getMessages(config, folder, 1, limit);
  const newest = page.messages.slice(0, Math.min(limit, page.messages.length));
  for (const summary of newest) {
    let full: MessageFull | undefined;
    try {
      full = await getMessage(config, folder, summary.uid, false) || undefined;
    } catch {}
    await upsertIndexedMessage(accountId, folder, summary, full);
  }
  await (db as any).mailAccount.update({ where: { id: accountId }, data: { lastSyncedAt: new Date() } }).catch(() => {});
  return { total: page.total, synced: newest.length };
}

export async function getIndexedConversations(accountId: string, folder: string, page: number, pageSize: number) {
  const skip = Math.max(0, (page - 1) * pageSize);
  const where = { accountId, messages: { some: { folder } } };
  const [conversations, total] = await Promise.all([
    (db as any).mailConversation.findMany({
      where,
      orderBy: { lastMessageAt: "desc" },
      skip,
      take: pageSize,
      include: { messages: { where: { folder }, orderBy: { date: "desc" }, take: 1 } },
    }),
    (db as any).mailConversation.count({ where }),
  ]);
  const latest = conversations.map((conv: any) => conv.messages[0]).filter(Boolean);
  const snoozes = latest.length
    ? await (db as any).mailSnooze.findMany({
        where: {
          accountId,
          until: { gt: new Date() },
          OR: latest.map((m: any) => ({ folder: m.folder, uid: m.uid })),
        },
      })
    : [];
  const snoozedKeys = new Set(snoozes.map((s: any) => `${s.folder}:${s.uid}`));

  return {
    total,
    messages: conversations.filter((conv: any) => {
      const latest = conv.messages[0];
      return latest && !snoozedKeys.has(`${latest.folder}:${latest.uid}`);
    }).map((conv: any) => {
      const latest = conv.messages[0];
      return {
        uid: latest.uid,
        seq: latest.seq,
        subject: conv.subject || latest.subject,
        from: latest.from,
        fromName: conv.participants || latest.fromName,
        to: latest.to,
        date: conv.lastMessageAt.toISOString(),
        seen: conv.unreadCount === 0,
        flagged: latest.flagged,
        hasAttachment: conv.hasAttachment,
        size: latest.size,
        messageId: latest.messageId,
        conversationId: conv.id,
        threadCount: conv.messageCount,
        snippet: conv.snippet,
      };
    }),
  };
}

export async function getIndexedConversation(conversationId: string, accountId: string) {
  return (db as any).mailConversation.findFirst({
    where: { id: conversationId, accountId },
    include: { messages: { orderBy: { date: "asc" } } },
  });
}
