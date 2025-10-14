'use client';

/**
 * Composant Calendar simplifié pour tester l'affichage
 * Génère les données directement sans dépendances externes
 */

import { useState, useEffect } from 'react';

interface DayData {
  date: string;
  moments: any[];
  completed: boolean;
  count: number;
}

interface MonthData {
  year: number;
  month: number;
  days: DayData[];
}

/**
 * Génère les dates d'un mois avec les jours précédents/suivants
 */
function getMonthDates(year: number, month: number): Date[] {
  const dates: Date[] = [];
  
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

/**
 * Formate une date au format YYYY-MM-DD
 */
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Obtient le nom du mois en français
 */
function getMonthName(month: number): string {
  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  return months[month];
}

/**
 * Vérifie si une date est aujourd'hui
 */
function isToday(date: Date): boolean {
  const today = new Date();
  return date.getDate() === today.getDate() && 
         date.getMonth() === today.getMonth() && 
         date.getFullYear() === today.getFullYear();
}

/**
 * Composant Calendar simplifié
 */
export default function SimpleCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 9, 14)); // 14 octobre 2025
  const [monthData, setMonthData] = useState<MonthData | null>(null);

  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const dates = getMonthDates(year, month);
    const days: DayData[] = dates.map(date => ({
      date: formatDate(date),
      moments: [],
      completed: false,
      count: 0,
    }));
    
    setMonthData({
      year,
      month,
      days,
    });
  }, [currentDate]);

  if (!monthData) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Chargement du calendrier...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header du calendrier */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          {getMonthName(currentDate.getMonth())} {currentDate.getFullYear()}
        </h2>
      </div>

      {/* Légende */}
      <div className="flex flex-wrap gap-4 mb-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span>7/7 moments</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-400 rounded"></div>
          <span>1-6 moments</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-100 rounded"></div>
          <span>Aucun moment</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-100 border-2 border-blue-300 rounded"></div>
          <span>Aujourd&apos;hui</span>
        </div>
      </div>

      {/* Grille du calendrier */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {/* En-têtes des jours */}
        {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map((day) => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
        
        {/* Jours du mois */}
        {monthData.days.map((dayData, index) => {
          const date = new Date(dayData.date);
          const dayNumber = date.getDate();
          const isCurrentDay = isToday(date);
          const isCurrentMonth = date.getMonth() === currentDate.getMonth();
          
          // Déterminer la couleur
          let bgColor = 'bg-gray-100 text-gray-600';
          if (dayData.completed) {
            bgColor = 'bg-green-500 text-white';
          } else if (dayData.count > 0) {
            bgColor = 'bg-yellow-400 text-gray-800';
          } else if (isCurrentDay) {
            bgColor = 'bg-blue-100 text-blue-800 border-2 border-blue-300';
          }
          
          return (
            <div
              key={dayData.date}
              className={`
                p-2 text-center text-sm rounded-lg transition-all duration-200
                ${bgColor}
                ${!isCurrentMonth ? 'opacity-40' : ''}
                ${isCurrentDay ? 'ring-2 ring-blue-400' : ''}
              `}
            >
              <div className="flex flex-col items-center">
                <span className={`font-medium ${!isCurrentMonth ? 'text-gray-400' : ''}`}>
                  {dayNumber}
                </span>
                {dayData.count > 0 && !dayData.completed && (
                  <span className="text-xs mt-1">{dayData.count}/7</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Debug info */}
      <div className="mt-4 p-4 bg-gray-100 rounded text-xs">
        <div><strong>Debug Info:</strong></div>
        <div>Date actuelle: {currentDate.toISOString()}</div>
        <div>14 octobre jour de la semaine: {new Date(2025, 9, 14).getDay()} (0=Dim, 1=Lun, 2=Mar, 3=Mer, 4=Jeu, 5=Ven, 6=Sam)</div>
        <div>14 octobre nom: {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'][new Date(2025, 9, 14).getDay()]}</div>
      </div>
    </div>
  );
}
