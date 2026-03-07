import { Module } from '@nestjs/common';

import { CoreModule } from '../core/core.module';
import { IntegracionesModule } from '../integraciones/integraciones.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ActivarCuentaUseCase } from './aplicacion/casos-uso/activar-cuenta.use-case';
import { ActualizarContactoEmergenciaUseCase } from './aplicacion/casos-uso/actualizar-contacto-emergencia.use-case';
import { ActualizarDatosContactoUseCase } from './aplicacion/casos-uso/actualizar-datos-contacto.use-case';
import { ActualizarDatosCuentaUseCase } from './aplicacion/casos-uso/actualizar-datos-cuenta.use-case';
import { ActualizarPermisosUseCase } from './aplicacion/casos-uso/actualizar-permisos.use-case';
import { ActualizarUbicacionUseCase } from './aplicacion/casos-uso/actualizar-ubicacion.use-case';
import { AgregarContactoVictimaUseCase } from './aplicacion/casos-uso/agregar-contacto-victima.use-case';
import { CerrarSesionUseCase } from './aplicacion/casos-uso/cerrar-sesion.use-case';
import { CrearVictimaUseCase } from './aplicacion/casos-uso/crear-victima.use-case';
import { EliminarContactoEmergenciaUseCase } from './aplicacion/casos-uso/eliminar-contacto-emergencia.use-case';
import { AsignarInvestigadorUseCase } from './aplicacion/casos-uso/investigadores/asignar-investigador.use-case';
import { DesasignarInvestigadorUseCase } from './aplicacion/casos-uso/investigadores/desasignar-investigador.use-case';
import { ListarHistorialInvestigadoresUseCase } from './aplicacion/casos-uso/investigadores/listar-historial-investigadores.use-case';
import { ObtenerInvestigadorActivoUseCase } from './aplicacion/casos-uso/investigadores/obtener-investigador-activo.use-case';
import { ListarVictimasUseCase } from './aplicacion/casos-uso/listar-victimas.use-case';
import { MarcarContactoPrincipalUseCase } from './aplicacion/casos-uso/marcar-contacto-principal.use-case';
import { ObtenerHistorialAlertasVictimaUseCase } from './aplicacion/casos-uso/obtener-historial-alertas-victima.use-case';
import { ObtenerVictimaUseCase } from './aplicacion/casos-uso/obtener-victima.use-case';
import { SuspenderCuentaUseCase } from './aplicacion/casos-uso/suspender-cuenta.use-case';
import { SolicitarCodigoEmailUseCase } from './aplicacion/casos-uso/validacion/solicitar-codigo-email.use-case';
import { SolicitarCodigoWhatsappUseCase } from './aplicacion/casos-uso/validacion/solicitar-codigo-whatsapp.use-case';
import { VerificarCodigoCelularUseCase } from './aplicacion/casos-uso/validacion/verificar-codigo-celular.use-case';
import { VerificarCodigoEmailUseCase } from './aplicacion/casos-uso/validacion/verificar-codigo-email.use-case';
import { VerificarDenunciaUseCase } from './aplicacion/casos-uso/verificar-denuncia.use-case';
import { VerificarVictimaUseCase } from './aplicacion/casos-uso/verificar-victima.use-case';
import { EstadisticasAlertasService } from './dominio/servicios/estadisticas-alertas.service';
import { VictimaValidacionDominioService } from './dominio/servicios/victima-validacion-dominio.service';
import {
  ALERTA_VICTIMA_REPOSITORIO,
  CLAVES_API_PORT_TOKEN,
  CODIGO_VALIDACION_REPOSITORIO_TOKEN,
  CONTACTO_EMERGENCIA_REPOSITORIO,
  INVESTIGADOR_VICTIMA_REPOSITORIO,
  MENSAJE_PORT_TOKEN,
  VERIFICAR_DENUNCIA_PORT_TOKEN,
  VICTIMA_REPOSITORIO,
  VICTIMA_VALIDACION_DOMINIO_SERVICE,
} from './dominio/tokens/victima.tokens';
import { AlertaVictimaPrismaAdapter } from './infraestructura/adaptadores/alerta-victima-prisma.adapter';
import { ClavesApiPrismaAdapter } from './infraestructura/adaptadores/claves-api-prisma.adapter';
import { CodigoValidacionRedisAdapter } from './infraestructura/adaptadores/codigo-validacion-redis.adapter';
import { ContactoEmergenciaPrismaAdapter } from './infraestructura/adaptadores/contacto-emergencia-prisma.adapter';
import { InvestigadorVictimaPrismaAdapter } from './infraestructura/adaptadores/investigador-victima-prisma.adapter';
import { MensajeAdapter } from './infraestructura/adaptadores/mensaje.adapter';
import { VerificarDenunciaAdapter } from './infraestructura/adaptadores/verificar-denuncia.adapter';
import { VictimaPrismaAdapter } from './infraestructura/adaptadores/victima-prisma.adapter';
import { ClaveApiGuard } from './infraestructura/guards/clave-api.guard';
import { ContactosEmergenciaController } from './presentacion/controladores/contactos-emergencia.controller';
import { InvestigadoresController } from './presentacion/controladores/investigadores.controller';
import { ValidacionController } from './presentacion/controladores/validacion.controller';
import { VictimasController } from './presentacion/controladores/victimas.controller';
import { VictimasWebController } from './presentacion/controladores/victimas-web.controller';

