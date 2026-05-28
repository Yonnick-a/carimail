// lib/mail/calendar.ts
// Detects calendar events embedded in email content.
// No external dependencies — uses pure regex parsing of iCalendar (RFC 5545).

export type MeetingLink = {
  type: "zoom" | "meet" | "teams" | "webex" | "other";
  url: string;
  label: string;
};

export type CalendarEvent = {
  summary: string;
  start: Date;
  end?: Date;
  organizer?: string;
  location?: string;
  description?: string;
  meetingLinks: MeetingLink[];
};

// ── ICS parser ────────────────────────────────────────────────────────────────

function unfold(ics: string): string {
  // RFC 5545 line folding: CRLF + whitespace = continuation
  return ics.replace(/\r?\n[ \t]/g, "");
}

function icsValue(lines: string[], prop: string): string | undefined {
  const rx = new RegExp(`^${prop}(?:;[^:]*)?:(.+)$`, "im");
  return unfold(lines.join("\n")).match(rx)?.[1]?.trim();
}

function parseIcsDate(raw: string): Date | null {
  // DATE-TIME: 19970903T183248Z or 19970714T173000
  // DATE: 19970901
  const clean = raw.split(";").pop()?.replace(/Z$/, "") ?? "";
  const m = clean.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2}))?/);
  if (!m) return null;
  const [, yr, mo, dy, hr = "0", mn = "0", sc = "0"] = m;
  return new Date(
    Date.UTC(+yr, +mo - 1, +dy, +hr, +mn, +sc)
  );
}

export function parseICS(icsContent: string): CalendarEvent | null {
  if (!icsContent.includes("BEGIN:VEVENT")) return null;

  // Extract the first VEVENT block
  const veventMatch = icsContent.match(/BEGIN:VEVENT([\s\S]*?)END:VEVENT/i);
  if (!veventMatch) return null;

  const block = veventMatch[1];
  const lines = block.split(/\r?\n/);

  const summary = icsValue(lines, "SUMMARY") ?? "(No title)";
  const dtStartRaw = icsValue(lines, "DTSTART");
  const dtEndRaw = icsValue(lines, "DTEND");
  const organizerRaw = icsValue(lines, "ORGANIZER");
  const location = icsValue(lines, "LOCATION");
  const description = icsValue(lines, "DESCRIPTION");

  const start = dtStartRaw ? parseIcsDate(dtStartRaw) : null;
  if (!start) return null;

  const organizer = organizerRaw
    ? organizerRaw.replace(/^mailto:/i, "").replace(/CN=([^;:]+)/i, "$1").trim()
    : undefined;

  const meetingLinks = extractMeetingLinksFromText(description ?? "");

  return {
    summary,
    start,
    end: dtEndRaw ? (parseIcsDate(dtEndRaw) ?? undefined) : undefined,
    organizer,
    location,
    description,
    meetingLinks,
  };
}

// ── Meeting link extractor ────────────────────────────────────────────────────

const MEETING_PATTERNS: { type: MeetingLink["type"]; re: RegExp; label: string }[] = [
  {
    type: "zoom",
    re: /https?:\/\/[\w.-]*zoom\.us\/[^\s"'<>)]+/gi,
    label: "Join on Zoom",
  },
  {
    type: "meet",
    re: /https?:\/\/meet\.google\.com\/[^\s"'<>)]+/gi,
    label: "Join Google Meet",
  },
  {
    type: "teams",
    re: /https?:\/\/teams\.microsoft\.com\/[^\s"'<>)]+/gi,
    label: "Join Microsoft Teams",
  },
  {
    type: "webex",
    re: /https?:\/\/[\w.-]*webex\.com\/[^\s"'<>)]+/gi,
    label: "Join Webex",
  },
];

export function extractMeetingLinksFromText(text: string): MeetingLink[] {
  const seen = new Set<string>();
  const links: MeetingLink[] = [];
  for (const { type, re, label } of MEETING_PATTERNS) {
    for (const m of text.matchAll(re)) {
      const url = m[0].replace(/[);,]+$/, ""); // trim trailing punctuation
      if (!seen.has(url)) {
        seen.add(url);
        links.push({ type, url, label });
      }
    }
  }
  return links;
}

export function extractMeetingLinksFromHtml(html: string): MeetingLink[] {
  // Strip HTML tags first, then run text extraction
  const text = html.replace(/<[^>]+>/g, " ");
  return extractMeetingLinksFromText(text);
}

// ── High-level detector: given full email body content ────────────────────────

export function detectCalendarInfo(
  bodyHtml: string | null,
  bodyText: string | null,
  attachments: { contentType: string; content?: Buffer | string }[]
): CalendarEvent | null {
  // 1. Check ICS attachments
  for (const att of attachments) {
    if (
      att.content &&
      (att.contentType.includes("text/calendar") ||
       att.contentType.includes("application/ics") ||
       att.contentType.includes("text/x-vcalendar"))
    ) {
      const icsText = typeof att.content === "string"
        ? att.content
        : att.content.toString("utf8");
      const event = parseICS(icsText);
      if (event) return event;
    }
  }

  // 2. Check for inline calendar data in the body
  const textBody = bodyText ?? (bodyHtml?.replace(/<[^>]+>/g, " ") ?? "");
  if (textBody.includes("BEGIN:VCALENDAR") || textBody.includes("BEGIN:VEVENT")) {
    const event = parseICS(textBody);
    if (event) return event;
  }

  // 3. No ICS found, but check for meeting links in the body
  const links = bodyHtml
    ? extractMeetingLinksFromHtml(bodyHtml)
    : extractMeetingLinksFromText(textBody);

  if (links.length === 0) return null;

  // Synthesise a minimal event from meeting links + subject heuristic
  return {
    summary: "",
    start: new Date(0), // sentinel — we don't have a date
    meetingLinks: links,
  };
}

// ── Formatting helpers ────────────────────────────────────────────────────────

export function formatEventDate(date: Date): string {
  if (date.getTime() === 0) return ""; // sentinel date
  return date.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

export function buildGoogleCalendarLink(event: CalendarEvent): string {
  const fmt = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const end = event.end ?? new Date(event.start.getTime() + 60 * 60 * 1000);
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: event.summary,
    dates: `${fmt(event.start)}/${fmt(end)}`,
    ...(event.location ? { location: event.location } : {}),
    ...(event.description ? { details: event.description.slice(0, 500) } : {}),
  });
  return `https://calendar.google.com/calendar/render?${p}`;
}
