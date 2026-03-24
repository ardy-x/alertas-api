import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().int().positive(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  ID_SISTEMA_ACTUAL: z.string(),
});

const env = envSchema.parse(process.env);

export const APP_CONFIG = {
  port: env.PORT,
  nodeEnv: env.NODE_ENV,
  isDevelopment: env.NODE_ENV === 'development',
  swaggerPath: 'docs',
  globalPrefix: 'api',
  idSistemaActual: env.ID_SISTEMA_ACTUAL,
};
