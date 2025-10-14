'use client';

/**
 * Composant Calendar pour afficher le calendrier mensuel
 * Montre les jours avec indicateurs visuels selon le statut
 */

import { useState, useEffect, useCallback } from 'react';
import { MonthData, DayData } from '@/types';
import { getMonthData } from '@/lib/storage';
import { getMonthName, formatDate, isToday } from '@/lib/utils';

interface CalendarProps {
  className?: string;
}

/**
 * Composant Calendar
 */
export default function Calendar({ className = '' }: CalendarProps) {
  // Initialiser avec octobre 2025 pour le test
  const [currentDate, setCurrentDate] = useState(new Date(2025, 9, 14)); // 14 octobre 2025
  const [monthData, setMonthData] = useState<MonthData | null>(null);
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);

  /**
   * Charge les données du mois
   */
  const loadMonthData = useCallback(() => {
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      console.log('Chargement des données pour:', year, month);
      const data = getMonthData(year, month);
      console.log('Données chargées:', data);
      setMonthData(data);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      // Créer des données de test en cas d'erreur
      const testData: MonthData = {
        year: 2025,
        month: 9,
        days: []
      };
      setMonthData(testData);
    }
  }, [currentDate]);

  /**
   * Effet pour charger les données au changement de mois
   */
  useEffect(() => {
    loadMonthData();
  }, [currentDate, loadMonthData]);

  /**
   * Navigation vers le mois précédent
   */
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  /**
   * Navigation vers le mois suivant
   */
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  /**
   * Obtient la couleur selon le statut du jour
   */
  const getDayColor = (dayData: DayData) => {
    if (dayData.completed) return 'bg-green-500 text-white';
    if (dayData.count > 0) return 'bg-yellow-400 text-gray-800';
    if (isToday(new Date(dayData.date))) return 'bg-blue-100 text-blue-800 border-2 border-blue-300';
    return 'bg-gray-100 text-gray-600';
  };

  /**
   * Obtient l'icône selon le statut du jour
   */
  const getDayIcon = (dayData: DayData) => {
    if (dayData.completed) return '✅';
    if (dayData.count > 0) return '⏳';
    return '';
  };

  /**
   * Gestionnaire de clic sur un jour
   */
  const handleDayClick = (dayData: DayData) => {
    setSelectedDay(dayData);
  };

  /**
   * Ferme la modal de détails
   */
  const closeModal = () => {
    setSelectedDay(null);
  };

  if (!monthData) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Chargement du calendrier...</div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      {/* Header du calendrier */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          ←
        </button>
        
        <h2 className="text-xl font-bold text-gray-800">
          {getMonthName(currentDate.getMonth())} {currentDate.getFullYear()}
        </h2>
        
        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          →
        </button>
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
        {monthData.days.map((dayData) => {
          const date = new Date(dayData.date);
          const dayNumber = date.getDate();
          const isCurrentDay = isToday(date);
          const isCurrentMonth = date.getMonth() === currentDate.getMonth();
          
          return (
            <button
              key={dayData.date}
              onClick={() => handleDayClick(dayData)}
              className={`
                p-2 text-center text-sm rounded-lg transition-all duration-200
                hover:scale-105 hover:shadow-md
                ${getDayColor(dayData)}
                ${isCurrentDay ? 'ring-2 ring-blue-400' : ''}
                ${!isCurrentMonth ? 'opacity-40' : ''}
              `}
            >
              <div className="flex flex-col items-center">
                <span className={`font-medium ${!isCurrentMonth ? 'text-gray-400' : ''}`}>
                  {dayNumber}
                </span>
                {getDayIcon(dayData) && (
                  <span className="text-xs mt-1">{getDayIcon(dayData)}</span>
                )}
                {dayData.count > 0 && !dayData.completed && (
                  <span className="text-xs mt-1">{dayData.count}/7</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Statistiques du mois */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {monthData.days.filter(day => day.completed).length}
          </div>
          <div className="text-sm text-gray-600">Jours complets</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {monthData.days.filter(day => day.count > 0 && !day.completed).length}
          </div>
          <div className="text-sm text-gray-600">Jours partiels</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {monthData.days.reduce((total, day) => total + day.count, 0)}
          </div>
          <div className="text-sm text-gray-600">Total moments</div>
        </div>
      </div>

      {/* Modal de détails du jour */}
      {selectedDay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">
                {formatDate(new Date(selectedDay.date))}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="text-center">
                <div className={`inline-block px-4 py-2 rounded-lg ${getDayColor(selectedDay)}`}>
                  {selectedDay.completed ? 'Jour accompli !' : 
                   selectedDay.count > 0 ? `${selectedDay.count}/7 moments` : 
                   'Aucun moment'}
                </div>
              </div>
              
              {selectedDay.moments.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Moments de prière :</h4>
                  <div className="space-y-2">
                    {selectedDay.moments.map((moment, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm">
                          {new Date(moment.timestamp).toLocaleTimeString()}
                        </span>
                        <span className="text-xs text-gray-500">
                          {moment.platform}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-6 text-center">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
