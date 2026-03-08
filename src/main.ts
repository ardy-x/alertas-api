import { networkInterfaces } from 'node:os';
import { join } from 'node:path';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import * as express from 'express';
import { Request, Response } from 'express';
import { ExcepcionGlobalFilter } from '@/core/filtros/excepcion-global.filter';
import { AppModule } from './app.module';
import { APP_CONFIG } from './config/app.config';
import { CORS_CONFIG } from './config/cors.config';
import { SCALAR_CONFIG } from './config/scalar.config';
import { SWAGGER_CONFIG, swaggerEnv } from './config/swagger.config';
import { VALIDATION_PIPE_CONFIG } from './config/validation.config';

async function bootstrap() {
  const logger = new Logger(swaggerEnv.API_TITLE);
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Aumentar límites para JSON y URL encoded (no afecta multipart/form-data)
  app.use(express.json({ limit: '100mb' }));
  app.use(express.urlencoded({ limit: '100mb', extended: true }));

  // Servir archivos estáticos con express.static directamente
  const archivosPath = join(process.cwd(), 'archivos');
  logger.log(`Sirviendo archivos estáticos desde: ${archivosPath}`);
  app.use('/archivos', express.static(archivosPath));

  // Configuración de OpenAPI
  const document = SwaggerModule.createDocument(app, SWAGGER_CONFIG);

  // Servir el spec OpenAPI en /api-json sin UI
  app.use('/api-json', (_req: Request, res: Response) => res.json(document));

  app.use('/docs', apiReference(SCALAR_CONFIG));

  // Aplicar filtros globales
  app.useGlobalFilters(new ExcepcionGlobalFilter());

  // Habilitar CORS para permitir requests desde el frontend
  app.enableCors(CORS_CONFIG);

  // Establecer prefijo global para rutas - DESPUÉS de archivos estáticos
  app.setGlobalPrefix(APP_CONFIG.globalPrefix);

  // Habilitar validacion global
  app.useGlobalPipes(VALIDATION_PIPE_CONFIG);

  await app.listen(APP_CONFIG.port);

  // Obtener IP local
  const nets = networkInterfaces();
  const ip =
    Object.values(nets)
      .flat()
      .find((net) => net?.family === 'IPv4' && !net.internal)?.address || 'localhost';

  logger.log(`API disponible en: http://${ip}:${APP_CONFIG.port}/api`);
  logger.log(`Documentación disponible en: http://${ip}:${APP_CONFIG.port}/docs`);
}
void bootstrap();
