import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { readCarnet, updateCarnet, carnetExists, CarnetLimitError } from '../lib/carnetStore.ts';

const fresh = () => mkdtempSync(path.join(tmpdir(), 'carnet-'));
const d = (n: number) => ({
  '2026-09-01': { date: '2026-09-01', moments: [{ timestamp: n, platform: 'web' as const, duration: 30 }], count: 1, completed: false },
});

test('un carnet absent se lit comme null', async () => {
  const dir = fresh();
  assert.equal(await readCarnet('ABCDEFGH', { dir }), null);
  rmSync(dir, { recursive: true });
});

test('updateCarnet écrit puis relit le contenu', async () => {
  const dir = fresh();
  const out = await updateCarnet('ABCDEFGH', () => d(1), { dir });
  assert.deepEqual(out, d(1));
  assert.deepEqual(await readCarnet('ABCDEFGH', { dir }), d(1));
  rmSync(dir, { recursive: true });
});

test("un updater qui renvoie null n'écrit rien", async () => {
  const dir = fresh();
  assert.equal(await updateCarnet('ABCDEFGH', () => null, { dir }), null);
  assert.deepEqual(readdirSync(dir), []);
  rmSync(dir, { recursive: true });
});

test('les écritures concurrentes sur un même carnet sont sérialisées', async () => {
  const dir = fresh();
  await updateCarnet('ABCDEFGH', () => ({}), { dir });
  await Promise.all(
    Array.from({ length: 20 }, (_, i) =>
      updateCarnet(
        'ABCDEFGH',
        (cur) => {
          const next: Record<string, unknown> = { ...(cur ?? {}) };
          next[`2026-01-${String(i + 1).padStart(2, '0')}`] = i;
          return next as never;
        },
        { dir },
      ),
    ),
  );
  const final = await readCarnet('ABCDEFGH', { dir });
  assert.equal(Object.keys(final ?? {}).length, 20);
  assert.deepEqual(readdirSync(dir).filter((f) => f.endsWith('.tmp')), [], 'aucun fichier temporaire ne traîne');
  rmSync(dir, { recursive: true });
});

test('un code invalide est refusé avant tout accès disque', async () => {
  const dir = fresh();
  await assert.rejects(() => updateCarnet('../../x', () => ({}), { dir }));
  await assert.rejects(() => readCarnet('abc', { dir }));
  rmSync(dir, { recursive: true });
});

test('la création est refusée au-delà du nombre maximal de carnets', async () => {
  const dir = fresh();
  await updateCarnet('AAAAAAAA', () => ({}), { dir, maxCarnets: 1 });
  await assert.rejects(() => updateCarnet('BBBBBBBB', () => ({}), { dir, maxCarnets: 1 }), CarnetLimitError);
  // mettre à jour un carnet existant reste permis
  await updateCarnet('AAAAAAAA', () => d(2), { dir, maxCarnets: 1 });
  assert.deepEqual(await readCarnet('AAAAAAAA', { dir }), d(2));
  rmSync(dir, { recursive: true });
});

test('un fichier corrompu est mis de côté et le carnet repart vide au lieu de rester bloqué', async () => {
  const dir = fresh();
  writeFileSync(path.join(dir, 'ABCDEFGH.json'), '{ pas du json');
  assert.deepEqual(await readCarnet('ABCDEFGH', { dir }), {});
  const out = await updateCarnet('ABCDEFGH', (cur) => ({ ...(cur ?? {}), ...d(3) }), { dir });
  assert.deepEqual(out, d(3));
  assert.equal(readdirSync(dir).filter((f) => f.includes('.corrupt-')).length, 1, 'le fichier abîmé est conservé à part');
  rmSync(dir, { recursive: true });
});

test('carnetExists distingue un carnet présent d un carnet absent', async () => {
  const dir = fresh();
  assert.equal(await carnetExists('ABCDEFGH', { dir }), false);
  await updateCarnet('ABCDEFGH', () => ({}), { dir });
  assert.equal(await carnetExists('ABCDEFGH', { dir }), true);
  rmSync(dir, { recursive: true });
});
