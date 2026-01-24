import 'dotenv/config';
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
  DATABASE_URL: urlSchema,
});

const env = envSchema.parse(process.env);

export const DATABASE_CONFIG = {
  url: env.DATABASE_URL,
};
