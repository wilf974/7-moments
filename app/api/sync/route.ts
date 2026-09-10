/**
 * POST /api/sync — synchronise un carnet de prière entre appareils.
 *
 * Corps : { code: string, create?: boolean, days: StoredData }
 * Réponse : { days: StoredData } — le carnet complet après fusion.
 *
 * - Le serveur fusionne (union) ce qu'il reçoit avec ce qu'il a : il ne supprime jamais rien.
 * - `create: true` crée le carnet s'il n'existe pas (premier appareil).
 *   Sans `create`, un code inconnu renvoie 404 (faute de frappe sur le deuxième appareil).
 */
import { mergeStoredData, sanitizeStoredData, type StoredData } from '@/lib/merge';
import { normalizeSyncCode, isValidSyncCode } from '@/lib/syncCode';
import { updateCarnet, CarnetLimitError } from '@/lib/carnetStore';
import { createRateLimiter } from '@/lib/rateLimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BODY_BYTES = 512 * 1024;
const requests = createRateLimiter({ limit: 120, windowMs: 10 * 60 * 1000 });
const unknownCodes = createRateLimiter({ limit: 10, windowMs: 60 * 60 * 1000 });

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

export async function POST(req: Request) {
  const ip = clientIp(req);
  if (!requests.hit(ip) || !unknownCodes.check(ip)) {
    return reply(429, { error: 'rate_limited' });
  }

  const declared = Number(req.headers.get('content-length') || 0);
  if (declared > MAX_BODY_BYTES) return reply(413, { error: 'too_large' });
  const text = await req.text();
  if (text.length > MAX_BODY_BYTES) return reply(413, { error: 'too_large' });

  let body: { code?: unknown; create?: unknown; days?: unknown };
  try {
    body = JSON.parse(text);
  } catch {
    return reply(400, { error: 'bad_json' });
  }

  const code = typeof body.code === 'string' ? normalizeSyncCode(body.code) : '';
  if (!isValidSyncCode(code)) return reply(400, { error: 'bad_code' });

  const incoming = sanitizeStoredData(body.days);
  const create = body.create === true;

  let result: StoredData | null;
  try {
    result = await updateCarnet(code, (current) => {
      if (current === null && !create) return null;
      return mergeStoredData(current ?? {}, incoming);
    });
  } catch (error) {
    if (error instanceof CarnetLimitError) return reply(507, { error: 'full' });
    console.error('[sync] écriture impossible', error);
    return reply(500, { error: 'server' });
  }

  if (result === null) {
    unknownCodes.hit(ip);
    return reply(404, { error: 'unknown_code' });
  }
  return reply(200, { days: result });
}
