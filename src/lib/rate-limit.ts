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
export function useRateLimit(key: string, maxAttempts = 10, baseDelayMs = 15000) {
  const check = useCallback(() => {
    // En développement, pas de blocage strict pour faciliter les tests
    if (import.meta.env.DEV) {
      return { allowed: true, remaining: 0 };
    }

    const entry = getEntry(key);
    const now = Date.now();
    const elapsed = now - entry.lastAttempt;

    // Si le délai de base est écoulé depuis la dernière tentative, on réinitialise le compteur
    if (elapsed > baseDelayMs && entry.attempts < maxAttempts) {
      entry.attempts = 0;
    }

    if (entry.attempts >= maxAttempts) {
      const delay = baseDelayMs * Math.pow(2, Math.min(entry.attempts - maxAttempts, 4));
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
