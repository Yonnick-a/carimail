// lib/mail/imap.ts
import "server-only";
import { ImapFlow } from "imapflow";

export type ImapConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
};

export type Folder = {
  path: string;
  name: string;
  delimiter: string;
  specialUse?: string;
  flags: string[];
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
  bodyHtml: string | null;
  bodyText: string | null;
  attachments: { filename: string; size: number; contentType: string }[];
};

function makeClient(config: ImapConfig) {
  return new ImapFlow({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.password },
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
    return list.map((f) => ({
      path: f.path,
      name: f.name,
      delimiter: f.delimiter ?? "/",
      specialUse: (f as any).specialUse,
      flags: Array.from(f.flags ?? []),
    }));
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
  uid: number
): Promise<MessageFull | null> {
  const client = makeClient(config);
  try {
    await client.connect();
    await client.mailboxOpen(folder);
    await client.messageFlagsAdd({ uid }, ["\\Seen"], { uid: true });

    let result: MessageFull | null = null;
    for await (const msg of client.fetch({ uid }, {
      uid: true, flags: true, envelope: true, bodyStructure: true, source: true, size: true,
    }, { uid: true })) {
      const env = msg.envelope;
      const from = env?.from?.[0];
      const source = msg.source?.toString() || "";
      const { html, text, attachments } = parseMime(source);

      result = {
        uid: msg.uid,
        seq: msg.seq,
        subject: env?.subject || "(no subject)",
        from: from?.address || "",
        fromName: from?.name || from?.address || "",
        to: env?.to?.[0]?.address || "",
        cc: env?.cc?.[0]?.address || "",
        replyTo: env?.replyTo?.[0]?.address || "",
        date: env?.date?.toISOString() || new Date().toISOString(),
        seen: true,
        flagged: msg.flags?.has("\\Flagged") ?? false,
        hasAttachment: attachments.length > 0,
        size: msg.size,
        messageId: env?.messageId,
        bodyHtml: html,
        bodyText: text,
        attachments,
      };
    }
    return result;
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

function parseMime(source: string, depth = 0, seen = new Set<string>()): {
  html: string | null;
  text: string | null;
  attachments: { filename: string; size: number; contentType: string }[];
} {
  const attachments: { filename: string; size: number; contentType: string }[] = [];
  if (depth > 8) return { html: null, text: null, attachments };

  const boundaryMatch = source.match(/boundary="?([^"\r\n;]+)"?/i);
  const boundary = boundaryMatch?.[1]?.trim();

  if (!boundary) {
    const sep = source.indexOf("\r\n\r\n");
    const headers = sep > -1 ? source.slice(0, sep) : "";
    const body = sep > -1 ? source.slice(sep + 4) : source;
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
    const sep = part.indexOf("\r\n\r\n");
    if (sep === -1) continue;

    const ph = part.slice(0, sep).toLowerCase();
    const pb = part.slice(sep + 4).replace(/\r\n$/, "");
    const ct = ph.match(/content-type:\s*([^;\r\n]+)/)?.[1]?.trim() || "";
    const disp = ph.match(/content-disposition:\s*([^;\r\n]+)/)?.[1]?.trim() || "";
    const fname = ph.match(/filename[*]?=\s*"?([^";\r\n]+)"?/i)?.[1]?.trim();

    if (disp === "attachment" && fname) {
      attachments.push({ filename: fname, size: pb.length, contentType: ct });
      continue;
    }
    if (ct.includes("text/html") && !html) { html = decodeBody(pb, ph); }
    else if (ct.includes("text/plain") && !text) { text = decodeBody(pb, ph); }
    else if (ct.includes("multipart/")) {
      const n = parseMime(part, depth + 1, seen);
      if (!html && n.html) html = n.html;
      if (!text && n.text) text = n.text;
      attachments.push(...n.attachments);
    }
  }
  return { html, text, attachments };
}

function decodeBody(body: string, headers: string): string {
  const enc = headers.match(/content-transfer-encoding:\s*([^\r\n]+)/i)?.[1]?.trim().toLowerCase();
  if (enc === "base64") {
    try { return Buffer.from(body.replace(/\s/g, ""), "base64").toString("utf8"); } catch { return body; }
  }
  if (enc === "quoted-printable") {
    return body.replace(/=\r\n/g, "").replace(/=([0-9A-Fa-f]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
  }
  return body;
}