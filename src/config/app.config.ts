import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().int().positive(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  ID_SISTEMA_ACTUAL: z.string(),
  JWT_SECRET: z.string().min(1),
  JWT_EXPIRES_IN: z.string().min(1),
  REFRESH_TOKEN_TTL: z.coerce.number().int().positive(),
});

const env = envSchema.parse(process.env);

export const APP_CONFIG = {
  port: env.PORT,
  nodeEnv: env.NODE_ENV,
  isDevelopment: env.NODE_ENV === 'development',
  swaggerPath: 'docs',
  globalPrefix: 'api',
  idSistemaActual: env.ID_SISTEMA_ACTUAL,
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
    refreshTokenTtl: env.REFRESH_TOKEN_TTL,
  },
};
