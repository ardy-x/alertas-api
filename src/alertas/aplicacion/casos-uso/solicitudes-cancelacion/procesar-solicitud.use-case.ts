import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { EstadoAlerta, EstadoSolicitudCancelacion } from '@/alertas/dominio/enums/alerta-enums';
import { TipoEvento } from '@/alertas/dominio/enums/evento-enums';
import { AlertaRepositorioPort } from '@/alertas/dominio/puertos/alerta.port';
import { SolicitudCancelacionRepositorioPort } from '@/alertas/dominio/puertos/solicitud-cancelacion.port';
import { AlertaValidacionDominioService } from '@/alertas/dominio/servicios/alerta-validacion-dominio.service';
import { EventoDominioService } from '@/alertas/dominio/servicios/evento-dominio.service';
import { ALERTA_REPOSITORIO_TOKEN, EVENTO_DOMINIO_SERVICE_TOKEN, SOLICITUD_CANCELACION_REPOSITORIO_TOKEN } from '@/alertas/dominio/tokens/alerta.tokens';
import { ProcesarSolicitudCancelacionRequestDto } from '@/alertas/presentacion/dto/entrada/solicitudes-cancelacion-entrada.dto';
import { NotificarVictimaAlertaUseCase } from '../notificar-victima-alerta.use-case';

@Injectable()
export class ProcesarSolicitudUseCase {
  constructor(
    @Inject(SOLICITUD_CANCELACION_REPOSITORIO_TOKEN)
    private readonly solicitudCancelacionRepositorio: SolicitudCancelacionRepositorioPort,
    @Inject(ALERTA_REPOSITORIO_TOKEN)
    private readonly alertaRepositorio: AlertaRepositorioPort,
    @Inject(EVENTO_DOMINIO_SERVICE_TOKEN)
    private readonly eventoDominioService: EventoDominioService,
    private readonly notificarVictimaAlertaUseCase: NotificarVictimaAlertaUseCase,
  ) {}

  async ejecutar(idSolicitud: string, idUsuarioWeb: string, entrada: ProcesarSolicitudCancelacionRequestDto): Promise<void> {
    // 1. Obtener y validar solicitud
    const solicitudExistente = await this.solicitudCancelacionRepositorio.obtenerSolicitud(idSolicitud);
    if (!solicitudExistente) {
      throw new NotFoundException('Solicitud de cancelación no encontrada');
    }
    AlertaValidacionDominioService.validarSolicitudPendiente(solicitudExistente.estadoSolicitud);

    // 2. Obtener y validar alerta
    const alerta = await this.alertaRepositorio.obtenerAlertaSimple(solicitudExistente.idAlerta);
    if (!alerta) {
      throw new NotFoundException('Alerta no encontrada');
    }
    AlertaValidacionDominioService.validarAlertaNoCerrada(alerta);

    // 3. Aprobar la solicitud (este endpoint es solo para aprobar)
    const datosActualizacion = {
      estado: EstadoSolicitudCancelacion.APROBADA,
      idUsuarioWeb: idUsuarioWeb,
      motivoCancelacion: entrada.motivoCancelacion,
    };
    await this.solicitudCancelacionRepositorio.procesarSolicitud(idSolicitud, datosActualizacion);

    // 4. Actualizar estado de alerta a CANCELADA y notificar
    await this.alertaRepositorio.actualizarEstado(solicitudExistente.idAlerta, EstadoAlerta.CANCELADA);

    if (alerta.idVictima) {
      await this.notificarVictimaAlertaUseCase.ejecutar({
        idAlerta: solicitudExistente.idAlerta,
        idVictima: alerta.idVictima,
        estadoFinal: EstadoAlerta.CANCELADA,
        tipoNotificacion: 'alerta_finalizada',
        titulo: 'Alerta cancelada',
        cuerpo: 'Tu alerta fue cancelada',
      });
    }

    // 5. Registrar evento automático de cancelación
    await this.eventoDominioService.registrarEventoSemiautomatico(
      solicitudExistente.idAlerta,
      TipoEvento.ALERTA_CANCELADA,
      idUsuarioWeb,
      null, // Sin ubicación específica
    );
  }
}
