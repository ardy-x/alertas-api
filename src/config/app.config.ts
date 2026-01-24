import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().int().positive(),
});

const env = envSchema.parse(process.env);

export const APP_CONFIG = {
  port: env.PORT,
  swaggerPath: 'docs',
  globalPrefix: 'api',
};
