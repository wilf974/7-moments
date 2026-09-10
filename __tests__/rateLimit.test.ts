import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRateLimiter } from '../lib/rateLimit.ts';

test("autorise jusqu'à la limite puis refuse", () => {
  const now = 0;
  const rl = createRateLimiter({ limit: 3, windowMs: 1000, now: () => now });
  assert.equal(rl.hit('a'), true);
  assert.equal(rl.hit('a'), true);
  assert.equal(rl.hit('a'), true);
  assert.equal(rl.hit('a'), false);
  assert.equal(rl.hit('b'), true, 'une autre adresse a son propre compteur');
});

test('la fenêtre glisse et libère les anciens coups', () => {
  let now = 0;
  const rl = createRateLimiter({ limit: 2, windowMs: 1000, now: () => now });
  rl.hit('a');
  rl.hit('a');
  assert.equal(rl.hit('a'), false);
  now = 1001;
  assert.equal(rl.hit('a'), true);
});

test('check ne consomme pas de coup', () => {
  const now = 0;
  const rl = createRateLimiter({ limit: 1, windowMs: 1000, now: () => now });
  assert.equal(rl.check('a'), true);
  assert.equal(rl.check('a'), true);
  rl.hit('a');
  assert.equal(rl.check('a'), false);
});

test('la mémoire est bornée : les clés expirées sont purgées', () => {
  let now = 0;
  const rl = createRateLimiter({ limit: 1, windowMs: 1000, now: () => now });
  for (let i = 0; i < 100; i++) rl.hit(`ip${i}`);
  now = 5000;
  rl.hit('nouvelle');
  assert.ok(rl.size() <= 1, `taille ${rl.size()}`);
});
