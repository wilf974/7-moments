'use client';

/**
 * Composant PrayerButton pour déclencher un moment de prière
 * Gère la logique de déclenchement et les limites quotidiennes
 */

import { useState, useEffect } from 'react';
// import { Platform } from '@/types'; // Non utilisé pour l'instant
import { savePrayerMoment, getTodayCount, isTodayCompleted } from '@/lib/storage';
import { usePlatformDetection } from './PlatformDetector';

interface PrayerButtonProps {
  onPrayerStarted?: () => void;
  // onPrayerCompleted?: () => void; // Non utilisé pour l'instant
  onLimitReached?: () => void;
  className?: string;
}

/**
 * Composant PrayerButton
 */
export default function PrayerButton({
  onPrayerStarted,
  // onPrayerCompleted,
  onLimitReached,
  className = '',
}: PrayerButtonProps) {
  const [todayCount, setTodayCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const { platform } = usePlatformDetection();

  /**
   * Met à jour le compteur quotidien
   */
  const updateTodayCount = () => {
    const count = getTodayCount();
    const completed = isTodayCompleted();
    setTodayCount(count);
    setIsCompleted(completed);
  };

  /**
   * Effet pour mettre à jour le compteur au montage
   */
  useEffect(() => {
    updateTodayCount();
  }, []);

  /**
   * Déclenche un moment de prière
   */
  const handlePrayerStart = () => {
    if (isCompleted) {
      onLimitReached?.();
      return;
    }

    setIsLoading(true);
    
    try {
      // Sauvegarder le moment de prière
      savePrayerMoment(platform);
      console.log('✅ Moment de prière sauvegardé avec succès');
      
      // Mettre à jour le compteur
      updateTodayCount();
      
      // Notifier le parent
      onPrayerStarted?.();
      
      // Afficher le succès brièvement
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      
    } catch (error) {
      console.error('Erreur lors du déclenchement du moment de prière:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Obtient le texte du bouton selon l'état
   */
  const getButtonText = () => {
    if (isLoading) return 'Enregistrement...';
    if (isCompleted) return 'Jour terminé !';
    if (todayCount === 0) return 'Commencer le premier moment';
    return `Moment ${todayCount + 1}/7`;
  };

  /**
   * Obtient la couleur du bouton selon l'état
   */
  const getButtonColor = () => {
    if (isCompleted) return 'bg-green-500 hover:bg-green-600';
    if (todayCount >= 5) return 'bg-blue-500 hover:bg-blue-600';
    if (todayCount >= 3) return 'bg-indigo-500 hover:bg-indigo-600';
    return 'bg-purple-500 hover:bg-purple-600';
  };

  /**
   * Obtient l'icône selon l'état
   */
  const getButtonIcon = () => {
    if (isCompleted) return '✅';
    if (todayCount >= 5) return '🙏';
    if (todayCount >= 3) return '✨';
    return '🕊️';
  };

  /**
   * Obtient le message de motivation
   */
  const getMotivationMessage = () => {
    if (isCompleted) return 'Félicitations ! Vous avez accompli vos 7 moments de prière aujourd\'hui.';
    if (todayCount >= 5) return 'Presque terminé ! Plus que quelques moments.';
    if (todayCount >= 3) return 'Excellent ! Vous êtes à mi-chemin.';
    if (todayCount >= 1) return 'Continuez ! Chaque moment compte.';
    return 'Commencez votre journée avec un moment de recueillement.';
  };

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      {/* Compteur quotidien */}
      <div className="text-center">
        <div className="text-4xl font-bold text-gray-800 mb-2 animate-count-up">
          {todayCount}/7
        </div>
        <div className="text-sm text-gray-600 animate-fade-in">
          Moments de prière aujourd&apos;hui
        </div>
      </div>

      {/* Barre de progression */}
      <div className="w-full max-w-xs">
        <div className="bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-1000 ease-out ${
              isCompleted ? 'bg-green-500' : 
              todayCount >= 5 ? 'bg-blue-500' : 
              todayCount >= 3 ? 'bg-indigo-500' : 
              'bg-purple-500'
            }`}
            style={{ width: `${(todayCount / 7) * 100}%` }}
          />
        </div>
      </div>

      {/* Message de motivation */}
      <div className="text-center text-sm text-gray-600 max-w-md px-4 animate-fade-in">
        <p>{getMotivationMessage()}</p>
      </div>

      {/* Bouton principal */}
      <button
        onClick={handlePrayerStart}
        disabled={isLoading || isCompleted}
        className={`
          relative px-8 py-4 rounded-xl text-white font-semibold text-lg
          transition-all duration-300 transform hover:scale-105
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
          shadow-lg hover:shadow-xl
          ${getButtonColor()}
          ${showSuccess ? 'animate-pulse' : ''}
          ${!isCompleted && !isLoading ? 'animate-pulse-glow' : ''}
        `}
      >
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{getButtonIcon()}</span>
          <span>{getButtonText()}</span>
        </div>
        
        {/* Animation de succès */}
        {showSuccess && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-2xl animate-bounce">✨</div>
          </div>
        )}
      </button>

      {/* Message de succès */}
      {showSuccess && (
        <div className="text-center text-green-600 font-medium animate-fade-in">
          Moment enregistré avec succès !
        </div>
      )}

      {/* Message de limite atteinte */}
      {isCompleted && (
        <div className="text-center text-green-600 font-medium">
          🎉 Jour accompli ! Revenez demain pour continuer.
        </div>
      )}

      {/* Informations de plateforme */}
      <div className="text-xs text-gray-400 text-center">
        Plateforme: {platform} • Dernière mise à jour: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
}
