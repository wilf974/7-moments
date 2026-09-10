/**
 * Fusion des carnets de prière — logique pure, sans dépendance.
 * Partagée par le navigateur (lib/sync.ts) et le serveur (app/api/sync).
 *
 * Règle unique : un jour est l'union des moments enregistrés sur tous les
 * appareils, dédoublonnés par horodatage. Aucun moment n'est jamais supprimé,
 * donc fusionner deux fois, ou dans n'importe quel ordre, donne le même résultat.
 */
import type { DayData, Platform, PrayerMoment } from '@/types';

export const MOMENTS_PER_DAY = 7;

/** Toutes les journées, indexées par date locale YYYY-MM-DD. */
export type StoredData = Record<string, DayData>;

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const PLATFORMS: readonly Platform[] = ['ios', 'android', 'telegram', 'web', 'unknown'];
/** Garde-fous contre une entrée démesurée (7 par appareil, quelques appareils au plus). */
const MAX_MOMENTS_PER_DAY = 50;
const MAX_DAYS = 20000;

/** Vraie date du calendrier, entre 2020 et 2100 (bornes larges : une horloge d'appareil fausse ne fait rien perdre). */
function isRealDate(date: string): boolean {
  const m = DATE_RE.exec(date);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (y < 2020 || y > 2100) return false;
  const check = new Date(Date.UTC(y, mo - 1, d));
  return check.getUTCFullYear() === y && check.getUTCMonth() === mo - 1 && check.getUTCDate() === d;
}

function normalizeMoment(raw: unknown): PrayerMoment | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const ts = o.timestamp;
  if (typeof ts !== 'number' || !Number.isFinite(ts) || ts <= 0) return null;
  const platform = PLATFORMS.includes(o.platform as Platform) ? (o.platform as Platform) : 'unknown';
  const d = o.duration;
  const duration = typeof d === 'number' && Number.isFinite(d) && d >= 0 && d <= 3600 ? d : 0;
  return { timestamp: Math.round(ts), platform, duration };
}

function buildDay(date: string, moments: Iterable<PrayerMoment>): DayData {
  const byTs = new Map<number, PrayerMoment>();
  for (const m of moments) if (!byTs.has(m.timestamp)) byTs.set(m.timestamp, m);
  const sorted = [...byTs.values()].sort((a, b) => a.timestamp - b.timestamp).slice(0, MAX_MOMENTS_PER_DAY);
  const count = Math.min(sorted.length, MOMENTS_PER_DAY);
  return { date, moments: sorted, count, completed: count >= MOMENTS_PER_DAY };
}

/**
 * Valide et normalise des données d'origine inconnue (localStorage, requête réseau).
 * Ne garde que les jours datés correctement qui contiennent au moins un moment valide.
 */
export function sanitizeStoredData(input: unknown): StoredData {
  const out: StoredData = {};
  if (!input || typeof input !== 'object' || Array.isArray(input)) return out;
  let n = 0;
  for (const [date, day] of Object.entries(input as Record<string, unknown>)) {
    if (n >= MAX_DAYS) break;
    if (!isRealDate(date) || !day || typeof day !== 'object') continue;
    const raw = (day as { moments?: unknown }).moments;
    if (!Array.isArray(raw)) continue;
    const moments = raw.map(normalizeMoment).filter((m): m is PrayerMoment => m !== null);
    if (moments.length === 0) continue;
    out[date] = buildDay(date, moments);
    n++;
  }
  return out;
}

/** Union de deux carnets. Commutative, idempotente, ne perd jamais un moment. */
export function mergeStoredData(a: StoredData, b: StoredData): StoredData {
  const out: StoredData = {};
  const dates = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const date of [...dates].sort()) {
    const moments = [...(a[date]?.moments ?? []), ...(b[date]?.moments ?? [])];
    if (moments.length === 0) continue;
    out[date] = buildDay(date, moments);
  }
  return out;
}

/** Vrai si `server` ne contient pas l'un des moments de `local` (jour absent ou moment absent). */
export function missingFrom(local: StoredData, server: StoredData): boolean {
  for (const [date, day] of Object.entries(local)) {
    const known = new Set((server[date]?.moments ?? []).map((m) => m.timestamp));
    if (day.moments.some((m) => !known.has(m.timestamp))) return true;
  }
  return false;
}

/** Sous-ensemble des jours à partir d'une date (incluse). `null` renvoie tout. */
export function daysSince(data: StoredData, fromDate: string | null): StoredData {
  if (!fromDate) return { ...data };
  const out: StoredData = {};
  for (const [date, day] of Object.entries(data)) if (date >= fromDate) out[date] = day;
  return out;
}
