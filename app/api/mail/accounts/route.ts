// app/api/mail/accounts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { encryptAccountPassword } from "@/lib/crypto";
import { testConnection } from "@/lib/mail/imap";

const addSchema = z.object({
  emailAddress: z.string().email(),
  label: z.string().optional(),
  password: z.string().min(1),
  imapHost: z.string().min(1),
  imapPort: z.number().int().default(993),
  imapSecure: z.boolean().default(true),
  smtpHost: z.string().min(1),
  smtpPort: z.number().int().default(465),
  smtpSecure: z.boolean().default(true),
});

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });

  const accounts = await db.mailAccount.findMany({
    where: { userId: user.id, isActive: true },
    select: {
      id: true, emailAddress: true, label: true,
      imapHost: true, imapPort: true, imapSecure: true,
      smtpHost: true, smtpPort: true, smtpSecure: true,
      isPrimary: true, lastSyncedAt: true, createdAt: true,
    },
    orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
  });

  return NextResponse.json({ ok: true, accounts });
}

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });

  try {
    const body = await req.json();

    // Delete action
    if (body.action === "delete") {
      await db.mailAccount.updateMany({
        where: { id: body.id, userId: user.id },
        data: { isActive: false },
      });
      return NextResponse.json({ ok: true });
    }

    // Set primary
    if (body.action === "set-primary") {
      await db.mailAccount.updateMany({ where: { userId: user.id }, data: { isPrimary: false } });
      await db.mailAccount.update({ where: { id: body.id }, data: { isPrimary: true } });
      return NextResponse.json({ ok: true });
    }

    // Add account
    const parsed = addSchema.parse(body);

    // Test IMAP connection first
    await testConnection({
      host: parsed.imapHost,
      port: parsed.imapPort,
      secure: parsed.imapSecure,
      user: parsed.emailAddress,
      password: parsed.password,
    });

    const encryptedPassword = encryptAccountPassword(parsed.password);
    const isFirst = (await db.mailAccount.count({ where: { userId: user.id, isActive: true } })) === 0;

    const account = await db.mailAccount.upsert({
      where: { userId_emailAddress: { userId: user.id, emailAddress: parsed.emailAddress } },
      update: { encryptedPassword, imapHost: parsed.imapHost, imapPort: parsed.imapPort, imapSecure: parsed.imapSecure, smtpHost: parsed.smtpHost, smtpPort: parsed.smtpPort, smtpSecure: parsed.smtpSecure, label: parsed.label, isActive: true },
      create: { userId: user.id, emailAddress: parsed.emailAddress, label: parsed.label, encryptedPassword, imapHost: parsed.imapHost, imapPort: parsed.imapPort, imapSecure: parsed.imapSecure, smtpHost: parsed.smtpHost, smtpPort: parsed.smtpPort, smtpSecure: parsed.smtpSecure, isPrimary: isFirst },
    });

    return NextResponse.json({ ok: true, accountId: account.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to add account.";
    const isAuth = message.toLowerCase().includes("auth") || message.toLowerCase().includes("invalid") || message.toLowerCase().includes("535");
    return NextResponse.json({ ok: false, error: isAuth ? "Could not connect — check your email and password." : message }, { status: 400 });
  }
}
