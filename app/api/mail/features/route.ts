import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { scheduleEmail } from "@/lib/mail/features";

const scheduledSchema = z.object({
  accountId: z.string(),
  scheduledAt: z.string(),
  payload: z.object({
    to: z.string().min(1),
    cc: z.string().optional(),
    bcc: z.string().optional(),
    subject: z.string().min(1),
    body: z.string().min(1),
    isHtml: z.boolean().optional(),
    attachments: z.array(z.object({ filename: z.string(), contentType: z.string().optional(), content: z.string() })).optional(),
  }),
});

export async function GET(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  const userId = user.id;
  const accountId = req.nextUrl.searchParams.get("accountId") || "";
  const type = req.nextUrl.searchParams.get("type") || "export";

  if (type === "export") {
    const accounts = await db.mailAccount.findMany({
      where: { userId: user.id, isActive: true },
      select: { emailAddress: true, label: true, imapHost: true, smtpHost: true, authType: true },
    });
    const rules = await (db as any).mailRule.findMany({ where: { account: { userId: user.id } } });
    return NextResponse.json({ ok: true, exportedAt: new Date().toISOString(), accounts, rules });
  }

  if (!accountId) return NextResponse.json({ ok: false, error: "Account required." }, { status: 400 });
  const ownership = { accountId, account: { userId } };
  const [snoozes, reminders, scheduled, rules, signatures] = await Promise.all([
    (db as any).mailSnooze.findMany({ where: ownership, orderBy: { until: "asc" } }),
    (db as any).mailReminder.findMany({ where: { ...ownership, doneAt: null }, orderBy: { remindAt: "asc" } }),
    (db as any).scheduledEmail.findMany({ where: { ...ownership, sentAt: null, failedAt: null }, orderBy: { scheduledAt: "asc" } }),
    (db as any).mailRule.findMany({ where: ownership, orderBy: { createdAt: "desc" } }),
    (db as any).mailSignature.findMany({ where: ownership, orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }] }),
  ]);
  return NextResponse.json({ ok: true, snoozes, reminders, scheduled, rules, signatures });
}

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  const userId = user.id;
  const body = await req.json();
  const action = String(body.action || "");

  async function assertAccount(accountId: string) {
    const account = await db.mailAccount.findFirst({ where: { id: accountId, userId, isActive: true } });
    if (!account) throw new Error("Account not found.");
    return account;
  }

  try {
    if (action === "schedule") {
      const parsed = scheduledSchema.parse(body);
      await assertAccount(parsed.accountId);
      const scheduled = await scheduleEmail(parsed.accountId, parsed.payload, new Date(parsed.scheduledAt));
      return NextResponse.json({ ok: true, scheduled });
    }

    if (action === "snooze") {
      await assertAccount(body.accountId);
      const snooze = await (db as any).mailSnooze.upsert({
        where: { accountId_folder_uid: { accountId: body.accountId, folder: body.folder, uid: Number(body.uid) } },
        update: { until: new Date(body.until) },
        create: { accountId: body.accountId, folder: body.folder, uid: Number(body.uid), until: new Date(body.until) },
      });
      return NextResponse.json({ ok: true, snooze });
    }

    if (action === "reminder") {
      await assertAccount(body.accountId);
      const reminder = await (db as any).mailReminder.create({
        data: { accountId: body.accountId, folder: body.folder, uid: Number(body.uid), remindAt: new Date(body.remindAt), note: body.note || null },
      });
      return NextResponse.json({ ok: true, reminder });
    }

    if (action === "rule") {
      await assertAccount(body.accountId);
      const rule = await (db as any).mailRule.create({
        data: {
          accountId: body.accountId,
          name: body.name || `${body.field} ${body.value}`,
          field: body.field || "from",
          operator: body.operator || "contains",
          value: body.value || "",
          action: body.ruleAction || "tag",
          destination: body.destination || null,
        },
      });
      return NextResponse.json({ ok: true, rule });
    }

    if (action === "signature") {
      await assertAccount(body.accountId);
      if (body.isDefault) {
        await (db as any).mailSignature.updateMany({ where: { accountId: body.accountId }, data: { isDefault: false } });
      }
      const signature = body.id
        ? await (db as any).mailSignature.update({
            where: { id: body.id },
            data: { name: body.name || "Signature", html: body.html || "", isDefault: Boolean(body.isDefault) },
          })
        : await (db as any).mailSignature.create({
            data: { accountId: body.accountId, name: body.name || "Signature", html: body.html || "", isDefault: Boolean(body.isDefault) },
          });
      return NextResponse.json({ ok: true, signature });
    }

    if (action === "delete-feature") {
      await assertAccount(body.accountId);
      const table = String(body.feature || "");
      const map: Record<string, string> = { rule: "mailRule", snooze: "mailSnooze", reminder: "mailReminder", scheduled: "scheduledEmail", signature: "mailSignature" };
      const model = map[table];
      if (!model) throw new Error("Unknown feature.");
      await (db as any)[model].deleteMany({ where: { id: body.id, accountId: body.accountId } });
      return NextResponse.json({ ok: true });
    }

    if (action === "import") {
      const rules = Array.isArray(body.rules) ? body.rules : [];
      for (const rule of rules) {
        if (!rule.accountId) continue;
        await assertAccount(rule.accountId);
        await (db as any).mailRule.create({
          data: {
            accountId: rule.accountId,
            name: rule.name,
            field: rule.field,
            operator: rule.operator || "contains",
            value: rule.value,
            action: rule.action || "tag",
            destination: rule.destination || null,
          },
        });
      }
      return NextResponse.json({ ok: true, imported: rules.length });
    }

    return NextResponse.json({ ok: false, error: "Unknown feature action." }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : "Feature action failed." }, { status: 400 });
  }
}
