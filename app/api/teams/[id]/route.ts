// app/api/teams/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { randomBytes } from "crypto";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

async function getTeamAsMember(teamId: string, userId: string) {
  const member = await db.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId } },
  });
  if (!member) return null;
  const team = await db.team.findUnique({
    where: { id: teamId },
    include: {
      members: { include: { user: { select: { id: true, name: true, email: true } } } },
      invites: { where: { usedAt: null, expiresAt: { gt: new Date() } } },
      sharedAccounts: { include: { account: { select: { id: true, emailAddress: true, label: true } } } },
    },
  });
  return team ? { team, role: member.role } : null;
}

// ── GET — team detail ─────────────────────────────────────────────────────────
export async function GET(_req: NextRequest, { params }: Params) {
  const user = await getSession();
  if (!user) return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  const { id } = await params;
  const result = await getTeamAsMember(id, user.id);
  if (!result) return NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });
  return NextResponse.json({ ok: true, ...result });
}

// ── POST — team actions ───────────────────────────────────────────────────────
export async function POST(req: NextRequest, { params }: Params) {
  const user = await getSession();
  if (!user) return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  const { id: teamId } = await params;

  const result = await getTeamAsMember(teamId, user.id);
  if (!result) return NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });

  const body = await req.json();

  // ── Invite member ──────────────────────────────────────────────────────────
  if (body.action === "invite") {
    if (result.role === "member") return NextResponse.json({ ok: false, error: "Only admins can invite." }, { status: 403 });
    const { email, role } = z.object({ email: z.string().email(), role: z.enum(["admin","member"]).default("member") }).parse(body);
    const token     = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const invite = await db.teamInvite.create({ data: { teamId, email, token, role, expiresAt } });
    const link = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/teams/invite?token=${token}`;
    return NextResponse.json({ ok: true, invite, link });
  }

  // ── Add shared account ─────────────────────────────────────────────────────
  if (body.action === "add-account") {
    if (result.role === "member") return NextResponse.json({ ok: false, error: "Only admins can share accounts." }, { status: 403 });
    const { accountId } = z.object({ accountId: z.string() }).parse(body);
    // Verify owner of account
    const account = await db.mailAccount.findFirst({ where: { id: accountId, userId: user.id } });
    if (!account) return NextResponse.json({ ok: false, error: "Account not found." }, { status: 404 });
    await db.teamMailAccount.upsert({
      where:  { teamId_accountId: { teamId, accountId } },
      update: {},
      create: { teamId, accountId },
    });
    return NextResponse.json({ ok: true });
  }

  // ── Remove shared account ──────────────────────────────────────────────────
  if (body.action === "remove-account") {
    if (result.role === "member") return NextResponse.json({ ok: false, error: "Only admins can manage accounts." }, { status: 403 });
    const { accountId } = z.object({ accountId: z.string() }).parse(body);
    await db.teamMailAccount.deleteMany({ where: { teamId, accountId } });
    return NextResponse.json({ ok: true });
  }

  // ── Remove member ──────────────────────────────────────────────────────────
  if (body.action === "remove-member") {
    if (result.role === "member") return NextResponse.json({ ok: false, error: "Only admins can remove members." }, { status: 403 });
    const { userId: targetId } = z.object({ userId: z.string() }).parse(body);
    if (targetId === result.team.ownerId) return NextResponse.json({ ok: false, error: "Cannot remove the team owner." }, { status: 400 });
    await db.teamMember.deleteMany({ where: { teamId, userId: targetId } });
    return NextResponse.json({ ok: true });
  }

  // ── Delete team ────────────────────────────────────────────────────────────
  if (body.action === "delete") {
    if (user.id !== result.team.ownerId) return NextResponse.json({ ok: false, error: "Only the owner can delete the team." }, { status: 403 });
    await db.team.delete({ where: { id: teamId } });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: false, error: "Unknown action." }, { status: 400 });
}
