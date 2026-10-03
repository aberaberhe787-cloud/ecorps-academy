/**
 * Simple in-memory sliding-window rate limiter for serverless/Node.
 * Per-instance only (good enough for soft protection on Gemini routes).
 */

type Bucket = { timestamps: number[] };

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSec: number;
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key) || { timestamps: [] };
  bucket.timestamps = bucket.timestamps.filter((t) => now - t < windowMs);

  if (bucket.timestamps.length >= limit) {
    const oldest = bucket.timestamps[0] || now;
    const retryAfterSec = Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000));
    buckets.set(key, bucket);
    return { allowed: false, remaining: 0, retryAfterSec };
  }

  bucket.timestamps.push(now);
  buckets.set(key, bucket);
  return {
    allowed: true,
    remaining: Math.max(0, limit - bucket.timestamps.length),
    retryAfterSec: 0,
  };
}

/** Client IP helper for Express-like req */
export function clientKey(req: { headers?: any; socket?: any; ip?: string }, suffix: string): string {
  const xf = req.headers?.["x-forwarded-for"];
  const forwarded = typeof xf === "string" ? xf.split(",")[0].trim() : "";
  const ip =
    forwarded ||
    req.headers?.["x-real-ip"] ||
    req.ip ||
    req.socket?.remoteAddress ||
    "unknown";
  return `${ip}:${suffix}`;
}
