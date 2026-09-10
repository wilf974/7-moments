/**
 * Stockage serveur des carnets synchronisés : un fichier JSON par code,
 * dans un volume Docker. Écriture atomique (fichier temporaire puis rename)
 * et sérialisation des mises à jour d'un même carnet dans le processus.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import type { StoredData } from './merge';

const CODE_RE = /^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{8}$/;
const DEFAULT_DIR = process.env.CARNET_DIR || '/data/carnets';
const DEFAULT_MAX_CARNETS = 1000;

interface StoreOptions {
  dir?: string;
  maxCarnets?: number;
}

export class CarnetLimitError extends Error {
  constructor() {
    super('Nombre maximal de carnets atteint');
    this.name = 'CarnetLimitError';
  }
}

function fileFor(code: string, dir: string): string {
  if (!CODE_RE.test(code)) throw new Error('Code de carnet invalide');
  return path.join(dir, `${code}.json`);
}

const queues = new Map<string, Promise<unknown>>();

async function withLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const previous = queues.get(key) ?? Promise.resolve();
  const run = previous.then(fn, fn);
  const settled = run.catch(() => undefined);
  queues.set(key, settled);
  try {
    return await run;
  } finally {
    if (queues.get(key) === settled) queues.delete(key);
  }
}

async function readFile(file: string): Promise<StoredData | null> {
  let text: string;
  try {
    text = await fs.readFile(file, 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw error;
  }
  try {
    const parsed = JSON.parse(text) as { days?: StoredData } | null;
    return parsed?.days ?? {};
  } catch {
    // Fichier abîmé : on le garde à part et le carnet repart vide ; les appareils
    // renverront leurs moments à la synchro suivante (ils détectent ce qui manque).
    await fs.rename(file, `${file}.corrupt-${Date.now()}`).catch(() => undefined);
    console.error(`[carnet] fichier illisible mis de côté : ${path.basename(file)}`);
    return {};
  }
}

export async function carnetExists(code: string, opts: StoreOptions = {}): Promise<boolean> {
  const file = fileFor(code, opts.dir ?? DEFAULT_DIR);
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

export async function readCarnet(code: string, opts: StoreOptions = {}): Promise<StoredData | null> {
  const file = fileFor(code, opts.dir ?? DEFAULT_DIR);
  return readFile(file);
}

/**
 * Lit le carnet (null s'il n'existe pas), applique `updater`, écrit le résultat.
 * Si `updater` renvoie null, rien n'est écrit et la fonction renvoie null.
 */
export async function updateCarnet(
  code: string,
  updater: (current: StoredData | null) => StoredData | null,
  opts: StoreOptions = {},
): Promise<StoredData | null> {
  const dir = opts.dir ?? DEFAULT_DIR;
  const file = fileFor(code, dir);
  return withLock(file, async () => {
    const current = await readFile(file);
    const next = updater(current);
    if (next === null) return null;

    await fs.mkdir(dir, { recursive: true });
    if (current === null) {
      const existing = (await fs.readdir(dir)).filter((f) => f.endsWith('.json')).length;
      if (existing >= (opts.maxCarnets ?? DEFAULT_MAX_CARNETS)) throw new CarnetLimitError();
    }

    const tmp = `${file}.${randomBytes(6).toString('hex')}.tmp`;
    try {
      const handle = await fs.open(tmp, 'w');
      try {
        await handle.writeFile(JSON.stringify({ version: 1, updatedAt: new Date().toISOString(), days: next }), 'utf8');
        await handle.sync();
      } finally {
        await handle.close();
      }
      await fs.rename(tmp, file);
    } catch (error) {
      await fs.rm(tmp, { force: true }).catch(() => undefined);
      throw error;
    }
    return next;
  });
}
