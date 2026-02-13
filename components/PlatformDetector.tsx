'use client';

/**
 * Composant de détection de plateforme
 * Détecte Telegram, iOS, Android et autres plateformes
 */

import { useEffect, useState, useRef } from 'react';
import { Platform } from '@/types';
import { savePlatformInfo, getPlatformInfo } from '@/lib/storage';

interface PlatformDetectorProps {
  onPlatformDetected?: (platform: Platform) => void;
  showBadge?: boolean;
  onVerseRequest?: () => void; // Nouveau callback pour demander un verset
}

/**
 * Détecte la plateforme actuelle
 */
function detectPlatform(): Platform {
  if (typeof window === 'undefined') {
    return 'unknown';
  }

  // Détection Telegram
  if ((window as unknown as { Telegram?: { WebApp?: unknown } }).Telegram?.WebApp) {
    return 'telegram';
  }

  // Détection via User Agent
  const userAgent = window.navigator.userAgent.toLowerCase();
  
  // iOS
  if (/iphone|ipad|ipod/.test(userAgent)) {
    return 'ios';
  }
  
  // Android
  if (/android/.test(userAgent)) {
    return 'android';
  }
  
  // Web (navigateur standard)
  return 'web';
}

/**
 * Obtient l'icône et le nom de la plateforme
 */
function getPlatformDisplayInfo(platform: Platform): { icon: string; name: string; color: string } {
  switch (platform) {
    case 'telegram':
      return {
        icon: '📱',
        name: 'Telegram',
        color: 'bg-blue-500',
      };
    case 'ios':
      return {
        icon: '🍎',
        name: 'iOS',
        color: 'bg-gray-800',
      };
    case 'android':
      return {
        icon: '🤖',
        name: 'Android',
        color: 'bg-green-500',
      };
    case 'web':
      return {
        icon: '🌐',
        name: 'Web',
        color: 'bg-indigo-500',
      };
    default:
      return {
        icon: '❓',
        name: 'Inconnu',
        color: 'bg-gray-500',
      };
  }
}

/**
 * Composant PlatformDetector
 */
export default function PlatformDetector({ 
  onPlatformDetected, 
  showBadge = true,
  onVerseRequest
}: PlatformDetectorProps) {
  const [platform, setPlatform] = useState<Platform>('unknown');
  const [isDetected, setIsDetected] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);

  const onPlatformDetectedRef = useRef(onPlatformDetected);
  onPlatformDetectedRef.current = onPlatformDetected;

  useEffect(() => {
    const savedPlatformInfo = getPlatformInfo();

    if (savedPlatformInfo) {
      setPlatform(savedPlatformInfo.platform);
      setIsDetected(true);
      onPlatformDetectedRef.current?.(savedPlatformInfo.platform);
      return;
    }

    const detectedPlatform = detectPlatform();
    setPlatform(detectedPlatform);
    setIsDetected(true);
    savePlatformInfo(detectedPlatform);
    onPlatformDetectedRef.current?.(detectedPlatform);
  }, []);

  /**
   * Gestionnaire de clic pour détecter le spam clic
   */
  const handleClick = () => {
    const now = Date.now();
    const timeDiff = now - lastClickTime;
    
    // Si c'est un clic rapide (moins de 500ms depuis le dernier clic)
    if (timeDiff < 500) {
      setClickCount(prev => prev + 1);
      
      // Si on a 5 clics rapides, déclencher l'affichage du verset
      if (clickCount >= 4) { // 4 car on vient d'incrémenter
        onVerseRequest?.();
        setClickCount(0); // Reset le compteur
      }
    } else {
      // Reset le compteur si trop de temps entre les clics
      setClickCount(1);
    }
    
    setLastClickTime(now);
  };

  if (!showBadge || !isDetected) {
    return null;
  }

  const platformInfo = getPlatformDisplayInfo(platform);

  return (
    <div className="fixed top-4 right-4 z-50">
      <div 
        className={`${platformInfo.color} text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg flex items-center gap-1 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-xl`}
        title={`Plateforme détectée: ${platformInfo.name}${onVerseRequest ? ' • Cliquez rapidement 5 fois pour un verset' : ''}`}
        onClick={handleClick}
      >
        <span>{platformInfo.icon}</span>
        <span>{platformInfo.name}</span>
        {clickCount > 0 && (
          <span className="ml-1 text-xs animate-bounce">
            {clickCount}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * Hook pour utiliser la détection de plateforme
 */
export function usePlatformDetection() {
  const [platform, setPlatform] = useState<Platform>('unknown');
  const [isDetected, setIsDetected] = useState(false);

  useEffect(() => {
    const detectedPlatform = detectPlatform();
    setPlatform(detectedPlatform);
    setIsDetected(true);
    
    // Sauvegarder si pas déjà fait
    const savedInfo = getPlatformInfo();
    if (!savedInfo) {
      savePlatformInfo(detectedPlatform);
    }
  }, []);

  return { platform, isDetected };
}
