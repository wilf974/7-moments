'use client';

/**
 * Choix de la durée de la bougie. Le moment est compté dès l'appui sur le bouton ;
 * la durée ne sert qu'au temps de recueillement affiché.
 */
import { useEffect, useState } from 'react';
import { TIMER_CHOICES, getTimerDuration, setTimerDuration, formatTimerChoice } from '@/lib/settings';

export default function TimerSettings() {
  const [duration, setDuration] = useState<number | null>(null);

  useEffect(() => {
    setDuration(getTimerDuration());
  }, []);

  const choose = (seconds: number) => {
    setTimerDuration(seconds);
    setDuration(seconds);
  };

  return (
    <div className="space-y-3">
      <h3 className="font-[family-name:var(--font-playfair)] font-semibold text-[#78350F] text-lg">
        Durée de la bougie
      </h3>
      <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Durée de la bougie">
        {TIMER_CHOICES.map((seconds) => {
          const active = duration === seconds;
          return (
            <button
              key={seconds}
              role="radio"
              aria-checked={active}
              onClick={() => choose(seconds)}
              className={`min-h-[48px] rounded-lg border font-medium transition-colors ${
                active
                  ? 'bg-[#D97706] border-[#D97706] text-white'
                  : 'bg-white border-[#FDE68A] text-[#78350F] hover:bg-amber-50'
              }`}
            >
              {formatTimerChoice(seconds)}
            </button>
          );
        })}
      </div>
      <p className="text-sm text-[#92400E]">
        Le moment est compté dès que vous allumez la bougie. Vous pouvez aussi toucher « Suivant » sans attendre la fin.
      </p>
    </div>
  );
}
