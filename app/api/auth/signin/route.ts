// app/api/auth/signin/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/crypto";
import { createSession, setSessionCookie, clearSession } from "@/lib/auth";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.action === "signout") {
      await clearSession();
      return NextResponse.json({ ok: true });
    }

    const { email, password } = schema.parse(body);

    const user = await db.user.findUnique({ where: { email } });
    if (!user?.passwordHash) {
      // Delay to prevent timing attacks
      await new Promise((r) => setTimeout(r, 300));
      return NextResponse.json({ ok: false, error: "Invalid email or password." }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ ok: false, error: "Invalid email or password." }, { status: 401 });
    }

    const token = await createSession(user.id);
    await setSessionCookie(token);

    return NextResponse.json({ ok: true, name: user.name });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sign in failed.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
