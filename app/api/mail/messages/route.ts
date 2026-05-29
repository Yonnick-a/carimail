// app/api/mail/messages/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAccountConfig } from "@/lib/mail/accounts";
import { getMessages, getMessage, searchMessages, getFolders, getAttachment } from "@/lib/mail/imap";
import { getIndexedConversation, getIndexedConversations, searchIndexedMessages, syncFolderToDb } from "@/lib/mail/sync";

function json(data: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("Cache-Control", "no-store");
  return NextResponse.json(data, { ...init, headers });
}

export async function GET(req: NextRequest) {
  const user = await getSession();
  if (!user) return json({ ok: false, error: "Unauthorized.", code: "NO_SESSION" }, { status: 401 });

  const sp = req.nextUrl.searchParams;
  const accountId = sp.get("accountId") || "";
  const action = sp.get("action") || "list";
  const folder = sp.get("folder") || "INBOX";

  try {
    const { account, imap } = await getAccountConfig(accountId, user.id);

    if (action === "folders") {
      const folders = await getFolders(imap);
      return json({ ok: true, folders });
    }

    if (action === "message") {
      const uid = parseInt(sp.get("uid") || "0");
      if (!uid) return json({ ok: false, error: "UID required." }, { status: 400 });
      const message = await getMessage(imap, folder, uid);
      const conversationId = sp.get("conversationId") || "";
      let threadMessages = [];
      if (conversationId) {
        const conversation = await getIndexedConversation(conversationId, accountId);
        threadMessages = conversation?.messages?.map((m: any) => ({
          uid: m.uid,
          subject: m.subject,
          from: m.from,
          fromName: m.fromName,
          to: m.to,
          date: m.date.toISOString(),
          seen: m.seen,
          flagged: m.flagged,
          hasAttachment: m.hasAttachment,
          snippet: m.snippet,
        })) || [];
      }
      return json({ ok: true, message: message ? { ...message, conversationId, threadMessages } : message });
    }

    if (action === "attachment") {
      const uid = parseInt(sp.get("uid") || "0");
      const attachmentId = parseInt(sp.get("attachmentId") || "-1");
      if (!uid || attachmentId < 0) return json({ ok: false, error: "Attachment required." }, { status: 400 });
      const attachment = await getAttachment(imap, folder, uid, attachmentId);
      if (!attachment) return json({ ok: false, error: "Attachment not found." }, { status: 404 });
      const headers = new Headers();
      headers.set("Cache-Control", "no-store");
      headers.set("Content-Type", attachment.contentType || "application/octet-stream");
      const disposition = sp.get("preview") === "1" ? "inline" : "attachment";
      headers.set("Content-Disposition", `${disposition}; filename="${attachment.filename.replace(/"/g, "")}"`);
      return new NextResponse(new Uint8Array(attachment.content), { headers });
    }

    if (action === "search") {
      const q = sp.get("q") || "";
      if (!q) return json({ ok: true, messages: [] });
      const indexed = await searchIndexedMessages(accountId, folder, q);
      if (indexed.length > 0) return json({ ok: true, messages: indexed, indexed: true });
      await syncFolderToDb(accountId, imap, folder, 80).catch(() => null);
      const refreshed = await searchIndexedMessages(accountId, folder, q);
      if (refreshed.length > 0) return json({ ok: true, messages: refreshed, indexed: true });
      const messages = await searchMessages(imap, folder, q).catch(() => []);
      return json({ ok: true, messages });
    }

    if (action === "sync") {
      const result = await syncFolderToDb(accountId, imap, folder, parseInt(sp.get("limit") || "60"));
      return json({ ok: true, ...result });
    }

    const page = parseInt(sp.get("page") || "1");
    const pageSize = parseInt(sp.get("pageSize") || "30");
    const forceFresh = sp.get("fresh") === "1";
    const lastSyncedAt = account.lastSyncedAt ? new Date(account.lastSyncedAt).getTime() : 0;
    // Stale threshold: 5 minutes. DB reads are instant; IMAP syncs are expensive.
    const STALE_MS = 5 * 60_000;
    const isStale = !lastSyncedAt || Date.now() - lastSyncedAt > STALE_MS || forceFresh;

    try {
      // Try to serve from DB cache first — always fast
      const cached = await getIndexedConversations(accountId, folder, page, pageSize);

      if (cached.messages.length > 0) {
        // Cache hit: return immediately. If stale, sync in background (fire-and-forget).
        if (isStale) {
          syncFolderToDb(accountId, imap, folder, Math.min(60, pageSize * 2)).catch(() => {});
        }
        return json({ ok: true, threaded: true, stale: isStale, ...cached });
      }

      // Cache miss (first load or empty folder): sync now, then return results
      await syncFolderToDb(accountId, imap, folder, Math.min(60, pageSize * 2));
      const result = await getIndexedConversations(accountId, folder, page, pageSize);
      return json({ ok: true, threaded: true, ...result });
    } catch {
      // DB unavailable — fall back to live IMAP
      try {
        const result = await getMessages(imap, folder, page, pageSize);
        return json({ ok: true, threaded: false, ...result });
      } catch (imapErr) {
        return json({ ok: false, error: imapErr instanceof Error ? imapErr.message : "Failed to fetch mail." }, { status: 400 });
      }
    }
  } catch (err) {
    return json({ ok: false, error: err instanceof Error ? err.message : "Failed." }, { status: 400 });
  }
}
