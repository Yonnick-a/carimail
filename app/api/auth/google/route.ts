import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { db } from "@/lib/db";
import { createSession, getSession, setSessionCookie } from "@/lib/auth";
import { getOAuthProviderConfig } from "@/lib/mail/accounts";

function appUrl(req: NextRequest) {
  return process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
}

function sign(value: string) {
  return createHmac("sha256", process.env.CARIMAIL_ENCRYPTION_SECRET || "dev").update(value).digest("hex");
}

function createState() {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + 10 * 60_000, nonce: crypto.randomUUID() })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function verifyState(state: string) {
  const [payload, signature] = state.split(".");
  if (!payload || !signature) return false;
  const expected = sign(payload);
  if (signature.length !== expected.length) return false;
  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false;
  const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { exp: number };
  return data.exp > Date.now();
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

export async function GET(req: NextRequest) {
  const existing = await getSession();
  if (existing && !req.nextUrl.searchParams.get("code")) {
    return NextResponse.redirect(new URL("/inbox", req.url));
  }

  const config = getOAuthProviderConfig("google");
  if (!config.clientId || !config.clientSecret) {
    return NextResponse.json({ ok: false, error: "Google OAuth is not configured." }, { status: 400 });
  }

  const redirectUri = `${appUrl(req)}/api/auth/google`;
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");

  if (!code) {
    const url = new URL(config.authUrl);
    url.searchParams.set("client_id", config.clientId);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "openid email profile");
    url.searchParams.set("state", createState());
    url.searchParams.set("prompt", "select_account");
    return NextResponse.redirect(url);
  }

  if (!state || !verifyState(state)) {
    return NextResponse.json({ ok: false, error: "Invalid Google sign-in state." }, { status: 400 });
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
    return NextResponse.json({ ok: false, error: token.error_description || token.error || "Google sign-in failed." }, { status: 400 });
  }

  const claims = decodeJwtPayload(token.id_token);
  const email = String(claims.email || "");
  if (!email.includes("@")) {
    return NextResponse.json({ ok: false, error: "Google did not return an email address." }, { status: 400 });
  }

  const user = await db.user.upsert({
    where: { email },
    update: { name: claims.name ? String(claims.name) : undefined, emailVerified: new Date() },
    create: { email, name: claims.name ? String(claims.name) : null, emailVerified: new Date() },
  });

  const session = await createSession(user.id);
  await setSessionCookie(session);
  return NextResponse.redirect(new URL("/inbox", req.url));
}
