/**
 * Relais en mémoire des signaux « ce carnet vient de changer », du POST /api/sync
 * vers les appareils abonnés à /api/sync/events. Un seul processus Node : la mémoire suffit.
 */
export interface HubMessage {
  at: number;
  /** Identifiant de l'onglet qui a provoqué le changement : il ignore son propre signal. */
  from: string | null;
}

type Listener = (message: HubMessage) => void;

export function createHub() {
  const carnets = new Map<string, Set<Listener>>();
  let total = 0;

  return {
    subscribe(code: string, listener: Listener): () => void {
      let set = carnets.get(code);
      if (!set) {
        set = new Set();
        carnets.set(code, set);
      }
      set.add(listener);
      total++;
      let active = true;
      return () => {
        if (!active) return;
        active = false;
        total--;
        set.delete(listener);
        if (set.size === 0 && carnets.get(code) === set) carnets.delete(code);
      };
    },
    publish(code: string, message: HubMessage): void {
      for (const listener of carnets.get(code) ?? []) {
        try {
          listener(message);
        } catch {
          // connexion déjà fermée : son désabonnement arrive de son côté
        }
      }
    },
    count(code: string): number {
      return carnets.get(code)?.size ?? 0;
    },
    total(): number {
      return total;
    },
  };
}

/**
 * Instance partagée. Rangée sur globalThis : les deux routes (/api/sync et /api/sync/events)
 * sont des points d'entrée distincts du build, il leur faut le même objet.
 */
const store = globalThis as typeof globalThis & { __rdvSyncHub?: ReturnType<typeof createHub> };
export const syncHub = (store.__rdvSyncHub ??= createHub());
