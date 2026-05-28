// lib/mail/tracking.ts
// Injects open-tracking pixel and wraps href links for click tracking.
// Only applied to HTML emails (plain-text is left unmodified).

export function injectTracking(html: string, pixelId: string, baseUrl: string): string {
  // Wrap all <a href="..."> links except mailto:, tel:, and existing /api/track paths
  const tracked = html.replace(
    /(<a\b[^>]*\s)href="(https?:\/\/[^"]+)"/gi,
    (match, prefix, url) => {
      // Don't double-wrap
      if (url.includes("/api/track/")) return match;
      const wrapped = `${baseUrl}/api/track/click?id=${encodeURIComponent(pixelId)}&url=${encodeURIComponent(url)}`;
      return `${prefix}href="${wrapped}"`;
    }
  );

  // Append 1×1 tracking pixel just before </body> (or at end)
  const pixel = `<img src="${baseUrl}/api/track/open?id=${encodeURIComponent(pixelId)}" width="1" height="1" alt="" style="display:none;border:0;width:1px;height:1px;" />`;
  if (/<\/body>/i.test(tracked)) {
    return tracked.replace(/<\/body>/i, `${pixel}</body>`);
  }
  return tracked + pixel;
}
