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
  GEOSERVER_API_BASE: urlSchema,
  PERSONAL_API_BASE: urlSchema,
  CATALOGOS_API_BASE: urlSchema,
  JUPITER_API_BASE: urlSchema,
  KERBEROS_API_BASE: urlSchema,
  WHATSAPP_API_BASE: urlSchema,
  EMAIL_API_BASE: urlSchema,
});

const env = envSchema.parse(process.env);

export const SERVICIOS_CONFIG = {
  geoServerApiBase: env.GEOSERVER_API_BASE,
  personalApiBase: env.PERSONAL_API_BASE,
  catalogosApiBase: env.CATALOGOS_API_BASE,
  jupiterApiBase: env.JUPITER_API_BASE,
  kerberosApiBase: env.KERBEROS_API_BASE,
  whatsappApiBase: env.WHATSAPP_API_BASE,
  emailApiBase: env.EMAIL_API_BASE,
};
