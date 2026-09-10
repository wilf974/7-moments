'use client';

import { useState, lazy, Suspense, useCallback, useEffect } from 'react';
import Link from 'next/link';
import PrayerButton from '@/components/PrayerButton';
import Timer from '@/components/Timer';
import PlatformDetector from '@/components/PlatformDetector';
import CandleRow from '@/components/CandleRow';
import ReminderSettings from '@/components/ReminderSettings';
import { Platform } from '@/types';
import { usePrayerState } from '@/lib/usePrayerState';
import { getRandomVerse, BibleVerse } from '@/lib/verses';
import { scheduleReminders, hasAnyReminderEnabled } from '@/lib/notifications';
import { getTimerDuration } from '@/lib/settings';

const VerseDisplay = lazy(() => import('@/components/VerseDisplay'));

export default function Home() {
  const [showTimer, setShowTimer] = useState(false);
  const [currentPlatform, setCurrentPlatform] = useState<Platform>('unknown');
  const [showVerse, setShowVerse] = useState(false);
  const [currentVerse, setCurrentVerse] = useState<BibleVerse | null>(null);
  const [showReminders, setShowReminders] = useState(false);
  const [timerDuration, setTimerDuration] = useState(30);

  const { todayCount, isCompleted, refresh } = usePrayerState();

  // Schedule reminders on mount if any are enabled
  useEffect(() => {
    if (hasAnyReminderEnabled()) {
      scheduleReminders();
    }
  }, []);

  const handlePrayerStarted = () => {
    setTimerDuration(getTimerDuration());
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
    <div className="min-h-screen bg-[#FFFBEB]">
      {/* Détecteur de plateforme */}
      <PlatformDetector
        onPlatformDetected={handlePlatformDetected}
        showBadge={true}
        onVerseRequest={handleVerseRequest}
      />

      {/* Gear Icon Button - Reminder Settings */}
      <button
        onClick={() => setShowReminders(true)}
        className="fixed top-4 left-4 z-40 bg-[#FFFBEB] border border-[#FDE68A] rounded-full p-2 shadow-sm hover:shadow-md transition-all text-[#D97706] hover:text-[#92400E]"
        title="Réglages"
        aria-label="Réglages"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {/* Header */}
      <header className="text-center py-8 px-4 bg-gradient-to-b from-amber-900/20 via-amber-50 to-[#FFFBEB]">
        <h1 className="text-4xl md:text-5xl font-[family-name:var(--font-playfair)] font-bold mb-2 animate-fade-in-up bg-gradient-to-r from-amber-600 to-amber-800 bg-clip-text text-transparent">
          7 Rendez-vous
        </h1>
        <p className="text-lg font-[family-name:var(--font-playfair)] italic text-[#92400E] max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.3s' }}>
          &ldquo;Sept fois le jour je te loue à cause de tes justes ordonnances.&rdquo; - Psaume 119:164
        </p>
      </header>

      {/* Contenu principal */}
      <main className="container mx-auto px-4 py-8">
        {!showTimer ? (
          /* Vue principale avec bouton de prière */
          <div className="max-w-2xl mx-auto animate-slide-in-up" style={{ animationDelay: '0.6s' }}>
            {/* CandleRow - 7 bougies avec todayCount allumées */}
            <div className="mb-8">
              <CandleRow count={todayCount} />
            </div>

            {/* Bouton de prière */}
            <PrayerButton
              onPrayerStarted={handlePrayerStarted}
              onLimitReached={handleLimitReached}
              className="mb-8"
            />

            {/* Statistiques rapides */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-lg p-6 shadow-sm text-center animate-count-up" style={{ animationDelay: '0.9s' }}>
                <div className="text-2xl font-bold text-[#D97706] mb-1">
                  {todayCount}
                </div>
                <div className="text-sm text-[#78350F]">
                  Moments aujourd&apos;hui
                </div>
              </div>

              <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-lg p-6 shadow-sm text-center animate-count-up" style={{ animationDelay: '1.0s' }}>
                <div className="text-2xl font-bold text-[#D97706] mb-1 animate-bounce-in">
                  {isCompleted ? '✅' : '⏳'}
                </div>
                <div className="text-sm text-[#78350F]">
                  Statut du jour
                </div>
              </div>

              <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-lg p-6 shadow-sm text-center animate-count-up" style={{ animationDelay: '1.1s' }}>
                <div className="text-2xl font-bold text-[#D97706] mb-1 animate-bounce-in">
                  {currentPlatform === 'telegram' ? '📱' :
                   currentPlatform === 'ios' ? '🍎' :
                   currentPlatform === 'android' ? '🤖' : '🌐'}
                </div>
                <div className="text-sm text-[#78350F]">
                  Plateforme
                </div>
              </div>
            </div>

            {/* Navigation vers le calendrier */}
            <div className="text-center animate-fade-in" style={{ animationDelay: '1.2s' }}>
              <Link
                href="/calendar"
                className="inline-flex items-center px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 font-medium hover:scale-105"
              >
                📅 Voir le calendrier
              </Link>
            </div>
          </div>
        ) : (
          /* Vue timer - Full screen dark overlay */
          <div className="fixed inset-0 bg-[#1C1208] flex items-center justify-center z-50 animate-page-transition">
            <div className="max-w-md w-full mx-4">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-[family-name:var(--font-playfair)] font-bold text-amber-100 mb-2 animate-fade-in-up">
                  Moment de Prière
                </h2>
                <p className="text-amber-200/80 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                  Prenez un moment pour vous recueillir
                </p>
              </div>

              <Timer
                duration={timerDuration}
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
      <footer className="text-center py-8 px-4 text-[#92400E] text-sm">
        <p className="font-[family-name:var(--font-playfair)] italic">
          Application 7 Rendez-vous de Prière •
          Vos moments sont enregistrés sur cet appareil, et partagés entre vos appareils si vous les reliez
        </p>
        <p className="mt-2 font-[family-name:var(--font-playfair)] italic">
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

      {/* Reminder Settings Modal */}
      <ReminderSettings isOpen={showReminders} onClose={() => setShowReminders(false)} />
    </div>
  );
}
