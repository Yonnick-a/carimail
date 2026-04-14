// app/api/auth/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/crypto";

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });

  const dbUser = await db.user.findUnique({
    where: { id: user.id },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  if (!dbUser) return NextResponse.json({ ok: false, error: "User not found." }, { status: 404 });
  return NextResponse.json({ ok: true, user: dbUser });
}

const updateProfileSchema = z.object({
  action: z.literal("update-profile"),
  name: z.string().min(1).max(100),
});

const changePasswordSchema = z.object({
  action: z.literal("change-password"),
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, "New password must be at least 8 characters."),
});

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });

  try {
    const body = await req.json();

    if (body.action === "update-profile") {
      const parsed = updateProfileSchema.parse(body);
      await db.user.update({
        where: { id: user.id },
        data: { name: parsed.name },
      });
      return NextResponse.json({ ok: true });
    }

    if (body.action === "change-password") {
      const parsed = changePasswordSchema.parse(body);

      const dbUser = await db.user.findUnique({
        where: { id: user.id },
        select: { passwordHash: true },
      });

      if (!dbUser?.passwordHash) {
        return NextResponse.json({ ok: false, error: "No password set on this account." }, { status: 400 });
      }

      const valid = await verifyPassword(parsed.currentPassword, dbUser.passwordHash);
      if (!valid) {
        return NextResponse.json({ ok: false, error: "Current password is incorrect." }, { status: 400 });
      }

      const newHash = await hashPassword(parsed.newPassword);
      await db.user.update({
        where: { id: user.id },
        data: { passwordHash: newHash },
      });

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: false, error: "Unknown action." }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Request failed.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
