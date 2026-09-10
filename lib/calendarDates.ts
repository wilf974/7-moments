/**
 * Dates de la grille du calendrier : 6 semaines, du dimanche qui précède
 * (ou qui est) le 1er du mois.
 *
 * On avance en jours du calendrier (new Date(a, m, j + i)) et non en ajoutant
 * 24 h en millisecondes : au passage à l'heure d'hiver, le jour dure 25 h et
 * l'addition de 24 h retombait la veille à 23 h, d'où une date en double
 * (le « double 26 » d'octobre 2025) et un décalage d'un jour pour la suite du mois.
 */
export function getMonthDates(year: number, month: number): Date[] {
  const firstDayWeekday = new Date(year, month, 1).getDay(); // 0 = dimanche
  return Array.from({ length: 42 }, (_, i) => new Date(year, month, 1 - firstDayWeekday + i));
}
