// app/api/auth/reset-password/route.ts  — ADD THIS TO CARIMAIL
//
// This handles TWO things:
//
// 1. POST { action: "request", email } 
//    → Generates a reset token, stores it, sends email (via your SMTP)
//    → For now logs the reset URL to console if no email configured
//
// 2. POST { action: "reset", token, newPassword }
//    → Validates token, sets new password, invalidates token
//
// 3. POST { action: "admin-reset", adminSecret, email, newPassword }
//    → Lets you (the admin) reset any user's password directly
//    → Protected by CARIMAIL_ADMIN_SECRET env var

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/crypto";
import { createHmac, randomBytes } from "crypto";
import { createTransport } from "nodemailer";

// ── Helpers ───────────────────────────────────────────────────────────

function generateResetToken(): string {
  return randomBytes(32).toString("hex");
}

async function sendResetEmail(email: string, resetUrl: string) {
  const smtpUrl = process.env.SMTP_URL; // e.g. smtp://user:pass@host:587

  if (!smtpUrl) {
    // No SMTP configured — log to console so you can manually send it
    console.log(`\n[PASSWORD RESET] No SMTP configured.`);
    console.log(`[PASSWORD RESET] Reset URL for ${email}:`);
    console.log(`[PASSWORD RESET] ${resetUrl}\n`);
    return;
  }

  const transporter = createTransport(smtpUrl);

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || "Carimail <noreply@hostcari.com>",
    to: email,
    subject: "Reset your Carimail password",
    text: `Hi,\n\nClick the link below to reset your Carimail password. This link expires in 1 hour.\n\n${resetUrl}\n\nIf you didn't request this, you can ignore this email.\n\n— The Hostcari Team`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;">
        <div style="margin-bottom:24px">
          <strong style="font-size:18px;color:#0F172A">Carimail</strong>
          <span style="font-size:13px;color:#94A3B8;margin-left:8px">by Hostcari</span>
        </div>
        <h1 style="font-size:22px;font-weight:800;color:#0F172A;margin:0 0 12px">Reset your password</h1>
        <p style="font-size:14px;color:#475569;line-height:1.7;margin:0 0 24px">
          Click the button below to reset your Carimail password. This link expires in <strong>1 hour</strong>.
        </p>
        <a href="${resetUrl}" style="display:inline-block;background:#F97316;color:#fff;font-weight:700;font-size:14px;padding:12px 24px;border-radius:12px;text-decoration:none;margin-bottom:24px">
          Reset password
        </a>
        <p style="font-size:12px;color:#94A3B8;line-height:1.6;margin:0">
          If you didn&rsquo;t request this, you can safely ignore this email.<br>
          This link expires in 1 hour.
        </p>
        <hr style="border:none;border-top:1px solid #E2E8F0;margin:24px 0">
        <p style="font-size:11px;color:#CBD5E1;margin:0">Hostcari &mdash; Carimail</p>
      </div>
    `,
  });
}

// ── Route handler ─────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // ── 1. Request reset (user-facing) ────────────────────────────────
    if (body.action === "request") {
      const { email } = z.object({ email: z.string().email() }).parse(body);

      // Always respond OK to prevent email enumeration
      const user = await db.user.findUnique({ where: { email } });
      if (!user) return NextResponse.json({ ok: true });

      // Invalidate old tokens
      await db.passwordResetToken.deleteMany({ where: { userId: user.id } });

      // Create new token (1 hour TTL)
      const token = generateResetToken();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
      await db.passwordResetToken.create({ data: { userId: user.id, token, expiresAt } });

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://mail.hostcari.com";
      const resetUrl = `${appUrl}/reset-password?token=${token}`;

      await sendResetEmail(email, resetUrl);

      return NextResponse.json({ ok: true });
    }

    // ── 2. Reset with token ───────────────────────────────────────────
    if (body.action === "reset") {
      const { token, newPassword } = z.object({
        token: z.string().min(1),
        newPassword: z.string().min(8, "Password must be at least 8 characters."),
      }).parse(body);

      const record = await db.passwordResetToken.findUnique({
        where: { token },
        include: { user: true },
      });

      if (!record) return NextResponse.json({ ok: false, error: "Invalid or expired reset link." }, { status: 400 });
      if (record.usedAt) return NextResponse.json({ ok: false, error: "This reset link has already been used." }, { status: 400 });
      if (record.expiresAt < new Date()) return NextResponse.json({ ok: false, error: "This reset link has expired. Please request a new one." }, { status: 400 });

      const passwordHash = await hashPassword(newPassword);

      await db.$transaction([
        db.user.update({ where: { id: record.userId }, data: { passwordHash } }),
        db.passwordResetToken.update({ where: { token }, data: { usedAt: new Date() } }),
        // Invalidate all sessions so they have to log back in
        db.session.deleteMany({ where: { userId: record.userId } }),
      ]);

      return NextResponse.json({ ok: true });
    }

    // ── 3. Admin reset (your internal tool) ───────────────────────────
    if (body.action === "admin-reset") {
      const adminSecret = process.env.CARIMAIL_ADMIN_SECRET;
      if (!adminSecret) return NextResponse.json({ ok: false, error: "Admin resets not configured." }, { status: 403 });

      const { secret, email, newPassword } = z.object({
        secret: z.string(),
        email: z.string().email(),
        newPassword: z.string().min(8),
      }).parse(body);

      // Constant-time comparison
      const expected = createHmac("sha256", adminSecret).update("admin-reset").digest("hex");
      const given = createHmac("sha256", secret).update("admin-reset").digest("hex");
      if (given !== expected) return NextResponse.json({ ok: false, error: "Invalid admin secret." }, { status: 403 });

      const user = await db.user.findUnique({ where: { email } });
      if (!user) return NextResponse.json({ ok: false, error: "User not found." }, { status: 404 });

      const passwordHash = await hashPassword(newPassword);
      await db.user.update({ where: { id: user.id }, data: { passwordHash } });
      // Optionally clear sessions
      await db.session.deleteMany({ where: { userId: user.id } });

      console.log(`[ADMIN RESET] Password reset for ${email} by admin.`);
      return NextResponse.json({ ok: true, message: `Password reset for ${email}.` });
    }

    return NextResponse.json({ ok: false, error: "Unknown action." }, { status: 400 });

  } catch (err) {
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : "Request failed." }, { status: 400 });
  }
}