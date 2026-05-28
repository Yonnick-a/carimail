// app/api/mail/health/route.ts
// Tests IMAP connectivity for an account and returns status + latency.
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAccountConfig } from "@/lib/mail/accounts";
import { testConnection } from "@/lib/mail/imap";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });

  const accountId = req.nextUrl.searchParams.get("accountId") || "";
  if (!accountId) return NextResponse.json({ ok: false, error: "accountId required." }, { status: 400 });

  const start = Date.now();
  try {
    const { imap } = await getAccountConfig(accountId, user.id);
    await testConnection(imap);
    return NextResponse.json({ ok: true, latencyMs: Date.now() - start });
  } catch (err) {
    return NextResponse.json({
      ok: false,
      latencyMs: Date.now() - start,
      error: err instanceof Error ? err.message : "Connection failed.",
    });
  }
}
