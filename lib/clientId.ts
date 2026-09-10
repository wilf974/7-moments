/**
 * Identifiant de cet onglet, tiré à l'ouverture. Envoyé avec chaque synchro pour que
 * l'onglet ignore le signal « carnet modifié » qu'il a lui-même provoqué.
 */
let clientId: string | null = null;

export function getClientId(): string {
  if (!clientId) {
    const bytes = new Uint8Array(8);
    globalThis.crypto.getRandomValues(bytes);
    clientId = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  }
  return clientId;
}
