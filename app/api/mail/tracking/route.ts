// app/api/mail/tracking/route.ts
// Returns tracking stats for sent emails in an account.
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });

  const accountId = req.nextUrl.searchParams.get("accountId") || "";
  const limit     = Math.min(50, parseInt(req.nextUrl.searchParams.get("limit") || "20"));

  if (!accountId) return NextResponse.json({ ok: false, error: "accountId required." }, { status: 400 });

  // Verify ownership
  const account = await db.mailAccount.findFirst({ where: { id: accountId, userId: user.id } });
  if (!account) return NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });

  const pixels = await db.emailTrackingPixel.findMany({
    where: { accountId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true, to: true, subject: true,
      opens: true, lastOpenAt: true,
      clicks: true, lastClickAt: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ ok: true, tracking: pixels });
}
