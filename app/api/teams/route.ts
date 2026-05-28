// app/api/teams/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { randomBytes } from "crypto";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

// ── GET — list teams the current user belongs to ──────────────────────────────
export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });

  const memberships = await db.teamMember.findMany({
    where: { userId: user.id },
    include: {
      team: {
        include: {
          members: {
            include: { user: { select: { id: true, name: true, email: true } } },
          },
          invites: {
            where: { usedAt: null, expiresAt: { gt: new Date() } },
          },
          sharedAccounts: {
            include: { account: { select: { id: true, emailAddress: true, label: true } } },
          },
        },
      },
    },
  });

  const teams = memberships.map(m => ({
    ...m.team,
    myRole: m.role,
    memberCount: m.team.members.length,
  }));

  return NextResponse.json({ ok: true, teams });
}

// ── POST — create a new team ──────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });

  const body = await req.json();

  if (body.action === "accept-invite") {
    const { token } = z.object({ token: z.string() }).parse(body);
    const invite = await db.teamInvite.findUnique({ where: { token } });
    if (!invite || invite.usedAt || invite.expiresAt < new Date()) {
      return NextResponse.json({ ok: false, error: "Invite is invalid or expired." }, { status: 400 });
    }
    if (invite.email !== user.email) {
      return NextResponse.json({ ok: false, error: "This invite was sent to a different email address." }, { status: 403 });
    }
    // Check not already a member
    const existing = await db.teamMember.findUnique({ where: { teamId_userId: { teamId: invite.teamId, userId: user.id } } });
    if (!existing) {
      await db.teamMember.create({
        data: { teamId: invite.teamId, userId: user.id, role: invite.role },
      });
    }
    await db.teamInvite.update({ where: { token }, data: { usedAt: new Date() } });
    return NextResponse.json({ ok: true, teamId: invite.teamId });
  }

  const { name } = z.object({ name: z.string().min(1).max(80) }).parse(body);

  const team = await db.team.create({
    data: {
      name,
      ownerId: user.id,
      members: { create: { userId: user.id, role: "owner" } },
    },
  });

  return NextResponse.json({ ok: true, team });
}
