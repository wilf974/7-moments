/**
 * Utilitaires pour l'application 7 Rendez-vous de Prière
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combine les classes CSS avec clsx et tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formate une date au format YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Obtient la date d'aujourd'hui au format YYYY-MM-DD
 */
export function getTodayString(): string {
  return formatDate(new Date());
}

/**
 * Obtient le début du mois pour une date donnée
 */
export function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * Obtient la fin du mois pour une date donnée
 */
export function getMonthEnd(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

/**
 * Génère un tableau de dates pour un mois donné
 */
export function getMonthDates(year: number, month: number): Date[] {
  const dates: Date[] = [];
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);
  
  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    dates.push(new Date(date));
  }
  
  return dates;
}

/**
 * Vérifie si deux dates sont le même jour
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return formatDate(date1) === formatDate(date2);
}

/**
 * Obtient le nom du mois en français
 */
export function getMonthName(month: number): string {
  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  return months[month];
}

/**
 * Obtient le nom du jour de la semaine en français
 */
export function getDayName(day: number): string {
  const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  return days[day];
}

/**
 * Formate une durée en secondes en format MM:SS
 */
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Obtient le fuseau horaire de l'utilisateur
 */
export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Vérifie si une date est aujourd'hui
 */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

/**
 * Obtient le nombre de jours dans un mois
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}
