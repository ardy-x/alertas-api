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
  BACKUP_DIR: z.string().default('./backups'),
  BACKUP_RETENTION_DAYS: z.coerce.number().int().default(7),
  BACKUP_CRON_SCHEDULE: z.string().default('0 2 * * *'), // 2 AM diario
});

const env = envSchema.parse(process.env);

export const REDIS_CONFIG = {
  ttl: env.CACHE_TTL,
  cronSchedule: env.CACHE_CRON_SCHEDULE,
  redisUrl: env.REDIS_URL,
};

export const BACKUP_CONFIG = {
  backupDir: env.BACKUP_DIR,
  retentionDays: env.BACKUP_RETENTION_DAYS,
  cronSchedule: env.BACKUP_CRON_SCHEDULE,
};
