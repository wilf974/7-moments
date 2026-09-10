/**
 * GET /api/sync/events?code=XXXXXXXX — flux Server-Sent Events d'un carnet.
 *
 * Le serveur n'envoie pas les données, seulement un signal « update » quand un autre
 * appareil vient d'ajouter des moments ; l'appareil fait alors une synchro (POST /api/sync).
 * Battement de cœur toutes les 25 s pour que nginx et les réseaux mobiles gardent la connexion.
 */
import { carnetExists } from '@/lib/carnetStore';
import { isValidSyncCode, normalizeSyncCode } from '@/lib/syncCode';
import { syncHub } from '@/lib/syncHub';
import { createRateLimiter } from '@/lib/rateLimit';
import { sseComment, sseEvent } from '@/lib/sse';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const HEARTBEAT_MS = 25000;
const MAX_PER_CARNET = 10;
const MAX_TOTAL = 200;
const connections = createRateLimiter({ limit: 60, windowMs: 10 * 60 * 1000 });

function reply(status: number, error: string) {
  return Response.json({ error }, { status, headers: { 'Cache-Control': 'no-store' } });
}

function clientIp(req: Request): string {
  return (
    req.headers.get('x-real-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    'inconnu'
  );
}

export async function GET(req: Request) {
  if (!connections.hit(clientIp(req))) return reply(429, 'rate_limited');

  const code = normalizeSyncCode(new URL(req.url).searchParams.get('code') ?? '');
  if (!isValidSyncCode(code)) return reply(400, 'bad_code');
  if (!(await carnetExists(code))) return reply(404, 'unknown_code');
  if (syncHub.count(code) >= MAX_PER_CARNET || syncHub.total() >= MAX_TOTAL) return reply(503, 'busy');

  const encoder = new TextEncoder();
  let cleanup = () => {};

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (text: string) => {
        try {
          controller.enqueue(encoder.encode(text));
        } catch {
          cleanup();
        }
      };
      const unsubscribe = syncHub.subscribe(code, (message) => send(sseEvent('update', message)));
      const heartbeat = setInterval(() => send(sseComment('ping')), HEARTBEAT_MS);
      const onAbort = () => cleanup();

      cleanup = () => {
        cleanup = () => {};
        clearInterval(heartbeat);
        unsubscribe();
        req.signal.removeEventListener('abort', onAbort);
        try {
          controller.close();
        } catch {
          // déjà fermé
        }
      };
      req.signal.addEventListener('abort', onAbort);

      send('retry: 5000\n\n');
      send(sseEvent('ready', { at: Date.now() }));
    },
    cancel() {
      cleanup();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      // nginx : ne pas mettre le flux en tampon, sinon les signaux arrivent en retard
      'X-Accel-Buffering': 'no',
    },
  });
}
