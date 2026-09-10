/**
 * POST /api/sync — synchronise un carnet de prière entre appareils.
 *
 * Créer un carnet (premier appareil) : { create: true, days }
 *   → { code, days } — le code est tiré par le serveur.
 * Synchroniser / rejoindre :           { code, days }
 *   → { days } — le carnet complet après fusion ; 404 si le code n'existe pas.
 *
 * Le serveur fusionne (union) ce qu'il reçoit avec ce qu'il a : il ne supprime jamais rien.
 */
import { mergeStoredData, sanitizeStoredData, type StoredData } from '@/lib/merge';
import { generateSyncCode, normalizeSyncCode, isValidSyncCode } from '@/lib/syncCode';
import { updateCarnet, carnetExists, CarnetLimitError } from '@/lib/carnetStore';
import { createRateLimiter } from '@/lib/rateLimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** nginx refuse au-delà de 1 Mo (client_max_body_size par défaut). */
const MAX_BODY_BYTES = 1024 * 1024;
/** Un carnet de plus de ~8 ans de journées, ou de plus de 2 Mo, est refusé : garde-fou mémoire et disque. */
const MAX_CARNET_DAYS = 3000;
const MAX_CARNET_BYTES = 2 * 1024 * 1024;

const HOUR = 60 * 60 * 1000;
const requests = createRateLimiter({ limit: 120, windowMs: 10 * 60 * 1000 });
const unknownCodes = createRateLimiter({ limit: 10, windowMs: HOUR });
const creations = createRateLimiter({ limit: 5, windowMs: 24 * HOUR });

class TooLargeError extends Error {}

function reply(status: number, body: unknown) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}

function clientIp(req: Request): string {
  return (
    req.headers.get('x-real-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    'inconnu'
  );
}

/** Fusionne en refusant un résultat démesuré (rien n'est écrit dans ce cas). */
function mergeBounded(current: StoredData, incoming: StoredData): StoredData {
  const merged = mergeStoredData(current, incoming);
  if (Object.keys(merged).length > MAX_CARNET_DAYS || JSON.stringify(merged).length > MAX_CARNET_BYTES) {
    throw new TooLargeError();
  }
  return merged;
}

async function freshCode(): Promise<string> {
  for (let i = 0; i < 5; i++) {
    const code = generateSyncCode();
    if (!(await carnetExists(code))) return code;
  }
  throw new Error('Impossible de tirer un code libre');
}

export async function POST(req: Request) {
  const ip = clientIp(req);
  if (!requests.hit(ip) || !unknownCodes.check(ip)) {
    return reply(429, { error: 'rate_limited' });
  }

  const declared = Number(req.headers.get('content-length') || 0);
  if (declared > MAX_BODY_BYTES) return reply(413, { error: 'too_large' });
  const text = await req.text();
  if (text.length > MAX_BODY_BYTES) return reply(413, { error: 'too_large' });

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return reply(400, { error: 'bad_json' });
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return reply(400, { error: 'bad_json' });
  const body = parsed as { code?: unknown; create?: unknown; days?: unknown };
  const incoming = sanitizeStoredData(body.days);

  try {
    if (body.create === true) {
      if (!creations.hit(ip)) return reply(429, { error: 'rate_limited' });
      const code = await freshCode();
      const days = await updateCarnet(code, (current) => mergeBounded(current ?? {}, incoming));
      return reply(201, { code, days });
    }

    const code = typeof body.code === 'string' ? normalizeSyncCode(body.code) : '';
    if (!isValidSyncCode(code)) return reply(400, { error: 'bad_code' });

    const days = await updateCarnet(code, (current) => (current === null ? null : mergeBounded(current, incoming)));
    if (days === null) {
      unknownCodes.hit(ip);
      return reply(404, { error: 'unknown_code' });
    }
    return reply(200, { days });
  } catch (error) {
    if (error instanceof TooLargeError) return reply(413, { error: 'too_large' });
    if (error instanceof CarnetLimitError) return reply(507, { error: 'full' });
    console.error('[sync] écriture impossible', error);
    return reply(500, { error: 'server' });
  }
}
