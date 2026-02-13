'use client';

import { useState, lazy, Suspense, useCallback } from 'react';
import Link from 'next/link';
import PrayerButton from '@/components/PrayerButton';
import Timer from '@/components/Timer';
import PlatformDetector from '@/components/PlatformDetector';
import { Platform } from '@/types';
import { usePrayerState } from '@/lib/usePrayerState';
import { getRandomVerse, BibleVerse } from '@/lib/verses';

const VerseDisplay = lazy(() => import('@/components/VerseDisplay'));

export default function Home() {
  const [showTimer, setShowTimer] = useState(false);
  const [currentPlatform, setCurrentPlatform] = useState<Platform>('unknown');
  const [showVerse, setShowVerse] = useState(false);
  const [currentVerse, setCurrentVerse] = useState<BibleVerse | null>(null);

  const { todayCount, isCompleted, refresh } = usePrayerState();

  const handlePrayerStarted = () => {
    setShowTimer(true);
    refresh();
  };

  const handleTimerCompleted = () => {
    setShowTimer(false);
    refresh();
  };

  const handleLimitReached = () => {
    alert('Vous avez déjà accompli vos 7 moments de prière aujourd\'hui !');
  };

  const handlePlatformDetected = useCallback((platform: Platform) => {
    setCurrentPlatform(platform);
  }, []);

  const handleNextMoment = () => {
    setShowTimer(false);
    setTimeout(refresh, 150);
  };

  const handleVerseRequest = () => {
    const verse = getRandomVerse();
    setCurrentVerse(verse);
    setShowVerse(true);
  };

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
        <Suspense fallback={null}>
          <VerseDisplay
            verse={currentVerse}
            onClose={handleVerseClose}
            duration={30000}
          />
        </Suspense>
      )}
    </div>
  );
}
