'use client';

/**
 * Page du calendrier - Thème "Chapelle Dorée" Amber/Gold
 * Affiche le calendrier mensuel avec les statistiques et séries
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import SimpleCalendar from '@/components/SimpleCalendar';
import { getUserStats, getCurrentStreak, getBestStreak, getWeekSummary } from '@/lib/storage';

export default function CalendarPage() {
  const [stats, setStats] = useState({
    totalMoments: 0,
    currentStreak: 0,
    bestStreak: 0,
    daysCompleted: 0,
    lastActivity: null as string | null,
    weekSummary: [] as number[],
  });

  useEffect(() => {
    const load = () => {
      const userStats = getUserStats();
      setStats({
        totalMoments: userStats.totalMoments,
        currentStreak: getCurrentStreak(),
        bestStreak: getBestStreak(),
        daysCompleted: userStats.daysCompleted,
        lastActivity: userStats.lastActivity,
        weekSummary: getWeekSummary(),
      });
    };
    load();
    // Recalcul quand la synchronisation apporte les moments des autres appareils
    window.addEventListener('prayer-data-updated', load);
    return () => window.removeEventListener('prayer-data-updated', load);
  }, []);

  // Noms des jours pour les 7 derniers jours
  const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const today = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (6 - i));
    const dayIndex = date.getDay();
    // Convertir dimanche (0) en index 6, et les autres jours en index - 1
    const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1;
    return dayNames[adjustedIndex];
  });

  return (
    <div className="min-h-screen bg-[#FFFBEB]">
      {/* Header */}
      <header className="bg-[#FFFBEB] border-b border-[#FDE68A]">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-[family-name:var(--font-playfair)] font-bold text-[#78350F]">
                Sept rendez-vous chaque jour avec Dieu
              </h1>
              <p className="text-[#92400E]">
                Suivez vos moments de recueillement
              </p>
            </div>

            <Link
              href="/"
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              ← Retour
            </Link>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="container mx-auto px-4 py-8">
        {/* Statistiques globales - 4 cartes */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Total moments */}
          <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-lg p-6 shadow-sm text-center">
            <div className="text-3xl font-bold text-[#D97706] mb-2">
              {stats.totalMoments}
            </div>
            <div className="text-sm text-[#78350F]">
              Total moments
            </div>
          </div>

          {/* Série actuelle avec 🔥 */}
          <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-lg p-6 shadow-sm text-center">
            <div className="text-3xl font-bold text-[#F59E0B] mb-2 flex items-center justify-center gap-2">
              <span>🔥</span>
              <span>{stats.currentStreak}</span>
            </div>
            <div className="text-sm text-[#78350F]">
              Série actuelle
            </div>
          </div>

          {/* Meilleure série avec ⭐ */}
          <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-lg p-6 shadow-sm text-center">
            <div className="text-3xl font-bold text-[#FBBF24] mb-2 flex items-center justify-center gap-2">
              <span>⭐</span>
              <span>{stats.bestStreak}</span>
            </div>
            <div className="text-sm text-[#78350F]">
              Meilleure série
            </div>
          </div>

          {/* Dernière activité */}
          <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-lg p-6 shadow-sm text-center">
            <div className="text-xl font-bold text-[#92400E] mb-2">
              {stats.lastActivity
                ? new Date(stats.lastActivity).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                  })
                : '—'}
            </div>
            <div className="text-sm text-[#78350F]">
              Dernière activité
            </div>
          </div>
        </div>

        {/* Mini bar chart - 7 derniers jours */}
        <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-lg p-6 shadow-sm mb-8">
          <h3 className="text-lg font-[family-name:var(--font-playfair)] font-semibold text-[#78350F] mb-4">
            7 derniers jours
          </h3>
          <div className="flex items-end justify-between gap-2 h-32">
            {stats.weekSummary.map((count, index) => {
              const heightPercentage = (count / 7) * 100;
              return (
                <div key={index} className="flex flex-col items-center flex-1">
                  {/* Nombre au-dessus de la barre */}
                  <div className="text-xs font-semibold text-[#78350F] mb-1 h-4">
                    {count > 0 ? count : ''}
                  </div>
                  {/* Barre */}
                  <div
                    className="w-full bg-amber-500 rounded-t transition-all duration-300"
                    style={{
                      height: `${Math.max(heightPercentage, count > 0 ? 10 : 0)}%`,
                      minHeight: count > 0 ? '10px' : '0px',
                    }}
                  />
                  {/* Nom du jour */}
                  <div className="text-xs text-[#92400E] mt-2">
                    {last7Days[index]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Calendrier */}
        <SimpleCalendar />

        {/* Message d'encouragement avec thème ambre */}
        <div className="mt-8 bg-[#FFFBEB] border border-[#FDE68A] rounded-lg p-6 shadow-sm text-center">
          <h3 className="text-lg font-[family-name:var(--font-playfair)] font-semibold text-[#D97706] mb-2">
            Psaume 119, verset 164
          </h3>
          <p className="text-[#78350F] italic font-[family-name:var(--font-playfair)]">
            &ldquo;Sept fois le jour je te loue à cause de tes justes ordonnances.&rdquo;
          </p>
        </div>
      </main>

      {/* Footer avec thème ambre */}
      <footer className="text-center py-8 px-4 text-[#92400E] text-sm">
        <p>
          Application 7 Rendez-vous de Prière •
          Vos moments sont enregistrés sur cet appareil, et partagés entre vos appareils si vous les reliez
        </p>
      </footer>
    </div>
  );
}
