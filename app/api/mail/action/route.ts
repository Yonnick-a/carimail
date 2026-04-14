// app/api/mail/action/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { getAccountConfig } from "@/lib/mail/accounts";
import { moveMessage, deleteMessage, toggleFlag } from "@/lib/mail/imap";

const schema = z.object({
  accountId: z.string(),
  action: z.enum(["trash", "delete", "move", "flag", "unflag", "read", "unread"]),
  folder: z.string(),
  uid: z.number().int(),
  destination: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = schema.parse(body);
    const { imap } = await getAccountConfig(parsed.accountId, user.id);

    switch (parsed.action) {
      case "trash":
        try { await moveMessage(imap, parsed.folder, parsed.uid, "Trash"); }
        catch { try { await moveMessage(imap, parsed.folder, parsed.uid, "INBOX.Trash"); }
        catch { await deleteMessage(imap, parsed.folder, parsed.uid); } }
        break;
      case "delete":
        await deleteMessage(imap, parsed.folder, parsed.uid);
        break;
      case "move":
        if (!parsed.destination) throw new Error("Destination required.");
        await moveMessage(imap, parsed.folder, parsed.uid, parsed.destination);
        break;
      case "flag":
        await toggleFlag(imap, parsed.folder, parsed.uid, "\\Flagged", true);
        break;
      case "unflag":
        await toggleFlag(imap, parsed.folder, parsed.uid, "\\Flagged", false);
        break;
      case "read":
        await toggleFlag(imap, parsed.folder, parsed.uid, "\\Seen", true);
        break;
      case "unread":
        await toggleFlag(imap, parsed.folder, parsed.uid, "\\Seen", false);
        break;
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : "Action failed." }, { status: 400 });
  }
}
