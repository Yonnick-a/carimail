// app/api/auth/2fa/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession, createSession, setSessionCookie } from "@/lib/auth";
import {
  generateTotpSecret, verifyTotpCode, getOtpAuthUri,
  generateBackupCodes, hashBackupCodes, verifyBackupCode,
  createTwoFactorChallenge, verifyTwoFactorChallenge,
} from "@/lib/totp";
import { encryptAccountPassword, decryptAccountPassword } from "@/lib/crypto";

const CHALLENGE_COOKIE = "cm_2fa_challenge";

// ── GET /api/auth/2fa — return 2FA status + generate setup data ───────────────
export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });

  const dbUser = await db.user.findUnique({
    where: { id: user.id },
    select: { twoFactorEnabled: true },
  });

  if (dbUser?.twoFactorEnabled) {
    return NextResponse.json({ ok: true, enabled: true });
  }

  // Generate a new secret for setup (not saved until verified)
  const secret = generateTotpSecret();
  const uri = getOtpAuthUri(secret, user.email);
  return NextResponse.json({ ok: true, enabled: false, secret, uri });
}

// ── POST /api/auth/2fa — enable / disable / challenge ────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    // ── challenge: verify TOTP code during login ──────────────────────────
    if (action === "challenge") {
      const cookieStore = await cookies();
      const challengeToken = cookieStore.get(CHALLENGE_COOKIE)?.value;
      if (!challengeToken) {
        return NextResponse.json({ ok: false, error: "No challenge in progress. Please sign in again." }, { status: 400 });
      }

      const userId = verifyTwoFactorChallenge(challengeToken);
      if (!userId) {
        cookieStore.delete(CHALLENGE_COOKIE);
        return NextResponse.json({ ok: false, error: "Challenge expired. Please sign in again." }, { status: 400 });
      }

      const { code } = z.object({ code: z.string().min(1) }).parse(body);

      const dbUser = await db.user.findUnique({
        where: { id: userId },
        select: { twoFactorSecret: true, backupCodes: true, twoFactorEnabled: true },
      });
      if (!dbUser?.twoFactorEnabled || !dbUser.twoFactorSecret) {
        return NextResponse.json({ ok: false, error: "Two-factor authentication is not configured." }, { status: 400 });
      }

      const secret = decryptAccountPassword(dbUser.twoFactorSecret);
      const cleanCode = code.replace(/\s/g, "");

      // Try TOTP first
      let valid = verifyTotpCode(secret, cleanCode);

      // Try backup codes if TOTP failed
      if (!valid) {
        const backupHashes: string[] = JSON.parse(dbUser.backupCodes || "[]");
        const usedIdx = await verifyBackupCode(cleanCode, backupHashes);
        if (usedIdx >= 0) {
          valid = true;
          // Remove the used backup code
          backupHashes.splice(usedIdx, 1);
          await db.user.update({
            where: { id: userId },
            data: { backupCodes: JSON.stringify(backupHashes) },
          });
        }
      }

      if (!valid) {
        return NextResponse.json({ ok: false, error: "Invalid code. Try again." }, { status: 401 });
      }

      // Success — create real session
      const token = await createSession(userId);
      await setSessionCookie(token);
      cookieStore.delete(CHALLENGE_COOKIE);

      return NextResponse.json({ ok: true });
    }

    // All other actions require an active session
    const user = await getSession();
    if (!user) return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });

    // ── enable: verify code and persist secret ────────────────────────────
    if (action === "enable") {
      const { secret, code } = z.object({
        secret: z.string().min(16),
        code: z.string().length(6),
      }).parse(body);

      if (!verifyTotpCode(secret, code)) {
        return NextResponse.json({ ok: false, error: "Invalid code — make sure your authenticator time is correct." }, { status: 400 });
      }

      const plainCodes = generateBackupCodes();
      const hashedCodes = await hashBackupCodes(plainCodes);

      await db.user.update({
        where: { id: user.id },
        data: {
          twoFactorEnabled: true,
          twoFactorSecret: encryptAccountPassword(secret),
          backupCodes: JSON.stringify(hashedCodes),
        },
      });

      return NextResponse.json({ ok: true, backupCodes: plainCodes });
    }

    // ── disable: verify current TOTP code then disable ────────────────────
    if (action === "disable") {
      const { code } = z.object({ code: z.string().min(1) }).parse(body);

      const dbUser = await db.user.findUnique({
        where: { id: user.id },
        select: { twoFactorSecret: true, twoFactorEnabled: true },
      });
      if (!dbUser?.twoFactorEnabled || !dbUser.twoFactorSecret) {
        return NextResponse.json({ ok: false, error: "2FA is not enabled." }, { status: 400 });
      }

      const secret = decryptAccountPassword(dbUser.twoFactorSecret);
      if (!verifyTotpCode(secret, code.replace(/\s/g, ""))) {
        return NextResponse.json({ ok: false, error: "Invalid code." }, { status: 401 });
      }

      await db.user.update({
        where: { id: user.id },
        data: { twoFactorEnabled: false, twoFactorSecret: null, backupCodes: "[]" },
      });

      return NextResponse.json({ ok: true });
    }

    // ── regenerate-backup: generate new backup codes ──────────────────────
    if (action === "regenerate-backup") {
      const { code } = z.object({ code: z.string().min(1) }).parse(body);

      const dbUser = await db.user.findUnique({
        where: { id: user.id },
        select: { twoFactorSecret: true, twoFactorEnabled: true },
      });
      if (!dbUser?.twoFactorEnabled || !dbUser.twoFactorSecret) {
        return NextResponse.json({ ok: false, error: "2FA is not enabled." }, { status: 400 });
      }

      const secret = decryptAccountPassword(dbUser.twoFactorSecret);
      if (!verifyTotpCode(secret, code.replace(/\s/g, ""))) {
        return NextResponse.json({ ok: false, error: "Invalid code." }, { status: 401 });
      }

      const plainCodes = generateBackupCodes();
      const hashedCodes = await hashBackupCodes(plainCodes);
      await db.user.update({
        where: { id: user.id },
        data: { backupCodes: JSON.stringify(hashedCodes) },
      });

      return NextResponse.json({ ok: true, backupCodes: plainCodes });
    }

    return NextResponse.json({ ok: false, error: "Unknown action." }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Request failed." },
      { status: 400 }
    );
  }
}

// Export challenge cookie name so signin route can set it
export { CHALLENGE_COOKIE };
