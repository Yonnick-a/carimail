import "server-only";
// lib/mail/categorize.ts
// Smart email categorization: heuristics first, optional Claude API enrichment.
// Uses Claude Haiku for speed + low cost. Prompt-cached system prompt.

export type Category =
  | "primary"
  | "updates"
  | "promotions"
  | "social"
  | "finance"
  | "security"
  | "notifications";

export const CATEGORY_LABELS: Record<Category, { label: string; color: string; bg: string }> = {
  primary:       { label: "Primary",       color: "#0044BC", bg: "rgba(0,68,188,0.10)"      },
  updates:       { label: "Updates",       color: "#0891B2", bg: "rgba(8,145,178,0.10)"     },
  promotions:    { label: "Promotions",    color: "#D97706", bg: "rgba(217,119,6,0.10)"     },
  social:        { label: "Social",        color: "#7C3AED", bg: "rgba(124,58,237,0.10)"    },
  finance:       { label: "Finance",       color: "#059669", bg: "rgba(5,150,105,0.10)"     },
  security:      { label: "Security",      color: "#DC2626", bg: "rgba(220,38,38,0.10)"     },
  notifications: { label: "Notifications", color: "#64748B", bg: "rgba(100,116,139,0.10)"   },
};

// ── Heuristic rules ───────────────────────────────────────────────────────────

const SECURITY_SUBJECTS = /\b(password|reset|2fa|verification|alert|suspicious|login|sign.?in|unauthori[sz]ed|security|verify|confirm|account|breach)\b/i;
const SECURITY_SENDERS  = /\b(security|alerts?|noreply|no-reply|account|auth|verify)\b/i;

const FINANCE_SUBJECTS  = /\b(invoice|receipt|payment|billing|paid|subscription|statement|balance|refund|transaction|order|charge|debit|credit)\b/i;
const FINANCE_SENDERS   = /\b(billing|payments?|finance|invoice|receipts?|stripe|paypal|square)\b/i;

const SOCIAL_SENDERS    = /\b(facebook|instagram|twitter|linkedin|tiktok|youtube|reddit|pinterest|snapchat|discord|slack|whatsapp|telegram)\b/i;
const SOCIAL_SUBJECTS   = /\b(mentioned|commented|liked|followed|reacted|friend request|message|notification|invitation)\b/i;

const PROMO_SUBJECTS    = /\b(sale|offer|deal|discount|off|promo|coupon|limited time|flash|exclusive|savings|shop now|buy now|special|gift)\b/i;
const PROMO_BODY_MARKER = /unsubscribe/i;

const UPDATES_SUBJECTS  = /\b(shipped|delivered|tracking|order|dispatch|confirmed|notification|update|status|alert|reminder|summary|digest|weekly|monthly|report)\b/i;
const NOREPLY_SENDERS   = /^(noreply|no-reply|donotreply|do-not-reply|mailer|notifications?|updates?|info|newsletter|newsletter)[@+]/i;

function senderLocalPart(from: string): string {
  return from.split("@")[0]?.toLowerCase() ?? "";
}

function senderDomain(from: string): string {
  return from.split("@")[1]?.split(">")[0]?.toLowerCase() ?? "";
}

export function categoriseByHeuristic(
  subject: string,
  from: string,
  snippet: string
): Category {
  const local   = senderLocalPart(from);
  const domain  = senderDomain(from);
  const combined = `${subject} ${from} ${snippet}`;

  // Security — highest priority
  if (SECURITY_SUBJECTS.test(subject) || SECURITY_SENDERS.test(local)) return "security";

  // Finance
  if (FINANCE_SUBJECTS.test(subject) || FINANCE_SENDERS.test(local) || FINANCE_SENDERS.test(domain)) return "finance";

  // Social media
  if (SOCIAL_SENDERS.test(domain) || SOCIAL_SENDERS.test(local) || SOCIAL_SUBJECTS.test(subject)) return "social";

  // Promotions — check unsubscribe in snippet/body
  if (PROMO_SUBJECTS.test(subject) || PROMO_BODY_MARKER.test(combined)) return "promotions";

  // Transactional / updates from no-reply addresses
  if (NOREPLY_SENDERS.test(local) || UPDATES_SUBJECTS.test(subject)) return "updates";

  // Automated notifications (no-reply with generic subject)
  if (NOREPLY_SENDERS.test(local)) return "notifications";

  // Fall through to primary for personal / direct mail
  return "primary";
}

// ── Claude API enrichment (optional — requires ANTHROPIC_API_KEY) ─────────────

const SYSTEM_PROMPT = `You are an email categorisation assistant. Classify the email into exactly one category:
primary, updates, promotions, social, finance, security, notifications.

Rules:
- primary: personal or direct communication from a real person
- updates: transactional (order, shipping, account status)
- promotions: marketing, sales, offers, newsletters
- social: social-media notifications, community, collaboration
- finance: invoices, receipts, payments, bank/card statements
- security: password resets, 2FA, login alerts, suspicious activity
- notifications: automated system alerts, digests, reports

Respond with ONLY the category word, nothing else.`;

export async function categoriseWithClaude(
  subject: string,
  from: string,
  snippet: string
): Promise<Category | null> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "prompt-caching-2024-07-31",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 10,
        system: [
          {
            type: "text",
            text: SYSTEM_PROMPT,
            cache_control: { type: "ephemeral" },
          },
        ],
        messages: [
          {
            role: "user",
            content: `From: ${from}\nSubject: ${subject}\nSnippet: ${snippet.slice(0, 200)}`,
          },
        ],
      }),
    });

    if (!res.ok) return null;
    const data = await res.json() as { content?: { text?: string }[] };
    const raw  = data.content?.[0]?.text?.trim().toLowerCase() ?? "";
    const valid: Category[] = ["primary","updates","promotions","social","finance","security","notifications"];
    return valid.includes(raw as Category) ? (raw as Category) : null;
  } catch {
    return null;
  }
}

// ── Unified entry point ───────────────────────────────────────────────────────

export async function categorise(
  subject: string,
  from: string,
  snippet: string
): Promise<{ category: Category; source: "heuristic" | "ai" }> {
  // Try Claude if API key is present
  const aiResult = await categoriseWithClaude(subject, from, snippet);
  if (aiResult) return { category: aiResult, source: "ai" };

  // Fall back to heuristics
  return { category: categoriseByHeuristic(subject, from, snippet), source: "heuristic" };
}
