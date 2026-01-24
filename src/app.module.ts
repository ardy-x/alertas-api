import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AlertasModule } from './alertas/alertas.module';
import { AutenticacionModule } from './autenticacion/autenticacion.module';
import { CoreModule } from './core/core.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { IntegracionesModule } from './integraciones/integraciones.module';
import { NotificacionesModule } from './notificaciones/notificaciones.module';
import { UsuariosWebModule } from './usuarios-web/usuarios-web.module';
import { VictimasModule } from './victimas/victimas.module';
import { WebsocketsModule } from './websockets/websockets.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CoreModule,
    AutenticacionModule,
    UsuariosWebModule,
    IntegracionesModule,
    VictimasModule,
    AlertasModule,
    NotificacionesModule,
    WebsocketsModule,
    DashboardModule,
  ],
})
export class AppModule {}
