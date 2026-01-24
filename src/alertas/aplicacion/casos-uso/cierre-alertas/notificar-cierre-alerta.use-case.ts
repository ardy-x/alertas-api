import { Inject, Injectable, Logger } from '@nestjs/common';

import { EnviarNotificacionUseCase } from '@/notificaciones/aplicacion/casos-uso/enviar-notificacion.use-case';
import { TipoDestinatario } from '@/notificaciones/dominio/entidades/notificacion.entity';
import { NotificarCambioEstadoAlertaRequest } from '@/notificaciones/dominio/interfaces/notificar-cambio-estado-alerta.interface';
import { VictimaRepositorioPort } from '@/victimas/dominio/puertos/victima.port';
import { VICTIMA_REPOSITORIO } from '@/victimas/dominio/tokens/victima.tokens';

@Injectable()
export class NotificarCierreAlertaUseCase {
  private readonly logger = new Logger(NotificarCierreAlertaUseCase.name);

  constructor(
    @Inject(VICTIMA_REPOSITORIO)
    private readonly victimaRepositorio: VictimaRepositorioPort,
    private readonly enviarNotificacionUseCase: EnviarNotificacionUseCase,
  ) {}

  async ejecutar(request: NotificarCambioEstadoAlertaRequest): Promise<void> {
    try {
      const victima = await this.victimaRepositorio.obtenerVictimaConDispositivo(request.idVictima);
      const fcmToken = victima?.fcmToken;

      if (fcmToken && fcmToken.trim().length > 0) {
        const datos = {
          tipo: 'alerta_finalizada',
          idAlerta: request.idAlerta,
          estadoFinal: request.estadoFinal,
        };

        await this.enviarNotificacionUseCase.ejecutar({
          fcmToken,
          titulo: 'Alerta finalizada',
          cuerpo: `Tu alerta fue finalizada con estado ${request.estadoFinal}`,
          datos,
          tipoDestinatario: TipoDestinatario.VICTIMA,
        });
      }
    } catch (error) {
      // No fallar por error en notificaciones
      this.logger.warn(`Error al notificar a la víctima sobre cierre de alerta ${request.idAlerta}:`, error);
    }
  }
}
