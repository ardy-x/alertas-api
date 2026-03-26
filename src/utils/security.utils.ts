import { createHash, randomBytes } from 'node:crypto';

/**
 * Hash sencillo (unidireccional) con SHA-256.
 */
export function hashString(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

/**
 * Genera token aleatorio seguro para API key.
 */
export function generarApiKey(): string {
  return randomBytes(32).toString('hex');
}
