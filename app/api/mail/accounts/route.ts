import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { encryptAccountPassword } from "@/lib/crypto";
import { testConnection as testImapConnection } from "@/lib/mail/imap";
import { testSmtpConnection } from "@/lib/mail/smtp";

const addSchema = z.object({
  emailAddress: z.string().email(),
  label: z.string().optional(),
  password: z.string().min(1),
  imapHost: z.string().min(1),
  imapPort: z.coerce.number().int().default(993),
  imapSecure: z.boolean().default(true),
  smtpHost: z.string().min(1),
  smtpPort: z.coerce.number().int().default(465),
  smtpSecure: z.boolean().default(true),
});

function getConnectionHint(emailAddress: string, imapHost: string, smtpHost: string) {
  const email = emailAddress.toLowerCase();
  const imap = imapHost.toLowerCase();
  const smtp = smtpHost.toLowerCase();

  if (email.endsWith("@gmail.com") || imap.includes("gmail.com") || smtp.includes("gmail.com")) {
    return "For Gmail, use a Google App Password instead of your normal password.";
  }

  if (
    email.endsWith("@outlook.com") ||
    email.endsWith("@hotmail.com") ||
    email.endsWith("@live.com") ||
    imap.includes("office365.com") ||
    smtp.includes("office365.com") ||
    imap.includes("outlook.com") ||
    smtp.includes("outlook.com")
  ) {
    return "For Outlook or Microsoft 365, confirm IMAP is enabled and use the correct mailbox password or app password if required.";
  }

  if (email.endsWith("@yahoo.com") || imap.includes("yahoo.com") || smtp.includes("yahoo.com")) {
    return "For Yahoo, use an App Password instead of your regular password.";
  }

  return "Check your login, IMAP and SMTP hosts, ports, encryption settings, and whether IMAP/SMTP access is enabled for this mailbox.";
}

function isConnectionError(message: string) {
  const lower = message.toLowerCase();

  return (
    lower.includes("auth") ||
    lower.includes("invalid") ||
    lower.includes("login") ||
    lower.includes("authentication") ||
    lower.includes("command failed") ||
    lower.includes("timeout") ||
    lower.includes("econnreset") ||
    lower.includes("enotfound") ||
    lower.includes("certificate") ||
    lower.includes("self signed") ||
    lower.includes("535") ||
    lower.includes("no such host") ||
    lower.includes("unable to") ||
    lower.includes("connect")
  );
}

export async function GET() {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  const accounts = await db.mailAccount.findMany({
    where: { userId: user.id, isActive: true },
    select: {
      id: true,
      emailAddress: true,
      label: true,
      imapHost: true,
      imapPort: true,
      imapSecure: true,
      smtpHost: true,
      smtpPort: true,
      smtpSecure: true,
      isPrimary: true,
      lastSyncedAt: true,
      createdAt: true,
    },
    orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
  });

  return NextResponse.json({ ok: true, accounts });
}

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await req.json();

    if (typeof body === "object" && body !== null && "action" in body) {
      const action = (body as { action?: string }).action;

      if (action === "delete") {
        const id = (body as { id?: string }).id;

        await db.mailAccount.updateMany({
          where: { id, userId: user.id },
          data: { isActive: false },
        });

        return NextResponse.json({ ok: true });
      }

      if (action === "set-primary") {
        const id = (body as { id?: string }).id;

        const target = await db.mailAccount.findFirst({
          where: { id, userId: user.id, isActive: true },
          select: { id: true },
        });

        if (!target) {
          return NextResponse.json({ ok: false, error: "Account not found." }, { status: 404 });
        }

        await db.mailAccount.updateMany({
          where: { userId: user.id },
          data: { isPrimary: false },
        });

        await db.mailAccount.update({
          where: { id: target.id },
          data: { isPrimary: true },
        });

        return NextResponse.json({ ok: true });
      }
    }

    const parsed = addSchema.parse(body);

    await testImapConnection({
      host: parsed.imapHost,
      port: parsed.imapPort,
      secure: parsed.imapSecure,
      user: parsed.emailAddress,
      password: parsed.password,
    });

    await testSmtpConnection({
      host: parsed.smtpHost,
      port: parsed.smtpPort,
      secure: parsed.smtpSecure,
      user: parsed.emailAddress,
      password: parsed.password,
    });

    const encryptedPassword = encryptAccountPassword(parsed.password);
    const isFirst =
      (await db.mailAccount.count({
        where: { userId: user.id, isActive: true },
      })) === 0;

    const account = await db.mailAccount.upsert({
      where: {
        userId_emailAddress: {
          userId: user.id,
          emailAddress: parsed.emailAddress,
        },
      },
      update: {
        encryptedPassword,
        imapHost: parsed.imapHost,
        imapPort: parsed.imapPort,
        imapSecure: parsed.imapSecure,
        smtpHost: parsed.smtpHost,
        smtpPort: parsed.smtpPort,
        smtpSecure: parsed.smtpSecure,
        label: parsed.label,
        isActive: true,
      },
      create: {
        userId: user.id,
        emailAddress: parsed.emailAddress,
        label: parsed.label,
        encryptedPassword,
        imapHost: parsed.imapHost,
        imapPort: parsed.imapPort,
        imapSecure: parsed.imapSecure,
        smtpHost: parsed.smtpHost,
        smtpPort: parsed.smtpPort,
        smtpSecure: parsed.smtpSecure,
        isPrimary: isFirst,
      },
    });

    return NextResponse.json({ ok: true, accountId: account.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to add account.";

    if (isConnectionError(message)) {
      const input = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
      const hint = getConnectionHint(
        String(input.emailAddress ?? ""),
        String(input.imapHost ?? ""),
        String(input.smtpHost ?? "")
      );

      return NextResponse.json(
        {
          ok: false,
          error: "Could not connect to the mailbox.",
          hint,
          details: message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { ok: false, error: message || "Failed to add account." },
      { status: 400 }
    );
  }
}