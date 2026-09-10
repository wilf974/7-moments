import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHub } from '../lib/syncHub.ts';
import { sseEvent, sseComment, isValidClientId } from '../lib/sse.ts';
import { countMoments } from '../lib/merge.ts';

test('un abonné reçoit les messages de son carnet, pas ceux des autres', () => {
  const hub = createHub();
  const got: unknown[] = [];
  hub.subscribe('AAAAAAAA', (m) => got.push(m));
  hub.publish('AAAAAAAA', { at: 1, from: 'x' });
  hub.publish('BBBBBBBB', { at: 2, from: 'y' });
  assert.deepEqual(got, [{ at: 1, from: 'x' }]);
});

test('le désabonnement libère la place et nettoie le carnet vide', () => {
  const hub = createHub();
  const off1 = hub.subscribe('AAAAAAAA', () => {});
  const off2 = hub.subscribe('AAAAAAAA', () => {});
  assert.equal(hub.count('AAAAAAAA'), 2);
  assert.equal(hub.total(), 2);
  off1();
  off1(); // deux fois : sans effet
  assert.equal(hub.count('AAAAAAAA'), 1);
  off2();
  assert.equal(hub.count('AAAAAAAA'), 0);
  assert.equal(hub.total(), 0);
});

test("un abonné qui plante n'empêche pas les autres de recevoir", () => {
  const hub = createHub();
  let ok = 0;
  hub.subscribe('AAAAAAAA', () => {
    throw new Error('connexion morte');
  });
  hub.subscribe('AAAAAAAA', () => ok++);
  hub.publish('AAAAAAAA', { at: 1, from: null });
  assert.equal(ok, 1);
});

test('format SSE : un événement tient sur une ligne data, même avec des retours à la ligne', () => {
  assert.equal(sseEvent('update', { a: 'x\ny' }), 'event: update\ndata: {"a":"x\\ny"}\n\n');
  assert.equal(sseComment('ping'), ': ping\n\n');
});

test('identifiant de client : court, alphanumérique, sinon refusé', () => {
  assert.equal(isValidClientId('a1b2c3d4e5f6a7b8'), true);
  assert.equal(isValidClientId('abc'), false);
  assert.equal(isValidClientId('x'.repeat(40)), false);
  assert.equal(isValidClientId('abc\nevent: update'), false);
  assert.equal(isValidClientId(42), false);
});

test('countMoments compte tous les moments du carnet', () => {
  const day = (n: number) => ({ date: '2026-09-01', moments: Array.from({ length: n }, (_, i) => ({ timestamp: i + 1, platform: 'web' as const, duration: 30 })), count: n, completed: n >= 7 });
  assert.equal(countMoments({}), 0);
  assert.equal(countMoments({ '2026-09-01': day(3), '2026-09-02': { ...day(9), date: '2026-09-02' } }), 12);
});
