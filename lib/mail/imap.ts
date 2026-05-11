// lib/mail/imap.ts
import "server-only";
import { ImapFlow } from "imapflow";

export type ImapConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password?: string;
  accessToken?: string;
};

export type Folder = {
  path: string;
  name: string;
  delimiter: string;
  specialUse?: string;
  flags: string[];
  unread?: number;
  total?: number;
};

export type MessageSummary = {
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

export type MessageFull = MessageSummary & {
  cc: string;
  replyTo: string;
  inReplyTo?: string;
  references?: string;
  bodyHtml: string | null;
  bodyText: string | null;
  attachments: { id: number; filename: string; size: number; contentType: string }[];
};

type ParsedAttachment = { id: number; filename: string; size: number; contentType: string; content: Buffer };

function makeClient(config: ImapConfig) {
  return new ImapFlow({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.accessToken
      ? { user: config.user, accessToken: config.accessToken }
      : { user: config.user, pass: config.password || "" },
    logger: false,
    tls: { rejectUnauthorized: false },
  });
}

export async function testConnection(config: ImapConfig): Promise<void> {
  const client = makeClient(config);
  await client.connect();
  await client.logout();
}

export async function getFolders(config: ImapConfig): Promise<Folder[]> {
  const client = makeClient(config);
  try {
    await client.connect();
    const list = await client.list();
    const folders = await Promise.all(list.map(async (f) => {
      let unread = 0;
      let total = 0;
      try {
        const status = await client.status(f.path, { messages: true, unseen: true });
        unread = status.unseen ?? 0;
        total = status.messages ?? 0;
      } catch {
        // Some virtual or provider-owned folders do not support STATUS.
      }
      return {
        path: f.path,
        name: f.name,
        delimiter: f.delimiter ?? "/",
        specialUse: (f as any).specialUse,
        flags: Array.from(f.flags ?? []),
        unread,
        total,
      };
    }));
    return folders;
  } finally {
    await client.logout().catch(() => {});
  }
}

export async function getMessages(
  config: ImapConfig,
  folder: string,
  page: number,
  pageSize: number
): Promise<{ messages: MessageSummary[]; total: number }> {
  const client = makeClient(config);
  try {
    await client.connect();
    const mailbox = await client.mailboxOpen(folder);
    const total = mailbox.exists;
    if (total === 0) return { messages: [], total: 0 };

    const end = Math.max(1, total - (page - 1) * pageSize);
    const start = Math.max(1, end - pageSize + 1);
    const messages: MessageSummary[] = [];

    for await (const msg of client.fetch(`${start}:${end}`, {
      uid: true, flags: true, envelope: true, bodyStructure: true, size: true,
    })) {
      const env = msg.envelope;
      const from = env?.from?.[0];
      messages.unshift({
        uid: msg.uid,
        seq: msg.seq,
        subject: env?.subject || "(no subject)",
        from: from?.address || "",
        fromName: from?.name || from?.address || "",
        to: env?.to?.[0]?.address || "",
        date: env?.date?.toISOString() || new Date().toISOString(),
        seen: msg.flags?.has("\\Seen") ?? false,
        flagged: msg.flags?.has("\\Flagged") ?? false,
        hasAttachment: checkAttachment(msg.bodyStructure),
        size: msg.size,
        messageId: env?.messageId,
      });
    }
    return { messages, total };
  } finally {
    await client.logout().catch(() => {});
  }
}

export async function getMessage(
  config: ImapConfig,
  folder: string,
  uid: number,
  markSeen = true
): Promise<MessageFull | null> {
  const client = makeClient(config);
  try {
    await client.connect();
    await client.mailboxOpen(folder);
    if (markSeen) await client.messageFlagsAdd({ uid }, ["\\Seen"], { uid: true });

    let result: MessageFull | null = null;
    for await (const msg of client.fetch({ uid }, {
      uid: true, flags: true, envelope: true, bodyStructure: true, source: true, size: true,
    }, { uid: true })) {
      const env = msg.envelope;
      const from = env?.from?.[0];
      const source = Buffer.isBuffer(msg.source)
        ? msg.source
        : Buffer.from(String(msg.source || ""), "utf8");
      const { html, text, attachments } = parseMime(source);
      const rawHeaders = source.toString("latin1").slice(0, Math.max(0, source.toString("latin1").indexOf("\r\n\r\n")));

      result = {
        uid: msg.uid,
        seq: msg.seq,
        subject: env?.subject || "(no subject)",
        from: from?.address || "",
        fromName: from?.name || from?.address || "",
        to: env?.to?.[0]?.address || "",
        cc: env?.cc?.[0]?.address || "",
        replyTo: env?.replyTo?.[0]?.address || "",
        inReplyTo: decodeHeaderLine(rawHeaders, "in-reply-to"),
        references: decodeHeaderLine(rawHeaders, "references"),
        date: env?.date?.toISOString() || new Date().toISOString(),
        seen: true,
        flagged: msg.flags?.has("\\Flagged") ?? false,
        hasAttachment: attachments.length > 0,
        size: msg.size,
        messageId: env?.messageId,
        bodyHtml: html,
        bodyText: text,
        attachments: attachments.map(({ content: _content, ...attachment }, id) => ({ ...attachment, id })),
      };
    }
    return result;
  } finally {
    await client.logout().catch(() => {});
  }
}

function decodeHeaderLine(headers: string, name: string): string {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = headers.match(new RegExp(`^${escaped}:\\s*([^\\r\\n]*(?:\\r?\\n[\\t ][^\\r\\n]*)*)`, "im"));
  return match?.[1]?.replace(/\r?\n[\t ]+/g, " ").trim() || "";
}

export async function getAttachment(
  config: ImapConfig,
  folder: string,
  uid: number,
  attachmentId: number
): Promise<ParsedAttachment | null> {
  const client = makeClient(config);
  try {
    await client.connect();
    await client.mailboxOpen(folder);

    for await (const msg of client.fetch({ uid }, { uid: true, source: true }, { uid: true })) {
      const source = Buffer.isBuffer(msg.source)
        ? msg.source
        : Buffer.from(String(msg.source || ""), "utf8");
      const { attachments } = parseMime(source);
      return attachments.map((attachment, id) => ({ ...attachment, id })).find((attachment) => attachment.id === attachmentId) ?? null;
    }
    return null;
  } finally {
    await client.logout().catch(() => {});
  }
}

export async function appendToSent(config: ImapConfig, rawMessage: string): Promise<void> {
  const client = makeClient(config);
  try {
    await client.connect();
    const folders = await client.list();
    const sent = folders.find((f) => {
      const path = f.path.toLowerCase();
      const specialUse = String((f as any).specialUse || "").toLowerCase();
      return specialUse.includes("sent") || path === "sent" || path.endsWith("/sent") || path.endsWith(".sent");
    });
    const sentPath = sent?.path || "Sent";
    await client.append(sentPath, rawMessage, ["\\Seen"]);
  } finally {
    await client.logout().catch(() => {});
  }
}

export async function searchMessages(
  config: ImapConfig,
  folder: string,
  query: string
): Promise<MessageSummary[]> {
  const client = makeClient(config);
  try {
    await client.connect();
    const mailbox = await client.mailboxOpen(folder);
    if (mailbox.exists === 0) return [];

    const uids = await client.search({
      or: [{ subject: query }, { from: query }, { body: query }],
    });

    if (!Array.isArray(uids) || uids.length === 0) return [];

    const messages: MessageSummary[] = [];
    for await (const msg of client.fetch(uids.slice(-50), {
      uid: true, flags: true, envelope: true, bodyStructure: true, size: true,
    })) {
      const env = msg.envelope;
      const from = env?.from?.[0];
      messages.push({
        uid: msg.uid,
        seq: msg.seq,
        subject: env?.subject || "(no subject)",
        from: from?.address || "",
        fromName: from?.name || from?.address || "",
        to: env?.to?.[0]?.address || "",
        date: env?.date?.toISOString() || new Date().toISOString(),
        seen: msg.flags?.has("\\Seen") ?? false,
        flagged: msg.flags?.has("\\Flagged") ?? false,
        hasAttachment: checkAttachment(msg.bodyStructure),
        size: msg.size,
        messageId: env?.messageId,
      });
    }
    return messages.reverse();
  } finally {
    await client.logout().catch(() => {});
  }
}

export async function moveMessage(config: ImapConfig, folder: string, uid: number, dest: string) {
  const client = makeClient(config);
  try {
    await client.connect();
    await client.mailboxOpen(folder);
    await client.messageMove({ uid }, dest, { uid: true });
  } finally {
    await client.logout().catch(() => {});
  }
}

export async function deleteMessage(config: ImapConfig, folder: string, uid: number) {
  const client = makeClient(config);
  try {
    await client.connect();
    await client.mailboxOpen(folder);
    await client.messageDelete({ uid }, { uid: true });
  } finally {
    await client.logout().catch(() => {});
  }
}

export async function toggleFlag(
  config: ImapConfig, folder: string, uid: number,
  flag: "\\Seen" | "\\Flagged", value: boolean
) {
  const client = makeClient(config);
  try {
    await client.connect();
    await client.mailboxOpen(folder);
    if (value) await client.messageFlagsAdd({ uid }, [flag], { uid: true });
    else await client.messageFlagsRemove({ uid }, [flag], { uid: true });
  } finally {
    await client.logout().catch(() => {});
  }
}

// ── MIME parser ───────────────────────────────────────────────────────

function checkAttachment(structure: any): boolean {
  if (!structure) return false;
  if (structure.disposition === "attachment") return true;
  if (Array.isArray(structure.childNodes)) return structure.childNodes.some(checkAttachment);
  return false;
}

function parseMime(rawSource: Buffer | string, depth = 0, seen = new Set<string>()): {
  html: string | null;
  text: string | null;
  attachments: ParsedAttachment[];
} {
  const attachments: ParsedAttachment[] = [];
  if (depth > 8) return { html: null, text: null, attachments };

  const source = Buffer.isBuffer(rawSource) ? rawSource.toString("latin1") : rawSource;
  const boundaryMatch = source.match(/boundary="?([^"\r\n;]+)"?/i);
  const boundary = boundaryMatch?.[1]?.trim();

  if (!boundary) {
    const sep = findHeaderSeparator(source);
    const headers = sep.index > -1 ? source.slice(0, sep.index) : "";
    const body = sep.index > -1 ? source.slice(sep.index + sep.length) : source;
    if (headers.toLowerCase().includes("text/html")) {
      return { html: decodeBody(body, headers), text: null, attachments };
    }
    return { html: null, text: decodeBody(body, headers), attachments };
  }

  if (seen.has(boundary)) return { html: null, text: null, attachments };
  seen.add(boundary);

  const parts = source.split(`--${boundary}`);
  let html: string | null = null;
  let text: string | null = null;

  for (const part of parts) {
    const t = part.trim();
    if (!t || t === "--" || t.startsWith("--")) continue;
    const sep = findHeaderSeparator(part);
    if (sep.index === -1) continue;

    const partHeaders = part.slice(0, sep.index);
    const ph = partHeaders.toLowerCase();
    const pb = part.slice(sep.index + sep.length).replace(/\r?\n$/, "");
    const ct = ph.match(/content-type:\s*([^;\r\n]+)/)?.[1]?.trim() || "";
    const disp = ph.match(/content-disposition:\s*([^;\r\n]+)/)?.[1]?.trim() || "";
    const fname = decodeHeaderParam(partHeaders.match(/filename\*?=\s*"?([^";\r\n]+)"?/i)?.[1]?.trim());

    if (disp === "attachment" && fname) {
      const content = decodePartToBuffer(pb, partHeaders);
      attachments.push({ id: attachments.length, filename: fname, size: content.length, contentType: ct || "application/octet-stream", content });
      continue;
    }
    if (ct.includes("text/html") && !html) { html = decodeBody(pb, partHeaders); }
    else if (ct.includes("text/plain") && !text) { text = decodeBody(pb, partHeaders); }
    else if (ct.includes("multipart/")) {
      const n = parseMime(part, depth + 1, seen);
      if (!html && n.html) html = n.html;
      if (!text && n.text) text = n.text;
      attachments.push(...n.attachments);
    }
  }
  return { html, text, attachments };
}

