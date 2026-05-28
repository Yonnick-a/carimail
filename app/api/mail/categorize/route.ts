// app/api/mail/categorize/route.ts
// Batch categorises messages and caches results in MessageCategory table.
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { categorise } from "@/lib/mail/categorize";

const schema = z.object({
  accountId: z.string(),
  folder:    z.string().default("INBOX"),
  messages:  z.array(z.object({
    uid:     z.number(),
    subject: z.string(),
    from:    z.string(),
    snippet: z.string().optional(),
  })),
});

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });

  try {
    const body   = await req.json();
    const parsed = schema.parse(body);

    // Verify ownership
    const account = await db.mailAccount.findFirst({
      where: { id: parsed.accountId, userId: user.id },
      select: { id: true },
    });
    if (!account) return NextResponse.json({ ok: false, error: "Account not found." }, { status: 404 });

    // Check which UIDs are already cached
    const existing = await db.messageCategory.findMany({
      where: {
        accountId: parsed.accountId,
        folder: parsed.folder,
        uid: { in: parsed.messages.map(m => m.uid) },
      },
      select: { uid: true, category: true },
    });
    const cachedMap = new Map(existing.map(r => [r.uid, r.category]));

    const uncached = parsed.messages.filter(m => !cachedMap.has(m.uid));

    // Categorise uncached messages (cap at 20 per request to limit API cost)
    const toProcess = uncached.slice(0, 20);
    const results: { uid: number; category: string; source: string }[] = [];

    await Promise.all(
      toProcess.map(async (msg) => {
        const { category, source } = await categorise(
          msg.subject,
          msg.from,
          msg.snippet ?? ""
        );
        results.push({ uid: msg.uid, category, source });
      })
    );

    // Upsert into DB
    if (results.length > 0) {
      await db.$transaction(
        results.map(r =>
          db.messageCategory.upsert({
            where: {
              accountId_folder_uid: {
                accountId: parsed.accountId,
                folder: parsed.folder,
                uid: r.uid,
              },
            },
            update:  { category: r.category, source: r.source },
            create:  { accountId: parsed.accountId, folder: parsed.folder, uid: r.uid, category: r.category, source: r.source },
          })
        )
      );
    }

    // Build full response
    const allCategories: Record<number, string> = {};
    for (const [uid, cat] of cachedMap) allCategories[uid] = cat;
    for (const r of results) allCategories[r.uid] = r.category;

    return NextResponse.json({ ok: true, categories: allCategories });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Failed." },
      { status: 400 }
    );
  }
}
