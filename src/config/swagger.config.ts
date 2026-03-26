import { DocumentBuilder } from '@nestjs/swagger';
import { z } from 'zod';

const envSchema = z.object({
  API_TITLE: z.string().min(1),
  API_DESCRIPTION: z.string().min(1),
  API_VERSION: z.string().min(1),
});

const env = envSchema.parse(process.env);

export { env as swaggerEnv };

export const SWAGGER_CONFIG = new DocumentBuilder()
  .setTitle(env.API_TITLE)
  .setDescription(env.API_DESCRIPTION)
  .setVersion(env.API_VERSION)
  .addServer('api')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Ingresa tu token JWT',
      in: 'header',
    },
    'jwt-auth',
  )
  .addApiKey(
    {
      type: 'apiKey',
      name: 'x-api-key',
      in: 'header',
      description: 'API Key para acceso externo',
    },
    'api-key',
  )
  .build();
