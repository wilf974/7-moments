'use client';

/**
 * Page principale de l'application 7 Rendez-vous de Prière
 * Assemble tous les composants principaux
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PrayerButton from '@/components/PrayerButton';
import Timer from '@/components/Timer';
import PlatformDetector from '@/components/PlatformDetector';
import SyncNotification from '@/components/SyncNotification';
import StorageDebug from '@/components/StorageDebug';
import { Platform } from '@/types';
import { savePrayerMoment } from '@/lib/storage';
import { getTodayCount, isTodayCompleted, syncStorageData } from '@/lib/storage';

export default function Home() {
  const [showTimer, setShowTimer] = useState(false);
  const [todayCount, setTodayCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentPlatform, setCurrentPlatform] = useState<Platform>('unknown');

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
    // Synchroniser les données entre cookies et localStorage au démarrage
    syncStorageData();
    updateTodayCount();
  }, []);

  /**
   * Gestionnaire de démarrage d'un moment de prière
   */
  const handlePrayerStarted = () => {
    setShowTimer(true);
    updateTodayCount();
  };

  /**
   * Gestionnaire de fin de timer
   */
  const handleTimerCompleted = () => {
    setShowTimer(false);
    updateTodayCount();
  };

  /**
   * Gestionnaire de limite atteinte
   */
  const handleLimitReached = () => {
    alert('Vous avez déjà accompli vos 7 moments de prière aujourd&apos;hui !');
  };

  /**
   * Gestionnaire de détection de plateforme
   */
  const handlePlatformDetected = (platform: Platform) => {
    setCurrentPlatform(platform);
  };

  /**
   * Gestionnaire pour passer au moment suivant
   */
  const handleNextMoment = () => {
    // Enregistrer le moment de prière
    savePrayerMoment(currentPlatform);
    
    // Mettre à jour le compteur
    updateTodayCount();
    
    // Retourner à la vue principale
    setShowTimer(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Détecteur de plateforme */}
      <PlatformDetector 
        onPlatformDetected={handlePlatformDetected}
        showBadge={true}
      />

      {/* Notification de synchronisation */}
      <SyncNotification />

      {/* Debug Storage (dev seulement) */}
      <StorageDebug />

      {/* Header */}
      <header className="text-center py-8 px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
          7 Rendez-vous de Prière
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Prenez 7 moments de recueillement dans votre journée pour vous connecter à Dieu
        </p>
      </header>

      {/* Contenu principal */}
      <main className="container mx-auto px-4 py-8">
        {!showTimer ? (
          /* Vue principale avec bouton de prière */
          <div className="max-w-2xl mx-auto">
            <PrayerButton
              onPrayerStarted={handlePrayerStarted}
              onLimitReached={handleLimitReached}
              className="mb-8"
            />

            {/* Statistiques rapides */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-lg p-6 shadow-sm text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {todayCount}
                </div>
                <div className="text-sm text-gray-600">
                  Moments aujourd&apos;hui
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {isCompleted ? '✅' : '⏳'}
                </div>
                <div className="text-sm text-gray-600">
                  Statut du jour
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm text-center">
                <div className="text-2xl font-bold text-indigo-600 mb-1">
                  {currentPlatform === 'telegram' ? '📱' : 
                   currentPlatform === 'ios' ? '🍎' : 
                   currentPlatform === 'android' ? '🤖' : '🌐'}
                </div>
                <div className="text-sm text-gray-600">
                  Plateforme
                </div>
              </div>
            </div>

            {/* Navigation vers le calendrier */}
            <div className="text-center">
              <Link
                href="/calendar"
                className="inline-flex items-center px-6 py-3 bg-white text-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow font-medium"
              >
                📅 Voir le calendrier
              </Link>
            </div>
          </div>
        ) : (
          /* Vue timer */
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Moment de Prière
                </h2>
                <p className="text-gray-600">
                  Prenez un moment pour vous recueillir
                </p>
              </div>
              
              <Timer
                duration={60}
                onComplete={handleTimerCompleted}
                onNext={handleNextMoment}
                autoStart={true}
                className="mb-6"
              />
            </div>
        </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-8 px-4 text-gray-500 text-sm">
        <p>
          Application 7 Rendez-vous de Prière • 
          Données stockées localement sur votre appareil
        </p>
        <p className="mt-2">
          Développé avec ❤️ pour votre cheminement spirituel
        </p>
      </footer>
    </div>
  );
}
