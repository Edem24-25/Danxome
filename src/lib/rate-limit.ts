import { useCallback } from "react";

interface RateLimitEntry {
  attempts: number;
  lastAttempt: number;
}

const store = new Map<string, RateLimitEntry>();

function getEntry(key: string): RateLimitEntry {
  let entry = store.get(key);
  if (!entry) {
    entry = { attempts: 0, lastAttempt: 0 };
    store.set(key, entry);
  }
  return entry;
}

/**
 * Hook de rate limiting côté client.
 * Bloque après `maxAttempts` essais avec backoff exponentiel.
 */
export function useRateLimit(key: string, maxAttempts = 5, baseDelayMs = 30000) {
  const check = useCallback(() => {
    const entry = getEntry(key);
    const now = Date.now();

    if (entry.attempts >= maxAttempts) {
      const elapsed = now - entry.lastAttempt;
      const delay = baseDelayMs * Math.pow(2, Math.min(entry.attempts - maxAttempts, 5));
      if (elapsed < delay) {
        const remaining = Math.ceil((delay - elapsed) / 1000);
        return { allowed: false, remaining };
      }
      entry.attempts = 0;
    }

    return { allowed: true, remaining: 0 };
  }, [key, maxAttempts, baseDelayMs]);

  const record = useCallback(() => {
    const entry = getEntry(key);
    entry.attempts += 1;
    entry.lastAttempt = Date.now();
  }, [key]);

  const reset = useCallback(() => {
    store.delete(key);
  }, [key]);

  return { check, record, reset };
}
