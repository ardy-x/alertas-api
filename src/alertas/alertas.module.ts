import { Module } from '@nestjs/common';

import { IntegracionesModule } from '../integraciones/integraciones.module';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';
import { PrismaModule } from '../prisma/prisma.module';
import { UsuariosWebModule } from '../usuarios-web/usuarios-web.module';
import { VictimasModule } from '../victimas/victimas.module';
import { ActualizarAlertaUseCase } from './aplicacion/casos-uso/actualizar-alerta.use-case';
import { AgregarFuncionarioUseCase } from './aplicacion/casos-uso/atenciones/agregar-funcionario.use-case';
import { CrearAtencionCompletaUseCase } from './aplicacion/casos-uso/atenciones/crear-atencion-completa.use-case';
import { crearAlertaAttUseCase } from './aplicacion/casos-uso/att/crear-alerta-att.use-case';
import { CerrarAlertaUseCase } from './aplicacion/casos-uso/cierre-alertas/cerrar-alerta.use-case';
import { NotificarCierreAlertaUseCase } from './aplicacion/casos-uso/cierre-alertas/notificar-cierre-alerta.use-case';
import { CrearAlertaUseCase } from './aplicacion/casos-uso/crear-alerta.use-case';
import { CrearPuntoRutaUseCase } from './aplicacion/casos-uso/crear-punto-ruta.use-case';
import { ListarAlertasActivasUseCase } from './aplicacion/casos-uso/listar-alertas-activas.use-case';
import { ListarHistorialAlertasUseCase } from './aplicacion/casos-uso/listar-historial-alertas.use-case';
import { MarcarEnAtencionUseCase } from './aplicacion/casos-uso/marcar-en-atencion.use-case';
import { NotificarCreacionAlertaUseCase } from './aplicacion/casos-uso/notificar-creacion-alerta.use-case';
import { ObtenerAlertaPorIdUseCase } from './aplicacion/casos-uso/obtener-detalle-alerta.use-case';
import { ObtenerEstadoAlertaUseCase } from './aplicacion/casos-uso/obtener-estado-alerta.use-case';
import { CrearSolicitudUseCase } from './aplicacion/casos-uso/solicitudes-cancelacion/crear-solicitud.use-case';
import { ListarSolicitudesUseCase } from './aplicacion/casos-uso/solicitudes-cancelacion/listar-solicitudes.use-case';
import { NotificarCancelacionAlertaUseCase } from './aplicacion/casos-uso/solicitudes-cancelacion/notificar-cancelacion-alerta.use-case';
import { NotificarCreacionSolicitudUseCase } from './aplicacion/casos-uso/solicitudes-cancelacion/notificar-creacion-solicitud.use-case';
import { ObtenerSolicitudDetalleUseCase } from './aplicacion/casos-uso/solicitudes-cancelacion/obtener-solicitud-detalle.use-case';
import { ProcesarSolicitudUseCase } from './aplicacion/casos-uso/solicitudes-cancelacion/procesar-solicitud.use-case';
import { EventoDominioService } from './dominio/servicios/evento-dominio.service';
import { ValidarVictimaService } from './dominio/servicios/validar-victima.service';
import {
  ALERTA_REPOSITORIO_TOKEN,
  ALERTA_WEB_REPOSITORIO_TOKEN,
  ATENCION_FUNCIONARIO_REPOSITORIO_TOKEN,
  ATENCION_REPOSITORIO_TOKEN,
  CIERRE_ALERTA_REPOSITORIO_TOKEN,
  DATOS_EXTERNOS_ATT_REPOSITORIO_TOKEN,
  EVENTO_DOMINIO_SERVICE_TOKEN,
  EVENTO_REPOSITORIO_TOKEN,
  EVIDENCIA_REPOSITORIO_TOKEN,
  RUTA_ALERTA_REPOSITORIO_TOKEN,
  SOLICITUD_CANCELACION_REPOSITORIO_TOKEN,
} from './dominio/tokens/alerta.tokens';
import { AlertaPrismaAdapter } from './infraestructura/adaptadores/alerta-prisma.adapter';
import { AlertaWebPrismaAdapter } from './infraestructura/adaptadores/alerta-web-prisma.adapter';
import { AtencionFuncionarioPrismaAdapter } from './infraestructura/adaptadores/atencion-funcionario-prisma.adapter';
import { AtencionPrismaAdapter } from './infraestructura/adaptadores/atencion-prisma.adapter';
import { CierreAlertaPrismaAdapter } from './infraestructura/adaptadores/cierre-alerta-prisma.adapter';
import { DatosExternosAttPrismaAdapter } from './infraestructura/adaptadores/datos-externos-att-prisma.adapter';
import { EventoPrismaAdapter } from './infraestructura/adaptadores/eventos/evento-prisma.adapter';
import { EvidenciaPrismaAdapter } from './infraestructura/adaptadores/eventos/evidencia-prisma.adapter';
import { RutaAlertaPrismaAdapter } from './infraestructura/adaptadores/ruta-alerta-prisma.adapter';
import { SolicitudCancelacionPrismaAdapter } from './infraestructura/adaptadores/solicitud-cancelacion-prisma.adapter';
import { AlertasController } from './presentacion/controladores/alertas.controller';
import { AlertasWebController } from './presentacion/controladores/alertas-web.controller';
import { AtencionesController } from './presentacion/controladores/atenciones.controller';
import { AlertasAttController } from './presentacion/controladores/att/alertas-att.controller';
import { CierreAlertasController } from './presentacion/controladores/cierre-alertas.controller';
import { RutaAlertaController } from './presentacion/controladores/ruta-alerta.controller';
import { SolicitudesCancelacionController } from './presentacion/controladores/solicitudes-cancelacion.controller';

