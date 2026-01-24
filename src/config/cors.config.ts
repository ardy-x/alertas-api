import { z } from 'zod';

const envSchema = z.object({
  CORS_ORIGIN: z
    .string()
    .min(1)
    .transform((val) => val.split(',').map((origin) => origin.trim())),
});

const env = envSchema.parse(process.env);

export const CORS_CONFIG = {
  origin: env.CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
};
