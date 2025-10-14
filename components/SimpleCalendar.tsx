'use client';

/**
 * Composant Calendar simplifié pour tester l'affichage
 * Génère les données directement sans dépendances externes
 */

import { useState, useEffect } from 'react';
import { parseDate } from '@/lib/utils';

interface DayData {
  date: string;
  moments: {
    timestamp: string;
    label: string;
  }[];
  completed: boolean;
  count: number;
}

interface MonthData {
  year: number;
  month: number;
  days: DayData[];
}

const SAMPLE_DAY_STATUS: Record<string, Partial<DayData>> = {
  '2025-10-07': {
    completed: true,
    count: 7,
    moments: [
      { timestamp: '2025-10-07T06:30:00', label: 'Prière du matin' },
      { timestamp: '2025-10-07T09:00:00', label: 'Louange' },
      { timestamp: '2025-10-07T11:30:00', label: 'Lecture biblique' },
      { timestamp: '2025-10-07T14:00:00', label: 'Prière de midi' },
      { timestamp: '2025-10-07T17:45:00', label: 'Méditation' },
      { timestamp: '2025-10-07T19:15:00', label: 'Prière du soir' },
      { timestamp: '2025-10-07T21:00:00', label: 'Gratitude' },
    ],
  },
  '2025-10-14': {
    completed: false,
    count: 4,
    moments: [
      { timestamp: '2025-10-14T07:00:00', label: 'Prière du matin' },
      { timestamp: '2025-10-14T12:15:00', label: 'Lecture biblique' },
      { timestamp: '2025-10-14T15:40:00', label: 'Louange courte' },
      { timestamp: '2025-10-14T20:10:00', label: 'Partage de foi' },
    ],
  },
  '2025-10-10': {
    completed: false,
    count: 1,
    moments: [
      { timestamp: '2025-10-10T18:45:00', label: 'Louange' },
    ],
  },
};

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
 * Formate une date au format YYYY-MM-DD sans décalage UTC.
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
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
  const [currentDate] = useState(new Date(2025, 9, 14)); // 14 octobre 2025
  const [monthData, setMonthData] = useState<MonthData | null>(null);
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);

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

    const enhancedDays = days.map(day => {
      const override = SAMPLE_DAY_STATUS[day.date];
      if (!override) return day;

      return {
        ...day,
        ...override,
      };
    });
    
    const monthPayload: MonthData = {
      year,
      month,
      days: enhancedDays,
    };

    setMonthData(monthPayload);

    setSelectedDay((previous) => {
      if (previous) {
        const updated = enhancedDays.find(day => day.date === previous.date);
        if (updated) return updated;
      }

      const todayData = enhancedDays.find(day => day.date === formatDate(currentDate));
      return todayData || enhancedDays[0] || null;
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
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-700">
            {day}
          </div>
        ))}
        
        {/* Jours du mois */}
        {monthData.days.map((dayData) => {
          const date = parseDate(dayData.date);
          const dayNumber = date.getDate();
          const isCurrentDay = isToday(date);
          const isCurrentMonth = date.getMonth() === currentDate.getMonth();
          const isSelected = selectedDay?.date === dayData.date;
          
          // Déterminer la couleur
          let bgColor = 'bg-gray-100 text-gray-900';
          if (dayData.completed) {
            bgColor = 'bg-green-500 text-white';
          } else if (dayData.count > 0) {
            bgColor = 'bg-orange-300 text-gray-900';
          } else if (isCurrentDay) {
            bgColor = 'bg-blue-100 text-blue-800 border-2 border-blue-300';
          }
          
          return (
            <div
              key={dayData.date}
              onClick={() => setSelectedDay(dayData)}
              className={`
                p-2 text-center text-sm rounded-lg transition-all duration-200 cursor-pointer
                ${bgColor}
                ${!isCurrentMonth ? 'opacity-40' : ''}
                ${isCurrentDay ? 'ring-2 ring-blue-400' : ''}
                ${isSelected ? 'shadow-lg scale-[1.02]' : ''}
              `}
            >
              <div className="flex flex-col items-center">
                <span className={`font-semibold ${!isCurrentMonth ? 'text-gray-500' : ''}`}>
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

      {/* Détails du jour sélectionné */}
      {selectedDay && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Détails du {new Intl.DateTimeFormat('fr-FR', { dateStyle: 'full' }).format(parseDate(selectedDay.date))}
              </h3>
              <p className="text-sm text-gray-600">
                {selectedDay.completed
                  ? '✅ Journée complétée (7 moments réalisés)'
                  : selectedDay.count > 0
                    ? `🟠 Journée en cours : ${selectedDay.count}/7 moments réalisés`
                    : '⏳ Aucun moment enregistré pour cette journée'}
              </p>
            </div>
          </div>

          {selectedDay.moments.length > 0 ? (
            <ul className="space-y-2">
              {selectedDay.moments.map((moment, index) => (
                <li
                  key={`${selectedDay.date}-${index}`}
                  className="flex items-center justify-between rounded-md bg-white px-3 py-2 shadow-sm border border-gray-200"
                >
                  <span className="text-sm font-medium text-gray-900">{moment.label}</span>
                  <span className="text-sm text-gray-600">
                    {new Intl.DateTimeFormat('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    }).format(new Date(moment.timestamp))}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-md bg-white px-3 py-4 text-sm text-gray-600 border border-dashed border-gray-300">
              Aucun moment enregistré pour l'instant. Utilisez l'application de prière pour créer vos moments.
            </div>
          )}
        </div>
      )}

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
