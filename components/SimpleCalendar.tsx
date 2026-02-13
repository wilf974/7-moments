'use client';

/**
 * Calendrier avec navigation mensuelle - Thème "Chapelle Dorée" Amber/Gold
 */

import { useState, useEffect, useMemo } from 'react';
import { parseDate, formatDate, getMonthName } from '@/lib/utils';
import { getMonthData } from '@/lib/storage';

interface DayData {
  date: string;
  moments: {
    timestamp: number;
    platform: string;
    duration: number;
  }[];
  completed: boolean;
  count: number;
}

interface MonthData {
  year: number;
  month: number;
  days: DayData[];
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
 * Composant Calendar avec navigation mensuelle et thème ambre
 */
export default function SimpleCalendar() {
  const today = useMemo(() => new Date(), []);
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [monthData, setMonthData] = useState<MonthData | null>(null);
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);

  // Charger les données du mois actuel
  useEffect(() => {
    const realMonthData = getMonthData(currentYear, currentMonth);
    setMonthData(realMonthData);

    // Sélectionner automatiquement le jour d'aujourd'hui par défaut si on est sur le mois actuel
    if (currentMonth === today.getMonth() && currentYear === today.getFullYear()) {
      const todayFormatted = formatDate(today);
      const todayData = realMonthData.days.find(day => day.date === todayFormatted);
      setSelectedDay(todayData || realMonthData.days[0] || null);
    } else {
      setSelectedDay(realMonthData.days[0] || null);
    }
  }, [currentMonth, currentYear, today]);

  // Navigation vers le mois précédent
  const handlePreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  // Navigation vers le mois suivant (désactivée si on est au mois actuel)
  const handleNextMonth = () => {
    const isCurrentMonth = currentMonth === today.getMonth() && currentYear === today.getFullYear();
    if (isCurrentMonth) return;

    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  if (!monthData) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-[#92400E]">Chargement du calendrier...</div>
      </div>
    );
  }

  const isCurrentMonth = currentMonth === today.getMonth() && currentYear === today.getFullYear();
  const canGoNext = !isCurrentMonth;

  return (
    <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-lg shadow-lg p-6">
      {/* Header du calendrier avec navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handlePreviousMonth}
          className="p-2 rounded-lg bg-[#D97706] hover:bg-[#F59E0B] text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Mois précédent"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <h2 className="text-2xl font-[family-name:var(--font-playfair)] font-bold text-[#D97706]">
          {getMonthName(currentMonth)} {currentYear}
        </h2>

        <button
          onClick={handleNextMonth}
          disabled={!canGoNext}
          className="p-2 rounded-lg bg-[#D97706] hover:bg-[#F59E0B] text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Mois suivant"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Légende */}
      <div className="flex flex-wrap gap-4 mb-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#FBBF24] rounded"></div>
          <span className="text-[#78350F]">7/7 moments</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#FDE68A] rounded"></div>
          <span className="text-[#78350F]">1-6 moments</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#FFFBEB] border border-[#FDE68A] rounded"></div>
          <span className="text-[#78350F]">Aucun moment</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-white ring-2 ring-amber-500 rounded"></div>
          <span className="text-[#78350F]">Aujourd&apos;hui</span>
        </div>
      </div>

      {/* Grille du calendrier */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {/* En-têtes des jours */}
        {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map((day) => (
          <div key={day} className="p-2 text-center text-sm font-medium text-[#78350F]">
            {day}
          </div>
        ))}

        {/* Jours du mois */}
        {monthData.days.map((dayData, index) => {
          const date = parseDate(dayData.date);
          const dayNumber = date.getDate();
          const isCurrentDay = isToday(date);
          const isMonthView = date.getMonth() === currentMonth;
          const isSelected = selectedDay?.date === dayData.date;

          // Déterminer la couleur selon le thème ambre
          let bgColor = 'bg-[#FFFBEB] text-gray-400';
          let textColor = 'text-gray-400';

          if (dayData.completed) {
            bgColor = 'bg-[#FBBF24] text-[#78350F]';
            textColor = 'text-[#78350F]';
          } else if (dayData.count > 0) {
            bgColor = 'bg-[#FDE68A] text-[#92400E]';
            textColor = 'text-[#92400E]';
          } else if (isMonthView) {
            textColor = 'text-[#92400E]';
          }

          return (
            <div
              key={`${dayData.date}-${index}`}
              onClick={() => setSelectedDay(dayData)}
              className={`
                p-2 text-center text-sm rounded-lg transition-all duration-200 cursor-pointer
                ${bgColor}
                ${!isMonthView ? 'opacity-40' : ''}
                ${isCurrentDay ? 'ring-2 ring-amber-500' : ''}
                ${isSelected ? 'shadow-lg scale-[1.02]' : ''}
                hover:shadow-md
              `}
            >
              <div className="flex flex-col items-center">
                <span className={`font-semibold ${textColor}`}>
                  {dayNumber}
                </span>
                {dayData.count > 0 && !dayData.completed && (
                  <span className="text-xs mt-1 text-[#92400E]">{dayData.count}/7</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Détails du jour sélectionné */}
      {selectedDay && (
        <div className="mt-6 p-4 bg-[#FFFBEB] rounded-lg border border-[#FDE68A]">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-lg font-[family-name:var(--font-playfair)] font-semibold text-[#78350F]">
                {new Intl.DateTimeFormat('fr-FR', { dateStyle: 'full' }).format(parseDate(selectedDay.date))}
              </h3>
              <p className="text-sm text-[#92400E]">
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
                  className="flex items-center justify-between rounded-md bg-white px-3 py-2 shadow-sm border border-[#FDE68A]"
                >
                  <span className="text-sm font-medium text-[#78350F]">
                    Moment de prière ({moment.platform})
                  </span>
                  <span className="text-sm text-[#92400E]">
                    {new Intl.DateTimeFormat('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    }).format(new Date(moment.timestamp))}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-md bg-white px-3 py-4 text-sm text-[#92400E] border border-dashed border-[#FDE68A]">
              Aucun moment enregistré pour l&apos;instant. Utilisez l&apos;application de prière pour créer vos moments.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
