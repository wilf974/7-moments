'use client';

/**
 * « Mes appareils » : relier le téléphone, la tablette, etc. à un même carnet.
 * Le premier appareil crée un code ; les suivants le saisissent.
 */
import { useCallback, useEffect, useState } from 'react';
import {
  createCarnet,
  joinCarnet,
  syncNow,
  unlinkThisDevice,
  getSyncCode,
  getLastSyncAt,
  SYNC_MESSAGES,
  SYNC_STATUS_EVENT,
  type SyncOutcome,
} from '@/lib/sync';
import { formatSyncCode } from '@/lib/syncCode';
import { isLiveConnected, LIVE_STATUS_EVENT } from '@/lib/liveSync';

const button =
  'w-full min-h-[48px] rounded-lg px-6 py-3 font-medium shadow-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed';

function formatLastSync(at: number): string {
  const date = new Date(at);
  const sameDay = new Date().toDateString() === date.toDateString();
  const time = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  return sameDay ? `aujourd'hui à ${time}` : `le ${date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} à ${time}`;
}

export default function SyncSettings() {
  const [code, setCode] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [joining, setJoining] = useState(false);
  const [input, setInput] = useState('');
  const [live, setLive] = useState(false);

  const reload = useCallback(() => {
    setCode(getSyncCode());
    setLastSync(getLastSyncAt());
  }, []);

  useEffect(() => {
    reload();
    const onStatus = (event: Event) => {
      const outcome = (event as CustomEvent<SyncOutcome>).detail;
      reload();
      setError(outcome.ok || outcome.reason === 'no_code' ? null : SYNC_MESSAGES[outcome.reason]);
    };
    const onLive = () => setLive(isLiveConnected());
    onLive();
    window.addEventListener(SYNC_STATUS_EVENT, onStatus);
    window.addEventListener(LIVE_STATUS_EVENT, onLive);
    return () => {
      window.removeEventListener(SYNC_STATUS_EVENT, onStatus);
      window.removeEventListener(LIVE_STATUS_EVENT, onLive);
    };
  }, [reload]);

  const run = async (action: () => Promise<SyncOutcome>) => {
    setBusy(true);
    setError(null);
    const outcome = await action();
    setBusy(false);
    reload();
    if (!outcome.ok) setError(SYNC_MESSAGES[outcome.reason]);
    return outcome;
  };

  const handleJoin = async () => {
    const outcome = await run(() => joinCarnet(input));
    if (outcome.ok) {
      setJoining(false);
      setInput('');
    }
  };

  const handleUnlink = () => {
    if (window.confirm("Délier cet appareil ? Ses moments restent enregistrés, mais il ne recevra plus ceux de vos autres appareils.")) {
      unlinkThisDevice();
      reload();
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="font-[family-name:var(--font-playfair)] font-semibold text-[#78350F] text-lg">
        Mes appareils
      </h3>

      {code ? (
        <div className="space-y-3">
          <div className="bg-white border border-[#FDE68A] rounded-lg p-4 text-center">
            <p className="text-sm text-[#92400E]">Code de votre carnet</p>
            <p className="text-3xl font-bold tracking-widest text-[#78350F] my-1 select-all">{formatSyncCode(code)}</p>
            <p className="text-sm text-[#92400E]">
              {lastSync ? `Synchronisé ${formatLastSync(lastSync)}` : 'Pas encore synchronisé'}
            </p>
            <p className={`text-sm mt-1 ${live ? 'text-green-700' : 'text-[#92400E]'}`}>
              {live ? '● Synchronisation instantanée active' : '○ Synchronisation instantanée en attente de connexion'}
            </p>
          </div>
          <p className="text-sm text-[#92400E]">
            Sur votre autre appareil, ouvrez ces réglages, touchez « J&apos;ai déjà un code » et saisissez ce code.
          </p>
          <button
            onClick={() => run(syncNow)}
            disabled={busy}
            className={`${button} bg-[#D97706] hover:bg-[#B45309] text-white`}
          >
            {busy ? 'Synchronisation…' : '🔄 Synchroniser maintenant'}
          </button>
          <button onClick={handleUnlink} disabled={busy} className="w-full min-h-[48px] text-sm text-[#92400E] underline">
            Délier cet appareil
          </button>
        </div>
      ) : joining ? (
        <div className="space-y-3">
          <label htmlFor="sync-code" className="block text-sm text-[#92400E]">
            Saisissez le code affiché sur votre autre appareil
          </label>
          <input
            id="sync-code"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="ABCD-EFGH"
            autoCapitalize="characters"
            autoCorrect="off"
            autoComplete="off"
            spellCheck={false}
            inputMode="text"
            maxLength={12}
            className="w-full min-h-[48px] rounded-lg border border-[#FDE68A] bg-white px-4 text-center text-2xl tracking-widest text-[#78350F] uppercase focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button
            onClick={handleJoin}
            disabled={busy || input.trim() === ''}
            className={`${button} bg-[#D97706] hover:bg-[#B45309] text-white`}
          >
            {busy ? 'Liaison…' : 'Relier cet appareil'}
          </button>
          <button onClick={() => setJoining(false)} disabled={busy} className="w-full min-h-[48px] text-sm text-[#92400E] underline">
            Annuler
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-[#92400E]">
            Vous priez sur plusieurs appareils, par exemple un téléphone et une tablette ? Reliez-les : ils partageront
            le même carnet et le même calendrier.
          </p>
          <button
            onClick={() => run(createCarnet)}
            disabled={busy}
            className={`${button} bg-[#D97706] hover:bg-[#B45309] text-white`}
          >
            {busy ? 'Création…' : '✨ Créer mon code (premier appareil)'}
          </button>
          <button
            onClick={() => {
              setError(null);
              setJoining(true);
            }}
            disabled={busy}
            className={`${button} bg-white border border-[#FDE68A] text-[#78350F] hover:bg-amber-50`}
          >
            J&apos;ai déjà un code
          </button>
        </div>
      )}

      {error && (
        <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 text-sm text-[#78350F]" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}
