// app/api/mail/messages/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAccountConfig } from "@/lib/mail/accounts";
import { getMessages, getMessage, searchMessages, getFolders, getAttachment } from "@/lib/mail/imap";

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
    const { imap } = await getAccountConfig(accountId, user.id);

    if (action === "folders") {
      const folders = await getFolders(imap);
      return json({ ok: true, folders });
    }

    if (action === "message") {
      const uid = parseInt(sp.get("uid") || "0");
      if (!uid) return json({ ok: false, error: "UID required." }, { status: 400 });
      const message = await getMessage(imap, folder, uid);
      return json({ ok: true, message });
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
      headers.set("Content-Disposition", `attachment; filename="${attachment.filename.replace(/"/g, "")}"`);
      return new NextResponse(new Uint8Array(attachment.content), { headers });
    }

    if (action === "search") {
      const q = sp.get("q") || "";
      if (!q) return json({ ok: true, messages: [] });
      const messages = await searchMessages(imap, folder, q);
      return json({ ok: true, messages });
    }

    const page = parseInt(sp.get("page") || "1");
    const pageSize = parseInt(sp.get("pageSize") || "30");
    const result = await getMessages(imap, folder, page, pageSize);
    return json({ ok: true, ...result });
  } catch (err) {
    return json({ ok: false, error: err instanceof Error ? err.message : "Failed." }, { status: 400 });
  }
}
