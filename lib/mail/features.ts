import "server-only";
import { db } from "@/lib/db";
import { getAccountConfig } from "./accounts";
import { appendToSent } from "./imap";
import { sendEmail } from "./smtp";

type MailPayload = {
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  body: string;
  isHtml?: boolean;
  inReplyTo?: string;
  references?: string;
  attachments?: { filename: string; contentType?: string; content: string }[];
};

export function extractCalendarHint(message: { subject?: string; bodyText?: string | null; bodyHtml?: string | null; attachments?: { filename: string; contentType: string }[] }) {
  const raw = `${message.subject || ""} ${message.bodyText || ""} ${(message.bodyHtml || "").replace(/<[^>]+>/g, " ")}`;
  const haystack = raw.toLowerCase();
  const hasCalendarAttachment = message.attachments?.some(att => att.filename.toLowerCase().endsWith(".ics") || att.contentType.includes("calendar"));
  const hasDateLanguage = /\b(meeting|calendar|invite|appointment|schedule|zoom|google meet|teams|webex|meet\.google\.com|calendly)\b/.test(haystack);
  const dateMatch = raw.match(/\b(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\.?\s+\d{1,2}(?:,\s*\d{4})?\b|\b\d{4}-\d{1,2}-\d{1,2}\b|\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/i);
  const timeMatch = raw.match(/\b\d{1,2}:\d{2}\s?(?:am|pm)?\b|\b\d{1,2}\s?(?:am|pm)\b/i);
  const linkMatch = raw.match(/https?:\/\/(?:meet\.google\.com|zoom\.us|teams\.microsoft\.com|calendly\.com)[^\s<"]*/i);
  const summary = [dateMatch?.[0], timeMatch?.[0], linkMatch ? new URL(linkMatch[0]).hostname : ""].filter(Boolean).join(" ");
  return { hasEvent: Boolean(hasCalendarAttachment || hasDateLanguage || dateMatch || linkMatch), summary };
}

export function detectCalendarText(message: { subject?: string; bodyText?: string | null; bodyHtml?: string | null; attachments?: { filename: string; contentType: string }[] }) {
  return extractCalendarHint(message).hasEvent;
}

export async function applyRules(accountId: string, message: {
  uid: number;
  folder: string;
  subject: string;
  from: string;
  fromName: string;
  to: string;
  seen: boolean;
  flagged: boolean;
}) {
  const rules = await (db as any).mailRule.findMany({ where: { accountId, isActive: true } });
  const matched: string[] = [];
  for (const rule of rules) {
    const source = String((message as any)[rule.field] || "").toLowerCase();
    const value = String(rule.value || "").toLowerCase();
    const ok = rule.operator === "equals" ? source === value : source.includes(value);
    if (!ok) continue;
    matched.push(rule.name);
  }
  return matched;
}

export async function scheduleEmail(accountId: string, payload: MailPayload, scheduledAt: Date) {
  return (db as any).scheduledEmail.create({
    data: { accountId, payload: payload as any, scheduledAt },
  });
}

export async function processScheduledEmails(limit = 20) {
  const due = await (db as any).scheduledEmail.findMany({
    where: { sentAt: null, failedAt: null, scheduledAt: { lte: new Date() } },
    orderBy: { scheduledAt: "asc" },
    take: limit,
    include: { account: { select: { userId: true } } },
  });
  const results: { id: string; ok: boolean; error?: string }[] = [];
  for (const item of due) {
    try {
      const { account, smtp, imap } = await getAccountConfig(item.accountId, item.account.userId);
      const payload = item.payload as MailPayload;
      const sent = await sendEmail(smtp, { ...payload, from: account.emailAddress });
      if (sent.raw) await appendToSent(imap, sent.raw).catch(() => {});
      await (db as any).scheduledEmail.update({ where: { id: item.id }, data: { sentAt: new Date() } });
      results.push({ id: item.id, ok: true });
    } catch (err) {
      const error = err instanceof Error ? err.message : "Send failed.";
      await (db as any).scheduledEmail.update({ where: { id: item.id }, data: { failedAt: new Date(), error } });
      results.push({ id: item.id, ok: false, error });
    }
  }
  return results;
}
