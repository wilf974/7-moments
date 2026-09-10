/**
 * Synchronisation du carnet entre les appareils d'une même personne.
 *
 * Chaque appareil garde toujours sa copie locale : on peut prier hors connexion,
 * rien n'est perdu. Quand un code de carnet est enregistré sur l'appareil,
 * la copie locale est envoyée au serveur, qui renvoie l'union de tous les appareils.
 * La fusion n'ajoute que des moments, elle n'en retire jamais.
 */
import { getAllStoredData, replaceAllStoredData } from './storage';
import { mergeStoredData, sanitizeStoredData, daysSince, missingFrom, type StoredData } from './merge';
import { isValidSyncCode, normalizeSyncCode } from './syncCode';
import { formatDate } from './utils';
import { getClientId } from './clientId';

const CODE_KEY = 'sync_code';
const LAST_OK_KEY = 'sync_last_ok';
const REQUEST_TIMEOUT_MS = 10000;

/** Événement émis sur `window` après chaque tentative, avec le résultat en `detail`. */
export const SYNC_STATUS_EVENT = 'prayer-sync-status';

export type SyncFailure =
  | 'no_code'
  | 'bad_code'
  | 'offline'
  | 'unknown_code'
  | 'rate_limited'
  | 'too_large'
  | 'full'
  | 'server';
export type SyncOutcome = { ok: true; at: number } | { ok: false; reason: SyncFailure };

export const SYNC_MESSAGES: Record<SyncFailure, string> = {
  no_code: "Cet appareil n'est relié à aucun carnet.",
  bad_code: 'Le code fait 8 caractères, par exemple ABCD-EFGH.',
  offline: 'Pas de connexion au serveur. Vos moments restent enregistrés sur cet appareil et partiront à la prochaine connexion.',
  unknown_code: "Ce code n'existe pas. Vérifiez-le sur votre autre appareil.",
  rate_limited: "Trop d'essais. Patientez un moment puis réessayez.",
  too_large: 'Le carnet est trop volumineux pour être envoyé. Vos moments restent enregistrés sur cet appareil.',
  full: "Le serveur n'accepte plus de nouveaux carnets pour le moment. Vos moments restent enregistrés sur cet appareil.",
  server: 'Le serveur a rencontré un problème. Vos moments restent enregistrés sur cet appareil.',
};

function read(key: string): string | null {
  try {
    return typeof window === 'undefined' ? null : localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string | null): void {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // stockage indisponible
  }
}

export function getSyncCode(): string | null {
  const code = read(CODE_KEY);
  return code && isValidSyncCode(code) ? code : null;
}

export function getLastSyncAt(): number | null {
  const at = Number(read(LAST_OK_KEY));
  return Number.isFinite(at) && at > 0 ? at : null;
}

/** Délie cet appareil. Ses moments restent sur l'appareil et sur le serveur. */
export function unlinkThisDevice(): void {
  write(CODE_KEY, null);
  write(LAST_OK_KEY, null);
  emit({ ok: false, reason: 'no_code' });
}

function emit(outcome: SyncOutcome): void {
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(SYNC_STATUS_EVENT, { detail: outcome }));
}

function localData(): StoredData {
  return sanitizeStoredData(getAllStoredData());
}

/** Jours à envoyer : ceux depuis la dernière synchro réussie (avec 2 jours de marge), sinon tout. */
function pendingDays(local: StoredData): StoredData {
  const last = getLastSyncAt();
  if (!last) return local;
  const from = new Date(last);
  from.setDate(from.getDate() - 2);
  return daysSince(local, formatDate(from));
}

interface Reply {
  status: number;
  days?: StoredData;
  code?: string;
}

async function post(payload: { code?: string; create?: true; days: StoredData }): Promise<Reply> {
  const body = { ...payload, client: getClientId() };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
      signal: controller.signal,
    });
    if (!res.ok) return { status: res.status };
    const json = (await res.json()) as { days?: unknown; code?: unknown };
    return {
      status: res.status,
      days: sanitizeStoredData(json.days),
      code: typeof json.code === 'string' && isValidSyncCode(json.code) ? json.code : undefined,
    };
  } finally {
    clearTimeout(timer);
  }
}

function failureFor(status: number): SyncFailure {
  switch (status) {
    case 400:
      return 'bad_code';
    case 404:
      return 'unknown_code';
    case 413:
      return 'too_large';
    case 429:
      return 'rate_limited';
    case 507:
      return 'full';
    default:
      return 'server';
  }
}

/** Fusionne la réponse du serveur dans la copie locale, relue à l'instant pour ne rien écraser. */
function applyServerData(server: StoredData): void {
  replaceAllStoredData(mergeStoredData(localData(), server));
  window.dispatchEvent(new CustomEvent('prayer-data-updated'));
}

function succeed(): SyncOutcome {
  const at = Date.now();
  write(LAST_OK_KEY, String(at));
  const outcome: SyncOutcome = { ok: true, at };
  emit(outcome);
  return outcome;
}

/**
 * Envoie `days` au carnet `code` et applique la réponse. Si le serveur ignore encore
 * un moment connu de cet appareil (carnet restauré, envoi partiel), renvoie tout.
 */
async function exchange(code: string, days: StoredData): Promise<SyncOutcome> {
  try {
    let res = await post({ code, days });
    if (res.status !== 200 || !res.days) return { ok: false, reason: failureFor(res.status) };
    applyServerData(res.days);

    const local = localData();
    if (missingFrom(local, res.days)) {
      res = await post({ code, days: local });
      if (res.status !== 200 || !res.days) return { ok: false, reason: failureFor(res.status) };
      applyServerData(res.days);
    }
    return succeed();
  } catch {
    return { ok: false, reason: 'offline' };
  }
}

let inflight: Promise<SyncOutcome> | null = null;
let again = false;

/**
 * Synchronise maintenant si l'appareil est relié. Les appels simultanés sont regroupés :
 * un appel pendant une synchro en cours relance une synchro juste après.
 */
export function syncNow(): Promise<SyncOutcome> {
  if (inflight) {
    again = true;
    return inflight;
  }
  inflight = (async () => {
    let outcome: SyncOutcome;
    do {
      again = false;
      const code = getSyncCode();
      if (!code) return { ok: false, reason: 'no_code' } as SyncOutcome;
      outcome = await exchange(code, pendingDays(localData()));
    } while (again && outcome.ok);
    if (!outcome.ok) emit(outcome);
    return outcome;
  })().finally(() => {
    inflight = null;
  });
  return inflight;
}

/** Premier appareil : le serveur crée un carnet avec tous les moments de cet appareil. */
export async function createCarnet(): Promise<SyncOutcome> {
  try {
    const res = await post({ create: true, days: localData() });
    if (res.status !== 201 || !res.days || !res.code) {
      const outcome: SyncOutcome = { ok: false, reason: failureFor(res.status) };
      emit(outcome);
      return outcome;
    }
    write(CODE_KEY, res.code);
    applyServerData(res.days);
    return succeed();
  } catch {
    return { ok: false, reason: 'offline' };
  }
}

/** Appareil suivant : rejoint un carnet existant et y verse ses propres moments. */
export async function joinCarnet(input: string): Promise<SyncOutcome> {
  const code = normalizeSyncCode(input);
  if (!isValidSyncCode(code)) return { ok: false, reason: 'bad_code' };
  const outcome = await exchange(code, localData());
  if (outcome.ok) {
    write(CODE_KEY, code);
    emit(outcome); // de nouveau, code enregistré : la synchro instantanée peut s'ouvrir
  }
  return outcome;
}
