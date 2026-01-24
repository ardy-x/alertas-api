import { z } from 'zod';

const urlSchema = z.string().refine((val) => {
  try {
    new URL(val);
    return true;
  } catch {
    return false;
  }
}, 'URL inválida');

const envSchema = z.object({
  CACHE_TTL: z.coerce.number().int().positive(),
  CACHE_CRON_SCHEDULE: z.string().min(1),
  REDIS_URL: urlSchema,
});

const env = envSchema.parse(process.env);

export const CACHE_CONFIG = {
  ttl: env.CACHE_TTL,
  cronSchedule: env.CACHE_CRON_SCHEDULE,
  redisUrl: env.REDIS_URL,
};
