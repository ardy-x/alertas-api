import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { AlertasModule } from './alertas/alertas.module';
import { AutenticacionModule } from './autenticacion/autenticacion.module';
import { THROTTLER_CONFIG } from './config/throttler.config';
import { CoreModule } from './core/core.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { IntegracionesModule } from './integraciones/integraciones.module';
import { NotificacionesModule } from './notificaciones/notificaciones.module';
import { ReportesModule } from './reportes/reportes.module';
import { UsuariosWebModule } from './usuarios-web/usuarios-web.module';
import { VictimasModule } from './victimas/victimas.module';
import { WebSocketsModule } from './websockets/websockets.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: THROTTLER_CONFIG.ttl,
        limit: THROTTLER_CONFIG.limit,
      },
    ]),
    CoreModule,
    IntegracionesModule,
    AutenticacionModule,
    UsuariosWebModule,
    VictimasModule,
    AlertasModule,
    NotificacionesModule,
    WebSocketsModule,
    DashboardModule,
    ReportesModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
