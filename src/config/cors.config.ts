import { z } from 'zod';

const envSchema = z.object({
  CORS_ORIGIN: z.string().optional(),
});

const env = envSchema.parse(process.env);
const configuredOrigin = env.CORS_ORIGIN;

// Función para validar el origen dinámicamente
const validateOrigin = (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
  // Si no hay origen (requests como GET desde el navegador), permitir
  if (!origin) {
    return callback(null, true);
  }

  // Permitir localhost con cualquier puerto
  if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
    return callback(null, true);
  }

  // Permitir cualquier dominio que termine en .policia.bo
  if (origin.endsWith('.policia.bo')) {
    return callback(null, true);
  }

  // Permitir el origen configurado en las variables de entorno (si existe)
  if (configuredOrigin && origin === configuredOrigin) {
    return callback(null, true);
  }

  callback(new Error('No permitido por CORS'));
};
export const CORS_CONFIG = {
  origin: validateOrigin,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
};
