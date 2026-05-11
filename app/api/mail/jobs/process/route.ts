import { NextRequest, NextResponse } from "next/server";
import { processScheduledEmails } from "@/lib/mail/features";

export async function POST(req: NextRequest) {
  const secret = process.env.CARIMAIL_CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }
  const results = await processScheduledEmails();
  return NextResponse.json({ ok: true, processed: results.length, results });
}

export async function GET(req: NextRequest) {
  return POST(req);
}
