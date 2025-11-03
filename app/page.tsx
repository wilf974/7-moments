'use client';

/**
 * Page principale de l'application 7 Rendez-vous de Prière
 * Assemble tous les composants principaux
 */

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import PrayerButton from '@/components/PrayerButton';
import Timer from '@/components/Timer';
import PlatformDetector from '@/components/PlatformDetector';
import SyncNotification from '@/components/SyncNotification';
import StorageDebug from '@/components/StorageDebug';
import VerseDisplay from '@/components/VerseDisplay';
import { Platform } from '@/types';
import { getTodayCount, isTodayCompleted, syncStorageData } from '@/lib/storage';
import { getRandomVerse, BibleVerse } from '@/lib/verses';

export default function Home() {
  const [showTimer, setShowTimer] = useState(false);
  const [todayCount, setTodayCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentPlatform, setCurrentPlatform] = useState<Platform>('unknown');
  const [showVerse, setShowVerse] = useState(false);
  const [currentVerse, setCurrentVerse] = useState<BibleVerse | null>(null);

  /**
   * Met à jour le compteur quotidien (version stable avec useCallback)
   */
  const updateTodayCount = useCallback(() => {
    const count = getTodayCount();
    const completed = isTodayCompleted();
    setTodayCount(count);
    setIsCompleted(completed);
  }, []);

  /**
   * Effet pour mettre à jour le compteur au montage
   */
  useEffect(() => {
    // Synchroniser les données entre cookies et localStorage au démarrage
    syncStorageData();
    updateTodayCount();
  }, [updateTodayCount]);

  /**
   * Effet pour mettre à jour le compteur quand le timer se ferme
   */
  useEffect(() => {
    if (!showTimer) {
      // Délai court pour laisser le stockage se mettre à jour
      setTimeout(() => {
        updateTodayCount();
      }, 150);
    }
  }, [showTimer, updateTodayCount]);

  /**
   * Effet pour détecter le changement de jour
   * Vérifie toutes les heures si le jour a changé
   */
  useEffect(() => {
    const interval = setInterval(() => {
      updateTodayCount();
      console.log('🔄 Vérification du jour - mise à jour du compteur');
    }, 60 * 60 * 1000); // 1 heure

    return () => clearInterval(interval);
  }, [updateTodayCount]);

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
    alert('Vous avez déjà accompli vos 7 moments de prière aujourd\'hui !');
  };

  /**
   * Gestionnaire de détection de plateforme
   */
  const handlePlatformDetected = (platform: Platform) => {
    setCurrentPlatform(platform);
  };

  /**
   * Gestionnaire pour passer au moment suivant
   * Arrête le timer et remet à jour le compteur
   */
  const handleNextMoment = () => {
    console.log('🔵 handleNextMoment appelé');
    
    // Arrêter immédiatement le timer
    setShowTimer(false);
    console.log('⏹️ Timer fermé');
    
    // Mettre à jour le compteur après un court délai pour que le timer soit bien fermé
    setTimeout(() => {
      console.log('📊 Mise à jour du compteur après fermeture du timer');
      updateTodayCount();
      
      // Vérifier les données stockées
      const count = getTodayCount();
      const completed = isTodayCompleted();
      console.log(`✅ Compteur après mise à jour: ${count}/7, Complété: ${completed}`);
    }, 150);
  };

  /**
   * Gestionnaire pour afficher un verset
   */
  const handleVerseRequest = () => {
    const verse = getRandomVerse();
    setCurrentVerse(verse);
    setShowVerse(true);
  };

  /**
   * Gestionnaire pour fermer l'affichage du verset
   */
  const handleVerseClose = () => {
    setShowVerse(false);
    setCurrentVerse(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Détecteur de plateforme */}
      <PlatformDetector 
        onPlatformDetected={handlePlatformDetected}
        showBadge={true}
        onVerseRequest={handleVerseRequest}
      />

      {/* Notification de synchronisation */}
      <SyncNotification />

      {/* Debug Storage (dev seulement) */}
      <StorageDebug />

      {/* Header */}
      <header className="text-center py-8 px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2 animate-fade-in-up">
          7 RDV/jour <span className="text-purple-600 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">avec Dieu</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.3s' }}>
          &ldquo;Sept fois le jour je te loue à cause de tes justes ordonnances.&rdquo; - Psaume 119, verset 164
        </p>
      </header>

      {/* Contenu principal */}
      <main className="container mx-auto px-4 py-8">
        {!showTimer ? (
          /* Vue principale avec bouton de prière */
          <div className="max-w-2xl mx-auto animate-slide-in-up" style={{ animationDelay: '0.6s' }}>
            <PrayerButton
              onPrayerStarted={handlePrayerStarted}
              onLimitReached={handleLimitReached}
              className="mb-8"
            />

            {/* Statistiques rapides */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-lg p-6 shadow-sm text-center animate-count-up" style={{ animationDelay: '0.9s' }}>
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {todayCount}
                </div>
                <div className="text-sm text-gray-600">
                  Moments aujourd&apos;hui
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm text-center animate-count-up" style={{ animationDelay: '1.0s' }}>
                <div className="text-2xl font-bold text-blue-600 mb-1 animate-bounce-in">
                  {isCompleted ? '✅' : '⏳'}
                </div>
                <div className="text-sm text-gray-600">
                  Statut du jour
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm text-center animate-count-up" style={{ animationDelay: '1.1s' }}>
                <div className="text-2xl font-bold text-indigo-600 mb-1 animate-bounce-in">
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
            <div className="text-center animate-fade-in" style={{ animationDelay: '1.2s' }}>
              <Link
                href="/calendar"
                className="inline-flex items-center px-6 py-3 bg-white text-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 font-medium hover:scale-105"
              >
                📅 Voir le calendrier
              </Link>
            </div>
          </div>
        ) : (
          /* Vue timer */
          <div className="max-w-md mx-auto animate-page-transition">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2 animate-fade-in-up">
                  Moment de Prière
                </h2>
                <p className="text-gray-600 animate-fade-in" style={{ animationDelay: '0.2s' }}>
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

      {/* Affichage du verset */}
      {showVerse && currentVerse && (
        <VerseDisplay
          verse={currentVerse}
          onClose={handleVerseClose}
          duration={30000}
        />
      )}
    </div>
  );
}
