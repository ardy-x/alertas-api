import { Inject, Injectable, Logger } from '@nestjs/common';

import { EnviarNotificacionUseCase } from '@/notificaciones/aplicacion/casos-uso/enviar-notificacion.use-case';
import { TipoDestinatario } from '@/notificaciones/dominio/entidades/notificacion.entity';
import { NotificarCambioEstadoAlertaRequest } from '@/notificaciones/dominio/interfaces/notificar-cambio-estado-alerta.interface';
import { VictimaRepositorioPort } from '@/victimas/dominio/puertos/victima.port';
import { VICTIMA_REPOSITORIO } from '@/victimas/dominio/tokens/victima.tokens';

@Injectable()
export class NotificarAtencionAlertaUseCase {
  private readonly logger = new Logger(NotificarAtencionAlertaUseCase.name);

  constructor(
    @Inject(VICTIMA_REPOSITORIO)
    private readonly victimaRepo: VictimaRepositorioPort,
    private readonly enviarNotificacionUseCase: EnviarNotificacionUseCase,
  ) {}

  async ejecutar(request: NotificarCambioEstadoAlertaRequest): Promise<void> {
    try {
      const victima = await this.victimaRepo.obtenerVictimaConDispositivo(request.idVictima);
      const fcmToken = victima?.fcmToken;

      if (fcmToken && fcmToken.trim().length > 0) {
        const datos = {
          tipo: 'alerta_en_atencion',
          idAlerta: request.idAlerta,
          estadoFinal: request.estadoFinal,
        };

        await this.enviarNotificacionUseCase.ejecutar({
          fcmToken,
          titulo: 'Oficial de policía en el lugar',
          cuerpo: `Un oficial de policía se encuentra contigo en el lugar`,
          datos,
          tipoDestinatario: TipoDestinatario.VICTIMA,
        });
      }
    } catch (error) {
      // No fallar por error en notificaciones
      this.logger.warn(`Error al notificar a la víctima sobre atención de alerta ${request.idAlerta}:`, error);
    }
  }
}