@Module({
  imports: [CoreModule, PrismaModule, IntegracionesModule],
  controllers: [VictimasController, VictimasWebController, ContactosEmergenciaController, ValidacionController, InvestigadoresController],
  providers: [
    // Casos de Uso - Víctimas
    CrearVictimaUseCase,
    ObtenerVictimaUseCase,
    ListarVictimasUseCase,
    ActualizarDatosContactoUseCase,
    ActualizarUbicacionUseCase,
    ActualizarDatosCuentaUseCase,
    VerificarVictimaUseCase,
    SuspenderCuentaUseCase,
    ActivarCuentaUseCase,
    ObtenerHistorialAlertasVictimaUseCase,
    CerrarSesionUseCase,
    ActualizarPermisosUseCase,

    // Casos de Uso - Contactos de Emergencia
    AgregarContactoVictimaUseCase,
    ActualizarContactoEmergenciaUseCase,
    EliminarContactoEmergenciaUseCase,
    MarcarContactoPrincipalUseCase,
    VerificarDenunciaUseCase,

    // Casos de Uso - Investigadores
    AsignarInvestigadorUseCase,
    DesasignarInvestigadorUseCase,
    ObtenerInvestigadorActivoUseCase,
    ListarHistorialInvestigadoresUseCase,

    // Casos de Uso - Validación
    SolicitarCodigoEmailUseCase,
    SolicitarCodigoWhatsappUseCase,
    VerificarCodigoCelularUseCase,
    VerificarCodigoEmailUseCase,

    // Servicios de Dominio
    {
      provide: VICTIMA_VALIDACION_DOMINIO_SERVICE,
      useClass: VictimaValidacionDominioService,
    },
    EstadisticasAlertasService,

    // Guards
    ClaveApiGuard,

    // Providers de inyección de dependencias
    {
      provide: VICTIMA_REPOSITORIO,
      useClass: VictimaPrismaAdapter,
    },
    {
      provide: ALERTA_VICTIMA_REPOSITORIO,
      useClass: AlertaVictimaPrismaAdapter,
    },
    {
      provide: CONTACTO_EMERGENCIA_REPOSITORIO,
      useClass: ContactoEmergenciaPrismaAdapter,
    },
    {
      provide: INVESTIGADOR_VICTIMA_REPOSITORIO,
      useClass: InvestigadorVictimaPrismaAdapter,
    },
    {
      provide: MENSAJE_PORT_TOKEN,
      useClass: MensajeAdapter,
    },
    {
      provide: VERIFICAR_DENUNCIA_PORT_TOKEN,
      useClass: VerificarDenunciaAdapter,
    },
    {
      provide: CLAVES_API_PORT_TOKEN,
      useClass: ClavesApiPrismaAdapter,
    },
    {
      provide: CODIGO_VALIDACION_REPOSITORIO_TOKEN,
      useClass: CodigoValidacionRedisAdapter,
    },
  ],
  exports: [VICTIMA_REPOSITORIO, VerificarVictimaUseCase, ObtenerVictimaUseCase, ObtenerHistorialAlertasVictimaUseCase, ObtenerInvestigadorActivoUseCase, ClaveApiGuard, CLAVES_API_PORT_TOKEN],
})
export class VictimasModule {}
