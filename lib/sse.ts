/**
 * Petits outils Server-Sent Events, partagés par le serveur et les tests.
 */

/** Un événement nommé ; JSON.stringify échappe les retours à la ligne, donc une seule ligne `data`. */
export function sseEvent(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

/** Commentaire SSE, ignoré par le navigateur : sert de battement de cœur pour garder la connexion. */
export function sseComment(text: string): string {
  return `: ${text}\n\n`;
}

/** Identifiant d'onglet envoyé par le navigateur : 8 à 32 caractères alphanumériques. */
export function isValidClientId(value: unknown): value is string {
  return typeof value === 'string' && /^[a-z0-9]{8,32}$/i.test(value);
}
