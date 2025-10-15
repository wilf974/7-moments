#!/usr/bin/env node

/**
 * Script de diagnostic pour le calendrier
 * À exécuter sur le VPS pour identifier le problème exact
 */

console.log("=== DIAGNOSTIC CALENDRIER VPS ===");
console.log("Date d'exécution:", new Date().toISOString());
console.log("Fuseau horaire:", Intl.DateTimeFormat().resolvedOptions().timeZone);
console.log("");

// Test 1: Vérifier la date du 14 octobre 2025
console.log("1. TEST DE LA DATE 14 OCTOBRE 2025");
console.log("==================================");
const oct14 = new Date(2025, 9, 14); // octobre = 9 (0-indexé)
console.log(`Date créée: ${oct14.toISOString()}`);
console.log(`Jour de la semaine: ${oct14.getDay()} (0=Dim, 1=Lun, 2=Mar, 3=Mer, 4=Jeu, 5=Ven, 6=Sam)`);
console.log(`Nom du jour: ${['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'][oct14.getDay()]}`);
console.log("");

// Test 2: Vérifier la fonction getMonthDates
console.log("2. TEST DE LA FONCTION getMonthDates");
console.log("====================================");

function getMonthDates(year, month) {
  const dates = [];
  
  const firstDayOfMonth = new Date(year, month, 1);
  const firstDayWeekday = firstDayOfMonth.getDay();
  
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(startDate.getDate() - firstDayWeekday);
  
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate.getTime() + (i * 24 * 60 * 60 * 1000));
    dates.push(date);
  }
  
  return dates;
}

const dates = getMonthDates(2025, 9);
console.log(`Nombre de dates générées: ${dates.length}`);

// Trouver le 14 octobre
const oct14Index = dates.findIndex(date => date.getDate() === 14 && date.getMonth() === 9);
if (oct14Index !== -1) {
  const oct14InCalendar = dates[oct14Index];
  const column = oct14Index % 7;
  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  
  console.log(`14 octobre trouvé à l'index: ${oct14Index}`);
  console.log(`Colonne dans la grille: ${column}`);
  console.log(`Jour de la semaine: ${oct14InCalendar.getDay()}`);
  console.log(`Nom du jour: ${dayNames[oct14InCalendar.getDay()]}`);
  console.log(`Colonne correspond à: ${dayNames[column]}`);
  
  if (oct14InCalendar.getDay() === column) {
    console.log("✅ COHÉRENT: Le jour de la semaine correspond à la colonne");
  } else {
    console.log("❌ INCOHÉRENT: Le jour de la semaine ne correspond pas à la colonne");
  }
} else {
  console.log("❌ 14 octobre non trouvé dans le calendrier généré!");
}
console.log("");

// Test 3: Vérifier les premiers jours du calendrier
console.log("3. PREMIERS JOURS DU CALENDRIER");
console.log("===============================");
for (let i = 0; i < 7; i++) {
  const date = dates[i];
  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  console.log(`Index ${i}: ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} - ${dayNames[date.getDay()]} (colonne ${i})`);
}
console.log("");

// Test 4: Vérifier la semaine qui contient le 14 octobre
console.log("4. SEMAINE CONTENANT LE 14 OCTOBRE");
console.log("===================================");
const weekStart = Math.floor(oct14Index / 7) * 7;
for (let i = weekStart; i < weekStart + 7; i++) {
  if (i < dates.length) {
    const date = dates[i];
    const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const isHighlighted = i === oct14Index ? " ← 14 OCTOBRE" : "";
    console.log(`Index ${i}: ${date.getDate()}/${date.getMonth() + 1} - ${dayNames[date.getDay()]} (colonne ${i % 7})${isHighlighted}`);
  }
}
console.log("");

// Test 5: Vérifier la logique de formatDate
console.log("5. TEST DE LA FONCTION formatDate");
console.log("==================================");
function formatDate(date) {
  return date.toISOString().split('T')[0];
}

const oct14Formatted = formatDate(oct14);
console.log(`14 octobre formaté: ${oct14Formatted}`);

// Test 6: Vérifier la fonction getDayData simulée
console.log("6. TEST DE LA FONCTION getDayData");
console.log("==================================");
function getDayData(dateString) {
  return {
    date: dateString,
    moments: [],
    completed: false,
    count: 0,
  };
}

const oct14DayData = getDayData(oct14Formatted);
console.log(`Données du jour 14 octobre:`, oct14DayData);
console.log("");

// Test 7: Vérifier la fonction getMonthData complète
console.log("7. TEST DE LA FONCTION getMonthData");
console.log("===================================");
function getMonthData(year, month) {
  const dates = getMonthDates(year, month);
  const days = dates.map(date => getDayData(formatDate(date)));
  
  return {
    year,
    month,
    days,
  };
}

const monthData = getMonthData(2025, 9);
console.log(`Données du mois générées:`);
console.log(`- Année: ${monthData.year}`);
console.log(`- Mois: ${monthData.month}`);
console.log(`- Nombre de jours: ${monthData.days.length}`);

// Trouver le 14 octobre dans les données du mois
const oct14InMonthData = monthData.days.find(day => {
  const date = new Date(day.date);
  return date.getDate() === 14 && date.getMonth() === 9;
});

if (oct14InMonthData) {
  const date = new Date(oct14InMonthData.date);
  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  console.log(`14 octobre dans monthData: ${dayNames[date.getDay()]}`);
} else {
  console.log("❌ 14 octobre non trouvé dans monthData!");
}
console.log("");

// Test 8: Vérifier la date actuelle du système
console.log("8. DATE ACTUELLE DU SYSTÈME");
console.log("============================");
const now = new Date();
console.log(`Date actuelle: ${now.toISOString()}`);
console.log(`Jour de la semaine actuel: ${now.getDay()} (${['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'][now.getDay()]})`);
console.log(`Date locale: ${now.toLocaleDateString('fr-FR')}`);
console.log(`Heure locale: ${now.toLocaleTimeString('fr-FR')}`);
console.log("");

console.log("=== FIN DU DIAGNOSTIC ===");
