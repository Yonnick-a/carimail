// app/(mail)/inbox/page.tsx
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import InboxClient from "@/components/mail/InboxClient";

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<{ accountId?: string; folder?: string; q?: string }>;
}) {
  const user = await getSession();
  if (!user) redirect("/sign-in");

  const sp = await searchParams;

  let accountId = sp.accountId;
  if (!accountId) {
    const primary = await db.mailAccount.findFirst({
      where: { userId: user.id, isActive: true },
      orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
      select: { id: true },
    });
    if (primary) accountId = primary.id;
  }

  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
        </div>
      }
    >
      <InboxClient
        accountId={accountId || null}
        folder={sp.folder || "INBOX"}
      />
    </Suspense>
  );
}
