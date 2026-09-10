import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateSyncCode, normalizeSyncCode, isValidSyncCode, formatSyncCode, SYNC_CODE_ALPHABET } from '../lib/syncCode.ts';

test('un code généré est valide, fait 8 caractères et évite les caractères ambigus', () => {
  for (let i = 0; i < 500; i++) {
    const c = generateSyncCode();
    assert.equal(c.length, 8);
    assert.ok(isValidSyncCode(c), c);
    assert.ok(!/[01OIL]/.test(c), c);
  }
});

test('les codes générés ne se répètent pas', () => {
  const seen = new Set(Array.from({ length: 2000 }, () => generateSyncCode()));
  assert.equal(seen.size, 2000);
});

test('la saisie est normalisée : minuscules, espaces et tirets acceptés', () => {
  assert.equal(normalizeSyncCode(' abcd-efgh '), 'ABCDEFGH');
  assert.equal(normalizeSyncCode('ab cd ef gh'), 'ABCDEFGH');
});

test('les codes invalides sont refusés', () => {
  assert.equal(isValidSyncCode('ABCDEFG'), false);
  assert.equal(isValidSyncCode('ABCDEFGHJ'), false);
  assert.equal(isValidSyncCode('ABCD0FGH'), false);
  assert.equal(isValidSyncCode('../../aa'), false);
});

test('affichage en deux groupes de quatre', () => {
  assert.equal(formatSyncCode('ABCDEFGH'), 'ABCD-EFGH');
});

test("l'alphabet compte 31 symboles sans doublon", () => {
  assert.equal(new Set(SYNC_CODE_ALPHABET).size, 31);
  assert.equal(SYNC_CODE_ALPHABET.length, 31);
});
