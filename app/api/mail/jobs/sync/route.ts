import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAccountConfig } from "@/lib/mail/accounts";
import { syncFolderToDb } from "@/lib/mail/sync";

export async function POST(req: NextRequest) {
  const secret = process.env.CARIMAIL_CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const accountId = body.accountId as string | undefined;
  const folder = String(body.folder || "INBOX");
  const accounts = await db.mailAccount.findMany({
    where: { isActive: true, ...(accountId ? { id: accountId } : {}) },
    select: { id: true, userId: true },
  });
  const results = [];
  for (const account of accounts) {
    try {
      const { imap } = await getAccountConfig(account.id, account.userId);
      const result = await syncFolderToDb(account.id, imap, folder, Number(body.limit || 40));
      results.push({ accountId: account.id, ok: true, ...result });
    } catch (err) {
      results.push({ accountId: account.id, ok: false, error: err instanceof Error ? err.message : "Sync failed." });
    }
  }
  return NextResponse.json({ ok: true, results });
}

export async function GET(req: NextRequest) {
  return POST(req);
}
