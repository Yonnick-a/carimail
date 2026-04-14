// lib/auth.ts
import "server-only";
import { cookies } from "next/headers";
import { db } from "./db";

const SESSION_COOKIE = "cm_session";
const SESSION_EXPIRY_DAYS = 30;

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
};

export async function createSession(userId: string): Promise<string> {
  const token = crypto.randomUUID() + crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS);

  await db.session.create({
    data: { userId, token, expiresAt },
  });

  return token;
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * SESSION_EXPIRY_DAYS,
    path: "/",
  });
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (!token) return null;

    const session = await db.session.findUnique({
      where: { token },
      include: { user: { select: { id: true, email: true, name: true } } },
    });

    if (!session || session.expiresAt < new Date()) {
      if (session) await db.session.delete({ where: { token } });
      return null;
    }

    return session.user;
  } catch {
    return null;
  }
}

export async function clearSession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (token) {
      await db.session.delete({ where: { token } }).catch(() => {});
      cookieStore.delete(SESSION_COOKIE);
    }
  } catch {}
}

export async function requireAuth(): Promise<SessionUser> {
  const { redirect } = await import("next/navigation");
  const user = await getSession();
  if (!user) redirect("/sign-in");
  return user;
}
