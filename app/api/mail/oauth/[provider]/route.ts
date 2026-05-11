import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { getSession } from "@/lib/auth";
import { encryptAccountPassword } from "@/lib/crypto";
import { db } from "@/lib/db";
import { getOAuthProviderConfig } from "@/lib/mail/accounts";

function appUrl(req: NextRequest) {
  return process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
}

function sign(value: string) {
  return createHmac("sha256", process.env.CARIMAIL_ENCRYPTION_SECRET || "dev").update(value).digest("hex");
}

function createState(userId: string, provider: string) {
  const payload = Buffer.from(JSON.stringify({
    userId,
    provider,
    exp: Date.now() + 10 * 60_000,
    nonce: crypto.randomUUID(),
  })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function verifyState(state: string, userId: string, provider: string) {
  const [payload, signature] = state.split(".");
  if (!payload || !signature) return false;
  const expected = sign(payload);
  if (signature.length !== expected.length) return false;
  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false;
  const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { userId: string; provider: string; exp: number };
  return data.userId === userId && data.provider === provider && data.exp > Date.now();
}

function decodeJwtPayload(token?: string) {
  if (!token) return {};
  try {
    const [, payload] = token.split(".");
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ provider: string }> }) {
  const user = await getSession();
  if (!user) return NextResponse.redirect(new URL("/sign-in", req.url));

  const { provider } = await params;
  const config = getOAuthProviderConfig(provider);
  if (!config.clientId || !config.clientSecret) {
    return NextResponse.json({ ok: false, error: `${provider} OAuth is not configured.` }, { status: 400 });
  }

  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const redirectUri = `${appUrl(req)}/api/mail/oauth/${provider}`;

  if (!code) {
    const url = new URL(config.authUrl);
    url.searchParams.set("client_id", config.clientId);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", config.scopes.join(" "));
    url.searchParams.set("state", createState(user.id, provider));
    url.searchParams.set("access_type", "offline");
    url.searchParams.set("prompt", provider === "google" ? "consent" : "select_account");
    return NextResponse.redirect(url);
  }

  if (!state || !verifyState(state, user.id, provider)) {
    return NextResponse.json({ ok: false, error: "Invalid OAuth state." }, { status: 400 });
  }

  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  });

  const tokenRes = await fetch(config.tokenUrl, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body });
  const token = await tokenRes.json();
  if (!tokenRes.ok) {
    return NextResponse.json({ ok: false, error: token.error_description || token.error || "OAuth token exchange failed." }, { status: 400 });
  }

  const claims = decodeJwtPayload(token.id_token);
  const emailAddress = String(claims.email || claims.preferred_username || "");
  if (!emailAddress || !emailAddress.includes("@")) {
    return NextResponse.json({ ok: false, error: "Could not determine mailbox email address from OAuth response." }, { status: 400 });
  }

  const isFirst = await (db as any).mailAccount.count({ where: { userId: user.id, isActive: true } }) === 0;
  await (db as any).mailAccount.upsert({
    where: { userId_emailAddress: { userId: user.id, emailAddress } },
    update: {
      authType: "oauth",
      oauthProvider: provider,
      encryptedPassword: encryptAccountPassword(""),
      encryptedAccessToken: encryptAccountPassword(String(token.access_token)),
      encryptedRefreshToken: token.refresh_token ? encryptAccountPassword(String(token.refresh_token)) : undefined,
      oauthExpiresAt: new Date(Date.now() + Number(token.expires_in || 3600) * 1000),
      imapHost: config.imapHost,
      imapPort: config.imapPort,
      imapSecure: true,
      smtpHost: config.smtpHost,
      smtpPort: config.smtpPort,
      smtpSecure: config.smtpPort !== 587,
      isActive: true,
    },
    create: {
      userId: user.id,
      emailAddress,
      label: provider === "google" ? "Gmail" : "Microsoft",
      authType: "oauth",
      oauthProvider: provider,
      encryptedPassword: encryptAccountPassword(""),
      encryptedAccessToken: encryptAccountPassword(String(token.access_token)),
      encryptedRefreshToken: token.refresh_token ? encryptAccountPassword(String(token.refresh_token)) : null,
      oauthExpiresAt: new Date(Date.now() + Number(token.expires_in || 3600) * 1000),
      imapHost: config.imapHost,
      imapPort: config.imapPort,
      imapSecure: true,
      smtpHost: config.smtpHost,
      smtpPort: config.smtpPort,
      smtpSecure: config.smtpPort !== 587,
      isPrimary: isFirst,
    },
  });

  return NextResponse.redirect(new URL("/settings/accounts?connected=oauth", req.url));
}
