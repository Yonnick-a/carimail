// app/api/mail/send/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { getAccountConfig } from "@/lib/mail/accounts";
import { appendToSent } from "@/lib/mail/imap";
import { sendEmail } from "@/lib/mail/smtp";
import { db } from "@/lib/db";
import { injectTracking } from "@/lib/mail/tracking";

const schema = z.object({
  accountId:   z.string(),
  to:          z.string().min(1),
  cc:          z.string().optional(),
  bcc:         z.string().optional(),
  subject:     z.string().min(1),
  body:        z.string().min(1),
  isHtml:      z.boolean().optional(),
  inReplyTo:   z.string().optional(),
  references:  z.string().optional(),
  disableTracking: z.boolean().optional(),
  attachments: z.array(z.object({
    filename:    z.string().min(1),
    contentType: z.string().optional(),
    content:     z.string().min(1),
  })).optional(),
});

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });

  try {
    const body  = await req.json();
    const parsed = schema.parse(body);
    const { account, smtp, imap } = await getAccountConfig(parsed.accountId, user.id);

    let emailBody = parsed.body;
    let trackPixelId: string | null = null;

    // Inject open/click tracking for HTML emails (unless explicitly disabled)
    if (parsed.isHtml && !parsed.disableTracking) {
      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL ??
        `https://${req.headers.get("host") ?? "localhost"}`;

      const pixel = await db.emailTrackingPixel.create({
        data: {
          accountId: parsed.accountId,
          to:        parsed.to,
          subject:   parsed.subject,
        },
      });
      trackPixelId = pixel.id;
      emailBody = injectTracking(emailBody, pixel.id, baseUrl);
    }

    const sent = await sendEmail(smtp, {
      from:        account.emailAddress,
      to:          parsed.to,
      cc:          parsed.cc,
      bcc:         parsed.bcc,
      subject:     parsed.subject,
      body:        emailBody,
      isHtml:      parsed.isHtml,
      inReplyTo:   parsed.inReplyTo,
      references:  parsed.references,
      attachments: parsed.attachments,
    });

    if (sent.raw) {
      await appendToSent(imap, sent.raw).catch(() => {});
    }

    return NextResponse.json({ ok: true, trackPixelId });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Failed to send." },
      { status: 400 }
    );
  }
}
