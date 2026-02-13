'use client';

import { useState } from 'react';
import { savePrayerMoment } from '@/lib/storage';
import { usePrayerState } from '@/lib/usePrayerState';
import { getPlatformInfo } from '@/lib/storage';

interface PrayerButtonProps {
  onPrayerStarted?: () => void;
  onLimitReached?: () => void;
  className?: string;
}

export default function PrayerButton({
  onPrayerStarted,
  onLimitReached,
  className = '',
}: PrayerButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { todayCount, isCompleted, refresh } = usePrayerState();

  const handlePrayerStart = () => {
    if (isCompleted) {
      onLimitReached?.();
      return;
    }

    setIsLoading(true);

    try {
      const platformInfo = getPlatformInfo();
      const platform = platformInfo?.platform || 'web';
      savePrayerMoment(platform);
      refresh();

      onPrayerStarted?.();

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error('Erreur lors du déclenchement du moment de prière:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonText = () => {
    if (isLoading) return 'Enregistrement...';
    if (isCompleted) return '7 bougies allumées ✨';
    if (todayCount === 0) return 'Allumer une bougie';
    return `Bougie ${todayCount + 1}/7`;
  };

  const getButtonColor = () => {
    if (isCompleted) return 'bg-amber-400';
    return 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800';
  };

  const getButtonIcon = () => {
    return '🕯️';
  };

  const getMotivationMessage = () => {
    if (isCompleted) return 'Vos 7 bougies illuminent cette journée !';
    if (todayCount >= 5) return 'La chapelle s\'illumine... encore quelques bougies.';
    if (todayCount >= 3) return 'La lumière grandit. Continuez.';
    if (todayCount >= 1) return 'Chaque bougie compte.';
    return 'Allumez votre première bougie du jour.';
  };

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      {/* Compteur quotidien */}
      <div className="text-center">
        <div className="text-4xl font-bold text-[#78350F] mb-2 animate-count-up">
          {todayCount}/7
        </div>
        <div className="text-sm text-[#92400E] animate-fade-in">
          Moments de prière aujourd&apos;hui
        </div>
      </div>

      {/* Barre de progression */}
      <div className="w-full max-w-xs">
        <div className="bg-amber-100 rounded-full h-3">
          <div
            className="h-3 rounded-full transition-all duration-1000 ease-out bg-gradient-to-r from-amber-500 to-amber-400"
            style={{ width: `${(todayCount / 7) * 100}%` }}
          />
        </div>
      </div>

      {/* Message de motivation */}
      <div className="text-center text-sm text-[#92400E] max-w-md px-4 animate-fade-in">
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
        <div className="text-center text-[#FBBF24] font-medium animate-fade-in">
          Moment enregistré avec succès !
        </div>
      )}

      {/* Message de limite atteinte */}
      {isCompleted && (
        <div className="text-center text-[#FBBF24] font-medium">
          🎉 Jour accompli ! Revenez demain pour continuer.
        </div>
      )}
    </div>
  );
}
