// Simple in-memory sliding-window rate limiter.
// For multi-instance deployments, replace with Redis.
const buckets = new Map<string, number[]>();

export function rateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter(ts => now - ts < windowMs);
  if (hits.length >= maxRequests) return false;
  hits.push(now);
  buckets.set(key, hits);
  // Evict old keys periodically to avoid memory growth
  if (buckets.size > 10_000) {
    for (const [k, v] of buckets) {
      if (v.every(ts => now - ts >= windowMs)) buckets.delete(k);
    }
  }
  return true;
}
