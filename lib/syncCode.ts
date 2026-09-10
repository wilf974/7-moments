/**
 * Code de synchronisation : 8 caractères faciles à lire et à recopier
 * d'un appareil à l'autre. Sans 0/O, 1/I/L pour éviter les confusions.
 * 31^8 ≈ 8,5e11 combinaisons ; le serveur limite en plus les essais.
 */
export const SYNC_CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 8;
const CODE_RE = new RegExp(`^[${SYNC_CODE_ALPHABET}]{${CODE_LENGTH}}$`);

export function generateSyncCode(): string {
  const n = SYNC_CODE_ALPHABET.length;
  const limit = 256 - (256 % n); // tirage par rejet : distribution uniforme
  let code = '';
  while (code.length < CODE_LENGTH) {
    const bytes = new Uint8Array(16);
    globalThis.crypto.getRandomValues(bytes);
    for (const b of bytes) {
      if (b < limit && code.length < CODE_LENGTH) code += SYNC_CODE_ALPHABET[b % n];
    }
  }
  return code;
}

/** Majuscules, sans espaces ni tirets. */
export function normalizeSyncCode(input: string): string {
  return input.toUpperCase().replace(/[\s-]/g, '');
}

export function isValidSyncCode(code: string): boolean {
  return CODE_RE.test(code);
}

export function formatSyncCode(code: string): string {
  return `${code.slice(0, 4)}-${code.slice(4)}`;
}
