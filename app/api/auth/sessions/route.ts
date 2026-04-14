// app/api/auth/sessions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { cookies } from "next/headers";

const SESSION_COOKIE = "cm_session";

type SessionListItem = {
  id: string;
  token: string;
  createdAt: Date;
  expiresAt: Date;
};

export async function GET() {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  const sessions: SessionListItem[] = await db.session.findMany({
    where: {
      userId: user.id,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
    select: { id: true, createdAt: true, expiresAt: true, token: true },
  });

  // Get current session token to mark it
  const cookieStore = await cookies();
  const currentToken = cookieStore.get(SESSION_COOKIE)?.value;

  // Sort current session first, don't expose tokens to client
  const sorted = sessions.sort((a, b) => {
    if (a.token === currentToken) return -1;
    if (b.token === currentToken) return 1;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  return NextResponse.json({
    ok: true,
    sessions: sorted.map(({ id, createdAt, expiresAt }) => ({
      id,
      createdAt: createdAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
    })),
  });
}

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const cookieStore = await cookies();
    const currentToken = cookieStore.get(SESSION_COOKIE)?.value;

    if (body.action === "revoke-all") {
      // Delete all sessions except the current one
      await db.session.deleteMany({
        where: {
          userId: user.id,
          NOT: { token: currentToken || "" },
        },
      });
      return NextResponse.json({ ok: true });
    }

    if (body.action === "revoke-all-including-current") {
      await db.session.deleteMany({ where: { userId: user.id } });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: false, error: "Unknown action." }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Failed." },
      { status: 400 }
    );
  }
}