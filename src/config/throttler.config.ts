import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  THROTTLE_TTL: z.coerce.number().int().positive().default(60000), // 60 segundos por defecto
  THROTTLE_LIMIT: z.coerce.number().int().positive().default(100), // 100 requests por defecto
});

const env = envSchema.parse(process.env);

export const THROTTLER_CONFIG = {
  ttl: env.THROTTLE_TTL,
  limit: env.THROTTLE_LIMIT,
};
