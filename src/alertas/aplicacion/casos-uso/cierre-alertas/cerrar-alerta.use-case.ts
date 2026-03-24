import { ConflictException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';

import { v4 as uuidv4 } from 'uuid';

import { MotivoCierre } from '@/alertas/dominio/enums/alerta-enums';
import { TipoEvento } from '@/alertas/dominio/enums/evento-enums';
import { AlertaRepositorioPort } from '@/alertas/dominio/puertos/alerta.port';
import { AtencionRepositorioPort } from '@/alertas/dominio/puertos/atencion.port';
import { CierreAlertaRepositorioPort } from '@/alertas/dominio/puertos/cierre-alerta.port';
import { SolicitudCancelacionRepositorioPort } from '@/alertas/dominio/puertos/solicitud-cancelacion.port';
import { AlertaValidacionDominioService } from '@/alertas/dominio/servicios/alerta-validacion-dominio.service';
import { EventoDominioService } from '@/alertas/dominio/servicios/evento-dominio.service';
import {
  ALERTA_REPOSITORIO_TOKEN,
  ATENCION_REPOSITORIO_TOKEN,
  CIERRE_ALERTA_REPOSITORIO_TOKEN,
  EVENTO_DOMINIO_SERVICE_TOKEN,
  SOLICITUD_CANCELACION_REPOSITORIO_TOKEN,
} from '@/alertas/dominio/tokens/alerta.tokens';
import { CerrarAlertaRequestDto } from '@/alertas/presentacion/dto/entrada/cierre-alertas-entrada.dto';
import { NotificarVictimaAlertaUseCase } from '../notificar-victima-alerta.use-case';

@Injectable()
export class CerrarAlertaUseCase {
  private readonly logger = new Logger(CerrarAlertaUseCase.name);

  constructor(
    @Inject(ALERTA_REPOSITORIO_TOKEN)
    private readonly alertaRepositorio: AlertaRepositorioPort,
    @Inject(CIERRE_ALERTA_REPOSITORIO_TOKEN)
    private readonly cierreAlertaRepo: CierreAlertaRepositorioPort,
    @Inject(SOLICITUD_CANCELACION_REPOSITORIO_TOKEN)
    private readonly solicitudCancelacionRepo: SolicitudCancelacionRepositorioPort,
    @Inject(EVENTO_DOMINIO_SERVICE_TOKEN)
    private readonly eventoDominioService: EventoDominioService,
    @Inject(ATENCION_REPOSITORIO_TOKEN)
    private readonly atencionRepositorio: AtencionRepositorioPort,
    private readonly notificarVictimaAlertaUseCase: NotificarVictimaAlertaUseCase,
  ) {}

  async ejecutar(idAlerta: string, idUsuarioWeb: string, entrada: CerrarAlertaRequestDto): Promise<void> {
    // 1. Obtener y validar alerta
    const alerta = await this.alertaRepositorio.obtenerAlertaSimple(idAlerta);
    if (!alerta) {
      throw new NotFoundException('Alerta no encontrada');
    }

    // 2. Validaciones de reglas de negocio
    const atencionExistente = await this.atencionRepositorio.existePorAlerta(idAlerta);
    if (!atencionExistente) {
      throw new ConflictException('No se puede cerrar la alerta como resuelta/falsa si no tiene atención; la alerta debe cancelarse');
    }

    AlertaValidacionDominioService.validarAlertaNoCerrada(alerta);
    AlertaValidacionDominioService.validarObservacionesFalsaAlarma(entrada.motivoCierre, entrada.observaciones);

    // 3. Crear el cierre de alerta
    const idCierre = uuidv4();
    const datosCierre = {
      id: idCierre,
      idAlerta: idAlerta,
      idUsuarioWeb: idUsuarioWeb,
      fechaHora: entrada.fechaHora ? new Date(entrada.fechaHora) : new Date(),
      estadoVictima: entrada.estadoVictima || 'Sin información',
      motivoCierre: entrada.motivoCierre as MotivoCierre,
      agresores: entrada.agresores
        ? entrada.agresores.map((agresor) => ({
            cedulaIdentidad: agresor.cedulaIdentidad,
            nombreCompleto: agresor.nombreCompleto,
            parentesco: agresor.parentesco || null,
          }))
        : [],
      observaciones: entrada.observaciones || null,
    };
    this.logger.log(`Creando cierre de alerta para la alerta ${idAlerta} por el usuario ${idUsuarioWeb}`);
    await this.cierreAlertaRepo.cerrarAlerta(datosCierre);

    // 4. Rechazar automáticamente solicitudes de cancelación pendientes
    const haySolicitudPendiente = await this.solicitudCancelacionRepo.verificarSolicitudPendiente(idAlerta);
    if (haySolicitudPendiente) {
      this.logger.log(`Se rechazó automáticamente la solicitud de cancelación pendiente de la alerta ${idAlerta} porque fue cerrada`);
      await this.solicitudCancelacionRepo.rechazarSolicitudPendientePorAlerta(idAlerta);
    }

    // 5. Determinar y actualizar el estado de la alerta
    const estadoAlerta = AlertaValidacionDominioService.determinarEstadoPorMotivoCierre(entrada.motivoCierre);
    await this.alertaRepositorio.actualizarEstado(idAlerta, estadoAlerta);

    // 6. Notificar a la víctima
    if (alerta.idVictima) {
      await this.notificarVictimaAlertaUseCase.ejecutar({
        idAlerta: idAlerta,
        idVictima: alerta.idVictima,
        estadoFinal: estadoAlerta,
        tipoNotificacion: 'alerta_finalizada',
        titulo: 'Alerta finalizada',
        cuerpo: `Tu alerta fue finalizada con estado ${estadoAlerta}`,
      });
    }

    // 7. Registrar evento automático
    const tipoEvento = this.determinarTipoEvento(entrada.motivoCierre);
    await this.eventoDominioService.registrarEventoSemiautomatico(
      idAlerta,
      tipoEvento,
      idUsuarioWeb,
      null, // Sin ubicación específica para el cierre
    );
  }

  private determinarTipoEvento(motivoCierre: MotivoCierre | string): TipoEvento {
    const motivoCierreStr = String(motivoCierre);
    if (motivoCierreStr === String(MotivoCierre.RESUELTA)) {
      return TipoEvento.ALERTA_CERRADA;
    } else if (motivoCierreStr === String(MotivoCierre.FALSA_ALERTA)) {
      return TipoEvento.FALSA_ALERTA;
    } else {
      return TipoEvento.ALERTA_CERRADA;
    }
  }
}
