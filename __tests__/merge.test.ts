import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mergeStoredData, sanitizeStoredData, daysSince, MOMENTS_PER_DAY } from '../lib/merge.ts';

const m = (timestamp: number, platform = 'android') => ({ timestamp, platform, duration: 30 });
const day = (date: string, ts: number[], platform = 'android') => ({
  date,
  moments: ts.map((t) => m(t, platform)),
  count: ts.length,
  completed: ts.length >= 7,
});

test('fusionne les moments de deux appareils pour le même jour', () => {
  const phone = { '2026-09-01': day('2026-09-01', [1, 2, 3, 4]) };
  const ipad = { '2026-09-01': day('2026-09-01', [10, 11, 12], 'ios') };
  const merged = mergeStoredData(phone, ipad);
  assert.equal(merged['2026-09-01'].moments.length, 7);
  assert.equal(merged['2026-09-01'].count, 7);
  assert.equal(merged['2026-09-01'].completed, true);
});

test("un moment présent des deux côtés n'est compté qu'une fois", () => {
  const a = { '2026-09-01': day('2026-09-01', [1, 2, 3]) };
  const merged = mergeStoredData(a, a);
  assert.equal(merged['2026-09-01'].count, 3);
  assert.equal(merged['2026-09-01'].completed, false);
});

test("le compteur est plafonné à 7 mais aucun moment n'est jeté", () => {
  const a = { '2026-09-01': day('2026-09-01', [1, 2, 3, 4, 5]) };
  const b = { '2026-09-01': day('2026-09-01', [6, 7, 8, 9]) };
  const merged = mergeStoredData(a, b);
  assert.equal(merged['2026-09-01'].moments.length, 9);
  assert.equal(merged['2026-09-01'].count, MOMENTS_PER_DAY);
  assert.equal(merged['2026-09-01'].completed, true);
});

test('la fusion est commutative et idempotente', () => {
  const a = { '2026-09-01': day('2026-09-01', [3, 1]), '2026-09-02': day('2026-09-02', [5]) };
  const b = { '2026-09-01': day('2026-09-01', [2]), '2026-09-03': day('2026-09-03', [9]) };
  const ab = mergeStoredData(a, b);
  assert.deepEqual(ab, mergeStoredData(b, a));
  assert.deepEqual(mergeStoredData(ab, b), ab);
  assert.deepEqual(ab['2026-09-01'].moments.map((x) => x.timestamp), [1, 2, 3]);
});

test('aucun jour local ne disparaît, même fusionné avec un carnet vide', () => {
  const local = { '2026-01-05': day('2026-01-05', [1, 2, 3, 4, 5, 6, 7]), '2026-09-01': day('2026-09-01', [8]) };
  const merged = mergeStoredData(local, {});
  assert.deepEqual(Object.keys(merged).sort(), ['2026-01-05', '2026-09-01']);
  assert.equal(merged['2026-01-05'].completed, true);
});

test('sanitize rejette les clés et moments invalides', () => {
  const dirty = {
    '2026-09-01': { moments: [m(100), { timestamp: 'x' }, null, { timestamp: -5 }], count: 99, completed: true },
    '../../etc': day('2026-09-02', [1]),
    date: 'x',
    '2026-09-03': { moments: [] },
  };
  const clean = sanitizeStoredData(dirty);
  assert.deepEqual(Object.keys(clean), ['2026-09-01']);
  assert.equal(clean['2026-09-01'].count, 1);
  assert.equal(clean['2026-09-01'].completed, false);
  assert.equal(clean['2026-09-01'].date, '2026-09-01');
});

test('sanitize normalise une plateforme inconnue', () => {
  const clean = sanitizeStoredData({ '2026-09-01': { moments: [{ timestamp: 5, platform: '<script>', duration: 30 }] } });
  assert.equal(clean['2026-09-01'].moments[0].platform, 'unknown');
});

test('sanitize renvoie un objet vide pour une entrée absurde', () => {
  assert.deepEqual(sanitizeStoredData(null), {});
  assert.deepEqual(sanitizeStoredData([1, 2]), {});
  assert.deepEqual(sanitizeStoredData('abc'), {});
});

test('daysSince ne garde que les jours à partir de la date donnée', () => {
  const data = { '2026-08-30': day('2026-08-30', [1]), '2026-09-01': day('2026-09-01', [2]), '2026-09-02': day('2026-09-02', [3]) };
  assert.deepEqual(Object.keys(daysSince(data, '2026-09-01')).sort(), ['2026-09-01', '2026-09-02']);
  assert.deepEqual(Object.keys(daysSince(data, null)).sort(), Object.keys(data).sort());
});
