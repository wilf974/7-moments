// À lancer avec TZ=Europe/Paris : le défaut n'existe qu'avec un changement d'heure.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getMonthDates } from '../lib/calendarDates.ts';

const fmt = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

for (const [label, year, month] of [
  ['octobre 2025 (passage à l\'heure d\'hiver le 26)', 2025, 9],
  ['octobre 2026 (passage à l\'heure d\'hiver le 25)', 2026, 9],
  ['mars 2026 (passage à l\'heure d\'été le 29)', 2026, 2],
  ['septembre 2026', 2026, 8],
] as const) {
  test(`grille de ${label} : 42 jours consécutifs, sans doublon, alignés sur les jours de la semaine`, () => {
    const dates = getMonthDates(year, month);
    assert.equal(dates.length, 42);
    assert.equal(new Set(dates.map(fmt)).size, 42, 'aucune date en double');
    dates.forEach((d, i) => {
      assert.equal(d.getDay(), i % 7, `${fmt(d)} doit être dans la colonne ${i % 7}`);
      if (i > 0) {
        const prev = dates[i - 1];
        const next = new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + 1);
        assert.equal(fmt(d), fmt(next), 'jours consécutifs');
      }
    });
    assert.ok(dates.some((d) => fmt(d) === `${year}-${String(month + 1).padStart(2, '0')}-01`));
  });
}
