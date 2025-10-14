'use client';

/**
 * Page du calendrier
 * Affiche le calendrier mensuel avec les statistiques
 */

import Link from 'next/link';
import SimpleCalendar from '@/components/SimpleCalendar';
import { getUserStats } from '@/lib/storage';

export default function CalendarPage() {
  const stats = getUserStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Calendrier de Prière
              </h1>
              <p className="text-gray-600">
                Suivez vos moments de recueillement
              </p>
            </div>
            
            <Link
              href="/"
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              ← Retour
            </Link>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="container mx-auto px-4 py-8">
        {/* Statistiques globales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {stats.totalMoments}
            </div>
            <div className="text-sm text-gray-600">
              Total moments
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {stats.currentStreak}
            </div>
            <div className="text-sm text-gray-600">
              Série actuelle
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {stats.daysCompleted}
            </div>
            <div className="text-sm text-gray-600">
              Jours accomplis
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm text-center">
            <div className="text-3xl font-bold text-indigo-600 mb-2">
              {stats.lastActivity ? 
                new Date(stats.lastActivity).toLocaleDateString() : 
                '—'
              }
            </div>
            <div className="text-sm text-gray-600">
              Dernière activité
            </div>
          </div>
        </div>

        {/* Calendrier */}
        <SimpleCalendar />

        {/* Message d'encouragement */}
        <div className="bg-white rounded-lg p-6 shadow-sm text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Psaume 119, verset 164
          </h3>
          <p className="text-gray-600 italic">
            "Sept fois le jour je te loue à cause de tes justes ordonnances."
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-8 px-4 text-gray-500 text-sm">
        <p>
          Application 7 Rendez-vous de Prière • 
          Données stockées localement sur votre appareil
        </p>
      </footer>
    </div>
  );
}
