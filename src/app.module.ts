import { Module } from '@nestjs/common';

import { AlertasModule } from './alertas/alertas.module';
import { AutenticacionModule } from './autenticacion/autenticacion.module';
import { CoreModule } from './core/core.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { IntegracionesModule } from './integraciones/integraciones.module';
import { NotificacionesModule } from './notificaciones/notificaciones.module';
import { ReportesModule } from './reportes/reportes.module';
import { UsuariosWebModule } from './usuarios-web/usuarios-web.module';
import { VictimasModule } from './victimas/victimas.module';
import { WebSocketsModule } from './websockets/websockets.module';

@Module({
  imports: [CoreModule, AutenticacionModule, UsuariosWebModule, IntegracionesModule, VictimasModule, AlertasModule, NotificacionesModule, WebSocketsModule, DashboardModule, ReportesModule],
})
export class AppModule {}
