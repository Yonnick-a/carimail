// app/(mail)/layout.tsx
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import MailShell from "@/components/mail/MailShell";

export default async function MailLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  if (!user) redirect("/sign-in");

  const accounts = await db.mailAccount.findMany({
    where: { userId: user.id, isActive: true },
    select: {
      id: true, emailAddress: true, label: true, isPrimary: true,
      imapHost: true, smtpHost: true,
    },
    orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
  });

  return (
    <Suspense fallback={null}>
      <MailShell user={user} accounts={accounts}>
        {children}
      </MailShell>
    </Suspense>
  );
}