@Module({
  imports: [IntegracionesModule, PrismaModule, VictimasModule, NotificacionesModule, UsuariosWebModule],
  controllers: [AlertasController, AlertasWebController, RutaAlertaController, SolicitudesCancelacionController, CierreAlertasController, AlertasAttController, AtencionesController],
  providers: [
    // Casos de uso - Alertas
    CrearAlertaUseCase,
    CerrarAlertaUseCase,
    ActualizarAlertaUseCase,
    CrearSolicitudUseCase,
    ProcesarSolicitudUseCase,
    ListarSolicitudesUseCase,
    ObtenerSolicitudDetalleUseCase,
    ListarAlertasActivasUseCase,
    ListarHistorialAlertasUseCase,
    ObtenerAlertaPorIdUseCase,
    ObtenerEstadoAlertaUseCase,
    MarcarEnAtencionUseCase,
    crearAlertaAttUseCase,
    CrearPuntoRutaUseCase,
    NotificarCreacionAlertaUseCase,
    NotificarCierreAlertaUseCase,
    NotificarCancelacionAlertaUseCase,
    NotificarCreacionSolicitudUseCase,

    // Casos de uso - Atenciones
    CrearAtencionCompletaUseCase,
    AgregarFuncionarioUseCase,

    // Servicios de dominio
    ValidarVictimaService,
    EventoDominioService,

    // Adaptadores
    AlertaPrismaAdapter,
    AlertaWebPrismaAdapter,
    CierreAlertaPrismaAdapter,
    RutaAlertaPrismaAdapter,
    EvidenciaPrismaAdapter,
    EventoPrismaAdapter,
    SolicitudCancelacionPrismaAdapter,
    DatosExternosAttPrismaAdapter,
    AtencionPrismaAdapter,
    AtencionFuncionarioPrismaAdapter,

    {
      provide: ALERTA_REPOSITORIO_TOKEN,
      useClass: AlertaPrismaAdapter,
    },
    {
      provide: ALERTA_WEB_REPOSITORIO_TOKEN,
      useClass: AlertaWebPrismaAdapter,
    },
    {
      provide: CIERRE_ALERTA_REPOSITORIO_TOKEN,
      useClass: CierreAlertaPrismaAdapter,
    },
    {
      provide: SOLICITUD_CANCELACION_REPOSITORIO_TOKEN,
      useClass: SolicitudCancelacionPrismaAdapter,
    },
    {
      provide: EVIDENCIA_REPOSITORIO_TOKEN,
      useClass: EvidenciaPrismaAdapter,
    },
    {
      provide: DATOS_EXTERNOS_ATT_REPOSITORIO_TOKEN,
      useClass: DatosExternosAttPrismaAdapter,
    },
    {
      provide: RUTA_ALERTA_REPOSITORIO_TOKEN,
      useClass: RutaAlertaPrismaAdapter,
    },
    {
      provide: EVENTO_REPOSITORIO_TOKEN,
      useClass: EventoPrismaAdapter,
    },
    {
      provide: EVENTO_DOMINIO_SERVICE_TOKEN,
      useClass: EventoDominioService,
    },
    {
      provide: ATENCION_REPOSITORIO_TOKEN,
      useClass: AtencionPrismaAdapter,
    },
    {
      provide: ATENCION_FUNCIONARIO_REPOSITORIO_TOKEN,
      useClass: AtencionFuncionarioPrismaAdapter,
    },
  ],
  exports: [
    ObtenerAlertaPorIdUseCase,
    ListarHistorialAlertasUseCase,
    AlertaPrismaAdapter,
    CierreAlertaPrismaAdapter,
    RutaAlertaPrismaAdapter,
    EvidenciaPrismaAdapter,
    SolicitudCancelacionPrismaAdapter,
    CrearAtencionCompletaUseCase,
    AgregarFuncionarioUseCase,
    IntegracionesModule,
  ],
})
export class AlertasModule {}
