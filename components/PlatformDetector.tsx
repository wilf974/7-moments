'use client';

/**
 * Composant de détection de plateforme
 * Détecte Telegram, iOS, Android et autres plateformes
 */

import { useEffect, useState } from 'react';
import { Platform } from '@/types';
import { savePlatformInfo, getPlatformInfo } from '@/lib/storage';

interface PlatformDetectorProps {
  onPlatformDetected?: (platform: Platform) => void;
  showBadge?: boolean;
}

/**
 * Détecte la plateforme actuelle
 */
function detectPlatform(): Platform {
  if (typeof window === 'undefined') {
    return 'unknown';
  }

  // Détection Telegram
  if (window.Telegram?.WebApp) {
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
function getPlatformInfo(platform: Platform): { icon: string; name: string; color: string } {
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
  showBadge = true 
}: PlatformDetectorProps) {
  const [platform, setPlatform] = useState<Platform>('unknown');
  const [isDetected, setIsDetected] = useState(false);

  useEffect(() => {
    // Vérifier d'abord si on a déjà détecté la plateforme
    const savedPlatformInfo = getPlatformInfo();
    
    if (savedPlatformInfo) {
      setPlatform(savedPlatformInfo.platform);
      setIsDetected(true);
      onPlatformDetected?.(savedPlatformInfo.platform);
      return;
    }

    // Détecter la plateforme
    const detectedPlatform = detectPlatform();
    setPlatform(detectedPlatform);
    setIsDetected(true);
    
    // Sauvegarder la détection
    savePlatformInfo(detectedPlatform);
    
    // Notifier le parent
    onPlatformDetected?.(detectedPlatform);
    
    // Log pour debug
    console.log(`Plateforme détectée: ${detectedPlatform}`);
  }, [onPlatformDetected]);

  if (!showBadge || !isDetected) {
    return null;
  }

  const platformInfo = getPlatformInfo(platform);

  return (
    <div className="fixed top-4 right-4 z-50">
      <div 
        className={`${platformInfo.color} text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg flex items-center gap-1`}
        title={`Plateforme détectée: ${platformInfo.name}`}
      >
        <span>{platformInfo.icon}</span>
        <span>{platformInfo.name}</span>
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

