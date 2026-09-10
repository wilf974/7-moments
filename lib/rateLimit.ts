/**
 * Limiteur de débit en mémoire, fenêtre glissante, par clé (adresse IP).
 * Suffisant pour un seul processus Node ; se remet à zéro au redémarrage.
 */
interface Options {
  limit: number;
  windowMs: number;
  now?: () => number;
}

export function createRateLimiter({ limit, windowMs, now = Date.now }: Options) {
  const hits = new Map<string, number[]>();

  const recent = (key: string, t: number) => (hits.get(key) ?? []).filter((h) => t - h < windowMs);

  const purge = (t: number) => {
    for (const [key, list] of hits) {
      if (list.every((h) => t - h >= windowMs)) hits.delete(key);
    }
  };

  return {
    /** Vrai si un coup de plus serait accepté, sans le consommer. */
    check(key: string): boolean {
      return recent(key, now()).length < limit;
    },
    /** Consomme un coup ; renvoie faux si la limite est dépassée. */
    hit(key: string): boolean {
      const t = now();
      purge(t);
      const list = recent(key, t);
      if (list.length >= limit) {
        hits.set(key, list);
        return false;
      }
      list.push(t);
      hits.set(key, list);
      return true;
    },
    size(): number {
      return hits.size;
    },
  };
}
