'use client';

/**
 * Composant Timer pour le moment de prière
 * Compte à rebours d'1 minute avec animations
 */

import { useState, useEffect, useCallback } from 'react';
import { TimerState } from '@/types';
import { formatDuration } from '@/lib/utils';

interface TimerProps {
  duration?: number; // Durée en secondes, par défaut 60
  onComplete?: () => void;
  onStart?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  autoStart?: boolean;
  className?: string;
}

/**
 * Composant Timer
 */
export default function Timer({
  duration = 60,
  onComplete,
  onStart,
  onPause,
  onResume,
  autoStart = false,
  className = '',
}: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [state, setState] = useState<TimerState>('idle');
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  /**
   * Démarre le timer
   */
  const startTimer = useCallback(() => {
    if (state === 'running') return;
    
    setState('running');
    onStart?.();
    
    const id = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setState('completed');
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    setIntervalId(id);
  }, [state, onStart, onComplete]);

  /**
   * Met en pause le timer
   */
  const pauseTimer = useCallback(() => {
    if (state !== 'running') return;
    
    setState('paused');
    onPause?.();
    
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  }, [state, intervalId, onPause]);

  /**
   * Reprend le timer
   */
  const resumeTimer = useCallback(() => {
    if (state !== 'paused') return;
    
    setState('running');
    onResume?.();
    
    const id = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setState('completed');
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    setIntervalId(id);
  }, [state, onResume, onComplete]);

  /**
   * Remet à zéro le timer
   */
  const resetTimer = useCallback(() => {
    setTimeLeft(duration);
    setState('idle');
    
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  }, [duration, intervalId]);

  /**
   * Auto-start si demandé
   */
  useEffect(() => {
    if (autoStart && state === 'idle') {
      startTimer();
    }
  }, [autoStart, state, startTimer]);

  /**
   * Nettoyage à la destruction du composant
   */
  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  /**
   * Calcule le pourcentage de progression
   */
  const progress = ((duration - timeLeft) / duration) * 100;

  /**
   * Obtient la couleur selon l'état
   */
  const getStateColor = () => {
    switch (state) {
      case 'running':
        return 'text-blue-600';
      case 'paused':
        return 'text-yellow-600';
      case 'completed':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  /**
   * Obtient l'icône selon l'état
   */
  const getStateIcon = () => {
    switch (state) {
      case 'running':
        return '⏱️';
      case 'paused':
        return '⏸️';
      case 'completed':
        return '✅';
      default:
        return '⏰';
    }
  };

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      {/* Affichage du temps */}
      <div className="relative">
        {/* Cercle de progression */}
        <div className="w-32 h-32 relative">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
            {/* Cercle de fond */}
            <path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-gray-200"
            />
            {/* Cercle de progression */}
            <path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray={`${progress}, 100`}
              className={`transition-all duration-1000 ${
                state === 'completed' ? 'text-green-500' : 
                state === 'running' ? 'text-blue-500' : 
                'text-yellow-500'
              }`}
            />
          </svg>
          
          {/* Temps au centre */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className={`text-2xl font-mono font-bold ${getStateColor()}`}>
                {formatDuration(timeLeft)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {getStateIcon()} {state === 'running' ? 'En cours' : 
                 state === 'paused' ? 'En pause' : 
                 state === 'completed' ? 'Terminé' : 'Prêt'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contrôles */}
      <div className="flex space-x-2">
        {state === 'idle' && (
          <button
            onClick={startTimer}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            Démarrer
          </button>
        )}
        
        {state === 'running' && (
          <button
            onClick={pauseTimer}
            className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium"
          >
            Pause
          </button>
        )}
        
        {state === 'paused' && (
          <>
            <button
              onClick={resumeTimer}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
            >
              Reprendre
            </button>
            <button
              onClick={resetTimer}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
            >
              Reset
            </button>
          </>
        )}
        
        {state === 'completed' && (
          <button
            onClick={resetTimer}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            Recommencer
          </button>
        )}
      </div>

      {/* Message de motivation */}
      {state === 'running' && (
        <div className="text-center text-sm text-gray-600 max-w-xs">
          <p>Prenez un moment pour vous recueillir...</p>
        </div>
      )}
      
      {state === 'completed' && (
        <div className="text-center text-sm text-green-600 max-w-xs">
          <p>✨ Moment de prière terminé !</p>
        </div>
      )}
    </div>
  );
}
