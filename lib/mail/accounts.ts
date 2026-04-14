// lib/mail/accounts.ts
import "server-only";
import { db } from "@/lib/db";
import { decryptAccountPassword } from "@/lib/crypto";
import type { ImapConfig } from "./imap";
import type { SmtpConfig } from "./smtp";

export async function getAccountConfig(accountId: string, userId: string) {
  const account = await db.mailAccount.findFirst({
    where: { id: accountId, userId, isActive: true },
  });
  if (!account) throw new Error("Account not found.");

  const password = decryptAccountPassword(account.encryptedPassword);

  const imap: ImapConfig = {
    host: account.imapHost,
    port: account.imapPort,
    secure: account.imapSecure,
    user: account.emailAddress,
    password,
  };

  const smtp: SmtpConfig = {
    host: account.smtpHost,
    port: account.smtpPort,
    secure: account.smtpSecure,
    user: account.emailAddress,
    password,
  };

  return { account, imap, smtp };
}

export async function getPrimaryAccount(userId: string) {
  const account = await db.mailAccount.findFirst({
    where: { userId, isActive: true },
    orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
  });
  if (!account) return null;

  const password = decryptAccountPassword(account.encryptedPassword);

  const imap: ImapConfig = {
    host: account.imapHost,
    port: account.imapPort,
    secure: account.imapSecure,
    user: account.emailAddress,
    password,
  };

  const smtp: SmtpConfig = {
    host: account.smtpHost,
    port: account.smtpPort,
    secure: account.smtpSecure,
    user: account.emailAddress,
    password,
  };

  return { account, imap, smtp };
}
