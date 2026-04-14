// app/api/mail/messages/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAccountConfig } from "@/lib/mail/accounts";
import { getMessages, getMessage, searchMessages, getFolders } from "@/lib/mail/imap";

export async function GET(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ ok: false, error: "Unauthorized.", code: "NO_SESSION" }, { status: 401 });

  const sp = req.nextUrl.searchParams;
  const accountId = sp.get("accountId") || "";
  const action = sp.get("action") || "list";
  const folder = sp.get("folder") || "INBOX";

  try {
    const { imap } = await getAccountConfig(accountId, user.id);

    if (action === "folders") {
      const folders = await getFolders(imap);
      return NextResponse.json({ ok: true, folders });
    }

    if (action === "message") {
      const uid = parseInt(sp.get("uid") || "0");
      if (!uid) return NextResponse.json({ ok: false, error: "UID required." }, { status: 400 });
      const message = await getMessage(imap, folder, uid);
      return NextResponse.json({ ok: true, message });
    }

    if (action === "search") {
      const q = sp.get("q") || "";
      if (!q) return NextResponse.json({ ok: true, messages: [] });
      const messages = await searchMessages(imap, folder, q);
      return NextResponse.json({ ok: true, messages });
    }

    const page = parseInt(sp.get("page") || "1");
    const pageSize = parseInt(sp.get("pageSize") || "30");
    const result = await getMessages(imap, folder, page, pageSize);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : "Failed." }, { status: 400 });
  }
}
