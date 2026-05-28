// app/api/track/open/route.ts
// Returns a 1×1 transparent GIF and logs the open event.
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// 1×1 transparent GIF (43 bytes)
const PIXEL = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
);

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");

  if (id) {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      null;
    const userAgent = req.headers.get("user-agent") ?? null;

    // Fire and forget — don't block the pixel response
    db.emailTrackingPixel
      .update({
        where: { id },
        data: { opens: { increment: 1 }, lastOpenAt: new Date() },
      })
      .then(() =>
        db.emailTrackEvent.create({
          data: { pixelId: id, type: "open", ip, userAgent },
        })
      )
      .catch(() => {});
  }

  return new NextResponse(PIXEL, {
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate, private",
      "Content-Length": String(PIXEL.length),
    },
  });
}
