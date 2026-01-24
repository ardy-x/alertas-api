import { Module } from '@nestjs/common';

import { EnviarNotificacionUseCase } from './aplicacion/casos-uso/enviar-notificacion.use-case';
import { EnviarNotificacionesMultiplesUseCase } from './aplicacion/casos-uso/enviar-notificaciones-multiples.use-case';
import { NOTIFICACION_REPOSITORIO_TOKEN } from './dominio/tokens/notificacion.tokens';
import { NotificacionAdapter } from './infraestructura/adaptadores/notificacion.adapter';
import { NotificacionesController } from './presentacion/controladores/notificaciones.controller';

@Module({
  controllers: [NotificacionesController],
  providers: [
    {
      provide: NOTIFICACION_REPOSITORIO_TOKEN,
      useClass: NotificacionAdapter,
    },
    EnviarNotificacionUseCase,
    EnviarNotificacionesMultiplesUseCase,
  ],
  exports: [EnviarNotificacionUseCase, EnviarNotificacionesMultiplesUseCase],
})
export class NotificacionesModule {}
