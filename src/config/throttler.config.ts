import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  THROTTLE_ENABLED: z
    .string()
    .optional()
    .default('true')
    .transform((value) => !['false', '0', 'no', 'off'].includes(value.trim().toLowerCase())),
  THROTTLE_TTL: z.coerce.number().int().positive().default(60000), // 60 segundos por defecto
  THROTTLE_LIMIT: z.coerce.number().int().positive().default(100), // 100 requests por defecto
});

const env = envSchema.parse(process.env);

export const THROTTLER_CONFIG = {
  enabled: env.THROTTLE_ENABLED,
  ttl: env.THROTTLE_TTL,
  limit: env.THROTTLE_LIMIT,
};
