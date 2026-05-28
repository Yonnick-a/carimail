// app/api/track/click/route.ts
// Logs a click event then redirects to the original URL.
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const id  = req.nextUrl.searchParams.get("id");
  const url = req.nextUrl.searchParams.get("url");

  // Validate destination URL is HTTP/HTTPS
  const destination = (() => {
    try {
      if (!url) return null;
      const u = new URL(url);
      if (u.protocol !== "http:" && u.protocol !== "https:") return null;
      // Block tracking redirects to ourselves (infinite loops)
      if (u.pathname.startsWith("/api/track/")) return null;
      return u.toString();
    } catch {
      return null;
    }
  })();

  if (!destination) {
    return new NextResponse("Bad request", { status: 400 });
  }

  if (id) {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      null;
    const userAgent = req.headers.get("user-agent") ?? null;

    db.emailTrackingPixel
      .update({
        where: { id },
        data: { clicks: { increment: 1 }, lastClickAt: new Date() },
      })
      .then(() =>
        db.emailTrackEvent.create({
          data: { pixelId: id, type: "click", url: destination, ip, userAgent },
        })
      )
      .catch(() => {});
  }

  return NextResponse.redirect(destination, { status: 302 });
}