function findHeaderSeparator(source: string): { index: number; length: number } {
  const crlf = source.indexOf("\r\n\r\n");
  if (crlf > -1) return { index: crlf, length: 4 };
  const lf = source.indexOf("\n\n");
  return { index: lf, length: lf > -1 ? 2 : 0 };
}

function decodePartToBuffer(body: string, headers: string): Buffer {
  const enc = headers.match(/content-transfer-encoding:\s*([^\r\n]+)/i)?.[1]?.trim().toLowerCase();
  if (enc === "base64") {
    try { return Buffer.from(body.replace(/\s/g, ""), "base64"); } catch { return Buffer.from(body, "latin1"); }
  }
  if (enc === "quoted-printable") return decodeQuotedPrintableToBuffer(body);
  return Buffer.from(body, "latin1");
}

function decodeBody(body: string, headers: string): string {
  const charset = normalizeCharset(headers.match(/charset="?([^";\r\n]+)"?/i)?.[1]?.trim());
  const bytes = decodePartToBuffer(body, headers);

  try {
    return new TextDecoder(charset, { fatal: false }).decode(bytes);
  } catch {
    return bytes.toString("utf8");
  }
}

function decodeQuotedPrintableToBuffer(body: string): Buffer {
  const normalized = body.replace(/=\r?\n/g, "");
  const bytes: number[] = [];
  for (let i = 0; i < normalized.length; i++) {
    if (normalized[i] === "=" && /^[0-9A-Fa-f]{2}$/.test(normalized.slice(i + 1, i + 3))) {
      bytes.push(parseInt(normalized.slice(i + 1, i + 3), 16));
      i += 2;
    } else {
      bytes.push(normalized.charCodeAt(i) & 0xff);
    }
  }
  return Buffer.from(bytes);
}

function normalizeCharset(charset?: string): string {
  if (!charset) return "utf-8";
  const c = charset.toLowerCase().replace(/^["']|["']$/g, "");
  if (c === "iso-8859-1" || c === "latin1") return "windows-1252";
  if (c === "us-ascii") return "utf-8";
  return c;
}

function decodeHeaderParam(value?: string): string {
  if (!value) return "";
  const rfc5987 = value.match(/^([^']*)''(.+)$/);
  if (rfc5987) {
    try {
      return new TextDecoder(normalizeCharset(rfc5987[1])).decode(percentEncodedToBuffer(rfc5987[2]));
    } catch {
      return decodeURIComponent(rfc5987[2]);
    }
  }
  return value.replace(/^"|"$/g, "");
}

function percentEncodedToBuffer(value: string): Buffer {
  const bytes: number[] = [];
  for (let i = 0; i < value.length; i++) {
    if (value[i] === "%" && /^[0-9A-Fa-f]{2}$/.test(value.slice(i + 1, i + 3))) {
      bytes.push(parseInt(value.slice(i + 1, i + 3), 16));
      i += 2;
    } else {
      bytes.push(value.charCodeAt(i) & 0xff);
    }
  }
  return Buffer.from(bytes);
}
