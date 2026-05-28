// app/api/mail/stream/route.ts
// Server-Sent Events endpoint for real-time new-mail notifications.
// Strategy: poll the MailMessage DB table (no live IMAP connection needed).
// Every POLL_INTERVAL ms we compare the current unread count with the last
// known value and emit a `mail` event when it changes.
import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

const POLL_INTERVAL_MS = 30_000;
const HEARTBEAT_INTERVAL_MS = 25_000;

export const dynamic = "force-dynamic";
// Run on Node.js runtime (not Edge) so we can use long-lived timers.
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const user = await getSession();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const accountId = req.nextUrl.searchParams.get("accountId") || "";
  if (!accountId) {
    return new Response("accountId required", { status: 400 });
  }

  // Verify the account belongs to this user
  const account = await db.mailAccount.findFirst({
    where: { id: accountId, userId: user.id, isActive: true },
    select: { id: true },
  });
  if (!account) {
    return new Response("Account not found", { status: 404 });
  }

  // Snapshot: capture current unread count before streaming starts
  let lastUnread = await getUnreadCount(accountId);
  let lastTotal  = await getTotalCount(accountId);

  const encoder = new TextEncoder();

  function encode(event: string, data: object) {
    return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  }

  const stream = new ReadableStream({
    start(controller) {
      // Send an initial connection confirmation
      controller.enqueue(encode("connected", { accountId, unread: lastUnread }));

      // Heartbeat — keeps the connection alive through proxies / load balancers
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch {
          // Connection closed
        }
      }, HEARTBEAT_INTERVAL_MS);

      // Poll for new messages
      const poll = setInterval(async () => {
        try {
          const unread = await getUnreadCount(accountId);
          const total  = await getTotalCount(accountId);

          if (unread !== lastUnread || total !== lastTotal) {
            const newMessages = total > lastTotal ? total - lastTotal : 0;
            controller.enqueue(
              encode("mail", {
                accountId,
                unread,
                total,
                newMessages,
                // If the unread count went up, there is definitely new unread mail
                hasNew: unread > lastUnread || total > lastTotal,
              })
            );
            lastUnread = unread;
            lastTotal  = total;
          }
        } catch {
          // DB error — skip this tick
        }
      }, POLL_INTERVAL_MS);

      // Clean up when client disconnects
      req.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        clearInterval(poll);
        try { controller.close(); } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // Disable nginx buffering
    },
  });
}

async function getUnreadCount(accountId: string): Promise<number> {
  return db.mailMessage.count({
    where: { accountId, folder: "INBOX", seen: false },
  });
}

async function getTotalCount(accountId: string): Promise<number> {
  return db.mailMessage.count({
    where: { accountId, folder: "INBOX" },
  });
}
