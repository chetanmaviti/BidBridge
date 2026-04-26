import { LRUCache } from "lru-cache";
import { createHash } from "node:crypto";

/**
 * Single shared LRU cache instance for all server-side API responses.
 * Keys are namespaced strings; values are JSON-serializable.
 */
const cache = new LRUCache<string, object>({
  max: 500,
  ttl: 1000 * 60 * 60, // default 1 hour
});

function wrap<T>(value: T): object {
  return { v: value };
}
function unwrap<T>(stored: object | undefined): T | undefined {
  if (stored === undefined) return undefined;
  return (stored as { v: T }).v;
}

export function cacheGet<T>(key: string): T | undefined {
  return unwrap<T>(cache.get(key));
}

export function cacheSet<T>(key: string, value: T, ttlMs?: number): void {
  const v = wrap(value);
  if (ttlMs !== undefined) {
    cache.set(key, v, { ttl: ttlMs });
  } else {
    cache.set(key, v);
  }
}

export function cacheDelete(key: string): void {
  cache.delete(key);
}

export function cacheStats() {
  return { size: cache.size, max: cache.max };
}

/**
 * Stable hash for use as part of a cache key.
 */
export function hashKey(parts: unknown): string {
  const json = JSON.stringify(parts);
  return createHash("sha256").update(json).digest("hex").slice(0, 16);
}

/**
 * Memoize an async function with the cache.
 */
export async function withCache<T>(
  key: string,
  ttlMs: number,
  fn: () => Promise<T>
): Promise<T> {
  const hit = cacheGet<T>(key);
  if (hit !== undefined) return hit;
  const value = await fn();
  cacheSet(key, value, ttlMs);
  return value;
}

export const TTL = {
  SAM_LIST: 1000 * 60 * 5,            // 5 min
  SAM_DETAIL: 1000 * 60 * 60,         // 1 hour
  USA_SPENDING: 1000 * 60 * 60 * 24,  // 24 hours
  GEMINI: 1000 * 60 * 60 * 24 * 7,    // 7 days (deterministic for same input)
  HUBZONE: 1000 * 60 * 60 * 24,       // 24 hours
  GEOCODE: 1000 * 60 * 60 * 24 * 30,  // 30 days
} as const;
