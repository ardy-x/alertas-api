import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';

import { v4 as uuidv4 } from 'uuid';

import { EstadoSolicitudCancelacion } from '@/alertas/dominio/enums/alerta-enums';
import { TipoEvento } from '@/alertas/dominio/enums/evento-enums';
import { AlertaRepositorioPort } from '@/alertas/dominio/puertos/alerta.port';
import { SolicitudCancelacionRepositorioPort } from '@/alertas/dominio/puertos/solicitud-cancelacion.port';
import { AlertaValidacionDominioService } from '@/alertas/dominio/servicios/alerta-validacion-dominio.service';
import { EventoDominioService } from '@/alertas/dominio/servicios/evento-dominio.service';
import { ALERTA_REPOSITORIO_TOKEN, EVENTO_DOMINIO_SERVICE_TOKEN, SOLICITUD_CANCELACION_REPOSITORIO_TOKEN } from '@/alertas/dominio/tokens/alerta.tokens';
import { CrearSolicitudCancelacionRequestDto } from '@/alertas/presentacion/dto/entrada/solicitudes-cancelacion-entrada.dto';
import { ObtenerProvinciaDepartamentoUseCase } from '@/integraciones/aplicacion/casos-uso/obtener-provincia-departamento.use-case';
import { convertirAUbicacionGeoJSON } from '@/utils/ubicacion.utils';
import { VictimaRepositorioPort } from '@/victimas/dominio/puertos/victima.port';
import { VICTIMA_REPOSITORIO } from '@/victimas/dominio/tokens/victima.tokens';
import { NotificarCreacionSolicitudUseCase } from './notificar-creacion-solicitud.use-case';

@Injectable()
export class CrearSolicitudUseCase {
  constructor(
    @Inject(SOLICITUD_CANCELACION_REPOSITORIO_TOKEN)
    private readonly solicitudRepo: SolicitudCancelacionRepositorioPort,
    @Inject(ALERTA_REPOSITORIO_TOKEN)
    private readonly alertaRepo: AlertaRepositorioPort,
    @Inject(VICTIMA_REPOSITORIO)
    private readonly victimaRepo: VictimaRepositorioPort,
    @Inject(EVENTO_DOMINIO_SERVICE_TOKEN)
    private readonly eventoDominioService: EventoDominioService,
    private readonly obtenerProvinciaDepartamentoUseCase: ObtenerProvinciaDepartamentoUseCase,
    private readonly notificarCreacionSolicitudUseCase: NotificarCreacionSolicitudUseCase,
  ) {}

  async ejecutar(idAlerta: string, entrada: CrearSolicitudCancelacionRequestDto): Promise<void> {
    // 1. Obtener y validar la alerta
    const alerta = await this.alertaRepo.obtenerAlertaSimple(idAlerta);
    if (!alerta) {
      throw new NotFoundException(`La alerta con ID ${idAlerta} no existe`);
    }

    AlertaValidacionDominioService.validarAlertaNoCerrada(alerta);
    AlertaValidacionDominioService.validarAlertaTieneVictima(alerta);
    AlertaValidacionDominioService.validarAlertaTieneMunicipio(alerta);

    // 2. Verificar si ya existe una solicitud pendiente para esta alerta
    const solicitudPendiente = await this.solicitudRepo.verificarSolicitudPendiente(idAlerta);
    if (solicitudPendiente) {
      throw new ConflictException('Ya existe una solicitud de cancelación pendiente para esta alerta');
    }

    // 3. Crear la solicitud
    const idSolicitud = uuidv4();
    await this.solicitudRepo.crearSolicitud({
      id: idSolicitud,
      idAlerta: idAlerta,
      fechaSolicitud: entrada.fechaSolicitud,
      estadoSolicitud: EstadoSolicitudCancelacion.PENDIENTE,
      idUsuarioWeb: null,
      motivoCancelacion: null,
    });

    // Preparar ubicación para el evento
    const ubicacionGeoJSON = entrada.ubicacion ? convertirAUbicacionGeoJSON(entrada.ubicacion) : null;

    // 4. Obtener el nombre completo de la víctima
    const victima = await this.victimaRepo.obtenerVictimaSimple(alerta.idVictima!);
    if (!victima) {
      throw new NotFoundException(`La víctima con ID ${alerta.idVictima} no existe`);
    }

    // 5. Obtener idDepartamento desde idMunicipio
    const datosProvinciaDepartamento = await this.obtenerProvinciaDepartamentoUseCase.ejecutar(alerta.idMunicipio!);
    if (!datosProvinciaDepartamento) {
      throw new NotFoundException(`No se pudo obtener el departamento para el municipio ${alerta.idMunicipio}`);
    }
    const idDepartamento = datosProvinciaDepartamento.departamento.id;

    // 6. Registrar evento de solicitud de cancelación
    await this.eventoDominioService.registrarEventoAutomatico(idAlerta, TipoEvento.SOLICITUD_CANCELACION, ubicacionGeoJSON);

    // 7. Notificar creación de solicitud
    await this.notificarCreacionSolicitudUseCase.ejecutar({
      idSolicitud,
      idAlerta: idAlerta,
      estado: EstadoSolicitudCancelacion.PENDIENTE,
      fechaHora: new Date().toISOString(),
      victima: victima.nombreCompleto,
      idDepartamento,
    });
  }
}
