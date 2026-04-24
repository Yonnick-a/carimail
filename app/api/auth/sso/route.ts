// app/api/auth/sso/route.ts  — ADD THIS TO CARIMAIL
// Receives the signed token from the Hostcari portal, verifies it,
// finds or creates the user in the Carimail DB, then logs them in.

import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { db } from "@/lib/db";
import { createSession, setSessionCookie } from "@/lib/auth";

const SSO_TTL_SECONDS = 60;

type SSOPayload = {
  email: string;
  name: string | null;
  iat: number;
  exp: number;
};

function getSecret(): string {
  const s = process.env.CARIMAIL_SSO_SECRET;
  if (!s || s.length < 32) throw new Error("CARIMAIL_SSO_SECRET not configured.");
  return s;
}

function verify(token: string): SSOPayload {
  const [b64, sig] = token.split(".");
  if (!b64 || !sig) throw new Error("Malformed token.");

  // Verify signature
  const expectedSig = createHmac("sha256", getSecret()).update(b64).digest("base64url");
  if (sig !== expectedSig) throw new Error("Invalid token signature.");

  // Decode payload
  const payload = JSON.parse(Buffer.from(b64, "base64url").toString("utf8")) as SSOPayload;

  // Check expiry
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp < now) throw new Error("Token has expired.");
  if (payload.iat > now + 30) throw new Error("Token issued in the future."); // clock skew guard

  return payload;
}

export async function GET(req: NextRequest) {
  const portalUrl = process.env.HOSTCARI_PORTAL_URL || "https://portal.hostcari.com";
  const errorRedirect = `${portalUrl}?error=carimail_sso_failed`;

  try {
    const token = req.nextUrl.searchParams.get("token");
    if (!token) throw new Error("No token provided.");

    const payload = verify(token);

    // Find or create user in Carimail's own DB
    let user = await db.user.findUnique({ where: { email: payload.email } });

    if (!user) {
      // First SSO login — auto-create account (no password needed for SSO users)
      user = await db.user.create({
        data: {
          email: payload.email,
          name: payload.name,
          // passwordHash left null — SSO users can't use password login
          // unless they set a password later via profile settings
        },
      });
    } else if (payload.name && !user.name) {
      // Update name if they now have one
      user = await db.user.update({
        where: { id: user.id },
        data: { name: payload.name },
      });
    }

    // Create Carimail session
    const sessionToken = await createSession(user.id);
    await setSessionCookie(sessionToken);

    // Redirect to inbox
    return NextResponse.redirect(new URL("/inbox", req.url));

  } catch (err) {
    console.error("[SSO] Error:", err instanceof Error ? err.message : err);
    // Redirect back to portal with error
    return NextResponse.redirect(errorRedirect);
  }
}