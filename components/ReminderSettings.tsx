'use client';

import { useState, useEffect } from 'react';
import {
  CANONICAL_HOURS,
  requestNotificationPermission,
  isNotificationEnabled,
  getEnabledReminders,
  setReminderEnabled,
  scheduleReminders,
} from '@/lib/notifications';

interface ReminderSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ReminderSettings({ isOpen, onClose }: ReminderSettingsProps) {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [notificationSupported, setNotificationSupported] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [enabledReminders, setEnabledReminders] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check browser support
    if (!('Notification' in window)) {
      setNotificationSupported(false);
      return;
    }

    // Check permission status
    const granted = isNotificationEnabled();
    setPermissionGranted(granted);
    setPermissionDenied(Notification.permission === 'denied');

    // Load enabled reminders from localStorage
    setEnabledReminders(getEnabledReminders());
  }, [isOpen]);

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    setPermissionGranted(granted);
    setPermissionDenied(!granted && Notification.permission === 'denied');
  };

  const handleToggleReminder = (key: string, enabled: boolean) => {
    setReminderEnabled(key, enabled);
    setEnabledReminders(prev => ({ ...prev, [key]: enabled }));
    scheduleReminders();
  };

  const formatTime = (hour: number, minute: number) => {
    return `${hour.toString().padStart(2, '0')}h${minute.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto pointer-events-auto animate-slide-in-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-[#FFFBEB] border-b border-[#FDE68A] p-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-[family-name:var(--font-playfair)] font-bold text-[#78350F]">
                Rappels de Prière
              </h2>
              <p className="text-sm text-[#92400E] mt-1">
                Recevez un rappel aux heures canoniques
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-[#92400E] hover:text-[#78350F] transition-colors p-2"
              title="Fermer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Permission Section */}
            <div className="space-y-3">
              {!notificationSupported && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">⚠️</span>
                    <div>
                      <p className="font-semibold text-[#78350F]">Notifications non supportées</p>
                      <p className="text-sm text-[#92400E] mt-1">
                        Votre navigateur ne supporte pas les notifications push.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {notificationSupported && permissionDenied && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">🚫</span>
                    <div>
                      <p className="font-semibold text-[#78350F]">Notifications bloquées</p>
                      <p className="text-sm text-[#92400E] mt-1">
                        Vous avez refusé les notifications. Veuillez les autoriser dans les paramètres de votre navigateur.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {notificationSupported && !permissionGranted && !permissionDenied && (
                <button
                  onClick={handleRequestPermission}
                  className="w-full bg-[#D97706] hover:bg-[#B45309] text-white rounded-lg px-6 py-3 font-medium shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]"
                >
                  🔔 Activer les notifications
                </button>
              )}

              {notificationSupported && permissionGranted && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">✅</span>
                    <div>
                      <p className="font-semibold text-[#78350F]">Notifications activées</p>
                      <p className="text-sm text-[#92400E] mt-1">
                        Vous recevrez des rappels pour les heures sélectionnées.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Canonical Hours Toggles */}
            <div className="space-y-3">
              <h3 className="font-[family-name:var(--font-playfair)] font-semibold text-[#78350F] text-lg">
                Heures Canoniques
              </h3>

              <div className="space-y-2">
                {CANONICAL_HOURS.map((hour) => {
                  const isEnabled = enabledReminders[hour.key] || false;
                  const disabled = !permissionGranted || !notificationSupported;

                  return (
                    <div
                      key={hour.key}
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        disabled ? 'bg-gray-50 border-gray-200' : 'bg-white border-[#FDE68A]'
                      }`}
                    >
                      <div className="flex-1">
                        <p className={`font-medium ${disabled ? 'text-gray-400' : 'text-[#78350F]'}`}>
                          {hour.name}
                        </p>
                        <p className={`text-sm ${disabled ? 'text-gray-400' : 'text-[#92400E]'}`}>
                          {formatTime(hour.hour, hour.minute)}
                        </p>
                      </div>

                      {/* Toggle Switch */}
                      <button
                        onClick={() => handleToggleReminder(hour.key, !isEnabled)}
                        disabled={disabled}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
                          disabled
                            ? 'bg-gray-300 cursor-not-allowed'
                            : isEnabled
                            ? 'bg-[#D97706]'
                            : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            isEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Info Message */}
            <div className="bg-amber-50/50 border border-amber-200/50 rounded-lg p-4">
              <p className="text-sm text-[#92400E]">
                💡 Les rappels seront envoyés chaque jour aux heures sélectionnées, même si l&apos;application est fermée (tant que votre navigateur est ouvert).
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-[#FFFBEB] border-t border-[#FDE68A] p-6">
            <button
              onClick={onClose}
              className="w-full bg-[#F59E0B] hover:bg-[#D97706] text-white rounded-lg px-6 py-3 font-medium shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
