/**
 * Synchronisation instantanée : tant que l'app est affichée et l'appareil relié,
 * une connexion Server-Sent Events reste ouverte sur /api/sync/events.
 * Quand un autre appareil ajoute un moment, le serveur envoie « update » et
 * cet appareil se synchronise aussitôt. En arrière-plan, la connexion est fermée
 * (batterie) ; au retour, elle se rouvre et rattrape ce qui a été manqué.
 */
import { getSyncCode, syncNow } from './sync';
import { getClientId } from './clientId';

/** Événement émis sur `window` quand la connexion instantanée s'ouvre ou se ferme (`detail` : booléen). */
export const LIVE_STATUS_EVENT = 'prayer-live-status';
const RETRY_AFTER_CLOSE_MS = 60000;

let source: EventSource | null = null;
let sourceCode: string | null = null;
let connected = false;
let retryTimer: ReturnType<typeof setTimeout> | null = null;

function setConnected(value: boolean): void {
  if (connected === value) return;
  connected = value;
  window.dispatchEvent(new CustomEvent(LIVE_STATUS_EVENT, { detail: value }));
}

export function isLiveConnected(): boolean {
  return connected;
}

export function stopLive(): void {
  if (retryTimer) {
    clearTimeout(retryTimer);
    retryTimer = null;
  }
  source?.close();
  source = null;
  sourceCode = null;
  setConnected(false);
}

/** Ouvre la connexion si elle doit l'être, la ferme sinon. Sans effet si rien ne change. */
export function ensureLive(): void {
  if (typeof window === 'undefined' || typeof EventSource === 'undefined') return;
  const code = getSyncCode();
  if (!code || document.visibilityState !== 'visible') {
    stopLive();
    return;
  }
  if (source && sourceCode === code && source.readyState !== EventSource.CLOSED) return;

  stopLive();
  const es = new EventSource(`/api/sync/events?code=${code}`);
  source = es;
  sourceCode = code;

  // « ready » à chaque (re)connexion : rattraper ce qui a pu arriver pendant la coupure
  es.addEventListener('ready', () => {
    setConnected(true);
    void syncNow();
  });
  es.addEventListener('update', (event) => {
    try {
      const message = JSON.parse((event as MessageEvent<string>).data) as { from?: string | null };
      if (message.from !== getClientId()) void syncNow();
    } catch {
      void syncNow();
    }
  });
  es.onerror = () => {
    setConnected(false);
    // Coupure réseau : le navigateur se reconnecte seul. Refus du serveur (404, 429, 503) :
    // la connexion est close, on retentera plus tard ou au prochain retour sur l'app.
    if (es.readyState === EventSource.CLOSED && source === es) {
      source = null;
      sourceCode = null;
      retryTimer = setTimeout(ensureLive, RETRY_AFTER_CLOSE_MS);
    }
  };
}
