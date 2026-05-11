// lib/mail/accounts.ts
import "server-only";
import { db } from "@/lib/db";
import { decryptAccountPassword, encryptAccountPassword } from "@/lib/crypto";
import type { ImapConfig } from "./imap";
import type { SmtpConfig } from "./smtp";

export async function getAccountConfig(accountId: string, userId: string) {
  const account = await db.mailAccount.findFirst({
    where: { id: accountId, userId, isActive: true },
  });
  if (!account) throw new Error("Account not found.");

  const token = await getOAuthAccessToken(account as any);
  const password = account.encryptedPassword ? decryptAccountPassword(account.encryptedPassword) : "";

  const imap: ImapConfig = {
    host: account.imapHost,
    port: account.imapPort,
    secure: account.imapSecure,
    user: account.emailAddress,
    password,
    accessToken: token || undefined,
  };

  const smtp: SmtpConfig = {
    host: account.smtpHost,
    port: account.smtpPort,
    secure: account.smtpSecure,
    user: account.emailAddress,
    password,
    accessToken: token || undefined,
  };

  return { account, imap, smtp };
}

async function getOAuthAccessToken(account: {
  id: string;
  authType?: string;
  oauthProvider?: string | null;
  encryptedAccessToken?: string | null;
  encryptedRefreshToken?: string | null;
  oauthExpiresAt?: Date | null;
}) {
  if (account.authType !== "oauth") return null;
  if (account.encryptedAccessToken && account.oauthExpiresAt && account.oauthExpiresAt.getTime() > Date.now() + 60_000) {
    return decryptAccountPassword(account.encryptedAccessToken);
  }
  if (!account.encryptedRefreshToken || !account.oauthProvider) return account.encryptedAccessToken ? decryptAccountPassword(account.encryptedAccessToken) : null;

  const refreshed = await refreshOAuthToken(account.oauthProvider, decryptAccountPassword(account.encryptedRefreshToken));
  await (db as any).mailAccount.update({
    where: { id: account.id },
    data: {
      encryptedAccessToken: encryptAccountPassword(refreshed.accessToken),
      encryptedRefreshToken: refreshed.refreshToken ? encryptAccountPassword(refreshed.refreshToken) : account.encryptedRefreshToken,
      oauthExpiresAt: refreshed.expiresAt,
    },
  });
  return refreshed.accessToken;
}

async function refreshOAuthToken(provider: string, refreshToken: string) {
  const config = getOAuthProviderConfig(provider);
  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });
  const res = await fetch(config.tokenUrl, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || data.error || "OAuth refresh failed.");
  return {
    accessToken: String(data.access_token),
    refreshToken: data.refresh_token ? String(data.refresh_token) : undefined,
    expiresAt: new Date(Date.now() + Number(data.expires_in || 3600) * 1000),
  };
}

export function getOAuthProviderConfig(provider: string) {
  if (provider === "google") {
    return {
      clientId: process.env.GOOGLE_OAUTH_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET || "",
      authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenUrl: "https://oauth2.googleapis.com/token",
      scopes: ["openid", "email", "https://mail.google.com/"],
      imapHost: "imap.gmail.com",
      imapPort: 993,
      smtpHost: "smtp.gmail.com",
      smtpPort: 465,
    };
  }
  if (provider === "microsoft") {
    return {
      clientId: process.env.MICROSOFT_OAUTH_CLIENT_ID || "",
      clientSecret: process.env.MICROSOFT_OAUTH_CLIENT_SECRET || "",
      authUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
      tokenUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
      scopes: ["openid", "email", "offline_access", "https://outlook.office.com/IMAP.AccessAsUser.All", "https://outlook.office.com/SMTP.Send"],
      imapHost: "outlook.office365.com",
      imapPort: 993,
      smtpHost: "smtp.office365.com",
      smtpPort: 587,
    };
  }
  throw new Error("Unsupported OAuth provider.");
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
